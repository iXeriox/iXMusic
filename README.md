# iXMusic

The current Vue client remains backed by the existing PHP `/api` application and MySQL schema. Authentication, playlists, liked tracks, and play history are persisted by the API; only the JWT and non-sensitive region preference are stored in the browser.

## Configuration

1. Import `backend/db.sql` for a new database, or apply both migrations in
   `backend/migrations/` to an existing one. Migration 002 adds persisted app
   colors and the song moderation list.
2. Configure the backend environment: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, and `DISCORD_REDIRECT_URI`.
3. Copy `.env.example` to `.env` and set the public Discord client ID. `VITE_API_BASE_URL=/api` preserves the current same-origin API path.
4. Register the exact `DISCORD_REDIRECT_URI` in the Discord Developer Portal.

```sh
npm install
npm run dev
```

The Discord client secret must only be configured on the PHP server. The browser receives an authorization code, and `/api/auth.php?action=discord` exchanges it securely before issuing the app's normal JWT.
Discord authorization opens in a focused pop-up after an in-app permission
summary, so the main player does not navigate away or lose its current state.

YouTube discovery and realistic regional recommendations use the server-side
`/api/youtube.php` proxy, so `YOUTUBE_API_KEY` must also be set. Administrators
can change app colors, roles, member access, and remove accounts. Moderators can
suspend members, manage public playlists, and hide or restore YouTube results.
