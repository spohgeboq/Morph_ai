/**
 * Telegram Service — отправка результатов генерации пользователям в Telegram.
 *
 * Обёртка над node-telegram-bot-api для типизированной отправки медиа.
 */

class TelegramService {
  /**
   * @param {import('node-telegram-bot-api')} bot — экземпляр бота
   */
  constructor(bot) {
    this.bot = bot;
  }

  /**
   * Отправить результат генерации пользователю.
   *
   * @param {number} chatId — Telegram chat_id
   * @param {object} generation — запись из таблицы generations
   */
  async sendResult(chatId, generation) {
    try {
      const { task_type, result_url, result_text, model_name, prompt } = generation;

      switch (task_type) {
        case 'text':
          await this._sendText(chatId, result_text, model_name);
          break;
        case 'photo':
          await this._sendPhoto(chatId, result_url, model_name, prompt);
          break;
        case 'video':
        case 'faceswap':
          await this._sendVideo(chatId, result_url, model_name, prompt);
          break;
        default:
          await this.bot.sendMessage(chatId, `✅ Результат готов: ${result_url || result_text}`);
      }
    } catch (error) {
      console.error(`[Telegram] Ошибка отправки результата в чат ${chatId}:`, error.message);
      // Пытаемся хотя бы отправить ссылку текстом
      try {
        await this.bot.sendMessage(
          chatId,
          `✅ Ваш результат готов!\n\n🔗 ${result_url || 'Результат доступен в профиле'}`
        );
      } catch (fallbackError) {
        console.error('[Telegram] Fallback отправка тоже не удалась:', fallbackError.message);
      }
    }
  }

  /**
   * Отправить текстовый результат.
   * @private
   */
  async _sendText(chatId, text, modelName) {
    const header = `✨ *Результат от ${modelName}*\n\n`;
    const fullText = header + text;

    // Telegram ограничивает сообщение до 4096 символов
    if (fullText.length <= 4096) {
      await this.bot.sendMessage(chatId, fullText, { parse_mode: 'Markdown' });
    } else {
      // Разбиваем на части
      const chunks = this._splitText(fullText, 4000);
      for (const chunk of chunks) {
        await this.bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
      }
    }
  }

  /**
   * Отправить фото (сначала документ без сжатия, затем превью с промптом и кнопкой).
   * @private
   */
  async _sendPhoto(chatId, photoUrl, modelName, prompt) {
    const axios = require('axios');
    const path = require('path');
    const fileName = this._resolveFileName(photoUrl, 'image.png');
    const caption = `<b>Промпт:</b>\n<blockquote>${this._escapeHtml(prompt || 'Без промпта')}</blockquote>`;
    const replyMarkup = this._getAppKeyboard();

    // 1. Отправляем как файл (без сжатия)
    try {
      await this.bot.sendDocument(chatId, photoUrl, {}, { filename: fileName });
    } catch (docErr) {
      console.warn(`[Telegram] sendDocument via URL не удался (${docErr.message}), пробуем через буфер...`);
      try {
        const resp = await axios.get(photoUrl, { responseType: 'arraybuffer', timeout: 30000 });
        const buffer = Buffer.from(resp.data);
        await this.bot.sendDocument(chatId, buffer, {}, { filename: fileName });
      } catch (bufErr) {
        console.warn(`[Telegram] sendDocument через буфер тоже не удался:`, bufErr.message);
      }
    }

    // 2. Отправляем как фото с превью, стильным оформлением промпта и кнопкой
    try {
      await this.bot.sendPhoto(chatId, photoUrl, {
        caption,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      });
    } catch (photoErr) {
      console.warn(`[Telegram] sendPhoto via URL не удался (${photoErr.message}), пробуем через буфер...`);
      try {
        const resp = await axios.get(photoUrl, { responseType: 'arraybuffer', timeout: 30000 });
        const buffer = Buffer.from(resp.data);
        await this.bot.sendPhoto(chatId, buffer, {
          caption,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        });
      } catch (photoBufErr) {
        console.error(`[Telegram] sendPhoto через буфер не удался:`, photoBufErr.message);
        // Резервная отправка текстового сообщения с ссылкой
        await this.bot.sendMessage(chatId, `${caption}\n\n🔗 ${photoUrl}`, {
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        });
      }
    }
  }

  /**
   * Отправить видео (сначала файл без сжатия, затем плеер с промптом и кнопкой).
   * @private
   */
  async _sendVideo(chatId, videoUrl, modelName, prompt) {
    const axios = require('axios');
    const path = require('path');
    const fileName = this._resolveFileName(videoUrl, 'video.mp4');
    const caption = `<b>Промпт:</b>\n<blockquote>${this._escapeHtml(prompt || 'Без промпта')}</blockquote>`;
    const replyMarkup = this._getAppKeyboard();

    // 1. Отправляем как документ (файл)
    try {
      await this.bot.sendDocument(chatId, videoUrl, {}, { filename: fileName });
    } catch (docErr) {
      console.warn(`[Telegram] sendDocument видео via URL не удался:`, docErr.message);
      try {
        const resp = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000 });
        const buffer = Buffer.from(resp.data);
        await this.bot.sendDocument(chatId, buffer, {}, { filename: fileName });
      } catch (bufErr) {
        console.warn(`[Telegram] sendDocument видео через буфер не удался:`, bufErr.message);
      }
    }

    // 2. Отправляем как видеоплеер
    try {
      await this.bot.sendVideo(chatId, videoUrl, {
        caption,
        parse_mode: 'HTML',
        supports_streaming: true,
        reply_markup: replyMarkup,
      });
    } catch (videoErr) {
      console.warn(`[Telegram] sendVideo via URL не удался:`, videoErr.message);
      try {
        const resp = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000 });
        const buffer = Buffer.from(resp.data);
        await this.bot.sendVideo(chatId, buffer, {
          caption,
          parse_mode: 'HTML',
          supports_streaming: true,
          reply_markup: replyMarkup,
        });
      } catch (videoBufErr) {
        console.error(`[Telegram] sendVideo через буфер не удался:`, videoBufErr.message);
        await this.bot.sendMessage(chatId, `${caption}\n\n🎬 ${videoUrl}`, {
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        });
      }
    }
  }

  /**
   * Кнопка открытия веб-приложения.
   * @private
   */
  _getAppKeyboard() {
    const appUrl = process.env.TELEGRAM_WEBAPP_URL || process.env.CLIENT_URL || 'https://t.me/morphai_app_bot';
    return {
      inline_keyboard: [
        [
          {
            text: '🔗 Посмотреть в приложении',
            url: appUrl.startsWith('http') ? appUrl : 'https://t.me/morphai_app_bot',
          },
        ],
      ],
    };
  }

  /**
   * Экранирование HTML для Telegram Bot API.
   * @private
   */
  _escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Получить имя файла из URL.
   * @private
   */
  _resolveFileName(url, defaultName) {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/');
      const last = parts[parts.length - 1];
      if (last && last.includes('.')) {
        return last;
      }
    } catch (e) {}
    return `${Date.now()}_${defaultName}`;
  }

  /**
   * Отправить сообщение об ошибке.
   *
   * @param {number} chatId
   * @param {string} errorMessage
   * @param {number} refundedCredits
   */
  async sendError(chatId, errorMessage, refundedCredits = 0) {
    let message = `❌ Произошла ошибка при генерации.\n\n`;
    message += `💬 ${errorMessage}\n`;
    if (refundedCredits > 0) {
      message += `\n✅ ${refundedCredits} кредитов возвращены на ваш баланс.`;
    }
    message += `\nПопробуйте ещё раз позже.`;

    await this.bot.sendMessage(chatId, message);
  }

  /**
   * Отправить уведомление о начале генерации.
   *
   * @param {number} chatId
   * @param {string} modelName
   * @param {string} taskType
   */
  async sendProcessing(chatId, modelName, taskType) {
    const typeNames = {
      text: 'текст',
      photo: 'фото',
      video: 'видео',
      faceswap: 'Face Swap',
    };
    const typeName = typeNames[taskType] || taskType;
    await this.bot.sendMessage(
      chatId,
      `⏳ Генерирую ${typeName} с помощью *${modelName}*...\nЭто может занять несколько минут.`,
      { parse_mode: 'Markdown' }
    );
  }

  /**
   * Разбить длинный текст на части.
   * @private
   */
  _splitText(text, maxLength) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      chunks.push(text.substring(start, start + maxLength));
      start += maxLength;
    }
    return chunks;
  }

  /**
   * Обрезать строку.
   * @private
   */
  _truncate(str, maxLen) {
    if (!str) return '';
    return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
  }
}

module.exports = TelegramService;
