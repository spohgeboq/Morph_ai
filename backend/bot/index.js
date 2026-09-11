const TelegramBot = require('node-telegram-bot-api');
const db = require('../db');
const { setupStartHandler } = require('./handlers/start');
const { setupGenerateHandler } = require('./handlers/generate');
const { setupFaceSwapHandler } = require('./handlers/faceswap');

// Кэш недавних регистраций (telegram_id -> timestamp), чтобы не делать лишний DB запрос на каждое сообщение
const registeredUsersCache = new Map();

/**
 * Автоматическая регистрация пользователя при ЛЮБОМ входящем событии в боте.
 * Пользователь регистрируется сразу же, ничего не нажимая.
 *
 * @param {object} tgUser - объект пользователя Telegram (msg.from / query.from)
 * @param {TelegramBot} bot - инстанс бота
 * @returns {Promise<object|null>} - запись пользователя из БД
 */
async function autoRegisterTelegramUser(tgUser, bot) {
  if (!tgUser || !tgUser.id) return null;

  const now = Date.now();
  const lastSync = registeredUsersCache.get(tgUser.id);
  // Если синхронизировали меньше 2 минут назад, пропускаем повторный запрос
  if (lastSync && now - lastSync < 120000) {
    return null;
  }

  try {
    let photoUrl = null;

    // Пытаемся получить аватар пользователя из Telegram
    if (bot && typeof bot.getUserProfilePhotos === 'function') {
      try {
        const photos = await bot.getUserProfilePhotos(tgUser.id, { limit: 1 });
        if (photos && photos.total_count > 0 && photos.photos[0] && photos.photos[0].length > 0) {
          const highestResPhoto = photos.photos[0][photos.photos[0].length - 1];
          photoUrl = await bot.getFileLink(highestResPhoto.file_id);
        }
      } catch (photoErr) {
        // Игнорируем ошибку получения фото (может быть скрыто настройками приватности пользователя)
      }
    }

    const language = (tgUser.language_code || 'ru').slice(0, 5);

    const result = await db.query(
      `INSERT INTO users (telegram_id, username, first_name, language, photo_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (telegram_id) DO UPDATE SET
         username = COALESCE(EXCLUDED.username, users.username),
         first_name = COALESCE(EXCLUDED.first_name, users.first_name),
         language = COALESCE(EXCLUDED.language, users.language),
         photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url),
         updated_at = NOW()
       RETURNING *`,
      [tgUser.id, tgUser.username || null, tgUser.first_name || null, language, photoUrl]
    );

    registeredUsersCache.set(tgUser.id, now);
    const user = result.rows[0];
    console.log(`[Bot/AutoRegister] ✓ Пользователь ${tgUser.id} (@${tgUser.username || 'anon'}) успешно зарегистрирован/обновлен. Баланс: ${user.balance} CR`);
    return user;
  } catch (error) {
    console.error('[Bot/AutoRegister] ❌ Ошибка авторегистрации пользователя:', error.message);
    return null;
  }
}

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

  // Глобальный перехватчик: регистрирует пользователя СРАЗУ ЖЕ при любом входящем сообщении
  bot.on('message', async (msg) => {
    if (msg?.from) {
      await autoRegisterTelegramUser(msg.from, bot);
    }
  });

  // Глобальный перехватчик для любых кнопок
  bot.on('callback_query', async (query) => {
    if (query?.from) {
      await autoRegisterTelegramUser(query.from, bot);
    }
  });

  // Настройка меню-кнопки (Menu Button) и команд бота
  try {
    const webAppUrl = process.env.TELEGRAM_WEBAPP_URL || process.env.CLIENT_URL;

    // Устанавливаем команды бота
    bot.setMyCommands([
      { command: 'start', description: '🚀 Главное меню и баланс' },
      { command: 'app', description: '✨ Запустить MorphAI WebApp' },
      { command: 'balance', description: '💰 Проверить баланс кредитов' },
      { command: 'help', description: '📖 Справка и возможности' },
    ]).catch((err) => console.warn('[Bot] setMyCommands error:', err.message));

    // Если указан HTTPS URL для WebApp, настраиваем кнопку меню
    if (webAppUrl && webAppUrl.startsWith('https://')) {
      bot.setChatMenuButton({
        menu_button: {
          type: 'web_app',
          text: '🚀 MorphAI Studio',
          web_app: { url: webAppUrl },
        },
      }).then(() => {
        console.log(`[Bot] ✓ Menu Button настроен на WebApp: ${webAppUrl}`);
      }).catch((err) => {
        console.warn('[Bot] setChatMenuButton error:', err.message);
      });
    }
  } catch (menuErr) {
    console.warn('[Bot] Ошибка настройки меню:', menuErr.message);
  }

  // Подключаем обработчики
  setupStartHandler(bot);
  setupGenerateHandler(bot, registry);
  setupFaceSwapHandler(bot);

  // Обработка ошибок polling
  bot.on('polling_error', (error) => {
    console.error('[Bot] Polling error:', error.code, error.message);
  });

  // Логируем входящие сообщения в dev-режиме
  if (process.env.NODE_ENV !== 'production') {
    bot.on('message', (msg) => {
      console.log(`[Bot] Сообщение от ${msg.from.id} (@${msg.from.username}): ${msg.text || '[медиа]'}`);
    });
  }

  console.log('[Bot] ✓ Все обработчики и авторегистрация подключены');
  return bot;
}

module.exports = { initBot, autoRegisterTelegramUser };
