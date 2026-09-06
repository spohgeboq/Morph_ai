import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import { useLanguage } from '../components/LanguageContext';
import { 
  Sparkles, 
  Plus, 
  ChevronRight, 
  Video as VideoIcon, 
  BookOpen, 
  Music, 
  ArrowUpRight,
  X, 
  CheckCircle2, 
  Dices,
  RefreshCw,
  Play,
  Flame,
  Layers,
  Sparkle,
  Image as ImageIcon,
  ChevronDown,
  Camera,
  ArrowLeft,
  Bookmark,
  Share2,
  Copy,
  Check,
  Lock,
  Unlock,
  Upload
} from 'lucide-react';

import { useUser } from '../components/UserContext';

const Home = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t, translateDynamic } = useLanguage();
  const { balance, setBalance } = useUser();

  // Список моделей ИИ для генерации фото и видео
  const aiModels = [
    { id: 'flux-pro', name: 'Flux 1.1 Pro', tag: 'Фото 4K', desc: 'Максимальный реализм и детализация лиц', cost: 10 },
    { id: 'kling-hd', name: 'Kling AI', tag: 'Видео', desc: 'Кинематографичные видео 1080p с плавным движением', cost: 12 },
    { id: 'seedance', name: 'Seedance', tag: 'Видео 6/10/15с', desc: 'Видео с гибким выбором длительности генерации', cost: 12 },
    { id: 'nano-banana', name: 'Nano Banana', tag: 'Digital Арт', desc: 'Яркие digital-арты и концептуальные иллюстрации', cost: 8 }
  ];
  const [selectedModel, setSelectedModel] = useState(aiModels[0]);
  const [showModelModal, setShowModelModal] = useState(false);

  // 1. Stories с реальными видео
  const stories = [
    { 
      id: 1, 
      title: 'Kling 1.5', 
      tag: 'Видео-морфинг', 
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop', 
      video: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robot-turning-its-head-41477-large.mp4',
      modelName: 'Kling 1.5 AI',
      prompt: 'Киберпанк девушка с неоновыми глазами под дождем Токио',
      unread: true 
    },
    { 
      id: 2, 
      title: 'Old Money', 
      tag: '35mm Film', 
      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=300&auto=format&fit=crop', 
      video: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-vintage-camera-42845-large.mp4',
      modelName: 'Flux 1.1 Pro',
      prompt: 'Эстетика старых денег, винтажная пленка 35mm, элегантный стиль',
      unread: true 
    },
    { 
      id: 3, 
      title: 'Сказка', 
      tag: 'Книга ИИ', 
      image: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=300&auto=format&fit=crop', 
      video: 'https://assets.mixkit.co/videos/preview/mixkit-fireflies-glowing-in-the-forest-at-night-42805-large.mp4',
      modelName: 'Claude 3.5 + Flux',
      prompt: 'Волшебный лес светлячков и тайны древнего королевства',
      unread: true 
    },
    { 
      id: 4, 
      title: 'Неон 2077', 
      tag: 'Sci-Fi', 
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop', 
      video: 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-neon-lit-cubes-in-cyberspace-42777-large.mp4',
      modelName: 'Kling 1.5 HD',
      prompt: 'Полет сквозь киберпространство и неоновые горизонты',
      unread: false 
    }
  ];

  // Активная сторис (модалка строго по центру с видео)
  const [activeStory, setActiveStory] = useState(null);

  // Magic Bar
  const [magicPrompt, setMagicPrompt] = useState('');

  // 2. Галерея живых референсов
  // 2. Шаблоны и референсы для генерации
  const references = [
    {
      id: 1,
      type: 'photo',
      title: 'День Рождения',
      category: 'photo',
      model: 'Flux 1.1 Pro',
      cost: 10,
      thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      prompt: 'Роскошная девушка в вечернем платье на капоте суперкара с тортом и бенгальскими огнями, ночной мегаполис, боке, пленочный теплый свет 8K',
      isPromptLocked: false,
      variableName: 'Возраст',
      variablePlaceholder: 'Введите возраст для торта (например, 25)...'
    },
    {
      id: 2,
      type: 'video',
      title: 'Reels — Столкновение',
      category: 'video',
      model: 'Kling 1.5 HD',
      cost: 16,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-neon-lit-cubes-in-cyberspace-42777-large.mp4',
      thumb: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=600&auto=format&fit=crop',
      prompt: 'Кинематографичный слоу-мо полет сквозь неоновые кубы в киберпространстве с динамичным движением камеры',
      isPromptLocked: true,
      variableName: 'Локация',
      variablePlaceholder: 'Введите локацию (например, Токио)...'
    },
    {
      id: 3,
      type: 'video',
      title: 'Cyberpunk 2077',
      category: 'video',
      model: 'Kling 1.5 HD',
      cost: 16,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robot-turning-its-head-41477-large.mp4',
      thumb: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
      prompt: 'Морфинг портрета в киборга с неоновой лицевой пластиной и микросхемами, дождь и неоновые огни',
      isPromptLocked: false,
      variableName: 'Цвет неона',
      variablePlaceholder: 'Например, синий и фуксия...'
    },
    {
      id: 4,
      type: 'photo',
      title: 'Old Money 35mm',
      category: 'photo',
      model: 'Flux 1.1 Pro',
      cost: 10,
      thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
      prompt: 'Элитный портрет на закате в яхт-клубе, мягкий пленочный теплый свет Leica 35mm, минимализм, стиль Old Money',
      isPromptLocked: false,
      variableName: 'Имя/Деталь',
      variablePlaceholder: 'Инициалы или стиль одежды...'
    },
    {
      id: 5,
      type: 'video',
      title: 'Лес Светлячков',
      category: 'video',
      model: 'Kling 1.5 HD',
      cost: 16,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fireflies-glowing-in-the-forest-at-night-42805-large.mp4',
      thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
      prompt: 'Волшебный ночной лес со светлячками и мягким свечением деревьев, сказочная кинематографичная атмосфера',
      isPromptLocked: true,
      variableName: 'Настроение',
      variablePlaceholder: 'Например, мистическое или сказочное...'
    },
    {
      id: 6,
      type: 'photo',
      title: 'Anime Cyber Girl',
      category: 'photo',
      model: 'Flux 1.1 Pro',
      cost: 8,
      thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
      prompt: 'Аниме киберпанк девушка с неоновыми аксессуарами, студийная отрисовка в стиле Makoto Shinkai 4K',
      isPromptLocked: false,
      variableName: 'Цвет волос',
      variablePlaceholder: 'Например, серебристый или розовый...'
    }
  ];

  // Состояние детального экрана шаблона
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [templateVariable, setTemplateVariable] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Копирование промпта
  const handleCopyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Загрузка фото пользователя
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUserPhoto(url);
    }
  };

  // Генерация по выбранному шаблону: переход в реальную студию создания
  const handleGenerateFromTemplate = () => {
    if (!selectedTemplate) return;
    const modelToUse = (selectedTemplate.model || '').toLowerCase().includes('kling') ? 'kling-hd' : 'flux-pro';
    const finalPrompt = selectedTemplate.prompt + (templateVariable ? ` (${selectedTemplate.variableName}: ${templateVariable})` : '');
    setSelectedTemplate(null);
    navigate('/create', {
      state: {
        model: modelToUse,
        prompt: finalPrompt,
      }
    });
  };

  // Модалка сказки
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [characterName, setCharacterName] = useState('');
  const [storyGenre, setStoryGenre] = useState('fairy');
  const randomNames = ['Артур', 'Алиса', 'Мира', 'Леон', 'Эльза', 'Кибер-детектив Рэй'];

  const setRandomCharacter = () => {
    const random = randomNames[Math.floor(Math.random() * randomNames.length)];
    setCharacterName(random);
  };

  // Статус генерации
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);

  // Модалка пополнения
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // AI Студия: Профессиональная Фотосессия 10 в 1
  const [photoshootPhoto, setPhotoshootPhoto] = useState(null);
  const [isPhotoshootGenerating, setIsPhotoshootGenerating] = useState(false);
  const [photoshootStep, setPhotoshootStep] = useState(0);
  const [generatedPhotoshootPack, setGeneratedPhotoshootPack] = useState(null);

  const photoshootStyles = [
    { id: 1, title: 'Vogue Studio', tag: 'Глянец', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
    { id: 2, title: 'Forbes Business', tag: 'Премиум', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop' },
    { id: 3, title: 'Old Money 35mm', tag: 'Винтаж', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop' },
    { id: 4, title: 'Cyberpunk 2077', tag: 'Sci-Fi', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop' },
    { id: 5, title: 'Cinematic Sunset', tag: 'Кино', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop' },
    { id: 6, title: 'B&W Editorial', tag: 'Классика', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop' },
    { id: 7, title: 'Parisian Street', tag: 'Лайфстайл', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop' },
    { id: 8, title: '3D Pixar Avatar', tag: 'Аватар', img: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=600&auto=format&fit=crop' },
    { id: 9, title: 'Neon Tokyo Noir', tag: 'Неон', img: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=600&auto=format&fit=crop' },
    { id: 10, title: 'Golden Hour Glamour', tag: 'Свет', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop' }
  ];

  const handlePhotoshootUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoshootPhoto(url);
    }
  };

  const handleExecutePhotoshoot = () => {
    if (balance < 15) {
      showToast('Недостаточно кредитов для фотосессии! Пополните баланс.', 'error');
      setShowRechargeModal(true);
      return;
    }

    setIsPhotoshootGenerating(true);
    setPhotoshootStep(1);

    const interval = setInterval(() => {
      setPhotoshootStep(prev => {
        if (prev >= 10) {
          clearInterval(interval);
          setIsPhotoshootGenerating(false);
          setBalance(b => b - 15);
          setGeneratedPhotoshootPack({
            selfie: photoshootPhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
            photos: photoshootStyles
          });
          return 10;
        }
        return prev + 1;
      });
    }, 280);
  };

  // Быстрый запуск из Magic Bar: перенаправление в реальную Студию
  const handleMagicSubmit = (e) => {
    e.preventDefault();
    if (!magicPrompt.trim()) return;

    const p = magicPrompt.trim();
    const modelToUse = selectedModel?.id || 'kling-hd';
    setMagicPrompt('');
    navigate('/create', {
      state: {
        model: modelToUse,
        prompt: p
      }
    });
  };

  // Генерация сказки через реальный ИИ
  const handleGenerateStory = () => {
    const char = characterName.trim() || 'Алиса';
    const genreNames = {
      fairy: 'Волшебная сказка',
      quest: 'Интерактивный квест',
      cyberpunk: 'Киберпанк хроника',
      fantasy: 'Фэнтези приключение'
    };

    setShowStoryModal(false);
    navigate('/create', {
      state: {
        model: 'gpt-4o',
        prompt: `Напиши захватывающую историю в жанре «${genreNames[storyGenre] || 'Сказка'}» про персонажа по имени ${char}. Добавь драматургию, яркие образы и неожиданный финал.`
      }
    });
  };

  // Повторить результат референса
  const handleUseReference = (refItem) => {
    if (refItem.category === 'fairy') {
      setShowStoryModal(true);
    } else {
      setMagicPrompt(refItem.prompt);
      const matched = aiModels.find(m => m.name.toLowerCase().includes(refItem.model.toLowerCase().split(' ')[0])) || aiModels[0];
      setSelectedModel(matched);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  return (
    <div className="page-container">
      {/* 1. Верхний бар (Шапка с логотипом MorphAI и балансом по референсу) */}
      <header className="home-top-bar">
        <div className="brand-logo" onClick={() => navigate('/')}>
          <div className="brand-logo-squircle">
            <img src="/logo.png" alt="MorphAI" className="brand-logo-img" />
          </div>
          <span className="brand-name">Morph<span>AI</span></span>
        </div>

        <div className="balance-capsule">
          <div className="balance-info" onClick={() => setShowRechargeModal(true)}>
            <div className="credit-token-icon">
              {/* Геометрический векторный кристалл без эмодзи */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 12L12 22L22 12L12 2Z" stroke="#e5b95c" strokeWidth="2.4" strokeLinejoin="round" fill="rgba(229, 185, 92, 0.25)" />
                <path d="M12 6L6 12L12 18L18 12L12 6Z" stroke="#e5b95c" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="balance-amount">{balance}</span>
          </div>

          <button 
            className="balance-add-btn"
            onClick={() => setShowRechargeModal(true)}
          >
            <Plus size={13} strokeWidth={3} />
            <span>{t('topUp')}</span>
          </button>
        </div>
      </header>

      {/* 2. Карусель историй (Stories-пресеты с видео) */}
      <section className="stories-section">
        <div className="stories-scroll">
          {stories.map(story => (
            <div 
              key={story.id} 
              className="story-item"
              onClick={() => setActiveStory(story)}
            >
              <div className={`story-avatar-ring ${story.unread ? 'unread' : ''}`}>
                <div 
                  className="story-avatar-img"
                  style={{ backgroundImage: `url(${story.image})` }}
                />
              </div>
              <span className="story-label">{translateDynamic(story.title)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ПРОФЕССИОНАЛЬНЫЙ СТУДИЙНЫЙ ФОТОСЕТ (EDITORIAL HERO CARD) */}
      <section className="photoshoot-hero-section">
        <div className="photoshoot-editorial-card">
          {/* Верхняя часть: Заголовок слева + Веер из 3 фоток справа */}
          <div className="editorial-card-main">
            <div className="editorial-left-col">
              <div className="editorial-badge-row">
                <span className="editorial-gold-pill">{t('studioBadge')}</span>
                <span className="editorial-cost-tag">15 CR</span>
              </div>
              <h3>{t('studioTitle')}</h3>
              <p>{t('studioDesc')}</p>
            </div>

            {/* Правая часть: стильный веер из 3 накладывающихся карточек */}
            <div className="editorial-fan-stack">
              <div className="fan-card fan-1" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop)' }} />
              <div className="fan-card fan-2" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop)' }} />
              <div className="fan-card fan-3" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop)' }}>
                <span className="fan-count-badge">+10</span>
              </div>
            </div>
          </div>

          {/* Нижняя часть: компактное действие (загрузка и запуск) */}
          <div className="editorial-bottom-action">
            {photoshootPhoto ? (
              <div className="editorial-ready-row">
                <div className="editorial-avatar-box">
                  <img src={photoshootPhoto} alt="Uploaded" className="editorial-avatar-thumb" />
                  <label className="editorial-change-photo-btn">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoshootUpload}
                      style={{ display: 'none' }}
                    />
                    <Camera size={12} />
                  </label>
                </div>
                <button 
                  className="btn-primary editorial-generate-btn"
                  onClick={handleExecutePhotoshoot}
                  disabled={isPhotoshootGenerating}
                >
                  {isPhotoshootGenerating ? (
                    <div className="editorial-progress-row">
                      <div className="spinner-mini" />
                      <span>{t('studioGenerating', { step: photoshootStep })}</span>
                    </div>
                  ) : (
                    <div className="editorial-btn-content">
                      <Sparkles size={16} />
                      <span>{t('studioBtnReady')}</span>
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <label className="btn-primary editorial-upload-trigger-btn">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoshootUpload}
                  style={{ display: 'none' }}
                />
                <Camera size={18} />
                <span>{t('studioBtn')}</span>
              </label>
            )}
          </div>
        </div>
      </section>

      {/* 4. СПЕЦИАЛЬНЫЙ РЕЖИМ: СКАЗКИ */}
      <section className="clean-features-section">
        <h3 className="section-heading">{t('specModesTitle')}</h3>
        <div 
          className="clean-card story-hero-card"
          onClick={() => setShowStoryModal(true)}
        >
          <div className="card-top-row">
            <div className="clean-card-icon story-bg">
              <BookOpen size={22} color="#ffffff" />
            </div>
            <span className="clean-pill-badge">{t('specEngineBadge')}</span>
          </div>
          <h4>{t('specStoryTitle')}</h4>
          <p>{t('specStoryDesc')}</p>
          <div className="card-action-link">
            <span>{t('specStoryBtn')}</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </section>

      {/* 5. БЕСКОНЕЧНАЯ ВИЗУАЛЬНАЯ ЛЕНТА (СНАЧАЛА ЖИВЫЕ ВИДЕО, НИЖЕ ФОТО 4K) */}
      <section className="references-section">
        <div className="references-header">
          <div className="ref-title-wrap">
            <h3 className="ref-minimal-title">{t('examplesTitle')}</h3>
          </div>
        </div>

        {/* Сетка шаблонов: чистый визуал без кнопок, как на фото 1 и 2 конкурента */}
        <div className="references-grid">
          {references.map((item) => (
            <div 
              key={item.id} 
              className="reference-card template-card"
              onClick={() => setSelectedTemplate(item)}
            >
              <div className="template-media-wrap">
                {item.type === 'video' && item.videoUrl ? (
                  <video 
                    src={item.videoUrl}
                    poster={item.thumb}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="template-media-video"
                  />
                ) : (
                  <div 
                    className="template-media-photo"
                    style={{ backgroundImage: `url(${item.thumb})` }}
                  />
                )}

                {/* Затемнение снизу для контрастного белого названия */}
                <div className="template-scrim-overlay" />

                {/* Сверху слева: аккуратные круглые чипы-иконки как на фото 1 и 2 */}
                <div className="template-top-badges">
                  {item.type === 'video' ? (
                    <>
                      <div className="template-icon-chip">
                        <Play size={10} fill="#ffffff" color="#ffffff" />
                      </div>
                      <div className="template-icon-chip">
                        <Camera size={11} color="#ffffff" />
                      </div>
                    </>
                  ) : (
                    <div className="template-icon-chip">
                      <Camera size={12} color="#ffffff" />
                    </div>
                  )}
                </div>

                {/* Снизу: четкий жирный заголовок без громоздких кнопок */}
                <div className="template-bottom-title">
                  <h4>{translateDynamic(item.title)}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          ПОЛНОЭКРАННЫЙ ЦЕНТРИРОВАННЫЙ STORIES-ПЛЕЕР С ВИДЕО
          ========================================================= */}
      {activeStory && (
        <div className="story-center-backdrop" onClick={() => setActiveStory(null)}>
          <div className="story-center-player" onClick={(e) => e.stopPropagation()}>
            
            {/* Полоса прогресса вверху сторис */}
            <div className="story-progress-bar">
              <div className="story-progress-fill" />
            </div>

            {/* Шапка сторис */}
            <div className="story-top-info">
              <div className="story-meta-row">
                <span className="story-model-chip">{activeStory.modelName}</span>
                <span className="story-cat-chip">{activeStory.tag}</span>
              </div>
              <button className="story-close-round" onClick={() => setActiveStory(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Реальное воспроизводимое видео */}
            <div className="story-video-wrapper">
              <video 
                src={activeStory.video} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="story-video-element"
              />
            </div>

            {/* Нижний блок сторис с кнопкой применения шаблона */}
            <div className="story-bottom-overlay">
              <h3 className="story-title-text">{activeStory.title}</h3>
              <p className="story-prompt-text">{activeStory.prompt}</p>

              <button 
                className="btn-primary story-try-now-btn"
                onClick={() => {
                  setMagicPrompt(activeStory.prompt);
                  setActiveStory(null);
                  window.scrollTo({ top: 180, behavior: 'smooth' });
                }}
              >
                <Sparkles size={16} />
                <span>Попробовать этот шаблон (10 CR)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          МОДАЛКА ВЫБОРА МОДЕЛЕЙ ИИ
          ========================================================= */}
      {showModelModal && (
        <div className="modal-backdrop" onClick={() => setShowModelModal(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div className="sheet-title-info">
                <h3>Выберите ИИ-модель</h3>
                <span className="sheet-subtitle">Переключение движков Replicate и Fal.ai</span>
              </div>
              <button className="sheet-close-btn" onClick={() => setShowModelModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="model-choice-list">
              {aiModels.map((m) => (
                <div 
                  key={m.id}
                  className={`model-choice-card ${selectedModel.id === m.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedModel(m);
                    setShowModelModal(false);
                  }}
                >
                  <div className="choice-info">
                    <div className="choice-name-row">
                      <h4>{m.name}</h4>
                      <span className="choice-tag">{m.tag}</span>
                    </div>
                    <p>{m.desc}</p>
                  </div>
                  <span className="choice-cost">{m.cost} CR</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          МОДАЛКА: СОЗДАНИЕ СКАЗКИ (ИИ ЗАШИТ В КОДЕ)
          ========================================================= */}
      {showStoryModal && (
        <div className="modal-backdrop" onClick={() => setShowStoryModal(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div className="sheet-title-info">
                <h3>Сказки & Квесты</h3>
                <span className="sheet-subtitle">ИИ-движок: Claude 3.5 Sonnet • 10 CR</span>
              </div>
              <button className="sheet-close-btn" onClick={() => setShowStoryModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-input-group">
              <label className="modal-label">Имя главного героя:</label>
              <div className="char-input-pill-box">
                <input 
                  type="text" 
                  className="modal-text-input"
                  placeholder="Например: Алиса, Тимур, Хранитель Леон..."
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                />
                <button 
                  type="button" 
                  className="dice-pill-btn"
                  onClick={setRandomCharacter}
                >
                  <Dices size={16} />
                  <span>Случайно</span>
                </button>
              </div>
            </div>

            <div className="modal-input-group">
              <label className="modal-label">Выберите жанр:</label>
              <div className="genre-pill-list">
                <button 
                  className={`genre-bubble ${storyGenre === 'fairy' ? 'active' : ''}`}
                  onClick={() => setStoryGenre('fairy')}
                >
                  Детская сказка
                </button>
                <button 
                  className={`genre-bubble ${storyGenre === 'quest' ? 'active' : ''}`}
                  onClick={() => setStoryGenre('quest')}
                >
                  Квест с развилками
                </button>
                <button 
                  className={`genre-bubble ${storyGenre === 'cyberpunk' ? 'active' : ''}`}
                  onClick={() => setStoryGenre('cyberpunk')}
                >
                  Киберпанк
                </button>
                <button 
                  className={`genre-bubble ${storyGenre === 'fantasy' ? 'active' : ''}`}
                  onClick={() => setStoryGenre('fantasy')}
                >
                  Фэнтези
                </button>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '16px', marginTop: '6px' }}
              onClick={handleGenerateStory}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="spinner" />
                  <span>Пишем сказку и рисуем обложку...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Создать сказку (10 CR)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          РЕЗУЛЬТАТ СКАЗКИ / ГЕНЕРАЦИИ (КНИЖНАЯ ОБЛОЖКА)
          ========================================================= */}
      {generatedResult && (
        <div className="modal-backdrop" onClick={() => setGeneratedResult(null)}>
          <div className="bottom-sheet story-result-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div className="sheet-title-info">
                <h3>{generatedResult.title}</h3>
                <span className="sheet-subtitle">Иллюстрация: Flux 1.1 Pro</span>
              </div>
              <button className="sheet-close-btn" onClick={() => setGeneratedResult(null)}>
                <X size={20} />
              </button>
            </div>

            {generatedResult.cover && (
              <div 
                className="story-book-cover"
                style={{ backgroundImage: `url(${generatedResult.cover})` }}
              >
                <div className="book-cover-overlay">
                  <span className="book-badge">Книжная обложка</span>
                  <p className="book-cover-title">{generatedResult.title}</p>
                </div>
              </div>
            )}

            <div className="story-content-box">
              <p className="story-body-text">{generatedResult.text}</p>
              {generatedResult.isFinished && (
                <div className="story-finish-tag">
                  <CheckCircle2 size={16} color="#34c759" />
                  <span>Сюжет завершен • Конец истории</span>
                </div>
              )}
            </div>

            <div className="story-actions-row">
              <button 
                className="btn-primary" 
                style={{ flex: 1 }}
                onClick={() => {
                  setGeneratedResult(null);
                  navigate('/chats');
                }}
              >
                Сохранить в Чаты
              </button>
              <button 
                className="story-replay-btn"
                onClick={() => {
                  setGeneratedResult(null);
                  setShowStoryModal(true);
                }}
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ПОЛНОЭКРАННЫЙ ЭКРАН ШАБЛОНА (КАК НА ФОТО 3 И 4 КОНКУРЕНТА)
          ========================================================= */}
      {selectedTemplate && (
        <div className="template-screen-overlay">
          {/* Шапка экрана */}
          <div className="tmpl-header">
            <button 
              className="tmpl-back-btn" 
              onClick={() => { setSelectedTemplate(null); setUserPhoto(null); setTemplateVariable(''); }}
            >
              <ArrowLeft size={22} />
            </button>
            <div className="tmpl-header-title">
              <h3>{selectedTemplate.title}</h3>
              <span>{selectedTemplate.model.toUpperCase()}</span>
            </div>
            <div className="tmpl-header-actions">
              <button 
                className="tmpl-icon-action" 
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark 
                  size={20} 
                  fill={isBookmarked ? "#e5b95c" : "none"} 
                  color={isBookmarked ? "#e5b95c" : "#ffffff"} 
                />
              </button>
              <button 
                className="tmpl-icon-action" 
                onClick={() => showToast('Ссылка на шаблон скопирована!', 'success')}
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <div className="tmpl-body-scroll">
            {/* 1. Главный медиа-просмотр */}
            <div className="tmpl-main-media-card">
              {selectedTemplate.type === 'video' && selectedTemplate.videoUrl ? (
                <video 
                  src={selectedTemplate.videoUrl}
                  poster={selectedTemplate.thumb}
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="tmpl-full-video"
                />
              ) : (
                <img 
                  src={selectedTemplate.thumb} 
                  alt={selectedTemplate.title} 
                  className="tmpl-full-photo" 
                />
              )}

              {/* Плашки Модели и Стоимости (как на фото 3) */}
              <div className="tmpl-media-bottom-chips">
                <div className="tmpl-info-chip model-chip">
                  <span className="chip-caption">МОДЕЛЬ</span>
                  <span className="chip-value">{selectedTemplate.model}</span>
                </div>
                <div className="tmpl-info-chip cost-chip">
                  <span className="chip-caption">COST</span>
                  <span className="chip-value">{selectedTemplate.cost} CR</span>
                </div>
              </div>
            </div>

            {/* 2. Блок «ВАШИ МЕДИА» (Замена фото / селфи) */}
            <div className="tmpl-section-group">
              <h4 className="tmpl-section-heading">ВАШИ МЕДИА</h4>
              <label className="tmpl-upload-box">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  style={{ display: 'none' }} 
                />
                <div 
                  className="tmpl-upload-preview"
                  style={{ backgroundImage: `url(${userPhoto || selectedTemplate.thumb})` }}
                >
                  <div className="tmpl-upload-badge-icon">
                    <Camera size={18} color="#ffffff" />
                  </div>
                  <div className="tmpl-upload-prompt-text">
                    {userPhoto ? 'Фото загружено • Нажмите чтобы заменить' : 'НАЖМИТЕ, ЧТОБЫ ЗАМЕНИТЬ'}
                  </div>
                </div>
              </label>
            </div>

            {/* 3. Блок «ПЕРЕМЕННЫЕ» (если есть) */}
            {selectedTemplate.variableName && (
              <div className="tmpl-section-group">
                <h4 className="tmpl-section-heading">ПЕРЕМЕННЫЕ</h4>
                <div className="tmpl-var-field">
                  <label>{selectedTemplate.variableName.toUpperCase()}</label>
                  <input 
                    type="text" 
                    className="tmpl-input-field" 
                    placeholder={selectedTemplate.variablePlaceholder}
                    value={templateVariable}
                    onChange={(e) => setTemplateVariable(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* 4. Блок «ПРОМПТ» (Скрытый или с кнопкой копирования) */}
            <div className="tmpl-section-group">
              <h4 className="tmpl-section-heading">ПРОМПТ</h4>
              {selectedTemplate.isPromptLocked ? (
                <div className="tmpl-prompt-box locked">
                  <div className="locked-icon-wrap">
                    <Lock size={20} color="#e5b95c" />
                  </div>
                  <div className="locked-text-wrap">
                    <span className="locked-text">Промпт скрыт автором</span>
                    <span className="locked-subtext">Стиль и настройки будут применены автоматически</span>
                  </div>
                </div>
              ) : (
                <div className="tmpl-prompt-box open">
                  <p className="open-prompt-text">{selectedTemplate.prompt}</p>
                  <button 
                    type="button"
                    className="copy-prompt-btn" 
                    onClick={() => handleCopyPrompt(selectedTemplate.prompt)}
                  >
                    {copiedPrompt ? (
                      <>
                        <Check size={14} color="#4ade80" />
                        <span style={{ color: '#4ade80' }}>Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Скопировать промпт</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 5. Фиксированная кнопка внизу экрана */}
          <div className="tmpl-bottom-action-bar">
            {balance >= selectedTemplate.cost ? (
              <button 
                className="btn-primary tmpl-submit-btn"
                onClick={handleGenerateFromTemplate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="spinner" />
                    <span>Генерируем {selectedTemplate.title}...</span>
                  </>
                ) : (
                  <span>Сгенерировать ({selectedTemplate.cost} CR)</span>
                )}
              </button>
            ) : (
              <button 
                className="btn-primary tmpl-submit-btn locked"
                onClick={() => setShowRechargeModal(true)}
              >
                <Lock size={16} />
                <span>Недостаточно кредитов ({selectedTemplate.cost} CR) • Пополнить</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          МОДАЛКА ГОТОВОЙ ФОТОСЕССИИ ИЗ 10 ФОТО
          ========================================================= */}
      {generatedPhotoshootPack && (
        <div className="photoshoot-modal-overlay">
          <div className="photoshoot-modal-header">
            <div className="modal-title-info">
              <h3>Ваша AI Фотосессия готова!</h3>
              <span className="modal-title-sub">Создано 10 профессиональных портретов в 4K Ultra HD</span>
            </div>
            <button 
              className="photoshoot-modal-close"
              onClick={() => setGeneratedPhotoshootPack(null)}
            >
              <X size={22} />
            </button>
          </div>

          <div className="photoshoot-modal-gallery">
            <div className="photoshoot-grid-10">
              {generatedPhotoshootPack.photos.map((item, index) => (
                <div key={item.id} className="photoshoot-result-item">
                  <img src={item.img} alt={item.title} className="photoshoot-result-img" />
                  <div className="result-item-overlay">
                    <span className="result-style-title">{item.title}</span>
                    <button 
                      className="result-download-btn"
                      onClick={() => showToast(`Фото «${item.title}» сохранено!`, 'success')}
                    >
                      <ArrowUpRight size={14} />
                      <span>4K</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="photoshoot-modal-footer">
            <button 
              className="btn-primary photoshoot-download-all-btn"
              onClick={() => {
                showToast('Все 10 фото успешно сохранены в галерею!', 'success');
                setGeneratedPhotoshootPack(null);
              }}
            >
              <Check size={18} />
              <span>Сохранить весь альбом из 10 фото</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          МОДАЛКА ПОПОЛНЕНИЯ БАЛАНСА
          ========================================================= */}
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

export default Home;
