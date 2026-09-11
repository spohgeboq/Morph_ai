/**
 * Runway Service — видео генерация через официальный RunwayML API.
 *
 * Поддерживает:
 * 1. Text-to-Video: /v1/text_to_video с моделью 'gen4.5'
 * 2. Image-to-Video: /v1/image_to_video с моделью 'gen4_turbo' (если передан image_url)
 * 3. Polling: client.tasks.retrieve(taskId)
 * 4. Авто-сохранение в Cloudflare R2 при готовности видео
 */
const { AIProviderError } = require('../middleware/errorHandler');
const storageService = require('./storage.service');

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
   * @param {string} params.slug — 'gen4_turbo' или 'gen4.5'
   * @param {string} params.prompt — описание видео
   * @param {object} [params.options]
   * @param {string} [params.options.aspect_ratio='16:9']
   * @param {number} [params.options.duration=5]
   * @param {string} [params.options.image_url] — исходное изображение (image-to-video)
   * @returns {Promise<{taskId: string, status: string}>}
   */
  async generate({ slug, prompt, options = {} }) {
    const { aspect_ratio = '16:9', image_url, duration: rawDuration } = options;

    try {
      const client = await this._getClient();

      // Строгий маппинг: Runway API поддерживает ТОЛЬКО "1280:720" (16:9) или "720:1280" (9:16)
      let ratio = '1280:720';
      if (aspect_ratio === '9:16') {
        ratio = '720:1280';
      } else {
        ratio = '1280:720';
      }

      // Длительность в секундах: Runway строго принимает 5 или 10
      const duration = (rawDuration && Number(rawDuration) >= 10) ? 10 : 5;

      // 1. Поддержка новой модели Veo 3.1 от Google через Runway API
      if (slug === 'veo3.1' || slug.startsWith('veo')) {
        const baseUrl = process.env.RUNWAYML_BASE_URL || 'https://api.dev.runwayml.com';
        const runwayHeaders = {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-11-06',
        };

        let endpoint;
        let requestBody;

        if (image_url) {
          endpoint = `${baseUrl}/v1/image_to_video`;
          requestBody = {
            promptText: prompt,
            promptImage: [
              {
                uri: image_url,
                position: 'first',
              },
            ],
            model: 'veo3.1',
            ratio: ratio,
            duration: 4,
          };
        } else {
          endpoint = `${baseUrl}/v1/text_to_video`;
          requestBody = {
            promptText: prompt,
            model: 'veo3.1',
            ratio: ratio,
            duration: 4,
          };
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: runwayHeaders,
          body: JSON.stringify(requestBody),
        });

        const data = await res.json();
        if (!res.ok) {
          const errMsg = data?.error || data?.message || JSON.stringify(data);
          throw new Error(`Runway Veo 3.1 API error (${res.status}): ${errMsg}`);
        }

        const taskId = data.id || data.taskId || data.task_id;
        console.log(`[Runway] ✓ Задача Veo 3.1 создана: ${taskId} (ratio: ${ratio}, duration: 4s)`);
        return {
          taskId,
          status: 'pending',
        };
      }

      // 2. Стандартный режим GenAi (Runway Gen-4 / Turbo / Gen-3) — без изменений
      let task;

      if (image_url) {
        // Режим Image-to-Video
        task = await client.imageToVideo.create({
          model: 'gen4_turbo',
          promptImage: image_url,
          promptText: prompt,
          ratio: ratio,
          duration: duration,
        });
      } else {
        // Режим Text-to-Video через официальный эндпоинт Runway v1/text_to_video
        task = await client.post('/v1/text_to_video', {
          body: {
            promptText: prompt,
            model: 'gen4.5',
            ratio: ratio,
            duration: duration,
          },
        });
      }

      console.log(`[Runway] ✓ Задача генерации видео создана: ${task.id} (ratio: ${ratio}, duration: ${duration}s)`);

      return {
        taskId: task.id,
        status: 'pending',
      };
    } catch (error) {
      console.error('[Runway] Ошибка запуска задачи:', error.message);
      const detail = error.response?.data?.error || error.message;
      throw new AIProviderError('runway', `RunwayML ошибка: ${detail}`);
    }
  }

  /**
   * Проверить статус задачи.
   *
   * @param {string} taskId
   * @returns {Promise<{status: string, resultUrl: string|null, errorMessage: string|null}>}
   */
  async checkStatus(taskId) {
    try {
      let task;
      try {
        const client = await this._getClient();
        task = await client.tasks.retrieve(taskId);
      } catch (sdkErr) {
        const baseUrl = process.env.RUNWAYML_BASE_URL || 'https://api.dev.runwayml.com';
        const res = await fetch(`${baseUrl}/v1/tasks/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Runway-Version': '2024-11-06',
          },
        });
        if (res.ok) {
          task = await res.json();
        } else {
          throw sdkErr;
        }
      }

      const statusMap = {
        'PENDING': 'pending',
        'RUNNING': 'processing',
        'SUCCEEDED': 'completed',
        'FAILED': 'failed',
        'CANCELLED': 'failed',
      };

      const mappedStatus = statusMap[task.status] || 'pending';
      const outputUrl = task.status === 'SUCCEEDED' ? (task.output?.[0] || null) : null;
      let finalUrl = outputUrl;

      // При успехе сохраняем результат в постоянное хранилище Cloudflare R2
      if (mappedStatus === 'completed' && outputUrl && storageService.isReady()) {
        try {
          const uploaded = await storageService.uploadFromUrl({
            sourceUrl: outputUrl,
            folder: 'generations/video',
          });
          if (uploaded?.url) {
            finalUrl = uploaded.url;
            console.log(`[Runway] ✓ Видео ${taskId} сохранено в R2: ${finalUrl}`);
          }
        } catch (r2Err) {
          console.warn(`[Runway] Ошибка сохранения в R2 для ${taskId}, оставляем временный URL:`, r2Err.message);
        }
      }

      const errorMessage = task.status === 'FAILED'
        ? (task.failure || (task.failureCode ? `Runway код: ${task.failureCode}` : 'Сбой генерации на стороне провайдера'))
        : null;

      return {
        status: mappedStatus,
        resultUrl: finalUrl,
        errorMessage,
      };
    } catch (error) {
      throw new AIProviderError('runway', `RunwayML status ошибка: ${error.message}`, taskId);
    }
  }
}

module.exports = RunwayService;
