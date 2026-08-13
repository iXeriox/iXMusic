<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$db = Database::connection();

switch (true) {

    // Exchange a one-time Discord OAuth code, then create or update the local user.
    case $action === 'discord' && $method === 'POST':
        $code = (string) requireField('code');
        $discord = $config['discord'];
        if (!$discord['client_id'] || !$discord['client_secret']) {
            Response::error('Discord login has not been configured.', 503);
        }

        $tokenResponse = discordRequest('https://discord.com/api/oauth2/token', [
            'client_id' => $discord['client_id'],
            'client_secret' => $discord['client_secret'],
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => $discord['redirect_uri'],
        ]);
        if (empty($tokenResponse['access_token'])) {
            Response::error('Discord could not verify this login.', 401);
        }

        $profile = discordRequest(
            'https://discord.com/api/users/@me',
            null,
            'Authorization: Bearer ' . $tokenResponse['access_token']
        );
        if (empty($profile['id']) || empty($profile['username'])) {
            Response::error('Discord did not return a usable profile.', 401);
        }

        $discordId = (string) $profile['id'];
        $email = filter_var($profile['email'] ?? '', FILTER_VALIDATE_EMAIL)
            ? $profile['email']
            : "discord-{$discordId}@users.invalid";
        $displayName = trim((string) ($profile['global_name'] ?? '')) ?: $profile['username'];
        $avatar = !empty($profile['avatar'])
            ? "https://cdn.discordapp.com/avatars/{$discordId}/{$profile['avatar']}.png?size=128"
            : null;

        $stmt = $db->prepare('SELECT id FROM users WHERE discord_id = ? OR email = ? LIMIT 1');
        $stmt->execute([$discordId, $email]);
        $existing = $stmt->fetch();
        if ($existing) {
            $db->prepare(
                'UPDATE users SET discord_id = ?, display_name = ?, avatar_url = ?, last_login_at = NOW() WHERE id = ?'
            )->execute([$discordId, $displayName, $avatar, $existing['id']]);
            $userId = (int) $existing['id'];
        } else {
            $username = uniqueDiscordUsername($db, $profile['username'], $discordId);
            $db->prepare(
                'INSERT INTO users (username, email, discord_id, display_name, avatar_url, role, last_login_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())'
            )->execute([$username, $email, $discordId, $displayName, $avatar, 'user']);
            $userId = (int) $db->lastInsertId();
        }

        $user = fetchUser($db, $userId);
        if ($user['status'] !== 'active') {
            Response::error('This account has been suspended. Contact an administrator.', 403);
        }
        Response::success(['user' => $user, 'token' => Auth::issueToken($user)], 'Signed in with Discord.');
        break;

    // ------------------------------------------------------------
    // POST /api/auth.php?action=register
    // ------------------------------------------------------------
    case $action === 'register' && $method === 'POST':
        $username = trim((string) requireField('username'));
        $email    = trim((string) requireField('email'));
        $password = (string) requireField('password');
        $displayName = trim((string) (requestBody()['display_name'] ?? '')) ?: $username;

        if (!preg_match('/^[a-zA-Z0-9_.]{3,32}$/', $username)) {
            Response::error('Username must be 3-32 characters (letters, numbers, "_" or ".").', 422);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Please enter a valid email address.', 422);
        }
        if (strlen($password) < 8) {
            Response::error('Password must be at least 8 characters.', 422);
        }

        $stmt = $db->prepare('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1');
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            Response::error('That username or email is already taken.', 409);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);

        // First-ever account becomes admin automatically; everyone after is a normal user.
        $countStmt = $db->query('SELECT COUNT(*) AS c FROM users');
        $role = ((int) $countStmt->fetch()['c'] === 0) ? 'admin' : 'user';

        $stmt = $db->prepare(
            'INSERT INTO users (username, email, password_hash, display_name, role)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$username, $email, $hash, $displayName, $role]);

        $userId = (int) $db->lastInsertId();
        $user = fetchUser($db, $userId);
        $token = Auth::issueToken($user);

        Response::success(['user' => $user, 'token' => $token], 'Account created.', 201);
        break;

    // ------------------------------------------------------------
    // POST /api/auth.php?action=login
    // ------------------------------------------------------------
    case $action === 'login' && $method === 'POST':
        $identifier = trim((string) requireField('identifier')); // username or email
        $password   = (string) requireField('password');

        $stmt = $db->prepare(
            'SELECT id, username, email, password_hash, display_name, avatar_url, role, status, created_at
             FROM users WHERE username = ? OR email = ? LIMIT 1'
        );
        $stmt->execute([$identifier, $identifier]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            Response::error('Incorrect username/email or password.', 401);
        }
        if ($user['status'] !== 'active') {
            Response::error('This account has been suspended. Contact an administrator.', 403);
        }

        $db->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?')->execute([$user['id']]);
        unset($user['password_hash']);

        $token = Auth::issueToken($user);
        Response::success(['user' => $user, 'token' => $token], 'Welcome back.');
        break;

    // ------------------------------------------------------------
    // POST /api/auth.php?action=logout
    // JWTs are stateless — logout is a client-side token discard.
    // This endpoint exists for symmetry / future token-blacklisting.
    // ------------------------------------------------------------
    case $action === 'logout' && $method === 'POST':
        Response::success([], 'Logged out.');
        break;

    // ------------------------------------------------------------
    // GET /api/auth.php?action=me
    // ------------------------------------------------------------
    case $action === 'me' && $method === 'GET':
        $user = Auth::requireAuth();
        Response::success(['user' => $user]);
        break;

    default:
        Response::error('Unknown auth action.', 404);
}

function fetchUser(PDO $db, int $id): array
{
    $stmt = $db->prepare(
        'SELECT id, username, email, display_name, avatar_url, role, status, created_at
         FROM users WHERE id = ? LIMIT 1'
    );
    $stmt->execute([$id]);
    return $stmt->fetch();
}

function discordRequest(string $url, ?array $form = null, ?string $authorization = null): array
{
    $headers = ['Accept: application/json'];
    if ($authorization) $headers[] = $authorization;
    if ($form !== null) $headers[] = 'Content-Type: application/x-www-form-urlencoded';

    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_POST => $form !== null,
    ]);
    if ($form !== null) curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($form));
    $result = curl_exec($curl);
    curl_close($curl);
    return is_string($result) ? (json_decode($result, true) ?: []) : [];
}

function uniqueDiscordUsername(PDO $db, string $username, string $discordId): string
{
    $base = preg_replace('/[^a-zA-Z0-9_.]/', '', $username) ?: 'listener';
    $base = substr($base, 0, 24);
    if (strlen($base) < 3) $base .= '_user';
    $candidate = $base;
    $attempt = 0;
    do {
        $stmt = $db->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([$candidate]);
        if (!$stmt->fetch()) return $candidate;
        $candidate = substr($base, 0, 24) . '_' . substr($discordId, -5) . ($attempt++ ?: '');
    } while ($attempt < 20);
    return 'discord_' . substr($discordId, -20);
}
