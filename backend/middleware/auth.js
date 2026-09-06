/**
 * Валидация Telegram Web App initData.
 * Проверяет подпись данных от Telegram для аутентификации запросов из TWA.
 */
const crypto = require('crypto');

/**
 * Middleware для проверки Telegram initData.
 * Пропускает запросы в dev-режиме если нет initData.
 */
function authMiddleware(req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';

  // Получаем initData из заголовка
  const initData = req.headers['x-telegram-init-data'];

  // В dev-режиме разрешаем запросы без initData (для тестирования)
  if (!initData) {
    if (isDev) {
      // Позволяем передать telegram_id напрямую в body для dev-тестирования
      return next();
    }
    return res.status(401).json({ error: true, message: 'Отсутствует Telegram initData' });
  }

  try {
    const validated = validateInitData(initData, process.env.TELEGRAM_BOT_TOKEN);
    if (!validated) {
      return res.status(401).json({ error: true, message: 'Невалидная подпись Telegram initData' });
    }

    // Парсим данные пользователя из initData
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    if (userStr) {
      req.telegramUser = JSON.parse(userStr);
    }

    next();
  } catch (error) {
    console.error('[AUTH] Ошибка валидации initData:', error.message);
    return res.status(401).json({ error: true, message: 'Ошибка аутентификации' });
  }
}

/**
 * Проверяет подпись Telegram initData по алгоритму HMAC-SHA256.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * @param {string} initData — raw initData string
 * @param {string} botToken — токен бота
 * @returns {boolean}
 */
function validateInitData(initData, botToken) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');

  if (!hash) return false;

  // Удаляем hash из параметров, сортируем остальные
  urlParams.delete('hash');
  const entries = Array.from(urlParams.entries());
  entries.sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([key, val]) => `${key}=${val}`).join('\n');

  // Создаём секретный ключ: HMAC-SHA256("WebAppData", botToken)
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  // Вычисляем HMAC-SHA256(secretKey, dataCheckString)
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return computedHash === hash;
}

module.exports = { authMiddleware, validateInitData };
