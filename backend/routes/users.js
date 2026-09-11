/**
 * Users API — управление пользователями.
 *
 * GET  /api/users/:telegramId      — получить профиль
 * POST /api/users                  — создать/зарегистрировать
 * PUT  /api/users/:telegramId      — обновить (face_photo_url, language и т.д.)
 * GET  /api/users/:telegramId/generations — история генераций
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');

/**
 * GET /api/users/:telegramId — получить профиль пользователя
 */
router.get('/:telegramId', async (req, res, next) => {
  try {
    const { telegramId } = req.params;
    const result = await db.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegramId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User', telegramId);
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

const { validateInitData } = require('../middleware/auth');

/**
 * POST /api/users — создать или вернуть существующего пользователя (upsert / авторегистрация)
 */
router.post('/', async (req, res, next) => {
  try {
    let telegram_id = req.body.telegram_id;
    let username = req.body.username;
    let first_name = req.body.first_name;
    let language = req.body.language || 'ru';
    let photo_url = req.body.photo_url || req.body.face_photo_url || null;

    // Проверяем x-telegram-init-data если передан
    const initData = req.headers['x-telegram-init-data'];
    if (initData) {
      try {
        const isValid = validateInitData(initData, process.env.TELEGRAM_BOT_TOKEN);
        if (isValid || process.env.NODE_ENV !== 'production') {
          const urlParams = new URLSearchParams(initData);
          const userStr = urlParams.get('user');
          if (userStr) {
            const parsedUser = JSON.parse(userStr);
            if (parsedUser.id) {
              telegram_id = parsedUser.id;
              if (parsedUser.username) username = parsedUser.username;
              if (parsedUser.first_name) first_name = parsedUser.first_name;
              if (parsedUser.photo_url) photo_url = parsedUser.photo_url;
              if (parsedUser.language_code) language = parsedUser.language_code.slice(0, 5);
            }
          }
        }
      } catch (err) {
        console.warn('[Users/Post] Ошибка парсинга initData, используем body:', err.message);
      }
    }

    if (!telegram_id) {
      throw new ValidationError('telegram_id обязателен');
    }

    const result = await db.query(
      `INSERT INTO users (telegram_id, username, first_name, language, photo_url, face_photo_url)
       VALUES ($1, $2, $3, $4, $5, $5)
       ON CONFLICT (telegram_id) DO UPDATE SET
         username = COALESCE(EXCLUDED.username, users.username),
         first_name = COALESCE(EXCLUDED.first_name, users.first_name),
         language = COALESCE(EXCLUDED.language, users.language),
         photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url),
         face_photo_url = COALESCE(users.face_photo_url, EXCLUDED.photo_url),
         updated_at = NOW()
       RETURNING *`,
      [telegram_id, username || null, first_name || null, language, photo_url]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/telegram-login — мгновенная авторизация / регистрация по Telegram username или ID
 */
router.post('/telegram-login', async (req, res, next) => {
  try {
    const { username, telegram_id, first_name, photo_url } = req.body;

    if (!username && !telegram_id) {
      throw new ValidationError('Укажите @username или telegram_id');
    }

    let user = null;

    if (telegram_id) {
      const resById = await db.query('SELECT * FROM users WHERE telegram_id = $1', [telegram_id]);
      if (resById.rows.length > 0) {
        user = resById.rows[0];
      }
    }

    if (!user && username) {
      const cleanUser = username.replace(/^@/, '').trim();
      const resByNick = await db.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [cleanUser]);
      if (resByNick.rows.length > 0) {
        user = resByNick.rows[0];
      }
    }

    // Если пользователя нет — регистрируем сразу же без лишних действий!
    if (!user) {
      let finalTgId = telegram_id;
      if (!finalTgId && username) {
        // Генерируем детерминированный ID на основе хэша имени
        let hash = 0;
        const clean = username.replace(/^@/, '').trim().toLowerCase();
        for (let i = 0; i < clean.length; i++) {
          hash = (hash << 5) - hash + clean.charCodeAt(i);
          hash |= 0;
        }
        finalTgId = 7000000000 + Math.abs(hash % 900000000);
      }

      const cleanUser = username ? username.replace(/^@/, '').trim() : `tg_${finalTgId}`;
      const insertRes = await db.query(
        `INSERT INTO users (telegram_id, username, first_name, language, photo_url, balance)
         VALUES ($1, $2, $3, 'ru', $4, 50)
         RETURNING *`,
        [finalTgId, cleanUser, first_name || cleanUser, photo_url || null]
      );
      user = insertRes.rows[0];
      console.log(`[Users/TelegramLogin] ✓ Автоматически зарегистрирован новый пользователь: @${cleanUser} (ID: ${finalTgId}) с балансом 50 CR`);
    } else {
      // Обновляем фото или имя, если изменились
      if (photo_url || username) {
        const cleanUser = username ? username.replace(/^@/, '').trim() : user.username;
        const updateRes = await db.query(
          `UPDATE users SET
             username = COALESCE($1, username),
             photo_url = COALESCE($2, photo_url),
             updated_at = NOW()
           WHERE id = $3
           RETURNING *`,
          [cleanUser, photo_url || null, user.id]
        );
        user = updateRes.rows[0];
      }
    }

    res.json({
      success: true,
      message: 'Авторизация через Telegram успешна',
      user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/:telegramId — обновить данные пользователя
 */
router.put('/:telegramId', async (req, res, next) => {
  try {
    const { telegramId } = req.params;
    const { face_photo_url, photo_url, language, username, first_name } = req.body;

    const sets = [];
    const values = [];
    let paramIdx = 1;

    if (face_photo_url !== undefined) {
      sets.push(`face_photo_url = $${paramIdx++}`);
      values.push(face_photo_url);
    }
    if (photo_url !== undefined) {
      sets.push(`photo_url = $${paramIdx++}`);
      values.push(photo_url);
    }
    if (language !== undefined) {
      sets.push(`language = $${paramIdx++}`);
      values.push(language);
    }
    if (username !== undefined) {
      sets.push(`username = $${paramIdx++}`);
      values.push(username);
    }
    if (first_name !== undefined) {
      sets.push(`first_name = $${paramIdx++}`);
      values.push(first_name);
    }

    if (sets.length === 0) {
      throw new ValidationError('Нет данных для обновления');
    }

    sets.push('updated_at = NOW()');
    values.push(telegramId);

    const result = await db.query(
      `UPDATE users SET ${sets.join(', ')} WHERE telegram_id = $${paramIdx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User', telegramId);
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:telegramId/generations — история генераций
 */
router.get('/:telegramId/generations', async (req, res, next) => {
  try {
    const { telegramId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const result = await db.query(
      `SELECT g.* FROM generations g
       JOIN users u ON u.id = g.user_id
       WHERE u.telegram_id = $1
       ORDER BY g.created_at DESC
       LIMIT $2 OFFSET $3`,
      [telegramId, limit, offset]
    );

    res.json({ generations: result.rows });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/:telegramId/promocode — активация промокода
 */
router.post('/:telegramId/promocode', async (req, res, next) => {
  try {
    const { telegramId } = req.params;
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: true, message: 'Укажите промокод' });
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Поиск пользователя
    const userRes = await db.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
    if (userRes.rows.length === 0) {
      throw new NotFoundError('User', telegramId);
    }
    const user = userRes.rows[0];

    if (user.is_banned) {
      return res.status(403).json({ error: true, message: 'Аккаунт заблокирован' });
    }

    // 2. Поиск промокода
    const promoRes = await db.query(
      'SELECT * FROM promocodes WHERE UPPER(code) = $1 AND is_active = TRUE',
      [cleanCode]
    );

    if (promoRes.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Такого промокода не существует или он не активен' });
    }
    const promo = promoRes.rows[0];

    // 3. Проверка срока действия
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return res.status(400).json({ error: true, message: 'Срок действия промокода истёк' });
    }

    // 4. Проверка лимита активаций
    if (promo.max_uses && promo.used_count >= promo.max_uses) {
      return res.status(400).json({ error: true, message: 'Лимит активаций этого промокода исчерпан' });
    }

    // 5. Проверка повторной активации
    const checkActivation = await db.query(
      'SELECT id FROM promocode_activations WHERE promocode_id = $1 AND user_id = $2',
      [promo.id, user.id]
    );
    if (checkActivation.rows.length > 0) {
      return res.status(400).json({ error: true, message: 'Вы уже активировали этот промокод' });
    }

    // 6. Начисление кредитов
    const reward = promo.reward_credits || 0;
    const newBalance = user.balance + reward;

    await db.query('BEGIN');

    await db.query(
      'UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2',
      [newBalance, user.id]
    );

    await db.query(
      'INSERT INTO promocode_activations (promocode_id, user_id) VALUES ($1, $2)',
      [promo.id, user.id]
    );

    await db.query(
      'UPDATE promocodes SET used_count = used_count + 1 WHERE id = $1',
      [promo.id]
    );

    if (reward > 0) {
      await db.query(
        `INSERT INTO payments (user_id, amount_rub, credits_added, status, payment_method)
         VALUES ($1, 0, $2, 'completed', $3)`,
        [user.id, reward, `Промокод: ${cleanCode}`]
      );
    }

    await db.query('COMMIT');

    res.json({
      success: true,
      message: `Промокод успешно активирован! Начислено +${reward} кредитов`,
      reward_credits: reward,
      new_balance: newBalance,
    });
  } catch (error) {
    await db.query('ROLLBACK');
    next(error);
  }
});

module.exports = router;

