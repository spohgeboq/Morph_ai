/**
 * Stories API — публичный эндпоинт для клиента.
 * GET /api/stories — возвращает активные сторис для карусели на Главной.
 */
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM stories WHERE is_active = TRUE ORDER BY sort_order ASC, created_at DESC'
    );
    const stories = result.rows.map(row => ({
      ...row,
      cover_url: row.image_url,
      image: row.image_url,
      media_url: row.video_url || row.image_url,
      video: row.video_url
    }));
    res.json({ stories });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
