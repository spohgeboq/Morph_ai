/**
 * Telegram Bot — инициализация и подключение обработчиков.
 */
const TelegramBot = require('node-telegram-bot-api');
const { setupStartHandler } = require('./handlers/start');
const { setupGenerateHandler } = require('./handlers/generate');
const { setupFaceSwapHandler } = require('./handlers/faceswap');

/**
 * Инициализировать Telegram-бота.
 *
 * @param {object} options
 * @param {object} options.registry — ServiceRegistry
 * @returns {TelegramBot}
 */
function initBot({ registry }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error('[Bot] ❌ TELEGRAM_BOT_TOKEN не задан в .env!');
    return null;
  }

  // В dev-режиме используем polling, в prod — webhook
  const isProduction = process.env.NODE_ENV === 'production';

  let bot;
  if (isProduction && process.env.WEBHOOK_URL) {
    bot = new TelegramBot(token, { webHook: true });
    const webhookUrl = `${process.env.WEBHOOK_URL}/bot${token}`;
    bot.setWebHook(webhookUrl);
    console.log(`[Bot] ✓ Webhook установлен: ${webhookUrl}`);
  } else {
    bot = new TelegramBot(token, { polling: true });
    console.log('[Bot] ✓ Запущен в режиме polling');
  }

  // Подключаем обработчики
  setupStartHandler(bot);
  setupGenerateHandler(bot, registry);
  setupFaceSwapHandler(bot);

  // Обработка ошибок polling
  bot.on('polling_error', (error) => {
    console.error('[Bot] Polling error:', error.code, error.message);
  });

  // Логируем все входящие сообщения (debug)
  if (process.env.NODE_ENV !== 'production') {
    bot.on('message', (msg) => {
      console.log(`[Bot] Сообщение от ${msg.from.id} (@${msg.from.username}): ${msg.text || '[медиа]'}`);
    });
  }

  console.log('[Bot] ✓ Все обработчики подключены');
  return bot;
}

module.exports = { initBot };
