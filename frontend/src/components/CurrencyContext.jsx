import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = {
  KZT: {
    code: 'KZT',
    symbol: '₸',
    label: 'Тенге (₸) 🇰🇿',
    rate: 1.0,
    position: 'after',
  },
  RUB: {
    code: 'RUB',
    symbol: '₽',
    label: 'Рубль (₽) 🇷🇺',
    rate: 0.19,
    position: 'after',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'Доллар ($) 🇺🇸',
    rate: 0.002,
    position: 'before',
  },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    try {
      const saved = localStorage.getItem('morphai_currency');
      return (saved && CURRENCIES[saved]) ? saved : 'KZT';
    } catch {
      return 'KZT';
    }
  });

  const setCurrency = (newCurrency) => {
    if (CURRENCIES[newCurrency]) {
      setCurrencyState(newCurrency);
      try {
        localStorage.setItem('morphai_currency', newCurrency);
      } catch (e) {
        console.warn('Failed to save currency to localStorage', e);
      }
    }
  };

  /**
   * Конвертирует и форматирует цену из базовой валюты (KZT) в выбранную
   * @param {number} amountInKzt - сумма в тенге (например 1490)
   * @returns {string} - отформатированная строка (например "1 490 ₸" или "285 ₽" или "$2.98")
   */
  const formatPrice = (amountInKzt) => {
    const num = Number(amountInKzt) || 0;
    const info = CURRENCIES[currency] || CURRENCIES.KZT;

    if (currency === 'USD') {
      const val = (num * info.rate).toFixed(2);
      return `$${val}`;
    }

    const converted = Math.round(num * info.rate);
    const formattedNum = converted.toLocaleString('ru-RU');
    return `${formattedNum} ${info.symbol}`;
  };

  /**
   * Возвращает объект с числовым значением и символом
   */
  const convertPrice = (amountInKzt) => {
    const num = Number(amountInKzt) || 0;
    const info = CURRENCIES[currency] || CURRENCIES.KZT;
    const value = currency === 'USD' ? Number((num * info.rate).toFixed(2)) : Math.round(num * info.rate);
    return {
      value,
      symbol: info.symbol,
      code: info.code,
      formatted: formatPrice(amountInKzt),
    };
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencies: CURRENCIES, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Fallback safe defaults if used outside provider
    return {
      currency: 'KZT',
      setCurrency: () => {},
      currencies: CURRENCIES,
      formatPrice: (amount) => `${Number(amount || 0).toLocaleString('ru-RU')} ₸`,
      convertPrice: (amount) => ({
        value: Number(amount || 0),
        symbol: '₸',
        code: 'KZT',
        formatted: `${Number(amount || 0).toLocaleString('ru-RU')} ₸`,
      }),
    };
  }
  return ctx;
};

export default CurrencyContext;
