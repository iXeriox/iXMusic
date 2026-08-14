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
INSERT IGNORE INTO app_settings (setting_key, setting_value) VALUES
('accent_color', '#ff4d8d'), ('accent_secondary', '#7c5cff');
