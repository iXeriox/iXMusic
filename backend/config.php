<?php
/**
 * Application configuration.
 * Copy this file's values from environment variables in production —
 * never commit real secrets to version control.
 */

return [
    'db' => [
        'host'    => getenv('DB_HOST') ?: '127.0.0.1',
        'name'    => getenv('DB_NAME') ?: 'music_app',
        'user'    => getenv('DB_USER') ?: 'root',
        'pass'    => getenv('DB_PASS') ?: '',
        'charset' => 'utf8mb4',
    ],

    // Used to sign/verify JWT access tokens. Generate a long random string, e.g.:
    //   php -r "echo bin2hex(random_bytes(32));"
    'jwt_secret' => getenv('JWT_SECRET') ?: 'CHANGE_THIS_TO_A_LONG_RANDOM_SECRET',
    'jwt_ttl'    => 60 * 60 * 24 * 7, // 7 days, in seconds

    // YouTube Data API v3 key, used only for server-side search proxying
    // (keeps the key off the client). https://console.cloud.google.com/apis/credentials
    'youtube_api_key' => getenv('YOUTUBE_API_KEY') ?: '',

    // Discord OAuth2 credentials. The redirect URI must exactly match the value
    // configured in the Discord developer portal and in the frontend environment.
    'discord' => [
        'client_id'     => getenv('DISCORD_CLIENT_ID') ?: '',
        'client_secret' => getenv('DISCORD_CLIENT_SECRET') ?: '',
        'redirect_uri'  => getenv('DISCORD_REDIRECT_URI') ?: 'http://localhost:5173/auth/discord/callback',
    ],

    // Origins allowed to call this API (your frontend dev server / production domain)
    'cors_allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],
];
