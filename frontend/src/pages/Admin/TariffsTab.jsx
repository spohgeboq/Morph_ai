import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Gift, 
  Calendar, 
  Sparkles,
  Percent,
  Coins
} from 'lucide-react';
import { 
  fetchAdminTariffs, 
  saveAdminTariff, 
  deleteAdminTariff, 
  fetchAdminPromocodes, 
  createAdminPromocode, 
  deleteAdminPromocode,
  fetchAdminSettings,
  saveAdminSetting
} from '../../services/api';

const TariffsTab = ({ onShowToast }) => {
  const [tariffs, setTariffs] = useState([]);
  const [promocodes, setPromocodes] = useState([]);
  const [welcomeBonus, setWelcomeBonus] = useState(50);
  const [loading, setLoading] = useState(true);

  // Модальные окна
  const [editingTariff, setEditingTariff] = useState(null); // null или объект
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: '',
    type: 'credits',
    reward_credits: 50,
    discount_percent: 20,
    max_uses: 100,
    expires_at: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [tariffsData, promoData, settingsData] = await Promise.all([
        fetchAdminTariffs(),
        fetchAdminPromocodes(),
        fetchAdminSettings(),
      ]);
      setTariffs(tariffsData);
      setPromocodes(promoData);
      if (settingsData?.welcome_bonus?.credits !== undefined) {
        setWelcomeBonus(settingsData.welcome_bonus.credits);
      }
    } catch (err) {
      onShowToast(err.message || 'Ошибка загрузки данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Сохранение тарифа
  const handleSaveTariff = async (e) => {
    e.preventDefault();
    try {
      await saveAdminTariff(editingTariff);
      onShowToast(editingTariff.id ? 'Тариф обновлен' : 'Новый тариф добавлен', 'success');
      setEditingTariff(null);
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Ошибка сохранения тарифа', 'error');
    }
  };

  // Удаление тарифа
  const handleDeleteTariff = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот тариф?')) return;
    try {
      await deleteAdminTariff(id);
      onShowToast('Тариф удалён', 'success');
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Ошибка удаления', 'error');
    }
  };

  // Создание промокода
  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (!promoForm.code.trim()) {
      onShowToast('Введите код промокода', 'error');
      return;
    }

    try {
      await createAdminPromocode({
        ...promoForm,
        code: promoForm.code.trim().toUpperCase(),
        reward_credits: promoForm.type === 'credits' ? parseInt(promoForm.reward_credits) : 0,
        discount_percent: promoForm.type === 'discount_percent' ? parseInt(promoForm.discount_percent) : 0,
        max_uses: parseInt(promoForm.max_uses) || 100,
        expires_at: promoForm.expires_at || null,
      });
      onShowToast('Промокод успешно создан', 'success');
      setShowPromoModal(false);
      setPromoForm({
        code: '',
        type: 'credits',
        reward_credits: 50,
        discount_percent: 20,
        max_uses: 100,
        expires_at: '',
      });
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Ошибка создания промокода', 'error');
    }
  };

  // Удаление промокода
  const handleDeletePromo = async (id) => {
    if (!window.confirm('Удалить этот промокод?')) return;
    try {
      await deleteAdminPromocode(id);
      onShowToast('Промокод удален', 'success');
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Ошибка удаления', 'error');
    }
  };

  // Сохранение стартового бонуса
  const handleSaveWelcomeBonus = async () => {
    try {
      await saveAdminSetting('welcome_bonus', { credits: parseInt(welcomeBonus) || 50 });
      onShowToast(`Приветственный бонус сохранён: ${welcomeBonus} CR`, 'success');
    } catch (err) {
      onShowToast(err.message || 'Ошибка сохранения', 'error');
    }
  };

  return (
    <div className="admin-tariffs-tab">
      {/* Шапка раздела */}
      <div className="admin-tab-header">
        <div>
          <h2 className="admin-tab-title">Управление тарифами и монетизацией</h2>
          <p className="admin-tab-desc">Настройка стоимости пакетов, скидок, промокодов и стартовых бонусов</p>
        </div>
      </div>

      {/* Блок 1: Приветственный бонус */}
      <div className="admin-card admin-welcome-bonus-card">
        <div className="welcome-bonus-content">
          <div className="welcome-bonus-left">
            <div className="admin-kpi-icon-wrap gold">
              <Gift size={20} color="#e5b95c" />
            </div>
            <div className="welcome-bonus-texts">
              <h4 className="welcome-bonus-title">Приветственный бонус новому пользователю</h4>
              <p className="welcome-bonus-desc">Количество кредитов, автоматически начисляемых каждому новичку при первом входе</p>
            </div>
          </div>
          <div className="welcome-bonus-action">
            <div className="welcome-bonus-input-wrap">
              <input
                type="number"
                value={welcomeBonus}
                onChange={(e) => setWelcomeBonus(e.target.value)}
                className="admin-bonus-input"
                min="0"
                max="1000"
              />
              <span className="bonus-unit-tag">CR</span>
            </div>
            <button className="admin-btn-primary welcome-save-btn" onClick={handleSaveWelcomeBonus}>
              <Check size={16} />
              <span>Сохранить</span>
            </button>
          </div>
        </div>
      </div>

      {/* Блок 2: Таблица пакетов кредитов */}
      <div className="admin-card">
        <div className="admin-card-header-actions">
          <div>
            <h3 className="admin-card-title">Прайс-лист пакетов генераций</h3>
            <p className="admin-card-subtitle">Эти пакеты выводятся в профиле пользователя при пополнении баланса</p>
          </div>
          <button 
            className="admin-btn-primary"
            onClick={() => setEditingTariff({ name: '', credits: 100, price_rub: 1490, badge: 'Выгодно', sort_order: tariffs.length + 1, is_active: true })}
          >
            <Plus size={16} />
            <span>Добавить пакет</span>
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Порядок</th>
                <th>Название</th>
                <th>Кредиты</th>
                <th>Цена (₸)</th>
                <th>Бейдж</th>
                <th>Статус</th>
                <th style={{ textAlign: 'right' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {tariffs.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className="table-order-badge">#{t.sort_order || 0}</span>
                  </td>
                  <td>
                    <strong>{t.name}</strong>
                  </td>
                  <td>
                    <span className="table-credits-chip">
                      <Coins size={13} color="#e5b95c" />
                      <span>{t.credits} CR</span>
                    </span>
                  </td>
                  <td>
                    <span className="table-price">{t.price_rub} ₸</span>
                  </td>
                  <td>
                    {t.badge ? <span className="table-badge-tag">{t.badge}</span> : <span className="text-muted">—</span>}
                  </td>
                  <td>
                    <span className={`table-status-pill ${t.is_active ? 'active' : 'inactive'}`}>
                      {t.is_active ? 'Активен' : 'Скрыт'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions-row">
                      <button 
                        className="table-action-btn edit" 
                        onClick={() => setEditingTariff(t)}
                        title="Редактировать"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        className="table-action-btn delete" 
                        onClick={() => handleDeleteTariff(t.id)}
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Блок 3: Генератор промокодов */}
      <div className="admin-card">
        <div className="admin-card-header-actions">
          <div>
            <h3 className="admin-card-title">Промокоды и маркетинговые акции</h3>
            <p className="admin-card-subtitle">Создавайте подарки для блогеров, праздничные скидки и специальные промо-предложения</p>
          </div>
          <button 
            className="admin-btn-primary"
            onClick={() => setShowPromoModal(true)}
          >
            <Plus size={16} />
            <span>Создать промокод</span>
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Тип</th>
                <th>Бонус / Скидка</th>
                <th>Активаций</th>
                <th>Срок действия</th>
                <th>Статус</th>
                <th style={{ textAlign: 'right' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {promocodes.map((p) => {
                const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
                const isDepleted = p.max_uses && p.used_count >= p.max_uses;

                return (
                  <tr key={p.id}>
                    <td>
                      <span className="table-promo-code">{p.code}</span>
                    </td>
                    <td>
                      {p.type === 'credits' ? 'Бесплатные токены' : 'Скидка на оплату'}
                    </td>
                    <td>
                      {p.type === 'credits' ? (
                        <span className="table-credits-chip">+{p.reward_credits} CR</span>
                      ) : (
                        <span className="table-discount-chip">-{p.discount_percent}%</span>
                      )}
                    </td>
                    <td>
                      <span className="table-usage-count">
                        {p.used_count || 0} / {p.max_uses || '∞'}
                      </span>
                    </td>
                    <td>
                      {p.expires_at ? (
                        <span className={isExpired ? 'text-danger' : ''}>
                          {new Date(p.expires_at).toLocaleDateString('ru-RU')}
                        </span>
                      ) : (
                        <span className="text-muted">Бессрочно</span>
                      )}
                    </td>
                    <td>
                      <span className={`table-status-pill ${p.is_active && !isExpired && !isDepleted ? 'active' : 'inactive'}`}>
                        {isExpired ? 'Истёк' : (isDepleted ? 'Исчерпан' : (p.is_active ? 'Активен' : 'Отключён'))}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="table-action-btn delete" 
                        onClick={() => handleDeletePromo(p.id)}
                        title="Удалить промокод"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {promocodes.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                    <span className="text-muted">Промокодов пока не создано</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* МОДАЛ: РЕДАКТИРОВАНИЕ ТАРИФА */}
      {editingTariff && (
        <div className="admin-modal-overlay" onClick={() => setEditingTariff(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingTariff.id ? 'Редактирование тарифа' : 'Новый пакет кредитов'}</h3>
              <button className="admin-modal-close" onClick={() => setEditingTariff(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTariff} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Название пакета</label>
                <input
                  type="text"
                  value={editingTariff.name}
                  onChange={(e) => setEditingTariff({ ...editingTariff, name: e.target.value })}
                  required
                  placeholder="например: Оптимальный"
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Количество кредитов (CR)</label>
                  <input
                    type="number"
                    value={editingTariff.credits}
                    onChange={(e) => setEditingTariff({ ...editingTariff, credits: parseInt(e.target.value) || 0 })}
                    required
                    min="1"
                    className="admin-form-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Цена (₸)</label>
                  <input
                    type="number"
                    value={editingTariff.price_rub}
                    onChange={(e) => setEditingTariff({ ...editingTariff, price_rub: parseInt(e.target.value) || 0 })}
                    required
                    min="0"
                    className="admin-form-input"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Бейдж (опционально)</label>
                  <input
                    type="text"
                    value={editingTariff.badge || ''}
                    onChange={(e) => setEditingTariff({ ...editingTariff, badge: e.target.value })}
                    placeholder="Хит, VIP, -20%"
                    className="admin-form-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Порядок сортировки</label>
                  <input
                    type="number"
                    value={editingTariff.sort_order || 0}
                    onChange={(e) => setEditingTariff({ ...editingTariff, sort_order: parseInt(e.target.value) || 0 })}
                    className="admin-form-input"
                  />
                </div>
              </div>

              <div className="admin-checkbox-group">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingTariff.is_active !== false}
                    onChange={(e) => setEditingTariff({ ...editingTariff, is_active: e.target.checked })}
                  />
                  <span>Отображать пакет в магазине (Активен)</span>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setEditingTariff(null)}>
                  Отмена
                </button>
                <button type="submit" className="admin-btn-primary">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛ: СОЗДАНИЕ ПРОМОКОДА */}
      {showPromoModal && (
        <div className="admin-modal-overlay" onClick={() => setShowPromoModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Создание нового промокода</h3>
              <button className="admin-modal-close" onClick={() => setShowPromoModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Код промокода</label>
                <input
                  type="text"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="MORPHI_BONUS"
                  className="admin-form-input uppercase"
                />
              </div>

              <div className="admin-form-group">
                <label>Тип промокода</label>
                <div className="admin-radio-pills">
                  <button
                    type="button"
                    className={`radio-pill ${promoForm.type === 'credits' ? 'active' : ''}`}
                    onClick={() => setPromoForm({ ...promoForm, type: 'credits' })}
                  >
                    <Coins size={14} />
                    <span>Бесплатные кредиты (+CR)</span>
                  </button>
                  <button
                    type="button"
                    className={`radio-pill ${promoForm.type === 'discount_percent' ? 'active' : ''}`}
                    onClick={() => setPromoForm({ ...promoForm, type: 'discount_percent' })}
                  >
                    <Percent size={14} />
                    <span>Скидка в процентах (-%)</span>
                  </button>
                </div>
              </div>

              {promoForm.type === 'credits' ? (
                <div className="admin-form-group">
                  <label>Сколько кредитов начислить</label>
                  <input
                    type="number"
                    value={promoForm.reward_credits}
                    onChange={(e) => setPromoForm({ ...promoForm, reward_credits: e.target.value })}
                    required
                    min="1"
                    className="admin-form-input"
                  />
                </div>
              ) : (
                <div className="admin-form-group">
                  <label>Размер скидки (%)</label>
                  <input
                    type="number"
                    value={promoForm.discount_percent}
                    onChange={(e) => setPromoForm({ ...promoForm, discount_percent: e.target.value })}
                    required
                    min="1"
                    max="100"
                    className="admin-form-input"
                  />
                </div>
              )}

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Максимум активаций</label>
                  <input
                    type="number"
                    value={promoForm.max_uses}
                    onChange={(e) => setPromoForm({ ...promoForm, max_uses: e.target.value })}
                    min="1"
                    className="admin-form-input"
                    placeholder="100"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Срок действия (до)</label>
                  <input
                    type="date"
                    value={promoForm.expires_at}
                    onChange={(e) => setPromoForm({ ...promoForm, expires_at: e.target.value })}
                    className="admin-form-input"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowPromoModal(false)}>
                  Отмена
                </button>
                <button type="submit" className="admin-btn-primary">
                  Создать промокод
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TariffsTab;
