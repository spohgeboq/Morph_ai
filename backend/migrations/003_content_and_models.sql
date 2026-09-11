-- MorphAI Database Migration v3 — Stories, AI Models & Photoshoot Configuration
-- Run: node scripts/runMigration.js migrations/003_content_and_models.sql

-- ============================================
-- 1. Таблица Stories (кружочки на Главной)
-- ============================================
CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    tag VARCHAR(100),
    image_url TEXT NOT NULL,
    video_url TEXT,
    model_name VARCHAR(100),
    prompt TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stories_active_sort ON stories(is_active, sort_order);

-- ============================================
-- 2. Таблица AI Models (каталог моделей и цены)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_models (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL, -- 'video' | 'photo' | 'text'
    preview_url TEXT NOT NULL,
    cost INTEGER NOT NULL,
    tags JSONB DEFAULT '[]',
    description TEXT,
    versions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_models_category ON ai_models(category);

-- ============================================
-- 3. Начальные данные для Stories
-- ============================================
INSERT INTO stories (title, tag, image_url, video_url, model_name, prompt, is_active, sort_order)
VALUES
(
    'Kling 1.5',
    'Видео-морфинг',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop',
    'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robot-turning-its-head-41477-large.mp4',
    'Kling 1.5 AI',
    'Киберпанк девушка с неоновыми глазами под дождем Токио',
    TRUE,
    1
),
(
    'Old Money',
    '35mm Film',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=300&auto=format&fit=crop',
    'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-vintage-camera-42845-large.mp4',
    'Flux 1.1 Pro',
    'Эстетика старых денег, винтажная пленка 35mm, элегантный стиль',
    TRUE,
    2
),
(
    'Сказка',
    'Книга ИИ',
    'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=300&auto=format&fit=crop',
    'https://assets.mixkit.co/videos/preview/mixkit-fireflies-glowing-in-the-forest-at-night-42805-large.mp4',
    'Claude 3.5 + Flux',
    'Волшебный лес светлячков и тайны древнего королевства',
    TRUE,
    3
),
(
    'Неон 2077',
    'Sci-Fi',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop',
    'https://assets.mixkit.co/videos/preview/mixkit-flying-through-neon-lit-cubes-in-cyberspace-42777-large.mp4',
    'Kling 1.5 HD',
    'Полет сквозь киберпространство и неоновые горизонты',
    TRUE,
    4
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. Начальные данные для AI Models (14 моделей)
-- ============================================
INSERT INTO ai_models (id, name, category, preview_url, cost, tags, description, versions, is_active, sort_order)
VALUES
-- Видео модели
(
    'kling-hd',
    'Kling AI',
    'video',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    12,
    '["1080p", "Кино"]'::jsonb,
    'Плавные кинематографичные видео и анимация персонажей',
    '[{"id":"kling-ultra","name":"Kling 3.0","cost":16},{"id":"kling-std","name":"Kling 1.5 HD","cost":12},{"id":"kling-lite","name":"Kling Fast","cost":8}]'::jsonb,
    TRUE,
    1
),
(
    'hailuo',
    'Hailuo',
    'video',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    14,
    '["Реализм", "HD"]'::jsonb,
    'Генерация сверхреалистичных сцен с естественной физикой людей и природы',
    '[{"id":"hailuo-ultra","name":"Hailuo H3","cost":16},{"id":"hailuo-std","name":"Hailuo H2","cost":13},{"id":"hailuo-lite","name":"Hailuo Lite","cost":9}]'::jsonb,
    TRUE,
    2
),
(
    'luma-dream',
    'Luma Dream',
    'video',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    10,
    '["Оживление", "3D"]'::jsonb,
    'Превращает статичные фотографии в реалистичные видеоролики',
    '[{"id":"luma-ultra","name":"Dream 1.5 HD","cost":14},{"id":"luma-std","name":"Dream 1.0","cost":10},{"id":"luma-lite","name":"Dream Turbo","cost":7}]'::jsonb,
    TRUE,
    3
),
(
    'runway-gen4',
    'Runway',
    'video',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    16,
    '["VFX Кино", "Slow-Mo"]'::jsonb,
    'Голливудские спецэффекты и кинематографичное slow-motion',
    '[{"id":"runway-ultra","name":"Runway Gen-4","cost":18},{"id":"runway-std","name":"Runway Gen-4 Turbo","cost":15},{"id":"runway-lite","name":"Runway Gen-3","cost":10}]'::jsonb,
    TRUE,
    4
),
(
    'seedance',
    'Seedance',
    'video',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    12,
    '["6–15 сек", "Анимация"]'::jsonb,
    'Передовая видеомодель с выбором длительности генерации (6, 10 или 15 сек)',
    '[{"id":"seedance-ultra","name":"Seedance 2.5","cost":16},{"id":"seedance-std","name":"Seedance 2.0","cost":12},{"id":"seedance-lite","name":"Seedance Lite","cost":8}]'::jsonb,
    TRUE,
    5
),
-- Фото модели
(
    'flux-pro',
    'Flux',
    'photo',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    10,
    '["8K Фото", "Портрет"]'::jsonb,
    'Гиперреалистичные портреты и фото студийного качества',
    '[{"id":"flux-ultra","name":"Flux 1.1 Pro","cost":12},{"id":"flux-std","name":"Flux Dev","cost":8},{"id":"flux-lite","name":"Flux Schnell","cost":5}]'::jsonb,
    TRUE,
    6
),
(
    'face-swap',
    'Face Swap',
    'photo',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    10,
    '["Замена лица", "4K"]'::jsonb,
    'Высокоточная замена лица на фото и шаблонах с сохранением мимики',
    '[{"id":"fs-ultra","name":"Face Swap Ultra 4K","cost":14},{"id":"fs-std","name":"Face Swap HD","cost":10},{"id":"fs-lite","name":"Face Swap Lite","cost":6}]'::jsonb,
    TRUE,
    7
),
(
    'dall-e-3',
    'DALL-E 3',
    'photo',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    8,
    '["Иллюстрации", "Арт"]'::jsonb,
    'Точное следование сложным подсказкам и яркая художественная визуализация',
    '[{"id":"dall-e-ultra","name":"DALL-E 3 HD","cost":10},{"id":"dall-e-std","name":"DALL-E 3","cost":8},{"id":"dall-e-lite","name":"DALL-E 3 Fast","cost":5}]'::jsonb,
    TRUE,
    8
),
(
    'imagen-3',
    'Imagen 3',
    'photo',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    8,
    '["Google", "Реализм"]'::jsonb,
    'Передовая модель генерации изображений от Google с глубокой детализацией',
    '[{"id":"imagen-ultra","name":"Imagen 3 Ultra","cost":10},{"id":"imagen-std","name":"Imagen 3","cost":8},{"id":"imagen-lite","name":"Imagen 3 Fast","cost":5}]'::jsonb,
    TRUE,
    9
),
(
    'wan-image',
    'Wan Image',
    'photo',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    6,
    '["Концепт", "Фэнтези"]'::jsonb,
    'Создание атмосферных пейзажей, фэнтези-артов и дизайн-иллюстраций',
    '[{"id":"wan-ultra","name":"Wan 2.1 Pro","cost":8},{"id":"wan-std","name":"Wan 2.1","cost":6},{"id":"wan-lite","name":"Wan Turbo","cost":4}]'::jsonb,
    TRUE,
    10
),
-- Текстовые модели (Сказки и Истории)
(
    'gpt-tales',
    'GPT Сказки',
    'text',
    'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=600&auto=format&fit=crop&q=80',
    5,
    '["Сказки", "Повести"]'::jsonb,
    'Мудрый сказитель: добрые и поучительные сказки, детские истории и притчи',
    '[{"id":"gpt-4o-story","name":"GPT-4o","cost":7},{"id":"gpt-4o-mini-story","name":"GPT-4o Mini","cost":4},{"id":"o3-mini-story","name":"o3-mini","cost":8}]'::jsonb,
    TRUE,
    11
),
(
    'claude-mystic',
    'Claude Мистика',
    'text',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    6,
    '["Мистика", "Детектив"]'::jsonb,
    'Мастер темных тайн: готические триллеры, призрачные замки и расследования',
    '[{"id":"claude-sonnet-story","name":"Claude 3.5 Sonnet","cost":8},{"id":"claude-haiku-story","name":"Claude 3.5 Haiku","cost":5}]'::jsonb,
    TRUE,
    12
),
(
    'gemini-scifi',
    'Gemini Sci-Fi',
    'text',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    5,
    '["Космос", "Sci-Fi"]'::jsonb,
    'Летописец будущего: киберпанк хроники, далекие галактики и ИИ-цивилизации',
    '[{"id":"gemini-3-flash","name":"Gemini 3 Flash","cost":7},{"id":"gemini-35-lite","name":"Gemini 3.5 Flash Lite","cost":5},{"id":"gemini-25-flash","name":"Gemini 2.5 Flash","cost":4}]'::jsonb,
    TRUE,
    13
),
(
    'llama-epic',
    'Llama Эпос',
    'text',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    4,
    '["Фэнтези", "Баллады"]'::jsonb,
    'Героический бард: рыцарские романы, битвы с драконами и древние мифы',
    '[{"id":"llama-70b-story","name":"Llama 3.3 70B","cost":6},{"id":"llama-8b-story","name":"Llama 3.1 8B","cost":3}]'::jsonb,
    TRUE,
    14
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. Начальные данные для Студийного Фотосета
-- ============================================
INSERT INTO system_settings (key, value)
VALUES (
    'photoshoot_config',
    '{
        "cost": 10,
        "badge": "Editorial 4K",
        "count_badge": "+5",
        "title": "Профессиональный студийный сет",
        "desc": "5 журнальных кадров премиум-класса с идеальным светом и живыми эмоциями",
        "photos": [
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
        ]
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
