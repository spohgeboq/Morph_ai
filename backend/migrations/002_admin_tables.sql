-- MorphAI Database Migration v2 — Admin Hub
-- Run: psql -U postgres -d morphi_ai_db -f migrations/002_admin_tables.sql

-- ============================================
-- 1. Системные настройки (Key-Value)
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Тарифные пакеты кредитов
-- ============================================
CREATE TABLE IF NOT EXISTS credit_packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL,
    price_rub INTEGER NOT NULL,
    badge VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Промокоды
-- ============================================
CREATE TABLE IF NOT EXISTS promocodes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(30) NOT NULL, -- 'credits' | 'discount_percent'
    reward_credits INTEGER DEFAULT 0,
    discount_percent INTEGER DEFAULT 0,
    max_uses INTEGER DEFAULT 100,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Активации промокодов
-- ============================================
CREATE TABLE IF NOT EXISTS promocode_activations (
    id SERIAL PRIMARY KEY,
    promocode_id INTEGER REFERENCES promocodes(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(promocode_id, user_id)
);

-- ============================================
-- 5. Транзакции оплат
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    package_id INTEGER REFERENCES credit_packages(id) ON DELETE SET NULL,
    amount_rub INTEGER NOT NULL,
    credits_added INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    payment_method VARCHAR(50) DEFAULT 'card',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. Расширение таблицы пользователей
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spent INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- ============================================
-- 7. Расширение таблицы шаблонов (Тренды)
-- ============================================
ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE;

-- ============================================
-- 8. Индексы
-- ============================================
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_promocodes_code ON promocodes(code);
CREATE INDEX IF NOT EXISTS idx_credit_packages_sort ON credit_packages(sort_order);

-- ============================================
-- 9. Начальные данные (Seed Data)
-- ============================================

-- Системные настройки по умолчанию
INSERT INTO system_settings (key, value) VALUES
('welcome_bonus', '{"credits": 50}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_settings (key, value) VALUES
('maintenance_mode', '{"enabled": false, "message": "Проводятся технические работы по обновлению нейросетей. Сервис скоро возобновит работу!"}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_settings (key, value) VALUES
('bot_welcome', '{"text": "Добро пожаловать в Morphi AI! Создавайте высококлассные фото, кинематографичные видео и захватывающие сказки с помощью передовых нейросетей.", "button_text": "✨ Открыть Morphi Studio"}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_settings (key, value) VALUES
('terms_safety', '{"text": "Сервис Morphi AI строго соблюдает регламенты Telegram Bot API Terms of Service, OpenAI Safety Policy и международные нормы защиты авторских прав."}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_settings (key, value) VALUES
('privacy_policy', '{"text": "Мы не передаем ваши файлы третьим лицам и никогда не используем ваши генерации для обучения публичных моделей."}')
ON CONFLICT (key) DO NOTHING;

-- Пакеты кредитов
INSERT INTO credit_packages (name, credits, price_rub, badge, sort_order) VALUES
('Стартовый', 100, 299, 'Старт', 1),
('Оптимальный', 350, 799, 'Хит', 2),
('Безлимитный PRO', 1250, 1990, 'VIP', 3)
ON CONFLICT DO NOTHING;

-- Промокод для старта
INSERT INTO promocodes (code, type, reward_credits, max_uses, expires_at) VALUES
('MORPHI2026', 'credits', 50, 500, NOW() + INTERVAL '1 year')
ON CONFLICT (code) DO NOTHING;
