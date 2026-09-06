/**
 * FaceSwap Service — замена лица через PiAPI Face Swap API.
 *
 * Асинхронный workflow:
 * 1. POST /api/face_swap/v1/async → task_id
 * 2. POST /api/face_swap/v1/fetch → результат
 */
const axios = require('axios');
const { AIProviderError } = require('../middleware/errorHandler');

const BASE_URL = 'https://api.piapi.ai';

class FaceSwapService {
  constructor() {
    this.apiKey = process.env.PIAPI_API_KEY;
    if (!this.apiKey) {
      console.warn('[FaceSwap] ⚠ PIAPI_API_KEY не задан в .env');
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
   * Запустить Face Swap (фото или видео).
   *
   * @param {object} params
   * @param {string} params.targetUrl — URL эталонного видео/фото (из шаблона)
   * @param {string} params.faceUrl — URL селфи пользователя
   * @param {string} [params.targetType='video'] — 'video' | 'photo'
   * @returns {Promise<{taskId: string, status: string}>}
   */
  async generate({ targetUrl, faceUrl, targetType = 'video' }) {
    try {
      const payload = {
        target_image: targetUrl,
        swap_image: faceUrl,
      };

      // Для видео используем отдельный эндпоинт
      const endpoint = targetType === 'video'
        ? '/api/face_swap/v1/async'
        : '/api/face_swap/v1/async';

      const response = await this.client.post(endpoint, payload);

      const data = response.data;
      return {
        taskId: data.data?.task_id || data.task_id,
        status: 'pending',
      };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      throw new AIProviderError('piapi', `FaceSwap ошибка: ${message}`);
    }
  }

  /**
   * Проверить статус Face Swap задачи.
   *
   * @param {string} taskId
   * @returns {Promise<{status: string, resultUrl: string|null}>}
   */
  async checkStatus(taskId) {
    try {
      const response = await this.client.post('/api/face_swap/v1/fetch', {
        task_id: taskId,
      });

      const data = response.data?.data || response.data;

      const statusMap = {
        'pending': 'pending',
        'processing': 'processing',
        'completed': 'completed',
        'success': 'completed',
        'failed': 'failed',
        'error': 'failed',
      };

      const status = statusMap[data.status?.toLowerCase()] || 'pending';
      const resultUrl = data.output?.image_url || data.output?.video_url || data.output?.url || null;

      return { status, resultUrl };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      throw new AIProviderError('piapi', `FaceSwap fetch ошибка: ${message}`, taskId);
    }
  }
}

module.exports = FaceSwapService;
