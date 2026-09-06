/**
 * Upload Router — эндпоинты для загрузки файлов в Cloudflare R2.
 *
 * POST /api/upload — загрузка одного файла (фото/видео/документ)
 * POST /api/upload/multiple — пакетная загрузка нескольких файлов
 */
const express = require('express');
const multer = require('multer');
const router = express.Router();
const storage = require('../services/storage.service');
const { ValidationError } = require('../middleware/errorHandler');

// Настройка Multer для работы в памяти (streaming прямо в R2)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // макс. 50 MB
  },
  fileFilter: (req, file, cb) => {
    // Разрешенные форматы
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError(`Неподдерживаемый тип файла: ${file.mimetype}. Разрешены JPG, PNG, WEBP, MP4, WEBM`));
    }
  },
});

/**
 * POST /api/upload — загрузка одного файла
 *
 * FormData:
 * - file: File
 * - folder?: string (e.g. 'faceswap', 'avatars', 'references')
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('Файл не передан в поле "file"');
    }

    const folder = req.body.folder || 'uploads';

    const result = await storage.uploadBuffer({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      folder,
      originalName: req.file.originalname,
    });

    res.json({
      success: true,
      file: {
        url: result.url,
        key: result.key,
        originalName: req.file.originalname,
        size: result.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/upload/multiple — пакетная загрузка до 5 файлов
 *
 * FormData:
 * - files: File[]
 * - folder?: string
 */
router.post('/multiple', upload.array('files', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new ValidationError('Файлы не переданы в поле "files"');
    }

    const folder = req.body.folder || 'uploads';
    const uploadPromises = req.files.map(async (file) => {
      const result = await storage.uploadBuffer({
        buffer: file.buffer,
        mimeType: file.mimetype,
        folder,
        originalName: file.originalname,
      });

      return {
        url: result.url,
        key: result.key,
        originalName: file.originalname,
        size: result.size,
        mimeType: file.mimetype,
      };
    });

    const files = await Promise.all(uploadPromises);

    res.json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
