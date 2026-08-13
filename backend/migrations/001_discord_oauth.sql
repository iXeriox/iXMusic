-- Apply this once when upgrading an existing iXMusic database.
ALTER TABLE users
    MODIFY password_hash VARCHAR(255) NULL,
    ADD COLUMN discord_id VARCHAR(32) NULL UNIQUE AFTER password_hash;
