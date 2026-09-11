import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Coins, 
  DollarSign, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Calendar, 
  Copy, 
  X, 
  Plus, 
  Minus, 
  Send, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  ExternalLink,
  Ban,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  fetchAdminUsers, 
  fetchAdminUserDetail, 
  adjustUserBalance, 
  toggleUserBan 
} from '../../services/api';

const UsersTab = ({ onShowToast }) => {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'paying' | 'banned' | 'zero'
  const [page, setPage] = useState(0);
  const limit = 25;
  const [loading, setLoading] = useState(true);

  // Выбранный пользователь для детального модала
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Форма ручного начисления баланса
  const [balanceAmount, setBalanceAmount] = useState(50);
  const [balanceReason, setBalanceReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers({
        search,
        filter,
        limit,
        offset: page * limit,
      });
      setUsers(data.users || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      onShowToast(err.message || 'Ошибка загрузки пользователей', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, filter, page]);

  // Загрузка детального профиля
  const handleOpenUser = async (id) => {
    setSelectedUserId(id);
    setDetailLoading(true);
    try {
      const data = await fetchAdminUserDetail(id);
      setUserDetail(data);
    } catch (err) {
      onShowToast(err.message || 'Ошибка загрузки профиля', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  // Ручное начисление / списание кредитов
  const handleAdjustBalance = async (customDelta = null) => {
    const amount = customDelta !== null ? customDelta : parseInt(balanceAmount);
    if (!amount || isNaN(amount)) {
      onShowToast('Введите корректную сумму', 'error');
      return;
    }

    setAdjusting(true);
    try {
      const res = await adjustUserBalance(selectedUserId, amount, balanceReason || 'Корректировка администратора');
      onShowToast(amount > 0 ? `Начислено +${amount} CR` : `Списано ${amount} CR`, 'success');
      
      // Обновляем локально данные
      setUserDetail((prev) => ({
        ...prev,
        user: { ...prev.user, balance: res.user.balance },
      }));
      setBalanceReason('');
      loadUsers();
    } catch (err) {
      onShowToast(err.message || 'Ошибка начисления', 'error');
    } finally {
      setAdjusting(false);
    }
  };

  // Бан / Разбан
  const handleToggleBan = async (id) => {
    try {
      const updatedUser = await toggleUserBan(id);
      onShowToast(updatedUser.is_banned ? 'Пользователь заблокирован' : 'Пользователь разблокирован', 'success');
      if (userDetail && userDetail.user.id === id) {
        setUserDetail((prev) => ({ ...prev, user: updatedUser }));
      }
      loadUsers();
    } catch (err) {
      onShowToast(err.message || 'Ошибка изменения статуса', 'error');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    onShowToast(`${label} скопирован в буфер`, 'success');
  };

  return (
    <div className="admin-users-tab">
      {/* Шапка раздела */}
      <div className="admin-tab-header">
        <div>
          <h2 className="admin-tab-title">CRM пользователей и Поддержка</h2>
          <p className="admin-tab-desc">Поиск клиентов, управление балансом, история генераций и решение вопросов поддержки</p>
        </div>
      </div>

      {/* Панель поиска и фильтров */}
      <div className="admin-card admin-users-controls-card">
        <div className="admin-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Поиск по Telegram ID, нику или имени..."
            className="admin-search-input"
          />
          {search && (
            <button className="search-clear-btn" onClick={() => setSearch('')}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="admin-filter-pills-row">
          <button 
            className={`admin-filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => { setFilter('all'); setPage(0); }}
          >
            Все ({totalCount})
          </button>
          <button 
            className={`admin-filter-pill ${filter === 'paying' ? 'active' : ''}`}
            onClick={() => { setFilter('paying'); setPage(0); }}
          >
            Платившие клиенты
          </button>
          <button 
            className={`admin-filter-pill ${filter === 'banned' ? 'active' : ''}`}
            onClick={() => { setFilter('banned'); setPage(0); }}
          >
            Заблокированные
          </button>
          <button 
            className={`admin-filter-pill ${filter === 'zero' ? 'active' : ''}`}
            onClick={() => { setFilter('zero'); setPage(0); }}
          >
            Баланс 0
          </button>
        </div>
      </div>

      {/* Таблица пользователей */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Telegram ID</th>
                <th>Баланс</th>
                <th>Оплачено</th>
                <th>Генераций</th>
                <th>Регистрация</th>
                <th>Статус</th>
                <th style={{ textAlign: 'right' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="admin-user-cell">
                      <div className="admin-user-avatar">
                        {(u.first_name || u.username || 'M').charAt(0).toUpperCase()}
                      </div>
                      <div className="admin-user-meta">
                        <span className="user-name">{u.first_name || 'Без имени'}</span>
                        <span className="user-handle">{u.username ? `@${u.username}` : 'нет ника'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="table-tg-id-row">
                      <span className="tg-id-text">{u.telegram_id}</span>
                      <button 
                        className="tg-id-copy-btn" 
                        onClick={() => copyToClipboard(u.telegram_id, 'Telegram ID')}
                        title="Скопировать"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className="table-credits-chip">
                      <Coins size={13} color="#e5b95c" />
                      <span>{u.balance} CR</span>
                    </span>
                  </td>
                  <td>
                    <span className="table-paid-amount">
                      {Number(u.total_paid || 0).toLocaleString('ru-RU')} ₸
                    </span>
                  </td>
                  <td>
                    <span className="table-gens-count">{u.generations_count || 0}</span>
                  </td>
                  <td>
                    <span className="text-muted">
                      {new Date(u.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </td>
                  <td>
                    <span className={`table-status-pill ${u.is_banned ? 'banned' : 'active'}`}>
                      {u.is_banned ? 'Заблокирован' : 'Активен'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="admin-open-user-btn"
                      onClick={() => handleOpenUser(u.id)}
                    >
                      <span>Карточка</span>
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px' }}>
                    <span className="text-muted">Пользователи по заданному запросу не найдены</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        <div className="admin-pagination-row">
          <span className="pagination-info">
            Показано {users.length} из {totalCount} пользователей
          </span>
          <div className="pagination-btns">
            <button 
              className="admin-pagination-btn"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={16} />
              <span>Назад</span>
            </button>
            <span className="pagination-page-indicator">Стр. {page + 1}</span>
            <button 
              className="admin-pagination-btn"
              disabled={(page + 1) * limit >= totalCount}
              onClick={() => setPage(page + 1)}
            >
              <span>Вперёд</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО: КАРТОЧКА КЛИЕНТА (CRM DRAWER) */}
      {selectedUserId && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUserId(null)}>
          <div className="admin-modal-card user-detail-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="user-detail-header-title">
                <h3>Карточка клиента #{selectedUserId}</h3>
                {userDetail?.user?.is_banned && (
                  <span className="badge-banned-alert">Заблокирован</span>
                )}
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedUserId(null)}>
                <X size={18} />
              </button>
            </div>

            {detailLoading || !userDetail ? (
              <div className="admin-tab-loading">
                <div className="admin-spinner" />
                <p>Загрузка профиля...</p>
              </div>
            ) : (
              <div className="user-detail-body">
                {/* Сводная инфа о пользователе */}
                <div className="user-detail-summary-grid">
                  <div className="user-summary-item">
                    <span className="summary-label">Имя и Ник</span>
                    <strong className="summary-val">{userDetail.user.first_name || '—'} ({userDetail.user.username ? `@${userDetail.user.username}` : 'нет'})</strong>
                  </div>
                  <div className="user-summary-item">
                    <span className="summary-label">Telegram ID</span>
                    <strong className="summary-val">{userDetail.user.telegram_id}</strong>
                  </div>
                  <div className="user-summary-item">
                    <span className="summary-label">Текущий баланс</span>
                    <strong className="summary-val gold">{userDetail.user.balance} CR</strong>
                  </div>
                  <div className="user-summary-item">
                    <span className="summary-label">Всего платежей</span>
                    <strong className="summary-val green">{Number(userDetail.user.total_spent || 0).toLocaleString()} ₸</strong>
                  </div>
                </div>

                {/* Блок действий поддержки: Начисление баланса */}
                <div className="admin-card user-actions-box">
                  <h4 className="user-box-subtitle">Начисление или списание кредитов</h4>
                  <div className="quick-add-presets">
                    <button className="quick-add-btn" onClick={() => handleAdjustBalance(25)}>+25 CR</button>
                    <button className="quick-add-btn" onClick={() => handleAdjustBalance(50)}>+50 CR</button>
                    <button className="quick-add-btn" onClick={() => handleAdjustBalance(100)}>+100 CR</button>
                    <button className="quick-add-btn" onClick={() => handleAdjustBalance(500)}>+500 CR</button>
                  </div>

                  <div className="custom-adjust-row">
                    <input
                      type="number"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      placeholder="Сумма (например +50 или -20)"
                      className="admin-form-input"
                    />
                    <input
                      type="text"
                      value={balanceReason}
                      onChange={(e) => setBalanceReason(e.target.value)}
                      placeholder="Причина (Компенсация за сбой, подарок и т.д.)"
                      className="admin-form-input"
                    />
                    <button 
                      className="admin-btn-primary" 
                      onClick={() => handleAdjustBalance()}
                      disabled={adjusting}
                    >
                      {adjusting ? 'Начисление...' : 'Применить'}
                    </button>
                  </div>
                </div>

                {/* Кнопка Блокировки */}
                <div className="user-ban-section">
                  <button 
                    className={`user-ban-btn ${userDetail.user.is_banned ? 'unban' : 'ban'}`}
                    onClick={() => handleToggleBan(userDetail.user.id)}
                  >
                    <Ban size={16} />
                    <span>{userDetail.user.is_banned ? 'Разблокировать пользователя' : 'Заблокировать пользователя'}</span>
                  </button>
                </div>

                {/* История последних генераций юзера */}
                <div className="user-history-section">
                  <h4 className="user-box-subtitle">История генераций клиента ({userDetail.generations?.length || 0})</h4>
                  <div className="user-history-list">
                    {userDetail.generations?.map((g) => (
                      <div key={g.id} className="user-gen-item">
                        <div className="user-gen-top-row">
                          <span className="gen-model-badge">{g.model_name}</span>
                          <span className={`gen-status-badge ${g.status}`}>
                            {g.status === 'completed' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                            <span>{g.status}</span>
                          </span>
                          <span className="gen-cost">-{g.credits_charged} CR</span>
                          <span className="gen-date">{new Date(g.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="user-gen-prompt">{g.prompt}</p>
                        {g.result_url && (
                          <a href={g.result_url} target="_blank" rel="noreferrer" className="user-gen-link">
                            <span>Открыть результат</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ))}

                    {(!userDetail.generations || userDetail.generations.length === 0) && (
                      <div className="admin-empty-state-text">Пользователь ещё ничего не генерировал</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
