import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { ToastProvider } from './components/ToastContext';
import { LanguageProvider } from './components/LanguageContext';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Create from './pages/Create';
import Chats from './pages/Chats';
import Profile from './pages/Profile';

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
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/create" element={<Create />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <BottomNav />
        </BrowserRouter>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;
