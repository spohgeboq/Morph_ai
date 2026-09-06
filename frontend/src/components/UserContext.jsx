import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { syncUser, getUserProfile, getTelegramUser } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const cached = localStorage.getItem('morphai_cached_user');
    return cached ? JSON.parse(cached) : getTelegramUser();
  });
  const [balance, setBalance] = useState(50);
  const [loading, setLoading] = useState(true);

  // Синхронизация с сервером при старте
  const refreshUser = useCallback(async () => {
    try {
      const user = await syncUser();
      if (user) {
        setCurrentUser(user);
        setBalance(user.balance ?? 50);
        localStorage.setItem('morphai_cached_user', JSON.stringify(user));
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
      const updated = { ...prev, balance: newBalance };
      localStorage.setItem('morphai_cached_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        balance,
        setBalance: updateBalance,
        refreshUser,
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
