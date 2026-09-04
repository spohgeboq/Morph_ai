require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const Replicate = require('replicate');

const app = express();
app.use(cors());
app.use(express.json());

// Инициализация Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || 'mock',
});

// Проверка работы сервера
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MorphAI Backend is running' });
});

// Эндпоинт для генерации текста
app.post('/api/generate/text', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Пока мокаем ответ, если нет реального токена.
    // В реальном приложении здесь будет вызов replicate.run(...)
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.json({ result: `[MOCK] Сгенерированный текст для: "${prompt}"` });
    }

    // Пример вызова Replicate (Llama)
    const output = await replicate.run(
      "meta/llama-2-70b-chat",
      {
        input: {
          prompt: prompt,
          max_new_tokens: 500
        }
      }
    );

    res.json({ result: output.join('') });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

// Эндпоинт для генерации изображений
app.post('/api/generate/image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.json({ result: `https://placehold.co/512x512/800020/FFFFFF?text=Mock+Image` });
    }

    // Пример вызова Replicate (SDXL)
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: prompt
        }
      }
    );

    res.json({ result: output[0] });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
