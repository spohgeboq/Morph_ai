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

/**
 * POST /api/users — создать или вернуть существующего пользователя (upsert)
 */
router.post('/', async (req, res, next) => {
  try {
    const { telegram_id, username, first_name, language } = req.body;

    if (!telegram_id) {
      throw new ValidationError('telegram_id обязателен');
    }

    const result = await db.query(
      `INSERT INTO users (telegram_id, username, first_name, language)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (telegram_id) DO UPDATE SET
         username = COALESCE(EXCLUDED.username, users.username),
         first_name = COALESCE(EXCLUDED.first_name, users.first_name),
         updated_at = NOW()
       RETURNING *`,
      [telegram_id, username || null, first_name || null, language || 'ru']
    );

    res.status(201).json({ user: result.rows[0] });
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
    const { face_photo_url, language, username, first_name } = req.body;

    const sets = [];
    const values = [];
    let paramIdx = 1;

    if (face_photo_url !== undefined) {
      sets.push(`face_photo_url = $${paramIdx++}`);
      values.push(face_photo_url);
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

module.exports = router;
