/**
 * /start — приветствие и регистрация пользователя.
 */
const db = require('../../db');
const { mainMenuKeyboard } = require('../keyboards');

function setupStartHandler(bot) {
  // Команда /start
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;

    try {
      // Upsert пользователя
      const result = await db.query(
        `INSERT INTO users (telegram_id, username, first_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (telegram_id) DO UPDATE SET
           username = COALESCE(EXCLUDED.username, users.username),
           first_name = COALESCE(EXCLUDED.first_name, users.first_name),
           updated_at = NOW()
         RETURNING *`,
        [user.id, user.username || null, user.first_name || null]
      );

      const dbUser = result.rows[0];
      const isNew = dbUser.created_at === dbUser.updated_at;

      const greeting = isNew
        ? `🎉 Добро пожаловать в *MorphAI*, ${user.first_name || 'друг'}!\n\n` +
          `Вам начислено *${dbUser.balance} кредитов* для старта.\n\n`
        : `👋 С возвращением, ${user.first_name || 'друг'}!\n\n` +
          `Ваш баланс: *${dbUser.balance} CR*\n\n`;

      const description =
        '🤖 Я — ваш мультимодальный ИИ-хаб. Вот что я умею:\n\n' +
        '📸 *Фото* — Flux, DALL-E 3, Imagen 3, Seedream и другие\n' +
        '🎬 *Видео* — Kling AI, Hailuo, Luma, Runway, Seedance\n' +
        '✍️ *Текст* — GPT-4o, Claude, Gemini, Llama 3\n' +
        '🔄 *Face Swap* — замена лица в видео\n\n' +
        'Выберите категорию ниже 👇';

      await bot.sendMessage(chatId, greeting + description, {
        parse_mode: 'Markdown',
        ...mainMenuKeyboard(),
      });
    } catch (error) {
      console.error('[Bot/Start] Ошибка:', error.message);
      await bot.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже.');
    }
  });

  // Команда /help
  bot.onText(/\/help/, async (msg) => {
    const helpText =
      '📖 *Команды MorphAI:*\n\n' +
      '/start — Главное меню\n' +
      '/balance — Проверить баланс\n' +
      '/generate — Начать генерацию\n' +
      '/faceswap — Face Swap видео\n' +
      '/help — Эта справка\n\n' +
      '💡 Или просто выберите категорию в меню!';

    await bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' });
  });

  // Команда /balance
  bot.onText(/\/balance/, async (msg) => {
    try {
      const result = await db.query(
        'SELECT balance FROM users WHERE telegram_id = $1',
        [msg.from.id]
      );

      if (result.rows.length === 0) {
        return bot.sendMessage(msg.chat.id, 'Вы ещё не зарегистрированы. Нажмите /start');
      }

      const balance = result.rows[0].balance;
      await bot.sendMessage(
        msg.chat.id,
        `💰 Ваш баланс: *${balance} CR*`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('[Bot/Balance]', error.message);
      await bot.sendMessage(msg.chat.id, '❌ Ошибка получения баланса.');
    }
  });

  // Callback: вернуться в главное меню
  bot.on('callback_query', async (query) => {
    if (query.data === 'back:main') {
      await bot.editMessageText(
        '🤖 *MorphAI* — Выберите категорию:',
        {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id,
          parse_mode: 'Markdown',
          ...mainMenuKeyboard(),
        }
      );
      await bot.answerCallbackQuery(query.id);
    }

    if (query.data === 'balance') {
      try {
        const result = await db.query(
          'SELECT balance FROM users WHERE telegram_id = $1',
          [query.from.id]
        );
        const balance = result.rows[0]?.balance || 0;
        await bot.answerCallbackQuery(query.id, {
          text: `💰 Баланс: ${balance} CR`,
          show_alert: true,
        });
      } catch (error) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Ошибка', show_alert: true });
      }
    }

    if (query.data === 'history') {
      try {
        const result = await db.query(
          `SELECT g.model_name, g.task_type, g.status, g.created_at
           FROM generations g
           JOIN users u ON u.id = g.user_id
           WHERE u.telegram_id = $1
           ORDER BY g.created_at DESC
           LIMIT 5`,
          [query.from.id]
        );

        if (result.rows.length === 0) {
          await bot.answerCallbackQuery(query.id, { text: 'У вас пока нет генераций', show_alert: true });
          return;
        }

        const statusEmoji = { completed: '✅', pending: '⏳', processing: '⚙️', failed: '❌' };
        const lines = result.rows.map((g) => {
          const emoji = statusEmoji[g.status] || '❓';
          const date = new Date(g.created_at).toLocaleDateString('ru-RU');
          return `${emoji} ${g.model_name} (${g.task_type}) — ${date}`;
        });

        await bot.editMessageText(
          `📋 *Последние генерации:*\n\n${lines.join('\n')}`,
          {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'back:main' }]],
            },
          }
        );
        await bot.answerCallbackQuery(query.id);
      } catch (error) {
        console.error('[Bot/History]', error.message);
        await bot.answerCallbackQuery(query.id, { text: '❌ Ошибка', show_alert: true });
      }
    }
  });
}

module.exports = { setupStartHandler };
