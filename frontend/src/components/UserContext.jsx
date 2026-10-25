import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { syncUser, getUserProfile, getTelegramUser, telegramLogin } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const cached = localStorage.getItem('morphai_cached_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.id === 123456789 || parsed.telegram_id === 123456789 || parsed.username === 'MorphUser' || parsed.is_mock)) {
          localStorage.removeItem('morphai_cached_user');
          localStorage.removeItem('morphai_local_user');
          return null;
        }
        return parsed;
      }
    } catch (e) {}
    return getTelegramUser();
  });
  const [balance, setBalance] = useState(() => {
    return currentUser?.balance ?? 0;
  });
  const [loading, setLoading] = useState(true);

  // Инициализация Telegram WebApp
  useEffect(() => {
    try {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      }
    } catch (e) {
      console.warn('[UserContext] WebApp init error:', e);
    }
  }, []);

  // Синхронизация с сервером при старте (только для реальных пользователей Telegram)
  const refreshUser = useCallback(async () => {
    try {
      const tgUser = getTelegramUser();
      if (!tgUser || !tgUser.id || tgUser.is_mock || tgUser.id === 123456789) {
        setCurrentUser(null);
        setBalance(0);
        return;
      }
      const user = await syncUser();
      if (user && user.id) {
        setCurrentUser(user);
        setBalance(user.balance ?? 50);
        localStorage.setItem('morphai_cached_user', JSON.stringify(user));
      } else {
        setCurrentUser(null);
        setBalance(0);
      }
    } catch (err) {
      console.error('[UserContext] Error refreshing user:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Обновление баланса локально + сохранение
  const updateBalance = (newBalance) => {
    setBalance(newBalance);
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, balance: newBalance };
      localStorage.setItem('morphai_cached_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Выход из профиля
  const logout = () => {
    try {
      localStorage.removeItem('morphai_cached_user');
      localStorage.removeItem('morphai_local_user');
    } catch (e) {}
    setCurrentUser(null);
    setBalance(0);
  };

  // Ручная или быстрая авторизация через Telegram (для веб-версии)
  const loginViaTelegram = async ({ username, telegram_id, first_name, photo_url }) => {
    try {
      setLoading(true);
      const user = await telegramLogin({ username, telegram_id, first_name, photo_url });
      if (user) {
        setCurrentUser(user);
        setBalance(user.balance ?? 50);
        localStorage.setItem('morphai_cached_user', JSON.stringify(user));
        return user;
      }
    } catch (err) {
      console.error('[UserContext] loginViaTelegram error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        balance,
        setBalance: updateBalance,
        refreshUser,
        loginViaTelegram,
        logout,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
