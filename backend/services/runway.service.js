/**
 * Runway Service — видео генерация через RunwayML SDK.
 *
 * Асинхронный workflow:
 * 1. client.imageToVideo.create() → task.id
 * 2. Полим client.tasks.retrieve(taskId) до SUCCEEDED
 *
 * Модель: Gen-4 Turbo (gen4_turbo) — Gen-3 Alpha retired в июле 2026.
 */
const { AIProviderError } = require('../middleware/errorHandler');

class RunwayService {
  constructor() {
    this.apiKey = process.env.RUNWAYML_API_KEY;
    this.client = null;

    if (!this.apiKey) {
      console.warn('[Runway] ⚠ RUNWAYML_API_KEY не задан в .env');
    }
  }

  /**
   * Ленивая инициализация SDK (ES module).
   * @private
   */
  async _getClient() {
    if (!this.client) {
      try {
        // @runwayml/sdk — ES module, нужен dynamic import
        const RunwayML = (await import('@runwayml/sdk')).default;
        this.client = new RunwayML({
          apiKey: this.apiKey,
        });
      } catch (error) {
        throw new AIProviderError('runway', `RunwayML SDK не удалось инициализировать: ${error.message}`);
      }
    }
    return this.client;
  }

  /**
   * Создать задачу генерации видео.
   *
   * @param {object} params
   * @param {string} params.slug — 'gen4_turbo'
   * @param {string} params.prompt — описание видео
   * @param {object} [params.options]
   * @param {string} [params.options.aspect_ratio='16:9']
   * @param {string} [params.options.image_url] — исходное изображение (image-to-video)
   * @returns {Promise<{taskId: string, status: string}>}
   */
  async generate({ slug, prompt, options = {} }) {
    const { aspect_ratio = '16:9', image_url } = options;

    try {
      const client = await this._getClient();

      // Маппинг aspect_ratio под строгие требования RunwayML
      let ratio = '1280:720';
      if (aspect_ratio === '9:16') ratio = '720:1280';
      else if (aspect_ratio === '1:1') ratio = '960:960';
      else if (aspect_ratio === '16:9') ratio = '1280:720';

      const promptImage = image_url || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1280&auto=format&fit=crop';

      const task = await client.imageToVideo.create({
        model: 'gen4_turbo',
        promptImage: promptImage,
        promptText: prompt,
        ratio: ratio,
      });

      return {
        taskId: task.id,
        status: 'pending',
      };
    } catch (error) {
      throw new AIProviderError('runway', `RunwayML ошибка: ${error.message}`);
    }
  }

  /**
   * Проверить статус задачи.
   *
   * @param {string} taskId
   * @returns {Promise<{status: string, resultUrl: string|null}>}
   */
  async checkStatus(taskId) {
    try {
      const client = await this._getClient();
      const task = await client.tasks.retrieve(taskId);

      const statusMap = {
        'PENDING': 'pending',
        'RUNNING': 'processing',
        'SUCCEEDED': 'completed',
        'FAILED': 'failed',
      };

      return {
        status: statusMap[task.status] || 'pending',
        resultUrl: task.status === 'SUCCEEDED' ? (task.output?.[0] || null) : null,
      };
    } catch (error) {
      throw new AIProviderError('runway', `RunwayML status ошибка: ${error.message}`, taskId);
    }
  }
}

module.exports = RunwayService;
