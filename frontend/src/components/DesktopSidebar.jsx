import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Film, 
  PlusCircle, 
  MessageSquare, 
  User, 
  Plus 
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useUser } from './UserContext';

const DesktopSidebar = ({ onOpenRecharge }) => {
  const { t } = useLanguage();
  const { balance } = useUser();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: t('navHome'), icon: Home, end: true },
    { to: '/feed', label: t('navFeed'), icon: Film },
    { 
      to: '/create', 
      label: t('navCreate'), 
      icon: PlusCircle,
      isPrimaryAction: true,
      badge: 'PRO'
    },
    { to: '/chats', label: t('navChats'), icon: MessageSquare },
    { to: '/profile', label: t('navProfile'), icon: User },
  ];

  return (
    <aside className="desktop-apple-sidebar">
      {/* 1. Верхний брендинг в стиле macOS App */}
      <div className="sidebar-brand-header" onClick={() => navigate('/')}>
        <div className="brand-logo-squircle">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#paint0_ds)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="url(#paint1_ds)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="url(#paint2_ds)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="paint0_ds" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ff4d8d"/>
                <stop offset="1" stopColor="#e5b95c"/>
              </linearGradient>
              <linearGradient id="paint1_ds" x1="2" y1="17" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ff4d8d"/>
                <stop offset="1" stopColor="#850e2b"/>
              </linearGradient>
              <linearGradient id="paint2_ds" x1="2" y1="12" x2="22" y2="17" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ff4d8d"/>
                <stop offset="1" stopColor="#e5b95c"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="sidebar-brand-info">
          <div className="sidebar-brand-title-row">
            <span className="sidebar-brand-title">Morph AI</span>
            <span className="sidebar-brand-pill">STUDIO</span>
          </div>
          <span className="sidebar-brand-sub">Neural Ecosystem</span>
        </div>
      </div>

      {/* 2. Виджет баланса (Apple-style Glass Card) */}
      <div className="sidebar-balance-widget">
        <div className="balance-widget-main">
          <div className="balance-token-chip">
            <div className="balance-token-symbol">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 12L12 22L22 12L12 2Z" stroke="#e5b95c" strokeWidth="2.4" strokeLinejoin="round" fill="rgba(229, 185, 92, 0.25)" />
                <path d="M12 6L6 12L12 18L18 12L12 6Z" stroke="#e5b95c" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="balance-label-col">
              <span className="balance-tag-text">Баланс монет</span>
              <span className="balance-val-text">{balance} <small>CR</small></span>
            </div>
          </div>
          <button 
            className="balance-topup-action-btn"
            onClick={onOpenRecharge}
            title="Пополнить баланс"
          >
            <Plus size={14} strokeWidth={2.8} />
            <span>Пополнить</span>
          </button>
        </div>
      </div>

      {/* 3. Основная навигация (macOS Glass Menu) */}
      <nav className="sidebar-nav-group">
        <span className="sidebar-section-title">МЕНЮ</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''} ${item.isPrimaryAction ? 'primary-action-item' : ''}`}
            >
              <div className="nav-icon-box">
                <Icon size={19} strokeWidth={2} />
              </div>
              <span className="nav-label-text">{item.label}</span>
              {item.badge && (
                <span className="nav-action-badge">{item.badge}</span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default DesktopSidebar;
