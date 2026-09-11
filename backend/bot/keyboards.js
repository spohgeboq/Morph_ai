/**
 * Inline-клавиатуры для Telegram-бота.
 */

const { getAllModels, getModel } = require('../config/models');

/**
 * Главное меню бота.
 */
function mainMenuKeyboard() {
  const webAppUrl = process.env.TELEGRAM_WEBAPP_URL || process.env.CLIENT_URL;

  const rows = [];

  // Добавляем большую кнопку запуска WebApp, если URL задан
  if (webAppUrl && webAppUrl.startsWith('https://')) {
    rows.push([{ text: '🚀 Запустить MorphAI WebApp', web_app: { url: webAppUrl } }]);
  } else if (webAppUrl) {
    rows.push([{ text: '🚀 Открыть MorphAI WebApp', url: webAppUrl }]);
  }

  rows.push(
    [
      { text: '📸 Фото', callback_data: 'cat:photo' },
      { text: '🎬 Видео', callback_data: 'cat:video' },
    ],
    [
      { text: '✍️ Текст', callback_data: 'cat:text' },
      { text: '🔄 Face Swap', callback_data: 'faceswap:start' },
    ],
    [
      { text: '💰 Баланс', callback_data: 'balance' },
      { text: '📋 История', callback_data: 'history' },
    ]
  );

  return {
    reply_markup: {
      inline_keyboard: rows,
    },
  };
}

/**
 * Список моделей для выбранной категории.
 *
 * @param {string} category — 'photo' | 'video' | 'text'
 */
function modelsKeyboard(category) {
  const models = getAllModels().filter((m) => m.category === category);
  const buttons = models.map((m) => [
    { text: `${m.name} (${m.cost} CR)`, callback_data: `model:${m.id}` },
  ]);

  buttons.push([{ text: '⬅️ Назад', callback_data: 'back:main' }]);

  return {
    reply_markup: { inline_keyboard: buttons },
  };
}

/**
 * Список подмоделей (версий) для конкретной модели.
 *
 * @param {string} modelId
 */
function versionsKeyboard(modelId) {
  const model = getModel(modelId);
  if (!model || model.versions.length === 0) return null;

  const buttons = model.versions.map((v) => [
    { text: `${v.name} (${v.cost} CR)`, callback_data: `ver:${modelId}:${v.id}` },
  ]);

  buttons.push([{ text: '⬅️ Назад', callback_data: `cat:${model.category}` }]);

  return {
    reply_markup: { inline_keyboard: buttons },
  };
}

/**
 * Выбор пропорций (aspect ratio).
 *
 * @param {string} modelId
 * @param {string} versionId
 */
function aspectRatioKeyboard(modelId, versionId) {
  const model = getModel(modelId);
  if (!model || !model.aspectRatios || model.aspectRatios.length === 0) return null;

  const buttons = model.aspectRatios.map((ratio) => ({
    text: ratio,
    callback_data: `ratio:${modelId}:${versionId}:${ratio}`,
  }));

  // Группируем по 3 в ряд
  const rows = [];
  for (let i = 0; i < buttons.length; i += 3) {
    rows.push(buttons.slice(i, i + 3));
  }

  rows.push([{ text: '⬅️ Назад', callback_data: `model:${modelId}` }]);

  return {
    reply_markup: { inline_keyboard: rows },
  };
}

/**
 * Выбор длительности видео (только для Seedance).
 *
 * @param {string} modelId
 * @param {string} versionId
 * @param {string} aspectRatio
 */
function durationKeyboard(modelId, versionId, aspectRatio) {
  const model = getModel(modelId);
  if (!model || !model.durationOptions) return null;

  const buttons = model.durationOptions.map((dur) => ({
    text: `${dur} сек`,
    callback_data: `dur:${modelId}:${versionId}:${aspectRatio}:${dur}`,
  }));

  return {
    reply_markup: {
      inline_keyboard: [
        buttons,
        [{ text: '⬅️ Назад', callback_data: `ratio:back:${modelId}:${versionId}` }],
      ],
    },
  };
}

/**
 * Клавиатура шаблонов Face Swap.
 *
 * @param {Array} templates
 */
function faceSwapTemplatesKeyboard(templates) {
  const buttons = templates.map((t) => [
    { text: `${t.name} (${t.cost} CR)`, callback_data: `fs:template:${t.id}` },
  ]);

  buttons.push([{ text: '⬅️ Назад', callback_data: 'back:main' }]);

  return {
    reply_markup: { inline_keyboard: buttons },
  };
}

module.exports = {
  mainMenuKeyboard,
  modelsKeyboard,
  versionsKeyboard,
  aspectRatioKeyboard,
  durationKeyboard,
  faceSwapTemplatesKeyboard,
};
