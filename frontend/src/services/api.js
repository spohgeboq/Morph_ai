import WebApp from '@twa-dev/sdk';

const API_BASE = '/api';

/**
 * Получить данные текущего пользователя Telegram WebApp
 * с фоллбеком для разработки в обычном браузере.
 */
export function getTelegramUser() {
  try {
    const tgUser = WebApp?.initDataUnsafe?.user;
    if (tgUser && tgUser.id) {
      return {
        id: tgUser.id,
        username: tgUser.username || `tg_${tgUser.id}`,
        first_name: tgUser.first_name || 'Пользователь',
        is_telegram: true,
      };
    }
  } catch (err) {
    console.warn('[API] Telegram WebApp unavailable, using local mock user');
  }

  // Fallback для локальной разработки в браузере
  let savedUser = null;
  try {
    const raw = localStorage.getItem('morphai_local_user');
    if (raw) savedUser = JSON.parse(raw);
  } catch (e) {
    // ignore
  }

  if (!savedUser) {
    savedUser = {
      id: 123456789,
      username: 'MorphUser',
      first_name: 'Morph Explorer',
      is_telegram: false,
    };
    try {
      localStorage.setItem('morphai_local_user', JSON.stringify(savedUser));
    } catch (e) {
      // ignore
    }
  }

  return savedUser;
}

/**
 * Синхронизировать (создать или обновить) пользователя на бэкенде.
 */
export async function syncUser() {
  const tgUser = getTelegramUser();
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegram_id: tgUser.id,
        username: tgUser.username,
        first_name: tgUser.first_name,
        language: 'ru',
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to sync user: ${res.statusText}`);
    }

    const data = await res.json();
    return data.user;
  } catch (error) {
    console.error('[API] syncUser error:', error);
    // Fallback локальный объект если бэкенд временно недоступен
    return {
      telegram_id: tgUser.id,
      username: tgUser.username,
      first_name: tgUser.first_name,
      balance: 50,
    };
  }
}

/**
 * Получить профиль пользователя с реальным балансом.
 */
export async function getUserProfile(telegramId) {
  const id = telegramId || getTelegramUser().id;
  try {
    const res = await fetch(`${API_BASE}/users/${id}`);
    if (!res.ok) {
      // Если 404 — пробуем синхронизировать
      if (res.status === 404) {
        return await syncUser();
      }
      throw new Error(`Failed to get profile: ${res.statusText}`);
    }
    const data = await res.json();
    return data.user;
  } catch (error) {
    console.error('[API] getUserProfile error:', error);
    return null;
  }
}

/**
 * Получить список всех моделей с бэкенда.
 */
export async function fetchModels(category = '') {
  try {
    const query = category && category !== 'all' ? `?category=${category}` : '';
    const res = await fetch(`${API_BASE}/models${query}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch models: ${res.statusText}`);
    }
    const data = await res.json();
    return data.models || [];
  } catch (error) {
    console.error('[API] fetchModels error:', error);
    return null;
  }
}

/**
 * Отправить запрос на генерацию.
 */
export async function requestGeneration({
  telegram_id,
  model_id,
  version_id,
  prompt,
  params = {},
}) {
  const tgId = telegram_id || getTelegramUser().id;
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegram_id: tgId,
      model_id,
      version_id,
      prompt,
      params,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Ошибка генерации');
  }
  return data;
}

/**
 * Проверить статус выполнения задачи.
 */
export async function checkTaskStatus(taskId) {
  try {
    const res = await fetch(`${API_BASE}/generate/status/${taskId}`);
    if (!res.ok) throw new Error('Status check failed');
    return await res.json();
  } catch (error) {
    console.error('[API] checkTaskStatus error:', error);
    return null;
  }
}

/**
 * Получить историю генераций пользователя.
 */
export async function fetchUserGenerations(telegramId, limit = 20, offset = 0) {
  const id = telegramId || getTelegramUser().id;
  try {
    const res = await fetch(`${API_BASE}/users/${id}/generations?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to load history');
    const data = await res.json();
    return data.generations || [];
  } catch (error) {
    console.error('[API] fetchUserGenerations error:', error);
    return [];
  }
}

/**
 * Загрузить файл в Cloudflare R2 через бэкенд.
 *
 * @param {File} file - Файл с устройства пользователя
 * @param {string} [folder='uploads'] - Папка в bucket (e.g. 'references', 'faceswap')
 * @returns {Promise<{url: string, key: string, size: number, mimeType: string}>}
 */
export async function uploadFileToR2(file, folder = 'uploads') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Ошибка загрузки файла');
  }
  return data.file;
}

