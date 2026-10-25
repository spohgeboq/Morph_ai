/**
 * Models API — публичный эндпоинт для клиента.
 * GET /api/models — возвращает актуальный каталог моделей с актуальными ценами и обложками.
 */
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM ai_models WHERE is_active = TRUE';
    const values = [];

    if (category) {
      query += ' AND category = $1';
      values.push(category);
    }

    query += ' ORDER BY sort_order ASC, id ASC';

    const cleanModelName = (name) => {
      if (!name || typeof name !== 'string') return name;
      return name.replace(/\s+api\b/gi, '').replace(/\bapi\s+/gi, '').replace(/\bapi\b/gi, '').trim();
    };

    const result = await db.query(query, values);
    if (result.rows.length > 0) {
      const models = result.rows.map(row => {
        const rawVersions = Array.isArray(row.versions) ? row.versions : [];
        const sanitizedVersions = rawVersions.map(v => ({
          ...v,
          name: cleanModelName(v.name)
        }));
        return {
          ...row,
          name: cleanModelName(row.name),
          preview: row.preview_url,
          preview_url: row.preview_url,
          desc: row.description || row.desc,
          description: row.description || row.desc,
          versions: sanitizedVersions,
        };
      });
      return res.json({ models });
    }

    // Фоллбэк на статический конфиг, если таблица пуста
    const { getAllModels } = require('../config/models');
    let models = getAllModels();
    if (category) models = models.filter((m) => m.category === category);
    models = models.filter((m) => m.category !== 'faceswap');
    res.json({ models });
  } catch (error) {
    console.warn('[Models Route] DB query failed, falling back to static config:', error.message);
    try {
      const { getAllModels } = require('../config/models');
      let models = getAllModels();
      if (req.query.category) models = models.filter((m) => m.category === req.query.category);
      models = models.filter((m) => m.category !== 'faceswap');
      return res.json({ models });
    } catch (fallbackErr) {
      next(error);
    }
  }
});

module.exports = router;
