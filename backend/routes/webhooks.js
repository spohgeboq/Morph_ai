/**
 * Webhooks API — приёмник вебхуков от AI-провайдеров.
 *
 * POST /api/webhooks/ai-results — PiAPI / Runway отправляют сюда результаты
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { updateTask, getTask } = require('../utils/taskQueue');
const { refundCredits } = require('../utils/credits');

// TelegramService будет инжектироваться при инициализации
let telegramService = null;

/**
 * Установить TelegramService для отправки результатов.
 * Вызывается из server.js после инициализации бота.
 */
function setTelegramService(service) {
  telegramService = service;
}

/**
 * POST /api/webhooks/ai-results
 *
 * Ожидаемый формат от провайдеров:
 * {
 *   task_id: string,
 *   status: 'completed' | 'failed' | 'success' | 'error',
 *   output: {
 *     url?: string,
 *     image_url?: string,
 *     video_url?: string,
 *     error?: string
 *   }
 * }
 */
router.post('/ai-results', async (req, res) => {
  try {
    const body = req.body;
    console.log('[Webhook] Получен вебхук:', JSON.stringify(body).substring(0, 500));

    // Извлекаем task_id из разных форматов
    const taskId = body.task_id || body.data?.task_id || body.id;
    if (!taskId) {
      console.warn('[Webhook] Нет task_id в вебхуке');
      return res.status(400).json({ error: 'task_id обязателен' });
    }

    // Находим задачу в БД
    const task = await getTask(taskId);
    if (!task) {
      console.warn(`[Webhook] Задача ${taskId} не найдена в БД`);
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    // Определяем статус
    const rawStatus = body.status || body.data?.status || 'unknown';
    const isCompleted = ['completed', 'success', 'succeeded'].includes(rawStatus.toLowerCase());
    const isFailed = ['failed', 'error'].includes(rawStatus.toLowerCase());

    // Извлекаем URL результата
    const output = body.output || body.data?.output || body.data || {};
    const resultUrl = output.url || output.image_url || output.video_url ||
                      output.audio_url || body.output_url || null;

    if (isCompleted && resultUrl) {
      // ✅ Задача выполнена
      await updateTask(taskId, {
        status: 'completed',
        resultUrl,
      });

      // Отправить результат в Telegram
      if (telegramService && !task.telegram_notified) {
        const user = await db.query('SELECT telegram_id FROM users WHERE id = $1', [task.user_id]);
        if (user.rows.length > 0 && user.rows[0].telegram_id) {
          const updatedTask = await getTask(taskId);
          await telegramService.sendResult(user.rows[0].telegram_id, updatedTask);
          await db.query('UPDATE generations SET telegram_notified = TRUE WHERE task_id = $1', [taskId]);
        }
      }

      console.log(`[Webhook] ✅ Задача ${taskId} завершена: ${resultUrl}`);
    } else if (isFailed) {
      // ❌ Задача провалилась
      const errorMessage = output.error || body.error || 'Неизвестная ошибка провайдера';

      await updateTask(taskId, {
        status: 'failed',
        errorMessage,
      });

      // Возврат кредитов
      if (task.credits_charged > 0) {
        await refundCredits(task.user_id, task.credits_charged);
        console.log(`[Webhook] 💰 Возвращено ${task.credits_charged} CR пользователю ${task.user_id}`);
      }

      // Уведомить пользователя об ошибке
      if (telegramService) {
        const user = await db.query('SELECT telegram_id FROM users WHERE id = $1', [task.user_id]);
        if (user.rows.length > 0) {
          await telegramService.sendError(
            user.rows[0].telegram_id,
            errorMessage,
            task.credits_charged
          );
        }
      }

      console.log(`[Webhook] ❌ Задача ${taskId} провалилась: ${errorMessage}`);
    } else {
      // ⏳ Промежуточный статус (processing)
      await updateTask(taskId, { status: 'processing' });
      console.log(`[Webhook] ⏳ Задача ${taskId} в процессе`);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('[Webhook] Ошибка обработки:', error.message);
    // Вебхук должен вернуть 200, чтобы провайдер не ретраил
    res.json({ ok: true, error: error.message });
  }
});

module.exports = router;
module.exports.setTelegramService = setTelegramService;
