<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed.', 405);
}

Auth::requireAuth();

$query = trim((string) ($_GET['q'] ?? ''));
if ($query === '') {
    Response::error('A search query "q" is required.', 422);
}

if (empty($config['youtube_api_key'])) {
    Response::error(
        'The server is not configured with a YouTube Data API key. Set YOUTUBE_API_KEY in your environment.',
        500
    );
}

$params = http_build_query([
    'part'       => 'snippet',
    'type'       => 'video',
    'videoCategoryId' => 10, // Music
    'maxResults' => 15,
    'q'          => $query,
    'key'        => $config['youtube_api_key'],
]);

$ch = curl_init("https://www.googleapis.com/youtube/v3/search?$params");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 8,
]);
$raw = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($raw === false || $httpCode >= 400) {
    Response::error('YouTube search failed. Please try again.', 502);
}

$json = json_decode($raw, true);
$results = [];

foreach (($json['items'] ?? []) as $item) {
    if (empty($item['id']['videoId'])) {
        continue;
    }
    $results[] = [
        'youtube_video_id' => $item['id']['videoId'],
        'title'            => $item['snippet']['title'] ?? 'Untitled',
        'artist'           => $item['snippet']['channelTitle'] ?? '',
        'thumbnail_url'    => $item['snippet']['thumbnails']['high']['url']
            ?? $item['snippet']['thumbnails']['default']['url']
            ?? '',
        'published_at'     => $item['snippet']['publishedAt'] ?? null,
    ];
}

Response::success(['results' => $results]);
