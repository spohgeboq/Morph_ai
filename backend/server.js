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
const adminRouter = require('./routes/admin');
const storiesRouter = require('./routes/stories');
const modelsRouter = require('./routes/models');

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
  generateRouter.setTelegramService(telegramService);
  adminRouter.setBot(bot);
  console.log('[Server] ✓ Telegram-бот подключён к Webhook, Generate и Admin Hub');
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

// Публичные тарифы кредитов для клиентов
app.get('/api/tariffs', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM credit_packages WHERE is_active = TRUE ORDER BY sort_order ASC, id ASC');
    res.json({ tariffs: result.rows });
  } catch (err) {
    next(err);
  }
});

// Публичные роуты
app.use('/api/stories', storiesRouter);
app.use('/api/models', modelsRouter);
app.use('/api/users', usersRouter);
app.use('/api/generate', generateRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin', adminRouter);

// Публичный эндпоинт для настроек студийного фотосета
app.get('/api/settings/photoshoot', async (req, res, next) => {
  try {
    const result = await db.query("SELECT value FROM system_settings WHERE key = 'photoshoot_config'");
    if (result.rows.length > 0) {
      return res.json({ config: result.rows[0].value });
    }
    res.json({
      config: {
        cost: 10,
        badge: "Editorial 4K",
        count_badge: "+5",
        title: "Профессиональный студийный сет",
        desc: "5 журнальных кадров премиум-класса с идеальным светом и живыми эмоциями",
        photos: [
          "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
        ]
      }
    });
  } catch (err) {
    next(err);
  }
});


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
