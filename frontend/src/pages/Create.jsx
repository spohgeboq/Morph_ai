import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import { useLanguage } from '../components/LanguageContext';
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
  Wand2, 
  Clock, 
  ZoomIn, 
  RotateCw, 
  MoveRight, 
  Film
} from 'lucide-react';

// База данных моделей MorphAI
export const AI_MODELS_DB = [
  {
    id: 'flux-pro',
    name: 'Flux',
    category: 'photo',
    preview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    tags: ['Фото 8K', 'Портреты'],
    desc: 'Гиперреалистичные портреты и фото студийного качества',
    cost: 10,
    versions: [
      { id: 'flux-1-1-pro', name: 'Flux 1.1 Pro', cost: 10 },
      { id: 'flux-dev', name: 'Flux Dev', cost: 8 },
      { id: 'flux-schnell', name: 'Flux Schnell', cost: 6 }
    ],
    aspectRatios: ['9:16', '1:1', '16:9', '4:5'],
    samplePrompts: [
      'Девушка в лучах заката на крыше в Париже, 35mm',
      'Эстетичный студийный портрет с мягким светом'
    ]
  },
  {
    id: 'nano-banana',
    name: 'Nano Banana',
    category: 'photo',
    preview: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
    tags: ['Эксклюзив', 'Digital Арт'],
    desc: 'Креативная генерация ярких digital-артов и дизайн-иллюстраций',
    cost: 8,
    versions: [
      { id: 'nano-pro', name: 'Nano Pro 2.0', cost: 10 },
      { id: 'nano-turbo', name: 'Nano Turbo', cost: 8 },
      { id: 'nano-flash', name: 'Nano Flash', cost: 6 }
    ],
    aspectRatios: ['9:16', '1:1', '16:9', '4:5'],
    samplePrompts: [
      'Яркий неоновый поп-арт с фруктами и космическими элементами',
      'Футуристический дизайн персонажа в стиле киберпанк'
    ]
  },
  {
    id: 'kling-hd',
    name: 'Kling AI',
    category: 'video',
    preview: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    tags: ['Видео 1080p', 'Кино-физика'],
    desc: 'Плавные кинематографичные видео и анимация персонажей',
    cost: 12,
    versions: [
      { id: 'kling-1-5', name: 'Kling 1.5 HD', cost: 12 },
      { id: 'kling-1-0', name: 'Kling 1.0 Pro', cost: 10 },
      { id: 'kling-fast', name: 'Kling Fast', cost: 8 }
    ],
    aspectRatios: ['9:16', '16:9', '1:1'],
    samplePrompts: [
      'Неоновый киберпанк спорткар мчит по ночному Токио под дождем',
      'Плавный пролет камеры над океанскими скалами'
    ]
  },
  {
    id: 'midjourney-v6',
    name: 'Midjourney',
    category: 'photo',
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    tags: ['Арт', 'Дизайн & 3D'],
    desc: 'Непревзойденная художественная композиция и стиль',
    cost: 10,
    versions: [
      { id: 'mj-6-1', name: 'v6.1 Photo', cost: 12 },
      { id: 'mj-6-0', name: 'v6.0 Pro', cost: 10 },
      { id: 'mj-niji', name: 'Niji 6 Anime', cost: 8 }
    ],
    aspectRatios: ['9:16', '1:1', '16:9', '4:5'],
    samplePrompts: [
      'Сюрреалистичная скульптура из жидкого золота и стекла',
      'Футуристический интерьер пентхауса с видом на Марс'
    ]
  },
  {
    id: 'luma-dream',
    name: 'Luma',
    category: 'video',
    preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    tags: ['Оживление фото', 'Динамика'],
    desc: 'Превращает статичные фотографии в реалистичные видеоролики',
    cost: 10,
    versions: [
      { id: 'luma-1-5', name: 'Dream 1.5 HD', cost: 14 },
      { id: 'luma-1-0', name: 'Dream 1.0 Pro', cost: 10 },
      { id: 'luma-turbo', name: 'Dream Turbo', cost: 8 }
    ],
    aspectRatios: ['9:16', '16:9', '1:1'],
    samplePrompts: [
      'Оживление портрета: легкая улыбка и колыхание волос от ветра',
      'Оживление фото пейзажа с движущимися облаками'
    ]
  },
  {
    id: 'seedream-pro',
    name: 'Seedream',
    category: 'photo',
    preview: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
    tags: ['Турбо', '3D Персонажи'],
    desc: 'Сверхбыстрая генерация концепт-артов и мультяшных аватаров',
    cost: 6,
    versions: [
      { id: 'sd-4-0', name: 'Seedream 4.0', cost: 8 },
      { id: 'sd-3-5', name: 'Seedream 3.5 Pro', cost: 6 },
      { id: 'sd-lite', name: 'Seedream Lite', cost: 4 }
    ],
    aspectRatios: ['1:1', '9:16', '16:9'],
    samplePrompts: [
      '3D персонаж в стиле Pixar, выразительная мимика',
      'Киберпанк самурай в неоновых доспехах'
    ]
  },
  {
    id: 'runway-gen3',
    name: 'Runway',
    category: 'video',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    tags: ['VFX Кино', 'Slow-Mo'],
    desc: 'Голливудские спецэффекты и кинематографичное slow-motion',
    cost: 12,
    versions: [
      { id: 'gen-3-alpha', name: 'Gen-3 Alpha', cost: 16 },
      { id: 'gen-3-turbo', name: 'Gen-3 Turbo', cost: 12 },
      { id: 'gen-2', name: 'Gen-2 Ultra', cost: 8 }
    ],
    aspectRatios: ['16:9', '9:16', '1:1'],
    samplePrompts: [
      'Замедленный взрыв неоновых кристаллов в темноте',
      'Кинематографичная сцена погони в футуристичном мегаполисе'
    ]
  },
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT',
    category: 'text',
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    tags: ['Копирайтинг', 'Идеи'],
    desc: 'Написание вирусных постов, сценариев для Reels и креативных текстов',
    cost: 2,
    versions: [
      { id: 'gpt-4o-omni', name: 'GPT-4o Omni', cost: 3 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', cost: 1 },
      { id: 'gpt-o1', name: 'o1-Preview', cost: 5 }
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
    preview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    tags: ['Сценарии', 'Логика'],
    desc: 'Глубокие тексты, статьи, драматургия и сложный сторителлинг',
    cost: 3,
    versions: [
      { id: 'claude-sonnet', name: '3.5 Sonnet', cost: 3 },
      { id: 'claude-opus', name: '3 Opus', cost: 4 },
      { id: 'claude-haiku', name: '3 Haiku', cost: 1 }
    ],
    aspectRatios: [],
    samplePrompts: [
      'Напиши сценарий для короткометражного фантастического фильма',
      'Создай подробный контент-план на 30 дней для бренда'
    ]
  }
];

const Create = () => {
  const { showToast } = useToast();
  const { t, translateDynamic } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'photo' | 'video' | 'text'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Выбранная модель для перехода в полноэкранную Студию (Живой Холст)
  const [selectedModel, setSelectedModel] = useState(null);

  // Параметры генератора
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [videoDuration, setVideoDuration] = useState('5s'); // '5s' | '10s'
  const [cameraMotion, setCameraMotion] = useState('static'); // 'static' | 'zoom' | 'orbit' | 'pan'
  const [textMode, setTextMode] = useState('reels'); // 'reels' | 'post' | 'script'
  const [referenceImages, setReferenceImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Баланс и пополнение
  const [balance, setBalance] = useState(120);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.prompt) {
      const matchName = (location.state.model || '').toLowerCase();
      const targetModel = AI_MODELS_DB.find(m => m.name.toLowerCase().includes(matchName)) || AI_MODELS_DB[0];
      setSelectedModel(targetModel);
      setSelectedVersion(targetModel.versions?.[0] || null);
      setUserPrompt(location.state.prompt);
    }
  }, [location.state]);

  // Фильтрация списка моделей
  const filteredModels = useMemo(() => {
    return AI_MODELS_DB.filter(model => {
      const matchesCat = activeCategory === 'all' || model.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        model.name.toLowerCase().includes(q) || 
        model.desc.toLowerCase().includes(q) || 
        model.tags.some(t => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Открытие Студии Живого Холста для модели
  const handleOpenModel = (model) => {
    setSelectedModel(model);
    setSelectedVersion(model.versions?.[0] || null);
    setUserPrompt('');
    setSelectedRatio(model.aspectRatios?.[0] || '16:9');
    setVideoDuration('5s');
    setCameraMotion('static');
    setReferenceImages([]);
    setGenerationSuccess(false);
  };

  // Загрузка референсов (до 10 фото)
  const handleUploadImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newUrls = files.map(file => URL.createObjectURL(file));
    setReferenceImages(prev => [...prev, ...newUrls].slice(0, 10));
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  // Запуск генерации
  const handleStartGeneration = () => {
    if (!userPrompt.trim()) return;
    if (balance < currentCost) {
      showToast('Недостаточно кредитов! Пополните баланс.', 'error');
      setShowRechargeModal(true);
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationSuccess(true);
      setBalance(prev => Math.max(0, prev - currentCost));
      setTimeout(() => {
        setGenerationSuccess(false);
        setSelectedModel(null);
        setUserPrompt('');
        setReferenceImages([]);
      }, 1600);
    }, 2200);
  };

  /* =========================================================
     РЕЖИМ: ПОЛНОЭКРАННАЯ СТУДИЯ «ЖИВОЙ ХОЛСТ» (ВЫБРАННЫЙ ВАРИАНТ 2)
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

        {/* 2. ИНТЕРАКТИВНЫЙ ЖИВОЙ ХОЛСТ (Плавно меняет форму на лету) */}
        <div className="interactive-canvas-stage">
          <div 
            className={`live-frame-box ratio-${selectedRatio.replace(':', '-')}`}
            style={{ backgroundImage: `url(${selectedModel.preview})` }}
          >
            <div className="canvas-grid-overlay" />
            
            {/* Верхний бейдж формата */}
            <div className="canvas-top-tag">
              {isVideo ? <Film size={12} color="#e5b95c" /> : isText ? <FileText size={12} color="#e5b95c" /> : <Camera size={12} color="#e5b95c" />}
              <span>Живой холст: {isText ? 'Текст' : selectedRatio}</span>
            </div>

            {/* Нижний бейдж параметров */}
            <div className="canvas-bottom-tag">
              {isVideo ? (
                <span>
                  {cameraMotion === 'static' 
                    ? 'Статичная камера' 
                    : cameraMotion === 'zoom' 
                    ? 'Приближение Zoom' 
                    : cameraMotion === 'orbit' 
                    ? 'Круговой облет' 
                    : 'Панорама'} • Студия
                </span>
              ) : isText ? (
                <span>{selectedVersion ? selectedVersion.name : selectedModel.name} • 4K логика</span>
              ) : (
                <span>{selectedVersion ? selectedVersion.name : selectedModel.name} • Студия</span>
              )}
            </div>
          </div>
        </div>

        {/* 3. НАСТРОЙКИ В ЗАВИСИМОСТИ ОТ ТИПА НЕЙРОСЕТИ */}
        {/* А. Для ВИДЕО-нейросетей */}
        {isVideo && (
          <>
            {/* Версия видео-нейросети */}
            {selectedModel.versions && selectedModel.versions.length > 0 && (
              <div className="studio-section">
                <label className="studio-section-label">Версия нейросети</label>
                <div className="tier-pills-row">
                  {selectedModel.versions.map((ver) => (
                    <button 
                      key={ver.id || ver.name}
                      className={`tier-pill ${selectedVersion?.name === ver.name ? 'active' : ''}`}
                      onClick={() => setSelectedVersion(ver)}
                    >
                      <span className="tier-name">{ver.name}</span>
                      <span className="tier-cost">{ver.cost} CR</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
          <>
            {/* Версия нейросети */}
            {selectedModel.versions && selectedModel.versions.length > 0 && (
              <div className="studio-section">
                <label className="studio-section-label">Версия нейросети</label>
                <div className="tier-pills-row">
                  {selectedModel.versions.map((ver) => (
                    <button 
                      key={ver.id || ver.name}
                      className={`tier-pill ${selectedVersion?.name === ver.name ? 'active' : ''}`}
                      onClick={() => setSelectedVersion(ver)}
                    >
                      <span className="tier-name">{ver.name}</span>
                      <span className="tier-cost">{ver.cost} CR</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Пропорции кадра */}
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
          </>
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
          <>
            {selectedModel.versions && selectedModel.versions.length > 0 && (
              <div className="studio-section">
                <label className="studio-section-label">Версия модели</label>
                <div className="tier-pills-row">
                  {selectedModel.versions.map((ver) => (
                    <button 
                      key={ver.id || ver.name}
                      className={`tier-pill ${selectedVersion?.name === ver.name ? 'active' : ''}`}
                      onClick={() => setSelectedVersion(ver)}
                    >
                      <span className="tier-name">{ver.name}</span>
                      <span className="tier-cost">{ver.cost} CR</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
          </>
        )}

        {/* 4. ПОЛЕ ОПИСАНИЯ СЮЖЕТА / ИДЕИ */}
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

        {/* 5. ФИКСИРОВАННЫЙ НИЖНИЙ ДОК С КНОПКОЙ СТАРТА (Не перекрывается нижним меню!) */}
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
                <div className="credit-pkg-card" onClick={() => { setBalance(b => b + 100); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 100 }), 'token'); }}>
                  <div className="pkg-left">
                    <span className="pkg-amount">100 CR</span>
                    <span className="pkg-desc">{t('pkgStoriesPhotos')}</span>
                  </div>
                  <button className="pkg-price-btn">199 ₽</button>
                </div>

                <div className="credit-pkg-card popular" onClick={() => { setBalance(b => b + 350); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 350 }), 'token'); }}>
                  <span className="pkg-badge">{t('pkgHitBonus')}</span>
                  <div className="pkg-left">
                    <span className="pkg-amount">350 CR</span>
                    <span className="pkg-desc">{t('pkgOptimalSet')}</span>
                  </div>
                  <button className="pkg-price-btn accent">490 ₽</button>
                </div>

                <div className="credit-pkg-card" onClick={() => { setBalance(b => b + 1250); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 1250 }), 'token'); }}>
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

        {/* Вкладки категорий: ровно 4 колонки на 100% ширины */}
        <div className="create-category-tabs">
          <button 
            className={`create-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <Sparkles size={13} />
            <span>{t('all')}</span>
          </button>

          <button 
            className={`create-tab-btn ${activeCategory === 'photo' ? 'active' : ''}`}
            onClick={() => setActiveCategory('photo')}
          >
            <Camera size={13} />
            <span>{t('photo')}</span>
          </button>

          <button 
            className={`create-tab-btn ${activeCategory === 'video' ? 'active' : ''}`}
            onClick={() => setActiveCategory('video')}
          >
            <Play size={12} fill="currentColor" />
            <span>{t('video')}</span>
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

      {/* Список моделей: без перегруза и без лишнего текста */}
      <div className="create-models-list">
        {filteredModels.length > 0 ? (
          filteredModels.map((model) => (
            <div 
              key={model.id}
              className="create-model-card"
              onClick={() => handleOpenModel(model)}
            >
              {/* Левое наглядное превью результата */}
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

              {/* Центральный блок: название и аккуратные теги */}
              <div className="model-info-col">
                <div className="model-title-row">
                  <span className="model-name">{model.name}</span>
                </div>

                {/* Аккуратные теги */}
                <div className="model-tags-row">
                  {model.tags.map((tag, i) => (
                    <span key={i} className="model-tag-pill">{translateDynamic(tag)}</span>
                  ))}
                </div>
              </div>

              {/* Правый блок: Стоимость и стрелка перехода */}
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
                setActiveCategory('all');
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>

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
              <div className="credit-pkg-card" onClick={() => { setBalance(b => b + 100); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 100 }), 'token'); }}>
                <div className="pkg-left">
                  <span className="pkg-amount">100 CR</span>
                  <span className="pkg-desc">{t('pkgStoriesPhotos')}</span>
                </div>
                <button className="pkg-price-btn">199 ₽</button>
              </div>

              <div className="credit-pkg-card popular" onClick={() => { setBalance(b => b + 350); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 350 }), 'token'); }}>
                <span className="pkg-badge">{t('pkgHitBonus')}</span>
                <div className="pkg-left">
                  <span className="pkg-amount">350 CR</span>
                  <span className="pkg-desc">{t('pkgOptimalSet')}</span>
                </div>
                <button className="pkg-price-btn accent">490 ₽</button>
              </div>

              <div className="credit-pkg-card" onClick={() => { setBalance(b => b + 1250); setShowRechargeModal(false); showToast(t('tokensCredited', { amount: 1250 }), 'token'); }}>
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
