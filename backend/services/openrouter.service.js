/**
 * OpenRouter Service — литературные ИИ-рассказчики (Сказки, Мистика, Sci-Fi, Эпос).
 *
 * OpenRouter API совместим с OpenAI Chat Completions.
 * Каждая модель обладает своим литературным амплуа (Role).
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
   * Сформировать системный промпт в зависимости от роли модели.
   * @private
   */
  _buildStorytellerSystemPrompt(slug = '', options = {}) {
    const s = slug.toLowerCase();
    const { story_length = 'short', character_name } = options;

    const lengthInstruction = story_length === 'long' 
      ? 'Напиши развернутую, богатую деталями главу с глубоким погружением в окружение, диалогами и психологизмом героев (около 450-650 слов).'
      : 'Напиши емкую, цельную и выразительную историю с законченным сюжетом, читающуюся за 2-3 минуты (около 250-350 слов).';

    const characterGuidance = character_name && character_name.trim()
      ? `\nГлавные действующие лица / персонажи: «${character_name.trim()}». Обязательно сделай их ключевыми участниками сюжета, раскрыв их характеры, поступки и внутренний мир.\n`
      : '';

    const languageGuidance = `
Язык ответа:
Пиши историю СТРОГО на том же языке, на котором написан запрос пользователя (User Prompt). Если запрос на английском — пиши на английском, если на казахском — пиши на казахском, если на русском — пиши на русском. Категорически запрещено отвечать на русском языке, если запрос пользователя написан на другом языке!`;

    const endingsGuidance = `
Важнейшее правило финала:
Не навязывай шаблонный счастливый конец. Пиши как в настоящей классической и современной литературе. Финал может быть печальным, задумчивым, горьким, меланхоличным, светлым или драматичным — таким, какого требует внутренняя логика и глубина истории. 
Категорически запрещены: приторные слащавые хеппи-энды, шаблонные нравоучения и фразы в стиле "Главная мысль сказки" или "И жили они долго и счастливо". Пусть концовка оставляет глубокое эмоциональное и философское послевкусие.`;

    if (s.includes('claude')) {
      return `Ты — выдающийся Мастер Мистики и Тайн MorphAI.
Твоя роль — создавать атмосферные, психологически тонкие и загадочные мистические истории в духе Эдгара По, Говарда Лавкрафта и Нила Геймана.
Правила:
1. Придумай интригующий заголовок в первой строке (без кавычек).
2. Погружай читателя в плотную атмосферу неизведанного, тонких психологических тревог, старинных тайн и игры теней.${characterGuidance}
3. ${lengthInstruction}
4. Пиши богатым, кинематографичным языком без эмодзи. Разделяй текст на аккуратные абзацы.
5. ${endingsGuidance}
6. ${languageGuidance}`;
    }

    if (s.includes('gemini')) {
      return `Ты — Летописец Хроник Будущего и Научной Фантастики MorphAI.
Твоя роль — создавать масштабные, философские Sci-Fi повести в духе братьев Стругацких, Станислава Лема, Артура Кларка и Филипа Дика.
Правила:
1. Придумай футуристический заголовок в первой строке (без кавычек).
2. Описывай парадоксы времени, контакт с чуждым разумом, киберпанк, цену прогресса и внутреннее одиночество человека среди звезд.${characterGuidance}
3. ${lengthInstruction}
4. Пиши выразительным литературным языком без эмодзи. Разделяй текст на аккуратные абзацы.
5. ${endingsGuidance}
6. ${languageGuidance}`;
    }

    if (s.includes('llama')) {
      return `Ты — Мастер Героического Эпоса и Приключений MorphAI.
Твоя роль — слагать захватывающие саги об опасных экспедициях, суровых испытаниях, поисках сокровищ и древних воинах в духе Джека Лондона, Роберта Говарда и Анджея Сапковского.
Правила:
1. Придумай звучный заголовок в первой строке (без кавычек).
2. Держи читателя в напряжении: суровая стихия, цена выбора, отвага перед лицом неизбежного и дух подлинных странствий.${characterGuidance}
3. ${lengthInstruction}
4. Пиши динамичным, честным и живым языком без эмодзи. Разделяй текст на аккуратные абзацы.
5. ${endingsGuidance}
6. ${languageGuidance}`;
    }

    // Default: GPT-4o — Хранитель Сказок и Притч
    return `Ты — Хранитель Волшебных Сказок и Мудрых Притч MorphAI.
Твоя роль — сочинять сказки и притчи в традициях Ганса Христиана Андерсена, Оскара Уайльда, Антуана де Сент-Экзюпери и Дж. Р. Р. Толкина.
Правила:
1. Придумай поэтичное название сказки или притчи в первой строке (без кавычек).
2. Создай живой, дышащий мир. Вплетай темы преданности, самопожертвования, мимолетности времени, незримой красоты и хрупкости чуда.${characterGuidance}
3. ${lengthInstruction}
4. Пиши образным, чарующим сказочным языком без эмодзи. Разделяй повествование на аккуратные абзацы.
5. ${endingsGuidance}
6. ${languageGuidance}`;
  }

  /**
   * Генерация текста через OpenRouter.
   *
   * @param {object} params
   * @param {string} params.slug — slug модели (e.g. 'openai/gpt-4o')
   * @param {string} params.prompt — промпт пользователя
   * @param {object} [params.options] — доп. параметры
   * @param {string} [params.options.systemPrompt] — кастомный системный промпт (если передан)
   * @param {number} [params.options.maxTokens=2000] — макс. токенов
   * @param {number} [params.options.temperature=0.75]
   * @returns {Promise<{text: string, usage: object}>}
   */
  async generate({ slug, prompt, options = {} }) {
    const systemPrompt = options.systemPrompt || this._buildStorytellerSystemPrompt(slug, options);
    const maxTokens = options.maxTokens || 2000;
    const temperature = options.temperature || 0.75;

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
          timeout: 60000,
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
