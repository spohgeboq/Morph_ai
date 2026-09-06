/**
 * Templates API — CRUD для шаблонов (админские пресеты + Face Swap эталоны).
 *
 * GET    /api/templates           — список активных шаблонов
 * GET    /api/templates/:id       — один шаблон
 * POST   /api/templates           — создать (админ)
 * PUT    /api/templates/:id       — обновить (админ)
 * DELETE /api/templates/:id       — удалить (админ)
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');

/**
 * GET /api/templates — список активных шаблонов
 */
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM templates WHERE is_active = TRUE';
    const values = [];

    if (category) {
      query += ' AND category = $1';
      values.push(category);
    }

    query += ' ORDER BY sort_order ASC, created_at DESC';

    const result = await db.query(query, values);
    res.json({ templates: result.rows });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/templates/:id — один шаблон
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM templates WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      throw new NotFoundError('Template', req.params.id);
    }
    res.json({ template: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/templates — создать шаблон
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, category, video_url, thumb_url, prompt, model_name, default_params, cost, sort_order } = req.body;

    if (!name || !category) {
      throw new ValidationError('name и category обязательны');
    }

    const result = await db.query(
      `INSERT INTO templates (name, category, video_url, thumb_url, prompt, model_name, default_params, cost, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        category,
        video_url || null,
        thumb_url || null,
        prompt || null,
        model_name || null,
        JSON.stringify(default_params || {}),
        cost || 10,
        sort_order || 0,
      ]
    );

    res.status(201).json({ template: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/templates/:id — обновить шаблон
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { name, category, video_url, thumb_url, prompt, model_name, default_params, cost, is_active, sort_order } = req.body;

    const sets = [];
    const values = [];
    let idx = 1;

    const fields = { name, category, video_url, thumb_url, prompt, model_name, cost, is_active, sort_order };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        sets.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (default_params !== undefined) {
      sets.push(`default_params = $${idx++}`);
      values.push(JSON.stringify(default_params));
    }

    if (sets.length === 0) {
      throw new ValidationError('Нет данных для обновления');
    }

    values.push(req.params.id);
    const result = await db.query(
      `UPDATE templates SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Template', req.params.id);
    }

    res.json({ template: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/templates/:id — удалить шаблон (soft delete)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'UPDATE templates SET is_active = FALSE WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Template', req.params.id);
    }

    res.json({ success: true, message: 'Шаблон деактивирован' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
