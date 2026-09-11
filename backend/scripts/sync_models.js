const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../db');

async function syncDatabaseModels() {
  try {
    console.log('[DB Sync] Начинаем синхронизацию ai_models...');

    // 1. Удаляем несуществующие модели
    const toDelete = ['luma-dream', 'dall-e-3', 'imagen-3', 'wan-image'];
    const deleteRes = await db.query('DELETE FROM ai_models WHERE id = ANY($1)', [toDelete]);
    console.log(`[DB Sync] Удалено устаревших моделей: ${deleteRes.rowCount}`);

    // 2. Список актуальных моделей для вставки / обновления
    const modelsToUpsert = [
      // === ВИДЕО МОДЕЛИ ===
      {
        id: 'kling-hd',
        name: 'Kling AI',
        category: 'video',
        preview_url: 'https://aitoolz.ru/backend/virtual-image/image/640/uploads/tools/bigImage/12/67052c900eb0c.png',
        cost: 12,
        tags: ['1080p', 'Кино'],
        description: 'Плавные кинематографичные видео и анимация персонажей',
        versions: [
          { id: 'kling-ultra', cost: 16, name: 'Kling 3.0' },
          { id: 'kling-std', cost: 12, name: 'Kling 1.5 HD' },
          { id: 'kling-lite', cost: 8, name: 'Kling Fast' }
        ],
        is_active: true,
        sort_order: 1
      },
      {
        id: 'hailuo',
        name: 'Hailuo',
        category: 'video',
        preview_url: 'https://static.rustore.ru/2025/9/17/bb/apk/2063657163/content/ICON/d7a143f0-9bb8-402a-b8dd-21e3dc6e07de.png',
        cost: 14,
        tags: ['Реализм', 'HD'],
        description: 'Генерация сверхреалистичных сцен с естественной физикой людей и природы',
        versions: [
          { id: 'hailuo-ultra', cost: 16, name: 'Hailuo H3' },
          { id: 'hailuo-std', cost: 13, name: 'Hailuo H2' },
          { id: 'hailuo-lite', cost: 9, name: 'Hailuo Lite' }
        ],
        is_active: true,
        sort_order: 2
      },
      {
        id: 'runway-gen4',
        name: 'GenAi',
        category: 'video',
        preview_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        cost: 16,
        tags: ['VFX Кино', 'Slow-Mo'],
        description: 'Голливудские спецэффекты, передовая кинематографичная физика и slow-motion',
        versions: [
          { id: 'runway-ultra', cost: 18, name: 'Runway Gen-4' },
          { id: 'runway-std', cost: 15, name: 'Runway Gen-4 Turbo' },
          { id: 'runway-lite', cost: 10, name: 'Runway Gen-3' }
        ],
        is_active: true,
        sort_order: 3
      },
      {
        id: 'seedance',
        name: 'Seedance',
        category: 'video',
        preview_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
        cost: 12,
        tags: ['6–15 сек', 'Анимация'],
        description: 'Передовая видеомодель с выбором длительности генерации (6, 10 или 15 сек)',
        versions: [
          { id: 'seedance-ultra', cost: 16, name: 'Seedance 2.5' },
          { id: 'seedance-std', cost: 12, name: 'Seedance 2.0' },
          { id: 'seedance-lite', cost: 8, name: 'Seedance Lite' }
        ],
        is_active: true,
        sort_order: 4
      },
      {
        id: 'veo-3-1',
        name: 'Veo 3.1',
        category: 'video',
        preview_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80',
        cost: 16,
        tags: ['Google DeepMind', '4K Кино'],
        description: 'Передовая кинематографичная видеомодель от Google с высокой детализацией',
        versions: [
          { id: 'veo-ultra', cost: 18, name: 'Veo 3.1 Pro' },
          { id: 'veo-std', cost: 16, name: 'Veo 3.1 Standard' },
          { id: 'veo-lite', cost: 12, name: 'Veo 3.1 Fast' }
        ],
        is_active: true,
        sort_order: 5
      },

      // === ФОТО МОДЕЛИ ===
      {
        id: 'flux-pro',
        name: 'Flux',
        category: 'photo',
        preview_url: 'https://media.licdn.com/dms/image/v2/C560BAQHJVy4pH0JAHA/company-logo_200_200/company-logo_200_200/0/1630659031426/buildwithflux_logo?e=2147483647&v=beta&t=Gf9q9Sf-0sXKwviev86-54arwoSjvsW0_Xz40cuEJfE',
        cost: 10,
        tags: ['8K Фото', 'Портрет'],
        description: 'Гиперреалистичные портреты и фото студийного качества',
        versions: [
          { id: 'flux-ultra', cost: 12, name: 'Flux 1.1 Pro' },
          { id: 'flux-std', cost: 8, name: 'Flux Dev' },
          { id: 'flux-lite', cost: 5, name: 'Flux Schnell' }
        ],
        is_active: true,
        sort_order: 6
      },
      {
        id: 'face-swap',
        name: 'Face Swap',
        category: 'photo',
        preview_url: 'https://fastly.mwm-storage.mwmcdn.com/raw_files/268cf4aa-1a7f-4c9e-89e8-a1bd3a8be4fe?height=256&format=webp',
        cost: 10,
        tags: ['Замена лица', '4K'],
        description: 'Высокоточная замена лица на фото и шаблонах с сохранением мимики',
        versions: [
          { id: 'fs-ultra', cost: 14, name: 'Face Swap Ultra 4K' },
          { id: 'fs-std', cost: 10, name: 'Face Swap HD' },
          { id: 'fs-lite', cost: 6, name: 'Face Swap Lite' }
        ],
        is_active: true,
        sort_order: 7
      },
      {
        id: 'gpt-image',
        name: 'GPT Image',
        category: 'photo',
        preview_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        cost: 10,
        tags: ['OpenAI', 'Фотореализм'],
        description: 'Новейшая генерация фотореалистичных изображений студийного качества и сложных композиций',
        versions: [
          { id: 'gpt-image-ultra', cost: 12, name: 'GPT Image 2' },
          { id: 'gpt-image-std', cost: 8, name: 'GPT Image 1.5' },
          { id: 'gpt-image-lite', cost: 5, name: 'GPT Image 1' }
        ],
        is_active: true,
        sort_order: 8
      },
      {
        id: 'nano-banana',
        name: 'Nano Banana',
        category: 'photo',
        preview_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
        cost: 8,
        tags: ['Эксклюзив', 'Digital'],
        description: 'Креативная генерация ярких digital-артов и дизайн-иллюстраций',
        versions: [
          { id: 'nano-ultra', cost: 10, name: 'Nano Banana 2' },
          { id: 'nano-std', cost: 8, name: 'Nano Banana 1 Pro' },
          { id: 'nano-lite', cost: 5, name: 'Nano Banana 1' }
        ],
        is_active: true,
        sort_order: 9
      },
      {
        id: 'seedream-pro',
        name: 'Seedream',
        category: 'photo',
        preview_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
        cost: 6,
        tags: ['3D Аватар', 'Турбо'],
        description: 'Сверхбыстрая генерация концепт-артов и мультяшных аватаров',
        versions: [
          { id: 'sd-ultra', cost: 8, name: 'Seedream 5.0 Pro' },
          { id: 'sd-std', cost: 6, name: 'Seedream 5.0 Lite' },
          { id: 'sd-lite', cost: 4, name: 'Seedream 4.0' }
        ],
        is_active: true,
        sort_order: 10
      },

      // === ТЕКСТОВЫЕ МОДЕЛИ ===
      {
        id: 'gpt-tales',
        name: 'GPT Сказки',
        category: 'text',
        preview_url: 'https://pub-b643d21258fd4dd6a6921be37754e98e.r2.dev/models_covers/1788947010086_06779ef0.jpg',
        cost: 5,
        tags: ['Сказки', 'Повести'],
        description: 'Мудрый сказитель: добрые и поучительные сказки, детские истории и притчи',
        versions: [
          { id: 'gpt-4o-story', cost: 7, name: 'GPT-4o' },
          { id: 'gpt-4o-mini-story', cost: 4, name: 'GPT-4o Mini' },
          { id: 'o3-mini-story', cost: 8, name: 'o3-mini' }
        ],
        is_active: true,
        sort_order: 11
      },
      {
        id: 'claude-mystic',
        name: 'Claude Мистика',
        category: 'text',
        preview_url: 'https://pub-b643d21258fd4dd6a6921be37754e98e.r2.dev/models_covers/1788947195998_f50c84b4.jpg',
        cost: 6,
        tags: ['Мистика', 'Детектив'],
        description: 'Мастер темных тайн: готические триллеры, призрачные замки и расследования',
        versions: [
          { id: 'claude-sonnet-story', cost: 8, name: 'Claude 3.5 Sonnet' },
          { id: 'claude-haiku-story', cost: 5, name: 'Claude 3.5 Haiku' }
        ],
        is_active: true,
        sort_order: 12
      },
      {
        id: 'gemini-scifi',
        name: 'Gemini Sci-Fi',
        category: 'text',
        preview_url: 'https://pub-b643d21258fd4dd6a6921be37754e98e.r2.dev/models_covers/1788947483221_8672f069.jpg',
        cost: 5,
        tags: ['Космос', 'Sci-Fi'],
        description: 'Летописец будущего: киберпанк хроники, далекие галактики и ИИ-цивилизации',
        versions: [
          { id: 'gemini-3-flash', cost: 7, name: 'Gemini 3 Flash' },
          { id: 'gemini-35-lite', cost: 5, name: 'Gemini 3.5 Flash Lite' },
          { id: 'gemini-25-flash', cost: 4, name: 'Gemini 2.5 Flash' }
        ],
        is_active: true,
        sort_order: 13
      },
      {
        id: 'llama-epic',
        name: 'Llama Эпос',
        category: 'text',
        preview_url: 'https://pub-b643d21258fd4dd6a6921be37754e98e.r2.dev/models_covers/1789039690727_011f875b.jpg',
        cost: 4,
        tags: ['Фэнтези', 'Баллады'],
        description: 'Героический бард: рыцарские романы, битвы с драконами и древние мифы',
        versions: [
          { id: 'llama-70b-story', cost: 6, name: 'Llama 3.3 70B' },
          { id: 'llama-8b-story', cost: 3, name: 'Llama 3.1 8B' }
        ],
        is_active: true,
        sort_order: 14
      }
    ];

    for (const m of modelsToUpsert) {
      await db.query(`
        INSERT INTO ai_models (id, name, category, preview_url, cost, tags, description, versions, is_active, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          preview_url = CASE 
            WHEN ai_models.preview_url LIKE 'https://pub-%.r2.dev/%' THEN ai_models.preview_url 
            ELSE EXCLUDED.preview_url 
          END,
          cost = EXCLUDED.cost,
          tags = EXCLUDED.tags,
          description = EXCLUDED.description,
          versions = EXCLUDED.versions,
          is_active = EXCLUDED.is_active,
          sort_order = EXCLUDED.sort_order,
          updated_at = NOW()
      `, [
        m.id,
        m.name,
        m.category,
        m.preview_url,
        m.cost,
        JSON.stringify(m.tags),
        m.description,
        JSON.stringify(m.versions),
        m.is_active,
        m.sort_order
      ]);
      console.log(`[DB Sync] ✓ Синхронизирована модель: ${m.id} (${m.name})`);
    }

    console.log('[DB Sync] Все 14 моделей успешно синхронизированы в PostgreSQL!');
    process.exit(0);
  } catch (err) {
    console.error('[DB Sync] Ошибка синхронизации:', err);
    process.exit(1);
  }
}

syncDatabaseModels();
