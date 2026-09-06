/**
 * PiAPI Service — фото и видео генерация.
 *
 * Асинхронный workflow:
 * 1. POST задачу → получаем task_id
 * 2. Ждём webhook ИЛИ полим статус
 *
 * Покрывает: Flux, DALL-E 3, Imagen 3, Wan Image, Nano Banana, Seedream,
 *            Kling, Hailuo, Luma, Seedance
 */
const axios = require('axios');
const { AIProviderError } = require('../middleware/errorHandler');

const BASE_URL = 'https://api.piapi.ai';

class PiAPIService {
  constructor() {
    this.apiKey = process.env.PIAPI_API_KEY;
    if (!this.apiKey) {
      console.warn('[PiAPI] ⚠ PIAPI_API_KEY не задан в .env');
    }
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Создать задачу генерации.
   *
   * @param {object} params
   * @param {string} params.slug — slug модели
   * @param {string} params.prompt — промпт
   * @param {object} [params.options]
   * @param {string} [params.options.aspect_ratio='1:1']
   * @param {number} [params.options.duration=6] — длительность видео в секундах
   * @param {string} [params.options.camera_motion]
   * @param {string[]} [params.options.reference_images]
   * @param {string} [params.options.webhook_url] — URL для получения результатов
   * @returns {Promise<{taskId: string, status: string}>}
   */
  async generate({ slug, prompt, options = {} }) {
    const {
      aspect_ratio = '1:1',
      duration = 6,
      camera_motion,
      reference_images = [],
      webhook_url,
    } = options;

    try {
      const { model, task_type, input } = this._resolvePiApiParams(slug, prompt, options);

      const payload = {
        model,
        task_type,
        input,
      };

      // Webhook URL для получения результата
      if (webhook_url) {
        payload.webhook_url = webhook_url;
      }

      const response = await this.client.post('/api/v1/task', payload);

      const data = response.data;
      return {
        taskId: data.data?.task_id || data.task_id,
        status: 'pending',
      };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      throw new AIProviderError('piapi', `PiAPI ошибка: ${message}`);
    }
  }

  /**
   * Разрешить параметры model, task_type и input под спецификацию PiAPI.
   * @private
   */
  _resolvePiApiParams(slug, prompt, options = {}) {
    const {
      aspect_ratio = '1:1',
      duration = 6,
      camera_motion,
      reference_images = [],
    } = options;

    let model = slug;
    let task_type = 'txt2img';
    let input = {
      prompt,
      aspect_ratio,
    };

    if (slug.startsWith('kling') || slug.includes('kling')) {
      model = 'kling';
      task_type = 'video_generation';
      const versionMatch = slug.match(/v([0-9.]+)/);
      input.version = versionMatch ? versionMatch[1] : '1.5';
      input.duration = duration || 6;
      input.mode = slug.includes('pro') || slug.includes('ultra') ? 'pro' : 'std';
      input.aspect_ratio = aspect_ratio || '16:9';
    } else if (slug.includes('hailuo') || slug.includes('minimax')) {
      model = 'hailuo';
      task_type = 'video_generation';
      input.duration = duration || 6;
      input.aspect_ratio = aspect_ratio || '16:9';
    } else if (slug.includes('luma')) {
      model = 'luma';
      task_type = 'video_generation';
      input.duration = duration || 6;
      input.aspect_ratio = aspect_ratio || '16:9';
    } else if (slug.includes('seedance')) {
      model = 'seedance';
      task_type = 'seedance-2.5';
      input.mode = 'text_to_video';
      input.duration = duration || 6;
      input.aspect_ratio = aspect_ratio || '16:9';
    } else if (slug.includes('wan')) {
      model = 'Qubico/wanx';
      task_type = 'txt2video-14b-lora';
      input.aspect_ratio = aspect_ratio || '16:9';
    } else if (slug.includes('flux')) {
      model = slug.includes('schnell') || slug.includes('lite') ? 'Qubico/flux1-schnell' : 'Qubico/flux1-dev';
      task_type = 'txt2img';
      input.aspect_ratio = aspect_ratio || '1:1';
    } else if (slug.includes('face-swap') || slug.includes('faceswap')) {
      model = 'Qubico/image-toolkit';
      task_type = 'face-swap';
      input = {
        target_image: reference_images[0] || options.target_image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop',
        swap_image: reference_images[1] || options.swap_image || reference_images[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop'
      };
    } else {
      model = slug;
      task_type = this._isVideoModel(slug) ? 'video_generation' : 'txt2img';
    }

    if (camera_motion && camera_motion !== 'static' && !slug.includes('face-swap')) {
      input.camera_motion = camera_motion;
    }
    if (reference_images.length > 0 && !slug.includes('face-swap')) {
      input.image_url = reference_images[0];
      if (reference_images.length > 1) {
        input.reference_images = reference_images;
      }
    }

    return { model, task_type, input };
  }

  /**
   * Проверить статус задачи (polling).
   *
   * @param {string} taskId
   * @returns {Promise<{status: string, output: object|null}>}
   */
  async checkStatus(taskId) {
    try {
      const response = await this.client.get(`/api/v1/task/${taskId}`);

      const data = response.data?.data || response.data;
      const status = this._mapStatus(data.status);

      return {
        status,
        output: data.output || null,
        resultUrl: data.output?.video || data.output?.image_url || data.output?.video_url || data.output?.url || null,
      };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      throw new AIProviderError('piapi', `PiAPI fetch ошибка: ${message}`, taskId);
    }
  }

  /**
   * Определить тип задачи по slug модели.
   * @private
   */
  _getTaskType(slug) {
    if (this._isVideoModel(slug)) return 'video_generation';
    return 'image_generation';
  }

  /**
   * Проверить, является ли модель видео-моделью.
   * @private
   */
  _isVideoModel(slug) {
    const videoSlugs = [
      'kling-video', 'minimax-hailuo', 'luma-', 'seedance',
    ];
    return videoSlugs.some((prefix) => slug.includes(prefix));
  }

  /**
   * Маппинг статусов PiAPI в наши статусы.
   * @private
   */
  _mapStatus(piApiStatus) {
    const statusMap = {
      'pending': 'pending',
      'processing': 'processing',
      'running': 'processing',
      'completed': 'completed',
      'success': 'completed',
      'failed': 'failed',
      'error': 'failed',
    };
    return statusMap[piApiStatus?.toLowerCase()] || 'pending';
  }
}

module.exports = PiAPIService;
