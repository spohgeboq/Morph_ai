const crypto = require('crypto');

/**
 * Middleware для защиты админских эндпоинтов.
 * Проверяет заголовок x-admin-token или Authorization Bearer.
 */
function adminAuthMiddleware(req, res, next) {
  const masterPassword = process.env.ADMIN_PASSWORD || 'morphai_admin_2026';
  const expectedToken = crypto.createHash('sha256').update(`morphai_admin_${masterPassword}`).digest('hex');

  const authHeader = req.headers['authorization'];
  const tokenHeader = req.headers['x-admin-token'];

  let clientToken = tokenHeader;
  if (!clientToken && authHeader && authHeader.startsWith('Bearer ')) {
    clientToken = authHeader.slice(7).trim();
  }

  // Также разрешаем прямую передачу пароля в теле запроса (для dev/тестов)
  if (req.body && req.body.admin_password === masterPassword) {
    return next();
  }

  if (!clientToken || clientToken !== expectedToken) {
    return res.status(401).json({
      error: true,
      message: 'Доступ запрещён. Недействительный токен администратора.',
    });
  }

  next();
}

/**
 * Вспомогательная функция для генерации токена по мастер-паролю
 */
function generateAdminToken(password) {
  const masterPassword = process.env.ADMIN_PASSWORD || 'morphai_admin_2026';
  if (password !== masterPassword) return null;
  return crypto.createHash('sha256').update(`morphai_admin_${masterPassword}`).digest('hex');
}

module.exports = { adminAuthMiddleware, generateAdminToken };
