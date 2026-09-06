/**
 * MorphAI Backend — точка входа.
 *
 * Инициализирует:
 * 1. Express (REST API + CORS)
 * 2. Сервисы провайдеров (OpenRouter, PiAPI, Runway, FaceSwap)
 * 3. ServiceRegistry (DI-контейнер)
 * 4. Telegram-бот
 * 5. Роуты API
 * 6. Webhook-приёмник
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

// Middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

// Сервисы
const ServiceRegistry = require('./services/ServiceRegistry');
const OpenRouterService = require('./services/openrouter.service');
const PiAPIService = require('./services/piapi.service');
const RunwayService = require('./services/runway.service');
const FaceSwapService = require('./services/faceswap.service');
const TelegramService = require('./services/telegram.service');

// Роуты
const usersRouter = require('./routes/users');
const generateRouter = require('./routes/generate');
const webhooksRouter = require('./routes/webhooks');
const templatesRouter = require('./routes/templates');
const uploadRouter = require('./routes/upload');

// Бот
const { initBot } = require('./bot/index');

const app = express();

// ==========================================
// 1. Middleware
// ==========================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ==========================================
// 2. Регистрация AI-провайдеров
// ==========================================
const openRouterService = new OpenRouterService();
const piAPIService = new PiAPIService();
const runwayService = new RunwayService();
const faceSwapService = new FaceSwapService();

ServiceRegistry.register('openrouter', openRouterService);
ServiceRegistry.register('piapi', piAPIService);
ServiceRegistry.register('runway', runwayService);
ServiceRegistry.register('faceswap', faceSwapService);

console.log(`[Server] ✓ Зарегистрировано провайдеров: ${ServiceRegistry.listProviders().length}`);

// ==========================================
// 3. Инициализация Telegram-бота
// ==========================================
const bot = initBot({ registry: ServiceRegistry });
let telegramService = null;

if (bot) {
  telegramService = new TelegramService(bot);
  // Инжектируем TelegramService в webhook-роут
  webhooksRouter.setTelegramService(telegramService);
  console.log('[Server] ✓ Telegram-бот подключён');
}

// ==========================================
// 4. API роуты
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MorphAI Backend is running',
    providers: ServiceRegistry.listProviders(),
    bot: bot ? 'active' : 'inactive',
    timestamp: new Date().toISOString(),
  });
});

// Публичные роуты
app.use('/api/models', (req, res) => {
  const { getAllModels } = require('./config/models');
  const { category } = req.query;
  let models = getAllModels();
  if (category) models = models.filter((m) => m.category === category);
  models = models.filter((m) => m.category !== 'faceswap');
  res.json({ models });
});
app.use('/api/users', usersRouter);
app.use('/api/generate', generateRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/upload', uploadRouter);

// Webhook для Telegram (если в production mode)
if (bot && process.env.WEBHOOK_URL) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
}

// ==========================================
// 5. Глобальный обработчик ошибок (последний!)
// ==========================================
app.use(errorHandler);

// ==========================================
// 6. Запуск сервера
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log(`  🚀 MorphAI Backend v2.0`);
  console.log(`  📡 Server: http://localhost:${PORT}`);
  console.log(`  🔌 Providers: ${ServiceRegistry.listProviders().join(', ')}`);
  console.log(`  🤖 Bot: ${bot ? 'ACTIVE' : 'INACTIVE'}`);
  console.log('═══════════════════════════════════════');
  console.log('');
});
