import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Sparkles, 
  Plus, 
  Heart, 
  ShieldCheck, 
  Globe, 
  Send, 
  FileText, 
  Trash2, 
  LogOut, 
  X, 
  Film, 
  Image as ImageIcon, 
  ExternalLink,
  ChevronRight,
  FolderPlus,
  ArrowLeft,
  Folder,
  Check,
  ShieldAlert,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { useToast } from '../components/ToastContext';
import { useLanguage } from '../components/LanguageContext';

// Базовые демонстрационные генерации автора с привязкой к сессиям чатов
const INITIAL_MY_CREATIONS = [
  {
    id: 'c1',
    chatId: 'chat-2',
    title: 'Неоновая Сакура в Киото',
    type: 'video',
    media: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robot-turning-its-head-41477-large.mp4',
    thumb: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
    model: 'Kling 1.5 HD',
    cost: 12,
    prompt: 'Киберпанк девушка под неоновой сакурой в Киото, голографический дождь, отражения на мокром асфальте, 8k, кинематографичный свет',
    date: 'Сегодня, 14:30'
  },
  {
    id: 'c2',
    chatId: 'chat-3',
    title: 'Old Money Портрет 35mm',
    type: 'photo',
    thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    model: 'Flux 1.1 Pro',
    cost: 10,
    prompt: 'Эстетичный женский портрет в стиле старых денег, 35mm пленочный снимок Kodak Portra, мягкий естественный свет, пастельные тона',
    date: 'Вчера, 19:10'
  },
  {
    id: 'c3',
    chatId: 'chat-1',
    title: 'Космический Кристалл',
    type: 'photo',
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    model: 'Midjourney v6',
    cost: 8,
    prompt: 'Огромный светящийся кристалл в открытом космосе среди туманностей, абстрактная геометрия, фотореализм, 4K render',
    date: '2 дня назад'
  },
  {
    id: 'c4',
    chatId: 'chat-2',
    title: 'Бегущий по лезвию 2099',
    type: 'video',
    media: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-vintage-camera-42845-large.mp4',
    thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
    model: 'Runway Gen-3',
    cost: 16,
    prompt: 'Футуристический летающий автомобиль сквозь смог ночного мегаполиса, свет фар в тумане, динамичный пролет камеры',
    date: '3 дня назад'
  }
];

// Демонстрационные понравившиеся видео-шаблоны из Ленты для вкладки "Избранное"
const DEMO_LIKED_ITEMS = [
  {
    id: 'f1',
    title: 'Neon Tokyo Cyberpunk',
    type: 'video',
    author: '@cyber_morph',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    model: 'Kling 1.5 HD',
    cost: 10,
    media: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=900&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
    likesCount: 14200,
    category: 'cyberpunk',
    prompt: 'Киберпанк девушка в неоновом дожде, отражения мокрого асфальта, 8K Ultra HD, кинематографичный свет',
    date: 'Из Ленты'
  },
  {
    id: 'f3',
    title: 'Cinematic Fashion Runway',
    type: 'video',
    author: '@vogue_ai',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    model: 'Runway Gen-3',
    cost: 12,
    media: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
    likesCount: 18900,
    category: 'creative',
    prompt: 'Высокая мода на подиуме в Париже, динамичный свет софитов, замедленная съемка 120fps',
    date: 'Из Ленты'
  }
];

// Начальные альбомы
const INITIAL_ALBUMS = [
  { 
    id: 'a1', 
    title: 'Киберпанк & Неон', 
    cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop',
    itemIds: ['c1', 'c4']
  },
  { 
    id: 'a2', 
    title: 'Old Money 35mm', 
    cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    itemIds: ['c2']
  },
  { 
    id: 'a3', 
    title: 'Cinematic Video', 
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop',
    itemIds: ['c1', 'c4']
  },
  { 
    id: 'a4', 
    title: 'Concept Art & 3D', 
    cover: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop',
    itemIds: ['c3']
  }
];

const Profile = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { showToast, showConfirm } = useToast();

  // Основная верхняя вкладка: 'profile' (Профиль) | 'settings' (Настройки)
  const [topTab, setTopTab] = useState('profile');

  // Внутренняя вкладка галереи: 'creations' | 'liked' | 'albums'
  const [galleryTab, setGalleryTab] = useState('creations');

  // Фильтр типа контента: 'all' | 'photo' | 'video'
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');

  // Баланс токенов
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('morphai_balance');
    return saved ? parseInt(saved, 10) : 120;
  });

  // Пользователь Telegram WebApp
  const [tgUser, setTgUser] = useState(null);

  // Избранные из ленты
  const [likedFeedItems, setLikedFeedItems] = useState(DEMO_LIKED_ITEMS);

  // Мои генерации
  const [myCreations, setMyCreations] = useState(INITIAL_MY_CREATIONS);

  // Альбомы
  const [albums, setAlbums] = useState(() => {
    try {
      const saved = localStorage.getItem('morphai_user_albums');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_ALBUMS;
  });

  // Открытый альбом для просмотра
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // Состояния модалов
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [activeDocModal, setActiveDocModal] = useState(null); // 'terms' | 'privacy'

  // Модалы для работы с альбомами
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [selectedCover, setSelectedCover] = useState('');
  const [showManageAlbumWorksModal, setShowManageAlbumWorksModal] = useState(false);

  // Тактильный отклик через Telegram WebApp
  const triggerHaptic = (style = 'light') => {
    try {
      if (WebApp?.HapticFeedback) {
        if (style === 'success') WebApp.HapticFeedback.notificationOccurred('success');
        else WebApp.HapticFeedback.impactOccurred(style);
      }
    } catch (e) {}
  };

  // Загрузка данных пользователя Telegram и локальных сохранений
  useEffect(() => {
    try {
      if (WebApp?.initDataUnsafe?.user) {
        setTgUser(WebApp.initDataUnsafe.user);
      }
    } catch (e) {
      console.log('TG user read error:', e);
    }

    try {
      const savedLiked = localStorage.getItem('morphai_liked_feed');
      if (savedLiked) {
        const parsed = JSON.parse(savedLiked);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLikedFeedItems(parsed);
        }
      }
    } catch (err) {}

    try {
      const savedCreations = localStorage.getItem('morphai_creations');
      if (savedCreations) {
        const parsed = JSON.parse(savedCreations);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMyCreations(parsed);
        }
      }
    } catch (err) {}
  }, []);

  // Сохранение баланса
  const handleUpdateBalance = (addedAmount) => {
    const newBal = balance + addedAmount;
    setBalance(newBal);
    localStorage.setItem('morphai_balance', newBal.toString());
    triggerHaptic('success');
    setShowRechargeModal(false);
    showToast(t('tokensCredited', { amount: addedAmount }), 'token');
  };

  // Создание нового альбома
  const handleCreateAlbum = () => {
    if (!newAlbumTitle.trim()) {
      showToast(t('albumNameLabel'), 'error');
      return;
    }
    triggerHaptic('success');
    const coverUrl = selectedCover || myCreations[0]?.thumb || myCreations[0]?.media || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop';
    
    const newAlbum = {
      id: 'a_' + Date.now(),
      title: newAlbumTitle.trim(),
      cover: coverUrl,
      itemIds: []
    };

    const updated = [newAlbum, ...albums];
    setAlbums(updated);
    localStorage.setItem('morphai_user_albums', JSON.stringify(updated));
    setNewAlbumTitle('');
    setSelectedCover('');
    setShowCreateAlbumModal(false);
    setSelectedAlbum(newAlbum);
    showToast(t('albumCreated'), 'success');
  };

  // Удаление альбома
  const handleDeleteAlbum = (albumId) => {
    triggerHaptic('medium');
    showConfirm({
      title: t('deleteConfirmTitle'),
      message: t('deleteConfirmDesc'),
      confirmText: t('deleteBtn'),
      isDanger: true,
      onConfirm: () => {
        const updated = albums.filter(a => a.id !== albumId);
        setAlbums(updated);
        localStorage.setItem('morphai_user_albums', JSON.stringify(updated));
        setSelectedAlbum(null);
        showToast(t('albumDeleted'), 'info');
      }
    });
  };

  // Управление составом работ внутри альбома (добавить / убрать)
  const handleToggleWorkInAlbum = (workId) => {
    if (!selectedAlbum) return;
    triggerHaptic('light');
    const currentIds = selectedAlbum.itemIds || [];
    const exists = currentIds.includes(workId);
    const newIds = exists ? currentIds.filter(id => id !== workId) : [...currentIds, workId];
    
    const targetWork = myCreations.find(w => w.id === workId);
    const updatedAlbum = {
      ...selectedAlbum,
      itemIds: newIds,
      cover: selectedAlbum.cover || targetWork?.thumb || targetWork?.media
    };
    
    setSelectedAlbum(updatedAlbum);
    const updatedAlbums = albums.map(a => a.id === selectedAlbum.id ? updatedAlbum : a);
    setAlbums(updatedAlbums);
    localStorage.setItem('morphai_user_albums', JSON.stringify(updatedAlbums));
  };

  // Клик по работе: В 1 ТАП СРАЗУ В ЧАТ ИЛИ В ЛЕНТУ!
  const handleWorkClick = (item) => {
    triggerHaptic('medium');
    if (galleryTab === 'liked') {
      showToast(item.title, 'info');
      navigate('/feed', { state: { targetItemId: item.id, item } });
      return;
    }
    // В блоке "Генерации" (и в альбомах): моментальный переход в ЧАТ с этой генерацией
    navigate('/chats', { state: { work: item, chatId: item.chatId } });
  };

  // Очистка кэша
  const handleClearCache = () => {
    triggerHaptic('medium');
    showConfirm({
      title: t('clearCacheConfirmTitle'),
      message: t('clearCacheConfirmDesc'),
      confirmText: t('clearBtn'),
      isDanger: false,
      onConfirm: () => {
        localStorage.removeItem('morphai_creations_cache');
        showToast(t('clearCacheSuccess'), 'success');
      }
    });
  };

  // Выход
  const handleLogout = () => {
    triggerHaptic('medium');
    showConfirm({
      title: t('logoutConfirmTitle'),
      message: t('logoutConfirmDesc'),
      confirmText: t('logout'),
      isDanger: true,
      onConfirm: () => {
        showToast(t('logoutSessionEnded'), 'info');
        navigate('/');
      }
    });
  };

  // Смена языка
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    triggerHaptic('light');
    const langNames = { ru: 'Русский', en: 'English', kz: 'Қазақша' };
    showToast(`${langNames[newLang] || newLang} ✓`, 'success');
  };

  // Фильтрация текущего списка работ
  const currentList = galleryTab === 'creations' ? myCreations : likedFeedItems;
  const filteredCreations = currentList.filter(item => {
    if (mediaTypeFilter === 'all') return true;
    return item.type === mediaTypeFilter;
  });

  // Получение инициалов и отображаемого имени
  const displayName = tgUser 
    ? `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || tgUser.username || 'Morphi Creator'
    : 'Morphi Creator';
  const displayUsername = tgUser?.username ? `@${tgUser.username}` : '@creator';
  const avatarLetter = displayName.charAt(0).toUpperCase() || 'M';

  return (
    <div className="page-container" style={{ paddingBottom: '120px' }}>
      <div className="profile-page-wrapper">
        
        {/* Верхний сегментированный свитчер (Профиль / Настройки) */}
        <div className="profile-top-switcher">
          <button 
            className={`profile-top-tab ${topTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              triggerHaptic('light');
              setTopTab('profile');
            }}
          >
            <User size={16} />
            <span>{t('tabProfile')}</span>
          </button>
          
          <button 
            className={`profile-top-tab ${topTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              triggerHaptic('light');
              setTopTab('settings');
            }}
          >
            <Settings size={16} />
            <span>{t('tabSettings')}</span>
          </button>
        </div>

        {/* =========================================================================
            ВКЛАДКА 1: ПРОФИЛЬ (КАБИНЕТ КРЕАТОРА, БАЛАНС, ГАЛЕРЕЯ)
           ========================================================================= */}
        {topTab === 'profile' ? (
          <>
            {/* Hero карточка пользователя */}
            <div className="profile-hero-card">
              <div className="profile-avatar-wrap">
                {tgUser?.photo_url ? (
                  <img src={tgUser.photo_url} alt={displayName} className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-fallback">
                    {avatarLetter}
                  </div>
                )}
                <div className="profile-avatar-status" title="Online" />
              </div>

              <div className="profile-user-info">
                <div className="profile-user-name-row">
                  <h2 className="profile-user-name">{displayName}</h2>
                  <span className="profile-pro-badge">
                    <Sparkles size={10} />
                    <span>PRO</span>
                  </span>
                </div>

                <p className="profile-username-tag">{displayUsername}</p>

                <div className="profile-user-meta-row">
                  <div className="profile-meta-chip">
                    <ShieldCheck size={13} color="var(--color-accent)" />
                    <span>ID: {tgUser?.id || '849201'}</span>
                  </div>
                  <span>•</span>
                  <span>Unlimited 4K</span>
                </div>
              </div>
            </div>

            {/* Карточка баланса кредитов */}
            <div className="profile-balance-card">
              <div className="profile-balance-left">
                <span className="profile-balance-title">{t('tokenBalance')}</span>
                <div className="profile-balance-val-row">
                  <span className="profile-balance-number">{balance}</span>
                  <span className="profile-balance-currency">CR</span>
                </div>
                <span className="profile-balance-hint">
                  {t('approxHint', { photos: Math.floor(balance / 10), videos: Math.floor(balance / 12) })}
                </span>
              </div>

              <button 
                className="profile-recharge-btn"
                onClick={() => {
                  triggerHaptic('medium');
                  setShowRechargeModal(true);
                }}
              >
                <Plus size={16} strokeWidth={3} />
                <span>{t('recharge')}</span>
              </button>
            </div>

            {/* Витрина контента креатора */}
            <div className="profile-content-header">
              {/* Вкладки витрины */}
              <div className="profile-content-tabs">
                <button 
                  className={`profile-tab-btn ${galleryTab === 'creations' ? 'active' : ''}`}
                  onClick={() => {
                    triggerHaptic('light');
                    setGalleryTab('creations');
                    setSelectedAlbum(null);
                  }}
                >
                  <span>{t('tabGenerations')}</span>
                </button>

                <button 
                  className={`profile-tab-btn ${galleryTab === 'liked' ? 'active' : ''}`}
                  onClick={() => {
                    triggerHaptic('light');
                    setGalleryTab('liked');
                    setSelectedAlbum(null);
                  }}
                >
                  <span>{t('tabLiked')}</span>
                </button>

                <button 
                  className={`profile-tab-btn ${galleryTab === 'albums' ? 'active' : ''}`}
                  onClick={() => {
                    triggerHaptic('light');
                    setGalleryTab('albums');
                  }}
                >
                  <span>{t('tabAlbums')}</span>
                </button>
              </div>

              {/* Фильтры типов (Все / Фото / Видео) */}
              {galleryTab !== 'albums' && (
                <div className="profile-type-filters">
                  <button 
                    className={`profile-type-pill ${mediaTypeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      triggerHaptic('light');
                      setMediaTypeFilter('all');
                    }}
                  >
                    {t('filterAll')}
                  </button>
                  <button 
                    className={`profile-type-pill ${mediaTypeFilter === 'photo' ? 'active' : ''}`}
                    onClick={() => {
                      triggerHaptic('light');
                      setMediaTypeFilter('photo');
                    }}
                  >
                    {t('filterPhoto')}
                  </button>
                  <button 
                    className={`profile-type-pill ${mediaTypeFilter === 'video' ? 'active' : ''}`}
                    onClick={() => {
                      triggerHaptic('light');
                      setMediaTypeFilter('video');
                    }}
                  >
                    {t('filterVideo')}
                  </button>
                </div>
              )}
            </div>

            {/* =========================================================================
                КОНТЕНТ ВИТРИНЫ: АЛЬБОМЫ ИЛИ ГЕНЕРАЦИИ
               ========================================================================= */}
            {galleryTab === 'albums' ? (
              /* РЕЖИМ АЛЬБОМОВ */
              selectedAlbum ? (
                /* Детальный просмотр выбранного альбома */
                <div className="profile-album-detail-view">
                  {/* Стильный верхний навбар альбома */}
                  <div className="profile-album-nav-bar">
                    <button 
                      className="profile-album-nav-back"
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedAlbum(null);
                      }}
                    >
                      <ArrowLeft size={16} />
                      <span>{t('backToAlbums')}</span>
                    </button>

                    <div className="profile-album-nav-actions">
                      <button 
                        className="profile-album-action-add"
                        title={t('addWorks')}
                        onClick={() => {
                          triggerHaptic('light');
                          setShowManageAlbumWorksModal(true);
                        }}
                      >
                        <Plus size={18} strokeWidth={2.5} />
                      </button>

                      <button 
                        className="profile-album-action-delete"
                        title={t('deleteBtn')}
                        onClick={() => handleDeleteAlbum(selectedAlbum.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Баннер с названием альбома и количеством */}
                  <div className="profile-album-info-banner">
                    <h3 className="profile-album-main-title">{selectedAlbum.title}</h3>
                    <div className="profile-album-meta-count">
                      <span className="profile-album-dot-indicator" />
                      <span>
                        {selectedAlbum.itemIds?.length || 0} {selectedAlbum.itemIds?.length === 1 ? t('workInCollection') : t('worksInCollection')}
                      </span>
                    </div>
                  </div>

                  {(() => {
                    const albumWorks = myCreations.filter(c => selectedAlbum.itemIds?.includes(c.id));
                    return (
                      <div className="profile-gallery-grid">
                        {/* Карточка быстрого добавления прямо в сетке альбома */}
                        <div 
                          className="profile-create-album-card"
                          style={{ minHeight: '180px' }}
                          onClick={() => {
                            triggerHaptic('medium');
                            setShowManageAlbumWorksModal(true);
                          }}
                        >
                          <div className="profile-create-album-icon-wrap">
                            <Plus size={22} strokeWidth={3} />
                          </div>
                          <span className="profile-create-album-label">+ {t('addWorks')}</span>
                          <span className="profile-create-album-sub">{t('tabGenerations')}</span>
                        </div>

                        {albumWorks.map((item) => (
                          <div 
                            key={item.id} 
                            className="profile-work-card"
                            onClick={() => handleWorkClick(item)}
                          >
                            <img 
                              src={item.thumb || item.media} 
                              alt={item.title} 
                              className="profile-work-thumb" 
                            />
                            <div className="profile-work-overlay">
                              <div className="profile-work-top-badges">
                                <span className="profile-work-model-tag">{item.model || 'Flux'}</span>
                                <div className="profile-work-media-badge">
                                  {item.type === 'video' ? <Film size={12} /> : <ImageIcon size={12} />}
                                </div>
                              </div>
                              <div className="profile-work-bottom-info">
                                <span className="profile-work-title">{item.title}</span>
                                <span className="profile-work-date">{item.date || t('tabAlbums')}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Сетка альбомов с первой кнопкой "Создать альбом" */
                <div className="profile-albums-grid">
                  
                  {/* Кнопка создания альбома */}
                  <div 
                    className="profile-create-album-card"
                    onClick={() => {
                      triggerHaptic('medium');
                      setShowCreateAlbumModal(true);
                    }}
                  >
                    <div className="profile-create-album-icon-wrap">
                      <Plus size={22} strokeWidth={3} />
                    </div>
                    <span className="profile-create-album-label">{t('createAlbum')}</span>
                    <span className="profile-create-album-sub">{t('newCollection')}</span>
                  </div>

                  {/* Существующие альбомы */}
                  {albums.map((album) => (
                    <div 
                      key={album.id} 
                      className="profile-album-card"
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedAlbum(album);
                      }}
                    >
                      <img src={album.cover} alt={album.title} className="profile-album-cover" />
                      <div className="profile-album-gradient">
                        <span className="profile-album-name">{album.title}</span>
                        <span className="profile-album-count">
                          {album.itemIds?.length || 0} {album.itemIds?.length === 1 ? t('workInCollection') : t('worksInCollection')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : filteredCreations.length > 0 ? (
              /* Сетка работ креатора (Генерации или Избранное) */
              <div className="profile-gallery-grid">
                {filteredCreations.map((item) => (
                  <div 
                    key={item.id} 
                    className="profile-work-card"
                    onClick={() => handleWorkClick(item)}
                  >
                    <img 
                      src={item.thumb || item.media} 
                      alt={item.title} 
                      className="profile-work-thumb" 
                    />
                    <div className="profile-work-overlay">
                      <div className="profile-work-top-badges">
                        <span className="profile-work-model-tag">{item.model || 'Flux'}</span>
                        <div className="profile-work-media-badge">
                          {item.type === 'video' ? <Film size={12} /> : <ImageIcon size={12} />}
                        </div>
                      </div>

                      <div className="profile-work-bottom-info">
                        <span className="profile-work-title">{item.title}</span>
                        <span className="profile-work-date">
                          {galleryTab === 'liked' ? '🎬 ' + t('goToFeed') : (item.date || 'Morphi AI')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Пустой стейт витрины */
              <div className="profile-empty-gallery">
                <div className="profile-empty-icon-wrap">
                  {galleryTab === 'liked' ? <Heart size={26} /> : <Sparkles size={26} />}
                </div>
                <h4 className="profile-empty-title">
                  {galleryTab === 'liked' ? t('emptyLikedTitle') : t('emptyGenTitle')}
                </h4>
                <p className="profile-empty-desc">
                  {galleryTab === 'liked' ? t('emptyLikedDesc') : t('emptyGenDesc')}
                </p>
                <button 
                  className="profile-empty-btn"
                  onClick={() => {
                    triggerHaptic('medium');
                    navigate(galleryTab === 'liked' ? '/feed' : '/create');
                  }}
                >
                  {galleryTab === 'liked' ? (
                    <>
                      <Film size={16} />
                      <span>{t('goToFeed')}</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>{t('createMasterpiece')}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          /* =========================================================================
              ВКЛАДКА 2: НАСТРОЙКИ (SETTINGS SUITE - ЧИСТО, ПОНЯТНО И БЕЗОПАСНО)
             ========================================================================= */
          <div className="profile-settings-container">
            
            {/* Плашка безопасности & Telegram Verified */}
            <div className="profile-security-banner">
              <div className="profile-security-icon-wrap">
                <ShieldCheck size={22} color="#10b981" />
              </div>
              <div className="profile-security-text">
                <h4>{t('secBadgeTitle')}</h4>
                <p>{t('secBadgeDesc')}</p>
              </div>
            </div>

            {/* Группа 1: Локализация (Выбор языка с мгновенным переключением) */}
            <div className="profile-settings-group">
              <span className="profile-settings-group-title">
                <Globe size={14} color="var(--color-primary-light)" />
                <span>{t('langSectionTitle')}</span>
              </span>

              <div className="profile-setting-item">
                <div className="profile-setting-left">
                  <div className="profile-setting-icon-box">
                    <Globe size={18} />
                  </div>
                  <div className="profile-setting-texts">
                    <span className="profile-setting-label">{t('langLabel')}</span>
                    <span className="profile-setting-desc">{t('langDesc')}</span>
                  </div>
                </div>
                <div className="profile-setting-right">
                  <select 
                    className="profile-select-inline"
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                  >
                    <option value="ru">Русский 🇷🇺</option>
                    <option value="en">English 🇬🇧</option>
                    <option value="kz">Қазақша 🇰🇿</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Группа 2: Конфиденциальность, Защита данных & AI Безопасность */}
            <div className="profile-settings-group">
              <span className="profile-settings-group-title">
                <Lock size={14} color="var(--color-primary-light)" />
                <span>{t('legalSectionTitle')}</span>
              </span>

              {/* Политика конфиденциальности */}
              <div 
                className="profile-setting-item" 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveDocModal('privacy');
                }}
              >
                <div className="profile-setting-left">
                  <div className="profile-setting-icon-box">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="profile-setting-texts">
                    <span className="profile-setting-label">{t('privacyPolicy')}</span>
                    <span className="profile-setting-desc">{t('privacyDesc')}</span>
                  </div>
                </div>
                <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
              </div>

              {/* Правила сервиса & AI Безопасность */}
              <div 
                className="profile-setting-item" 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveDocModal('terms');
                }}
              >
                <div className="profile-setting-left">
                  <div className="profile-setting-icon-box">
                    <ShieldAlert size={18} />
                  </div>
                  <div className="profile-setting-texts">
                    <span className="profile-setting-label">{t('termsAndSafety')}</span>
                    <span className="profile-setting-desc">{t('termsDesc')}</span>
                  </div>
                </div>
                <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
              </div>
            </div>

            {/* Группа 3: Информация, Поддержка & Память */}
            <div className="profile-settings-group">
              <span className="profile-settings-group-title">
                <Sparkles size={14} color="var(--color-primary-light)" />
                <span>{t('supportSectionTitle')}</span>
              </span>

              {/* Чат с поддержкой */}
              <div 
                className="profile-setting-item" 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  triggerHaptic('light');
                  try {
                    if (WebApp?.openTelegramLink) {
                      WebApp.openTelegramLink('https://t.me/telegram');
                    } else {
                      window.open('https://t.me/telegram', '_blank');
                    }
                  } catch (e) {
                    window.open('https://t.me/telegram', '_blank');
                  }
                }}
              >
                <div className="profile-setting-left">
                  <div className="profile-setting-icon-box">
                    <Send size={18} />
                  </div>
                  <div className="profile-setting-texts">
                    <span className="profile-setting-label">{t('supportCare')}</span>
                    <span className="profile-setting-desc">{t('supportCareDesc')}</span>
                  </div>
                </div>
                <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
              </div>

              {/* Официальный канал */}
              <div 
                className="profile-setting-item" 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  triggerHaptic('light');
                  try {
                    if (WebApp?.openTelegramLink) {
                      WebApp.openTelegramLink('https://t.me/telegram');
                    } else {
                      window.open('https://t.me/telegram', '_blank');
                    }
                  } catch (e) {
                    window.open('https://t.me/telegram', '_blank');
                  }
                }}
              >
                <div className="profile-setting-left">
                  <div className="profile-setting-icon-box">
                    <Sparkles size={18} />
                  </div>
                  <div className="profile-setting-texts">
                    <span className="profile-setting-label">{t('officialChannel')}</span>
                    <span className="profile-setting-desc">{t('officialChannelDesc')}</span>
                  </div>
                </div>
                <ExternalLink size={16} color="rgba(255,255,255,0.3)" />
              </div>

              {/* Очистить кэш */}
              <div 
                className="profile-setting-item" 
                style={{ cursor: 'pointer' }}
                onClick={handleClearCache}
              >
                <div className="profile-setting-left">
                  <div className="profile-setting-icon-box">
                    <Trash2 size={18} />
                  </div>
                  <div className="profile-setting-texts">
                    <span className="profile-setting-label">{t('clearCache')}</span>
                    <span className="profile-setting-desc">{t('clearCacheDesc')}</span>
                  </div>
                </div>
                <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
              </div>
            </div>

            {/* Кнопка выхода */}
            <button className="profile-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>{t('logout')}</span>
            </button>
          </div>
        )}

      </div>

      {/* =========================================================================
          МОДАЛ 1: ПОПОЛНЕНИЕ БАЛАНСА
         ========================================================================= */}
      {showRechargeModal && (
        <div className="profile-modal-backdrop" onClick={() => setShowRechargeModal(false)}>
          <div className="profile-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3 className="profile-modal-title">
                <Sparkles size={20} color="var(--color-primary-light)" />
                <span>{t('rechargeModalTitle')}</span>
              </h3>
              <button 
                className="profile-modal-close-btn"
                onClick={() => setShowRechargeModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.84rem', marginBottom: '18px' }}>
              {t('rechargeModalDesc')}
            </p>

            <div className="profile-recharge-grid">
              {/* Пакет 100 CR */}
              <div 
                className="profile-recharge-item"
                onClick={() => handleUpdateBalance(100)}
              >
                <div className="profile-recharge-item-left">
                  <div className="profile-recharge-token-icon">💎</div>
                  <div className="profile-recharge-token-info">
                    <h4>+100 Credits</h4>
                    <p>{t('pack100Hint')}</p>
                  </div>
                </div>
                <button className="profile-recharge-price-btn">199 ₽</button>
              </div>

              {/* Пакет 350 CR (Хит) */}
              <div 
                className="profile-recharge-item popular"
                onClick={() => handleUpdateBalance(350)}
              >
                <span className="profile-recharge-badge-hit">{t('hitBadge')}</span>
                <div className="profile-recharge-item-left">
                  <div className="profile-recharge-token-icon">💎</div>
                  <div className="profile-recharge-token-info">
                    <h4>+350 Credits</h4>
                    <p>{t('pack350Hint')}</p>
                  </div>
                </div>
                <button className="profile-recharge-price-btn">499 ₽</button>
              </div>

              {/* Пакет 1250 CR (VIP) */}
              <div 
                className="profile-recharge-item"
                onClick={() => handleUpdateBalance(1250)}
              >
                <div className="profile-recharge-item-left">
                  <div className="profile-recharge-token-icon">💎</div>
                  <div className="profile-recharge-token-info">
                    <h4>+1250 Credits</h4>
                    <p>{t('vipBadge')}</p>
                  </div>
                </div>
                <button className="profile-recharge-price-btn">1 490 ₽</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          МОДАЛ 2: СОЗДАНИЕ АЛЬБОМА
         ========================================================================= */}
      {showCreateAlbumModal && (
        <div className="profile-modal-backdrop" onClick={() => setShowCreateAlbumModal(false)}>
          <div className="profile-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3 className="profile-modal-title">
                <FolderPlus size={20} color="var(--color-primary-light)" />
                <span>{t('createAlbum')}</span>
              </h3>
              <button 
                className="profile-modal-close-btn"
                onClick={() => setShowCreateAlbumModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="profile-album-form">
              {/* Поле ввода названия */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                  {t('albumNameLabel')}
                </label>
                <input 
                  type="text"
                  placeholder={t('albumNamePlaceholder')}
                  className="profile-album-input"
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Выбор обложки из своих работ */}
              {myCreations.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>
                    {t('chooseCover')}
                  </label>
                  <div className="profile-covers-row">
                    {myCreations.map((item) => {
                      const imgUrl = item.thumb || item.media;
                      return (
                        <div 
                          key={item.id}
                          className={`profile-cover-option ${selectedCover === imgUrl ? 'selected' : ''}`}
                          onClick={() => {
                            triggerHaptic('light');
                            setSelectedCover(imgUrl);
                          }}
                        >
                          <img src={imgUrl} alt={item.title} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Кнопка создания */}
              <button 
                className="profile-recharge-btn" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '6px', padding: '14px' }}
                onClick={handleCreateAlbum}
              >
                <Plus size={18} strokeWidth={3} />
                <span>{t('createAlbum')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          МОДАЛ 3: УПРАВЛЕНИЕ РАБОТАМИ ВНУТРИ СУЩЕСТВУЮЩЕГО АЛЬБОМА
         ========================================================================= */}
      {showManageAlbumWorksModal && selectedAlbum && (
        <div className="profile-modal-backdrop" onClick={() => setShowManageAlbumWorksModal(false)}>
          <div className="profile-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div>
                <h3 className="profile-modal-title">
                  <FolderPlus size={20} color="var(--color-primary-light)" />
                  <span>{selectedAlbum.title}</span>
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.45)', marginTop: '2px', display: 'block' }}>
                  {t('addWorks')}
                </span>
              </div>
              <button 
                className="profile-modal-close-btn"
                onClick={() => setShowManageAlbumWorksModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Сетка выбора работ креатора */}
            <div className="profile-manage-works-grid">
              {myCreations.map((item) => {
                const isSelected = (selectedAlbum.itemIds || []).includes(item.id);
                return (
                  <div 
                    key={item.id}
                    className={`profile-manage-work-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleWorkInAlbum(item.id)}
                  >
                    <img src={item.thumb || item.media} alt={item.title} className="profile-manage-work-thumb" />
                    <div className="profile-manage-work-check">
                      {isSelected ? <Check size={16} color="#ffffff" strokeWidth={3} /> : <Plus size={14} color="rgba(255,255,255,0.6)" />}
                    </div>
                    <span className="profile-manage-work-title">{item.title}</span>
                  </div>
                );
              })}
            </div>

            <button 
              className="profile-recharge-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '6px' }}
              onClick={() => {
                triggerHaptic('success');
                setShowManageAlbumWorksModal(false);
                showToast(t('albumUpdated'), 'success');
              }}
            >
              <Check size={18} />
              <span>{t('saveAlbum')} ({selectedAlbum.itemIds?.length || 0})</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          МОДАЛ 4: ЮРИДИЧЕСКИЕ ДОКУМЕНТЫ (КОНФИДЕНЦИАЛЬНОСТЬ & АНТИ-БАН БЕЗОПАСНОСТЬ)
         ========================================================================= */}
      {activeDocModal && (
        <div className="profile-modal-backdrop" onClick={() => setActiveDocModal(null)}>
          <div className="profile-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3 className="profile-modal-title">
                {activeDocModal === 'terms' ? (
                  <ShieldAlert size={18} color="var(--color-primary-light)" />
                ) : (
                  <ShieldCheck size={18} color="#10b981" />
                )}
                <span>
                  {activeDocModal === 'terms' ? t('termsAndSafety') : t('privacyPolicy')}
                </span>
              </h3>
              <button 
                className="profile-modal-close-btn"
                onClick={() => setActiveDocModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.84rem', lineHeight: '1.6', maxHeight: '60vh', overflowY: 'auto' }}>
              {activeDocModal === 'terms' ? (
                <>
                  <div style={{ padding: '10px 14px', background: 'rgba(176, 23, 61, 0.15)', border: '1px solid rgba(176, 23, 61, 0.35)', borderRadius: '12px', marginBottom: '16px' }}>
                    <strong style={{ color: '#ff7597', display: 'block', marginBottom: '4px' }}>🛡 Гарантия безопасности и защита от блокировок Telegram:</strong>
                    Сервис Morphi AI строго соблюдает регламенты Telegram Bot API Terms of Service, OpenAI Safety Policy и международные нормы защиты авторских прав.
                  </div>

                  <p style={{ marginBottom: '14px' }}>
                    <strong style={{ color: '#ffffff' }}>1. Строгие правила генерации контента (Zero-Tolerance)</strong><br />
                    В сервисе категорически запрещены и блокируются на уровне автоматической модерации:
                    <br />• Материалы сексуального характера и порнография (NSFW 18+);
                    <br />• Создание дипфейков реальных лиц без их согласия, клевета и дезинформация;
                    <br />• Сцены жестокости, экстремизм, дискриминация и призывы к насилию.
                    <br /><em>Попытка ввода запрещенных стоп-слов автоматически отклоняется системой без списания токенов. При повторных злоупотреблениях аккаунт блокируется без возврата средств.</em>
                  </p>

                  <p style={{ marginBottom: '14px' }}>
                    <strong style={{ color: '#ffffff' }}>2. Интеллектуальные права пользователя</strong><br />
                    Все сгенерированные вами медиафайлы (фотографии, арты, видеоролики) являются вашей собственностью. Вы обладаете неограниченным правом на их публикацию, коммерческое использование и монетизацию в соцсетях.
                  </p>

                  <p style={{ marginBottom: '14px' }}>
                    <strong style={{ color: '#ffffff' }}>3. Защита баланса и автоматический возврат</strong><br />
                    Если генерация прервалась из-за сетевого сбоя, превышения времени ожидания или ошибки нейросети — списанные кредиты мгновенно возвращаются на ваш баланс в полном объеме.
                  </p>
                </>
              ) : (
                <>
                  <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', marginBottom: '16px' }}>
                    <strong style={{ color: '#34d399', display: 'block', marginBottom: '4px' }}>🔒 Ваши фотографии и данные под защитой:</strong>
                    Мы не передаем ваши файлы третьим лицам и никогда не используем ваши генерации для обучения публичных моделей.
                  </div>

                  <p style={{ marginBottom: '14px' }}>
                    <strong style={{ color: '#ffffff' }}>1. Сквозное шифрование соединений</strong><br />
                    Все передаваемые данные шифруются с использованием защищенных протоколов TLS 1.3 и криптографических стандартов AES-256. Перехват ваших запросов третьими лицами исключен.
                  </p>

                  <p style={{ marginBottom: '14px' }}>
                    <strong style={{ color: '#ffffff' }}>2. Автоматическое удаление исходных фото</strong><br />
                    Любые исходные изображения лиц и медиафайлы, загруженные для генерации, обрабатываются в изолированной среде и безвозвратно удаляются с серверов в течение 24 часов после завершения задачи.
                  </p>

                  <p style={{ marginBottom: '14px' }}>
                    <strong style={{ color: '#ffffff' }}>3. Минимум персональной информации</strong><br />
                    Для авторизации в Morphi AI используется исключительно защищенный идентификатор Telegram ID. Сервис не запрашивает номера телефонов, пароли или банковские реквизиты (все платежи проводятся через сертифицированные эквайринги).
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
