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

// =========================================================================
// TRIBUTE (TELEGRAM ЭКВАЙРИНГ) WEBHOOK
// =========================================================================

/**
 * GET /api/webhooks/tribute
 * Проверка доступности вебхука Tribute
 */
router.get('/tribute', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Tribute Webhook Receiver',
    endpoint: '/api/webhooks/tribute',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/webhooks/tribute
 * Приёмник платежей от сервиса Tribute.tg
 * События: shop_order, new_donation, new_subscription, renewed_subscription
 */
router.post('/tribute', async (req, res) => {
  try {
    const rawSignature = req.headers['trbt-signature'];
    const apiKey = process.env.TRIBUTE_API_KEY;

    // Проверка HMAC подписи если TRIBUTE_API_KEY задан в .env
    if (apiKey && rawSignature) {
      const crypto = require('crypto');
      const rawBody = req.rawBody ? req.rawBody : Buffer.from(JSON.stringify(req.body));
      const expectedSignature = crypto.createHmac('sha256', apiKey).update(rawBody).digest('hex');
      if (rawSignature !== expectedSignature) {
        console.warn('[Tribute Webhook] ⚠️ Неверная подпись trbt-signature:', rawSignature);
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const { name: eventName, payload } = req.body || {};
    const data = payload || req.body || {};

    console.log(`[Tribute Webhook] Получено событие "${eventName || 'payment'}":`, JSON.stringify(data).substring(0, 300));

    // Извлекаем идентификатор пользователя (telegram_user_id, customerId, user_id, trb_user_id)
    const rawTgId = data.telegram_user_id || data.customerId || data.userId || data.trb_user_id;
    let telegramId = null;
    if (rawTgId) {
      const match = String(rawTgId).match(/\d+/);
      if (match) telegramId = parseInt(match[0], 10);
    }

    // Извлекаем сумму и валюту
    let rawAmount = Number(data.amount || data.price || 0);
    // В Tribute сумма может передаваться в минорных единицах (копейки/центы: 100000 = 1000)
    if (rawAmount >= 10000 && !data.currency?.toLowerCase().includes('kzt')) {
      rawAmount = rawAmount / 100;
    }
    const currency = (data.currency || 'RUB').toUpperCase();

    // Определяем количество начисляемых единиц CR
    let creditsToAdd = Number(data.credits || data.credits_added || 0);
    if (!creditsToAdd || creditsToAdd <= 0) {
      if (rawAmount >= 9000 || rawAmount === 9990) creditsToAdd = 1250;
      else if (rawAmount >= 3500 || rawAmount === 3990) creditsToAdd = 350;
      else if (rawAmount >= 1200 || rawAmount === 1490) creditsToAdd = 100;
      else if (rawAmount >= 400 || rawAmount === 500) creditsToAdd = 50;
      else {
        // Дефолтный курс пополнения
        creditsToAdd = Math.max(10, Math.round(rawAmount / 3));
      }
    }

    // Если статус промежуточный, ждем финализации
    if (data.status && !['paid', 'completed', 'success'].includes(String(data.status).toLowerCase())) {
      console.log(`[Tribute Webhook] ⏳ Платеж со статусом ${data.status}, ожидание финализации`);
      return res.json({ ok: true, message: `Status ${data.status} received` });
    }

    // Находим пользователя в базе
    let targetUser = null;
    if (telegramId) {
      const userRes = await db.query('SELECT * FROM users WHERE telegram_id = $1 LIMIT 1', [telegramId]);
      if (userRes.rows.length > 0) {
        targetUser = userRes.rows[0];
      }
    }

    if (targetUser) {
      // Начисляем баланс
      const updateRes = await db.query(
        `UPDATE users 
         SET balance = balance + $1, 
             total_spent = total_spent + $2, 
             updated_at = NOW() 
         WHERE id = $3 
         RETURNING balance`,
        [creditsToAdd, Math.round(rawAmount), targetUser.id]
      );
      const newBalance = updateRes.rows[0]?.balance;

      // Логируем платеж
      await db.query(
        `INSERT INTO payments (user_id, amount_rub, credits_added, status, payment_method)
         VALUES ($1, $2, $3, 'completed', $4)`,
        [targetUser.id, Math.round(rawAmount), creditsToAdd, `Tribute (${eventName || 'payment'})`]
      );

      console.log(`[Tribute Webhook] ✅ Успешно начислено +${creditsToAdd} CR пользователю TG ${telegramId} (Новый баланс: ${newBalance} CR)`);

      // Отправляем уведомление в Telegram через бота
      if (telegramService && telegramService.bot) {
        try {
          await telegramService.bot.sendMessage(
            telegramId,
            `🎉 *Оплата через Tribute получена!*\n\n` +
            `Вам начислено: *+${creditsToAdd} CR*\n` +
            `Текущий баланс: *${newBalance} CR*\n\n` +
            `Все нейросети Morph AI готовы к генерации.`,
            { parse_mode: 'Markdown' }
          );
        } catch (botErr) {
          console.warn('[Tribute Webhook] Ошибка отправки TG уведомления:', botErr.message);
        }
      }
    } else {
      console.warn(`[Tribute Webhook] ⚠️ Пользователь с TG ID ${telegramId || rawTgId} не найден в БД. Платеж зафиксирован.`);
    }

    res.json({
      ok: true,
      success: true,
      event: eventName || 'payment',
      credits_added: creditsToAdd,
      user_found: !!targetUser
    });
  } catch (error) {
    console.error('[Tribute Webhook] Ошибка обработки:', error);
    res.status(200).json({ ok: false, error: error.message });
  }
});

module.exports = router;
module.exports.setTelegramService = setTelegramService;
