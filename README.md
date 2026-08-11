# Wavelength — Spotify-style music player (Vue 3 + PHP REST API)

Music is played by loading YouTube videos through the official YouTube
IFrame Player API (audio track of the embedded player) — nothing is
downloaded, ripped, or re-hosted, so it stays within YouTube's terms of
service.

```
spotify-clone/
├── backend/     PHP REST API (JWT auth, roles/permissions, playlists, YouTube search proxy)
└── frontend/    Vue 3 + Pinia + Vue Router single-page app (Vite)
```

## 1. Backend setup (PHP)

**Requirements:** PHP 8.0+, MySQL/MariaDB, the `curl` and `pdo_mysql` extensions.

1. Create the database:
   ```bash
   mysql -u root -p < backend/db.sql
   ```
   This creates the `music_app` database and seeds one administrator:
   - username: `admin`
   - password: `ChangeMe123!`

   **Change this password immediately after your first login.**

2. Configure environment variables (or edit `backend/config.php` directly):
   ```bash
   export DB_HOST=127.0.0.1
   export DB_NAME=music_app
   export DB_USER=root
   export DB_PASS=yourpassword
   export JWT_SECRET=$(php -r "echo bin2hex(random_bytes(32));")
   export YOUTUBE_API_KEY=your_youtube_data_api_v3_key
   ```
   Get a YouTube Data API v3 key from the
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   (enable "YouTube Data API v3" on the project first). The key stays
   server-side — the frontend never sees it, it only calls `/api/youtube.php`.

3. Add your frontend's dev URL to `cors_allowed_origins` in `config.php`
   (`http://localhost:5173` is already included for the default Vite port).

4. Serve the backend. For local development, PHP's built-in server works:
   ```bash
   cd backend
   php -S localhost:8000
   ```
   In production, point an Apache/Nginx vhost's document root at `backend/`
   (the included `.htaccess` blocks direct access to `config.php` and
   `includes/`).

### API reference

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth.php?action=register` | POST | — | Create an account. First account ever created becomes `admin`. |
| `/api/auth.php?action=login` | POST | — | `{ identifier, password }` → `{ user, token }` |
| `/api/auth.php?action=me` | GET | ✔ | Current user |
| `/api/auth.php?action=logout` | POST | ✔ | Stateless — client just discards the token |
| `/api/playlists.php` | GET/POST | ✔ | List / create playlists |
| `/api/playlists.php?id=1` | GET/PUT/DELETE | ✔ | View / update / delete a playlist |
| `/api/playlists.php?id=1&action=add_track` | POST | ✔ | Add a YouTube track to a playlist |
| `/api/playlists.php?id=1&action=remove_track&track_id=9` | DELETE | ✔ | Remove a track |
| `/api/playlists.php?id=1&action=reorder` | PUT | ✔ | `{ track_ids: [...] }` new order |
| `/api/tracks.php?action=liked` | GET | ✔ | Liked Songs |
| `/api/tracks.php?action=like` / `unlike` | POST/DELETE | ✔ | Like/unlike a track |
| `/api/tracks.php?action=history` | GET | ✔ | Recently played |
| `/api/youtube.php?q=search+term` | GET | ✔ | Server-side YouTube search proxy |
| `/api/users.php` | GET | moderator+ | List all members |
| `/api/users.php?id=5` | PUT | admin | Change `role` and/or `status` |
| `/api/users.php?id=5` | DELETE | admin | Remove a member |

All authenticated requests send `Authorization: Bearer <token>`.
Responses are always `{ ok, message, data }` on success or
`{ ok: false, message, errors }` on failure.

### Permission levels

| Role | Can do |
|---|---|
| `user` | Manage their own playlists and library |
| `moderator` | Everything a user can, plus edit/delete **any** playlist, view the member list |
| `admin` | Everything above, plus change roles, suspend/reactivate/delete accounts |

## 2. Frontend setup (Vue 3)

**Requirements:** Node 18+.

```bash
cd frontend
cp .env.example .env       # point VITE_API_BASE_URL at your backend's /api path
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`). Register an
account (or log in as the seeded admin) to get started.

### Frontend architecture

- **Pinia stores** (`src/stores/`) hold all app state:
  - `auth` — session, current user, role helpers (`isModerator`, `isAdmin`)
  - `player` — playback queue, shuffle/repeat, and the YouTube IFrame Player
    instance (mounted once in `YouTubePlayer.vue`, hidden off-screen)
  - `playlists`, `library` (liked songs / history), `search` (YouTube search),
    `admin` (member management), `toast` (notifications)
- **`src/router/index.js`** — route guards redirect unauthenticated users to
  `/login` and gate `/admin` behind `requiresModerator`.
- **`src/services/api.js`** — a single axios instance that attaches the JWT
  and normalizes the backend's response envelope.

### Build for production

```bash
npm run build
```
Outputs static files to `frontend/dist/` — deploy them behind any static
host or the same web server as the backend.

## Notes & next steps

- JWTs are stateless with a 7-day expiry (`jwt_ttl` in `config.php`); there's
  no server-side revocation list, so "logout" simply discards the token
  client-side. Add a token blacklist table if you need hard revocation.
- The first account ever registered is automatically promoted to `admin` so
  you always have at least one administrator; every account after that is a
  normal `user`. Promote further admins/moderators from the Admin screen.
- Playback relies on the visitor's browser loading the YouTube IFrame API —
  it requires an internet connection and is subject to YouTube's own
  regional/embedding restrictions on individual videos.
