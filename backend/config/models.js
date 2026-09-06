/**
 * MorphAI — Реестр всех ИИ-моделей с подмоделями (High / Medium / Lite) и UI-метаданными.
 *
 * Порядок категорий:
 *  1. 🎬 ВИДЕО МОДЕЛИ (первое место)
 *  2. 📸 ФОТО МОДЕЛИ & FACE SWAP (второе место)
 *  3. ✍️ ТЕКСТОВЫЕ МОДЕЛИ (последнее место)
 *
 * Все модели предоставляют 3 уровня мощности (подмодели):
 *  - 🔥 Максимум (Ultra / Pro / Max)
 *  - ⚡ Стандарт (Standard / Plus / Dev)
 *  - 💨 Лайт (Lite / Fast / Schnell / Flash)
 *
 * Правила длительности видео:
 *  - Все видео-модели кроме Seedance → фиксированно 6 сек (allowDurationChoice: false)
 *  - Seedance → пользователь выбирает: 6 / 10 / 15 сек (allowDurationChoice: true)
 */

const AI_MODELS = {
  // =============================================
  // 1. ВИДЕО МОДЕЛИ (PiAPI / Runway) — ПЕРВОЕ МЕСТО
  // =============================================
  'kling-hd': {
    id: 'kling-hd',
    name: 'Kling AI',
    category: 'video',
    provider: 'piapi',
    cost: 12,
    preview: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    tags: ['Видео 1080p', 'Кино-физика'],
    desc: 'Плавные кинематографичные видео и реалистичная физика движения',
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'kling-ultra', name: 'Kling 3.0 (Ultra)', slug: 'kling-video/v3/pro', cost: 16, tier: 'high', tierLabel: 'Максимум' },
      { id: 'kling-std', name: 'Kling 1.5 HD (Standard)', slug: 'kling-video/v1.5/pro', cost: 12, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'kling-lite', name: 'Kling Fast (Lite)', slug: 'kling-video/v1.5/fast', cost: 8, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Неоновый киберпанк спорткар мчит по ночному Токио под дождем',
      'Плавный пролет камеры над океанскими скалами на закате'
    ]
  },
  'hailuo': {
    id: 'hailuo',
    name: 'Hailuo (MiniMax)',
    category: 'video',
    provider: 'piapi',
    cost: 14,
    preview: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    tags: ['Реалистичное движение', 'HD'],
    desc: 'Генерация сверхреалистичных сцен с естественной пластикой людей и природы',
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'hailuo-ultra', name: 'Hailuo H3 (Ultra)', slug: 'minimax-hailuo-h3', cost: 16, tier: 'high', tierLabel: 'Максимум' },
      { id: 'hailuo-std', name: 'Hailuo H2 (Standard)', slug: 'minimax-hailuo', cost: 13, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'hailuo-lite', name: 'Hailuo Lite (Fast)', slug: 'minimax-hailuo-lite', cost: 9, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Девушка улыбается и поправляет волосы на ветру в цветущем поле',
      'Золотой орел парит над горным хребтом в лучах утреннего солнца'
    ]
  },
  'luma-dream': {
    id: 'luma-dream',
    name: 'Luma Dream Machine',
    category: 'video',
    provider: 'piapi',
    cost: 10,
    preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    tags: ['Оживление фото', 'Динамика'],
    desc: 'Превращает статичные кадры в динамичные видеоролики с плавными переходами',
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'luma-ultra', name: 'Dream 1.5 HD (Ultra)', slug: 'luma-1-5', cost: 14, tier: 'high', tierLabel: 'Максимум' },
      { id: 'luma-std', name: 'Dream 1.0 (Standard)', slug: 'luma-1-0', cost: 10, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'luma-lite', name: 'Dream Turbo (Lite)', slug: 'luma-turbo', cost: 7, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Оживление портрета: легкая улыбка и колыхание волос от ветра',
      'Оживление фото пейзажа с движущимися облаками и рекой'
    ]
  },
  'runway-gen4': {
    id: 'runway-gen4',
    name: 'Runway',
    category: 'video',
    provider: 'runway',
    cost: 16,
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['VFX Кино', 'Slow-Mo'],
    desc: 'Голливудские спецэффекты, передовая кинематографичная физика и slow-motion',
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'runway-ultra', name: 'Runway Gen-4 (Ultra)', slug: 'gen4_turbo', cost: 18, tier: 'high', tierLabel: 'Максимум' },
      { id: 'runway-std', name: 'Runway Gen-4 Turbo (Standard)', slug: 'gen4_turbo', cost: 15, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'runway-lite', name: 'Runway Gen-3 (Lite)', slug: 'gen4_turbo', cost: 10, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Замедленный взрыв неоновых кристаллов в темноте, осколки света',
      'Кинематографичная сцена погони в футуристичном мегаполисе'
    ]
  },
  'seedance': {
    id: 'seedance',
    name: 'Seedance',
    category: 'video',
    provider: 'piapi',
    cost: 12,
    preview: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    tags: ['Гибкое время', 'Анимация'],
    desc: 'Видеомодель с гибким интерактивным выбором длительности (6, 10 или 15 сек)',
    defaultDuration: 6,
    allowDurationChoice: true,
    durationOptions: [6, 10, 15],
    versions: [
      { id: 'seedance-ultra', name: 'Seedance 2.5 (Ultra)', slug: 'seedance-2.5', cost: 16, tier: 'high', tierLabel: 'Максимум' },
      { id: 'seedance-std', name: 'Seedance 2.0 (Standard)', slug: 'seedance', cost: 12, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'seedance-lite', name: 'Seedance Lite (Fast)', slug: 'seedance-lite', cost: 8, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Красочный танец в неоновом дожде под электронную музыку',
      'Анимированная сцена превращения бабочки в созвездие звезд'
    ]
  },

  // =============================================
  // 2. ФОТО МОДЕЛИ & FACE SWAP — ВТОРОЕ МЕСТО
  // =============================================
  'flux-pro': {
    id: 'flux-pro',
    name: 'Flux',
    category: 'photo',
    provider: 'piapi',
    cost: 10,
    preview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    tags: ['Фото 8K', 'Портреты'],
    desc: 'Гиперреалистичные портреты и фото студийного качества',
    versions: [
      { id: 'flux-ultra', name: 'Flux 1.1 Pro (Ultra)', slug: 'flux-dev', cost: 12, tier: 'high', tierLabel: 'Максимум' },
      { id: 'flux-std', name: 'Flux Dev (Standard)', slug: 'flux-dev', cost: 8, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'flux-lite', name: 'Flux Schnell (Lite)', slug: 'flux-schnell', cost: 5, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['1:1', '9:16', '16:9', '4:5'],
    samplePrompts: [
      'Девушка в лучах заката на крыше в Париже, 35mm',
      'Эстетичный студийный портрет с мягким светом'
    ]
  },
  'face-swap': {
    id: 'face-swap',
    name: 'Face Swap',
    category: 'photo',
    provider: 'piapi',
    cost: 10,
    preview: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    tags: ['Замена лица', 'Реализм'],
    desc: 'Высокоточная замена лица на фото и шаблонах с сохранением мимики',
    versions: [
      { id: 'fs-ultra', name: 'Face Swap Ultra 4K', slug: 'face-swap', cost: 14, tier: 'high', tierLabel: 'Максимум' },
      { id: 'fs-std', name: 'Face Swap HD Standard', slug: 'face-swap', cost: 10, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'fs-lite', name: 'Face Swap Fast Lite', slug: 'face-swap', cost: 6, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['1:1', '9:16', '16:9'],
    samplePrompts: [
      'Замена лица на портрете в вечернем стиле',
      'Создание фотореалистичного аватара'
    ]
  },
  'dall-e-3': {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    category: 'photo',
    provider: 'piapi',
    cost: 8,
    preview: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    tags: ['Иллюстрации', 'Сюрреализм'],
    desc: 'Точное следование сложным подсказкам и яркая художественная визуализация',
    versions: [
      { id: 'dall-e-ultra', name: 'DALL-E 3 HD (Ultra)', slug: 'flux-dev', cost: 10, tier: 'high', tierLabel: 'Максимум' },
      { id: 'dall-e-std', name: 'DALL-E 3 (Standard)', slug: 'flux-dev', cost: 8, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'dall-e-lite', name: 'DALL-E 3 Fast (Lite)', slug: 'flux-schnell', cost: 5, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['1:1', '16:9', '9:16'],
    samplePrompts: [
      'Абстрактная картина маслом в стиле кубизма, яркие контрасты',
      'Футуристический город в стеклянном шаре среди пустыни'
    ]
  },
  'imagen-3': {
    id: 'imagen-3',
    name: 'Imagen 3',
    category: 'photo',
    provider: 'piapi',
    cost: 8,
    preview: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    tags: ['Google Фото', 'Фотореализм'],
    desc: 'Передовая модель генерации изображений от Google с глубокой детализацией',
    versions: [
      { id: 'imagen-ultra', name: 'Imagen 3 (Ultra)', slug: 'flux-dev', cost: 10, tier: 'high', tierLabel: 'Максимум' },
      { id: 'imagen-std', name: 'Imagen 3 (Standard)', slug: 'flux-dev', cost: 8, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'imagen-lite', name: 'Imagen 3 Fast (Lite)', slug: 'flux-schnell', cost: 5, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['1:1', '16:9', '9:16', '4:5'],
    samplePrompts: [
      'Кинематографичный кадр из исторического фильма при естественном свете',
      'Макросъемка капли росы на лепестке экзотического цветка'
    ]
  },
  'wan-image': {
    id: 'wan-image',
    name: 'Wan Image',
    category: 'photo',
    provider: 'piapi',
    cost: 6,
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['Концепт-арт', 'Фэнтези'],
    desc: 'Создание атмосферных пейзажей, фэнтези-артов и дизайн-иллюстраций',
    versions: [
      { id: 'wan-ultra', name: 'Wan Image Pro (Ultra)', slug: 'flux-dev', cost: 9, tier: 'high', tierLabel: 'Максимум' },
      { id: 'wan-std', name: 'Wan Image (Standard)', slug: 'flux-dev', cost: 6, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'wan-lite', name: 'Wan Image Fast (Lite)', slug: 'flux-schnell', cost: 4, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['9:16', '1:1', '16:9', '4:5'],
    samplePrompts: [
      'Заброшенный древний замок среди туманных гор, эпический свет',
      'Парящие острова в небе на фоне заката'
    ]
  },
  'nano-banana': {
    id: 'nano-banana',
    name: 'Nano Banana',
    category: 'photo',
    provider: 'piapi',
    cost: 8,
    preview: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    tags: ['Эксклюзив', 'Digital Арт'],
    desc: 'Креативная генерация ярких digital-артов и дизайн-иллюстраций',
    versions: [
      { id: 'nano-ultra', name: 'Nano Pro 2.0 (Ultra)', slug: 'flux-dev', cost: 10, tier: 'high', tierLabel: 'Максимум' },
      { id: 'nano-std', name: 'Nano Turbo (Standard)', slug: 'flux-dev', cost: 8, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'nano-lite', name: 'Nano Flash (Lite)', slug: 'flux-schnell', cost: 5, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['9:16', '1:1', '16:9', '4:5'],
    samplePrompts: [
      'Яркий неоновый поп-арт с фруктами и космическими элементами',
      'Футуристический дизайн персонажа в стиле киберпанк'
    ]
  },
  'seedream-pro': {
    id: 'seedream-pro',
    name: 'Seedream',
    category: 'photo',
    provider: 'piapi',
    cost: 6,
    preview: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    tags: ['Турбо', '3D Персонажи'],
    desc: 'Сверхбыстрая генерация концепт-артов и мультяшных аватаров',
    versions: [
      { id: 'sd-ultra', name: 'Seedream 4.0 (Ultra)', slug: 'flux-dev', cost: 8, tier: 'high', tierLabel: 'Максимум' },
      { id: 'sd-std', name: 'Seedream 3.5 (Standard)', slug: 'flux-dev', cost: 6, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'sd-lite', name: 'Seedream Lite (Fast)', slug: 'flux-schnell', cost: 4, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['1:1', '9:16', '16:9'],
    samplePrompts: [
      '3D персонаж в стиле Pixar, выразительная мимика',
      'Киберпанк самурай в неоновых доспехах'
    ]
  },

  // =============================================
  // 3. ТЕКСТОВЫЕ МОДЕЛИ (OpenRouter) — ПОСЛЕДНЕЕ МЕСТО
  // =============================================
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'OpenAI GPT',
    category: 'text',
    provider: 'openrouter',
    cost: 3,
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    tags: ['Копирайтинг', 'Идеи'],
    desc: 'Написание вирусных постов, сценариев для Reels и креативных текстов',
    versions: [
      { id: 'gpt-4o-ultra', name: 'GPT-4o Omni (Ultra)', slug: 'openai/gpt-4o', cost: 4, tier: 'high', tierLabel: 'Максимум' },
      { id: 'gpt-4o-std', name: 'GPT-4o (Standard)', slug: 'openai/gpt-4o', cost: 3, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Lite)', slug: 'openai/gpt-4o-mini', cost: 1, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Напиши 5 цепляющих сценариев для Reels про нейросети',
      'Придумай концепцию продающего поста для запуска продукта'
    ]
  },
  'claude-sonnet': {
    id: 'claude-sonnet',
    name: 'Claude',
    category: 'text',
    provider: 'openrouter',
    cost: 3,
    preview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    tags: ['Сценарии', 'Логика'],
    desc: 'Глубокие тексты, статьи, драматургия и сложный сторителлинг',
    versions: [
      { id: 'claude-ultra', name: 'Claude 3.5 Sonnet (Ultra)', slug: 'anthropic/claude-3.5-sonnet', cost: 4, tier: 'high', tierLabel: 'Максимум' },
      { id: 'claude-std', name: 'Claude 3.5 Haiku (Standard)', slug: 'anthropic/claude-3.5-haiku', cost: 2, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'claude-lite', name: 'Claude 3 Haiku (Lite)', slug: 'anthropic/claude-3-haiku', cost: 1, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Напиши сценарий для короткометражного фантастического фильма',
      'Создай подробный контент-план на 30 дней для личного бренда'
    ]
  },
  'gemini-pro': {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    category: 'text',
    provider: 'openrouter',
    cost: 2,
    preview: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    tags: ['Аналитика', 'Google AI'],
    desc: 'Быстрый контекстный анализ, структурирование и креативный синтез',
    versions: [
      { id: 'gemini-ultra', name: 'Gemini 1.5 Pro (Ultra)', slug: 'google/gemini-pro-1.5', cost: 3, tier: 'high', tierLabel: 'Максимум' },
      { id: 'gemini-std', name: 'Gemini 1.5 Flash (Standard)', slug: 'google/gemini-flash-1.5', cost: 2, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'gemini-lite', name: 'Gemini Flash Lite (Lite)', slug: 'google/gemini-flash-1.5', cost: 1, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Сделай сравнительный анализ трендов в дизайне 2026',
      'Составь скрипт прогрева для Telegram-канала'
    ]
  },
  'llama-3': {
    id: 'llama-3',
    name: 'Llama 3',
    category: 'text',
    provider: 'openrouter',
    cost: 1,
    preview: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
    tags: ['Open Source', 'Быстрый'],
    desc: 'Мощная открытая модель Meta для повседневных задач и диалогов',
    versions: [
      { id: 'llama-ultra', name: 'Llama 3.3 70B (Ultra)', slug: 'meta-llama/llama-3.3-70b-instruct', cost: 2, tier: 'high', tierLabel: 'Максимум' },
      { id: 'llama-std', name: 'Llama 3 70B (Standard)', slug: 'meta-llama/llama-3-70b-instruct', cost: 1, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'llama-lite', name: 'Llama 3 8B (Lite)', slug: 'meta-llama/llama-3-8b-instruct', cost: 1, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Предложи 10 идей для вирусных TikTok роликов',
      'Напиши вовлекающее приветствие для новых подписчиков'
    ]
  },
};

/**
 * Найти модель по id.
 */
function getModel(modelId) {
  return AI_MODELS[modelId] || null;
}

/**
 * Найти конкретную версию модели.
 */
function getModelVersion(modelId, versionId) {
  const model = AI_MODELS[modelId];
  if (!model) return null;
  const version = model.versions.find((v) => v.id === versionId);
  if (!version) return null;
  return { model, version };
}

/**
 * Получить список моделей по категории.
 */
function getModelsByCategory(category) {
  return Object.values(AI_MODELS).filter((m) => m.category === category);
}

/**
 * Получить все модели (в порядке Видео -> Фото -> Текст).
 */
function getAllModels() {
  return Object.values(AI_MODELS);
}

/**
 * Определить провайдера по slug версии.
 */
function getProviderBySlug(slug) {
  for (const model of Object.values(AI_MODELS)) {
    for (const ver of model.versions) {
      if (ver.slug === slug) return model.provider;
    }
  }
  return null;
}

module.exports = {
  AI_MODELS,
  getModel,
  getModelVersion,
  getModelsByCategory,
  getAllModels,
  getProviderBySlug,
};
