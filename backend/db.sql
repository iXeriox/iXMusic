-- ============================================================
--  Spotify-style Music Player — Database Schema
--  Engine: MySQL 5.7+ / MariaDB 10.2+
-- ============================================================

CREATE DATABASE IF NOT EXISTS music_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE music_app;

-- ------------------------------------------------------------
-- Users & permission levels
--   role:   user      -> normal member, manages own playlists
--           moderator -> can manage/feature any public playlist
--           admin     -> full member control (roles, suspend, delete)
--   status: active | suspended  (admins can suspend accounts)
-- ------------------------------------------------------------
CREATE TABLE users (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(32)  NOT NULL UNIQUE,
    email           VARCHAR(120) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) DEFAULT NULL,
    discord_id      VARCHAR(32) DEFAULT NULL UNIQUE,
    display_name    VARCHAR(80)  NOT NULL,
    avatar_url      VARCHAR(500) DEFAULT NULL,
    role            ENUM('user','moderator','admin') NOT NULL DEFAULT 'user',
    status          ENUM('active','suspended') NOT NULL DEFAULT 'active',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at   DATETIME DEFAULT NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Global track cache (a YouTube video only needs to be resolved once)
-- ------------------------------------------------------------
CREATE TABLE tracks (
    id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    youtube_video_id   VARCHAR(20) NOT NULL UNIQUE,
    title              VARCHAR(255) NOT NULL,
    artist             VARCHAR(255) DEFAULT NULL,
    thumbnail_url      VARCHAR(500) DEFAULT NULL,
    duration_seconds   INT UNSIGNED DEFAULT NULL,
    added_by           INT UNSIGNED DEFAULT NULL,
    created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE blocked_videos (
    youtube_video_id VARCHAR(20) PRIMARY KEY,
    reason VARCHAR(255) NOT NULL DEFAULT 'This track is unavailable on iXMusic.',
    blocked_by INT UNSIGNED DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blocked_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE app_settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    setting_value VARCHAR(500) NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
INSERT INTO app_settings (setting_key, setting_value) VALUES
('accent_color', '#ff4d8d'), ('accent_secondary', '#7c5cff');

-- ------------------------------------------------------------
-- Playlists
-- ------------------------------------------------------------
CREATE TABLE playlists (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    name            VARCHAR(120) NOT NULL,
    description     VARCHAR(500) DEFAULT NULL,
    cover_image     VARCHAR(500) DEFAULT NULL,
    is_public       TINYINT(1) NOT NULL DEFAULT 0,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Playlist <-> Track junction (ordered)
-- ------------------------------------------------------------
CREATE TABLE playlist_tracks (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    playlist_id  INT UNSIGNED NOT NULL,
    track_id     INT UNSIGNED NOT NULL,
    position     INT UNSIGNED NOT NULL DEFAULT 0,
    added_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_playlist_track (playlist_id, track_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Liked / saved tracks ("Your Library")
-- ------------------------------------------------------------
CREATE TABLE liked_tracks (
    user_id     INT UNSIGNED NOT NULL,
    track_id    INT UNSIGNED NOT NULL,
    liked_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, track_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Recently played (simple listening history)
-- ------------------------------------------------------------
CREATE TABLE play_history (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    track_id    INT UNSIGNED NOT NULL,
    played_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Seed an initial administrator.
-- Username: admin   Password: ChangeMe123!
-- (hash generated with PHP password_hash — change this password immediately after first login)
-- ------------------------------------------------------------
INSERT INTO users (username, email, password_hash, display_name, role, status)
VALUES (
    'admin',
    'admin@example.com',
    '$2b$10$fFaDGBkz/wDr7rgl7ZzQVe96NR8am4otA7aXym9su9qoBJpUtyH8e', -- ChangeMe123!
    'Administrator',
    'admin',
    'active'
);
