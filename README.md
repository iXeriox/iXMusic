# iXMusic

The current Vue client remains backed by the existing PHP `/api` application and MySQL schema. Authentication, playlists, liked tracks, and play history are persisted by the API; only the JWT and non-sensitive region preference are stored in the browser.

## Configuration

1. Import `backend/db.sql` for a new database, or apply `backend/migrations/001_discord_oauth.sql` to an existing one.
2. Configure the backend environment: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, and `DISCORD_REDIRECT_URI`.
3. Copy `.env.example` to `.env` and set the public Discord client ID. `VITE_API_BASE_URL=/api` preserves the current same-origin API path.
4. Register the exact `DISCORD_REDIRECT_URI` in the Discord Developer Portal.

```sh
npm install
npm run dev
```

The Discord client secret must only be configured on the PHP server. The browser receives an authorization code, and `/api/auth.php?action=discord` exchanges it securely before issuing the app's normal JWT.
