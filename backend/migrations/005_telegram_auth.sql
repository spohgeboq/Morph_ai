-- MorphAI Migration 005 — Telegram Auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_date TIMESTAMPTZ DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_users_username ON users(LOWER(username));
