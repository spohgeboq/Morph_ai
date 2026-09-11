/**
 * MorphAI Admin Hub API — Полное управление проектом
 * 
 * Модули:
 * 1. Auth: /api/admin/auth/login
 * 2. Stats: /api/admin/stats
 * 3. Tariffs: /api/admin/tariffs (GET, POST, PUT, DELETE)
 * 4. Promocodes: /api/admin/promocodes (GET, POST, DELETE)
 * 5. Users CRM: /api/admin/users (GET, GET :id, POST :id/adjust-balance, POST :id/toggle-ban)
 * 6. Content/Feed: /api/admin/feed (GET, POST, PUT, DELETE, POST reorder)
 * 7. System Settings: /api/admin/settings (GET, PUT)
 * 8. Broadcast: /api/admin/broadcast (POST)
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { adminAuthMiddleware, generateAdminToken } = require('../middleware/adminAuth');
const ServiceRegistry = require('../services/ServiceRegistry');
const multer = require('multer');
const storage = require('../services/storage.service');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

let telegramBotInstance = null;
router.setBot = (bot) => {
  telegramBotInstance = bot;
};

// =========================================================================
// 1. АВТОРИЗАЦИЯ В АДМИНКЕ
// =========================================================================
router.post('/auth/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: true, message: 'Введите пароль администратора' });
  }

  const token = generateAdminToken(password);
  if (!token) {
    return res.status(401).json({ error: true, message: 'Неверный пароль администратора' });
  }

  res.json({
    success: true,
    token,
    admin: {
      role: 'superadmin',
      name: 'Morphi Owner',
    },
  });
});

// Все последующие эндпоинты защищены adminAuthMiddleware
router.use(adminAuthMiddleware);

// =========================================================================
// 2. ДАШБОРД И СВОДНАЯ СТАТИСТИКА
// =========================================================================
router.get('/stats', async (req, res, next) => {
  try {
    // 1. Выручка (всего, сегодня, 7 дней, 30 дней)
    const revenueQuery = `
      SELECT 
        COALESCE(SUM(amount_rub), 0) AS total_revenue,
        COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE THEN amount_rub ELSE 0 END), 0) AS revenue_today,
        COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN amount_rub ELSE 0 END), 0) AS revenue_7d,
        COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN amount_rub ELSE 0 END), 0) AS revenue_30d,
        COUNT(id) AS total_orders
      FROM payments
      WHERE status = 'completed'
    `;
    const revenueRes = await db.query(revenueQuery);
    const revenue = revenueRes.rows[0];

    // 2. Пользователи
    const usersQuery = `
      SELECT 
        COUNT(id) AS total_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) AS new_today,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) AS new_7d,
        COUNT(CASE WHEN is_banned = TRUE THEN 1 END) AS banned_count,
        COALESCE(SUM(balance), 0) AS total_credits_in_circulation
      FROM users
    `;
    const usersRes = await db.query(usersQuery);
    const userStats = usersRes.rows[0];

    // 3. Генерации
    const gensQuery = `
      SELECT 
        COUNT(id) AS total_generations,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_generations,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) AS failed_generations,
        COUNT(CASE WHEN task_type = 'photo' THEN 1 END) AS photo_count,
        COUNT(CASE WHEN task_type = 'video' THEN 1 END) AS video_count,
        COUNT(CASE WHEN task_type = 'text' THEN 1 END) AS text_count,
        COUNT(CASE WHEN task_type = 'faceswap' THEN 1 END) AS faceswap_count,
        COALESCE(SUM(credits_charged), 0) AS total_credits_spent
      FROM generations
    `;
    const gensRes = await db.query(gensQuery);
    const genStats = gensRes.rows[0];

    // 4. Топ-5 популярных моделей
    const topModelsRes = await db.query(`
      SELECT model_name, COUNT(id) AS count, task_type
      FROM generations
      GROUP BY model_name, task_type
      ORDER BY count DESC
      LIMIT 5
    `);

    // 5. График динамики за последние 14 дней (генерации и платежи)
    const chartRes = await db.query(`
      SELECT 
        d.day::date AS date,
        COALESCE(p.revenue, 0) AS revenue,
        COALESCE(g.gens_count, 0) AS generations,
        COALESCE(u.new_users, 0) AS new_users
      FROM generate_series(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, '1 day'::interval) d(day)
      LEFT JOIN (
        SELECT created_at::date AS day, SUM(amount_rub) AS revenue
        FROM payments WHERE status = 'completed'
        GROUP BY created_at::date
      ) p ON p.day = d.day::date
      LEFT JOIN (
        SELECT created_at::date AS day, COUNT(id) AS gens_count
        FROM generations
        GROUP BY created_at::date
      ) g ON g.day = d.day::date
      LEFT JOIN (
        SELECT created_at::date AS day, COUNT(id) AS new_users
        FROM users
        GROUP BY created_at::date
      ) u ON u.day = d.day::date
      ORDER BY d.day ASC
    `);

    // 6. Мониторинг провайдеров (System Health)
    const providers = ServiceRegistry.listProviders();
    const systemHealth = {
      database: 'connected',
      bot: telegramBotInstance ? 'active' : 'inactive',
      openrouter: providers.includes('openrouter') ? 'operational' : 'offline',
      piapi: providers.includes('piapi') ? 'operational' : 'offline',
      runway: providers.includes('runway') ? 'operational' : 'offline',
      faceswap: providers.includes('faceswap') ? 'operational' : 'offline',
    };

    res.json({
      revenue,
      users: userStats,
      generations: genStats,
      topModels: topModelsRes.rows,
      chartData: chartRes.rows,
      systemHealth,
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 3. ТАРИФЫ И ПАКЕТЫ КРЕДИТОВ
// =========================================================================
router.get('/tariffs', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM credit_packages ORDER BY sort_order ASC, id ASC');
    res.json({ tariffs: result.rows });
  } catch (error) {
    next(error);
  }
});

router.post('/tariffs', async (req, res, next) => {
  try {
    const { name, credits, price_rub, badge, sort_order, is_active } = req.body;
    if (!name || !credits || !price_rub) {
      return res.status(400).json({ error: true, message: 'Название, кредиты и цена обязательны' });
    }

    const result = await db.query(
      `INSERT INTO credit_packages (name, credits, price_rub, badge, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, credits, price_rub, badge || null, sort_order || 0, is_active !== false]
    );
    res.status(201).json({ tariff: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.put('/tariffs/:id', async (req, res, next) => {
  try {
    const { name, credits, price_rub, badge, sort_order, is_active } = req.body;
    const result = await db.query(
      `UPDATE credit_packages
       SET name = COALESCE($1, name),
           credits = COALESCE($2, credits),
           price_rub = COALESCE($3, price_rub),
           badge = $4,
           sort_order = COALESCE($5, sort_order),
           is_active = COALESCE($6, is_active)
       WHERE id = $7
       RETURNING *`,
      [name, credits, price_rub, badge, sort_order, is_active, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Тариф не найден' });
    }
    res.json({ tariff: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.delete('/tariffs/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM credit_packages WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Тариф удалён' });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 4. ПРОМОКОДЫ
// =========================================================================
router.get('/promocodes', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT p.*, COUNT(pa.id) AS actual_activations
      FROM promocodes p
      LEFT JOIN promocode_activations pa ON pa.promocode_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json({ promocodes: result.rows });
  } catch (error) {
    next(error);
  }
});

router.post('/promocodes', async (req, res, next) => {
  try {
    const { code, type, reward_credits, discount_percent, max_uses, expires_at } = req.body;
    if (!code || !type) {
      return res.status(400).json({ error: true, message: 'Код и тип промокода обязательны' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const result = await db.query(
      `INSERT INTO promocodes (code, type, reward_credits, discount_percent, max_uses, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        cleanCode,
        type, // 'credits' | 'discount_percent'
        reward_credits || 0,
        discount_percent || 0,
        max_uses || 100,
        expires_at || null,
      ]
    );
    res.status(201).json({ promocode: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: true, message: 'Промокод с таким названием уже существует' });
    }
    next(error);
  }
});

router.delete('/promocodes/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM promocodes WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Промокод удален' });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 5. CRM ПОЛЬЗОВАТЕЛЕЙ
// =========================================================================
router.get('/users', async (req, res, next) => {
  try {
    const search = req.query.search ? `%${req.query.search.trim()}%` : null;
    const filter = req.query.filter || 'all'; // 'all', 'paying', 'banned', 'zero'
    const limit = Math.min(parseInt(req.query.limit) || 25, 100);
    const offset = parseInt(req.query.offset) || 0;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let idx = 1;

    if (search) {
      whereClause += ` AND (
        users.telegram_id::text ILIKE $${idx} OR 
        users.username ILIKE $${idx} OR 
        users.first_name ILIKE $${idx}
      )`;
      params.push(search);
      idx++;
    }

    if (filter === 'banned') {
      whereClause += ' AND users.is_banned = TRUE';
    } else if (filter === 'paying') {
      whereClause += ' AND users.total_spent > 0';
    } else if (filter === 'zero') {
      whereClause += ' AND users.balance <= 0';
    }

    const countRes = await db.query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
    const total = parseInt(countRes.rows[0].count);

    const query = `
      SELECT 
        users.*,
        COUNT(DISTINCT generations.id) AS generations_count,
        COALESCE(SUM(payments.amount_rub), 0) AS total_paid
      FROM users
      LEFT JOIN generations ON generations.user_id = users.id
      LEFT JOIN payments ON payments.user_id = users.id AND payments.status = 'completed'
      ${whereClause}
      GROUP BY users.id
      ORDER BY users.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(limit, offset);

    const usersRes = await db.query(query, params);
    res.json({ users: usersRes.rows, total, limit, offset });
  } catch (error) {
    next(error);
  }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Пользователь не найден' });
    }
    const user = userRes.rows[0];

    // Последние генерации (до 25)
    const gensRes = await db.query(
      'SELECT * FROM generations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 25',
      [user.id]
    );

    // История оплат
    const paymentsRes = await db.query(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    );

    res.json({
      user,
      generations: gensRes.rows,
      payments: paymentsRes.rows,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/users/:id/adjust-balance', async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const delta = parseInt(amount);
    if (isNaN(delta) || delta === 0) {
      return res.status(400).json({ error: true, message: 'Укажите корректную сумму изменения баланса' });
    }

    const userRes = await db.query('SELECT id, balance, telegram_id FROM users WHERE id = $1', [req.params.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Пользователь не найден' });
    }
    const user = userRes.rows[0];

    const newBalance = Math.max(0, user.balance + delta);
    const updated = await db.query(
      'UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newBalance, user.id]
    );

    // Записываем в аудит/платежи если начисление
    if (delta > 0) {
      await db.query(
        `INSERT INTO payments (user_id, amount_rub, credits_added, status, payment_method)
         VALUES ($1, 0, $2, 'completed', $3)`,
        [user.id, delta, reason ? `Бонус поддержки: ${reason}` : 'Бонус администратора']
      );
    }

    // Если есть бот, пробуем отправить пользователю уведомление
    if (telegramBotInstance && user.telegram_id && delta > 0) {
      try {
        const text = `💎 Вам начислено +${delta} кредитов в Morphi AI!\n${reason ? `Причина: ${reason}\n` : ''}Ваш текущий баланс: ${newBalance} CR.`;
        await telegramBotInstance.sendMessage(user.telegram_id, text);
      } catch (botErr) {
        console.warn('[Admin] Не удалось уведомить пользователя в Telegram:', botErr.message);
      }
    }

    res.json({ success: true, user: updated.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.post('/users/:id/toggle-ban', async (req, res, next) => {
  try {
    const result = await db.query(
      'UPDATE users SET is_banned = NOT is_banned, updated_at = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Пользователь не найден' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 6. КОНТЕНТ-МЕНЕДЖЕР (ЛЕНТА И ТРЕНДЫ)
// =========================================================================
router.get('/feed', async (req, res, next) => {
  try {
    const [tResult, mResult] = await Promise.all([
      db.query('SELECT * FROM templates ORDER BY is_trending DESC, sort_order ASC, created_at DESC'),
      db.query('SELECT id, name, preview_url, versions FROM ai_models').catch(() => ({ rows: [] }))
    ]);

    const modelsList = mResult.rows || [];

    const items = tResult.rows.map(row => {
      const isVideo = row.video_url && /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(row.video_url.trim());
      const cleanVideoUrl = isVideo ? row.video_url : null;
      const cleanThumbUrl = !isVideo ? (row.thumb_url || row.video_url) : (row.thumb_url || null);

      let modelAvatar = null;
      if (row.model_name) {
        const lower = row.model_name.trim().toLowerCase();
        let match = modelsList.find(m => m.name?.toLowerCase() === lower || m.id?.toLowerCase() === lower);
        if (!match) {
          for (const m of modelsList) {
            if (Array.isArray(m.versions) && m.versions.some(v => v.name?.toLowerCase() === lower || v.id?.toLowerCase() === lower)) {
              match = m;
              break;
            }
          }
        }
        if (!match) {
          match = modelsList.find(m => {
            const mName = m.name?.toLowerCase() || '';
            const mId = m.id?.toLowerCase() || '';
            return (mName && lower.includes(mName)) || (mId && lower.includes(mId)) || (mName && mName.includes(lower));
          });
        }
        modelAvatar = match?.preview_url || null;
      }

      return {
        ...row,
        video_url: cleanVideoUrl,
        thumb_url: cleanThumbUrl,
        target_face_url: row.target_face_url || row.default_params?.targetFaceUrl || null,
        model_avatar: modelAvatar,
        is_prompt_locked: row.is_prompt_locked ?? (row.default_params?.isPromptLocked ?? (!row.prompt || !row.prompt.trim())),
      };
    });

    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/feed', async (req, res, next) => {
  try {
    const { name, category, video_url, thumb_url, prompt, model_name, cost, is_active, is_trending, is_prompt_locked, target_face_url } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: true, message: 'Название и категория обязательны' });
    }

    const isVideo = video_url && /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(video_url.trim());
    const cleanVideoUrl = isVideo ? video_url : null;
    const cleanThumbUrl = !isVideo ? (thumb_url || video_url) : (thumb_url || null);
    const cleanTargetFaceUrl = target_face_url && typeof target_face_url === 'string' && target_face_url.trim() ? target_face_url.trim() : null;

    const defaultParams = {
      isPromptLocked: is_prompt_locked !== undefined ? Boolean(is_prompt_locked) : (!prompt || !prompt.trim()),
      targetFaceUrl: cleanTargetFaceUrl
    };

    const result = await db.query(
      `INSERT INTO templates (name, category, video_url, thumb_url, prompt, model_name, cost, is_active, is_trending, default_params, target_face_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        name,
        category,
        cleanVideoUrl,
        cleanThumbUrl,
        prompt || null,
        model_name || null,
        cost || 10,
        is_active !== false,
        is_trending === true,
        JSON.stringify(defaultParams),
        cleanTargetFaceUrl
      ]
    );
    res.status(201).json({ item: { ...result.rows[0], target_face_url: cleanTargetFaceUrl } });
  } catch (error) {
    next(error);
  }
});

router.put('/feed/:id', async (req, res, next) => {
  try {
    const rawId = req.params.id;
    const cleanId = String(rawId).replace(/^tmpl_/, '');
    const id = parseInt(cleanId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: true, message: 'Некорректный ID элемента' });
    }

    const { name, category, video_url, thumb_url, prompt, model_name, cost, is_active, is_trending, sort_order, is_prompt_locked, target_face_url } = req.body;

    let finalVideoUrl = video_url;
    let finalThumbUrl = thumb_url;
    if (video_url !== undefined) {
      const isVideo = video_url && /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(video_url.trim());
      finalVideoUrl = isVideo ? video_url : null;
      if (!isVideo && !thumb_url) {
        finalThumbUrl = video_url;
      }
    }

    // Сохраняем или обновляем default_params
    const currentRes = await db.query('SELECT default_params, target_face_url FROM templates WHERE id = $1', [id]);
    const currentParams = (currentRes.rows[0] && currentRes.rows[0].default_params) || {};
    if (is_prompt_locked !== undefined) {
      currentParams.isPromptLocked = Boolean(is_prompt_locked);
    } else if (prompt !== undefined && (!prompt || !prompt.trim())) {
      currentParams.isPromptLocked = true;
    }

    let finalTargetFaceUrl = currentRes.rows[0]?.target_face_url || currentParams.targetFaceUrl || null;
    if (target_face_url !== undefined) {
      finalTargetFaceUrl = target_face_url && typeof target_face_url === 'string' && target_face_url.trim() ? target_face_url.trim() : null;
      currentParams.targetFaceUrl = finalTargetFaceUrl;
    }

    const result = await db.query(
      `UPDATE templates
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           video_url = $3,
           thumb_url = $4,
           prompt = $5,
           model_name = $6,
           cost = COALESCE($7, cost),
           is_active = COALESCE($8, is_active),
           is_trending = COALESCE($9, is_trending),
           sort_order = COALESCE($10, sort_order),
           default_params = $11,
           target_face_url = $12
       WHERE id = $13
       RETURNING *`,
      [name, category, finalVideoUrl, finalThumbUrl, prompt, model_name, cost, is_active, is_trending, sort_order, JSON.stringify(currentParams), finalTargetFaceUrl, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Элемент не найден' });
    }
    res.json({ item: { ...result.rows[0], target_face_url: finalTargetFaceUrl } });
  } catch (error) {
    next(error);
  }
});

router.delete('/feed/:id', async (req, res, next) => {
  try {
    const rawId = req.params.id;
    const cleanId = String(rawId).replace(/^tmpl_/, '');
    const id = parseInt(cleanId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: true, message: 'Некорректный ID элемента' });
    }

    await db.query('DELETE FROM templates WHERE id = $1', [id]);
    res.json({ success: true, message: 'Элемент удален' });
  } catch (error) {
    next(error);
  }
});

router.post('/feed/reorder', async (req, res, next) => {
  try {
    const { items } = req.body; // array of { id, sort_order, is_trending }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: true, message: 'Ожидается массив items' });
    }

    for (const item of items) {
      await db.query(
        'UPDATE templates SET sort_order = $1, is_trending = COALESCE($2, is_trending) WHERE id = $3',
        [item.sort_order, item.is_trending, item.id]
      );
    }
    res.json({ success: true, message: 'Порядок обновлен' });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 6.1. ЗАГРУЗКА ФАЙЛОВ В CLOUDFLARE R2
// =========================================================================
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: true, message: 'Файл не передан в поле file' });
    }
    const folder = req.body.folder || 'admin_media';
    const result = await storage.uploadBuffer({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      folder,
      originalName: req.file.originalname,
    });
    res.json({ success: true, url: result.url, key: result.key });
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 6.2. STORIES (КРУЖОЧКИ НА ГЛАВНОЙ)
// =========================================================================
router.get('/stories', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM stories ORDER BY sort_order ASC, created_at DESC');
    res.json({ stories: result.rows });
  } catch (error) {
    next(error);
  }
});

router.post('/stories', async (req, res, next) => {
  try {
    const { title, tag, image_url, video_url, model_name, prompt, is_active, sort_order } = req.body;
    if (!title || !image_url) {
      return res.status(400).json({ error: true, message: 'Заголовок и обложка обязательны' });
    }
    const result = await db.query(
      `INSERT INTO stories (title, tag, image_url, video_url, model_name, prompt, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title,
        tag || null,
        image_url,
        video_url || null,
        model_name || null,
        prompt || null,
        is_active !== false,
        sort_order || 0
      ]
    );
    res.status(201).json({ story: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.put('/stories/:id', async (req, res, next) => {
  try {
    const { title, tag, image_url, video_url, model_name, prompt, is_active, sort_order } = req.body;
    const result = await db.query(
      `UPDATE stories
       SET title = COALESCE($1, title),
           tag = $2,
           image_url = COALESCE($3, image_url),
           video_url = $4,
           model_name = $5,
           prompt = $6,
           is_active = COALESCE($7, is_active),
           sort_order = COALESCE($8, sort_order)
       WHERE id = $9
       RETURNING *`,
      [title, tag, image_url, video_url, model_name, prompt, is_active, sort_order, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Stories не найден' });
    }
    res.json({ story: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.delete('/stories/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM stories WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Stories удален' });
  } catch (error) {
    next(error);
  }
});

router.post('/stories/reorder', async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: true, message: 'Ожидается массив items' });
    }
    for (const item of items) {
      await db.query('UPDATE stories SET sort_order = $1 WHERE id = $2', [item.sort_order, item.id]);
    }
    res.json({ success: true, message: 'Порядок Stories обновлен' });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 6.3. AI МОДЕЛИ И ЦЕНЫ (УПРАВЛЕНИЕ НЕЙРОСЕТЯМИ)
// =========================================================================
router.get('/models', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM ai_models ORDER BY sort_order ASC, id ASC');
    const models = result.rows.map(row => ({
      ...row,
      preview: row.preview_url,
      preview_url: row.preview_url,
    }));
    res.json({ models });
  } catch (error) {
    next(error);
  }
});

router.put('/models/:id', async (req, res, next) => {
  try {
    const { cost, versions, is_active, description, tags, name } = req.body;
    const preview_url = req.body.preview_url || req.body.preview;
    const result = await db.query(
      `UPDATE ai_models
       SET preview_url = COALESCE($1, preview_url),
           cost = COALESCE($2, cost),
           versions = COALESCE($3, versions),
           is_active = COALESCE($4, is_active),
           description = COALESCE($5, description),
           tags = COALESCE($6, tags),
           name = COALESCE($7, name),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        preview_url,
        cost !== undefined ? parseInt(cost) : undefined,
        versions ? JSON.stringify(versions) : undefined,
        is_active,
        description,
        tags ? JSON.stringify(tags) : undefined,
        name,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Модель не найдена' });
    }
    const updatedModel = {
      ...result.rows[0],
      preview: result.rows[0].preview_url,
      preview_url: result.rows[0].preview_url
    };
    res.json({ model: updatedModel });
  } catch (error) {
    next(error);
  }
});

router.post('/models', async (req, res, next) => {
  try {
    const { id, name, category, preview_url, cost, tags, description, versions, is_active, sort_order } = req.body;
    if (!id || !name || !category || !preview_url) {
      return res.status(400).json({ error: true, message: 'id, name, category, preview_url обязательны' });
    }

    const result = await db.query(
      `INSERT INTO ai_models (id, name, category, preview_url, cost, tags, description, versions, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         preview_url = EXCLUDED.preview_url,
         cost = EXCLUDED.cost,
         tags = EXCLUDED.tags,
         description = EXCLUDED.description,
         versions = EXCLUDED.versions,
         is_active = EXCLUDED.is_active,
         sort_order = EXCLUDED.sort_order,
         updated_at = NOW()
       RETURNING *`,
      [
        id,
        name,
        category,
        preview_url,
        cost || 10,
        JSON.stringify(tags || []),
        description || '',
        JSON.stringify(versions || []),
        is_active !== false,
        sort_order || 0
      ]
    );
    res.status(201).json({ model: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 7. СИСТЕМНЫЕ НАСТРОЙКИ
// =========================================================================
router.get('/settings', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM system_settings');
    const settings = {};
    result.rows.forEach((row) => {
      settings[row.key] = row.value;
    });
    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

router.put('/settings', async (req, res, next) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: true, message: 'key и value обязательны' });
    }

    const result = await db.query(
      `INSERT INTO system_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
       RETURNING *`,
      [key, JSON.stringify(value)]
    );
    res.json({ setting: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 8. TELEGRAM РАССЫЛКА (BROADCAST)
// =========================================================================
router.post('/broadcast', async (req, res, next) => {
  try {
    const { message, buttonText, buttonUrl, testTelegramId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: true, message: 'Текст сообщения обязателен' });
    }

    if (!telegramBotInstance) {
      return res.status(503).json({ error: true, message: 'Telegram-бот не активен на сервере' });
    }

    const replyMarkup = buttonText && buttonUrl ? {
      inline_keyboard: [[{ text: buttonText, url: buttonUrl }]],
    } : undefined;

    // Режим теста — отправка только на указанный testTelegramId
    if (testTelegramId) {
      try {
        await telegramBotInstance.sendMessage(testTelegramId, message, {
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        });
        return res.json({ success: true, mode: 'test', sentCount: 1 });
      } catch (err) {
        return res.status(400).json({
          error: true,
          message: `Ошибка отправки теста: ${err.message}`,
        });
      }
    }

    // Массовая рассылка всем пользователям
    const usersRes = await db.query('SELECT telegram_id FROM users WHERE telegram_id IS NOT NULL AND is_banned = FALSE');
    const users = usersRes.rows;

    let successCount = 0;
    let failCount = 0;

    // Запускаем отправку с небольшой паузой во избежание Telegram Flood Limits
    for (const u of users) {
      try {
        await telegramBotInstance.sendMessage(u.telegram_id, message, {
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        });
        successCount++;
        // 35ms задержка между отправками (~30 сообщений в секунду, укладывается в лимит Telegram Bot API)
        await new Promise((resolve) => setTimeout(resolve, 35));
      } catch (sendErr) {
        failCount++;
      }
    }

    res.json({
      success: true,
      mode: 'broadcast',
      totalTargeted: users.length,
      sentCount: successCount,
      failedCount: failCount,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
