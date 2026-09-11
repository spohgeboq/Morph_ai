import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Heart, Share2, Sparkles, LayoutGrid, Smartphone, X, Check, Camera, Search, Play, ArrowUpRight, Download } from 'lucide-react';
import { useToast } from '../components/ToastContext';
import { useLanguage } from '../components/LanguageContext';
import { useUser } from '../components/UserContext';
import { 
  fetchPublicTemplates, 
  fetchModels, 
  executeRemix, 
  checkRemixStatus, 
  uploadAdminMedia 
} from '../services/api';

// База ленты загружается динамически из базы данных PostgreSQL через админку
const MASTER_FEED_DB = [];

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
  const { currentUser, balance, setBalance, refreshUser } = useUser();
  // Режим: 'stream' (TikTok) или 'grid' (Сетка)
  const [viewMode, setViewMode] = useState('stream');

  // Динамическая база с поддержкой постов из админки (строго из БД)
  const [feedDatabase, setFeedDatabase] = useState([]);

  // Загрузка живых шаблонов от админа и моделей для резолва обложек
  useEffect(() => {
    Promise.all([
      fetchPublicTemplates(),
      fetchModels().catch(() => [])
    ]).then(([templatesData, modelsData]) => {
      const modelsList = Array.isArray(modelsData) ? modelsData : [];

      const resolveAvatar = (item) => {
        if (item.model_avatar) return item.model_avatar;
        const modelName = item.model_name || item.model || '';
        if (!modelName) return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
        const lower = modelName.trim().toLowerCase();
        let match = modelsList.find(m => m.name?.toLowerCase() === lower || m.id?.toLowerCase() === lower);
        if (!match) {
          for (const m of modelsList) {
            if (Array.isArray(m.versions) && m.versions.some(v => v.name?.toLowerCase() === lower || v.id?.toLowerCase() === lower)) {
              match = m;
              break;
            }
          }
        }
        if (!match) {
          match = modelsList.find(m => {
            const mName = m.name?.toLowerCase() || '';
            const mId = m.id?.toLowerCase() || '';
            return (mName && lower.includes(mName)) || (mId && lower.includes(mId)) || (mName && mName.includes(lower));
          });
        }
        return match?.preview_url || match?.preview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
      };

      if (Array.isArray(templatesData)) {
        const isVideoMedia = (url) => typeof url === 'string' && /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url.trim());
        const mapped = templatesData.map(item => {
          const isVideo = isVideoMedia(item.video_url) || isVideoMedia(item.media_url) || (item.type === 'video' && isVideoMedia(item.media));
          const mediaUrl = isVideo ? (item.video_url || item.media_url) : (item.thumb_url || item.preview_url || item.media_url || item.video_url || item.media);

          return {
            id: `tmpl_${item.id}`,
            title: item.title || item.name || '',
            type: isVideo ? 'video' : 'photo',
            author: item.model_name || 'AI Model',
            avatar: resolveAvatar(item),
            model: item.model_name || 'Flux 1.1 Pro',
            cost: item.cost !== undefined ? item.cost : 10,
            media: mediaUrl,
            videoUrl: isVideo ? mediaUrl : null,
            likesCount: 14200 + (item.id * 311) % 15000,
            category: item.category || 'all',
            prompt: item.prompt || '',
            targetFaceUrl: item.target_face_url || null
          };
        });
        setFeedDatabase(mapped);
      }
    }).catch(err => console.error('Error loading feed templates:', err));
  }, []);

  // Динамическая лента TikTok
  const [feedItems, setFeedItems] = useState([]);
  const streamContainerRef = useRef(null);

  // При переходе из раздела "Избранное" открываем конкретный видео-шаблон
  useEffect(() => {
    if (location.state?.targetItemId) {
      const targetId = location.state.targetItemId;
      const found = feedDatabase.find(i => i.id === targetId) || location.state.item;
      if (found) {
        setViewMode('stream');
        setFeedItems(prev => {
          const others = prev.filter(i => i.id !== found.id);
          return [{ ...found, feedKey: `${found.id}_focused_${Date.now()}` }, ...others];
        });
        showToast(`Открыт видео-шаблон «${found.title}»`, 'info');
      }
    }
  }, [location.state, feedDatabase]);

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
  const [remixFile, setRemixFile] = useState(null);
  const [remixUploadedUrl, setRemixUploadedUrl] = useState(null);
  const [isRemixGenerating, setIsRemixGenerating] = useState(false);
  const [remixSuccess, setRemixSuccess] = useState(false);
  const [remixResultModal, setRemixResultModal] = useState(null);
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
    const matched = feedDatabase.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.model.toLowerCase().includes(q) ||
      item.prompt.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
    return matched.map((item, idx) => ({
      ...item,
      feedKey: `${item.id}_stream_search_${idx}`
    }));
  }, [searchQuery, feedItems, feedDatabase]);

  // Отфильтрованные карточки для Сетки
  const filteredGridItems = useMemo(() => {
    return feedDatabase.filter(item => {
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
  }, [gridFilterType, searchQuery, feedDatabase]);

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

  // 1. Инициализация умной ленты рекомендаций
  useEffect(() => {
    const initialBatch = shuffleNonRepeating(feedDatabase);
    // Добавляем уникальный instanceId для плавного бесконечного скролла
    const preparedBatch = initialBatch.map((item, idx) => ({
      ...item,
      feedKey: `${item.id}_${Date.now()}_${idx}`
    }));
    setFeedItems(preparedBatch);
  }, [feedDatabase]);

  // 2. Умная подгрузка следующей партии видео (TikTok Recommendation Engine)
  const appendRecommendedBatch = useCallback(() => {
    if (!feedDatabase || feedDatabase.length === 0) return;
    setFeedItems(prev => {
      if (!prev || prev.length === 0) return [];
      const lastItem = prev[prev.length - 1];
      
      // Анализируем предпочтения: какие категории пользователь лайкал больше всего
      const likedCategories = Object.keys(likedItems)
        .map(id => feedDatabase.find(m => m.id === id)?.category)
        .filter(Boolean);

      // Генерируем новую перемешанную партию
      let nextBatch = shuffleNonRepeating(feedDatabase, lastItem);

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
  }, [likedItems, feedDatabase]);

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

  const handlePickRemixSelfie = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRemixFile(file);
    const localUrl = URL.createObjectURL(file);
    setRemixPhoto(localUrl);

    try {
      const uploaded = await uploadAdminMedia(file, 'selfies');
      if (uploaded?.url) {
        setRemixUploadedUrl(uploaded.url);
      }
    } catch (err) {
      console.warn('Background selfie upload warning:', err.message);
    }
  };

  const handleExecuteRemix = async () => {
    if (!remixItem) return;
    const shootCost = Number(remixItem.cost) || 10;
    if (balance < shootCost) {
      showToast('Недостаточно кредитов для генерации! Пополните баланс.', 'error');
      return;
    }

    setIsRemixGenerating(true);

    try {
      let finalFaceUrl = remixUploadedUrl;
      if (!finalFaceUrl && remixFile) {
        showToast('Загрузка селфи в Cloudflare R2...', 'info');
        const uploaded = await uploadAdminMedia(remixFile, 'selfies');
        finalFaceUrl = uploaded?.url;
        setRemixUploadedUrl(finalFaceUrl);
      }

      if (!finalFaceUrl) {
        throw new Error('Пожалуйста, выберите селфи для замены');
      }

      showToast(`Запуск генерации через ${remixItem.model}...`, 'info');
      const startRes = await executeRemix({
        template_id: remixItem.id,
        face_url: finalFaceUrl,
        telegram_id: currentUser?.telegram_id || currentUser?.id,
        user_id: currentUser?.id,
        mode: 'face'
      });

      if (!startRes.success || !startRes.task_id) {
        throw new Error(startRes.message || 'Ошибка запуска генерации');
      }

      if (startRes.balance !== undefined) {
        setBalance(startRes.balance);
      } else {
        setBalance(b => Math.max(0, b - shootCost));
      }

      const taskId = startRes.task_id;
      const modelUsed = startRes.model || remixItem.model;

      // Поллинг статуса задачи в PiAPI / FaceSwap
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await checkRemixStatus(taskId);
          if (statusRes.status === 'completed' && statusRes.result_url) {
            clearInterval(pollInterval);
            setIsRemixGenerating(false);
            setRemixSuccess(true);
            showToast(`✨ Генерация через ${modelUsed} завершена!`, 'success');
            if (refreshUser) refreshUser();

            setRemixResultModal({
              url: statusRes.result_url,
              type: remixItem.type,
              title: remixItem.title,
              model: modelUsed
            });

            setTimeout(() => {
              setRemixSuccess(false);
              setRemixItem(null);
              setRemixPhoto(null);
              setRemixUploadedUrl(null);
              setRemixFile(null);
            }, 1000);
          } else if (statusRes.status === 'failed') {
            clearInterval(pollInterval);
            setIsRemixGenerating(false);
            showToast(statusRes.error_message || 'Ошибка обработки в нейросети', 'error');
            if (refreshUser) refreshUser();
          }
        } catch (pollErr) {
          console.warn('[Remix Poll]', pollErr.message);
        }
      }, 2500);

      // Защитный таймаут на 3.5 минуты
      setTimeout(() => {
        clearInterval(pollInterval);
        setIsRemixGenerating(false);
      }, 210000);

    } catch (err) {
      setIsRemixGenerating(false);
      showToast(err.message || 'Ошибка генерации', 'error');
    }
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
                  {(item.type === 'video' && item.videoUrl) ? (
                    <video 
                      src={item.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="tiktok-media-bg"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  ) : (
                    <img 
                      src={item.media}
                      alt={item.title}
                      className="tiktok-media-bg"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      onError={(e) => {
                        e.target.style.opacity = '0.5';
                      }}
                    />
                  )}

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
                      <img 
                        src={item.avatar} 
                        alt={item.model || item.author} 
                        className="meta-author-avatar" 
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                        }}
                      />
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
              <h3>{searchQuery ? 'Видео не найдены' : 'В ленте пока нет публикаций'}</h3>
              <p>{searchQuery ? `По запросу «${searchQuery}» ничего не найдено` : 'Администратор может добавить новые посты через панель управления.'}</p>
              {searchQuery && (
                <button 
                  className="btn-primary empty-search-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setIsStreamSearchOpen(false);
                  }}
                >
                  Сбросить поиск
                </button>
              )}
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
                    <div className="grid-item-thumb">
                      {(item.type === 'video' && item.videoUrl) ? (
                        <video 
                          src={item.videoUrl} 
                          muted 
                          loop 
                          playsInline 
                          autoPlay 
                          className="grid-item-thumb-video" 
                        />
                      ) : (
                        <div 
                          className="grid-item-thumb-bg" 
                          style={{ backgroundImage: `url(${item.media || item.thumb_url})` }} 
                        />
                      )}
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
              <h4>{searchQuery ? 'Ничего не найдено' : 'В ленте пока нет публикаций'}</h4>
              <p>{searchQuery ? `По запросу «${searchQuery}» совпадений нет.` : 'Администратор может добавить новые посты через панель управления.'}</p>
              {searchQuery && (
                <button 
                  className="btn-primary empty-search-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setGridFilterType('all');
                  }}
                >
                  Сбросить поиск
                </button>
              )}
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
                  onChange={handlePickRemixSelfie}
                  style={{ display: 'none' }}
                />

                {remixPhoto ? (
                  <div 
                    className="morph-slot-thumb user-face-thumb"
                    style={{ backgroundImage: `url(${remixPhoto})` }}
                  >
                    <span className="morph-slot-badge ready">Ваше лицо</span>
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
                  {remixPhoto ? 'Селфи выбрано' : 'Для переноса лица'}
                </span>
              </div>
            </div>

            {/* Подсказка о Главном Герое, если он задан админом */}
            {remixItem.targetFaceUrl && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 12px',
                background: 'rgba(229, 185, 92, 0.08)',
                border: '1px solid rgba(229, 185, 92, 0.25)',
                borderRadius: '10px',
                marginBottom: '12px'
              }}>
                <img 
                  src={remixItem.targetFaceUrl} 
                  alt="ГГ" 
                  style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e5b95c' }} 
                />
                <span style={{ fontSize: '0.75rem', color: '#e5b95c', fontWeight: 500 }}>
                  Главный Герой задан: нейросеть заменит именно этого персонажа в видео/фото
                </span>
              </div>
            )}

            {/* ГЛАВНОЕ ДЕЙСТВИЕ: ГЕНЕРАЦИЯ ЧЕРЕЗ МОДЕЛЬ ШАБЛОНА */}
            <div className="remix-actions-cluster">
              <button 
                className="btn-primary remix-primary-btn"
                onClick={() => {
                  if (!remixPhoto) {
                    fileInputRef.current?.click();
                  } else {
                    handleExecuteRemix();
                  }
                }}
                disabled={isRemixGenerating || remixSuccess}
              >
                {isRemixGenerating ? (
                  <>
                    <div className="spinner-mini" />
                    <span>Генерация через {remixItem.model}...</span>
                  </>
                ) : remixSuccess ? (
                  <>
                    <Check size={18} color="#4ade80" />
                    <span style={{ color: '#4ade80' }}>Шедевр готов! Сохранен в профиль</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    <span>{remixPhoto ? `Создать через ${remixItem.model} (${remixItem.cost} CR)` : `Загрузить селфи и создать через ${remixItem.model}`}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА ГОТОВОГО РЕЗУЛЬТАТА REMIX */}
      {remixResultModal && (
        <div className="photoshoot-modal-overlay" onClick={() => setRemixResultModal(null)}>
          <div className="photoshoot-modal-header" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title-info">
              <h3>Готово! Результат через {remixResultModal.model}</h3>
              <span className="modal-title-sub">{remixResultModal.title}</span>
            </div>
            <button 
              className="photoshoot-modal-close"
              onClick={() => setRemixResultModal(null)}
            >
              <X size={22} />
            </button>
          </div>

          <div className="photoshoot-modal-gallery" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
            {remixResultModal.type === 'video' || /\.(mp4|webm|mov)(\?.*)?$/i.test(remixResultModal.url) ? (
              <video 
                src={remixResultModal.url} 
                controls 
                autoPlay 
                playsInline 
                loop
                style={{ maxHeight: '65vh', maxWidth: '100%', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.8)' }} 
              />
            ) : (
              <img 
                src={remixResultModal.url} 
                alt="Result" 
                style={{ maxHeight: '65vh', maxWidth: '100%', borderRadius: '16px', objectFit: 'contain', boxShadow: '0 8px 30px rgba(0,0,0,0.8)' }} 
              />
            )}
          </div>

          <div className="photoshoot-modal-footer" onClick={(e) => e.stopPropagation()}>
            <a 
              href={remixResultModal.url} 
              download={`morphai_remix_${Date.now()}.${remixResultModal.type === 'video' ? 'mp4' : 'jpg'}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary photoshoot-download-all-btn"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={() => showToast('Файл скачивается...', 'success')}
            >
              <Download size={18} />
              <span>Скачать в максимальном качестве</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
