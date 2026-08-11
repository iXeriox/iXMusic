<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$db = Database::connection();

switch (true) {

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
