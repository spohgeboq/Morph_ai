-- MorphAI Database Schema v1
-- Run: psql -U postgres -d morphi_ai_db -f migrations/001_init.sql

-- ============================================
-- Таблица пользователей
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    telegram_id     BIGINT UNIQUE NOT NULL,
    username        VARCHAR(255),
    first_name      VARCHAR(255),
    balance         INTEGER DEFAULT 50 NOT NULL,
    face_photo_url  TEXT,
    language        VARCHAR(5) DEFAULT 'ru',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Таблица генераций (единая для text/photo/video/faceswap)
-- ============================================
CREATE TABLE IF NOT EXISTS generations (
    id              SERIAL PRIMARY KEY,
    task_id         VARCHAR(255) UNIQUE NOT NULL,
    user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
    model_name      VARCHAR(100) NOT NULL,
    provider        VARCHAR(50) NOT NULL,
    task_type       VARCHAR(30) NOT NULL,
    prompt          TEXT,
    params          JSONB DEFAULT '{}',
    status          VARCHAR(20) DEFAULT 'pending',
    result_url      TEXT,
    result_text     TEXT,
    credits_charged INTEGER DEFAULT 0,
    error_message   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

-- ============================================
-- Таблица шаблонов (для «Повторить» / Face Swap / админских пресетов)
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    category        VARCHAR(30) NOT NULL,
    video_url       TEXT,
    thumb_url       TEXT,
    prompt          TEXT,
    model_name      VARCHAR(100),
    default_params  JSONB DEFAULT '{}',
    cost            INTEGER DEFAULT 10,
    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Индексы
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_task_id ON generations(task_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
