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

let telegramService = null;
router.setTelegramService = (service) => {
  telegramService = service;
};

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

    // Проверяем актуальную цену из базы данных (установленную админом)
    try {
      const dbModelRes = await db.query('SELECT cost, versions FROM ai_models WHERE id = $1', [model_id]);
      if (dbModelRes.rows.length > 0) {
        const dbModel = dbModelRes.rows[0];
        if (version_id && Array.isArray(dbModel.versions)) {
          const dbVer = dbModel.versions.find(v => v.id === version_id);
          if (dbVer && dbVer.cost !== undefined) {
            cost = parseInt(dbVer.cost);
          }
        } else if (dbModel.cost !== undefined) {
          cost = parseInt(dbModel.cost);
        }
      }
    } catch (dbCostErr) {
      console.warn('[Generate] Не удалось загрузить цену из БД, используется базовая:', dbCostErr.message);
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
      story_length: params.story_length,
      character_name: params.character_name,
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
      modelName: versionName || modelData.name || slug,
      provider: modelData.provider,
      taskType: modelData.category,
      prompt: prompt.trim(),
      params: { ...params, version: versionName, duration, modelTitle: modelData.name },
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
              errorMessage: providerStatus.errorMessage || undefined,
            });

            // Если completed — отправляем медиа и файл в Telegram бота
            if (providerStatus.status === 'completed' && telegramService && !task.telegram_notified) {
              try {
                const userRes = await db.query('SELECT telegram_id FROM users WHERE id = $1', [task.user_id]);
                if (userRes.rows.length > 0 && userRes.rows[0].telegram_id) {
                  const finalTaskData = {
                    ...task,
                    ...updated,
                    result_url: providerStatus.resultUrl || updated?.result_url || task.result_url,
                  };
                  await telegramService.sendResult(userRes.rows[0].telegram_id, finalTaskData);
                  await db.query('UPDATE generations SET telegram_notified = TRUE WHERE task_id = $1', [task.task_id]);
                  console.log(`[Generate] ✓ Результат задачи ${task.task_id} отправлен пользователю ${userRes.rows[0].telegram_id} в Telegram`);
                }
              } catch (notifyErr) {
                console.error('[Generate] Ошибка отправки уведомления в Telegram:', notifyErr.message);
              }
            }

            // Если failed — возврат кредитов
            if (providerStatus.status === 'failed' && task.credits_charged > 0) {
              await refundCredits(task.user_id, task.credits_charged);
            }

            return res.json({
              task_id: task.task_id,
              taskId: task.task_id,
              status: providerStatus.status,
              result_url: providerStatus.resultUrl || null,
              resultUrl: providerStatus.resultUrl || null,
              result_text: updated?.result_text || null,
              resultText: updated?.result_text || null,
              error_message: providerStatus.errorMessage || null,
              errorMessage: providerStatus.errorMessage || null,
            });
          }
        }
      } catch (pollError) {
        // Ошибка polling не должна ломать ответ
        console.error('[Generate] Ошибка polling статуса:', pollError.message);
      }
    }

    // Если задача уже завершена в БД, но еще не была отправлена в Telegram
    if (task.status === 'completed' && telegramService && !task.telegram_notified) {
      try {
        const userRes = await db.query('SELECT telegram_id FROM users WHERE id = $1', [task.user_id]);
        if (userRes.rows.length > 0 && userRes.rows[0].telegram_id) {
          await telegramService.sendResult(userRes.rows[0].telegram_id, task);
          await db.query('UPDATE generations SET telegram_notified = TRUE WHERE task_id = $1', [task.task_id]);
          console.log(`[Generate] ✓ Отложенный результат задачи ${task.task_id} отправлен в Telegram`);
        }
      } catch (notifyErr) {
        console.error('[Generate] Ошибка отправки отложенного уведомления в Telegram:', notifyErr.message);
      }
    }

    res.json({
      task_id: task.task_id,
      taskId: task.task_id,
      status: task.status,
      result_url: task.result_url || null,
      resultUrl: task.result_url || null,
      result_text: task.result_text || null,
      resultText: task.result_text || null,
      error_message: task.error_message || null,
      errorMessage: task.error_message || null,
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// AI ФОТОСТУДИЯ (5 РЕАЛЬНЫХ ФОТО ЧЕРЕЗ PIAPI KONTEXT QUBICO/FLUX1-DEV-ADVANCED)
// =========================================================================

const DEFAULT_PHOTOSHOOT_STYLES = [
  {
    id: 1,
    title: 'Studio High-Fashion',
    tag: 'Vogue',
    desc: 'Премиальный минималистичный портрет, мягкий студийный свет, журнальная эстетика',
    prompt: 'Transform this portrait into a high-fashion Vogue studio editorial portrait of the person, clean minimalist studio background, soft professional key light, 85mm lens, sharp focus, magazine cover quality, ultra-detailed 8k, photorealistic'
  },
  {
    id: 2,
    title: 'Parisian Café & Street',
    tag: 'Лайфстайл',
    desc: 'Атмосферный живой кадр за столиком кофейни, утренний кофе и естественный свет',
    prompt: 'Transform this portrait into an atmospheric candid street style portrait of the person sitting at an outdoor Parisian sidewalk café, morning golden sunlight, stylish trench coat, authentic luxury lifestyle photography, 8k'
  },
  {
    id: 3,
    title: 'Old Money & Quiet Luxury',
    tag: 'Эстетика',
    desc: 'Кашемировый образ, мраморная колоннада, винтажная текстура 35мм пленки',
    prompt: 'Transform this portrait into an old money aesthetic photoshoot of the person, wearing luxury knit beige cashmere, neoclassical European villa architecture background, warm daylight, subtle 35mm film grain, elegant quiet luxury, 8k'
  },
  {
    id: 4,
    title: 'Rooftop Golden Hour',
    tag: 'Закат',
    desc: 'Теплые лучи заходящего солнца на террасе с панорамой города',
    prompt: 'Transform this portrait into a breathtaking sunset golden hour portrait of the person on a modern penthouse rooftop terrace, warm glowing sunset rays illuminating the face, cinematic city skyline bokeh, 8k'
  },
  {
    id: 5,
    title: 'Vogue B&W 35mm',
    tag: 'Монохром',
    desc: 'Глубокий черно-белый студийный портрет крупным планом с художественными тенями',
    prompt: 'Transform this portrait into a dramatic black and white high-contrast editorial magazine portrait of the person, intense expressive gaze, artistic chiaroscuro studio lighting, Leica 35mm film photography aesthetic, master portrait 8k'
  }
];

/**
 * POST /api/generate/photoshoot — Создать 5 реальных фотосессий из селфи
 */
router.post('/photoshoot', async (req, res, next) => {
  let user = null;
  let chargedCost = 0;
  try {
    const { telegram_id, user_id, image_url } = req.body;

    if (!image_url) {
      throw new ValidationError('image_url (селфи) обязателен');
    }

    // 1. Найти пользователя
    let userRes;
    if (telegram_id) {
      userRes = await db.query('SELECT * FROM users WHERE telegram_id = $1', [telegram_id]);
    } else if (user_id) {
      userRes = await db.query('SELECT * FROM users WHERE id = $1', [user_id]);
    }

    if (userRes && userRes.rows.length > 0) {
      user = userRes.rows[0];
    }

    // 2. Получить стоимость фотосессии из настроек админки
    let cost = 10;
    try {
      const setRes = await db.query("SELECT value FROM admin_settings WHERE key = 'photoshoot'");
      if (setRes.rows.length > 0) {
        const val = typeof setRes.rows[0].value === 'string' ? JSON.parse(setRes.rows[0].value) : setRes.rows[0].value;
        if (val && val.cost !== undefined) cost = parseInt(val.cost, 10);
      }
    } catch (e) {}

    // 3. Списать кредиты если есть пользователь
    let newBalance = 50;
    if (user) {
      const chargeResult = await chargeCredits(user.id, cost);
      if (!chargeResult.success) {
        throw new InsufficientCreditsError(cost, user.balance);
      }
      chargedCost = cost;
      newBalance = chargeResult.newBalance;
    }

    // 4. Генерируем уникальный batch_id
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const piapiService = registry.getProvider('piapi');

    // 5. Запускаем 5 задач через PiAPI Kontext
    const createdTasks = [];
    for (const style of DEFAULT_PHOTOSHOOT_STYLES) {
      try {
        const piResult = await piapiService.generateKontext({
          prompt: style.prompt,
          imageUrl: image_url,
          width: 1024,
          height: 1024
        });

        const taskRecord = await createTask({
          userId: user ? user.id : 1,
          modelName: 'Flux 1.1 Pro (Studio)',
          provider: 'piapi',
          taskType: 'photoshoot',
          prompt: style.prompt,
          params: {
            batch_id: batchId,
            style_id: style.id,
            style_title: style.title,
            style_tag: style.tag,
            style_desc: style.desc,
            selfie_url: image_url
          },
          creditsCharged: Math.floor(cost / 5),
          externalTaskId: piResult.taskId || null
        });

        createdTasks.push({
          id: style.id,
          title: style.title,
          tag: style.tag,
          desc: style.desc,
          task_id: taskRecord.task_id,
          status: 'pending'
        });
      } catch (genErr) {
        console.error(`[Photoshoot] Ошибка запуска стиля ${style.title}:`, genErr.message);
        createdTasks.push({
          id: style.id,
          title: style.title,
          tag: style.tag,
          desc: style.desc,
          status: 'failed',
          error: genErr.message
        });
      }
    }

    res.json({
      success: true,
      batch_id: batchId,
      cost,
      balance: newBalance,
      total: DEFAULT_PHOTOSHOOT_STYLES.length,
      tasks: createdTasks,
      message: 'Фотостудия запущена. Создается 5 уникальных 4K портретов.'
    });
  } catch (error) {
    if (chargedCost > 0 && user?.id) {
      try {
        await refundCredits(user.id, chargedCost);
      } catch (refErr) {
        console.error('[Photoshoot] Refund failed:', refErr);
      }
    }
    next(error);
  }
});

/**
 * GET /api/generate/photoshoot/status/:batchId — Проверить статус 5 фото фотостудии
 */
router.get('/photoshoot/status/:batchId', async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const result = await db.query(
      `SELECT * FROM generations 
       WHERE params->>'batch_id' = $1 
       ORDER BY (params->>'style_id')::int ASC`,
      [batchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Пакет фотосессии не найден' });
    }

    const piapiService = registry.getProvider('piapi');
    let completedCount = 0;
    const photos = [];

    for (const task of result.rows) {
      let currentStatus = task.status;
      let resultUrl = task.result_url;

      if ((currentStatus === 'pending' || currentStatus === 'processing') && piapiService) {
        try {
          const check = await piapiService.checkStatus(task.task_id);
          if (check.status && check.status !== currentStatus) {
            currentStatus = check.status;
            resultUrl = check.resultUrl || resultUrl;

            await updateTask(task.task_id, {
              status: currentStatus,
              resultUrl: resultUrl || undefined
            });
          }
        } catch (pollErr) {
          console.warn(`[Photoshoot Poll] Ошибка опроса задачи ${task.task_id}:`, pollErr.message);
        }
      }

      if (currentStatus === 'completed') {
        completedCount++;
      }

      photos.push({
        id: task.params?.style_id,
        title: task.params?.style_title || 'Editorial',
        tag: task.params?.style_tag || '4K',
        desc: task.params?.style_desc || '',
        status: currentStatus,
        result_url: resultUrl || null,
        img: resultUrl || null
      });
    }

    const isComplete = completedCount === result.rows.length || photos.every(p => p.status === 'completed' || p.status === 'failed');

    res.json({
      success: true,
      batch_id: batchId,
      is_complete: isComplete,
      completed_count: completedCount,
      total_count: result.rows.length,
      photos
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// ФУНКЦИЯ «ПОВТОРИТЬ» (REMIX) С ПРИВЯЗКОЙ МОДЕЛИ И ГЛАВНОГО ГЕРОЯ (ГГ)
// =========================================================================

/**
 * POST /api/generate/remix — Выполнить «Повторить» по шаблону:
 * - Использует именно ту модель, которая написана на карточке (Kling, Flux, Seedance и т.д.)
 * - Заменяет строго лицо Главного Героя (ГГ), заданное админом, на селфи юзера
 */
router.post('/remix', async (req, res, next) => {
  let user = null;
  let chargedCost = 0;
  try {
    const { template_id, face_url, telegram_id, user_id, mode = 'face' } = req.body;

    if (!template_id) throw new ValidationError('template_id обязателен');
    if (mode === 'face' && !face_url) throw new ValidationError('face_url (селфи) обязателен');

    // 1. Найти шаблон
    const cleanId = String(template_id).replace(/^tmpl_/, '');
    const tResult = await db.query('SELECT * FROM templates WHERE id = $1', [cleanId]);
    if (tResult.rows.length === 0) {
      throw new NotFoundError('Template', template_id);
    }
    const template = tResult.rows[0];

    // 2. Найти пользователя
    let userRes;
    if (telegram_id) {
      userRes = await db.query('SELECT * FROM users WHERE telegram_id = $1', [telegram_id]);
    } else if (user_id) {
      userRes = await db.query('SELECT * FROM users WHERE id = $1', [user_id]);
    }
    if (userRes && userRes.rows.length > 0) {
      user = userRes.rows[0];
    }

    // 3. Списать кредиты
    const cost = template.cost || 10;
    let newBalance = 50;
    if (user) {
      const chargeResult = await chargeCredits(user.id, cost);
      if (!chargeResult.success) {
        throw new InsufficientCreditsError(cost, user.balance);
      }
      chargedCost = cost;
      newBalance = chargeResult.newBalance;
    }

    // 4. Модель и лицо Главного Героя (ГГ)
    const modelName = template.model_name || 'Flux 1.1 Pro';
    const targetHeroFace = template.target_face_url || template.default_params?.targetFaceUrl || null;
    const isVideo = template.video_url && /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(template.video_url.trim());
    const mediaToUse = isVideo ? template.video_url : (template.thumb_url || template.video_url);

    let providerResult;
    let taskProvider = 'piapi';
    let taskType = isVideo ? 'video_remix' : 'photo_remix';

    // 5. Роутинг генерации:
    if (isVideo) {
      // Видео-шаблон (Kling, Hailuo, Seedance, Runway): Face Swap с подменой ГГ
      const faceSwapService = registry.getProvider('faceswap');
      providerResult = await faceSwapService.generate({
        targetUrl: mediaToUse,
        faceUrl: face_url,
        targetFaceUrl: targetHeroFace,
        targetType: 'video'
      });
      taskProvider = 'faceswap';
    } else {
      // Фото-шаблон (Flux, GPT Image, Nano Banana, Seedream)
      // Если у нас есть промпт и селфи — используем Kontext (Flux 1.1 Pro)
      const piapiService = registry.getProvider('piapi');
      if (template.prompt && template.prompt.trim()) {
        const remixPrompt = `${template.prompt.trim()}, high quality, preserve facial features of the uploaded face`;
        providerResult = await piapiService.generateKontext({
          prompt: remixPrompt,
          imageUrl: face_url,
          width: 1024,
          height: 1024
        });
        taskProvider = 'piapi';
      } else {
        // Если промпта нет — точный FaceSwap на фото шаблона
        const faceSwapService = registry.getProvider('faceswap');
        providerResult = await faceSwapService.generate({
          targetUrl: mediaToUse,
          faceUrl: face_url,
          targetFaceUrl: targetHeroFace,
          targetType: 'photo'
        });
        taskProvider = 'faceswap';
      }
    }

    // 6. Сохраняем задачу в generations под именем модели из шаблона
    const task = await createTask({
      userId: user ? user.id : 1,
      modelName: modelName,
      provider: taskProvider,
      taskType: taskType,
      prompt: template.prompt || `Remix (${modelName})`,
      params: {
        template_id: template.id,
        template_name: template.name,
        target_hero_face: targetHeroFace,
        face_url: face_url,
        media_url: mediaToUse,
        model_name: modelName
      },
      creditsCharged: cost,
      externalTaskId: providerResult.taskId || null
    });

    res.json({
      success: true,
      task_id: task.task_id,
      status: 'pending',
      model: modelName,
      cost,
      balance: newBalance,
      message: `Генерация запущена через ${modelName}!`
    });
  } catch (error) {
    if (chargedCost > 0 && user?.id) {
      try {
        await refundCredits(user.id, chargedCost);
      } catch (refErr) {
        console.error('[Remix] Refund failed:', refErr);
      }
    }
    next(error);
  }
});

/**
 * GET /api/generate/remix/status/:taskId — Проверить статус Remix
 */
router.get('/remix/status/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await getTask(taskId);
    if (!task) {
      throw new NotFoundError('Task', taskId);
    }

    if (task.status === 'pending' || task.status === 'processing') {
      try {
        const provider = registry.getProvider(task.provider);
        if (provider && provider.checkStatus) {
          const pStatus = await provider.checkStatus(task.task_id);
          if (pStatus.status && pStatus.status !== task.status) {
            await updateTask(task.task_id, {
              status: pStatus.status,
              resultUrl: pStatus.resultUrl || undefined,
              errorMessage: pStatus.errorMessage || undefined
            });
            task.status = pStatus.status;
            task.result_url = pStatus.resultUrl || task.result_url;
          }
        }
      } catch (pollErr) {
        console.warn(`[Remix Poll] Ошибка проверки ${taskId}:`, pollErr.message);
      }
    }

    res.json({
      success: true,
      task_id: task.task_id,
      status: task.status,
      result_url: task.result_url || null,
      model: task.model_name,
      error_message: task.error_message || null
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
