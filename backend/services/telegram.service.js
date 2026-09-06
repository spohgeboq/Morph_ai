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
   * Отправить фото.
   * @private
   */
  async _sendPhoto(chatId, photoUrl, modelName, prompt) {
    const caption = `🎨 *${modelName}*\n📝 ${this._truncate(prompt, 200)}`;
    await this.bot.sendPhoto(chatId, photoUrl, {
      caption,
      parse_mode: 'Markdown',
    });
  }

  /**
   * Отправить видео.
   * @private
   */
  async _sendVideo(chatId, videoUrl, modelName, prompt) {
    const caption = `🎬 *${modelName}*\n📝 ${this._truncate(prompt, 200)}`;
    await this.bot.sendVideo(chatId, videoUrl, {
      caption,
      parse_mode: 'Markdown',
      supports_streaming: true,
    });
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
