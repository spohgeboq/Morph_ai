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

const isVideoMedia = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url.trim());
};

const isImageMedia = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /\.(jpg|jpeg|png|webp|avif|gif)(\?.*)?$/i.test(url.trim());
};

const findModelAvatar = (modelName, modelsList) => {
  if (!modelName || !Array.isArray(modelsList) || modelsList.length === 0) return null;
  const lower = modelName.trim().toLowerCase();

  // 1. Прямое совпадение по имени или id
  let match = modelsList.find(m => m.name?.toLowerCase() === lower || m.id?.toLowerCase() === lower);
  if (match?.preview_url) return match.preview_url;

  // 2. Совпадение по версиям (подмоделям, напр. Flux 1.1 Pro -> Flux)
  for (const m of modelsList) {
    if (Array.isArray(m.versions)) {
      if (m.versions.some(v => v.name?.toLowerCase() === lower || v.id?.toLowerCase() === lower || v.slug?.toLowerCase() === lower)) {
        if (m.preview_url) return m.preview_url;
      }
    }
  }

  // 3. Подстрока (напр. "Flux" внутри "Flux 1.1 Pro", "Kling" внутри "Kling 1.5 HD")
  match = modelsList.find(m => {
    const mName = m.name?.toLowerCase() || '';
    const mId = m.id?.toLowerCase() || '';
    return (mName && lower.includes(mName)) || (mId && lower.includes(mId)) || (mName && mName.includes(lower));
  });
  if (match?.preview_url) return match.preview_url;

  return null;
};

/**
 * GET /api/templates — список активных шаблонов с обложками моделей и корректным типом медиа
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

    query += ' ORDER BY is_trending DESC, sort_order ASC, created_at DESC';

    const [tResult, mResult] = await Promise.all([
      db.query(query, values),
      db.query('SELECT id, name, preview_url, versions FROM ai_models').catch(() => ({ rows: [] }))
    ]);

    const modelsList = mResult.rows || [];

    const templates = tResult.rows.map(row => {
      const isVideo = isVideoMedia(row.video_url) || isVideoMedia(row.media_url) || (row.category === 'video' && !isImageMedia(row.video_url));
      const modelAvatar = findModelAvatar(row.model_name, modelsList);

      const mediaUrl = isVideo ? row.video_url : (row.thumb_url || row.video_url || row.media_url);
      const thumbUrl = !isVideo ? (row.thumb_url || row.video_url) : (row.thumb_url || null);
      const videoUrl = isVideo ? row.video_url : null;

      return {
        ...row,
        title: row.title || row.name,
        media_url: mediaUrl,
        thumb_url: thumbUrl,
        preview_url: thumbUrl || mediaUrl,
        video_url: videoUrl,
        type: isVideo ? 'video' : 'photo',
        target_face_url: row.target_face_url || row.default_params?.targetFaceUrl || null,
        model_avatar: modelAvatar || null,
        is_prompt_locked: row.is_prompt_locked ?? (row.default_params?.isPromptLocked ?? (!row.prompt || !row.prompt.trim())),
      };
    });

    res.json({ templates });
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
    const row = result.rows[0];
    res.json({ 
      template: {
        ...row,
        target_face_url: row.target_face_url || row.default_params?.targetFaceUrl || null,
        is_prompt_locked: row.is_prompt_locked ?? (row.default_params?.isPromptLocked ?? (!row.prompt || !row.prompt.trim())),
      } 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/templates — создать шаблон
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, category, video_url, thumb_url, prompt, model_name, default_params, cost, sort_order, target_face_url } = req.body;

    if (!name || !category) {
      throw new ValidationError('name и category обязательны');
    }

    const isVideo = isVideoMedia(video_url);
    const cleanVideoUrl = isVideo ? video_url : null;
    const cleanThumbUrl = !isVideo ? (thumb_url || video_url) : (thumb_url || null);
    const cleanTargetFaceUrl = target_face_url && typeof target_face_url === 'string' && target_face_url.trim() ? target_face_url.trim() : null;

    const finalParams = {
      ...(default_params || {}),
      targetFaceUrl: cleanTargetFaceUrl
    };

    const result = await db.query(
      `INSERT INTO templates (name, category, video_url, thumb_url, prompt, model_name, default_params, cost, sort_order, target_face_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        name,
        category,
        cleanVideoUrl,
        cleanThumbUrl,
        prompt || null,
        model_name || null,
        JSON.stringify(finalParams),
        cost || 10,
        sort_order || 0,
        cleanTargetFaceUrl
      ]
    );

    res.status(201).json({ template: { ...result.rows[0], target_face_url: cleanTargetFaceUrl } });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/templates/:id — обновить шаблон
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { name, category, video_url, thumb_url, prompt, model_name, default_params, cost, is_active, sort_order, target_face_url } = req.body;

    let finalVideoUrl = video_url;
    let finalThumbUrl = thumb_url;
    if (video_url !== undefined) {
      const isVideo = isVideoMedia(video_url);
      finalVideoUrl = isVideo ? video_url : null;
      if (!isVideo && !thumb_url) {
        finalThumbUrl = video_url;
      }
    }

    const sets = [];
    const values = [];
    let idx = 1;

    const fields = { 
      name, 
      category, 
      video_url: finalVideoUrl, 
      thumb_url: finalThumbUrl, 
      prompt, 
      model_name, 
      cost, 
      is_active, 
      sort_order,
      target_face_url: target_face_url !== undefined ? (target_face_url && target_face_url.trim() ? target_face_url.trim() : null) : undefined
    };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        sets.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (default_params !== undefined || target_face_url !== undefined) {
      // Подмешиваем targetFaceUrl в default_params для совместимости
      const currentRes = await db.query('SELECT default_params FROM templates WHERE id = $1', [req.params.id]);
      const currentParams = (currentRes.rows[0] && currentRes.rows[0].default_params) || {};
      const mergedParams = {
        ...currentParams,
        ...(default_params || {})
      };
      if (target_face_url !== undefined) {
        mergedParams.targetFaceUrl = target_face_url && target_face_url.trim() ? target_face_url.trim() : null;
      }
      sets.push(`default_params = $${idx++}`);
      values.push(JSON.stringify(mergedParams));
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

    const row = result.rows[0];
    res.json({ 
      template: {
        ...row,
        target_face_url: row.target_face_url || row.default_params?.targetFaceUrl || null
      } 
    });
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
