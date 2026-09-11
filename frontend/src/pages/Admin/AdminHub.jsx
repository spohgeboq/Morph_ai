import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Film, 
  Users, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import DashboardTab from './DashboardTab';
import ModelsTab from './ModelsTab';
import TariffsTab from './TariffsTab';
import ContentTab from './ContentTab';
import UsersTab from './UsersTab';
import SettingsTab from './SettingsTab';
import { getAdminToken, clearAdminToken, fetchAdminStats } from '../../services/api';

const AdminHub = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAdminToken());
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'tariffs' | 'content' | 'users' | 'settings'

  // Сводная статистика
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Внутренний тост админки
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      if (err.message && err.message.includes('401')) {
        handleLogout();
      } else {
        showToast(err.message || 'Ошибка загрузки данных', 'error');
      }
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    clearAdminToken();
    setIsAuthenticated(false);
    showToast('Вы вышли из панели управления', 'info');
  };

  // Если не авторизован — показываем экран ввода пароля
  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          showToast('Добро пожаловать в Morphi Admin Hub', 'success');
        }}
      />
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Дашборд', subtitle: 'Финансы и статистика', icon: LayoutDashboard },
    { id: 'models', label: 'ИИ Модели & Цены', subtitle: 'Тарифы и обложки', icon: Cpu },
    { id: 'tariffs', label: 'Пакеты & Промо', subtitle: 'Прайс-лист и акции', icon: CreditCard },
    { id: 'content', label: 'Лента & Витрина', subtitle: 'Посты, Stories, Студия', icon: Film },
    { id: 'users', label: 'Пользователи (CRM)', subtitle: 'Клиенты и поддержка', icon: Users },
    { id: 'settings', label: 'Система & Рассылка', subtitle: 'Бот и техработы', icon: Settings },
  ];

  const currentTabObj = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="admin-hub-container">
      {/* Тост админки */}
      {toast && (
        <div className={`admin-toast-banner ${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Верхняя навигационная панель */}
      <header className="admin-navbar">
        <div className="admin-navbar-left">
          <div className="admin-brand-logo" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Sparkles size={20} color="#e5b95c" />
            <span className="brand-name">Morphi Hub</span>
            <span className="brand-badge">ADMIN</span>
          </div>

          <div className="admin-nav-breadcrumb desktop-only">
            <span className="breadcrumb-slash">/</span>
            <span className="breadcrumb-active-label">{currentTabObj.label}</span>
          </div>
        </div>

        <div className="admin-navbar-right">
          <div className="admin-online-pill desktop-only">
            <span className="online-green-dot" />
            <span>Сервер онлайн</span>
          </div>

          <button 
            className="admin-nav-btn secondary"
            onClick={() => navigate('/')}
            title="Перейти в клиентское приложение"
          >
            <ArrowLeft size={16} />
            <span className="desktop-only">В приложение</span>
          </button>

          <button 
            className="admin-nav-btn danger"
            onClick={handleLogout}
            title="Выйти из сессии админа"
          >
            <LogOut size={16} />
            <span className="desktop-only">Выйти</span>
          </button>
        </div>
      </header>

      {/* Основной лейаут (сайдбар + контент) */}
      <div className="admin-main-layout">
        {/* Боковой сайдбар на десктопе / панель вкладок */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-section-title desktop-only">РАЗДЕЛЫ СИСТЕМЫ</div>
          <nav className="admin-nav-menu">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`admin-menu-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} className="menu-icon" />
                  <div className="menu-text-wrap">
                    <span className="menu-label">{tab.label}</span>
                    <span className="menu-subtitle desktop-only">{tab.subtitle}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="admin-sidebar-footer desktop-only">
            <div className="sidebar-engine-info">
              <span className="engine-title">Morphi Engine</span>
              <span className="engine-ver">v2.0 • PostgreSQL Live</span>
            </div>
          </div>
        </aside>


        {/* Рабочая область текущей вкладки */}
        <main className="admin-tab-viewport">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              stats={stats} 
              loading={loadingStats} 
              onRefresh={loadStats}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'models' && (
            <ModelsTab onShowToast={showToast} />
          )}

          {activeTab === 'tariffs' && (
            <TariffsTab onShowToast={showToast} />
          )}

          {activeTab === 'content' && (
            <ContentTab onShowToast={showToast} />
          )}

          {activeTab === 'users' && (
            <UsersTab onShowToast={showToast} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab onShowToast={showToast} />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminHub;
