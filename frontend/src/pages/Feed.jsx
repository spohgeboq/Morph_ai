import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Heart, Share2, Sparkles, LayoutGrid, Smartphone, X, Check, Camera, Search, Play } from 'lucide-react';
import { useToast } from '../components/ToastContext';
import { useLanguage } from '../components/LanguageContext';

// База видео и артов от админки MorphAI с разделением на Фото и Видео
const MASTER_FEED_DB = [
  {
    id: 'f1',
    title: 'Neon Tokyo Cyberpunk',
    type: 'video',
    author: '@cyber_morph',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    model: 'Kling 1.5 HD',
    cost: 10,
    media: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=900&auto=format&fit=crop',
    likesCount: 14200,
    category: 'cyberpunk',
    prompt: 'Киберпанк девушка в неоновом дожде, отражения мокрого асфальта, 8K Ultra HD, кинематографичный свет'
  },
  {
    id: 'f2',
    title: 'Old Money Yacht Club',
    type: 'photo',
    author: '@vogue_ai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    model: 'Flux 1.1 Pro',
    cost: 10,
    media: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=900&auto=format&fit=crop',
    likesCount: 9840,
    category: 'fashion',
    prompt: 'Винтажная пленочная эстетика 35mm, Монако, яхта, естественный теплый солнечный свет, 4k'
  },
  {
    id: 'f3',
    title: 'Chromatic Liquid Fashion',
    type: 'video',
    author: '@future_studio',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    model: 'Luma Dream Machine',
    cost: 12,
    media: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=900&auto=format&fit=crop',
    likesCount: 22150,
    category: 'futuristic',
    prompt: 'Хромированный жидкий футуризм, переливающийся глянец, высокая мода, студийный свет'
  },
  {
    id: 'f4',
    title: 'Editorial B&W Portrait',
    type: 'photo',
    author: '@monochrome_pro',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    model: 'Flux 1.1 Pro',
    cost: 10,
    media: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=900&auto=format&fit=crop',
    likesCount: 18400,
    category: 'portrait',
    prompt: 'Глубокий черно-белый студийный портрет, контрастные тени, выразительный взгляд, 8k'
  },
  {
    id: 'f5',
    title: 'Parisian Golden Hour',
    type: 'video',
    author: '@elena_paris',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
    model: 'Hailuo AI',
    cost: 12,
    media: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop',
    likesCount: 31200,
    category: 'cinematic',
    prompt: 'Прогулка по осеннему Парижу на закате, мягкие золотые блики, кинематографичный фокус'
  },
  {
    id: 'f6',
    title: '3D Pixar Dreamer',
    type: 'photo',
    author: '@pixar_magic',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=200&auto=format&fit=crop',
    model: 'Midjourney 6.1',
    cost: 10,
    media: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=900&auto=format&fit=crop',
    likesCount: 16900,
    category: 'animation',
    prompt: '3D анимационный персонаж в стиле мультфильмов Pixar/Disney, выразительная мимика, volumetric lighting'
  },
  {
    id: 'f7',
    title: 'High Tech Sci-Fi Explorer',
    type: 'video',
    author: '@cosmos_ai',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    model: 'Kling 1.5 HD',
    cost: 10,
    media: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=900&auto=format&fit=crop',
    likesCount: 27800,
    category: 'scifi',
    prompt: 'Космический скафандр будущего, световые индикаторы, звезды и туманности на фоне'
  },
  {
    id: 'f8',
    title: 'Midnight Velvet Noir',
    type: 'photo',
    author: '@noir_fashion',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    model: 'Flux 1.1 Pro',
    cost: 10,
    media: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=900&auto=format&fit=crop',
    likesCount: 12450,
    category: 'fashion',
    prompt: 'Бархатный вечерний наряд, ночной неоновый мегаполис, атмосферный боке, 8K'
  },
  {
    id: 'f9',
    title: 'Studio Ghibli Magic Valley',
    type: 'photo',
    author: '@anime_dream',
    avatar: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=200&auto=format&fit=crop',
    model: 'Midjourney 6.1',
    cost: 10,
    media: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=900&auto=format&fit=crop',
    likesCount: 19800,
    category: 'animation',
    prompt: 'Живописная зеленая долина, сказочный замок, облака Хаяо Миядзаки, акварельный стиль'
  },
  {
    id: 'f10',
    title: 'Forbes Business Executive',
    type: 'photo',
    author: '@forbes_visuals',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    model: 'Flux 1.1 Pro',
    cost: 10,
    media: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=900&auto=format&fit=crop',
    likesCount: 15300,
    category: 'portrait',
    prompt: 'Премиальный деловой портрет руководителя, современный офис в небоскребе, уверенный взгляд'
  },
  {
    id: 'f11',
    title: 'Cyber Samurai 2099',
    type: 'video',
    author: '@blade_runner_ai',
    avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop',
    model: 'Kling 1.5 HD',
    cost: 12,
    media: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=900&auto=format&fit=crop',
    likesCount: 24900,
    category: 'cyberpunk',
    prompt: 'Кибер-самурай с неоновым клинком на крыше ночного мегаполиса, дым и лазеры'
  },
  {
    id: 'f12',
    title: 'Vogue Haute Couture',
    type: 'video',
    author: '@milan_runway',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    model: 'Flux 1.1 Pro',
    cost: 10,
    media: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=900&auto=format&fit=crop',
    likesCount: 38200,
    category: 'fashion',
    prompt: 'Подиумный показ мод в Милане, струящиеся шелковые ткани, вспышки фотографов'
  }
];

// Умный алгоритм перемешивания без повторений (Fisher-Yates Shuffle)
const shuffleNonRepeating = (array, lastItem = null) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Если первый элемент совпадает с последним показанным, переставляем его в конец
  if (lastItem && arr[0].id === lastItem.id && arr.length > 1) {
    const temp = arr.shift();
    arr.push(temp);
  }
  return arr;
};

const Feed = () => {
  const location = useLocation();
  const { showToast } = useToast();
  const { t, translateDynamic } = useLanguage();
  // Режим: 'stream' (TikTok) или 'grid' (Сетка)
  const [viewMode, setViewMode] = useState('stream');

  // Динамическая лента TikTok
  const [feedItems, setFeedItems] = useState([]);
  const streamContainerRef = useRef(null);

  // При переходе из раздела "Избранное" открываем конкретный видео-шаблон
  useEffect(() => {
    if (location.state?.targetItemId) {
      const targetId = location.state.targetItemId;
      const found = MASTER_FEED_DB.find(i => i.id === targetId) || location.state.item;
      if (found) {
        setViewMode('stream');
        setFeedItems(prev => {
          const others = prev.filter(i => i.id !== found.id);
          return [{ ...found, feedKey: `${found.id}_focused_${Date.now()}` }, ...others];
        });
        showToast(`Открыт видео-шаблон «${found.title}»`, 'info');
      }
    }
  }, [location.state]);

  // Состояние лайков
  const [likedItems, setLikedItems] = useState(() => {
    try {
      const saved = localStorage.getItem('morphai_liked_ids');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Всплывающее сердце при двойном тапе
  const [heartBurst, setHeartBurst] = useState(null);
  const lastTapRef = useRef(0);

  // Шторка "Повторить стиль" (Remix)
  const [remixItem, setRemixItem] = useState(null);
  const [remixPhoto, setRemixPhoto] = useState(null);
  const [isRemixGenerating, setIsRemixGenerating] = useState(false);
  const [remixSuccess, setRemixSuccess] = useState(false);
  const [remixTargetMode, setRemixTargetMode] = useState('face'); // 'face' | 'noface'
  const fileInputRef = useRef(null);

  // Фильтрация и поиск в режиме Сетка и Поток
  const [gridFilterType, setGridFilterType] = useState('all'); // 'all' | 'video' | 'photo'
  const [searchQuery, setSearchQuery] = useState('');
  const [isStreamSearchOpen, setIsStreamSearchOpen] = useState(false);
  const streamSearchInputRef = useRef(null);

  // Активный поток для режима Stream (с фильтрацией при поиске)
  const activeStreamItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return feedItems;
    const matched = MASTER_FEED_DB.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.model.toLowerCase().includes(q) ||
      item.prompt.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
    return matched.map((item, idx) => ({
      ...item,
      feedKey: `${item.id}_stream_search_${idx}`
    }));
  }, [searchQuery, feedItems]);

  // Отфильтрованные карточки для Сетки
  const filteredGridItems = useMemo(() => {
    return MASTER_FEED_DB.filter(item => {
      const matchesType = gridFilterType === 'all' || item.type === gridFilterType;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || (
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.prompt.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
      return matchesType && matchesQuery;
    });
  }, [gridFilterType, searchQuery]);

  // Выбор элемента из сетки для открытия в TikTok-потоке
  const handleSelectGridItem = (item) => {
    const targetKey = `${item.id}_direct_${Date.now()}`;
    const directItem = { ...item, feedKey: targetKey };
    const others = feedItems.filter(i => i.id !== item.id);
    setFeedItems([directItem, ...others]);
    setViewMode('stream');
    setTimeout(() => {
      if (streamContainerRef.current) {
        streamContainerRef.current.scrollTop = 0;
      }
    }, 50);
  };

  // 1. Инициализация умной ленты рекомендаций при первом открытии
  useEffect(() => {
    const initialBatch = shuffleNonRepeating(MASTER_FEED_DB);
    // Добавляем уникальный instanceId для плавного бесконечного скролла
    const preparedBatch = initialBatch.map((item, idx) => ({
      ...item,
      feedKey: `${item.id}_${Date.now()}_${idx}`
    }));
    setFeedItems(preparedBatch);
  }, []);

  // 2. Умная подгрузка следующей партии видео (TikTok Recommendation Engine)
  const appendRecommendedBatch = useCallback(() => {
    setFeedItems(prev => {
      const lastItem = prev[prev.length - 1];
      
      // Анализируем предпочтения: какие категории пользователь лайкал больше всего
      const likedCategories = Object.keys(likedItems)
        .map(id => MASTER_FEED_DB.find(m => m.id === id)?.category)
        .filter(Boolean);

      // Генерируем новую перемешанную партию
      let nextBatch = shuffleNonRepeating(MASTER_FEED_DB, lastItem);

      // Если есть любимые категории, поднимаем их с вероятностью 40% (TikTok 80/20 принцип)
      if (likedCategories.length > 0) {
        nextBatch.sort((a, b) => {
          const aFav = likedCategories.includes(a.category) ? 1 : 0;
          const bFav = likedCategories.includes(b.category) ? 1 : 0;
          return Math.random() > 0.6 ? bFav - aFav : 0;
        });
      }

      const preparedNext = nextBatch.map((item, idx) => ({
        ...item,
        feedKey: `${item.id}_${Date.now()}_${idx}`
      }));

      return [...prev, ...preparedNext];
    });
  }, [likedItems]);

  // 3. Отслеживание бесконечного скролла
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Когда пользователь долистал до последних 2 видео — бесшовно генерируем новую партию
    if (scrollHeight - scrollTop - clientHeight < clientHeight * 2) {
      appendRecommendedBatch();
    }
  };

  // 4. Лайк и сохранение в профиль
  const toggleLike = (item) => {
    setLikedItems(prev => {
      const isCurrentlyLiked = !!prev[item.id];
      const updated = { ...prev, [item.id]: !isCurrentlyLiked };
      
      try {
        localStorage.setItem('morphai_liked_ids', JSON.stringify(updated));
        
        const likedObjectsStr = localStorage.getItem('morphai_liked_feed');
        let likedObjects = likedObjectsStr ? JSON.parse(likedObjectsStr) : [];
        
        if (!isCurrentlyLiked) {
          if (!likedObjects.find(i => i.id === item.id)) {
            likedObjects.unshift(item);
          }
        } else {
          likedObjects = likedObjects.filter(i => i.id !== item.id);
        }
        localStorage.setItem('morphai_liked_feed', JSON.stringify(likedObjects));
      } catch (err) {
        console.error('Save to profile error:', err);
      }
      
      return updated;
    });
  };

  // 5. Двойной тап по видео
  const handleDoubleTap = (e, item) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0]?.clientX) || rect.width / 2) - rect.left;
      const y = (e.clientY || (e.touches && e.touches[0]?.clientY) || rect.height / 2) - rect.top;

      setHeartBurst({ x, y, id: item.id });
      setTimeout(() => setHeartBurst(null), 800);

      if (!likedItems[item.id]) {
        toggleLike(item);
      }
    }
    lastTapRef.current = now;
  };

  const formatLikes = (num, isLiked) => {
    const total = num + (isLiked ? 1 : 0);
    if (total >= 1000) {
      return (total / 1000).toFixed(1) + 'k';
    }
    return total;
  };

  const handleShare = (item) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Посмотри этот крутой ИИ-арт в MorphAI: ${item.title}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      showToast(`Ссылка на «${item.title}» скопирована!`, 'success');
    }
  };

  const handleExecuteRemix = (mode = 'face') => {
    setRemixTargetMode(mode);
    setIsRemixGenerating(true);
    setTimeout(() => {
      setIsRemixGenerating(false);
      setRemixSuccess(true);
      setTimeout(() => {
        setRemixSuccess(false);
        setRemixItem(null);
        setRemixPhoto(null);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="tiktok-feed-wrapper">
      {/* Верхняя компактная панель управления (Поиск + Сетка/Поток) */}
      <div className="feed-top-nav-cluster">
        {/* Кнопка Поиска (минималистичная и раскрывающаяся в обоих режимах) */}
        {isStreamSearchOpen ? (
          <div className="stream-search-expanding-box">
            <Search size={15} className="stream-search-icon" />
            <input 
              ref={streamSearchInputRef}
              type="text" 
              className="stream-search-input"
              placeholder={t('feedSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button 
              className="stream-search-close-btn"
              onClick={() => {
                setIsStreamSearchOpen(false);
                setSearchQuery('');
              }}
              aria-label="Закрыть поиск"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button 
            className="feed-icon-action-btn"
            onClick={() => {
              setIsStreamSearchOpen(true);
              setTimeout(() => streamSearchInputRef.current?.focus(), 50);
            }}
            aria-label="Поиск"
          >
            <Search size={16} />
          </button>
        )}

        {/* Кнопка переключения режимов (TikTok Stream / Сетка) */}
        <button 
          className="feed-view-toggle-btn"
          onClick={() => {
            setViewMode(prev => prev === 'stream' ? 'grid' : 'stream');
          }}
          aria-label="Переключить вид"
        >
          {viewMode === 'stream' ? (
            <>
              <LayoutGrid size={16} />
              <span>{t('grid')}</span>
            </>
          ) : (
            <>
              <Smartphone size={16} />
              <span>{t('stream')}</span>
            </>
          )}
        </button>
      </div>

      {/* =========================================================
          1. РЕЖИМ TIKTOK STREAM (БЕСКОНЕЧНЫЙ ПОТОК РЕКОМЕНДАЦИЙ)
          ========================================================= */}
      {viewMode === 'stream' ? (
        <div 
          className="tiktok-stream-container"
          ref={streamContainerRef}
          onScroll={handleScroll}
        >
          {activeStreamItems.length > 0 ? (
            activeStreamItems.map((item) => {
              const isLiked = !!likedItems[item.id];
              return (
                <div 
                  key={item.feedKey} 
                  className="tiktok-slide-card"
                  onClick={(e) => handleDoubleTap(e, item)}
                >
                  {/* Фоновое видео/арт */}
                  <div 
                    className="tiktok-media-bg"
                    style={{ backgroundImage: `url(${item.media})` }}
                  />

                  {/* Плавный кинематографичный градиент затемнения */}
                  <div className="tiktok-vignette-overlay" />

                  {/* Анимированный всплеск сердца при двойном тапе */}
                  {heartBurst && heartBurst.id === item.id && (
                    <div 
                      className="tiktok-heart-burst"
                      style={{ left: `${heartBurst.x}px`, top: `${heartBurst.y}px` }}
                    >
                      <Heart size={84} color="#ff2b56" fill="#ff2b56" />
                    </div>
                  )}

                  {/* ПРАВЫЙ БЛОК ДЕЙСТВИЙ (МИНИМАЛИСТИЧНЫЙ, БЕЗ КОММЕНТАРИЕВ) */}
                  <div className="tiktok-right-actions" onClick={(e) => e.stopPropagation()}>
                    {/* Кнопка Лайка (сохраняет в Профиль) */}
                    <button 
                      className={`tiktok-action-pill ${isLiked ? 'liked' : ''}`}
                      onClick={() => toggleLike(item)}
                    >
                      <div className="action-circle-icon">
                        <Heart 
                          size={22} 
                          color={isLiked ? '#ff2b56' : '#ffffff'} 
                          fill={isLiked ? '#ff2b56' : 'transparent'} 
                        />
                      </div>
                      <span className="action-count-text">
                        {formatLikes(item.likesCount, isLiked)}
                      </span>
                    </button>

                    {/* Кнопка Поделиться */}
                    <button 
                      className="tiktok-action-pill"
                      onClick={() => handleShare(item)}
                    >
                      <div className="action-circle-icon">
                        <Share2 size={20} color="#ffffff" />
                      </div>
                      <span className="action-label-text">{t('share')}</span>
                    </button>

                    {/* Кнопка Повторить стиль (Remix) */}
                    <button 
                      className="tiktok-action-pill remix-pill"
                      onClick={() => setRemixItem(item)}
                    >
                      <div className="action-circle-icon remix-icon-wrap">
                        <Sparkles size={20} color="#e5b95c" />
                      </div>
                      <span className="action-label-text">{t('remix')}</span>
                    </button>
                  </div>

                  {/* ЛЕВЫЙ НИЖНИЙ БЛОК: ТОЛЬКО АВТОР И МОДЕЛЬ (ЧИСТО И БЕЗ ПРОМПТОВ) */}
                  <div className="tiktok-bottom-meta" onClick={(e) => e.stopPropagation()}>
                    <div className="meta-author-row">
                      <img src={item.avatar} alt={item.author} className="meta-author-avatar" />
                      <div className="meta-text-col">
                        <span className="meta-author-handle">{item.title}</span>
                        <span className="meta-model-subtitle">{item.model}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="stream-empty-search-card">
              <div className="empty-search-orb">
                <Search size={28} color="var(--color-primary-light)" />
              </div>
              <h3>Видео не найдены</h3>
              <p>По запросу «{searchQuery}» ничего не найдено</p>
              <button 
                className="btn-primary empty-search-btn"
                onClick={() => {
                  setSearchQuery('');
                  setIsStreamSearchOpen(false);
                }}
              >
                Сбросить поиск
              </button>
            </div>
          )}
        </div>
      ) : (
        /* =========================================================
            2. РЕЖИМ GRID (СЕТКА С ПОИСКОМ И ФИЛЬТРОМ ФОТО / ВИДЕО)
            ========================================================= */
        <div className="tiktok-grid-container">
          <div className="grid-header-info">
            <div className="grid-title-row">
              <h2>{t('feedTitle')}</h2>
            </div>
            <p>{t('feedSubtitle')}</p>

            {/* Вкладки: Все / Фото / Видео */}
            <div className="grid-type-tabs">
              <button 
                className={`grid-tab-btn ${gridFilterType === 'all' ? 'active' : ''}`}
                onClick={() => setGridFilterType('all')}
              >
                <span>{t('all')}</span>
              </button>

              <button 
                className={`grid-tab-btn ${gridFilterType === 'video' ? 'active' : ''}`}
                onClick={() => setGridFilterType('video')}
              >
                <Play size={12} fill="currentColor" />
                <span>{t('video')}</span>
              </button>

              <button 
                className={`grid-tab-btn ${gridFilterType === 'photo' ? 'active' : ''}`}
                onClick={() => setGridFilterType('photo')}
              >
                <Camera size={13} />
                <span>{t('photo')}</span>
              </button>
            </div>
          </div>

          {/* Сетка карточек */}
          {filteredGridItems.length > 0 ? (
            <div className="feed-2col-grid">
              {filteredGridItems.map((item) => {
                const isLiked = !!likedItems[item.id];
                return (
                  <div 
                    key={item.id} 
                    className="feed-grid-item"
                    onClick={() => handleSelectGridItem(item)}
                  >
                    <div 
                      className="grid-item-thumb" 
                      style={{ backgroundImage: `url(${item.media})` }}
                    >
                      {/* Бейдж типа медиа (Видео или Фото) */}
                      <span className={`grid-media-type-badge ${item.type}`}>
                        {item.type === 'video' ? (
                          <>
                            <Play size={10} fill="#ffffff" />
                            <span>{t('video')}</span>
                          </>
                        ) : (
                          <>
                            <Camera size={10} />
                            <span>{t('photo')}</span>
                          </>
                        )}
                      </span>

                      {/* Бейдж цены в кредитах в правом верхнем углу */}
                      <span className="grid-price-badge">
                        <span>{item.cost || 10}</span>
                        <span className="grid-price-currency">CR</span>
                      </span>
                      
                      {/* Кнопка лайка */}
                      <button 
                        className={`grid-like-badge ${isLiked ? 'liked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(item);
                        }}
                      >
                        <Heart 
                          size={13} 
                          color={isLiked ? '#ff2b56' : '#ffffff'} 
                          fill={isLiked ? '#ff2b56' : 'transparent'} 
                        />
                        <span>{formatLikes(item.likesCount, isLiked)}</span>
                      </button>
                    </div>

                    <div className="grid-item-info">
                      <span className="grid-item-title">{item.title}</span>
                      <span className="grid-item-subtitle">{item.model}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid-empty-search">
              <div className="empty-search-orb">
                <Search size={26} color="var(--color-primary-light)" />
              </div>
              <h4>Ничего не найдено</h4>
              <p>По запросу «{searchQuery}» совпадений нет.</p>
              <button 
                className="btn-primary empty-search-btn"
                onClick={() => {
                  setSearchQuery('');
                  setGridFilterType('all');
                }}
              >
                Сбросить поиск
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          3. ШТОРКА "ПОВТОРИТЬ СТИЛЬ" (REMIX BOTTOM DRAWER)
          ========================================================= */}
      {/* =========================================================
          3. ШТОРКА "МОРФИНГ-КАПСУЛА" (REMIX MORPH CAPSULE)
          ========================================================= */}
      {remixItem && (
        <div className="remix-drawer-backdrop" onClick={() => !isRemixGenerating && setRemixItem(null)}>
          <div className="remix-bottom-sheet" onClick={(e) => e.stopPropagation()}>
            {/* Ручка шторки */}
            <div className="sheet-grab-bar" />

            <div className="sheet-header">
              <div className="sheet-title-info">
                <h3>Повторить стиль</h3>
                <div className="sheet-meta-badges">
                  <span className="sheet-model-pill">{remixItem.model}</span>
                  <span className="sheet-cost-pill">{remixItem.cost} CR</span>
                </div>
              </div>
              <button 
                className="sheet-close-btn" 
                onClick={() => !isRemixGenerating && setRemixItem(null)}
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>

            {/* МОРФИНГ-КАПСУЛА (Связка стиля и лица) */}
            <div className="morph-capsule-stage">
              {/* Левая капсула: Выбранный стиль */}
              <div className="morph-card-slot style-slot">
                <div 
                  className="morph-slot-thumb" 
                  style={{ backgroundImage: `url(${remixItem.media})` }}
                >
                  <span className="morph-slot-badge">Стиль</span>
                </div>
                <span className="morph-slot-label">{remixItem.title}</span>
              </div>

              {/* Центральный связующий луч с пульсацией */}
              <div className={`morph-beam-bridge ${isRemixGenerating ? 'animating' : ''}`}>
                <div className="morph-beam-line" />
                <div className="morph-beam-node">
                  <Sparkles size={18} color="#e5b95c" />
                </div>
                <div className="morph-beam-line" />
              </div>

              {/* Правая капсула: Ваше лицо */}
              <div 
                className={`morph-card-slot face-slot ${remixPhoto ? 'has-photo' : 'empty'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setRemixPhoto(URL.createObjectURL(file));
                  }}
                  style={{ display: 'none' }}
                />

                {remixPhoto ? (
                  <div 
                    className="morph-slot-thumb user-face-thumb"
                    style={{ backgroundImage: `url(${remixPhoto})` }}
                  >
                    <span className="morph-slot-badge ready">✓ Ваше лицо</span>
                    <button 
                      className="morph-change-face-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      title="Заменить фото"
                    >
                      <Camera size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="morph-slot-thumb empty-face-thumb">
                    <div className="empty-face-camera-icon">
                      <Camera size={22} color="#ffffff" />
                    </div>
                    <span className="empty-face-cta">+ Добавить селфи</span>
                  </div>
                )}
                <span className="morph-slot-label">
                  {remixPhoto ? 'Лицо загружено' : 'Для переноса черт'}
                </span>
              </div>
            </div>

            {/* ДВА ЧЁТКИХ СЦЕНАРИЯ ДЕЙСТВИЯ (БЕЗ ТЕКСТА ПРОМПТА) */}
            <div className="remix-actions-cluster">
              {/* Главный сценарий: Создать со своим лицом */}
              <button 
                className="btn-primary remix-primary-btn"
                onClick={() => {
                  if (!remixPhoto) {
                    fileInputRef.current?.click();
                  } else {
                    handleExecuteRemix('face');
                  }
                }}
                disabled={isRemixGenerating || remixSuccess}
              >
                {isRemixGenerating && remixTargetMode === 'face' ? (
                  <>
                    <div className="spinner-mini" />
                    <span>Перенос лица в стиль...</span>
                  </>
                ) : remixSuccess && remixTargetMode === 'face' ? (
                  <>
                    <Check size={18} color="#4ade80" />
                    <span style={{ color: '#4ade80' }}>Шедевр готов! Сохранен в профиль</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    <span>{remixPhoto ? `Создать с моим лицом (${remixItem.cost} CR)` : `Загрузить селфи и создать (${remixItem.cost} CR)`}</span>
                  </>
                )}
              </button>

              {/* Альтернативный сценарий: Создать похожий арт без лица */}
              <button 
                className="remix-secondary-btn"
                onClick={() => handleExecuteRemix('noface')}
                disabled={isRemixGenerating || remixSuccess}
              >
                {isRemixGenerating && remixTargetMode === 'noface' ? (
                  <>
                    <div className="spinner-mini" />
                    <span>Генерация нового арта...</span>
                  </>
                ) : remixSuccess && remixTargetMode === 'noface' ? (
                  <>
                    <Check size={18} color="#4ade80" />
                    <span style={{ color: '#4ade80' }}>Арт готов! Сохранен в профиль</span>
                  </>
                ) : (
                  <span>Создать новый арт в этом стиле ({remixItem.cost} CR)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
