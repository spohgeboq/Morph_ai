import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Film, PlusCircle, MessageSquare, User } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const BottomNav = () => {
  const { t } = useLanguage();

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
        <Home size={20} />
        <span>{t('navHome')}</span>
      </NavLink>

      <NavLink to="/feed" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Film size={20} />
        <span>{t('navFeed')}</span>
      </NavLink>

      <NavLink to="/create" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <PlusCircle size={21} color="var(--color-primary-light)" />
        <span>{t('navCreate')}</span>
      </NavLink>

      <NavLink to="/chats" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <MessageSquare size={20} />
        <span>{t('navChats')}</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={20} />
        <span>{t('navProfile')}</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
