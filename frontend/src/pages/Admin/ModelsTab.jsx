import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Film, 
  Image as ImageIcon, 
  BookOpen, 
  Coins, 
  Upload, 
  Check, 
  X, 
  Edit3, 
  Eye, 
  EyeOff, 
  Sparkles,
  RefreshCw,
  Link as LinkIcon
} from 'lucide-react';
import { 
  fetchAdminModels, 
  saveAdminModel, 
  uploadAdminMedia 
} from '../../services/api';

const ModelsTab = ({ onShowToast }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingModel, setEditingModel] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showManualCoverUrl, setShowManualCoverUrl] = useState(false);

  const loadModels = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminModels();
      setModels(data);
    } catch (err) {
      onShowToast(err.message || 'Ошибка загрузки моделей', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleUploadCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setEditingModel((prev) => ({
      ...prev,
      preview_url: localUrl,
    }));

    setUploading(true);
    try {
      const uploaded = await uploadAdminMedia(file, 'models_covers');
      if (uploaded?.url) {
        setEditingModel((prev) => ({
          ...prev,
          preview_url: uploaded.url,
        }));
        onShowToast('Обложка модели успешно загружена в Cloudflare R2', 'success');
      }
    } catch (err) {
      onShowToast(err.message || 'Ошибка загрузки обложки', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveModel = async (e) => {
    if (e) e.preventDefault();
    if (!editingModel) return;

    if (uploading) {
      onShowToast('Пожалуйста, дождитесь завершения загрузки фото в R2...', 'warning');
      return;
    }

    if (editingModel.preview_url && editingModel.preview_url.startsWith('blob:')) {
      onShowToast('Обложка еще не загрузилась в облако. Подождите пару секунд...', 'warning');
      return;
    }

    try {
      const payload = {
        ...editingModel,
        preview_url: editingModel.preview_url,
        preview: editingModel.preview_url,
      };
      await saveAdminModel(editingModel.id, payload);
      onShowToast(`Модель ${editingModel.name} успешно обновлена`, 'success');
      setEditingModel(null);
      loadModels();
    } catch (err) {
      onShowToast(err.message || 'Ошибка сохранения модели', 'error');
    }
  };

  const handleToggleActive = async (model) => {
    try {
      await saveAdminModel(model.id, { is_active: !model.is_active });
      onShowToast(`Статус ${model.name} изменен`, 'info');
      loadModels();
    } catch (err) {
      onShowToast(err.message || 'Ошибка изменения статуса', 'error');
    }
  };

  const filteredModels = models.filter((m) => {
    if (categoryFilter === 'all') return true;
    return m.category === categoryFilter;
  });

  return (
    <div className="admin-models-tab">
      {/* Шапка раздела */}
      <div className="admin-tab-header">
        <div>
          <h2 className="admin-tab-title">ИИ Модели, Тарифы и Обложки</h2>
          <p className="admin-tab-desc">Управляйте стоимостью генерации в кредитах (CR) и фото-обложками всех нейросетей</p>
        </div>
        <button className="admin-refresh-btn" onClick={loadModels} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Обновить</span>
        </button>
      </div>

      {/* Фильтр по типам нейросетей */}
      <div className="admin-card content-subtabs-nav-card admin-models-filter-card">
        <div className="content-subtabs-row models-filter-row">
          <button 
            className={`content-subtab-btn filter-pill-btn ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            <Cpu size={15} />
            <span>Все нейросети ({models.length})</span>
          </button>
          <button 
            className={`content-subtab-btn filter-pill-btn ${categoryFilter === 'video' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('video')}
          >
            <Film size={15} />
            <span>Видео ({models.filter(m => m.category === 'video').length})</span>
          </button>
          <button 
            className={`content-subtab-btn filter-pill-btn ${categoryFilter === 'photo' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('photo')}
          >
            <ImageIcon size={15} />
            <span>Фото & Face Swap ({models.filter(m => m.category === 'photo').length})</span>
          </button>
          <button 
            className={`content-subtab-btn filter-pill-btn ${categoryFilter === 'text' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('text')}
          >
            <BookOpen size={15} />
            <span>Сказки & Текст ({models.filter(m => m.category === 'text').length})</span>
          </button>
        </div>
      </div>

      {/* Сетка карточек моделей */}
      {loading ? (
        <div className="admin-tab-loading">
          <div className="admin-spinner" />
          <p>Загрузка каталога моделей...</p>
        </div>
      ) : (
        <div className="admin-models-grid">
          {filteredModels.map((m) => {
            const versions = Array.isArray(m.versions) ? m.versions : [];

            return (
              <div key={m.id} className={`admin-model-item-card ${!m.is_active ? 'inactive' : ''}`}>
                {/* Левая часть: Обложка с бейджем активности */}
                <div className="model-cover-preview-wrap">
                  <img 
                    src={m.preview_url || m.preview || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'} 
                    alt={m.name} 
                    className="model-cover-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="model-cover-badges">
                    <span className={`badge-active-status ${m.is_active ? 'active' : 'hidden'}`}>
                      {m.is_active ? 'Активна' : 'Отключена'}
                    </span>
                  </div>
                </div>

                {/* Центральная часть: Метаданные и подмодели */}
                <div className="model-info-content">
                  <div className="model-header-row">
                    <div className="model-title-group">
                      <h3 className="model-card-name">{m.name}</h3>
                      <span className="model-cat-badge">{m.category}</span>
                    </div>

                    <div className="model-card-top-actions">
                      <button 
                        className={`model-visibility-btn ${m.is_active ? 'active' : 'muted'}`}
                        onClick={() => handleToggleActive(m)}
                        title={m.is_active ? 'Отключить модель' : 'Включить модель'}
                      >
                        {m.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button 
                        className="admin-btn-secondary model-edit-btn"
                        onClick={() => setEditingModel({ ...m, versions: Array.isArray(m.versions) ? [...m.versions] : [] })}
                      >
                        <Edit3 size={14} />
                        <span>Настроить</span>
                      </button>
                    </div>
                  </div>

                  <p className="model-card-desc">{m.description || 'Описание не указано'}</p>

                  {/* Блок тарифов: Базовая цена + Версии */}
                  <div className="model-pricing-panel">
                    <div className="base-price-pill">
                      <span className="pill-label">Базовая цена:</span>
                      <span className="pill-val">
                        <Coins size={13} color="#e5b95c" />
                        <strong>{m.cost} CR</strong>
                      </span>
                    </div>

                    {versions.length > 0 && (
                      <div className="model-subversions-chips">
                        <span className="subversions-label">Тарифы версий:</span>
                        <div className="subversions-list">
                          {versions.map((ver) => (
                            <span key={ver.id} className="subversion-chip">
                              <span className="ver-name">{ver.name}:</span>
                              <span className="ver-cost">{ver.cost} CR</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* МОДАЛКА РЕДАКТИРОВАНИЯ МОДЕЛИ (ОБЛОЖКА + ЦЕНЫ) */}
      {editingModel && (
        <div className="admin-modal-overlay" onClick={() => setEditingModel(null)}>
          <div className="admin-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Настройка модели: {editingModel.name}</h3>
              <button className="admin-modal-close" onClick={() => setEditingModel(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModel} className="admin-modal-form">
              {/* Верхняя строка: Предпросмотр обложки + Загрузка */}
              <div className="admin-form-group">
                <label className="admin-media-field-label">
                  <span>Обложка модели</span>
                  <span className="admin-field-sub">Отображается в карточке каталога и списке выбора</span>
                </label>
                <div className="admin-visual-media-card">
                  <div className="edit-cover-preview-box">
                    <img 
                      src={editingModel.preview_url || editingModel.preview || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'} 
                      alt="Cover" 
                      className="edit-cover-preview-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div className="admin-visual-media-details">
                    <div className="admin-visual-media-actions">
                      <label className="admin-btn-primary admin-file-pick-btn">
                        <Upload size={15} />
                        <span>{uploading ? 'Загрузка в R2...' : 'Заменить фото с устройства'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleUploadCover} 
                          style={{ display: 'none' }}
                          disabled={uploading}
                        />
                      </label>
                      
                      <button 
                        type="button" 
                        className="admin-link-toggle-btn"
                        onClick={() => setShowManualCoverUrl(prev => !prev)}
                      >
                        <LinkIcon size={13} />
                        <span>{showManualCoverUrl ? 'Скрыть URL' : 'Вставить ссылку вручную'}</span>
                      </button>
                    </div>

                    {showManualCoverUrl && (
                      <div className="admin-manual-url-fade">
                        <input 
                          type="url" 
                          value={editingModel.preview_url}
                          onChange={(e) => setEditingModel({ ...editingModel, preview_url: e.target.value })}
                          className="admin-form-input admin-manual-url-input"
                          placeholder="https://..."
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Название и статус */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Название модели</label>
                  <input 
                    type="text" 
                    value={editingModel.name}
                    onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                    className="admin-form-input"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Базовая стоимость (CR)</label>
                  <input 
                    type="number" 
                    value={editingModel.cost}
                    onChange={(e) => setEditingModel({ ...editingModel, cost: parseInt(e.target.value) || 0 })}
                    className="admin-form-input"
                    min="1"
                    max="1000"
                    required
                  />
                </div>
              </div>

              {/* Описание */}
              <div className="admin-form-group">
                <label>Краткое описание для карточки</label>
                <textarea 
                  value={editingModel.description || ''}
                  onChange={(e) => setEditingModel({ ...editingModel, description: e.target.value })}
                  className="admin-form-textarea"
                  rows={2}
                />
              </div>

              {/* Список подмоделей / версий с ценами */}
              {Array.isArray(editingModel.versions) && editingModel.versions.length > 0 && (
                <div className="admin-versions-editor-section">
                  <h4 className="versions-section-title">Тарифы версий (CR за генерацию):</h4>
                  <div className="versions-inputs-grid">
                    {editingModel.versions.map((ver, idx) => (
                      <div key={ver.id || idx} className="version-input-row">
                        <span className="ver-input-name">{ver.name}</span>
                        <div className="ver-input-cost-wrap">
                          <input 
                            type="number"
                            value={ver.cost}
                            onChange={(e) => {
                              const newVers = [...editingModel.versions];
                              newVers[idx] = { ...ver, cost: parseInt(e.target.value) || 0 };
                              setEditingModel({ ...editingModel, versions: newVers });
                            }}
                            className="admin-form-input ver-cost-input"
                            min="1"
                            max="1000"
                            required
                          />
                          <span className="ver-cost-cr-badge">CR</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Переключатель видимости */}
              <div className="admin-checkbox-group">
                <label className="admin-checkbox-label">
                  <input 
                    type="checkbox"
                    checked={editingModel.is_active !== false}
                    onChange={(e) => setEditingModel({ ...editingModel, is_active: e.target.checked })}
                  />
                  <span>Модель активна и доступна для генерации клиентами</span>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setEditingModel(null)}>
                  Отмена
                </button>
                <button type="submit" className="admin-btn-primary" disabled={uploading}>
                  <Check size={16} />
                  <span>{uploading ? 'Загрузка фото в R2...' : 'Сохранить тарифы и фото'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelsTab;
