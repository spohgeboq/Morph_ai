import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import { useLanguage } from '../components/LanguageContext';
import { useCurrency } from '../components/CurrencyContext';
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
  RotateCcw,
  BookOpen
} from 'lucide-react';

// База данных моделей MorphAI (синхронизирована с бэкендом: Видео -> Фото -> Текст)
export const AI_MODELS_DB = [
  // ==================== 1. ВИДЕО МОДЕЛИ (ПЕРВОЕ МЕСТО) ====================
  {
    id: 'kling-hd',
    name: 'Kling AI',
    category: 'video',
    preview: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    tags: ['1080p', 'Кино'],
    desc: 'Плавные кинематографичные видео и анимация персонажей',
    cost: 12,
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'kling-ultra', name: 'Kling 3.0', cost: 16 },
      { id: 'kling-std', name: 'Kling 1.5 HD', cost: 12 },
      { id: 'kling-lite', name: 'Kling Fast', cost: 8 },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Неоновый киберпанк спорткар мчит по ночному Токио под дождем',
      'Плавный пролет камеры над океанскими скалами'
    ]
  },
  {
    id: 'hailuo',
    name: 'Hailuo',
    category: 'video',
    preview: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    tags: ['Реализм', 'HD'],
    desc: 'Генерация сверхреалистичных сцен с естественной физикой людей и природы',
    cost: 14,
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'hailuo-ultra', name: 'Hailuo H3', cost: 16 },
      { id: 'hailuo-std', name: 'Hailuo H2', cost: 13 },
      { id: 'hailuo-lite', name: 'Hailuo Lite', cost: 9 },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Девушка улыбается и поправляет волосы на ветру в цветущем поле',
      'Золотой орел парит над горным хребтом в лучах утреннего солнца'
    ]
  },
  {
    id: 'runway-gen4',
    name: 'GenAi',
    category: 'video',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['VFX Кино', 'Slow-Mo'],
    desc: 'Голливудские спецэффекты и кинематографичное slow-motion',
    cost: 16,
    defaultDuration: 6,
    allowDurationChoice: false,
    versions: [
      { id: 'runway-ultra', name: 'Runway Gen-4', cost: 18 },
      { id: 'runway-std', name: 'Runway Gen-4 Turbo', cost: 15 },
      { id: 'runway-lite', name: 'Runway Gen-3', cost: 10 },
    ],
    aspectRatios: ['16:9', '9:16'],
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
    tags: ['6–15 сек', 'Анимация'],
    desc: 'Передовая видеомодель с выбором длительности генерации (6, 10 или 15 сек)',
    cost: 12,
    defaultDuration: 6,
    allowDurationChoice: true,
    durationOptions: [6, 10, 15],
    versions: [
      { id: 'seedance-ultra', name: 'Seedance 2.5', cost: 16 },
      { id: 'seedance-std', name: 'Seedance 2.0', cost: 12 },
      { id: 'seedance-lite', name: 'Seedance Lite', cost: 8 },
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Красочный танец в неоновом дожде под электронную музыку',
      'Анимированная сцена превращения бабочки в созвездие звезд'
    ]
  },
  {
    id: 'veo-3-1',
    name: 'Veo 3.1',
    category: 'video',
    preview: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80',
    tags: ['Google DeepMind', '4K Кино'],
    desc: 'Передовая кинематографичная видеомодель от Google с высокой детализацией',
    cost: 16,
    defaultDuration: 4,
    allowDurationChoice: false,
    versions: [
      { id: 'veo-ultra', name: 'Veo 3.1 Pro', cost: 18 },
      { id: 'veo-std', name: 'Veo 3.1 Standard', cost: 16 },
      { id: 'veo-lite', name: 'Veo 3.1 Fast', cost: 12 },
    ],
    aspectRatios: ['16:9', '9:16'],
    samplePrompts: [
      'Человек идет по пляжу в ветреную погоду, золотой закат, кинематографичный свет',
      'Замедленный кинематографичный пролет камеры над неоновым мегаполисом'
    ]
  },

  // ==================== 2. ФОТО МОДЕЛИ & FACE SWAP ====================
  {
    id: 'flux-pro',
    name: 'Flux',
    category: 'photo',
    preview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    tags: ['8K Фото', 'Портрет'],
    desc: 'Гиперреалистичные портреты и фото студийного качества',
    cost: 10,
    versions: [
      { id: 'flux-ultra', name: 'Flux 1.1 Pro', cost: 12 },
      { id: 'flux-std', name: 'Flux Dev', cost: 8 },
      { id: 'flux-lite', name: 'Flux Schnell', cost: 5 },
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
    tags: ['Замена лица', '4K'],
    desc: 'Высокоточная замена лица на фото и шаблонах с сохранением мимики',
    cost: 10,
    versions: [
      { id: 'fs-ultra', name: 'Face Swap Ultra 4K', cost: 14 },
      { id: 'fs-std', name: 'Face Swap HD', cost: 10 },
      { id: 'fs-lite', name: 'Face Swap Lite', cost: 6 },
    ],
    aspectRatios: ['1:1', '9:16', '16:9'],
    samplePrompts: [
      'Замена лица на портрете в вечернем стиле',
      'Создание фотореалистичного аватара'
    ]
  },
  {
    id: 'gpt-image',
    name: 'GPT Image',
    category: 'photo',
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    tags: ['OpenAI', 'Фотореализм'],
    desc: 'Новейшая генерация фотореалистичных изображений студийного качества и сложных композиций',
    cost: 10,
    versions: [
      { id: 'gpt-image-ultra', name: 'GPT Image 2', cost: 12 },
      { id: 'gpt-image-std', name: 'GPT Image 1.5', cost: 8 },
      { id: 'gpt-image-lite', name: 'GPT Image 1', cost: 5 },
    ],
    aspectRatios: ['1:1', '16:9', '9:16', '4:5'],
    samplePrompts: [
      'Рекламное фото вязаного кардигана на хромированном стуле в мягком студийном свете',
      'Эстетичный студийный портрет крупным планом с мягким кинематографичным светом'
    ]
  },
  {
    id: 'nano-banana',
    name: 'Nano Banana',
    category: 'photo',
    preview: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    tags: ['Эксклюзив', 'Digital'],
    desc: 'Креативная генерация ярких digital-артов и дизайн-иллюстраций',
    cost: 8,
    versions: [
      { id: 'nano-ultra', name: 'Nano Banana 2', cost: 10 },
      { id: 'nano-std', name: 'Nano Banana 1 Pro', cost: 8 },
      { id: 'nano-lite', name: 'Nano Banana 1', cost: 5 },
    ],
    aspectRatios: ['1:1', '9:16', '16:9', '4:5'],
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
    tags: ['3D Аватар', 'Турбо'],
    desc: 'Сверхбыстрая генерация концепт-артов и мультяшных аватаров',
    cost: 6,
    versions: [
      { id: 'sd-ultra', name: 'Seedream 5.0 Pro', cost: 8 },
      { id: 'sd-std', name: 'Seedream 5.0 Lite', cost: 6 },
      { id: 'sd-lite', name: 'Seedream 4.0', cost: 4 },
    ],
    aspectRatios: ['1:1', '9:16', '16:9'],
    samplePrompts: [
      '3D персонаж в стиле Pixar, выразительная мимика',
      'Киберпанк самурай в неоновых доспехах'
    ]
  },

  // ==================== 3. ИИ-СКАЗИТЕЛИ И МАСТЕРА ИСТОРИЙ ====================
  {
    id: 'gpt-4o',
    name: 'GPT Сказки',
    roleTitle: 'Сказки',
    category: 'text',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['Сказки', 'Притчи'],
    desc: 'Добрые сказки на ночь, волшебные миры и поучительные притчи со смыслом',
    cost: 3,
    versions: [
      { id: 'gpt-4o-ultra', name: 'GPT-4o', cost: 4 },
      { id: 'gpt-4o-std', name: 'GPT-4o Standard', cost: 3 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', cost: 1 },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Сказка о маленьком маячнике, который зажигал упавшие звезды',
      'Добрая притча о старинных часах, считавших только счастливые мгновения'
    ]
  },
  {
    id: 'claude-sonnet',
    name: 'Claude Мистика',
    roleTitle: 'Мистика',
    category: 'text',
    preview: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    tags: ['Мистика', 'Тайны'],
    desc: 'Загадочные мистические истории, городские легенды, саспенс и детективные тайны',
    cost: 3,
    versions: [
      { id: 'claude-ultra', name: 'Claude Sonnet', cost: 4 },
      { id: 'claude-std', name: 'Claude Haiku', cost: 2 },
      { id: 'claude-lite', name: 'Claude Fast', cost: 1 },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Тайна заброшенной станции метро, куда поезда приходят лишь в полнолуние',
      'История старинного антикварного зеркала, отражающего события прошлого'
    ]
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Sci-Fi',
    roleTitle: 'Sci-Fi',
    category: 'text',
    preview: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    tags: ['Космос', 'Sci-Fi'],
    desc: 'Научно-фантастические саги, киберпанк, космические одиссеи и хроники далеких миров',
    cost: 2,
    versions: [
      { id: 'gemini-3-flash', name: 'Gemini 3 Flash', cost: 3 },
      { id: 'gemini-35-flash-lite', name: 'Gemini 3.5 Flash Lite', cost: 2 },
      { id: 'gemini-25-flash', name: 'Gemini 2.5 Flash', cost: 1 },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Хроника экспедиции к мыслящему кристаллическому океану на краю галактики',
      'История андроида-музыканта в неоновом киберпанк-мегаполисе 2180 года'
    ]
  },
  {
    id: 'llama-3',
    name: 'Llama Эпос',
    roleTitle: 'Эпос',
    category: 'text',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['Приключения', 'Эпос'],
    desc: 'Захватывающие странствия, поиск сокровищ, древние воины и рыцарские романы',
    cost: 1,
    versions: [
      { id: 'llama-ultra', name: 'Llama 3.3 70B', cost: 2 },
      { id: 'llama-std', name: 'Llama 3 70B', cost: 1 },
      { id: 'llama-lite', name: 'Llama 3 8B', cost: 1 },
    ],
    aspectRatios: [],
    samplePrompts: [
      'Опасная экспедиция за затерянным золотым компасом в сердце древних джунглей',
      'Легенда о рыцаре, давшем клятву защитить последнее Древо Света'
    ]
  },
];

export const getModelFallback = (category) => {
  if (category === 'video') return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
  if (category === 'text') return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80';
  return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
};

const Create = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t, translateDynamic } = useLanguage();
  const { formatPrice } = useCurrency();
  const { currentUser, balance, setBalance, refreshUser } = useUser();

  const [models, setModels] = useState(AI_MODELS_DB);
  // Видео — на первом месте по умолчанию
  const [activeCategory, setActiveCategory] = useState('video'); // 'video' | 'photo' | 'text'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Выбранная модель для перехода в Студию
  const [selectedModel, setSelectedModel] = useState(null);

  // Параметры генератора
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [videoDuration, setVideoDuration] = useState(6);
  const [storyLength, setStoryLength] = useState('short'); // 'short' | 'long'
  const [characterName, setCharacterName] = useState('');
  const [referenceImages, setReferenceImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatusText, setPollingStatusText] = useState('');
  const [copiedResult, setCopiedResult] = useState(false);
  const fileInputRef = useRef(null);

  // Ссылки на секции каталога для плавного перехода
  const videoSectionRef = useRef(null);
  const photoSectionRef = useRef(null);
  const textSectionRef = useRef(null);

  const handleScrollToCategory = (cat) => {
    setActiveCategory(cat);
    if (cat === 'video') videoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else if (cat === 'photo') photoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else if (cat === 'text') textSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Синхронизация активной вкладки при скролле страницы
  useEffect(() => {
    if (selectedModel || searchQuery) return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      const textTop = textSectionRef.current ? textSectionRef.current.offsetTop : Infinity;
      const photoTop = photoSectionRef.current ? photoSectionRef.current.offsetTop : Infinity;

      if (scrollPos >= textTop) {
        setActiveCategory('text');
      } else if (scrollPos >= photoTop) {
        setActiveCategory('photo');
      } else {
        setActiveCategory('video');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedModel, searchQuery]);

  // Модалка пополнения
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Загружаем актуальный список моделей с бэкенда и объединяем с метаданными
  useEffect(() => {
    let isMounted = true;
    fetchModels().then((backendModels) => {
      if (!isMounted || !backendModels || backendModels.length === 0) return;

      setModels(prevModels => {
        const baseList = prevModels && prevModels.length > 0 ? prevModels : AI_MODELS_DB;
        const idAliases = {
          'gpt-tales': 'gpt-4o',
          'claude-mystic': 'claude-sonnet',
          'gemini-scifi': 'gemini-pro',
          'llama-epic': 'llama-3',
          'gpt-4o': 'gpt-tales',
          'claude-sonnet': 'claude-mystic',
          'gemini-pro': 'gemini-scifi',
          'llama-3': 'llama-epic',
          'veo3.1': 'veo-3-1',
          'veo-3.1': 'veo-3-1',
          'veo-3-1': 'veo3.1',
        };

        const merged = baseList
          .map(base => {
            const serverModel = backendModels.find(bm => 
              bm.id === base.id || 
              bm.id === idAliases[base.id] || 
              (bm.name && base.name && bm.name.toLowerCase().trim() === base.name.toLowerCase().trim())
            );
            if (!serverModel) return null;
            if (serverModel.is_active === false) return null;

            const finalCover = serverModel.preview_url || serverModel.preview || base.preview || getModelFallback(base.category);
            return {
              ...base,
              ...serverModel,
              id: serverModel.id || base.id,
              name: serverModel.name || base.name,
              preview: finalCover,
              preview_url: finalCover,
              desc: serverModel.description || serverModel.desc || base.desc,
              cost: serverModel.cost !== undefined ? serverModel.cost : base.cost,
              versions: (Array.isArray(serverModel.versions) && serverModel.versions.length > 0) ? serverModel.versions : base.versions,
              tags: (Array.isArray(serverModel.tags) && serverModel.tags.length > 0) ? serverModel.tags : base.tags,
              aspectRatios: base.aspectRatios || ['16:9', '9:16', '1:1'],
              samplePrompts: base.samplePrompts || [],
            };
          })
          .filter(Boolean);

        // Новые модели, добавленные через панель администратора
        const newFromServer = backendModels
          .filter(bm => bm.is_active !== false && !baseList.some(b => 
            b.id === bm.id || 
            b.id === idAliases[bm.id] || 
            (b.name && bm.name && b.name.toLowerCase().trim() === bm.name.toLowerCase().trim())
          ))
          .map(m => {
            const fallback = getModelFallback(m.category);
            const cover = m.preview_url || m.preview || fallback;
            return {
              ...m,
              preview: cover,
              preview_url: cover,
              desc: m.description || m.desc || '',
              aspectRatios: ['16:9', '9:16', '1:1'],
              samplePrompts: [],
            };
          });

        return [...merged, ...newFromServer];
      });
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
    } else if (location.state?.category) {
      setActiveCategory(location.state.category);
      setTimeout(() => {
        if (location.state.category === 'text') {
          textSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (location.state.category === 'photo') {
          photoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          videoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
    }
  }, [location.state, models]);

  // Фильтрация списка моделей для поиска
  const filteredModels = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return models;
    return models.filter(model => {
      return model.name.toLowerCase().includes(q) || 
        (model.desc && model.desc.toLowerCase().includes(q)) || 
        (model.tags && model.tags.some(t => t.toLowerCase().includes(q)));
    });
  }, [models, searchQuery]);

  // Открытие Студии для модели
  const handleOpenModel = (model) => {
    setSelectedModel(model);
    setSelectedVersion(model.versions?.[0] || null);
    setUserPrompt('');
    setCharacterName('');
    setSelectedRatio(model.aspectRatios?.[0] || '16:9');
    setVideoDuration(model.defaultDuration || 6);
    setStoryLength('short');
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
      const isText = selectedModel.category === 'text';
      const durationToSend = isVideo 
        ? (selectedModel.allowDurationChoice ? videoDuration : (selectedModel.defaultDuration || 6))
        : undefined;

      const res = await requestGeneration({
        telegram_id: currentUser?.telegram_id || currentUser?.id,
        model_id: selectedModel.id,
        version_id: selectedVersion?.id,
        prompt: userPrompt.trim(),
        params: {
          aspect_ratio: !isText ? selectedRatio : undefined,
          duration: durationToSend,
          story_length: isText ? storyLength : undefined,
          character_name: isText ? (characterName.trim() || undefined) : undefined,
          reference_images: referenceImages,
        },
      });

      // Обновляем реальный баланс с сервера
      if (res.balance !== undefined) {
        setBalance(res.balance);
      } else {
        setBalance(prev => Math.max(0, prev - currentCost));
      }

      // Создаем новую сессию для раздела "Чаты"
      const newChatSession = {
        id: 'chat_' + (res.task_id || Date.now()),
        title: userPrompt.trim().slice(0, 35) || 'Генерация',
        modelId: selectedModel.id,
        modelName: selectedModel.name,
        versionName: selectedVersion?.name || selectedModel.name,
        cost: currentCost,
        category: selectedModel.category,
        time: 'Только что',
        dateStr: 'Сегодня',
        preview: res.result?.url || null,
        taskId: res.task_id || null,
        isGenerating: !res.result?.text,
        messages: [
          {
            id: 'm_u_' + Date.now(),
            sender: 'user',
            text: userPrompt.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: 'm_a_' + Date.now(),
            sender: 'ai',
            type: selectedModel.category === 'video' ? 'video' : (selectedModel.category === 'text' ? 'text' : 'image'),
            prompt: userPrompt.trim(),
            taskId: res.task_id || null,
            mediaUrl: res.result?.url || null,
            text: res.result?.text || (selectedModel.category === 'video' ? 'Генерирую видео через нейросеть...' : (selectedModel.category === 'text' ? 'Сочиняю историю...' : 'Создаю изображение...')),
            status: res.result?.text ? 'completed' : 'pending',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]
      };

      // Сохраняем сессию в историю чатов
      try {
        const saved = localStorage.getItem('morphai_chats_history');
        const existing = saved ? JSON.parse(saved) : [];
        localStorage.setItem('morphai_chats_history', JSON.stringify([newChatSession, ...existing.filter(c => c.id !== newChatSession.id)]));
      } catch (e) {
        console.error('Save to chats error:', e);
      }

      showToast('Генерация запущена! Перенаправляем в чат...', 'success');
      refreshUser();

      // Немедленно перенаправляем пользователя в чат с этой ИИ-моделью!
      navigate('/chats', { state: { newChat: newChatSession, chatId: newChatSession.id } });
      return;
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
        <header className="studio-top-bar">
          <button className="studio-back-btn" onClick={() => setSelectedModel(null)}><ArrowLeft size={18} /></button>
          <div className="studio-title-badge"><span className="studio-model-name">{selectedVersion ? selectedVersion.name : selectedModel.name}</span></div>
          <div className="balance-capsule" onClick={() => setShowRechargeModal(true)}>
            <div className="balance-info"><span className="balance-amount">{balance}</span></div>
            <button className="balance-add-btn"><Plus size={12} strokeWidth={3} /></button>
          </div>
        </header>

        {isText ? (
          <div className="story-studio-hero">
            <div className="story-hero-badge"><BookOpen size={13} color="rgba(255, 255, 255, 0.85)" /><span>Литературный ИИ • {selectedModel.roleTitle || 'Мастер историй'}</span></div>
            <h2 className="story-hero-title">{selectedModel.name}</h2>
            <p className="story-hero-desc">{selectedModel.desc}</p>
          </div>
        ) : (
          <div className="interactive-canvas-stage">
            {generatedResult ? (
              <div className="studio-result-container">
                {generatedResult.type === 'video' ? (
                  <div className="studio-media-result-box">
                    <video src={generatedResult.url} controls autoPlay loop playsInline className="studio-real-media" />
                    <div className="media-result-actions">
                      <a href={generatedResult.url} target="_blank" rel="noreferrer" download className="result-action-pill"><Download size={14} /><span>Скачать видео</span></a>
                      <button className="result-action-pill" onClick={() => setGeneratedResult(null)}><RotateCcw size={14} /><span>Новый ролик</span></button>
                    </div>
                  </div>
                ) : (
                  <div className="studio-media-result-box">
                    <img src={generatedResult.url} alt="Результат генерации" className="studio-real-media" />
                    <div className="media-result-actions">
                      <a href={generatedResult.url} target="_blank" rel="noreferrer" download className="result-action-pill"><Download size={14} /><span>Скачать фото</span></a>
                      <button className="result-action-pill" onClick={() => setGeneratedResult(null)}><RotateCcw size={14} /><span>Новое фото</span></button>
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
              <div className={`live-frame-box ratio-${selectedRatio.replace(':', '-')}`}>
                <div className="canvas-grid-overlay" />
                <div className="canvas-top-tag">{isVideo ? <Film size={12} color="rgba(255, 255, 255, 0.85)" /> : <Camera size={12} color="rgba(255, 255, 255, 0.85)" />}<span>{selectedRatio}</span></div>
                <div className="canvas-center-brand">
                  <div className="canvas-brand-icon">{isVideo ? <Play size={20} fill="currentColor" color="rgba(255, 255, 255, 0.9)" /> : <Camera size={20} color="rgba(255, 255, 255, 0.9)" />}</div>
                  <h4 className="canvas-brand-name">{selectedVersion ? selectedVersion.name : selectedModel.name}</h4>
                </div>
                <div className="canvas-bottom-tag">{isVideo ? (<span>{selectedModel.allowDurationChoice ? `${videoDuration} сек` : '6 сек'} • Высокое качество</span>) : (<span>Студийное качество • 4K</span>)}</div>
              </div>
            )}
          </div>
        )}

        {selectedModel.versions && selectedModel.versions.length > 0 && (
          <div className="studio-section">
            <div className="section-label-row">
              <label className="studio-section-label">Версия модели</label>
              {selectedVersion && (
                <span className="char-counter">{selectedVersion.name}</span>
              )}
            </div>
            <div className="tier-pills-row" style={{ gridTemplateColumns: `repeat(${selectedModel.versions.length}, 1fr)` }}>
              {selectedModel.versions.map((ver) => (
                <button 
                  key={ver.id || ver.name} 
                  className={`tier-pill ${selectedVersion?.id === ver.id ? 'active' : ''}`} 
                  onClick={() => setSelectedVersion(ver)}
                >
                  <span className="tier-name">{ver.name}</span>
                  <span className="tier-cost">{ver.cost} CR</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isVideo && (
          <div className="studio-section">
            <div className="section-label-row">
              <label className="studio-section-label">{selectedModel.allowDurationChoice ? 'Длительность видео' : 'Длительность'}</label>
            </div>
            {selectedModel.allowDurationChoice ? (
              <div className="tier-pills-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {(selectedModel.durationOptions || [6, 10, 15]).map((dur) => (
                  <button key={dur} className={`tier-pill ${videoDuration === dur ? 'active' : ''}`} onClick={() => setVideoDuration(dur)}>
                    <span className="tier-name">{dur} сек</span>
                    <span className="tier-cost">{dur === 6 ? 'Базовое' : dur === 10 ? 'Оптимум' : 'Максимум'}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="fixed-duration-pill"><Clock size={16} color="rgba(255, 255, 255, 0.7)" /><span className="duration-fixed-text">6 секунд</span><span className="duration-fixed-note">Стандарт для {selectedModel.name}</span></div>
            )}
            <div className="studio-section">
              <label className="studio-section-label">Пропорции видео</label>
              <div className="tier-pills-row" style={{ gridTemplateColumns: `repeat(${selectedModel.aspectRatios?.length || 2}, 1fr)` }}>
                {(selectedModel.aspectRatios || ['16:9', '9:16']).map((ratio) => (
                  <button key={ratio} className={`tier-pill ${selectedRatio === ratio ? 'active' : ''}`} onClick={() => setSelectedRatio(ratio)}>
                    <span className="tier-name">{ratio}</span>
                    <span className="tier-cost">{ratio === '9:16' ? 'Reels / Shorts' : ratio === '16:9' ? 'Горизонт' : 'Квадрат'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isVideo && !isText && (
          <div className="studio-section">
            <label className="studio-section-label">Пропорции кадра</label>
            <div className="tier-pills-row" style={{ gridTemplateColumns: `repeat(${selectedModel.aspectRatios?.length || 4}, 1fr)` }}>
              {(selectedModel.aspectRatios || ['9:16', '1:1', '16:9', '4:5']).map((ratio) => (
                <button key={ratio} className={`tier-pill ${selectedRatio === ratio ? 'active' : ''}`} onClick={() => setSelectedRatio(ratio)}>
                  <span className="tier-name">{ratio}</span>
                  <span className="tier-cost">{ratio === '9:16' ? 'Reels' : ratio === '1:1' ? 'Аватар' : ratio === '16:9' ? 'Кино' : 'Пост'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isText && (
          <div className="studio-section">
            <div className="section-label-row">
              <label className="studio-section-label">Референс или лицо (до 10 фото)</label>
              {referenceImages.length > 0 && (<span className="char-counter">{referenceImages.length} из 10 фото</span>)}
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleUploadImages} />
            {referenceImages.length === 0 ? (
              <div className="upload-ref-dashed-box" onClick={() => fileInputRef.current?.click()}>
                <div className="upload-icon-circle"><Camera size={18} color="#ffffff" /></div>
                <div className="upload-box-text"><span className="upload-main-title">Прикрепить фото или селфи</span><span className="upload-limit-badge">Загружайте до 10 фото</span></div>
              </div>
            ) : (
              <div className="multi-ref-container">
                <div className="multi-ref-grid">
                  {referenceImages.map((imgUrl, idx) => (
                    <div key={idx} className="multi-ref-thumb-wrap">
                      <img src={imgUrl} alt={`Ref ${idx + 1}`} className="multi-ref-thumb" />
                      <span className="multi-ref-index">{idx + 1}</span>
                      <button type="button" className="multi-ref-remove-btn" onClick={() => handleRemoveImage(idx)}><X size={10} strokeWidth={3} /></button>
                    </div>
                  ))}
                  {referenceImages.length < 10 && (<button type="button" className="multi-ref-add-slot" onClick={() => fileInputRef.current?.click()}><Plus size={18} /><span>Еще фото</span></button>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* В. Для ТЕКСТОВЫХ нейросетей (ИИ-Сказители) */}
        {isText && (
          <>
            <div className="studio-section">
              <label className="studio-section-label">Объем истории</label>
              <div className="tier-pills-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <button 
                  className={`tier-pill ${storyLength === 'short' ? 'active' : ''}`}
                  onClick={() => setStoryLength('short')}
                >
                  <span className="tier-name">Короткая история</span>
                  <span className="tier-cost">1–2 минуты чтения</span>
                </button>
                <button 
                  className={`tier-pill ${storyLength === 'long' ? 'active' : ''}`}
                  onClick={() => setStoryLength('long')}
                >
                  <span className="tier-name">Развернутая глава</span>
                  <span className="tier-cost">Полная история</span>
                </button>
              </div>
            </div>

            <div className="studio-section">
              <div className="section-label-row">
                <label className="studio-section-label">Имя героя или персонажей</label>
                <span className="char-counter">необязательно</span>
              </div>
              <div className="pro-input-container">
                <input 
                  type="text" 
                  className="pro-single-input" 
                  placeholder="Например: Артур, маленькая Мира, детектив Рэй..." 
                  value={characterName} 
                  onChange={(e) => setCharacterName(e.target.value)} 
                />
              </div>
            </div>
          </>
        )}

        {/* 5. ПОЛЕ ОПИСАНИЯ СЮЖЕТА / ИДЕИ */}
        <div className="studio-section">
          <div className="section-label-row">
            <label className="studio-section-label">
              {isVideo ? 'Сюжет сцены' : isText ? 'Завязка сюжета или идея' : 'Описание шедевра'}
            </label>
            <span className="char-counter">{userPrompt.length} знаков</span>
          </div>

          <div className="pro-textarea-container">
            <textarea 
              className="pro-textarea"
              placeholder={
                isVideo 
                  ? 'Опишите действие, динамику и персонажей...' 
                  : isText
                  ? 'Опишите главных героев, место действия или начальное событие...'
                  : 'Опишите, что хотите увидеть на картине...'
              }
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows={isText ? 4 : 3}
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
                <span>{isText ? 'Сочиняем историю...' : 'Создание шедевра...'}</span>
              </>
            ) : generationSuccess ? (
              <>
                <Check size={18} color="#4ade80" />
                <span style={{ color: '#4ade80' }}>Готово! Сохранено в чаты</span>
              </>
            ) : (
              <>
                {isVideo ? <Play size={16} fill="currentColor" /> : isText ? <BookOpen size={16} /> : <Camera size={16} />}
                <span>
                  {isVideo 
                    ? `Сгенерировать видео (${currentCost} CR)` 
                    : isText 
                    ? `Написать историю (${currentCost} CR)` 
                    : `Создать изображение (${currentCost} CR)`}
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
                  <button className="pkg-price-btn">{formatPrice(1490)}</button>
                </div>

                <div className="credit-pkg-card popular" onClick={() => { setBalance(balance + 350); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 350 }), 'token'); }}>
                  <span className="pkg-badge">{t('pkgHitBonus')}</span>
                  <div className="pkg-left">
                    <span className="pkg-amount">350 CR</span>
                    <span className="pkg-desc">{t('pkgOptimalSet')}</span>
                  </div>
                  <button className="pkg-price-btn accent">{formatPrice(3990)}</button>
                </div>

                <div className="credit-pkg-card" onClick={() => { setBalance(balance + 1250); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 1250 }), 'token'); }}>
                  <span className="pkg-badge vip">{t('pkgVipBonus')}</span>
                  <div className="pkg-left">
                    <span className="pkg-amount">1250 CR</span>
                    <span className="pkg-desc">{t('pkgMaxVideo')}</span>
                  </div>
                  <button className="pkg-price-btn">{formatPrice(9990)}</button>
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

        {/* Вкладки категорий: Видео (1) -> Фото (2) -> Истории (3) */}
        <div className="create-category-tabs">
          <button 
            className={`create-tab-btn ${activeCategory === 'video' ? 'active' : ''}`}
            onClick={() => handleScrollToCategory('video')}
          >
            <Play size={12} fill="currentColor" />
            <span>Видео</span>
          </button>

          <button 
            className={`create-tab-btn ${activeCategory === 'photo' ? 'active' : ''}`}
            onClick={() => handleScrollToCategory('photo')}
          >
            <Camera size={13} />
            <span>Фото</span>
          </button>

          <button 
            className={`create-tab-btn ${activeCategory === 'text' ? 'active' : ''}`}
            onClick={() => handleScrollToCategory('text')}
          >
            <BookOpen size={13} />
            <span>Истории</span>
          </button>
        </div>
      </div>

      {/* Список моделей: единый непрерывный скролл Видео -> Фото -> Истории */}
      {!searchQuery ? (
        <div className="all-models-grouped-wrap">
          {/* Секция 1: Видео модели */}
          <div ref={videoSectionRef} className="models-category-group" id="section-video">
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
                  <div className="model-thumb-box">
                    <img 
                      src={model.preview_url || model.preview || getModelFallback('video')} 
                      alt={model.name}
                      className="model-thumb-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getModelFallback('video');
                      }}
                    />
                    <span className="model-cat-icon">
                      <Play size={10} fill="#ffffff" />
                    </span>
                  </div>
                  <div className="model-info-col">
                    <div className="model-title-row">
                      <span className="model-name">{model.name}</span>
                      <span className="model-versions-count-badge">3 версии</span>
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
          <div ref={photoSectionRef} className="models-category-group" id="section-photo">
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
                  <div className="model-thumb-box">
                    <img 
                      src={model.preview_url || model.preview || getModelFallback('photo')} 
                      alt={model.name}
                      className="model-thumb-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getModelFallback('photo');
                      }}
                    />
                    <span className="model-cat-icon">
                      <Camera size={10} />
                    </span>
                  </div>
                  <div className="model-info-col">
                    <div className="model-title-row">
                      <span className="model-name">{model.name}</span>
                      <span className="model-versions-count-badge">3 версии</span>
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

          {/* Секция 3: Истории и Сказки */}
          <div ref={textSectionRef} className="models-category-group" id="section-text">
            <div className="category-group-header">
              <BookOpen size={15} color="var(--color-accent)" />
              <h3>Истории и сказки</h3>
              <span className="category-group-count">{models.filter(m => m.category === 'text').length}</span>
            </div>
            <div className="create-models-list">
              {models.filter(m => m.category === 'text').map((model) => (
                <div 
                  key={model.id}
                  className="create-model-card"
                  onClick={() => handleOpenModel(model)}
                >
                  <div className="model-thumb-box">
                    <img 
                      src={model.preview_url || model.preview || getModelFallback('text')} 
                      alt={model.name}
                      className="model-thumb-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getModelFallback('text');
                      }}
                    />
                    <span className="model-cat-icon">
                      <BookOpen size={10} />
                    </span>
                  </div>
                  <div className="model-info-col">
                    <div className="model-title-row">
                      <span className="model-name">{model.name}</span>
                      <span className="model-versions-count-badge">3 версии</span>
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
                <div className="model-thumb-box">
                  <img 
                    src={model.preview_url || model.preview || getModelFallback(model.category)} 
                    alt={model.name}
                    className="model-thumb-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getModelFallback(model.category);
                    }}
                  />
                  <span className="model-cat-icon">
                    {model.category === 'video' ? (
                      <Play size={10} fill="#ffffff" />
                    ) : model.category === 'photo' ? (
                      <Camera size={10} />
                    ) : (
                      <BookOpen size={10} />
                    )}
                  </span>
                </div>

                <div className="model-info-col">
                  <div className="model-title-row">
                    <span className="model-name">{model.name}</span>
                    {model.versions && model.versions.length > 0 && (
                      <span className="model-versions-count-badge">3 версии</span>
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
                <button className="pkg-price-btn">{formatPrice(1490)}</button>
              </div>

              <div className="credit-pkg-card popular" onClick={() => { setBalance(balance + 350); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 350 }), 'token'); }}>
                <span className="pkg-badge">{t('pkgHitBonus')}</span>
                <div className="pkg-left">
                  <span className="pkg-amount">350 CR</span>
                  <span className="pkg-desc">{t('pkgOptimalSet')}</span>
                </div>
                <button className="pkg-price-btn accent">{formatPrice(3990)}</button>
              </div>

              <div className="credit-pkg-card" onClick={() => { setBalance(balance + 1250); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 1250 }), 'token'); }}>
                <span className="pkg-badge vip">{t('pkgVipBonus')}</span>
                <div className="pkg-left">
                  <span className="pkg-amount">1250 CR</span>
                  <span className="pkg-desc">{t('pkgMaxVideo')}</span>
                </div>
                <button className="pkg-price-btn">{formatPrice(9990)}</button>
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
