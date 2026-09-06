/**
 * Управление кредитным балансом пользователей.
 * Атомарные операции списания и возврата.
 */
const db = require('../db');

/**
 * Списать кредиты у пользователя (оптимистичное списание).
 * Использует WHERE balance >= cost для атомарности.
 *
 * @param {number} userId — id пользователя в БД
 * @param {number} amount — количество кредитов
 * @returns {Promise<{success: boolean, newBalance: number}>}
 */
async function chargeCredits(userId, amount) {
  const result = await db.query(
    `UPDATE users 
     SET balance = balance - $1, updated_at = NOW() 
     WHERE id = $2 AND balance >= $1 
     RETURNING balance`,
    [amount, userId]
  );

  if (result.rows.length === 0) {
    return { success: false, newBalance: null };
  }

  return { success: true, newBalance: result.rows[0].balance };
}

/**
 * Вернуть кредиты пользователю (при ошибке провайдера).
 *
 * @param {number} userId — id пользователя в БД
 * @param {number} amount — количество кредитов для возврата
 * @returns {Promise<{newBalance: number}>}
 */
async function refundCredits(userId, amount) {
  const result = await db.query(
    `UPDATE users 
     SET balance = balance + $1, updated_at = NOW() 
     WHERE id = $2 
     RETURNING balance`,
    [amount, userId]
  );

  return { newBalance: result.rows[0]?.balance || 0 };
}

/**
 * Получить текущий баланс пользователя.
 *
 * @param {number} userId — id пользователя в БД
 * @returns {Promise<number>}
 */
async function getBalance(userId) {
  const result = await db.query(
    'SELECT balance FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0]?.balance || 0;
}

/**
 * Получить баланс по Telegram ID.
 *
 * @param {number} telegramId
 * @returns {Promise<number>}
 */
async function getBalanceByTelegramId(telegramId) {
  const result = await db.query(
    'SELECT balance FROM users WHERE telegram_id = $1',
    [telegramId]
  );
  return result.rows[0]?.balance || 0;
}

module.exports = {
  chargeCredits,
  refundCredits,
  getBalance,
  getBalanceByTelegramId,
};
