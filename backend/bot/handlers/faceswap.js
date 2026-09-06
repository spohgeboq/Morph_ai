/**
 * Face Swap Handler — пайплайн «Повторить» для Telegram-бота.
 *
 * Flow:
 * 1. Проверяем face_photo_url у пользователя
 * 2. Если нет — просим загрузить селфи
 * 3. Выбор шаблона из Templates
 * 4. Запуск Face Swap через FaceSwapService
 * 5. Результат приходит через webhook
 */
const db = require('../../db');
const { chargeCredits, refundCredits } = require('../../utils/credits');
const { createTask } = require('../../utils/taskQueue');
const { faceSwapTemplatesKeyboard } = require('../keyboards');

// Состояния для Face Swap flow
const faceSwapStates = new Map();

function setupFaceSwapHandler(bot) {
  // /faceswap команда
  bot.onText(/\/faceswap/, async (msg) => {
    await startFaceSwapFlow(bot, msg.chat.id, msg.from.id);
  });

  // Callback: faceswap:start
  bot.on('callback_query', async (query) => {
    if (query.data === 'faceswap:start') {
      await startFaceSwapFlow(bot, query.message.chat.id, query.from.id);
      await bot.answerCallbackQuery(query.id);
      return;
    }

    // Выбор шаблона
    if (query.data.startsWith('fs:template:')) {
      const templateId = parseInt(query.data.split(':')[2]);
      const userId = query.from.id;
      const chatId = query.message.chat.id;

      try {
        // Получаем шаблон
        const templateResult = await db.query(
          'SELECT * FROM templates WHERE id = $1 AND is_active = TRUE',
          [templateId]
        );
        if (templateResult.rows.length === 0) {
          await bot.answerCallbackQuery(query.id, { text: 'Шаблон не найден', show_alert: true });
          return;
        }
        const template = templateResult.rows[0];

        // Получаем пользователя
        const userResult = await db.query(
          'SELECT * FROM users WHERE telegram_id = $1',
          [userId]
        );
        if (userResult.rows.length === 0) {
          await bot.sendMessage(chatId, '❌ Вы не зарегистрированы. /start');
          return;
        }
        const user = userResult.rows[0];

        // Проверяем face_photo_url
        if (!user.face_photo_url) {
          faceSwapStates.set(userId, {
            step: 'awaiting_selfie',
            templateId: template.id,
          });
          await bot.editMessageText(
            '📸 *Для Face Swap нужно ваше селфи!*\n\n' +
            'Отправьте чёткое фото вашего лица (фронтальный ракурс).\n' +
            'Оно будет сохранено для будущих генераций.',
            {
              chat_id: chatId,
              message_id: query.message.message_id,
              parse_mode: 'Markdown',
            }
          );
          await bot.answerCallbackQuery(query.id);
          return;
        }

        // Запускаем Face Swap
        await executeFaceSwap(bot, chatId, user, template);
        await bot.answerCallbackQuery(query.id);
      } catch (error) {
        console.error('[Bot/FaceSwap] Ошибка:', error.message);
        await bot.answerCallbackQuery(query.id, { text: '❌ Ошибка', show_alert: true });
      }
    }
  });

  // Приём фото для Face Swap
  bot.on('photo', async (msg) => {
    const userId = msg.from.id;
    const state = faceSwapStates.get(userId);

    if (!state || state.step !== 'awaiting_selfie') return;

    const chatId = msg.chat.id;

    try {
      // Получаем file_id самого большого фото
      const photo = msg.photo[msg.photo.length - 1];
      const fileInfo = await bot.getFile(photo.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;

      // Сохраняем face_photo_url
      await db.query(
        'UPDATE users SET face_photo_url = $1, updated_at = NOW() WHERE telegram_id = $2',
        [fileUrl, userId]
      );

      await bot.sendMessage(chatId, '✅ Селфи сохранено! Запускаю Face Swap...');

      // Получаем обновлённого пользователя и шаблон
      const userResult = await db.query('SELECT * FROM users WHERE telegram_id = $1', [userId]);
      const user = userResult.rows[0];

      const templateResult = await db.query('SELECT * FROM templates WHERE id = $1', [state.templateId]);
      const template = templateResult.rows[0];

      if (template) {
        await executeFaceSwap(bot, chatId, user, template);
      }

      faceSwapStates.delete(userId);
    } catch (error) {
      console.error('[Bot/FaceSwap] Ошибка приёма фото:', error.message);
      await bot.sendMessage(chatId, '❌ Ошибка сохранения фото. Попробуйте ещё раз.');
      faceSwapStates.delete(userId);
    }
  });
}

/**
 * Начать Face Swap flow.
 */
async function startFaceSwapFlow(bot, chatId, userId) {
  try {
    // Получаем шаблоны Face Swap
    const result = await db.query(
      `SELECT * FROM templates WHERE category = 'faceswap' AND is_active = TRUE ORDER BY sort_order ASC`
    );

    if (result.rows.length === 0) {
      // Если нет шаблонов faceswap, показываем все видео-шаблоны
      const videoResult = await db.query(
        `SELECT * FROM templates WHERE category IN ('video', 'faceswap') AND is_active = TRUE ORDER BY sort_order ASC LIMIT 10`
      );

      if (videoResult.rows.length === 0) {
        await bot.sendMessage(chatId, '📭 Пока нет шаблонов для Face Swap. Скоро появятся!');
        return;
      }

      const kb = faceSwapTemplatesKeyboard(videoResult.rows);
      await bot.sendMessage(
        chatId,
        '🔄 *Face Swap*\n\n' +
        'Выберите видео-шаблон для замены лица:',
        { parse_mode: 'Markdown', ...kb }
      );
      return;
    }

    const kb = faceSwapTemplatesKeyboard(result.rows);
    await bot.sendMessage(
      chatId,
      '🔄 *Face Swap*\n\n' +
      'Выберите шаблон для замены лица.\n' +
      'Бот наложит ваше лицо на эталонное видео.',
      { parse_mode: 'Markdown', ...kb }
    );
  } catch (error) {
    console.error('[Bot/FaceSwap] Ошибка:', error.message);
    await bot.sendMessage(chatId, '❌ Ошибка загрузки шаблонов.');
  }
}

/**
 * Выполнить Face Swap.
 */
async function executeFaceSwap(bot, chatId, user, template) {
  const cost = template.cost || 10;

  // Списываем кредиты
  const charge = await chargeCredits(user.id, cost);
  if (!charge.success) {
    await bot.sendMessage(
      chatId,
      `❌ Недостаточно кредитов!\nТребуется: *${cost} CR*\nВаш баланс: *${user.balance} CR*`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  await bot.sendMessage(
    chatId,
    `⏳ Запускаю Face Swap...\n🎬 Шаблон: *${template.name}*\n💰 Списано ${cost} CR`,
    { parse_mode: 'Markdown' }
  );

  try {
    // Получаем FaceSwap сервис
    const registry = require('../../services/ServiceRegistry');
    const faceSwapService = registry.getProvider('faceswap');

    const result = await faceSwapService.generate({
      targetUrl: template.video_url,
      faceUrl: user.face_photo_url,
      targetType: template.category === 'video' || template.video_url ? 'video' : 'photo',
    });

    // Создаём запись в generations
    await createTask({
      userId: user.id,
      modelName: 'face-swap',
      provider: 'piapi',
      taskType: 'faceswap',
      prompt: `Face Swap: ${template.name}`,
      params: { template_id: template.id },
      creditsCharged: cost,
      externalTaskId: result.taskId,
    });

    await bot.sendMessage(
      chatId,
      `✅ Face Swap запущен!\nID: \`${result.taskId}\`\n\nРезультат будет отправлен автоматически.`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('[Bot/FaceSwap] Ошибка генерации:', error.message);

    // Возврат кредитов
    await refundCredits(user.id, cost);
    await bot.sendMessage(
      chatId,
      `❌ Ошибка Face Swap: ${error.message}\n\n✅ ${cost} CR возвращены на баланс.`
    );
  }
}

module.exports = { setupFaceSwapHandler };
