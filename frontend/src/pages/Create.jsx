import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import { useLanguage } from '../components/LanguageContext';
import { useUser } from '../components/UserContext';
import { fetchModels, requestGeneration, checkTaskStatus, uploadFileToR2 } from '../services/api';
import { 
  Search, 
  Sparkles, 
  Camera, 
  Play, 
  FileText, 
  ChevronRight, 
  X, 
  Check, 
  Plus, 
  ArrowLeft, 
  Clock, 
  Film,
  Download,
  Copy,
  RotateCcw
} from 'lucide-react';

// База данных моделей MorphAI (синхронизирована с бэкендом: Видео -> Фото -> Текст)
export const AI_MODELS_DB = [
  // ==================== 1. ВИДЕО МОДЕЛИ (ПЕРВОЕ МЕСТО) ====================
  {
    id: 'kling-hd',
    name: 'Kling AI',
    category: 'video',
    preview: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    tags: ['Видео 1080p', 'Кино-физика'],
    desc: 'Плавные кинематографичные видео и анимация персонажей',
    cost: 12,
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'kling-ultra', name: 'Kling 3.0', cost: 16, tier: 'high', tierLabel: 'Максимум' },
      { id: 'kling-std', name: 'Kling 1.5 HD', cost: 12, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'kling-lite', name: 'Kling Fast', cost: 8, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Неоновый киберпанк спорткар мчит по ночному Токио под дождем',
      'Плавный пролет камеры над океанскими скалами'
    ]
  },
  {
    id: 'hailuo',
    name: 'Hailuo (MiniMax)',
    category: 'video',
    preview: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    tags: ['Реалистичное движение', 'HD'],
    desc: 'Генерация сверхреалистичных сцен с естественной физикой людей и природы',
    cost: 14,
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'hailuo-ultra', name: 'Hailuo H3', cost: 16, tier: 'high', tierLabel: 'Максимум' },
      { id: 'hailuo-std', name: 'Hailuo H2', cost: 13, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'hailuo-lite', name: 'Hailuo Lite', cost: 9, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Девушка улыбается и поправляет волосы на ветру в цветущем поле',
      'Золотой орел парит над горным хребтом в лучах утреннего солнца'
    ]
  },
  {
    id: 'luma-dream',
    name: 'Luma Dream Machine',
    category: 'video',
    preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    tags: ['Оживление фото', 'Динамика'],
    desc: 'Превращает статичные фотографии в реалистичные видеоролики',
    cost: 10,
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'luma-ultra', name: 'Dream 1.5 HD', cost: 14, tier: 'high', tierLabel: 'Максимум' },
      { id: 'luma-std', name: 'Dream 1.0', cost: 10, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'luma-lite', name: 'Dream Turbo', cost: 7, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Оживление портрета: легкая улыбка и колыхание волос от ветра',
      'Оживление фото пейзажа с движущимися облаками'
    ]
  },
  {
    id: 'runway-gen4',
    name: 'Runway Gen-4',
    category: 'video',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['VFX Кино', 'Slow-Mo'],
    desc: 'Голливудские спецэффекты и кинематографичное slow-motion',
    cost: 16,
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'runway-ultra', name: 'Runway Gen-4', cost: 18, tier: 'high', tierLabel: 'Максимум' },
      { id: 'runway-std', name: 'Runway Gen-4 Turbo', cost: 15, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'runway-lite', name: 'Runway Gen-3', cost: 10, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Замедленный взрыв неоновых кристаллов в темноте, осколки света',
      'Кинематографичная сцена погони в футуристичном мегаполисе'
    ]
  },
  {
    id: 'seedance',
    name: 'Seedance',
    category: 'video',
    preview: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    tags: ['Гибкое время', 'Анимация'],
    desc: 'Передовая видеомодель с выбором длительности генерации (6, 10 или 15 сек)',
    cost: 12,
    defaultDuration: 6,
    allowDurationChoice: true,
    durationOptions: [6, 10, 15],
    versions: [
      { id: 'seedance-ultra', name: 'Seedance 2.5', cost: 16, tier: 'high', tierLabel: 'Максимум' },
      { id: 'seedance-std', name: 'Seedance 2.0', cost: 12, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'seedance-lite', name: 'Seedance Lite', cost: 8, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Красочный танец в неоновом дожде под электронную музыку',
      'Анимированная сцена превращения бабочки в созвездие звезд'
    ]
  },

  // ==================== 2. ФОТО МОДЕЛИ & FACE SWAP ====================
  {
    id: 'flux-pro',
    name: 'Flux',
    category: 'photo',
    preview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    tags: ['Фото 8K', 'Портреты'],
    desc: 'Гиперреалистичные портреты и фото студийного качества',
    cost: 10,
    versions: [
      { id: 'flux-ultra', name: 'Flux 1.1 Pro', cost: 12, tier: 'high', tierLabel: 'Максимум' },
      { id: 'flux-std', name: 'Flux Dev', cost: 8, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'flux-lite', name: 'Flux Schnell', cost: 5, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['1:1', '9:16', '16:9', '4:5'],
    samplePrompts: [
      'Девушка в лучах заката на крыше в Париже, 35mm',
      'Эстетичный студийный портрет с мягким светом'
    ]
  },
  {
    id: 'face-swap',
    name: 'Face Swap',
    category: 'photo',
    preview: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    tags: ['Замена лица', 'Реализм'],
    desc: 'Высокоточная замена лица на фото и шаблонах с сохранением мимики',
    cost: 10,
    versions: [
      { id: 'fs-ultra', name: 'Face Swap Ultra 4K', cost: 14, tier: 'high', tierLabel: 'Максимум' },
      { id: 'fs-std', name: 'Face Swap HD Standard', cost: 10, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'fs-lite', name: 'Face Swap Fast Lite', cost: 6, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['1:1', '9:16', '16:9'],
    samplePrompts: [
      'Замена лица на портрете в вечернем стиле',
      'Создание фотореалистичного аватара'
    ]
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    category: 'photo',
    preview: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    tags: ['Иллюстрации', 'Сюрреализм'],
    desc: 'Точное следование сложным подсказкам и яркая художественная визуализация',
    cost: 8,
    versions: [
      { id: 'dall-e-ultra', name: 'DALL-E 3 HD', cost: 10, tier: 'high', tierLabel: 'Максимум' },
      { id: 'dall-e-std', name: 'DALL-E 3', cost: 8, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'dall-e-lite', name: 'DALL-E 3 Fast', cost: 5, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['1:1', '16:9', '9:16'],
    samplePrompts: [
      'Абстрактная картина маслом в стиле кубизма, яркие контрасты',
      'Футуристический город в стеклянном шаре среди пустыни'
    ]
  },
  {
    id: 'imagen-3',
    name: 'Imagen 3',
    category: 'photo',
    preview: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    tags: ['Google Фото', 'Фотореализм'],
    desc: 'Передовая модель генерации изображений от Google с глубокой детализацией',
    cost: 8,
    versions: [
      { id: 'imagen-ultra', name: 'Imagen 3 Ultra', cost: 10, tier: 'high', tierLabel: 'Максимум' },
      { id: 'imagen-std', name: 'Imagen 3', cost: 8, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'imagen-lite', name: 'Imagen 3 Fast', cost: 5, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['1:1', '16:9', '9:16', '4:5'],
    samplePrompts: [
      'Кинематографичный кадр из исторического фильма при естественном свете',
      'Макросъемка капли росы на лепестке экзотического цветка'
    ]
  },
  {
    id: 'wan-image',
    name: 'Wan Image',
    category: 'photo',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['Концепт-арт', 'Фэнтези'],
    desc: 'Создание атмосферных пейзажей, фэнтези-артов и дизайн-иллюстраций',
    cost: 6,
    versions: [
      { id: 'wan-ultra', name: 'Wan Image Pro', cost: 9, tier: 'high', tierLabel: 'Максимум' },
      { id: 'wan-std', name: 'Wan Image', cost: 6, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'wan-lite', name: 'Wan Image Fast', cost: 4, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['9:16', '1:1', '16:9', '4:5'],
    samplePrompts: [
      'Заброшенный древний замок среди туманных гор, эпический свет',
      'Парящие острова в небе на фоне заката'
    ]
  },
  {
    id: 'nano-banana',
    name: 'Nano Banana',
    category: 'photo',
    preview: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    tags: ['Эксклюзив', 'Digital Арт'],
    desc: 'Креативная генерация ярких digital-артов и дизайн-иллюстраций',
    cost: 8,
    versions: [
      { id: 'nano-ultra', name: 'Nano Pro 2.0', cost: 10, tier: 'high', tierLabel: 'Максимум' },
      { id: 'nano-std', name: 'Nano Turbo', cost: 8, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'nano-lite', name: 'Nano Flash', cost: 5, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['9:16', '1:1', '16:9', '4:5'],
    samplePrompts: [
      'Яркий неоновый поп-арт с фруктами и космическими элементами',
      'Футуристический дизайн персонажа в стиле киберпанк'
    ]
  },
  {
    id: 'seedream-pro',
    name: 'Seedream',
    category: 'photo',
    preview: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    tags: ['Турбо', '3D Персонажи'],
    desc: 'Сверхбыстрая генерация концепт-артов и мультяшных аватаров',
    cost: 6,
    versions: [
      { id: 'sd-ultra', name: 'Seedream 4.0', cost: 8, tier: 'high', tierLabel: 'Максимум' },
      { id: 'sd-std', name: 'Seedream 3.5', cost: 6, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'sd-lite', name: 'Seedream Lite', cost: 4, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: ['1:1', '9:16', '16:9'],
    samplePrompts: [
      '3D персонаж в стиле Pixar, выразительная мимика',
      'Киберпанк самурай в неоновых доспехах'
    ]
  },

  // ==================== 3. ТЕКСТОВЫЕ МОДЕЛИ (ПОСЛЕДНЕЕ МЕСТО) ====================
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT',
    category: 'text',
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    tags: ['Копирайтинг', 'Идеи'],
    desc: 'Написание вирусных постов, сценариев для Reels и креативных текстов',
    cost: 3,
    versions: [
      { id: 'gpt-4o-ultra', name: 'GPT-4o Omni', cost: 4, tier: 'high', tierLabel: 'Максимум' },
      { id: 'gpt-4o-std', name: 'GPT-4o Standard', cost: 3, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', cost: 1, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Напиши 5 цепляющих сценариев для Reels про нейросети',
      'Придумай концепцию продающего поста для запуска курса'
    ]
  },
  {
    id: 'claude-sonnet',
    name: 'Claude',
    category: 'text',
    preview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    tags: ['Сценарии', 'Логика'],
    desc: 'Глубокие тексты, статьи, драматургия и сложный сторителлинг',
    cost: 3,
    versions: [
      { id: 'claude-ultra', name: 'Claude 3.5 Sonnet', cost: 4, tier: 'high', tierLabel: 'Максимум' },
      { id: 'claude-std', name: 'Claude 3.5 Haiku', cost: 2, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'claude-lite', name: 'Claude 3 Haiku', cost: 1, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Напиши сценарий для короткометражного фантастического фильма',
      'Создай подробный контент-план на 30 дней для бренда'
    ]
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    category: 'text',
    preview: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    tags: ['Аналитика', 'Google AI'],
    desc: 'Быстрый контекстный анализ, структурирование и креативный синтез',
    cost: 2,
    versions: [
      { id: 'gemini-ultra', name: 'Gemini 1.5 Pro', cost: 3, tier: 'high', tierLabel: 'Максимум' },
      { id: 'gemini-std', name: 'Gemini 1.5 Flash', cost: 2, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'gemini-lite', name: 'Gemini Flash Lite', cost: 1, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Сделай сравнительный анализ трендов в дизайне 2026',
      'Составь скрипт прогрева для Telegram-канала'
    ]
  },
  {
    id: 'llama-3',
    name: 'Llama 3',
    category: 'text',
    preview: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
    tags: ['Open Source', 'Быстрый'],
    desc: 'Мощная открытая модель Meta для повседневных задач и диалогов',
    cost: 1,
    versions: [
      { id: 'llama-ultra', name: 'Llama 3.3 70B', cost: 2, tier: 'high', tierLabel: 'Максимум' },
      { id: 'llama-std', name: 'Llama 3 70B', cost: 1, tier: 'medium', tierLabel: 'Стандарт' },
      { id: 'llama-lite', name: 'Llama 3 8B', cost: 1, tier: 'lite', tierLabel: 'Лайт' },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Предложи 10 идей для вирусных TikTok роликов',
      'Напиши вовлекающее приветствие для новых подписчиков'
    ]
  },
];

const Create = () => {
  const { showToast } = useToast();
  const { t, translateDynamic } = useLanguage();
  const { currentUser, balance, setBalance, refreshUser } = useUser();

  const [models, setModels] = useState(AI_MODELS_DB);
  // Видео — на первом месте, открывается сразу при входе!
  const [activeCategory, setActiveCategory] = useState('video'); // 'video' | 'photo' | 'text' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Выбранная модель для перехода в полноэкранную Студию (Живой Холст)
  const [selectedModel, setSelectedModel] = useState(null);

  // Параметры генератора
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [videoDuration, setVideoDuration] = useState(6); // секунды: число 6, 10, 15
  const [cameraMotion, setCameraMotion] = useState('static'); // 'static' | 'zoom' | 'orbit' | 'pan'
  const [textMode, setTextMode] = useState('reels'); // 'reels' | 'post' | 'script'
  const [referenceImages, setReferenceImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatusText, setPollingStatusText] = useState('');
  const [copiedResult, setCopiedResult] = useState(false);
  const fileInputRef = useRef(null);

  // Модалка пополнения
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Загружаем актуальный список моделей с бэкенда
  useEffect(() => {
    let isMounted = true;
    fetchModels().then((backendModels) => {
      if (isMounted && backendModels && backendModels.length > 0) {
        setModels(backendModels);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.prompt) {
      const matchName = (location.state.model || '').toLowerCase();
      const targetModel = models.find(m => m.name.toLowerCase().includes(matchName)) || models[0];
      setSelectedModel(targetModel);
      setSelectedVersion(targetModel.versions?.[0] || null);
      setUserPrompt(location.state.prompt);
    }
  }, [location.state, models]);

  // Фильтрация списка моделей
  const filteredModels = useMemo(() => {
    return models.filter(model => {
      const matchesCat = activeCategory === 'all' || model.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        model.name.toLowerCase().includes(q) || 
        (model.desc && model.desc.toLowerCase().includes(q)) || 
        (model.tags && model.tags.some(t => t.toLowerCase().includes(q)));
      return matchesCat && matchesSearch;
    });
  }, [models, activeCategory, searchQuery]);

  // Открытие Студии Живого Холста для модели
  const handleOpenModel = (model) => {
    setSelectedModel(model);
    setSelectedVersion(model.versions?.[0] || null);
    setUserPrompt('');
    setSelectedRatio(model.aspectRatios?.[0] || '16:9');
    setVideoDuration(model.defaultDuration || 6);
    setCameraMotion('static');
    setReferenceImages([]);
    setGenerationSuccess(false);
    setGeneratedResult(null);
    setIsPolling(false);
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Загрузка референсов (до 10 фото) в Cloudflare R2
  const handleUploadImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setIsUploadingImage(true);
    showToast('Загрузка фото в облако R2...', 'info');

    try {
      for (const file of files) {
        const uploaded = await uploadFileToR2(file, 'references');
        if (uploaded?.url) {
          setReferenceImages(prev => [...prev, uploaded.url].slice(0, 10));
        }
      }
      showToast('Фото успешно загружено в R2!', 'success');
    } catch (err) {
      console.error('Upload error:', err);
      showToast(err.message || 'Ошибка загрузки фото', 'error');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Удаление отдельного референса
  const handleRemoveImage = (indexToRemove) => {
    setReferenceImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Вычисление стоимости генерации
  const currentCost = useMemo(() => {
    if (!selectedModel) return 10;
    return selectedVersion ? selectedVersion.cost : selectedModel.cost;
  }, [selectedModel, selectedVersion]);

  // Запуск РЕАЛЬНОЙ генерации через API бэкенда
  const handleStartGeneration = async () => {
    if (!userPrompt.trim()) return;
    if (balance < currentCost) {
      showToast('Недостаточно кредитов! Пополните баланс.', 'error');
      setShowRechargeModal(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      const isVideo = selectedModel.category === 'video';
      const durationToSend = isVideo 
        ? (selectedModel.allowDurationChoice ? videoDuration : (selectedModel.defaultDuration || 6))
        : undefined;

      const res = await requestGeneration({
        telegram_id: currentUser?.telegram_id || currentUser?.id,
        model_id: selectedModel.id,
        version_id: selectedVersion?.id,
        prompt: userPrompt.trim(),
        params: {
          aspect_ratio: selectedRatio,
          duration: durationToSend,
          camera_motion: isVideo ? cameraMotion : undefined,
          text_mode: selectedModel.category === 'text' ? textMode : undefined,
          reference_images: referenceImages,
        },
      });

      // Обновляем реальный баланс с сервера
      if (res.balance !== undefined) {
        setBalance(res.balance);
      } else {
        setBalance(prev => Math.max(0, prev - currentCost));
      }

      // 1. Текстовая генерация завершена синхронно
      if (res.result?.text) {
        setGeneratedResult({
          type: 'text',
          text: res.result.text,
          model: selectedModel.name,
          version: selectedVersion?.name || selectedModel.name,
          cost: currentCost
        });
        setGenerationSuccess(true);
        showToast('Текст успешно сгенерирован!', 'success');
        refreshUser();
      } 
      // 2. Асинхронная генерация медиа (видео/фото)
      else if (res.task_id) {
        setIsPolling(true);
        setPollingStatusText('Задача в обработке нейросетью...');
        showToast('Генерация запущена в нейросети!', 'success');

        let attempts = 0;
        const maxAttempts = 40;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const statusRes = await checkTaskStatus(res.task_id);
            if (statusRes?.status === 'completed') {
              clearInterval(pollInterval);
              setIsPolling(false);
              setGeneratedResult({
                type: isVideo ? 'video' : 'photo',
                url: statusRes.resultUrl || statusRes.output?.video || statusRes.output?.image_url,
                model: selectedModel.name,
                version: selectedVersion?.name || selectedModel.name,
                cost: currentCost
              });
              setGenerationSuccess(true);
              showToast('Шедевр успешно создан!', 'success');
              refreshUser();
            } else if (statusRes?.status === 'failed') {
              clearInterval(pollInterval);
              setIsPolling(false);
              showToast('Ошибка генерации. Кредиты автоматически возвращены!', 'error');
              refreshUser();
            } else {
              setPollingStatusText(`Создание шедевра... (${attempts * 3} сек)`);
            }
          } catch (e) {
            console.error('Polling error:', e);
          }

          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsPolling(false);
            setPollingStatusText('Генерация занимает больше времени, результат появится в Профиле.');
          }
        }, 3000);
      }
    } catch (err) {
      console.error('[Create] Generation error:', err);
      showToast(err.message || 'Ошибка генерации. Попробуйте еще раз.', 'error');
      refreshUser();
    } finally {
      setIsGenerating(false);
    }
  };

  /* =========================================================
     РЕЖИМ: ПОЛНОЭКРАННАЯ СТУДИЯ «ЖИВОЙ ХОЛСТ»
     ========================================================= */
  if (selectedModel) {
    const isVideo = selectedModel.category === 'video';
    const isText = selectedModel.category === 'text';

    return (
      <div className="studio-page-wrapper">
        {/* 1. Верхняя панель навигации студии */}
        <header className="studio-top-bar">
          <button 
            className="studio-back-btn" 
            onClick={() => setSelectedModel(null)}
            aria-label="Назад к каталогу"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="studio-title-badge">
            <span className="studio-model-name">{selectedVersion ? selectedVersion.name : selectedModel.name}</span>
          </div>

          <div className="balance-capsule" onClick={() => setShowRechargeModal(true)}>
            <div className="balance-info">
              <div className="credit-token-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 12L12 22L22 12L12 2Z" stroke="#e5b95c" strokeWidth="2.4" strokeLinejoin="round" fill="rgba(229, 185, 92, 0.25)" />
                  <path d="M12 6L6 12L12 18L18 12L12 6Z" stroke="#e5b95c" strokeWidth="1.5" />
                </svg>
              </div>
              <span className="balance-amount">{balance}</span>
            </div>
            <button className="balance-add-btn">
              <Plus size={12} strokeWidth={3} />
            </button>
          </div>
        </header>

        {/* 2. ИНТЕРАКТИВНЫЙ ЖИВОЙ ХОЛСТ */}
        <div className="interactive-canvas-stage">
          {generatedResult ? (
            <div className="studio-result-container">
              {generatedResult.type === 'text' ? (
                <div className="studio-text-result-box">
                  <div className="text-result-header">
                    <span className="text-result-model">
                      <Sparkles size={14} color="var(--color-accent)" />
                      {generatedResult.model} • {generatedResult.version}
                    </span>
                    <button 
                      className="text-copy-action-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedResult.text);
                        setCopiedResult(true);
                        setTimeout(() => setCopiedResult(false), 2000);
                        showToast('Текст скопирован в буфер!', 'success');
                      }}
                    >
                      {copiedResult ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                      <span>{copiedResult ? 'Скопировано' : 'Копировать'}</span>
                    </button>
                  </div>
                  <div className="text-result-content">
                    {generatedResult.text}
                  </div>
                  <div className="text-result-footer">
                    <button 
                      className="result-retry-btn"
                      onClick={() => setGeneratedResult(null)}
                    >
                      <RotateCcw size={13} />
                      <span>Создать ещё</span>
                    </button>
                  </div>
                </div>
              ) : generatedResult.type === 'video' ? (
                <div className="studio-media-result-box">
                  <video 
                    src={generatedResult.url} 
                    controls 
                    autoPlay 
                    loop 
                    playsInline 
                    className="studio-real-media"
                  />
                  <div className="media-result-actions">
                    <a 
                      href={generatedResult.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      download 
                      className="result-action-pill"
                    >
                      <Download size={14} />
                      <span>Скачать видео</span>
                    </a>
                    <button 
                      className="result-action-pill"
                      onClick={() => setGeneratedResult(null)}
                    >
                      <RotateCcw size={14} />
                      <span>Новый ролик</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="studio-media-result-box">
                  <img 
                    src={generatedResult.url} 
                    alt="Результат генерации" 
                    className="studio-real-media"
                  />
                  <div className="media-result-actions">
                    <a 
                      href={generatedResult.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      download 
                      className="result-action-pill"
                    >
                      <Download size={14} />
                      <span>Скачать фото</span>
                    </a>
                    <button 
                      className="result-action-pill"
                      onClick={() => setGeneratedResult(null)}
                    >
                      <RotateCcw size={14} />
                      <span>Новое фото</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : isPolling ? (
            <div className="studio-polling-box">
              <div className="spinner-large" />
              <p className="polling-main-text">{pollingStatusText}</p>
              <span className="polling-sub-text">Нейросеть рендерит ваш запрос в высоком качестве</span>
            </div>
          ) : (
            <div 
              className={`live-frame-box ratio-${selectedRatio.replace(':', '-')}`}
            >
              <div className="canvas-grid-overlay" />
              
              {/* Верхний бейдж формата */}
              <div className="canvas-top-tag">
                {isVideo ? <Film size={12} color="#e5b95c" /> : isText ? <FileText size={12} color="#e5b95c" /> : <Camera size={12} color="#e5b95c" />}
                <span>Живой холст: {isText ? 'Текст' : selectedRatio}</span>
              </div>

              {/* Фирменный логотип модели */}
              <div className="canvas-center-brand">
                <div className="canvas-brand-icon">
                  {isVideo ? <Play size={24} fill="currentColor" color="#e5b95c" /> : isText ? <FileText size={24} color="#e5b95c" /> : <Camera size={24} color="#e5b95c" />}
                </div>
                <h4 className="canvas-brand-name">{selectedVersion ? selectedVersion.name : selectedModel.name}</h4>
                <p className="canvas-brand-desc">{selectedModel.desc}</p>
              </div>

              {/* Нижний бейдж параметров */}
              <div className="canvas-bottom-tag">
                {isVideo ? (
                  <span>
                    {cameraMotion === 'static' 
                      ? 'Статичная камера' 
                      : cameraMotion === 'zoom' 
                      ? 'Приближение (Zoom)' 
                      : cameraMotion === 'orbit' 
                      ? 'Круговой облет 360°' 
                      : 'Панорама'} • {selectedModel.allowDurationChoice ? `${videoDuration} сек` : '6 сек'}
                  </span>
                ) : (
                  <span>{selectedVersion ? selectedVersion.name : selectedModel.name} • Студия</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. УРОВЕНЬ МОЩНОСТИ НЕЙРОСЕТИ (ДОСТУПЕН ДЛЯ ВСЕХ МОДЕЛЕЙ: МАКС / СТАНДАРТ / ЛАЙТ) */}
        {selectedModel.versions && selectedModel.versions.length > 0 && (
          <div className="studio-section">
            <div className="section-label-row">
              <label className="studio-section-label">Уровень модели</label>
              <span className="char-counter" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                {selectedVersion?.tierLabel || 'Выбор уровня'}
              </span>
            </div>
            <div className="tier-pills-row" style={{ gridTemplateColumns: `repeat(${selectedModel.versions.length}, 1fr)` }}>
              {selectedModel.versions.map((ver) => {
                const isHigh = ver.tier === 'high' || ver.name.toLowerCase().includes('ultra') || ver.name.toLowerCase().includes('3.0') || ver.name.toLowerCase().includes('4.0') || ver.name.toLowerCase().includes('pro');
                const isLite = ver.tier === 'lite' || ver.name.toLowerCase().includes('lite') || ver.name.toLowerCase().includes('fast') || ver.name.toLowerCase().includes('mini') || ver.name.toLowerCase().includes('schnell');
                const tierIcon = isHigh ? '🔥' : isLite ? '⚡' : '✨';
                const tierText = ver.tierLabel || (isHigh ? 'Максимум' : isLite ? 'Лайт' : 'Стандарт');

                return (
                  <button 
                    key={ver.id || ver.name}
                    className={`tier-pill ${selectedVersion?.id === ver.id ? 'active' : ''}`}
                    onClick={() => setSelectedVersion(ver)}
                  >
                    <span className="tier-badge" style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '2px 5px',
                      borderRadius: '4px',
                      marginBottom: '2px',
                      background: isHigh ? 'rgba(239, 68, 68, 0.2)' : isLite ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                      color: isHigh ? '#f87171' : isLite ? '#4ade80' : '#facc15'
                    }}>
                      {tierIcon} {tierText}
                    </span>
                    <span className="tier-name">{ver.name}</span>
                    <span className="tier-cost">{ver.cost} CR</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. НАСТРОЙКИ В ЗАВИСИМОСТИ ОТ ТИПА НЕЙРОСЕТИ */}
        {/* А. Для ВИДЕО-нейросетей */}
        {isVideo && (
          <>
            {/* Длительность видео: для Seedance выбор 6 / 10 / 15 сек, для остальных — строго 6 сек */}
            <div className="studio-section">
              <div className="section-label-row">
                <label className="studio-section-label">
                  {selectedModel.allowDurationChoice ? 'Длительность видео' : 'Длительность'}
                </label>
                {selectedModel.allowDurationChoice && (
                  <span className="char-counter" style={{ color: 'var(--color-accent)' }}>
                    Выбор доступен
                  </span>
                )}
              </div>
              {selectedModel.allowDurationChoice ? (
                <div className="tier-pills-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {(selectedModel.durationOptions || [6, 10, 15]).map((dur) => (
                    <button
                      key={dur}
                      className={`tier-pill ${videoDuration === dur ? 'active' : ''}`}
                      onClick={() => setVideoDuration(dur)}
                    >
                      <span className="tier-name">{dur} сек</span>
                      <span className="tier-cost">
                        {dur === 6 ? 'Базовое' : dur === 10 ? 'Оптимум' : 'Максимум'}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="fixed-duration-pill">
                  <Clock size={16} color="#e5b95c" />
                  <span className="duration-fixed-text">6 секунд</span>
                  <span className="duration-fixed-note">Стандарт для {selectedModel.name}</span>
                </div>
              )}
            </div>

            {/* Движение камеры */}
            <div className="studio-section">
              <label className="studio-section-label">Движение камеры</label>
              <div className="tier-pills-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <button 
                  className={`tier-pill ${cameraMotion === 'static' ? 'active' : ''}`}
                  onClick={() => setCameraMotion('static')}
                >
                  <span className="tier-name">Без движения</span>
                  <span className="tier-cost">Статичная камера</span>
                </button>
                <button 
                  className={`tier-pill ${cameraMotion === 'zoom' ? 'active' : ''}`}
                  onClick={() => setCameraMotion('zoom')}
                >
                  <span className="tier-name">Приближение</span>
                  <span className="tier-cost">Zoom In</span>
                </button>
                <button 
                  className={`tier-pill ${cameraMotion === 'orbit' ? 'active' : ''}`}
                  onClick={() => setCameraMotion('orbit')}
                >
                  <span className="tier-name">Круговой облет</span>
                  <span className="tier-cost">Вращение 360°</span>
                </button>
                <button 
                  className={`tier-pill ${cameraMotion === 'pan' ? 'active' : ''}`}
                  onClick={() => setCameraMotion('pan')}
                >
                  <span className="tier-name">Панорама</span>
                  <span className="tier-cost">Сдвиг вбок</span>
                </button>
              </div>
            </div>

            {/* Пропорции видео */}
            <div className="studio-section">
              <label className="studio-section-label">Пропорции видео</label>
              <div className="tier-pills-row">
                <button 
                  className={`tier-pill ${selectedRatio === '9:16' ? 'active' : ''}`}
                  onClick={() => setSelectedRatio('9:16')}
                >
                  <span className="tier-name">9:16</span>
                  <span className="tier-cost">Reels / Shorts</span>
                </button>
                <button 
                  className={`tier-pill ${selectedRatio === '16:9' ? 'active' : ''}`}
                  onClick={() => setSelectedRatio('16:9')}
                >
                  <span className="tier-name">16:9</span>
                  <span className="tier-cost">Горизонт</span>
                </button>
                <button 
                  className={`tier-pill ${selectedRatio === '1:1' ? 'active' : ''}`}
                  onClick={() => setSelectedRatio('1:1')}
                >
                  <span className="tier-name">1:1</span>
                  <span className="tier-cost">Квадрат</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Б. Для ФОТО-нейросетей */}
        {!isVideo && !isText && (
          <div className="studio-section">
            <label className="studio-section-label">Пропорции кадра</label>
            <div className="tier-pills-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <button 
                className={`tier-pill ${selectedRatio === '9:16' ? 'active' : ''}`}
                onClick={() => setSelectedRatio('9:16')}
              >
                <span className="tier-name">9:16</span>
                <span className="tier-cost">Reels</span>
              </button>
              <button 
                className={`tier-pill ${selectedRatio === '1:1' ? 'active' : ''}`}
                onClick={() => setSelectedRatio('1:1')}
              >
                <span className="tier-name">1:1</span>
                <span className="tier-cost">Аватар</span>
              </button>
              <button 
                className={`tier-pill ${selectedRatio === '16:9' ? 'active' : ''}`}
                onClick={() => setSelectedRatio('16:9')}
              >
                <span className="tier-name">16:9</span>
                <span className="tier-cost">Кино</span>
              </button>
              <button 
                className={`tier-pill ${selectedRatio === '4:5' ? 'active' : ''}`}
                onClick={() => setSelectedRatio('4:5')}
              >
                <span className="tier-name">4:5</span>
                <span className="tier-cost">Пост</span>
              </button>
            </div>
          </div>
        )}

        {/* Референсы или лица (до 10 фото) — для Фото и Видео нейросетей */}
        {!isText && (
          <div className="studio-section">
            <div className="section-label-row">
              <label className="studio-section-label">Референс или лицо (до 10 фото)</label>
              {referenceImages.length > 0 && (
                <span className="char-counter">{referenceImages.length} из 10 фото</span>
              )}
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleUploadImages}
            />
            
            {referenceImages.length === 0 ? (
              <div className="upload-ref-dashed-box" onClick={() => fileInputRef.current?.click()}>
                <div className="upload-icon-circle">
                  <Camera size={18} color="#ffffff" />
                </div>
                <div className="upload-box-text">
                  <span className="upload-main-title">Прикрепить фото или селфи</span>
                  <span className="upload-limit-badge">Загружайте до 10 фото</span>
                </div>
              </div>
            ) : (
              <div className="multi-ref-container">
                <div className="multi-ref-grid">
                  {referenceImages.map((imgUrl, idx) => (
                    <div key={idx} className="multi-ref-thumb-wrap">
                      <img src={imgUrl} alt={`Ref ${idx + 1}`} className="multi-ref-thumb" />
                      <span className="multi-ref-index">{idx + 1}</span>
                      <button 
                        type="button"
                        className="multi-ref-remove-btn" 
                        onClick={() => handleRemoveImage(idx)}
                        aria-label="Удалить фото"
                      >
                        <X size={10} strokeWidth={3} />
                      </button>
                    </div>
                  ))}

                  {referenceImages.length < 10 && (
                    <button 
                      type="button"
                      className="multi-ref-add-slot" 
                      onClick={() => fileInputRef.current?.click()}
                      title="Добавить еще фото"
                    >
                      <Plus size={18} />
                      <span>Еще фото</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* В. Для ТЕКСТОВЫХ нейросетей */}
        {isText && (
          <div className="studio-section">
            <label className="studio-section-label">Формат публикации</label>
            <div className="tier-pills-row">
              <button 
                className={`tier-pill ${textMode === 'reels' ? 'active' : ''}`}
                onClick={() => setTextMode('reels')}
              >
                <span className="tier-name">Reels</span>
                <span className="tier-cost">Сценарий</span>
              </button>
              <button 
                className={`tier-pill ${textMode === 'post' ? 'active' : ''}`}
                onClick={() => setTextMode('post')}
              >
                <span className="tier-name">Пост</span>
                <span className="tier-cost">Instagram/TG</span>
              </button>
              <button 
                className={`tier-pill ${textMode === 'script' ? 'active' : ''}`}
                onClick={() => setTextMode('script')}
              >
                <span className="tier-name">Статья</span>
                <span className="tier-cost">Лонгрид</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. ПОЛЕ ОПИСАНИЯ СЮЖЕТА / ИДЕИ */}
        <div className="studio-section">
          <div className="section-label-row">
            <label className="studio-section-label">{isVideo ? 'Сюжет сцены' : 'Описание шедевра'}</label>
            <span className="char-counter">{userPrompt.length} знаков</span>
          </div>

          <div className="pro-textarea-container">
            <textarea 
              className="pro-textarea"
              placeholder={
                isVideo 
                  ? 'Опишите действие, движение камеры и персонажей...' 
                  : isText
                  ? 'Опишите тему статьи, целевую аудиторию и ключевой посыл...'
                  : 'Опишите, что хотите увидеть на картине...'
              }
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* 6. ФИКСИРОВАННЫЙ НИЖНИЙ ДОК С КНОПКОЙ СТАРТА */}
        <div className="studio-fixed-action-dock">
          <button 
            className="btn-primary studio-generate-btn"
            onClick={handleStartGeneration}
            disabled={isGenerating || generationSuccess || !userPrompt.trim()}
          >
            {isGenerating ? (
              <>
                <div className="spinner-mini" />
                <span>Создание шедевра...</span>
              </>
            ) : generationSuccess ? (
              <>
                <Check size={18} color="#4ade80" />
                <span style={{ color: '#4ade80' }}>Шедевр готов! Сохранен в профиль</span>
              </>
            ) : (
              <>
                {isVideo ? <Play size={16} fill="currentColor" /> : <Sparkles size={16} />}
                <span>
                  {isVideo ? `Сгенерировать видео (${currentCost} CR)` : isText ? `Создать текст (${currentCost} CR)` : `Сгенерировать шедевр (${currentCost} CR)`}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Модалка пополнения кредитов из студии */}
        {showRechargeModal && (
          <div className="modal-backdrop" onClick={() => setShowRechargeModal(false)}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-header">
                <div className="sheet-title-info">
                  <h3>{t('rechargeModalCredits')}</h3>
                  <span className="sheet-subtitle">{t('currentBalance', { balance })}</span>
                </div>
                <button className="sheet-close-btn" onClick={() => setShowRechargeModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="credit-packages">
                <div className="credit-pkg-card" onClick={() => { setBalance(balance + 100); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 100 }), 'token'); }}>
                  <div className="pkg-left">
                    <span className="pkg-amount">100 CR</span>
                    <span className="pkg-desc">{t('pkgStoriesPhotos')}</span>
                  </div>
                  <button className="pkg-price-btn">199 ₽</button>
                </div>

                <div className="credit-pkg-card popular" onClick={() => { setBalance(balance + 350); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 350 }), 'token'); }}>
                  <span className="pkg-badge">{t('pkgHitBonus')}</span>
                  <div className="pkg-left">
                    <span className="pkg-amount">350 CR</span>
                    <span className="pkg-desc">{t('pkgOptimalSet')}</span>
                  </div>
                  <button className="pkg-price-btn accent">490 ₽</button>
                </div>

                <div className="credit-pkg-card" onClick={() => { setBalance(balance + 1250); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 1250 }), 'token'); }}>
                  <span className="pkg-badge vip">{t('pkgVipBonus')}</span>
                  <div className="pkg-left">
                    <span className="pkg-amount">1250 CR</span>
                    <span className="pkg-desc">{t('pkgMaxVideo')}</span>
                  </div>
                  <button className="pkg-price-btn">1 290 ₽</button>
                </div>
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '14px' }}>
                {t('paymentMethodsHint')}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* =========================================================
     ГЛАВНЫЙ СПИСОК РАЗДЕЛА "СОЗДАТЬ" (КАТАЛОГ НЕЙРОСЕТЕЙ)
     ========================================================= */
  return (
    <div className="create-page-wrapper">
      {/* Шапка раздела Создать */}
      <div className="create-header-block">
        <div className="create-title-row">
          <h1 className="create-title">{t('createTitle')}</h1>
          
          {/* Капсула баланса кредитов с кнопкой пополнения */}
          <div className="balance-capsule" onClick={() => setShowRechargeModal(true)}>
            <div className="balance-info">
              <div className="credit-token-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 12L12 22L22 12L12 2Z" stroke="#e5b95c" strokeWidth="2.4" strokeLinejoin="round" fill="rgba(229, 185, 92, 0.25)" />
                  <path d="M12 6L6 12L12 18L18 12L12 6Z" stroke="#e5b95c" strokeWidth="1.5" />
                </svg>
              </div>
              <span className="balance-amount">{balance}</span>
            </div>

            <button 
              className="balance-add-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowRechargeModal(true);
              }}
            >
              <Plus size={13} strokeWidth={3} />
              <span>{t('topUp')}</span>
            </button>
          </div>
        </div>
        <p className="create-subtitle">{t('createSubtitle')}</p>

        {/* Минималистичная строка поиска */}
        <div className="create-search-bar">
          <Search size={16} className="create-search-icon" />
          <input 
            type="text"
            className="create-search-input"
            placeholder={t('createSearchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="create-search-clear" 
              onClick={() => setSearchQuery('')}
              aria-label="Очистить"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Вкладки категорий: Видео (1) -> Фото (2) -> Все (3) -> Текст (на последнем месте) */}
        <div className="create-category-tabs">
          <button 
            className={`create-tab-btn ${activeCategory === 'video' ? 'active' : ''}`}
            onClick={() => setActiveCategory('video')}
          >
            <Play size={12} fill="currentColor" />
            <span>{t('video')}</span>
          </button>

          <button 
            className={`create-tab-btn ${activeCategory === 'photo' ? 'active' : ''}`}
            onClick={() => setActiveCategory('photo')}
          >
            <Camera size={13} />
            <span>{t('photo')}</span>
          </button>

          <button 
            className={`create-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <Sparkles size={13} />
            <span>{t('all')}</span>
          </button>

          <button 
            className={`create-tab-btn ${activeCategory === 'text' ? 'active' : ''}`}
            onClick={() => setActiveCategory('text')}
          >
            <FileText size={13} />
            <span>{t('text')}</span>
          </button>
        </div>
      </div>

      {/* Список моделей: разделенный по секциям Видео -> Фото -> Текст */}
      {activeCategory === 'all' && !searchQuery ? (
        <div className="all-models-grouped-wrap">
          {/* Секция 1: Видео модели */}
          <div className="models-category-group">
            <div className="category-group-header">
              <Play size={15} fill="currentColor" color="var(--color-accent)" />
              <h3>Генерация видео</h3>
              <span className="category-group-count">{models.filter(m => m.category === 'video').length}</span>
            </div>
            <div className="create-models-list">
              {models.filter(m => m.category === 'video').map((model) => (
                <div 
                  key={model.id}
                  className="create-model-card"
                  onClick={() => handleOpenModel(model)}
                >
                  <div className="model-thumb-box" style={{ backgroundImage: `url(${model.preview})` }}>
                    <span className="model-cat-icon">
                      <Play size={10} fill="#ffffff" />
                    </span>
                  </div>
                  <div className="model-info-col">
                    <div className="model-title-row">
                      <span className="model-name">{model.name}</span>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        color: 'var(--color-accent)',
                        background: 'rgba(229, 185, 92, 0.12)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginLeft: '6px'
                      }}>
                        3 уровня
                      </span>
                    </div>
                    <div className="model-tags-row">
                      {model.tags && model.tags.map((tag, i) => (
                        <span key={i} className="model-tag-pill">{translateDynamic(tag)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="model-action-col">
                    <span className="model-cost-pill">
                      <span>{model.cost}</span>
                      <span className="cost-cr">CR</span>
                    </span>
                    <ChevronRight size={18} className="model-arrow-icon" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Секция 2: Фото модели и Face Swap */}
          <div className="models-category-group">
            <div className="category-group-header">
              <Camera size={15} color="var(--color-accent)" />
              <h3>Генерация фото & Face Swap</h3>
              <span className="category-group-count">{models.filter(m => m.category === 'photo').length}</span>
            </div>
            <div className="create-models-list">
              {models.filter(m => m.category === 'photo').map((model) => (
                <div 
                  key={model.id}
                  className="create-model-card"
                  onClick={() => handleOpenModel(model)}
                >
                  <div className="model-thumb-box" style={{ backgroundImage: `url(${model.preview})` }}>
                    <span className="model-cat-icon">
                      <Camera size={10} />
                    </span>
                  </div>
                  <div className="model-info-col">
                    <div className="model-title-row">
                      <span className="model-name">{model.name}</span>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        color: 'var(--color-accent)',
                        background: 'rgba(229, 185, 92, 0.12)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginLeft: '6px'
                      }}>
                        3 уровня
                      </span>
                    </div>
                    <div className="model-tags-row">
                      {model.tags && model.tags.map((tag, i) => (
                        <span key={i} className="model-tag-pill">{translateDynamic(tag)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="model-action-col">
                    <span className="model-cost-pill">
                      <span>{model.cost}</span>
                      <span className="cost-cr">CR</span>
                    </span>
                    <ChevronRight size={18} className="model-arrow-icon" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Секция 3: Текстовые модели (последнее место) */}
          <div className="models-category-group">
            <div className="category-group-header">
              <FileText size={15} color="var(--color-accent)" />
              <h3>Текстовые ИИ</h3>
              <span className="category-group-count">{models.filter(m => m.category === 'text').length}</span>
            </div>
            <div className="create-models-list">
              {models.filter(m => m.category === 'text').map((model) => (
                <div 
                  key={model.id}
                  className="create-model-card"
                  onClick={() => handleOpenModel(model)}
                >
                  <div className="model-thumb-box" style={{ backgroundImage: `url(${model.preview})` }}>
                    <span className="model-cat-icon">
                      <FileText size={10} />
                    </span>
                  </div>
                  <div className="model-info-col">
                    <div className="model-title-row">
                      <span className="model-name">{model.name}</span>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        color: 'var(--color-accent)',
                        background: 'rgba(229, 185, 92, 0.12)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginLeft: '6px'
                      }}>
                        3 уровня
                      </span>
                    </div>
                    <div className="model-tags-row">
                      {model.tags && model.tags.map((tag, i) => (
                        <span key={i} className="model-tag-pill">{translateDynamic(tag)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="model-action-col">
                    <span className="model-cost-pill">
                      <span>{model.cost}</span>
                      <span className="cost-cr">CR</span>
                    </span>
                    <ChevronRight size={18} className="model-arrow-icon" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="create-models-list">
          {filteredModels.length > 0 ? (
            filteredModels.map((model) => (
              <div 
                key={model.id}
                className="create-model-card"
                onClick={() => handleOpenModel(model)}
              >
                <div 
                  className="model-thumb-box"
                  style={{ backgroundImage: `url(${model.preview})` }}
                >
                  <span className="model-cat-icon">
                    {model.category === 'video' ? (
                      <Play size={10} fill="#ffffff" />
                    ) : model.category === 'photo' ? (
                      <Camera size={10} />
                    ) : (
                      <FileText size={10} />
                    )}
                  </span>
                </div>

                <div className="model-info-col">
                  <div className="model-title-row">
                    <span className="model-name">{model.name}</span>
                    {model.versions && model.versions.length > 0 && (
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        color: 'var(--color-accent)',
                        background: 'rgba(229, 185, 92, 0.12)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginLeft: '6px'
                      }}>
                        3 уровня
                      </span>
                    )}
                  </div>

                  <div className="model-tags-row">
                    {model.tags && model.tags.map((tag, i) => (
                      <span key={i} className="model-tag-pill">{translateDynamic(tag)}</span>
                    ))}
                  </div>
                </div>

                <div className="model-action-col">
                  <span className="model-cost-pill">
                    <span>{model.cost}</span>
                    <span className="cost-cr">CR</span>
                  </span>
                  <ChevronRight size={18} className="model-arrow-icon" />
                </div>
              </div>
            ))
          ) : (
            <div className="create-empty-state">
              <Search size={32} color="var(--color-primary-light)" />
              <h4>{t('noModelsFound')}</h4>
              <p>По запросу «{searchQuery}» ничего не найдено</p>
              <button 
                className="btn-primary"
                style={{ marginTop: '12px', padding: '10px 20px', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem' }}
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('video');
                }}
              >
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>
      )}

      {/* Модалка пополнения баланса */}
      {showRechargeModal && (
        <div className="modal-backdrop" onClick={() => setShowRechargeModal(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div className="sheet-title-info">
                <h3>{t('rechargeModalCredits')}</h3>
                <span className="sheet-subtitle">{t('currentBalance', { balance })}</span>
              </div>
              <button className="sheet-close-btn" onClick={() => setShowRechargeModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="credit-packages">
              <div className="credit-pkg-card" onClick={() => { setBalance(balance + 100); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 100 }), 'token'); }}>
                <div className="pkg-left">
                  <span className="pkg-amount">100 CR</span>
                  <span className="pkg-desc">{t('pkgStoriesPhotos')}</span>
                </div>
                <button className="pkg-price-btn">199 ₽</button>
              </div>

              <div className="credit-pkg-card popular" onClick={() => { setBalance(balance + 350); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 350 }), 'token'); }}>
                <span className="pkg-badge">{t('pkgHitBonus')}</span>
                <div className="pkg-left">
                  <span className="pkg-amount">350 CR</span>
                  <span className="pkg-desc">{t('pkgOptimalSet')}</span>
                </div>
                <button className="pkg-price-btn accent">490 ₽</button>
              </div>

              <div className="credit-pkg-card" onClick={() => { setBalance(balance + 1250); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 1250 }), 'token'); }}>
                <span className="pkg-badge vip">{t('pkgVipBonus')}</span>
                <div className="pkg-left">
                  <span className="pkg-amount">1250 CR</span>
                  <span className="pkg-desc">{t('pkgMaxVideo')}</span>
                </div>
                <button className="pkg-price-btn">1 290 ₽</button>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '14px' }}>
              {t('paymentMethodsHint')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Create;
