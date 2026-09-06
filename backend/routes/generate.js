/**
 * Generate API — универсальный роутер генерации.
 *
 * POST /api/generate — принимает тип задачи и маршрутизирует к нужному провайдеру.
 * GET  /api/generate/models — список всех доступных моделей
 * GET  /api/generate/status/:taskId — проверить статус задачи
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { getModel, getModelVersion, getAllModels } = require('../config/models');
const { chargeCredits, refundCredits } = require('../utils/credits');
const { createTask, updateTask, getTask } = require('../utils/taskQueue');
const registry = require('../services/ServiceRegistry');
const {
  ValidationError,
  InsufficientCreditsError,
  NotFoundError,
} = require('../middleware/errorHandler');

/**
 * GET /api/generate/models — список всех доступных моделей с подмоделями
 */
router.get('/models', (req, res) => {
  const { category } = req.query;
  let models = getAllModels();

  if (category) {
    models = models.filter((m) => m.category === category);
  }

  // Убираем faceswap из публичного списка
  models = models.filter((m) => m.category !== 'faceswap');

  res.json({ models });
});

/**
 * POST /api/generate — универсальный эндпоинт генерации
 *
 * Body:
 * {
 *   telegram_id: number,        (обязательно)
 *   model_id: string,           (id модели из реестра, e.g. 'kling-hd')
 *   version_id: string,         (id подмодели, e.g. 'kling-3-0')
 *   prompt: string,             (обязательно)
 *   params: {                   (опционально)
 *     aspect_ratio?: string,
 *     duration?: number,        (только для Seedance: 6|10|15)
 *     camera_motion?: string,
 *     reference_images?: string[],
 *     text_mode?: string
 *   }
 * }
 */
router.post('/', async (req, res, next) => {
  let user = null;
  let chargedCost = 0;
  try {
    const { telegram_id, model_id, version_id, prompt, params = {} } = req.body;

    // 1. Валидация
    if (!telegram_id) throw new ValidationError('telegram_id обязателен');
    if (!model_id) throw new ValidationError('model_id обязателен');
    if (!prompt || !prompt.trim()) throw new ValidationError('prompt обязателен');

    // 2. Найти модель и версию
    const modelData = getModel(model_id);
    if (!modelData) throw new NotFoundError('Model', model_id);

    let slug, cost, versionName;

    if (version_id && modelData.versions.length > 0) {
      const versionInfo = getModelVersion(model_id, version_id);
      if (!versionInfo) throw new NotFoundError('Version', version_id);
      slug = versionInfo.version.slug;
      cost = versionInfo.version.cost;
      versionName = versionInfo.version.name;
    } else if (modelData.versions.length > 0) {
      // Берём первую версию по умолчанию
      slug = modelData.versions[0].slug;
      cost = modelData.versions[0].cost;
      versionName = modelData.versions[0].name;
    } else {
      slug = model_id;
      cost = modelData.cost;
      versionName = modelData.name;
    }

    // 3. Найти пользователя
    const userResult = await db.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegram_id]
    );
    if (userResult.rows.length === 0) {
      throw new NotFoundError('User', telegram_id);
    }
    user = userResult.rows[0];

    // 4. Проверить и списать баланс
    const chargeResult = await chargeCredits(user.id, cost);
    if (!chargeResult.success) {
      throw new InsufficientCreditsError(cost, user.balance);
    }
    chargedCost = cost;

    // 5. Определить длительность видео
    let duration = 6; // дефолт: 6 секунд для всех
    if (modelData.allowDurationChoice && params.duration) {
      // Только Seedance может менять длительность
      if (modelData.durationOptions.includes(params.duration)) {
        duration = params.duration;
      }
    }

    // 6. Формируем параметры для провайдера
    const providerOptions = {
      aspect_ratio: params.aspect_ratio || modelData.aspectRatios?.[0] || '1:1',
      duration,
      camera_motion: params.camera_motion,
      reference_images: params.reference_images || [],
    };

    // Добавляем webhook URL для асинхронных задач
    if (modelData.category !== 'text' && process.env.WEBHOOK_URL) {
      providerOptions.webhook_url = `${process.env.WEBHOOK_URL}/api/webhooks/ai-results`;
    }

    // 7. Отправить в провайдер через ServiceRegistry
    const providerResult = await registry.dispatch(modelData.provider, {
      slug,
      prompt: prompt.trim(),
      options: providerOptions,
    });

    // 8. Создать запись в generations
    const task = await createTask({
      userId: user.id,
      modelName: slug,
      provider: modelData.provider,
      taskType: modelData.category,
      prompt: prompt.trim(),
      params: { ...params, version: versionName, duration },
      creditsCharged: cost,
      externalTaskId: providerResult.taskId || null,
    });

    // 9. Для текстовых моделей — результат приходит сразу
    if (modelData.category === 'text' && providerResult.text) {
      await updateTask(task.task_id, {
        status: 'completed',
        resultText: providerResult.text,
      });

      return res.json({
        success: true,
        task_id: task.task_id,
        status: 'completed',
        result: {
          text: providerResult.text,
          model: versionName,
        },
        balance: chargeResult.newBalance,
      });
    }

    // 10. Для асинхронных — возвращаем task_id для polling
    return res.json({
      success: true,
      task_id: task.task_id,
      status: 'pending',
      model: versionName,
      balance: chargeResult.newBalance,
      message: 'Генерация запущена. Результат будет доставлен по готовности.',
    });
  } catch (error) {
    if (chargedCost > 0 && user?.id) {
      try {
        await refundCredits(user.id, chargedCost);
      } catch (refundErr) {
        console.error('[Generate] Auto-refund failed:', refundErr);
      }
    }
    next(error);
  }
});

/**
 * GET /api/generate/status/:taskId — проверить статус задачи
 */
router.get('/status/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await getTask(taskId);

    if (!task) {
      throw new NotFoundError('Task', taskId);
    }

    // Если задача ещё в процессе — пробуем спросить провайдера
    if (task.status === 'pending' || task.status === 'processing') {
      try {
        const provider = registry.getProvider(task.provider);
        if (provider.checkStatus) {
          const providerStatus = await provider.checkStatus(
            task.task_id
          );

          if (providerStatus.status !== task.status) {
            // Обновляем статус в БД
            const updated = await updateTask(task.task_id, {
              status: providerStatus.status,
              resultUrl: providerStatus.resultUrl || undefined,
            });

            // Если failed — возврат кредитов
            if (providerStatus.status === 'failed' && task.credits_charged > 0) {
              await refundCredits(task.user_id, task.credits_charged);
            }

            return res.json({
              task_id: task.task_id,
              status: providerStatus.status,
              result_url: providerStatus.resultUrl || null,
              result_text: updated?.result_text || null,
            });
          }
        }
      } catch (pollError) {
        // Ошибка polling не должна ломать ответ
        console.error('[Generate] Ошибка polling статуса:', pollError.message);
      }
    }

    res.json({
      task_id: task.task_id,
      status: task.status,
      result_url: task.result_url || null,
      result_text: task.result_text || null,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
