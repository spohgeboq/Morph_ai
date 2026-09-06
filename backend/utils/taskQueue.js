/**
 * Управление очередью асинхронных задач.
 * Хранит и обновляет записи генераций в PostgreSQL.
 */
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

/**
 * Создать новую задачу генерации в БД.
 *
 * @param {object} params
 * @param {number} params.userId — id пользователя
 * @param {string} params.modelName — slug модели (e.g. 'flux-1-1-pro')
 * @param {string} params.provider — провайдер ('openrouter'|'piapi'|'runway')
 * @param {string} params.taskType — 'text'|'photo'|'video'|'faceswap'
 * @param {string} params.prompt — промпт пользователя
 * @param {object} params.params — доп. параметры (aspect_ratio, duration и т.д.)
 * @param {number} params.creditsCharged — списанные кредиты
 * @param {string} [params.externalTaskId] — task_id от провайдера (если есть)
 * @returns {Promise<object>} — созданная запись
 */
async function createTask({
  userId,
  modelName,
  provider,
  taskType,
  prompt,
  params = {},
  creditsCharged,
  externalTaskId = null,
}) {
  const taskId = externalTaskId || uuidv4();

  const result = await db.query(
    `INSERT INTO generations 
       (task_id, user_id, model_name, provider, task_type, prompt, params, credits_charged, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
     RETURNING *`,
    [taskId, userId, modelName, provider, taskType, prompt, JSON.stringify(params), creditsCharged]
  );

  return result.rows[0];
}

/**
 * Обновить статус задачи.
 *
 * @param {string} taskId
 * @param {object} updates
 * @param {string} updates.status — 'processing'|'completed'|'failed'
 * @param {string} [updates.resultUrl]
 * @param {string} [updates.resultText]
 * @param {string} [updates.errorMessage]
 * @returns {Promise<object|null>}
 */
async function updateTask(taskId, { status, resultUrl, resultText, errorMessage }) {
  const sets = ['status = $2'];
  const values = [taskId, status];
  let paramIdx = 3;

  if (resultUrl !== undefined) {
    sets.push(`result_url = $${paramIdx++}`);
    values.push(resultUrl);
  }
  if (resultText !== undefined) {
    sets.push(`result_text = $${paramIdx++}`);
    values.push(resultText);
  }
  if (errorMessage !== undefined) {
    sets.push(`error_message = $${paramIdx++}`);
    values.push(errorMessage);
  }
  if (status === 'completed' || status === 'failed') {
    sets.push(`completed_at = NOW()`);
  }

  const result = await db.query(
    `UPDATE generations SET ${sets.join(', ')} WHERE task_id = $1 RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Найти задачу по task_id.
 *
 * @param {string} taskId
 * @returns {Promise<object|null>}
 */
async function getTask(taskId) {
  const result = await db.query(
    'SELECT * FROM generations WHERE task_id = $1',
    [taskId]
  );
  return result.rows[0] || null;
}

/**
 * Получить историю генераций пользователя.
 *
 * @param {number} userId
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<object[]>}
 */
async function getUserTasks(userId, limit = 20, offset = 0) {
  const result = await db.query(
    `SELECT * FROM generations 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
}

/**
 * Получить все pending-задачи (для polling провайдеров).
 *
 * @returns {Promise<object[]>}
 */
async function getPendingTasks() {
  const result = await db.query(
    `SELECT * FROM generations WHERE status IN ('pending', 'processing') ORDER BY created_at ASC`
  );
  return result.rows;
}

module.exports = {
  createTask,
  updateTask,
  getTask,
  getUserTasks,
  getPendingTasks,
};
