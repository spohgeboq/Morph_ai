/**
 * Обработчик генерации через Telegram-бота.
 *
 * Flow:
 * 1. Выбор категории → 2. Выбор модели → 3. Выбор версии →
 * 4. Выбор пропорций → 5. (Seedance: длительность) → 6. Ввод промпта → 7. Генерация
 */
const db = require('../../db');
const { getModel, getModelVersion } = require('../../config/models');
const { chargeCredits, refundCredits } = require('../../utils/credits');
const { createTask, updateTask } = require('../../utils/taskQueue');
const {
  modelsKeyboard,
  versionsKeyboard,
  aspectRatioKeyboard,
  durationKeyboard,
} = require('../keyboards');

// Хранилище состояний пользователей (in-memory для простоты)
const userStates = new Map();

function setupGenerateHandler(bot, registry) {
  // /generate команда
  bot.onText(/\/generate/, async (msg) => {
    await bot.sendMessage(
      msg.chat.id,
      '🎨 *Выберите категорию генерации:*',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📸 Фото', callback_data: 'cat:photo' },
              { text: '🎬 Видео', callback_data: 'cat:video' },
            ],
            [
              { text: '✍️ Текст', callback_data: 'cat:text' },
            ],
          ],
        },
      }
    );
  });

  bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const userId = query.from.id;

    try {
      // 1. Выбор категории → показать список моделей
      if (data.startsWith('cat:')) {
        const category = data.split(':')[1];
        const kb = modelsKeyboard(category);

        const titles = { photo: '📸 Фото-модели', video: '🎬 Видео-модели', text: '✍️ Текст-модели' };
        await bot.editMessageText(
          `*${titles[category] || 'Модели'}*\n\nВыберите нейросеть:`,
          { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', ...kb }
        );
        await bot.answerCallbackQuery(query.id);
        return;
      }

      // 2. Выбор модели → показать подмодели
      if (data.startsWith('model:')) {
        const modelId = data.split(':')[1];
        const model = getModel(modelId);
        if (!model) {
          await bot.answerCallbackQuery(query.id, { text: 'Модель не найдена', show_alert: true });
          return;
        }

        const kb = versionsKeyboard(modelId);
        if (kb) {
          await bot.editMessageText(
            `*${model.name}*\n\nВыберите версию:`,
            { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', ...kb }
          );
        } else {
          // Нет подмоделей — переходим к пропорциям/промпту
          userStates.set(userId, { modelId, versionId: null, step: 'prompt' });
          await bot.editMessageText(
            `*${model.name}* выбрана!\n\n✏️ Отправьте промпт (описание того, что хотите сгенерировать):`,
            { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown' }
          );
        }
        await bot.answerCallbackQuery(query.id);
        return;
      }

      // 3. Выбор версии → показать пропорции (или промпт для текста)
      if (data.startsWith('ver:')) {
        const [, modelId, versionId] = data.split(':');
        const model = getModel(modelId);
        const versionInfo = getModelVersion(modelId, versionId);

        if (!model || !versionInfo) {
          await bot.answerCallbackQuery(query.id, { text: 'Версия не найдена', show_alert: true });
          return;
        }

        // Для текстовых моделей — сразу промпт
        if (model.category === 'text') {
          userStates.set(userId, {
            modelId,
            versionId,
            step: 'prompt',
          });
          await bot.editMessageText(
            `*${versionInfo.version.name}* (${versionInfo.version.cost} CR)\n\n✏️ Отправьте ваш запрос:`,
            { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown' }
          );
          await bot.answerCallbackQuery(query.id);
          return;
        }

        // Для фото/видео — выбор пропорций
        const kb = aspectRatioKeyboard(modelId, versionId);
        if (kb) {
          await bot.editMessageText(
            `*${versionInfo.version.name}* (${versionInfo.version.cost} CR)\n\n📐 Выберите пропорции:`,
            { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', ...kb }
          );
        }
        await bot.answerCallbackQuery(query.id);
        return;
      }

      // 4. Выбор пропорций → (Seedance: длительность) или промпт
      if (data.startsWith('ratio:')) {
        const parts = data.split(':');

        // Обработка кнопки "Назад"
        if (parts[1] === 'back') {
          const modelId = parts[2];
          const versionId = parts[3];
          const kb = aspectRatioKeyboard(modelId, versionId);
          const model = getModel(modelId);
          await bot.editMessageText(
            `*${model?.name}*\n\n📐 Выберите пропорции:`,
            { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', ...kb }
          );
          await bot.answerCallbackQuery(query.id);
          return;
        }

        const [, modelId, versionId, ratio] = parts;
        const model = getModel(modelId);

        // Seedance — дополнительный шаг выбора длительности
        if (model?.allowDurationChoice) {
          const kb = durationKeyboard(modelId, versionId, ratio);
          await bot.editMessageText(
            `⏱ *Выберите длительность видео:*`,
            { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', ...kb }
          );
          await bot.answerCallbackQuery(query.id);
          return;
        }

        // Для остальных — сразу промпт
        userStates.set(userId, {
          modelId,
          versionId,
          aspectRatio: ratio,
          duration: model?.defaultDuration || 6,
          step: 'prompt',
        });

        await bot.editMessageText(
          `📐 ${ratio} выбрано!\n\n✏️ Отправьте промпт (описание):`,
          { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown' }
        );
        await bot.answerCallbackQuery(query.id);
        return;
      }

      // 5. Выбор длительности (только Seedance) → промпт
      if (data.startsWith('dur:')) {
        const [, modelId, versionId, ratio, duration] = data.split(':');

        userStates.set(userId, {
          modelId,
          versionId,
          aspectRatio: ratio,
          duration: parseInt(duration),
          step: 'prompt',
        });

        await bot.editMessageText(
          `⏱ ${duration} сек выбрано!\n\n✏️ Отправьте описание видео:`,
          { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown' }
        );
        await bot.answerCallbackQuery(query.id);
        return;
      }
    } catch (error) {
      console.error('[Bot/Generate] Callback error:', error.message);
      await bot.answerCallbackQuery(query.id, { text: '❌ Ошибка', show_alert: true });
    }
  });

  // 6. Приём промпта → запуск генерации
  bot.on('message', async (msg) => {
    // Игнорируем команды и callback
    if (!msg.text || msg.text.startsWith('/')) return;

    const userId = msg.from.id;
    const state = userStates.get(userId);

    if (!state || state.step !== 'prompt') return;

    const chatId = msg.chat.id;
    const prompt = msg.text.trim();

    try {
      // Получаем модель и версию
      const model = getModel(state.modelId);
      if (!model) {
        await bot.sendMessage(chatId, '❌ Модель не найдена. Начните заново: /generate');
        userStates.delete(userId);
        return;
      }

      let slug, cost, versionName;
      if (state.versionId) {
        const vi = getModelVersion(state.modelId, state.versionId);
        slug = vi.version.slug;
        cost = vi.version.cost;
        versionName = vi.version.name;
      } else {
        slug = model.versions[0]?.slug || model.id;
        cost = model.versions[0]?.cost || model.cost;
        versionName = model.versions[0]?.name || model.name;
      }

      // Находим пользователя в БД
      const userResult = await db.query(
        'SELECT * FROM users WHERE telegram_id = $1',
        [userId]
      );
      if (userResult.rows.length === 0) {
        await bot.sendMessage(chatId, '❌ Вы не зарегистрированы. Нажмите /start');
        userStates.delete(userId);
        return;
      }
      const dbUser = userResult.rows[0];

      // Проверяем и списываем баланс
      const charge = await chargeCredits(dbUser.id, cost);
      if (!charge.success) {
        await bot.sendMessage(
          chatId,
          `❌ Недостаточно кредитов!\n\nТребуется: *${cost} CR*\nВаш баланс: *${dbUser.balance} CR*`,
          { parse_mode: 'Markdown' }
        );
        userStates.delete(userId);
        return;
      }

      // Отправляем "генерирую..."
      const typeNames = { text: 'текст', photo: 'фото', video: 'видео' };
      await bot.sendMessage(
        chatId,
        `⏳ Генерирую ${typeNames[model.category] || 'контент'} с *${versionName}*...\n💰 Списано ${cost} CR (осталось ${charge.newBalance} CR)`,
        { parse_mode: 'Markdown' }
      );

      // Параметры для провайдера
      const providerOptions = {
        aspect_ratio: state.aspectRatio || model.aspectRatios?.[0] || '1:1',
        duration: state.duration || model.defaultDuration || 6,
      };

      if (process.env.WEBHOOK_URL) {
        providerOptions.webhook_url = `${process.env.WEBHOOK_URL}/api/webhooks/ai-results`;
      }

      // Dispatch через ServiceRegistry
      const providerResult = await registry.dispatch(model.provider, {
        slug,
        prompt,
        options: providerOptions,
      });

      // Создаём запись в БД
      const task = await createTask({
        userId: dbUser.id,
        modelName: slug,
        provider: model.provider,
        taskType: model.category,
        prompt,
        params: { version: versionName, ...providerOptions },
        creditsCharged: cost,
        externalTaskId: providerResult.taskId || null,
      });

      // Для текста — сразу отправляем результат
      if (model.category === 'text' && providerResult.text) {
        await updateTask(task.task_id, {
          status: 'completed',
          resultText: providerResult.text,
        });

        await bot.sendMessage(
          chatId,
          `✨ *${versionName}:*\n\n${providerResult.text}`,
          { parse_mode: 'Markdown' }
        );
      } else {
        // Асинхронные — результат придёт через webhook
        await bot.sendMessage(
          chatId,
          `✅ Задача принята! ID: \`${task.task_id}\`\n\nРезультат будет отправлен автоматически.`,
          { parse_mode: 'Markdown' }
        );
      }

      // Очищаем состояние
      userStates.delete(userId);
    } catch (error) {
      console.error('[Bot/Generate] Ошибка:', error.message);

      // Пытаемся вернуть кредиты
      try {
        const userResult = await db.query(
          'SELECT id FROM users WHERE telegram_id = $1',
          [userId]
        );
        if (userResult.rows.length > 0 && state.versionId) {
          const vi = getModelVersion(state.modelId, state.versionId);
          if (vi) {
            await refundCredits(userResult.rows[0].id, vi.version.cost);
          }
        }
      } catch (refundError) {
        console.error('[Bot/Generate] Ошибка возврата кредитов:', refundError.message);
      }

      await bot.sendMessage(
        chatId,
        `❌ Ошибка генерации: ${error.message}\n\nКредиты возвращены на баланс.`
      );
      userStates.delete(userId);
    }
  });
}

module.exports = { setupGenerateHandler };
