/**
 * Глобальный обработчик ошибок Express.
 * Перехватывает все ошибки, логирует и отвечает клиенту.
 */

class AIProviderError extends Error {
  constructor(provider, message, taskId = null, userId = null) {
    super(message);
    this.name = 'AIProviderError';
    this.provider = provider;
    this.taskId = taskId;
    this.userId = userId;
    this.statusCode = 502; // Bad Gateway — внешний сервис недоступен
  }
}

class InsufficientCreditsError extends Error {
  constructor(required, available) {
    super(`Недостаточно кредитов: требуется ${required}, доступно ${available}`);
    this.name = 'InsufficientCreditsError';
    this.required = required;
    this.available = available;
    this.statusCode = 402; // Payment Required
  }
}

class NotFoundError extends Error {
  constructor(entity, id) {
    super(`${entity} с id=${id} не найден`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

/**
 * Express middleware для обработки ошибок.
 * Должен быть подключён последним: app.use(errorHandler)
 */
function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Логируем все ошибки
  console.error(`[ERROR] ${err.name || 'Error'}: ${err.message}`);
  if (!isProduction) {
    console.error(err.stack);
  }

  // Формируем ответ
  const response = {
    error: true,
    message: err.message || 'Внутренняя ошибка сервера',
    code: err.name || 'INTERNAL_ERROR',
  };

  // В dev-режиме добавляем стектрейс
  if (!isProduction) {
    response.stack = err.stack;
  }

  // Для AIProviderError добавляем доп. поля
  if (err instanceof AIProviderError) {
    response.provider = err.provider;
    response.taskId = err.taskId;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  errorHandler,
  AIProviderError,
  InsufficientCreditsError,
  NotFoundError,
  ValidationError,
};
