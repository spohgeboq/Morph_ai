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
    tags: ['1080p', 'Кино'],
    desc: 'Плавные кинематографичные видео и реалистичная физика движения',
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'kling-ultra', name: 'Kling 3.0', slug: 'kling-video/v3/pro', cost: 16 },
      { id: 'kling-std', name: 'Kling 1.5 HD', slug: 'kling-video/v1.5/pro', cost: 12 },
      { id: 'kling-lite', name: 'Kling Fast', slug: 'kling-video/v1.5/fast', cost: 8 },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Неоновый киберпанк спорткар мчит по ночному Токио под дождем',
      'Плавный пролет камеры над океанскими скалами на закате'
    ]
  },
  'hailuo': {
    id: 'hailuo',
    name: 'Hailuo',
    category: 'video',
    provider: 'piapi',
    cost: 14,
    preview: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    tags: ['Реализм', 'HD'],
    desc: 'Генерация сверхреалистичных сцен с естественной пластикой людей и природы',
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'hailuo-ultra', name: 'Hailuo H3', slug: 'minimax-hailuo-h3', cost: 16 },
      { id: 'hailuo-std', name: 'Hailuo H2', slug: 'minimax-hailuo', cost: 13 },
      { id: 'hailuo-lite', name: 'Hailuo Lite', slug: 'minimax-hailuo-lite', cost: 9 },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Девушка улыбается и поправляет волосы на ветру в цветущем поле',
      'Золотой орел парит над горным хребтом в лучах утреннего солнца'
    ]
  },
  'runway-gen4': {
    id: 'runway-gen4',
    name: 'GenAi',
    category: 'video',
    provider: 'runway',
    cost: 16,
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['VFX Кино', 'Slow-Mo'],
    desc: 'Голливудские спецэффекты, передовая кинематографичная физика и slow-motion',
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'runway-ultra', name: 'Runway Gen-4', slug: 'gen4_turbo', cost: 18 },
      { id: 'runway-std', name: 'Runway Gen-4 Turbo', slug: 'gen4_turbo', cost: 15 },
      { id: 'runway-lite', name: 'Runway Gen-3', slug: 'gen4_turbo', cost: 10 },
    ],
    aspectRatios: ['16:9', '9:16'],
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
    tags: ['6–15 сек', 'Анимация'],
    desc: 'Видеомодель с гибким интерактивным выбором длительности (6, 10 или 15 сек)',
    defaultDuration: 6,
    allowDurationChoice: true,
    durationOptions: [6, 10, 15],
    versions: [
      { id: 'seedance-ultra', name: 'Seedance 2.5', slug: 'seedance-2.5', cost: 16 },
      { id: 'seedance-std', name: 'Seedance 2.0', slug: 'seedance', cost: 12 },
      { id: 'seedance-lite', name: 'Seedance Lite', slug: 'seedance-lite', cost: 8 },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Красочный танец в неоновом дожде под электронную музыку',
      'Анимированная сцена превращения бабочки в созвездие звезд'
    ]
  },
  'veo-3-1': {
    id: 'veo-3-1',
    name: 'Veo 3.1',
    category: 'video',
    provider: 'runway',
    cost: 16,
    preview: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80',
    tags: ['Google DeepMind', '4K Кино'],
    desc: 'Передовая кинематографичная видеомодель от Google с высокой детализацией',
    defaultDuration: 4,
    allowDurationChoice: false,
    versions: [
      { id: 'veo-ultra', name: 'Veo 3.1 Pro', slug: 'veo3.1', cost: 18 },
      { id: 'veo-std', name: 'Veo 3.1 Standard', slug: 'veo3.1', cost: 16 },
      { id: 'veo-lite', name: 'Veo 3.1 Fast', slug: 'veo3.1', cost: 12 },
    ],
    aspectRatios: ['16:9', '9:16'],
    samplePrompts: [
      'Человек идет по пляжу в ветреную погоду, золотой закат, кинематографичный свет',
      'Замедленный кинематографичный пролет камеры над неоновым мегаполисом'
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
    tags: ['8K Фото', 'Портрет'],
    desc: 'Гиперреалистичные портреты и фото студийного качества',
    versions: [
      { id: 'flux-ultra', name: 'Flux 1.1 Pro', slug: 'flux-dev', cost: 12 },
      { id: 'flux-std', name: 'Flux Dev', slug: 'flux-dev', cost: 8 },
      { id: 'flux-lite', name: 'Flux Schnell', slug: 'flux-schnell', cost: 5 },
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
    tags: ['Замена лица', '4K'],
    desc: 'Высокоточная замена лица на фото и шаблонах с сохранением мимики',
    versions: [
      { id: 'fs-ultra', name: 'Face Swap Ultra 4K', slug: 'face-swap', cost: 14 },
      { id: 'fs-std', name: 'Face Swap HD', slug: 'face-swap', cost: 10 },
      { id: 'fs-lite', name: 'Face Swap Lite', slug: 'face-swap', cost: 6 },
    ],
    aspectRatios: ['1:1', '9:16', '16:9'],
    samplePrompts: [
      'Замена лица на портрете в вечернем стиле',
      'Создание фотореалистичного аватара'
    ]
  },
  'gpt-image': {
    id: 'gpt-image',
    name: 'GPT Image',
    category: 'photo',
    provider: 'piapi',
    cost: 10,
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    tags: ['OpenAI', 'Фотореализм'],
    desc: 'Новейшая генерация фотореалистичных изображений студийного качества и сложных композиций',
    versions: [
      { id: 'gpt-image-ultra', name: 'GPT Image 2', slug: 'gpt-image-2', cost: 12 },
      { id: 'gpt-image-std', name: 'GPT Image 1.5', slug: 'gpt-image-1.5', cost: 8 },
      { id: 'gpt-image-lite', name: 'GPT Image 1', slug: 'gpt-image-1', cost: 5 },
    ],
    aspectRatios: ['1:1', '16:9', '9:16', '4:5'],
    samplePrompts: [
      'Рекламное фото вязаного кардигана на хромированном стуле в мягком студийном свете',
      'Эстетичный студийный портрет крупным планом с мягким кинематографичным светом'
    ]
  },
  'nano-banana': {
    id: 'nano-banana',
    name: 'Nano Banana',
    category: 'photo',
    provider: 'piapi',
    cost: 8,
    preview: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    tags: ['Эксклюзив', 'Digital'],
    desc: 'Креативная генерация ярких digital-артов и дизайн-иллюстраций',
    versions: [
      { id: 'nano-ultra', name: 'Nano Banana 2', slug: 'nano-banana-2', cost: 10 },
      { id: 'nano-std', name: 'Nano Banana 1 Pro', slug: 'nano-banana-1-pro', cost: 8 },
      { id: 'nano-lite', name: 'Nano Banana 1', slug: 'nano-banana-1', cost: 5 },
    ],
    aspectRatios: ['1:1', '9:16', '16:9', '4:5'],
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
    tags: ['3D Аватар', 'Турбо'],
    desc: 'Сверхбыстрая генерация концепт-артов и мультяшных аватаров',
    versions: [
      { id: 'sd-ultra', name: 'Seedream 5.0 Pro', slug: 'seedream-5-pro', cost: 8 },
      { id: 'sd-std', name: 'Seedream 5.0 Lite', slug: 'seedream-5-lite', cost: 6 },
      { id: 'sd-lite', name: 'Seedream 4.0', slug: 'seedream-4-0', cost: 4 },
    ],
    aspectRatios: ['1:1', '9:16', '16:9'],
    samplePrompts: [
      '3D персонаж в стиле Pixar, выразительная мимика',
      'Киберпанк самурай в неоновых доспехах'
    ]
  },

  // =============================================
  // 3. ИИ-СКАЗИТЕЛИ И МАСТЕРА ИСТОРИЙ (OpenRouter)
  // =============================================
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT Сказки',
    category: 'text',
    provider: 'openrouter',
    cost: 3,
    roleTitle: 'Сказки',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['Сказки', 'Притчи'],
    desc: 'Добрые сказки на ночь, волшебные миры и поучительные притчи со смыслом',
    versions: [
      { id: 'gpt-4o-ultra', name: 'GPT-4o', slug: 'openai/gpt-4o', cost: 4 },
      { id: 'gpt-4o-std', name: 'GPT-4o Standard', slug: 'openai/gpt-4o', cost: 3 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', slug: 'openai/gpt-4o-mini', cost: 1 },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Сказка о маленьком маячнике, который зажигал упавшие звезды',
      'Добрая притча о старинных часах, считавших только счастливые мгновения'
    ]
  },
  'claude-sonnet': {
    id: 'claude-sonnet',
    name: 'Claude Мистика',
    category: 'text',
    provider: 'openrouter',
    cost: 3,
    roleTitle: 'Мистика',
    preview: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    tags: ['Мистика', 'Тайны'],
    desc: 'Загадочные мистические истории, городские легенды, саспенс и детективные тайны',
    versions: [
      { id: 'claude-ultra', name: 'Claude Sonnet', slug: 'anthropic/claude-sonnet-4', cost: 4 },
      { id: 'claude-std', name: 'Claude Haiku', slug: 'anthropic/claude-3-haiku', cost: 2 },
      { id: 'claude-lite', name: 'Claude Fast', slug: 'anthropic/claude-3-haiku', cost: 1 },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Тайна заброшенной станции метро, куда поезда приходят лишь в полнолуние',
      'История старинного антикварного зеркала, отражающего события прошлого'
    ]
  },
  'gemini-pro': {
    id: 'gemini-pro',
    name: 'Gemini Sci-Fi',
    category: 'text',
    provider: 'openrouter',
    cost: 2,
    roleTitle: 'Sci-Fi',
    preview: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    tags: ['Космос', 'Sci-Fi'],
    desc: 'Научно-фантастические саги, киберпанк, космические одиссеи и хроники далеких миров',
    versions: [
      { id: 'gemini-3-flash', name: 'Gemini 3 Flash', slug: 'google/gemini-3.7-flash', cost: 3 },
      { id: 'gemini-35-flash-lite', name: 'Gemini 3.5 Flash Lite', slug: 'google/gemini-3.5-flash-lite', cost: 2 },
      { id: 'gemini-25-flash', name: 'Gemini 2.5 Flash', slug: 'google/gemini-2.5-flash', cost: 1 },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Хроника экспедиции к мыслящему кристаллическому океану на краю галактики',
      'История андроида-музыканта в неоновом киберпанк-мегаполисе 2180 года'
    ]
  },
  'llama-3': {
    id: 'llama-3',
    name: 'Llama Эпос',
    category: 'text',
    provider: 'openrouter',
    cost: 1,
    roleTitle: 'Эпос',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['Приключения', 'Эпос'],
    desc: 'Захватывающие странствия, поиск сокровищ, древние воины и рыцарские романы',
    versions: [
      { id: 'llama-ultra', name: 'Llama 3.3 70B', slug: 'meta-llama/llama-3.3-70b-instruct', cost: 2 },
      { id: 'llama-std', name: 'Llama 3 70B', slug: 'meta-llama/llama-3-70b-instruct', cost: 1 },
      { id: 'llama-lite', name: 'Llama 3 8B', slug: 'meta-llama/llama-3-8b-instruct', cost: 1 },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Опасная экспедиция за затерянным золотым компасом в сердце древних джунглей',
      'Легенда о рыцаре, давшем клятву защитить последнее Древо Света'
    ]
  },
};

const MODEL_ALIASES = {
  'gpt-tales': 'gpt-4o',
  'claude-mystic': 'claude-sonnet',
  'gemini-scifi': 'gemini-pro',
  'llama-epic': 'llama-3',
  'veo3.1': 'veo-3-1',
  'veo-3.1': 'veo-3-1',
};

/**
 * Найти модель по id (с поддержкой алиасов).
 */
function getModel(modelId) {
  if (!modelId) return null;
  const resolvedId = MODEL_ALIASES[modelId] || modelId;
  return AI_MODELS[resolvedId] || AI_MODELS[modelId] || null;
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
