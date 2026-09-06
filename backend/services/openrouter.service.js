/**
 * OpenRouter Service — текстовые модели (GPT-4o, Claude, Gemini, Llama).
 *
 * OpenRouter API совместим с OpenAI Chat Completions.
 * Синхронный ответ — не требует webhook.
 */
const axios = require('axios');
const { AIProviderError } = require('../middleware/errorHandler');

const BASE_URL = 'https://openrouter.ai/api/v1';

class OpenRouterService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    if (!this.apiKey) {
      console.warn('[OpenRouter] ⚠ OPENROUTER_API_KEY не задан в .env');
    }
  }

  /**
   * Генерация текста через OpenRouter.
   *
   * @param {object} params
   * @param {string} params.slug — slug модели (e.g. 'openai/gpt-4o')
   * @param {string} params.prompt — промпт пользователя
   * @param {object} [params.options] — доп. параметры
   * @param {string} [params.options.systemPrompt] — системное сообщение
   * @param {number} [params.options.maxTokens=1000] — макс. токенов
   * @param {number} [params.options.temperature=0.7]
   * @returns {Promise<{text: string, usage: object}>}
   */
  async generate({ slug, prompt, options = {} }) {
    const {
      systemPrompt = 'Ты — полезный ИИ-ассистент MorphAI. Отвечай по-русски, если пользователь пишет на русском.',
      maxTokens = 1000,
      temperature = 0.7,
    } = options;

    try {
      const response = await axios.post(
        `${BASE_URL}/chat/completions`,
        {
          model: slug,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: maxTokens,
          temperature,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://morphai.app',
            'X-Title': 'MorphAI',
          },
          timeout: 60000, // 60 сек таймаут
        }
      );

      const data = response.data;
      const text = data.choices?.[0]?.message?.content || '';
      const usage = data.usage || {};

      return {
        text,
        usage,
        model: data.model || slug,
      };
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message;
      throw new AIProviderError('openrouter', `OpenRouter API ошибка: ${message}`);
    }
  }
}

module.exports = OpenRouterService;
