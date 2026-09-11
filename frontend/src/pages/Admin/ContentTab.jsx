import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Image as ImageIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Flame, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Sparkles,
  Play,
  Camera,
  Coins,
  RefreshCw,
  Layers,
  Link as LinkIcon,
  ChevronDown
} from 'lucide-react';
import { 
  fetchAdminFeed, 
  saveAdminFeedItem, 
  deleteAdminFeedItem, 
  reorderAdminFeed, 
  fetchAdminStories,
  saveAdminStory,
  deleteAdminStory,
  reorderAdminStories,
  fetchPhotoshootConfig,
  saveAdminSetting,
  uploadAdminMedia,
  fetchAdminModels
} from '../../services/api';

const ContentTab = ({ onShowToast }) => {
  const [subtab, setSubtab] = useState('feed'); // 'feed' | 'stories' | 'photoshoot'
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [modelCategoryFilter, setModelCategoryFilter] = useState('all');

  // 1. Посты Ленты (Шаблоны)
  const [feedItems, setFeedItems] = useState([]);
  const [editingFeedItem, setEditingFeedItem] = useState(null);
  const [showManualFeedUrl, setShowManualFeedUrl] = useState(false);
  const [showManualTargetFaceUrl, setShowManualTargetFaceUrl] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name, type: 'feed' | 'story' }

  // 2. Stories
  const [stories, setStories] = useState([]);
  const [editingStory, setEditingStory] = useState(null);
  const [showManualStoryImageUrl, setShowManualStoryImageUrl] = useState(false);
  const [showManualStoryVideoUrl, setShowManualStoryVideoUrl] = useState(false);

  // 3. Студийный Фотосет
  const [showSlotUrlIdx, setShowSlotUrlIdx] = useState(null);
  const [uploadingSlotIdx, setUploadingSlotIdx] = useState(null);
  const [isSavingPhotoshoot, setIsSavingPhotoshoot] = useState(false);
  const [photoshoot, setPhotoshoot] = useState({
    cost: 10,
    badge: 'Editorial 4K',
    count_badge: '+5',
    title: 'Студийный фотосет',
    desc: '5 премиальных 4K-портретов от студийного глянца до уличного лайфстайла из одного селфи',
    photos: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
    ]
  });

  const loadAllContent = async () => {
    setLoading(true);
    try {
      const [feedData, storiesData, psData, modelsData] = await Promise.all([
        fetchAdminFeed(),
        fetchAdminStories(),
        fetchPhotoshootConfig(),
        fetchAdminModels().catch(() => [])
      ]);
      setFeedItems(feedData || []);
      setStories(storiesData || []);
      setAvailableModels(Array.isArray(modelsData) ? modelsData : []);
      if (psData) {
        setPhotoshoot(prev => ({
          ...prev,
          ...psData,
          title: psData.title || prev.title,
          desc: psData.desc || prev.desc,
          badge: psData.badge || prev.badge,
          cost: psData.cost !== undefined ? psData.cost : prev.cost,
          count_badge: psData.count_badge || prev.count_badge,
          photos: (Array.isArray(psData.photos) && psData.photos.length >= 3) ? psData.photos : prev.photos
        }));
      }
    } catch (err) {
      onShowToast(err.message || 'Ошибка загрузки контента', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllContent();
  }, []);

  const getSelectedModel = (modelName) => {
    if (!availableModels || availableModels.length === 0) return null;
    const current = (modelName || '').toLowerCase().trim();
    if (!current) return availableModels[0];
    return availableModels.find(m => {
      if (m.name?.toLowerCase() === current || m.id?.toLowerCase() === current) return true;
      if (Array.isArray(m.versions) && m.versions.some(v => v.name?.toLowerCase() === current || v.id?.toLowerCase() === current)) return true;
      return false;
    }) || availableModels.find(m => {
      const mName = m.name?.toLowerCase() || '';
      return current.includes(mName) || mName.includes(current);
    }) || availableModels[0];
  };

  // ==========================================
  // ОБРАБОТЧИКИ: ЛЕНТА И ШАБЛОНЫ (ФОТО 2)
  // ==========================================
  const handleUploadFeedMedia = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideoFile = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
    const localUrl = URL.createObjectURL(file);
    setEditingFeedItem((prev) => ({
      ...prev,
      video_url: isVideoFile ? localUrl : '',
      thumb_url: localUrl,
      category: prev.category || (isVideoFile ? 'video' : 'fashion')
    }));

    setUploading(true);
    try {
      const uploaded = await uploadAdminMedia(file, 'feed_templates');
      if (uploaded?.url) {
        setEditingFeedItem((prev) => ({
          ...prev,
          video_url: isVideoFile ? uploaded.url : '',
          thumb_url: uploaded.url,
        }));
        onShowToast(`Медиафайл (${isVideoFile ? 'Видео' : 'Фото'}) загружен в Cloudflare R2`, 'success');
      }
    } catch (err) {
      onShowToast(err.message || 'Ошибка загрузки медиа', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadTargetFace = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setEditingFeedItem((prev) => ({
      ...prev,
      target_face_url: localUrl,
    }));

    setUploading(true);
    try {
      const uploaded = await uploadAdminMedia(file, 'target_faces');
      if (uploaded?.url) {
        setEditingFeedItem((prev) => ({
          ...prev,
          target_face_url: uploaded.url,
        }));
        onShowToast('Лицо Главного Героя (ГГ) успешно загружено в R2', 'success');
      }
    } catch (err) {
      onShowToast(err.message || 'Ошибка загрузки лица Главного Героя', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveFeedItem = async (e) => {
    e.preventDefault();
    if (!editingFeedItem.name.trim()) {
      onShowToast('Введите название поста', 'error');
      return;
    }

    const isVideo = editingFeedItem.video_url && /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(editingFeedItem.video_url.trim());
    const payload = {
      ...editingFeedItem,
      video_url: isVideo ? editingFeedItem.video_url : null,
      thumb_url: !isVideo ? (editingFeedItem.thumb_url || editingFeedItem.video_url) : (editingFeedItem.thumb_url || null),
      target_face_url: editingFeedItem.target_face_url || null,
      is_prompt_locked: editingFeedItem.is_prompt_locked !== undefined ? editingFeedItem.is_prompt_locked : (!editingFeedItem.prompt?.trim()),
    };

    try {
      await saveAdminFeedItem(payload);
      onShowToast(editingFeedItem.id ? 'Пост обновлен' : 'Пост добавлен в ленту', 'success');
      setEditingFeedItem(null);
      const data = await fetchAdminFeed();
      setFeedItems(data || []);
    } catch (err) {
      onShowToast(err.message || 'Ошибка сохранения поста', 'error');
    }
  };

  const handleDeleteFeedItem = (id, name) => {
    setDeleteTarget({ id, name: name || 'Шаблон', type: 'feed' });
  };

  const handleMoveFeedItem = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= feedItems.length) return;

    const updated = [...feedItems];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    const payload = updated.map((item, idx) => ({
      id: item.id,
      sort_order: idx + 1,
      is_trending: item.is_trending,
    }));

    setFeedItems(updated);
    try {
      await reorderAdminFeed(payload);
    } catch (err) {
      onShowToast('Ошибка сохранения порядка', 'error');
      loadAllContent();
    }
  };

  const handleToggleFeedTrending = async (item) => {
    try {
      await saveAdminFeedItem({
        ...item,
        is_trending: !item.is_trending,
      });
      setFeedItems(prev => prev.map(f => f.id === item.id ? { ...f, is_trending: !f.is_trending } : f));
      onShowToast(!item.is_trending ? 'Закреплено в трендах' : 'Снято с трендов', 'info');
    } catch (err) {
      onShowToast(err.message || 'Ошибка обновления', 'error');
    }
  };

  const handleToggleFeedActive = async (item) => {
    try {
      await saveAdminFeedItem({
        ...item,
        is_active: !item.is_active,
      });
      setFeedItems(prev => prev.map(f => f.id === item.id ? { ...f, is_active: !f.is_active } : f));
      onShowToast(item.is_active ? 'Пост скрыт из ленты' : 'Пост опубликован', 'info');
    } catch (err) {
      onShowToast(err.message || 'Ошибка изменения статуса', 'error');
    }
  };

  // ==========================================
  // ОБРАБОТЧИКИ: STORIES (ФОТО 1)
  // ==========================================
  const handleUploadStoryImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setEditingStory(prev => ({ ...prev, image_url: localUrl }));

    setUploading(true);
    try {
      const uploaded = await uploadAdminMedia(file, 'stories_covers');
      if (uploaded?.url) {
        setEditingStory(prev => ({ ...prev, image_url: uploaded.url }));
        onShowToast('Обложка Stories загружена в Cloudflare R2', 'success');
      }
    } catch (err) {
      onShowToast(err.message || 'Ошибка загрузки обложки', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadStoryVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setEditingStory(prev => ({ ...prev, video_url: localUrl }));

    setUploading(true);
    try {
      const uploaded = await uploadAdminMedia(file, 'stories_videos');
      if (uploaded?.url) {
        setEditingStory(prev => ({ ...prev, video_url: uploaded.url }));
        onShowToast('Видео для Stories загружено в Cloudflare R2', 'success');
      }
    } catch (err) {
      onShowToast(err.message || 'Ошибка загрузки видео', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveStory = async (e) => {
    e.preventDefault();
    if (!editingStory.title.trim()) {
      onShowToast('Введите заголовок Stories', 'error');
      return;
    }
    if (!editingStory.image_url) {
      onShowToast('Загрузите или укажите ссылку на обложку', 'error');
      return;
    }

    try {
      await saveAdminStory(editingStory);
      onShowToast(editingStory.id ? 'Stories обновлен' : 'Новый Stories добавлен', 'success');
      setEditingStory(null);
      const data = await fetchAdminStories();
      setStories(data || []);
    } catch (err) {
      onShowToast(err.message || 'Ошибка сохранения Stories', 'error');
    }
  };

  const handleDeleteStory = (id, title) => {
    setDeleteTarget({ id, name: title || 'Stories', type: 'story' });
  };

  const handleToggleStoryActive = async (story) => {
    try {
      await saveAdminStory({ ...story, is_active: !story.is_active });
      setStories(prev => prev.map(s => s.id === story.id ? { ...s, is_active: !s.is_active } : s));
      onShowToast(story.is_active ? 'Stories скрыт' : 'Stories включен', 'info');
    } catch (err) {
      onShowToast(err.message || 'Ошибка изменения статуса', 'error');
    }
  };

  const handleMoveStory = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= stories.length) return;

    const updated = [...stories];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    const payload = updated.map((s, idx) => ({ id: s.id, sort_order: idx + 1 }));
    setStories(updated);
    try {
      await reorderAdminStories(payload);
    } catch (err) {
      onShowToast('Ошибка сортировки Stories', 'error');
    }
  };

  // ==========================================
  // ОБРАБОТЧИКИ: СТУДИЙНЫЙ ФОТОСЕТ (ФОТО 4)
  // ==========================================
  const handleUploadPhotoshootSlot = async (e, slotIndex) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlotIdx(slotIndex);
    try {
      const uploaded = await uploadAdminMedia(file, 'photoshoot_fan');
      if (uploaded?.url) {
        const finalUrl = uploaded.url;
        setPhotoshoot(prev => {
          const newPhotos = [...(prev.photos || [])];
          newPhotos[slotIndex] = finalUrl;
          const updated = { ...prev, photos: newPhotos };
          saveAdminSetting('photoshoot_config', updated).catch(console.error);
          try {
            localStorage.setItem('morphai_photoshoot_config', JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('morphai_photoshoot_updated', { detail: updated }));
          } catch (err) {}
          return updated;
        });
        onShowToast(`Фото слота #${slotIndex + 1} обновлено и сохранено в Cloudflare R2!`, 'success');
      }
    } catch (err) {
      onShowToast(err.message || 'Ошибка загрузки фото', 'error');
    } finally {
      setUploadingSlotIdx(null);
    }
  };

  const handleSavePhotoshoot = async () => {
    setIsSavingPhotoshoot(true);
    try {
      await saveAdminSetting('photoshoot_config', photoshoot);
      try {
        localStorage.setItem('morphai_photoshoot_config', JSON.stringify(photoshoot));
        window.dispatchEvent(new CustomEvent('morphai_photoshoot_updated', { detail: photoshoot }));
      } catch (err) {}
      onShowToast('Настройки студийного фотосета сохранены и применены на Главной!', 'success');
    } catch (err) {
      onShowToast(err.message || 'Ошибка сохранения фотосета', 'error');
    } finally {
      setIsSavingPhotoshoot(false);
    }
  };

  return (
    <div className="admin-content-tab">
      {/* Шапка раздела */}
      <div className="admin-tab-header">
        <div>
          <h2 className="admin-tab-title">Управление витриной и контентом</h2>
          <p className="admin-tab-desc">Публикация постов ленты, историй Stories на главной и фотосета</p>
        </div>
        <button className="admin-refresh-btn" onClick={loadAllContent} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Обновить</span>
        </button>
      </div>

      {/* Навигационные таблетки подразделов */}
      <div className="admin-card content-subtabs-nav-card">
        <div className="content-subtabs-row">
          <button 
            className={`content-subtab-btn ${subtab === 'feed' ? 'active' : ''}`}
            onClick={() => setSubtab('feed')}
          >
            <Film size={15} />
            <span>Лента и Шаблоны ({feedItems.length})</span>
          </button>
          <button 
            className={`content-subtab-btn ${subtab === 'stories' ? 'active' : ''}`}
            onClick={() => setSubtab('stories')}
          >
            <Sparkles size={15} />
            <span>Stories на Главной ({stories.length})</span>
          </button>
          <button 
            className={`content-subtab-btn ${subtab === 'photoshoot' ? 'active' : ''}`}
            onClick={() => setSubtab('photoshoot')}
          >
            <Layers size={15} />
            <span>Студийный Фотосет</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ПОДРАЗДЕЛ: ЛЕНТА И ШАБЛОНЫ (ФОТО 2) */}
      {/* ========================================================================= */}
      {subtab === 'feed' && (
        <div className="content-section-block">
          <div className="section-toolbar-row">
            <div>
              <h3 className="section-inner-title">Примеры генераций на Главной и Шаблоны</h3>
              <p className="section-inner-desc">Эти карточки отображаются в блоке «Примеры генераций» на Главной и в «Ленте». Вы можете удалять ненужные, добавлять новые и редактировать любые фото и видео.</p>
            </div>
            <button 
              className="admin-btn-primary"
              onClick={() => {
                const defaultModel = availableModels[0];
                const defaultVer = Array.isArray(defaultModel?.versions) && defaultModel.versions[0];
                setEditingFeedItem({
                  name: '',
                  category: 'fashion',
                  video_url: '',
                  thumb_url: '',
                  target_face_url: '',
                  prompt: '',
                  is_prompt_locked: false,
                  model_name: defaultVer?.name || defaultModel?.name || 'Flux 1.1 Pro',
                  cost: defaultVer?.cost || defaultModel?.cost || 10,
                  is_active: true,
                  is_trending: false
                });
              }}
            >
              <Plus size={16} />
              <span>Создать пост</span>
            </button>
          </div>

          {loading ? (
            <div className="admin-tab-loading">
              <div className="admin-spinner" />
              <p>Загрузка ленты...</p>
            </div>
          ) : (
            <div className="admin-feed-cards-grid">
              {feedItems.map((item, index) => {
                const isVideo = item.video_url && /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(item.video_url.trim());
                return (
                  <div 
                    key={item.id} 
                    className={`admin-feed-card ${item.is_trending ? 'trending' : ''} ${!item.is_active ? 'hidden-item' : ''}`}
                  >
                    <div className="admin-feed-card-thumb-wrap">
                      {isVideo ? (
                        <div className="admin-feed-video-preview">
                          <video src={item.video_url} poster={item.thumb_url} muted loop playsInline />
                          <div className="admin-video-play-badge">
                            <Play size={14} fill="#ffffff" color="#ffffff" />
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={item.thumb_url || item.video_url} 
                          alt={item.name} 
                          className="admin-feed-thumb-img" 
                          loading="lazy"
                        />
                      )}

                      <div className="admin-feed-thumb-badges">
                        {item.is_trending && (
                          <span className="badge-trending">
                            <Flame size={12} color="#e5b95c" />
                            <span>В трендах</span>
                          </span>
                        )}
                        <span className={`badge-active-status ${item.is_active ? 'active' : 'hidden'}`}>
                          {item.is_active ? 'В ленте' : 'Скрыт'}
                        </span>
                        {item.target_face_url && (
                          <span className="badge-trending" style={{ background: 'rgba(10, 10, 15, 0.85)', border: '1px solid #e5b95c', color: '#e5b95c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <img src={item.target_face_url} alt="" style={{ width: '13px', height: '13px', borderRadius: '50%', objectFit: 'cover' }} />
                            <span>ГГ</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="admin-feed-card-body">
                      <div className="admin-feed-card-title-row">
                        <h4 className="admin-feed-title" title={item.name}>{item.name}</h4>
                        <span className="admin-feed-category-tag">{item.category}</span>
                      </div>

                      {item.prompt && (
                        <p className="admin-feed-prompt" title={item.prompt}>
                          «{item.prompt}»
                        </p>
                      )}

                      <div className="admin-feed-meta-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {item.model_avatar && (
                            <img 
                              src={item.model_avatar} 
                              alt="" 
                              style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(229, 185, 92, 0.5)' }} 
                            />
                          )}
                          <span className="admin-feed-model-tag">{item.model_name || 'AI Model'}</span>
                        </div>
                        <span className="admin-feed-cost-chip">
                          <Coins size={12} color="#e5b95c" />
                          <strong>{item.cost || 10} CR</strong>
                        </span>
                      </div>
                    </div>

                    <div className="admin-feed-card-footer">
                      <div className="admin-feed-order-btns">
                        <button 
                          className="feed-icon-btn" 
                          onClick={() => handleMoveFeedItem(index, 'up')}
                          disabled={index === 0}
                          title="Выше"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button 
                          className="feed-icon-btn" 
                          onClick={() => handleMoveFeedItem(index, 'down')}
                          disabled={index === feedItems.length - 1}
                          title="Ниже"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      <div className="admin-feed-action-btns">
                        <button 
                          className={`feed-icon-btn ${item.is_trending ? 'active-flame' : ''}`}
                          onClick={() => handleToggleFeedTrending(item)}
                          title={item.is_trending ? 'Убрать из трендов' : 'Закрепить в трендах'}
                        >
                          <Flame size={14} />
                        </button>

                        <button 
                          className="feed-icon-btn"
                          onClick={() => handleToggleFeedActive(item)}
                          title={item.is_active ? 'Скрыть пост' : 'Показать пост'}
                        >
                          {item.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>

                        <button 
                          className="feed-icon-btn"
                          onClick={() => setEditingFeedItem({ 
                            ...item, 
                            is_prompt_locked: item.is_prompt_locked !== undefined ? item.is_prompt_locked : (!item.prompt || !item.prompt.trim()) 
                          })}
                          title="Редактировать"
                        >
                          <Edit size={14} />
                        </button>

                        <button 
                          className="feed-icon-btn delete"
                          onClick={() => handleDeleteFeedItem(item.id, item.name)}
                          title="Удалить"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ПОДРАЗДЕЛ: STORIES НА ГЛАВНОЙ (ФОТО 1) */}
      {/* ========================================================================= */}
      {subtab === 'stories' && (
        <div className="content-section-block">
          <div className="section-toolbar-row">
            <div>
              <h3 className="section-inner-title">Stories на Главной странице</h3>
              <p className="section-inner-desc">Круглые иконки историй с видео-анимацией вверху главной страницы</p>
            </div>
            <button 
              className="admin-btn-primary"
              onClick={() => setEditingStory({
                title: '',
                tag: 'Видео-морфинг',
                image_url: '',
                video_url: '',
                model_name: 'Kling 1.5 AI',
                prompt: '',
                is_active: true,
                sort_order: stories.length + 1
              })}
            >
              <Plus size={16} />
              <span>Добавить Stories</span>
            </button>
          </div>

          {stories.length === 0 && !loading && (
            <div className="admin-card empty-state-box">
              <p>Активных Stories сейчас нет. Нажмите «Добавить Stories», чтобы создать первую историю.</p>
            </div>
          )}

          <div className="admin-stories-admin-grid">
            {stories.map((story, index) => (
              <div key={story.id} className={`admin-story-admin-card ${!story.is_active ? 'inactive' : ''}`}>
                <div className="story-circle-preview-box">
                  <div className="story-avatar-outer-ring">
                    <img src={story.image_url} alt={story.title} className="story-avatar-img" />
                  </div>
                  <span className="story-circle-title">{story.title}</span>
                  <span className="story-circle-tag">{story.tag}</span>
                </div>

                <div className="story-meta-box">
                  <div className="story-model-line">
                    <span className="label">Модель:</span>
                    <strong className="val">{story.model_name || 'Не указана'}</strong>
                  </div>
                  {story.prompt && (
                    <p className="story-prompt-text" title={story.prompt}>
                      «{story.prompt}»
                    </p>
                  )}
                  {story.video_url && (
                    <span className="story-has-video-tag">
                      <Play size={11} fill="#ffffff" /> Видео прикреплено
                    </span>
                  )}
                </div>

                <div className="story-card-actions-col">
                  <div className="story-reorder-btns">
                    <button 
                      className="feed-icon-btn" 
                      onClick={() => handleMoveStory(index, 'up')}
                      disabled={index === 0}
                      title="Выше"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button 
                      className="feed-icon-btn" 
                      onClick={() => handleMoveStory(index, 'down')}
                      disabled={index === stories.length - 1}
                      title="Ниже"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>

                  <div className="story-controls-btns">
                    <button 
                      className={`feed-icon-btn ${story.is_active ? 'active' : 'muted'}`}
                      onClick={() => handleToggleStoryActive(story)}
                      title={story.is_active ? 'Скрыть' : 'Включить'}
                    >
                      {story.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button 
                      className="feed-icon-btn"
                      onClick={() => setEditingStory({ ...story })}
                      title="Редактировать"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      className="feed-icon-btn delete"
                      onClick={() => handleDeleteStory(story.id, story.title)}
                      title="Удалить"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ПОДРАЗДЕЛ: СТУДИЙНЫЙ ФОТОСЕТ (ФОТО 4) */}
      {/* ========================================================================= */}
      {subtab === 'photoshoot' && (
        <div className="content-section-block">
          <div className="admin-card photoshoot-settings-card">
            <div className="photoshoot-settings-header">
              <div>
                <h3 className="photoshoot-title">Студийный Фотосет (Editorial 4K)</h3>
                <p className="photoshoot-subtitle">
                  Управляйте веером из 3 фотографий, текстами и стоимостью генерации на Главной странице
                </p>
              </div>
              <button 
                className="admin-btn-primary" 
                onClick={handleSavePhotoshoot}
                disabled={isSavingPhotoshoot}
              >
                {isSavingPhotoshoot ? <div className="spinner-mini" /> : <Check size={16} />}
                <span>{isSavingPhotoshoot ? 'Сохранение...' : 'Сохранить настройки'}</span>
              </button>
            </div>

            {/* Живой предпросмотр карточки на Главной (как на Фото 2) */}
            <div className="photoshoot-live-preview-section">
              <div className="photoshoot-live-preview-header">
                <span className="live-preview-tag">Live Preview</span>
                <span className="live-preview-hint">Так карточка выглядит у всех пользователей на Главной странице (Фото 2):</span>
              </div>

              <div className="photoshoot-editorial-card admin-live-preview-card">
                <div className="editorial-card-main">
                  <div className="editorial-left-col">
                    <div className="editorial-badge-row">
                      <span className="editorial-gold-pill">{photoshoot.badge || 'Editorial 4K'}</span>
                      <span className="editorial-cost-tag">{photoshoot.cost || 10} CR</span>
                    </div>
                    <h3>{photoshoot.title || 'Студийный фотосет'}</h3>
                    <p>{photoshoot.desc || '5 премиальных 4K-портретов от студийного глянца до уличного лайфстайла из одного селфи'}</p>
                  </div>

                  <div className="editorial-fan-stack">
                    <div className="fan-card fan-1" style={{ backgroundImage: `url(${photoshoot.photos?.[0] || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop'})` }} />
                    <div className="fan-card fan-2" style={{ backgroundImage: `url(${photoshoot.photos?.[1] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop'})` }} />
                    <div className="fan-card fan-3" style={{ backgroundImage: `url(${photoshoot.photos?.[2] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'})` }}>
                      <span className="fan-count-badge">{photoshoot.count_badge || '+5'}</span>
                    </div>
                  </div>
                </div>

                <div className="editorial-bottom-action">
                  <div className="btn-primary editorial-upload-trigger-btn admin-preview-btn">
                    <Camera size={18} />
                    <span>{`Загрузить селфи и создать 5 фото (${photoshoot.cost || 10} CR)`}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Слоты веера из 3-х фотографий */}
            <h4 className="photoshoot-section-subhead">Слоты веера фотографий</h4>
            <div className="photoshoot-slots-grid">
              {(photoshoot.photos || []).map((photoUrl, idx) => {
                const isThisUploading = uploadingSlotIdx === idx;
                const slotTitles = [
                  'Слот #1 (Задний план веера)',
                  'Слот #2 (Центральное фото)',
                  `Слот #3 (Лицевое фото с бейджем ${photoshoot.count_badge || '+5'})`
                ];

                return (
                  <div key={idx} className="photoshoot-slot-card">
                    <div className="slot-badge-tag">{slotTitles[idx] || `Слот #${idx + 1}`}</div>
                    
                    {/* Кликабельное превью слота: клик сразу открывает выбор файла */}
                    <label className="slot-preview-wrap clickable-slot-preview" title="Нажмите на фото, чтобы заменить его">
                      <img src={photoUrl} alt={`Slot ${idx + 1}`} className="slot-preview-img" />
                      <div className="slot-hover-overlay">
                        {isThisUploading ? (
                          <div className="slot-spinner-box">
                            <div className="spinner-mini" />
                            <span>Загрузка в R2...</span>
                          </div>
                        ) : (
                          <>
                            <Camera size={22} color="#ffffff" />
                            <span>Нажмите для смены фото</span>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleUploadPhotoshootSlot(e, idx)} 
                        style={{ display: 'none' }}
                        disabled={isThisUploading}
                      />
                    </label>

                    <div className="slot-inputs-group">
                      <label className="admin-btn-primary upload-slot-btn">
                        <Upload size={14} />
                        <span>{isThisUploading ? 'Загрузка...' : 'Загрузить файл'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleUploadPhotoshootSlot(e, idx)} 
                          style={{ display: 'none' }}
                          disabled={isThisUploading}
                        />
                      </label>

                      <div className="slot-url-field-wrap">
                        <label className="slot-url-label">Или ссылка (URL):</label>
                        <input 
                          type="url"
                          value={photoUrl || ''}
                          onChange={(e) => {
                            const newPhotos = [...(photoshoot.photos || [])];
                            newPhotos[idx] = e.target.value;
                            setPhotoshoot({ ...photoshoot, photos: newPhotos });
                          }}
                          className="admin-form-input slot-url-input"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Текстовые параметры карточки на Главной */}
            <h4 className="photoshoot-section-subhead" style={{ marginTop: '24px' }}>
              Тексты карточки на Главной
            </h4>
            <div className="photoshoot-text-params">
              <div className="admin-form-group">
                <label>Заголовок карточки</label>
                <input 
                  type="text" 
                  value={photoshoot.title || ''}
                  onChange={(e) => setPhotoshoot({ ...photoshoot, title: e.target.value })}
                  className="admin-form-input"
                  placeholder="Студийный фотосет"
                />
              </div>

              <div className="admin-form-group">
                <label>Описание карточки</label>
                <textarea 
                  rows={2}
                  value={photoshoot.desc || ''}
                  onChange={(e) => setPhotoshoot({ ...photoshoot, desc: e.target.value })}
                  className="admin-form-input"
                  placeholder="5 премиальных 4K-портретов от студийного глянца до уличного лайфстайла из одного селфи"
                />
              </div>
            </div>

            {/* Параметры фотосета: цена и бейджи */}
            <h4 className="photoshoot-section-subhead" style={{ marginTop: '20px' }}>
              Стоимость и бейджи
            </h4>
            <div className="photoshoot-params-row">
              <div className="admin-form-group">
                <label>Стоимость генерации (CR)</label>
                <div className="cost-input-with-badge">
                  <input 
                    type="number" 
                    value={photoshoot.cost}
                    onChange={(e) => setPhotoshoot({ ...photoshoot, cost: parseInt(e.target.value) || 0 })}
                    className="admin-form-input"
                    min="1"
                    max="500"
                  />
                  <span className="cost-cr-badge">CR</span>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Золотой бейдж карточки</label>
                <input 
                  type="text" 
                  value={photoshoot.badge || ''}
                  onChange={(e) => setPhotoshoot({ ...photoshoot, badge: e.target.value })}
                  className="admin-form-input"
                  placeholder="Editorial 4K"
                />
              </div>

              <div className="admin-form-group">
                <label>Бейдж количества на 3-м слоте</label>
                <input 
                  type="text" 
                  value={photoshoot.count_badge || ''}
                  onChange={(e) => setPhotoshoot({ ...photoshoot, count_badge: e.target.value })}
                  className="admin-form-input"
                  placeholder="+5"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* МОДАЛ: РЕДАКТИРОВАНИЕ ПОСТА ЛЕНТЫ (ФОТО 2) */}
      {/* ========================================================================= */}
      {editingFeedItem && (
        <div className="admin-modal-overlay" onClick={() => setEditingFeedItem(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingFeedItem.id ? 'Редактирование поста' : 'Новый пост в ленту'}</h3>
              <button className="admin-modal-close" onClick={() => setEditingFeedItem(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFeedItem} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Название шаблона / поста</label>
                <input
                  type="text"
                  value={editingFeedItem.name}
                  onChange={(e) => setEditingFeedItem({ ...editingFeedItem, name: e.target.value })}
                  required
                  placeholder="например: День Рождения 35mm"
                  className="admin-form-input"
                />
              </div>

              {/* Загрузка медиа в R2 с визуальным предпросмотром */}
              <div className="admin-form-group">
                <label className="admin-media-field-label">
                  <span>Медиафайл (Фото или Видео шаблона)</span>
                  <span className="admin-field-sub">Отображается в ленте постов и карточках шаблонов</span>
                </label>
                
                <div className="admin-visual-media-card admin-feed-preview-card">
                  {(editingFeedItem.video_url || editingFeedItem.thumb_url) ? (
                    <div className="admin-feed-media-preview-box">
                      {editingFeedItem.video_url && /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(editingFeedItem.video_url) ? (
                        <video 
                          src={editingFeedItem.video_url} 
                          className="admin-feed-preview-media" 
                          controls 
                          muted 
                          playsInline 
                        />
                      ) : (
                        <img 
                          src={editingFeedItem.thumb_url || editingFeedItem.video_url} 
                          alt="Feed Preview" 
                          className="admin-feed-preview-media" 
                        />
                      )}
                    </div>
                  ) : (
                    <div className="admin-feed-placeholder-box">
                      <ImageIcon size={30} color="#e5b95c" />
                      <span>Нет фото</span>
                    </div>
                  )}

                  <div className="admin-visual-media-details">
                    <div className="admin-visual-media-actions">
                      <label className="admin-btn-primary admin-file-pick-btn">
                        <Upload size={15} />
                        <span>
                          {uploading 
                            ? 'Загрузка в R2...' 
                            : (editingFeedItem.video_url || editingFeedItem.thumb_url) 
                              ? 'Заменить фото / видео' 
                              : 'Загрузить фото или видео'}
                        </span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleUploadFeedMedia}
                          disabled={uploading}
                          style={{ display: 'none' }}
                        />
                      </label>

                      <button
                        type="button"
                        className="admin-link-toggle-btn"
                        onClick={() => setShowManualFeedUrl(prev => !prev)}
                      >
                        <LinkIcon size={13} />
                        <span>{showManualFeedUrl ? 'Скрыть URL' : 'Вставить ссылку вручную'}</span>
                      </button>
                    </div>

                    {showManualFeedUrl && (
                      <div className="admin-manual-url-fade">
                        <input
                          type="url"
                          value={editingFeedItem.video_url || editingFeedItem.thumb_url || ''}
                          onChange={(e) => setEditingFeedItem({ 
                            ...editingFeedItem, 
                            video_url: e.target.value,
                            thumb_url: e.target.value 
                          })}
                          placeholder="https://..."
                          className="admin-form-input admin-manual-url-input"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ЛИЦО ГЛАВНОГО ГЕРОЯ (ГГ) ДЛЯ ЗАМЕНЫ ЛИЦА */}
              <div className="admin-form-group" style={{ 
                background: 'rgba(229, 185, 92, 0.04)', 
                border: '1px solid rgba(229, 185, 92, 0.25)', 
                borderRadius: '12px', 
                padding: '14px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0, fontWeight: 600, color: '#e5b95c', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>👤 Лицо Главного Героя (ГГ) для замены</span>
                  </label>
                  {editingFeedItem.target_face_url && (
                    <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={12} /> Лицо ГГ установлено
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.65)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                  Если в шаблоне несколько персонажей (например, ребенок, актер или герой фильма) — загрузите сюда лицо персонажа, которого нужно заменить. При нажатии «Повторить» нейросеть заменит <strong>строго этого персонажа</strong> на селфи пользователя, сохранив всех остальных нетронутыми.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {editingFeedItem.target_face_url ? (
                    <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
                      <img 
                        src={editingFeedItem.target_face_url} 
                        alt="Target Hero Face" 
                        style={{ 
                          width: '56px', 
                          height: '56px', 
                          borderRadius: '50%', 
                          objectFit: 'cover', 
                          border: '2px solid #e5b95c',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                        }} 
                      />
                      <button
                        type="button"
                        onClick={() => setEditingFeedItem(prev => ({ ...prev, target_face_url: null }))}
                        style={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title="Удалить лицо ГГ"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      border: '1px dashed rgba(255, 255, 255, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.02)',
                      flexShrink: 0
                    }}>
                      <Camera size={20} color="rgba(255, 255, 255, 0.4)" />
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <label className="admin-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', margin: 0 }}>
                        <Upload size={13} />
                        <span>{uploading ? 'Загрузка...' : (editingFeedItem.target_face_url ? 'Заменить лицо ГГ' : 'Загрузить лицо ГГ')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadTargetFace}
                          disabled={uploading}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <button
                        type="button"
                        className="admin-link-toggle-btn"
                        onClick={() => setShowManualTargetFaceUrl(prev => !prev)}
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      >
                        <LinkIcon size={12} />
                        <span>{showManualTargetFaceUrl ? 'Скрыть URL' : 'Вставить URL'}</span>
                      </button>
                    </div>

                    {showManualTargetFaceUrl && (
                      <input
                        type="url"
                        value={editingFeedItem.target_face_url || ''}
                        onChange={(e) => setEditingFeedItem({ ...editingFeedItem, target_face_url: e.target.value })}
                        placeholder="https://... (прямая ссылка на фото лица)"
                        className="admin-form-input"
                        style={{ fontSize: '0.78rem', padding: '6px 10px', marginTop: '4px' }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Категория</label>
                  <select
                    value={editingFeedItem.category}
                    onChange={(e) => setEditingFeedItem({ ...editingFeedItem, category: e.target.value })}
                    className="admin-form-input"
                  >
                    <option value="fashion">Fashion & Стиль</option>
                    <option value="cyberpunk">Cyberpunk & Sci-Fi</option>
                    <option value="portrait">Портреты</option>
                    <option value="cinematic">Кино & Реализм</option>
                    <option value="animation">3D & Анимация</option>
                    <option value="video">Видео</option>
                    <option value="photo">Фото</option>
                  </select>
                </div>

                {/* ЦЕНА ПОВТОРЕНИЯ ГЕНЕРАЦИИ (CR) — ФОТО 2 */}
                <div className="admin-form-group">
                  <label>Цена повторения (CR)</label>
                  <div className="cost-input-with-badge">
                    <input
                      type="number"
                      value={editingFeedItem.cost}
                      onChange={(e) => setEditingFeedItem({ ...editingFeedItem, cost: parseInt(e.target.value) || 0 })}
                      required
                      min="1"
                      max="100"
                      className="admin-form-input"
                    />
                    <span className="cost-cr-badge">CR</span>
                  </div>
                </div>
              </div>

              {/* ПРОМПТ ШАБЛОНА И НАСТРОЙКА ПРИВАТНОСТИ (ВИДНО СРАЗУ) */}
              <div className="admin-form-group" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0, fontWeight: 600, color: '#ffffff', fontSize: '0.88rem' }}>Промпт шаблона</label>
                  <span style={{ fontSize: '0.73rem', color: editingFeedItem.is_prompt_locked || !editingFeedItem.prompt?.trim() ? '#e5b95c' : '#4ade80', fontWeight: 600 }}>
                    {editingFeedItem.is_prompt_locked || !editingFeedItem.prompt?.trim() ? '🔒 Скрыт от пользователей' : '👁️ Открыт (будет кнопка копирования)'}
                  </span>
                </div>
                <textarea
                  value={editingFeedItem.prompt || ''}
                  onChange={(e) => setEditingFeedItem({ ...editingFeedItem, prompt: e.target.value })}
                  rows={2}
                  placeholder="Введите промпт (например: Cinematic 4K video of cyberpunk character in neon rain...)"
                  className="admin-form-textarea"
                  style={{ marginBottom: '8px' }}
                />
                <div className="admin-checkbox-group" style={{ margin: 0 }}>
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={editingFeedItem.is_prompt_locked === true || (!editingFeedItem.prompt?.trim() && editingFeedItem.is_prompt_locked !== false)}
                      onChange={(e) => setEditingFeedItem({ ...editingFeedItem, is_prompt_locked: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.78rem', color: '#e5b95c', fontWeight: 500 }}>
                      🔒 Скрыть промпт от пользователей (будет плашка «Промпт скрыт автором», настройки применятся автоматически)
                    </span>
                  </label>
                </div>
              </div>

              {/* ВЫБОР ИИ-МОДЕЛИ ИЗ СУЩЕСТВУЮЩИХ (ФОТО 2 / АВАТАР В ЛЕНТЕ) */}
              {/* КАСТОМНЫЙ КРАСИВЫЙ СЕЛЕКТОР ИИ-МОДЕЛЕЙ (ФОТО 2 / ОБЛОЖКА В ЛЕНТЕ) */}
              {(() => {
                const selectedModel = getSelectedModel(editingFeedItem.model_name);
                const filteredModelsList = availableModels.filter(m => {
                  if (modelCategoryFilter === 'all') return true;
                  return m.category === modelCategoryFilter;
                });

                return (
                  <div className="admin-form-group admin-custom-model-selector-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ margin: 0, fontWeight: 600, color: '#ffffff' }}>ИИ-модель генерации</label>
                      <span style={{ fontSize: '0.73rem', color: '#e5b95c', fontWeight: 600 }}>
                        ✨ Фото модели появится в кружке в Ленте
                      </span>
                    </div>

                    {/* Кастомная кнопка-триггер выбора модели */}
                    <div 
                      onClick={() => setIsModelDropdownOpen(prev => !prev)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: '#16161f',
                        border: isModelDropdownOpen ? '1px solid #e5b95c' : '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'all 0.2s ease',
                        boxShadow: isModelDropdownOpen ? '0 0 14px rgba(229, 185, 92, 0.25)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <img 
                          src={selectedModel?.preview_url || selectedModel?.preview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'} 
                          alt={selectedModel?.name}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid rgba(229, 185, 92, 0.8)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '0.94rem', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {selectedModel?.name || 'Выберите модель'}
                            </strong>
                            {selectedModel && (
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '1px 7px',
                                borderRadius: '6px',
                                background: selectedModel.category === 'video' ? 'rgba(255, 43, 86, 0.2)' : 'rgba(229, 185, 92, 0.2)',
                                color: selectedModel.category === 'video' ? '#ff6b8b' : '#e5b95c',
                                fontWeight: 700
                              }}>
                                {selectedModel.category === 'video' ? '🎬 Видео' : selectedModel.category === 'photo' ? '📸 Фото' : '✍️ Текст'}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                            Выбрано: <span style={{ color: '#ffffff', fontWeight: 600 }}>{editingFeedItem.model_name || selectedModel?.name}</span>
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.78rem', color: '#e5b95c', fontWeight: 600 }}>
                          {isModelDropdownOpen ? 'Скрыть список' : 'Выбрать другую'}
                        </span>
                        <ChevronDown 
                          size={18} 
                          color="#e5b95c" 
                          style={{ transform: isModelDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} 
                        />
                      </div>
                    </div>

                    {/* Выпадающее окно со списком моделей и удобными табами */}
                    {isModelDropdownOpen && (
                      <div 
                        style={{
                          marginTop: '8px',
                          background: '#181824',
                          border: '1px solid rgba(229, 185, 92, 0.4)',
                          borderRadius: '12px',
                          padding: '12px',
                          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        {/* Табы категорий */}
                        <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setModelCategoryFilter('all')}
                            style={{
                              padding: '5px 11px',
                              borderRadius: '7px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: modelCategoryFilter === 'all' ? '#e5b95c' : 'rgba(255, 255, 255, 0.06)',
                              color: modelCategoryFilter === 'all' ? '#000000' : '#ffffff',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Все ({availableModels.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setModelCategoryFilter('photo')}
                            style={{
                              padding: '5px 11px',
                              borderRadius: '7px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: modelCategoryFilter === 'photo' ? '#e5b95c' : 'rgba(255, 255, 255, 0.06)',
                              color: modelCategoryFilter === 'photo' ? '#000000' : '#ffffff',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            📸 Фото ({availableModels.filter(m => m.category === 'photo').length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setModelCategoryFilter('video')}
                            style={{
                              padding: '5px 11px',
                              borderRadius: '7px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: modelCategoryFilter === 'video' ? '#ff2b56' : 'rgba(255, 255, 255, 0.06)',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            🎬 Видео ({availableModels.filter(m => m.category === 'video').length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setModelCategoryFilter('text')}
                            style={{
                              padding: '5px 11px',
                              borderRadius: '7px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: modelCategoryFilter === 'text' ? '#64b5f6' : 'rgba(255, 255, 255, 0.06)',
                              color: modelCategoryFilter === 'text' ? '#000000' : '#ffffff',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            ✍️ Текст ({availableModels.filter(m => m.category === 'text').length})
                          </button>
                        </div>

                        {/* Список моделей */}
                        <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '4px' }}>
                          {filteredModelsList.map(m => {
                            const isSelected = selectedModel?.id === m.id;
                            return (
                              <div
                                key={m.id}
                                onClick={() => {
                                  const firstVer = Array.isArray(m.versions) && m.versions[0];
                                  const versionName = firstVer?.name || m.name;
                                  const versionCost = firstVer?.cost || m.cost || 10;
                                  setEditingFeedItem(prev => ({
                                    ...prev,
                                    model_name: versionName,
                                    cost: prev.cost ? prev.cost : versionCost,
                                    category: m.category === 'video' ? 'video' : (prev.category === 'video' ? 'fashion' : prev.category)
                                  }));
                                  setIsModelDropdownOpen(false);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 12px',
                                  borderRadius: '9px',
                                  background: isSelected ? 'rgba(229, 185, 92, 0.16)' : 'rgba(255, 255, 255, 0.02)',
                                  border: isSelected ? '1px solid #e5b95c' : '1px solid rgba(255, 255, 255, 0.05)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                  }
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                                  <img 
                                    src={m.preview_url || m.preview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'} 
                                    alt={m.name}
                                    style={{
                                      width: '34px',
                                      height: '34px',
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: isSelected ? '2px solid #e5b95c' : '1px solid rgba(255, 255, 255, 0.25)',
                                      flexShrink: 0
                                    }}
                                  />
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{m.name}</span>
                                      <span style={{
                                        fontSize: '0.67rem',
                                        padding: '1px 6px',
                                        borderRadius: '5px',
                                        background: m.category === 'video' ? 'rgba(255, 43, 86, 0.2)' : 'rgba(229, 185, 92, 0.2)',
                                        color: m.category === 'video' ? '#ff6b8b' : '#e5b95c',
                                        fontWeight: 600
                                      }}>
                                        {m.category === 'video' ? 'Видео' : m.category === 'photo' ? 'Фото' : 'Текст'}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                                      Стоимость: <strong style={{ color: '#e5b95c' }}>{m.cost || 10} CR</strong>
                                    </span>
                                  </div>
                                </div>

                                {isSelected && (
                                  <div style={{ color: '#e5b95c', display: 'flex', alignItems: 'center' }}>
                                    <Check size={18} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Выбранная модель: версии/подмодели и пояснение */}
                    {selectedModel && (
                      <div style={{
                        marginTop: '10px',
                        padding: '12px 14px',
                        background: '#16161f',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        {/* Подмодели / Версии */}
                        {Array.isArray(selectedModel.versions) && selectedModel.versions.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '7px', fontWeight: 500 }}>
                              Выберите версию для шаблона:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {selectedModel.versions.map(ver => {
                                const isSelectedVer = editingFeedItem.model_name === ver.name;
                                return (
                                  <button
                                    key={ver.id}
                                    type="button"
                                    onClick={() => setEditingFeedItem(prev => ({
                                      ...prev,
                                      model_name: ver.name,
                                      cost: ver.cost || prev.cost || 10
                                    }))}
                                    style={{
                                      padding: '5px 12px',
                                      borderRadius: '8px',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      border: isSelectedVer ? '1px solid #e5b95c' : '1px solid rgba(255, 255, 255, 0.12)',
                                      background: isSelectedVer ? '#e5b95c' : 'rgba(255, 255, 255, 0.05)',
                                      color: isSelectedVer ? '#000000' : '#ffffff',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s'
                                    }}
                                  >
                                    {ver.name} {ver.cost ? `(${ver.cost} CR)` : ''}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div style={{ fontSize: '0.74rem', color: '#90caf9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>✨</span>
                          <span>Обложка модели «{selectedModel.name}» из админки автоматически отобразится в кружке автора в ленте.</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="admin-form-row">
                <div className="admin-checkbox-group">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={editingFeedItem.is_trending === true}
                      onChange={(e) => setEditingFeedItem({ ...editingFeedItem, is_trending: e.target.checked })}
                    />
                    <span>Закрепить в трендах (вверху)</span>
                  </label>
                </div>

                <div className="admin-checkbox-group">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={editingFeedItem.is_active !== false}
                      onChange={(e) => setEditingFeedItem({ ...editingFeedItem, is_active: e.target.checked })}
                    />
                    <span>Опубликовано в ленте</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setEditingFeedItem(null)}>
                  Отмена
                </button>
                <button type="submit" className="admin-btn-primary" disabled={uploading}>
                  <Check size={16} />
                  <span>{editingFeedItem.id ? 'Сохранить изменения' : 'Опубликовать пост'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* МОДАЛ: РЕДАКТИРОВАНИЕ STORIES (ФОТО 1) */}
      {/* ========================================================================= */}
      {editingStory && (
        <div className="admin-modal-overlay" onClick={() => setEditingStory(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingStory.id ? 'Редактирование Stories' : 'Новая история Stories'}</h3>
              <button className="admin-modal-close" onClick={() => setEditingStory(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStory} className="admin-modal-form">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Заголовок кружочка</label>
                  <input
                    type="text"
                    value={editingStory.title}
                    onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                    required
                    placeholder="например: Kling 1.5"
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Тег под заголовком</label>
                  <input
                    type="text"
                    value={editingStory.tag || ''}
                    onChange={(e) => setEditingStory({ ...editingStory, tag: e.target.value })}
                    placeholder="например: Видео-морфинг"
                    className="admin-form-input"
                  />
                </div>
              </div>

              {/* Обложка (круг) - визуальная карточка */}
              <div className="admin-form-group">
                <label className="admin-media-field-label">
                  <span>Круглая обложка Stories</span>
                  <span className="admin-field-sub">Отображается в кружке на Главной странице</span>
                </label>
                
                <div className="admin-visual-media-card">
                  <div className="admin-visual-avatar-ring">
                    {editingStory.image_url ? (
                      <img 
                        src={editingStory.image_url} 
                        alt="Story Cover" 
                        className="admin-visual-avatar-img" 
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop'; }}
                      />
                    ) : (
                      <div className="admin-visual-avatar-placeholder">
                        <ImageIcon size={26} color="#e5b95c" />
                        <span>Нет фото</span>
                      </div>
                    )}
                  </div>

                  <div className="admin-visual-media-details">
                    <div className="admin-visual-media-actions">
                      <label className="admin-btn-primary admin-file-pick-btn">
                        <Upload size={15} />
                        <span>
                          {uploading 
                            ? 'Загрузка в R2...' 
                            : (editingStory.image_url ? 'Заменить фото' : 'Загрузить фото с устройства')}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleUploadStoryImage} 
                          style={{ display: 'none' }}
                          disabled={uploading}
                        />
                      </label>
                      
                      <button 
                        type="button" 
                        className="admin-link-toggle-btn"
                        onClick={() => setShowManualStoryImageUrl(prev => !prev)}
                      >
                        <LinkIcon size={13} />
                        <span>{showManualStoryImageUrl ? 'Скрыть URL' : 'Вставить ссылку вручную'}</span>
                      </button>
                    </div>

                    {showManualStoryImageUrl && (
                      <div className="admin-manual-url-fade">
                        <input
                          type="url"
                          value={editingStory.image_url}
                          onChange={(e) => setEditingStory({ ...editingStory, image_url: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="admin-form-input admin-manual-url-input"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Видео для полноэкранного плеера - визуальная карточка */}
              <div className="admin-form-group">
                <label className="admin-media-field-label">
                  <span>Видеоролик для плеера Stories</span>
                  <span className="admin-field-sub">Полноэкранный просмотр при нажатии на Stories</span>
                </label>
                
                <div className="admin-visual-media-card admin-video-media-card">
                  <div className="admin-visual-video-wrap">
                    {editingStory.video_url ? (
                      editingStory.video_url.match(/\.(mp4|webm|mov)(\?.*)?$/i) || !editingStory.video_url.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i) ? (
                        <video 
                          src={editingStory.video_url} 
                          className="admin-visual-video-preview" 
                          controls 
                          muted 
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <img 
                          src={editingStory.video_url} 
                          alt="Story Media" 
                          className="admin-visual-video-preview"
                        />
                      )
                    ) : (
                      <div className="admin-visual-video-placeholder">
                        <Film size={26} color="#e5b95c" />
                        <span>Нет видео</span>
                      </div>
                    )}
                  </div>

                  <div className="admin-visual-media-details">
                    <div className="admin-visual-media-actions">
                      <label className="admin-btn-primary admin-file-pick-btn">
                        <Upload size={15} />
                        <span>
                          {uploading 
                            ? 'Загрузка в R2...' 
                            : (editingStory.video_url ? 'Заменить видеоролик' : 'Загрузить видеофайл (MP4)')}
                        </span>
                        <input 
                          type="file" 
                          accept="video/*,image/*" 
                          onChange={handleUploadStoryVideo} 
                          style={{ display: 'none' }}
                          disabled={uploading}
                        />
                      </label>
                      
                      <button 
                        type="button" 
                        className="admin-link-toggle-btn"
                        onClick={() => setShowManualStoryVideoUrl(prev => !prev)}
                      >
                        <LinkIcon size={13} />
                        <span>{showManualStoryVideoUrl ? 'Скрыть URL' : 'Вставить ссылку вручную'}</span>
                      </button>
                    </div>

                    {showManualStoryVideoUrl && (
                      <div className="admin-manual-url-fade">
                        <input
                          type="url"
                          value={editingStory.video_url || ''}
                          onChange={(e) => setEditingStory({ ...editingStory, video_url: e.target.value })}
                          placeholder="https://assets.mixkit.co/...mp4"
                          className="admin-form-input admin-manual-url-input"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Название модели в плеере</label>
                <input
                  type="text"
                  value={editingStory.model_name || ''}
                  onChange={(e) => setEditingStory({ ...editingStory, model_name: e.target.value })}
                  placeholder="Kling 1.5 AI"
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Промпт в плеере</label>
                <textarea
                  value={editingStory.prompt || ''}
                  onChange={(e) => setEditingStory({ ...editingStory, prompt: e.target.value })}
                  rows={2}
                  placeholder="Промпт, отображаемый под видео в плеере"
                  className="admin-form-textarea"
                />
              </div>

              <div className="admin-checkbox-group">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingStory.is_active !== false}
                    onChange={(e) => setEditingStory({ ...editingStory, is_active: e.target.checked })}
                  />
                  <span>Отображать Stories на Главной странице</span>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setEditingStory(null)}>
                  Отмена
                </button>
                <button type="submit" className="admin-btn-primary" disabled={uploading}>
                  <Check size={16} />
                  <span>{editingStory.id ? 'Сохранить Stories' : 'Создать Stories'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* МОДАЛ ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ (НАДЕЖНО РАБОТАЕТ В TELEGRAM) */}
      {/* ========================================================= */}
      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div 
            className="admin-modal-box" 
            style={{ maxWidth: '420px', textAlign: 'center', padding: '28px 24px' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              width: '52px', 
              height: '52px', 
              borderRadius: '50%', 
              background: 'rgba(239, 68, 68, 0.15)', 
              color: '#ef4444', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <Trash2 size={24} />
            </div>
            
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
              {deleteTarget.type === 'feed' ? 'Удалить этот пример / пост?' : 'Удалить Stories?'}
            </h3>
            
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', lineHeight: '1.45', marginBottom: '24px' }}>
              Вы действительно хотите удалить «<strong>{deleteTarget.name}</strong>»?
              {deleteTarget.type === 'feed' && ' Он сразу исчезнет из блока «Примеры генераций» на Главной и из Ленты.'}
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="admin-btn-secondary" 
                onClick={() => setDeleteTarget(null)}
                style={{ flex: '1', minHeight: '42px', justifyContent: 'center' }}
              >
                Отмена
              </button>
              <button 
                type="button" 
                className="admin-btn-primary" 
                style={{ flex: '1', minHeight: '42px', background: '#dc2626', borderColor: '#ef4444', justifyContent: 'center' }}
                onClick={async () => {
                  const { id, type } = deleteTarget;
                  setDeleteTarget(null);
                  try {
                    if (type === 'feed') {
                      await deleteAdminFeedItem(id);
                      onShowToast('Элемент успешно удален из базы', 'success');
                      setFeedItems(prev => prev.filter(item => item.id !== id));
                    } else if (type === 'story') {
                      await deleteAdminStory(id);
                      onShowToast('Stories успешно удален', 'success');
                      setStories(prev => prev.filter(s => s.id !== id));
                    }
                  } catch (err) {
                    onShowToast(err.message || 'Ошибка при удалении', 'error');
                  }
                }}
              >
                <Trash2 size={15} />
                <span>Удалить</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentTab;
