import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { ToastProvider } from './components/ToastContext';
import { LanguageProvider } from './components/LanguageContext';
import { CurrencyProvider } from './components/CurrencyContext';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Create from './pages/Create';
import Chats from './pages/Chats';
import Profile from './pages/Profile';
import AdminHub from './pages/Admin/AdminHub';

import { UserProvider } from './components/UserContext';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add('admin-active-mode');
    } else {
      document.body.classList.remove('admin-active-mode');
    }
    return () => {
      document.body.classList.remove('admin-active-mode');
    };
  }, [isAdmin]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/create" element={<Create />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminHub />} />
      </Routes>
      {!isAdmin && <BottomNav />}
    </>
  );
}


function App() {
  useEffect(() => {
    try {
      WebApp.ready();
      WebApp.expand();
      WebApp.setHeaderColor('#0f0a0c');
      WebApp.setBackgroundColor('#0f0a0c');
    } catch (error) {
      console.log('Running outside Telegram');
    }
  }, []);

  return (
    <LanguageProvider>
      <CurrencyProvider>
        <UserProvider>
          <ToastProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </ToastProvider>
        </UserProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}

export default App;

