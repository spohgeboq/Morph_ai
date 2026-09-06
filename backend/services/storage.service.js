/**
 * Storage Service — интеграция с Cloudflare R2 (S3-compatible Object Storage).
 *
 * Обеспечивает:
 * - Загрузку файлов (Buffer, Stream, URL) в постоянное защищённое хранилище
 * - Генерацию публичных HTTPS ссылок для провайдеров нейросетей (PiAPI, Runway)
 * - Удаление временных или устаревших файлов
 */
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class StorageService {
  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME || 'morphai';
    this.publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
    this.endpoint = process.env.R2_ENDPOINT;

    if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      console.warn('[Storage/R2] ⚠ Cloudflare R2 ключи не заданы в .env!');
      this.client = null;
      return;
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    console.log(`[Storage/R2] ✓ Cloudflare R2 подключён (Bucket: ${this.bucketName})`);
  }

  /**
   * Проверить, инициализирован ли клиент хранилища
   */
  isReady() {
    return Boolean(this.client && this.bucketName && this.publicUrl);
  }

  /**
   * Загрузить Buffer в R2.
   *
   * @param {object} params
   * @param {Buffer} params.buffer - Буфер файла
   * @param {string} [params.mimeType='application/octet-stream'] - MIME тип (image/png, video/mp4, etc.)
   * @param {string} [params.folder='uploads'] - Папка в bucket (e.g. 'avatars', 'faceswap', 'generations')
   * @param {string} [params.originalName] - Исходное имя файла для определения расширения
   * @returns {Promise<{success: boolean, url: string, key: string, size: number}>}
   */
  async uploadBuffer({ buffer, mimeType = 'application/octet-stream', folder = 'uploads', originalName }) {
    if (!this.isReady()) {
      throw new Error('Cloudflare R2 хранилище не настроено (проверьте .env)');
    }

    let ext = '';
    if (originalName) {
      ext = path.extname(originalName).toLowerCase();
    } else if (mimeType.includes('/')) {
      const sub = mimeType.split('/')[1].toLowerCase();
      ext = sub === 'jpeg' ? '.jpg' : `.${sub}`;
    }

    const fileId = `${Date.now()}_${uuidv4().slice(0, 8)}${ext}`;
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const key = cleanFolder ? `${cleanFolder}/${fileId}` : fileId;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await this.client.send(command);

    const filePublicUrl = `${this.publicUrl}/${key}`;

    return {
      success: true,
      url: filePublicUrl,
      key,
      size: buffer.length,
    };
  }

  /**
   * Загрузить файл по внешнему URL в R2 (например, фото из Telegram Bot API).
   *
   * @param {object} params
   * @param {string} params.sourceUrl - Внешний URL файла для скачивания
   * @param {string} [params.folder='uploads'] - Целевая папка
   * @returns {Promise<{success: boolean, url: string, key: string, size: number}>}
   */
  async uploadFromUrl({ sourceUrl, folder = 'uploads' }) {
    if (!this.isReady()) {
      throw new Error('Cloudflare R2 хранилище не настроено');
    }

    const response = await axios.get(sourceUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    const buffer = Buffer.from(response.data);
    const mimeType = response.headers['content-type'] || 'image/jpeg';

    return await this.uploadBuffer({
      buffer,
      mimeType,
      folder,
      originalName: path.basename(sourceUrl.split('?')[0]),
    });
  }

  /**
   * Удалить файл из R2 по ключу.
   *
   * @param {string} key - Ключ файла в bucket (например, 'uploads/123_abc.jpg')
   * @returns {Promise<boolean>}
   */
  async deleteFile(key) {
    if (!this.isReady() || !key) return false;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch (err) {
      console.error(`[Storage/R2] Ошибка удаления ${key}:`, err.message);
      return false;
    }
  }

  /**
   * Проверить существование файла в bucket.
   *
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async fileExists(key) {
    if (!this.isReady() || !key) return false;

    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
      return true;
    } catch (err) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw err;
    }
  }
}

module.exports = new StorageService();
