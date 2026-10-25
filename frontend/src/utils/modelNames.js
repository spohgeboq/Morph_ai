/**
 * Очистка названия модели или версии от технического суффикса/слова "API"
 */
export const cleanModelName = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name
    .replace(/\s+api\b/gi, '')
    .replace(/\bapi\s+/gi, '')
    .replace(/\bapi\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Преобразование технического слага модели в красивое человекочитаемое имя для интерфейса (без слова API)
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
  if (clean.includes('seedance-2.5') || clean.includes('seedance 2.5') || clean.includes('seedance-ultra')) return 'Seedance 2.5';
  if (clean.includes('seedance-2.0') || clean.includes('seedance 2.0') || clean.includes('seedance-std')) return 'Seedance 2.0';
  if (clean.includes('seedance-1-pro') || clean.includes('seedance 1.0 pro') || clean.includes('seedance 1 pro')) return 'Seedance 1.0 Pro';
  if (clean.includes('seedance-1-lite') || clean.includes('seedance 1.0 lite') || clean.includes('seedance 1 lite') || clean.includes('seedance-lite')) return 'Seedance 1.0 Lite';
  if (clean.includes('seedance')) return 'Seedance';

  if (clean.includes('kling-3') || clean.includes('kling 3') || clean.includes('kling-video/v3')) return clean.includes('omni') ? 'Kling 3.0 Omni' : 'Kling 3.0';
  if (clean.includes('kling-2.6') || clean.includes('kling 2.6')) return 'Kling 2.6';
  if (clean.includes('kling-2.5') || clean.includes('kling 2.5')) return 'Kling 2.5';
  if (clean.includes('kling-1.5') || clean.includes('kling 1.5') || clean.includes('kling-video/v1.5')) return 'Kling 1.5 HD';
  if (clean.includes('kling-avatar')) return 'Kling AI Avatar';
  if (clean.includes('kling')) return 'Kling AI';

  if (clean.includes('hailuo-h3') || clean.includes('minimax-h3') || clean.includes('minimax h3')) return 'MiniMax H3';
  if (clean.includes('hailuo') || clean.includes('minimax')) return 'MiniMax Video';

  if (clean.includes('veo-3.1') || clean.includes('veo 3.1') || clean.includes('veo3.1')) return 'Veo 3.1';
  if (clean.includes('veo-3') || clean.includes('veo 3') || clean.includes('veo3')) return 'Veo 3';
  if (clean.includes('veo')) return 'Google Veo';

  if (clean.includes('wan22') || clean.includes('wan-2.6') || clean.includes('wan 2.6')) return 'Wan 2.6';
  if (clean.includes('wan-2.5') || clean.includes('wan 2.5')) return 'Wan 2.5';
  if (clean.includes('wan')) return 'Wan Video';

  if (clean.includes('omnihuman') || clean.includes('omni-human') || clean.includes('omni human')) return clean.includes('1.5') ? 'OmniHuman 1.5' : 'OmniHuman';
  if (clean.includes('runway-4') || clean.includes('gen4') || clean.includes('runway gen-4')) return 'Runway Gen-4 Turbo';
  if (clean.includes('runway')) return 'Runway Gen-4';

  // Фото модели
  if (clean.includes('flux-1.1') || clean.includes('flux 1.1')) return 'Flux 1.1 Pro';
  if (clean.includes('flux')) return clean.includes('kontext') ? 'Flux Kontext' : 'Flux';
  if (clean.includes('face-swap') || clean.includes('faceswap')) return 'Face Swap';
  if (clean.includes('gpt-image-2.5') || clean.includes('gpt image 2.5')) return 'GPT Image 2.5';
  if (clean.includes('gpt-image-2') || clean.includes('gpt image 2')) return 'GPT Image 2';
  if (clean.includes('gpt-image')) return 'GPT Image';
  if (clean.includes('banana') || clean.includes('nano')) return 'Nano Banana';
  if (clean.includes('seedream-5-pro') || clean.includes('seedream 5 pro')) return 'Seedream 5 Pro';
  if (clean.includes('seedream')) return 'Seedream';
  if (clean.includes('qwen')) return clean.includes('2.1') ? 'Qwen Image 2.1' : 'Qwen Image';
  if (clean.includes('z-image') || clean.includes('zimage')) return 'Z-Image Turbo';

  // Удаление технического префикса компании вида "openai/" или "google/" и очистка от слова API
  const stripped = String(rawModel).replace(/^[a-z0-9_-]+\//i, '');
  return cleanModelName(stripped);
};
