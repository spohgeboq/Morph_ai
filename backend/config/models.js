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
  'seedance': {
    id: 'seedance',
    name: 'Seedance',
    category: 'video',
    provider: 'piapi',
    cost: 12,
    preview: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    tags: ['ByteDance', '6–15 сек'],
    desc: 'Передовая видеомодель от ByteDance с гибким выбором длительности (6, 10 или 15 сек)',
    defaultDuration: 6,
    allowDurationChoice: true,
    durationOptions: [6, 10, 15],
    versions: [
      { id: 'seedance-2-5', name: 'Seedance 2.5', slug: 'seedance-2.5', cost: 16 },
      { id: 'seedance-2-0', name: 'Seedance 2.0', slug: 'seedance-2.0', cost: 12 },
      { id: 'seedance-1-pro', name: 'Seedance 1.0 Pro', slug: 'seedance-1.0-pro', cost: 10 },
      { id: 'seedance-1-lite', name: 'Seedance 1.0 Lite', slug: 'seedance-1.0-lite', cost: 8 },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Красочный танец в неоновом дожде под электронную музыку',
      'Анимированная сцена превращения бабочки в созвездие звезд'
    ]
  },
  'kling-hd': {
    id: 'kling-hd',
    name: 'Kling AI',
    category: 'video',
    provider: 'piapi',
    cost: 12,
    preview: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    tags: ['Kuaishou', '1080p Кино'],
    desc: 'Плавные кинематографичные видео и реалистичная физика движения',
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'kling-3-0', name: 'Kling 3.0', slug: 'kling-video/v3/pro', cost: 16 },
      { id: 'kling-3-0-omni', name: 'Kling 3.0 Omni', slug: 'kling-video/v3/omni', cost: 16 },
      { id: 'kling-2-6', name: 'Kling 2.6', slug: 'kling-video/v2.6/pro', cost: 14 },
      { id: 'kling-2-5', name: 'Kling 2.5', slug: 'kling-video/v2.5/pro', cost: 12 },
      { id: 'kling-1-5', name: 'Kling 1.5 HD', slug: 'kling-video/v1.5/pro', cost: 10 },
      { id: 'kling-avatar', name: 'Kling AI Avatar', slug: 'kling-avatar', cost: 12 },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Неоновый киберпанк спорткар мчит по ночному Токио под дождем',
      'Плавный пролет камеры над океанскими скалами на закате'
    ]
  },
  'hailuo': {
    id: 'hailuo',
    name: 'MiniMax H3',
    category: 'video',
    provider: 'piapi',
    cost: 14,
    preview: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    tags: ['MiniMax', 'Реализм'],
    desc: 'Сверхреалистичная физика людей, мимики, динамики ткани и природных явлений',
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'minimax-h3', name: 'MiniMax H3', slug: 'minimax-hailuo-h3', cost: 16 },
      { id: 'minimax-h2', name: 'MiniMax H2 Standard', slug: 'minimax-hailuo', cost: 13 },
      { id: 'minimax-lite', name: 'MiniMax Lite', slug: 'minimax-hailuo-lite', cost: 9 },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Девушка улыбается и поправляет волосы на ветру в цветущем поле',
      'Золотой орел парит над горным хребтом в лучах утреннего солнца'
    ]
  },
  'veo-3-1': {
    id: 'veo-3-1',
    name: 'Google Veo',
    category: 'video',
    provider: 'piapi',
    cost: 16,
    preview: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80',
    tags: ['Google', '4K Кино'],
    desc: 'Передовая кинематографичная видеомодель от Google DeepMind с потрясающей детализацией',
    defaultDuration: 5,
    allowDurationChoice: false,
    versions: [
      { id: 'veo-3-1', name: 'Veo 3.1', slug: 'veo3.1', cost: 18 },
      { id: 'veo-3', name: 'Veo 3', slug: 'veo3', cost: 15 },
      { id: 'veo-3-fast', name: 'Veo 3 Fast', slug: 'veo3-fast', cost: 12 },
    ],
    aspectRatios: ['16:9', '9:16'],
    samplePrompts: [
      'Человек идет по пляжу в ветреную погоду, золотой закат, кинематографичный свет',
      'Замедленный кинематографичный пролет камеры над футуристичным мегаполисом'
    ]
  },
  'wan-video': {
    id: 'wan-video',
    name: 'Wan Video',
    category: 'video',
    provider: 'piapi',
    cost: 14,
    preview: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
    tags: ['Alibaba', 'Кинематограф'],
    desc: 'Флагманская видеомодель от Alibaba с высокой плавностью движения и богатыми текстурами',
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'wan-2-6', name: 'Wan 2.6', slug: 'wan22-txt2video-14b', cost: 16 },
      { id: 'wan-2-5', name: 'Wan 2.5', slug: 'txt2video-14b', cost: 13 },
      { id: 'wan-fast', name: 'Wan Fast', slug: 'txt2video-1.3b', cost: 9 },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Древний восточный храм на вершине туманных гор, восход солнца, 8k',
      'Кинематографичный пролет дрона над ночным мегаполисом с неоновыми огнями'
    ]
  },
  'omnihuman': {
    id: 'omnihuman',
    name: 'OmniHuman',
    category: 'video',
    provider: 'piapi',
    cost: 15,
    preview: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80',
    tags: ['ByteDance', 'Avatar'],
    desc: 'Генерация гиперреалистичных цифровых людей и анимированных аватаров от ByteDance',
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'omnihuman-1-5', name: 'OmniHuman 1.5', slug: 'omni-human-1.5', cost: 16 },
      { id: 'omnihuman-std', name: 'OmniHuman', slug: 'omni-human', cost: 12 },
    ],
    aspectRatios: ['9:16', '16:9', '1:1'],
    samplePrompts: [
      'Реалистичный цифровой спикер обращается к аудитории в современной студии',
      'Эмоциональный портрет человека с естественной живой мимикой'
    ]
  },
  'runway-gen4': {
    id: 'runway-gen4',
    name: 'Runway Gen-4',
    category: 'video',
    provider: 'runway',
    cost: 16,
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['RunwayML', 'Slow-Mo'],
    desc: 'Голливудские спецэффекты, передовая кинематографичная физика и slow-motion',
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'runway-ultra', name: 'Runway Gen-4 Turbo', slug: 'gen4_turbo', cost: 18 },
      { id: 'runway-std', name: 'Runway Gen-3 Turbo', slug: 'gen3_turbo', cost: 15 },
    ],
    aspectRatios: ['16:9', '9:16'],
    samplePrompts: [
      'Замедленный взрыв неоновых кристаллов в темноте, осколки света',
      'Кинематографичная сцена погони в футуристичном мегаполисе'
    ]
  },

  // =============================================
  // 2. ФОТО МОДЕЛИ & FACE SWAP (PiAPI) — ВТОРОЕ МЕСТО
  // =============================================
  'seedream-pro': {
    id: 'seedream-pro',
    name: 'Seedream',
    category: 'photo',
    provider: 'piapi',
    cost: 6,
    preview: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    tags: ['ByteDance', '3D Аватар'],
    desc: 'Сверхбыстрая генерация концепт-артов, 3D персонажей и ярких аватаров от ByteDance',
    versions: [
      { id: 'sd-5-pro', name: 'Seedream 5 Pro', slug: 'seedream-5-pro', cost: 8 },
      { id: 'sd-5-lite', name: 'Seedream 5 Lite', slug: 'seedream-5-lite', cost: 6 },
      { id: 'sd-4-0', name: 'Seedream 4.0', slug: 'seedream-4-0', cost: 4 },
    ],
    aspectRatios: ['1:1', '9:16', '16:9'],
    samplePrompts: [
      '3D персонаж в стиле Pixar, выразительная мимика, детальные текстуры',
      'Киберпанк самурай в светящихся доспехах'
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
    desc: 'Генерация фотореалистичных изображений студийного качества и сложных композиций от OpenAI',
    versions: [
      { id: 'gpt-image-2-5', name: 'GPT Image 2.5', slug: 'gpt-image-2.5', cost: 12 },
      { id: 'gpt-image-2', name: 'GPT Image 2', slug: 'gpt-image-2', cost: 10 },
      { id: 'gpt-image-1-5', name: 'GPT Image 1.5', slug: 'gpt-image-1.5', cost: 7 },
      { id: 'gpt-image-1', name: 'GPT Image 1', slug: 'gpt-image-1', cost: 5 },
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
    tags: ['Google', 'Digital Art'],
    desc: 'Креативная генерация ярких digital-артов и дизайн-иллюстраций от Google',
    versions: [
      { id: 'nano-pro', name: 'Nano Banana Pro', slug: 'nano-banana-pro', cost: 10 },
      { id: 'nano-2', name: 'Nano Banana 2', slug: 'nano-banana-2', cost: 8 },
      { id: 'nano-std', name: 'Nano Banana', slug: 'nano-banana-1', cost: 5 },
    ],
    aspectRatios: ['1:1', '9:16', '16:9', '4:5'],
    samplePrompts: [
      'Яркий неоновый поп-арт с фруктами и космическими элементами',
      'Футуристический дизайн персонажа в стиле киберпанк'
    ]
  },
  'flux-pro': {
    id: 'flux-pro',
    name: 'Flux',
    category: 'photo',
    provider: 'piapi',
    cost: 10,
    preview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    tags: ['Black Forest', '8K Фото'],
    desc: 'Гиперреалистичные портреты и студийные кадры от Black Forest Labs',
    versions: [
      { id: 'flux-1-1-pro', name: 'Flux 1.1 Pro', slug: 'flux-dev', cost: 12 },
      { id: 'flux-kontext', name: 'Flux Kontext', slug: 'flux-kontext', cost: 10 },
      { id: 'flux-dev', name: 'Flux Dev', slug: 'flux-dev', cost: 8 },
      { id: 'flux-schnell', name: 'Flux Schnell', slug: 'flux-schnell', cost: 5 },
    ],
    aspectRatios: ['1:1', '9:16', '16:9', '4:5'],
    samplePrompts: [
      'Девушка в лучах заката на крыше в Париже, 35mm film',
      'Эстетичный студийный портрет с мягким объемным светом'
    ]
  },
  'qwen-image': {
    id: 'qwen-image',
    name: 'Qwen Image',
    category: 'photo',
    provider: 'piapi',
    cost: 8,
    preview: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    tags: ['Alibaba', 'Иллюстрации'],
    desc: 'Передовая генерация детализированных концепт-артов и живописных иллюстраций от Alibaba',
    versions: [
      { id: 'qwen-2-1', name: 'Qwen Image 2.1', slug: 'qwen-image-2.1', cost: 8 },
      { id: 'qwen-std', name: 'Qwen Image', slug: 'qwen-image', cost: 6 },
    ],
    aspectRatios: ['1:1', '9:16', '16:9'],
    samplePrompts: [
      'Традиционный китайский сад в утреннем тумане, акварельный стиль с золотом',
      'Фантастический город будущего в лучах заходящего солнца'
    ]
  },
  'z-image-turbo': {
    id: 'z-image-turbo',
    name: 'Z-Image Turbo',
    category: 'photo',
    provider: 'piapi',
    cost: 6,
    preview: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    tags: ['Alibaba', 'Турбо-скорость'],
    desc: 'Сверхбыстрая генерация изображений высокой четкости за считанные секунды',
    versions: [
      { id: 'z-image-turbo', name: 'Z-Image Turbo', slug: 'z-image-turbo', cost: 6 },
      { id: 'z-image-std', name: 'Z-Image Standard', slug: 'z-image', cost: 4 },
    ],
    aspectRatios: ['1:1', '9:16', '16:9'],
    samplePrompts: [
      'Спортивный автомобиль будущего на высокой скорости, динамичные неоновые полосы',
      'Концепт современного минималистичного интерьера с видом на горы'
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
    desc: 'Высокоточная замена лица на фото и шаблонах с полным сохранением мимики',
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

  // =============================================
  // 3. ИИ-СКАЗИТЕЛИ И МАСТЕРА ИСТОРИЙ (OpenRouter) — ДРУГИЕ АПИШКИ
  // =============================================
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT Сказки',
    category: 'text',
    provider: 'openrouter',
    cost: 3,
    roleTitle: 'Сказки',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['OpenAI', 'Сказки'],
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
    tags: ['Anthropic', 'Тайны'],
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
    tags: ['Google', 'Sci-Fi'],
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
    tags: ['Meta', 'Эпос'],
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
  'veo': 'veo-3-1',
  'wan': 'wan-video',
  'wanx': 'wan-video',
  'minimax': 'hailuo',
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
