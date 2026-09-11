/**
 * Преобразование технического слага модели в красивое человекочитаемое имя для интерфейса
 */
export const formatModelDisplayName = (rawModel, taskType) => {
  if (!rawModel) return taskType === 'text' ? 'GPT Сказки' : 'MorphAI';
  const clean = String(rawModel).toLowerCase();

  // Текстовые сказители и модели
  if (clean.includes('gpt-4o-mini')) return 'GPT-4o Mini';
  if (clean.includes('gpt-4o')) return 'GPT-4o';
  if (clean.includes('claude-sonnet') || clean.includes('claude-3-5') || clean.includes('claude-3.5') || clean.includes('claude-sonnet-4')) return 'Claude Sonnet';
  if (clean.includes('claude-haiku') || clean.includes('claude-3-haiku')) return 'Claude Haiku';
  if (clean.includes('gemini-3.7') || clean.includes('gemini-3-flash') || clean.includes('gemini-3')) return 'Gemini 3 Flash';
  if (clean.includes('gemini-3.5')) return 'Gemini 3.5 Flash';
  if (clean.includes('gemini-2.5')) return 'Gemini 2.5 Flash';
  if (clean.includes('gemini')) return 'Gemini Sci-Fi';
  if (clean.includes('llama-3.3') || clean.includes('llama-3')) return 'Llama 3.3';
  if (clean.includes('deepseek-r1')) return 'DeepSeek R1';
  if (clean.includes('deepseek')) return 'DeepSeek';

  // Видео модели
  if (clean.includes('kling-3') || clean.includes('kling-video/v3')) return 'Kling 3.0';
  if (clean.includes('kling-1.5') || clean.includes('kling-video/v1.5')) return 'Kling 1.5 HD';
  if (clean.includes('kling')) return 'Kling AI';
  if (clean.includes('hailuo-h3')) return 'Hailuo H3';
  if (clean.includes('hailuo')) return 'Hailuo';
  if (clean.includes('luma')) return 'Luma Dream';
  if (clean.includes('runway')) return 'Runway';
  if (clean.includes('seedance')) return 'Seedance';

  // Фото модели
  if (clean.includes('flux')) return 'Flux';
  if (clean.includes('face-swap') || clean.includes('faceswap')) return 'Face Swap';
  if (clean.includes('dall-e')) return 'DALL-E 3';
  if (clean.includes('imagen')) return 'Imagen 3';
  if (clean.includes('wan')) return 'Wan Image';
  if (clean.includes('banana') || clean.includes('nano')) return 'Nano Banana';
  if (clean.includes('seedream')) return 'Seedream';

  // Удаление технического префикса компании вида "openai/" или "google/"
  return String(rawModel).replace(/^[a-z0-9_-]+\//i, '');
};
