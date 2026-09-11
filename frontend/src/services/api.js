import WebApp from '@twa-dev/sdk';

// Всегда используем относительный путь — Vite proxy проксирует /api → http://localhost:5000
const API_BASE = '/api';

/**
 * Получить данные текущего пользователя Telegram WebApp
 * с автоматическим распознаванием WebApp SDK, URL-параметров или кэша.
 */
export function getTelegramUser() {
  // 1. Проверяем Telegram WebApp SDK (официальный скрипт telegram-web-app.js)
  try {
    const tg = window.Telegram?.WebApp || WebApp;
    const tgUser = tg?.initDataUnsafe?.user;
    if (tgUser && tgUser.id) {
      const userObj = {
        id: tgUser.id,
        telegram_id: tgUser.id,
        username: tgUser.username || `tg_${tgUser.id}`,
        first_name: tgUser.first_name || 'Пользователь',
        photo_url: tgUser.photo_url || null,
        is_telegram: true,
      };
      // Сохраняем в кэш
      try {
        localStorage.setItem('morphai_local_user', JSON.stringify(userObj));
      } catch (e) {}
      return userObj;
    }
  } catch (err) {
    console.warn('[API] Telegram WebApp unavailable', err);
  }

  // 2. Проверяем URL-параметры (если пользователь перешел по ссылке из бота)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const paramId = urlParams.get('tg_id') || hashParams.get('tg_id');
    const paramUser = urlParams.get('username') || hashParams.get('username');
    const paramName = urlParams.get('first_name') || hashParams.get('first_name');
    const paramPhoto = urlParams.get('photo_url') || hashParams.get('photo_url');

    if (paramId) {
      const userObj = {
        id: parseInt(paramId, 10),
        telegram_id: parseInt(paramId, 10),
        username: paramUser || `tg_${paramId}`,
        first_name: paramName || 'Пользователь',
        photo_url: paramPhoto || null,
        is_telegram: true,
      };
      try {
        localStorage.setItem('morphai_local_user', JSON.stringify(userObj));
      } catch (e) {}
      return userObj;
    }
  } catch (e) {}

  // 3. Проверяем сохраненного пользователя в localStorage
  let savedUser = null;
  try {
    const raw = localStorage.getItem('morphai_local_user');
    if (raw) savedUser = JSON.parse(raw);
  } catch (e) {}

  if (savedUser && savedUser.id) {
    return savedUser;
  }

  // 4. Локальный гостевой пользователь по умолчанию
  savedUser = {
    id: 123456789,
    telegram_id: 123456789,
    username: 'MorphUser',
    first_name: 'Morph Explorer',
    photo_url: null,
    is_telegram: false,
    is_mock: true,
  };
  try {
    localStorage.setItem('morphai_local_user', JSON.stringify(savedUser));
  } catch (e) {}

  return savedUser;
}

/**
 * Синхронизировать (создать или обновить) пользователя на бэкенде.
 * Пользователь регистрируется мгновенно без каких-либо кликов.
 */
export async function syncUser() {
  const tgUser = getTelegramUser();
  const initData = window.Telegram?.WebApp?.initData || WebApp?.initData || '';

  const headers = { 'Content-Type': 'application/json' };
  if (initData) {
    headers['x-telegram-init-data'] = initData;
  }

  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        telegram_id: tgUser.telegram_id || tgUser.id,
        username: tgUser.username,
        first_name: tgUser.first_name,
        photo_url: tgUser.photo_url || null,
        language: 'ru',
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to sync user: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.user) {
      const mergedUser = {
        ...tgUser,
        ...data.user,
        id: data.user.telegram_id || tgUser.id,
        telegram_id: data.user.telegram_id || tgUser.id,
        photo_url: data.user.photo_url || tgUser.photo_url || null,
        is_telegram: true,
      };
      try {
        localStorage.setItem('morphai_local_user', JSON.stringify(mergedUser));
        localStorage.setItem('morphai_cached_user', JSON.stringify(data.user));
      } catch (e) {}
      return data.user;
    }
    return data.user;
  } catch (error) {
    console.error('[API] syncUser error:', error);
    return {
      telegram_id: tgUser.telegram_id || tgUser.id,
      username: tgUser.username,
      first_name: tgUser.first_name,
      photo_url: tgUser.photo_url || null,
      balance: 50,
    };
  }
}

/**
 * Мгновенная авторизация / регистрация по Telegram @username или ID для веб-версии.
 */
export async function telegramLogin({ username, telegram_id, first_name, photo_url }) {
  const res = await fetch(`${API_BASE}/users/telegram-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, telegram_id, first_name, photo_url }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Ошибка авторизации через Telegram');
  }

  if (data.user) {
    const formatted = {
      id: data.user.telegram_id,
      telegram_id: data.user.telegram_id,
      username: data.user.username,
      first_name: data.user.first_name,
      photo_url: data.user.photo_url || data.user.face_photo_url || null,
      is_telegram: true,
      is_mock: false,
      ...data.user,
    };
    try {
      localStorage.setItem('morphai_local_user', JSON.stringify(formatted));
      localStorage.setItem('morphai_cached_user', JSON.stringify(data.user));
    } catch (e) {}
    return data.user;
  }
  return null;
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
  console.log('[API] fetchModels →', API_BASE + '/models');
  try {
    const query = category && category !== 'all' ? `?category=${category}` : '';
    const res = await fetch(`${API_BASE}/models${query}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch models: ${res.statusText}`);
    }
    const data = await res.json();
    const list = data.models || [];
    return list.map((m) => {
      const cover = m.preview_url || m.preview || '';
      const description = m.description || m.desc || '';
      return {
        ...m,
        preview: cover,
        preview_url: cover,
        desc: description,
        description: description,
      };
    });
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
  const body = {
    telegram_id: tgId,
    model_id,
    version_id,
    prompt,
    params,
  };

  console.log('[API] requestGeneration →', API_BASE + '/generate', body);

  let res;
  try {
    res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    console.error('[API] Network error:', networkError);
    throw new Error('Сеть недоступна. Убедитесь, что бэкенд запущен на порту 5000.');
  }

  let data;
  try {
    data = await res.json();
  } catch (parseError) {
    console.error('[API] Response parse error, status:', res.status);
    throw new Error(`Ошибка сервера (${res.status}). Повторите попытку.`);
  }

  if (!res.ok) {
    console.error('[API] Generation failed:', res.status, data);
    throw new Error(data.message || data.error || `Ошибка генерации (${res.status})`);
  }

  console.log('[API] Generation success:', data);
  return data;
}

/**
 * Проверить статус выполнения задачи.
 */
export async function checkTaskStatus(taskId) {
  try {
    const res = await fetch(`${API_BASE}/generate/status/${taskId}`);
    if (!res.ok) throw new Error('Status check failed');
    const data = await res.json();
    return {
      ...data,
      resultUrl: data.result_url || data.resultUrl || null,
      result_url: data.result_url || data.resultUrl || null,
      errorMessage: data.error_message || data.errorMessage || null,
      error_message: data.error_message || data.errorMessage || null,
    };
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

// =========================================================================
// ADMIN HUB & PROMOCODE SERVICES
// =========================================================================

const ADMIN_TOKEN_KEY = 'morphai_admin_jwt';

export function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token, remember = true) {
  if (remember) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
}

export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function adminAuthHeaders() {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'x-admin-token': token } : {}),
  };
}

export async function adminLogin(password) {
  const res = await fetch(`${API_BASE}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка авторизации');
  setAdminToken(data.token, true);
  return data;
}

export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, { headers: adminAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка загрузки статистики');
  return data;
}

export async function fetchAdminTariffs() {
  const res = await fetch(`${API_BASE}/admin/tariffs`, { headers: adminAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка загрузки тарифов');
  return data.tariffs || [];
}

export async function saveAdminTariff(tariff) {
  const url = tariff.id ? `${API_BASE}/admin/tariffs/${tariff.id}` : `${API_BASE}/admin/tariffs`;
  const method = tariff.id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: adminAuthHeaders(),
    body: JSON.stringify(tariff),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка сохранения тарифа');
  return data.tariff;
}

export async function deleteAdminTariff(id) {
  const res = await fetch(`${API_BASE}/admin/tariffs/${id}`, {
    method: 'DELETE',
    headers: adminAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка удаления тарифа');
  return data;
}

export async function fetchAdminPromocodes() {
  const res = await fetch(`${API_BASE}/admin/promocodes`, { headers: adminAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка загрузки промокодов');
  return data.promocodes || [];
}

export async function createAdminPromocode(promo) {
  const res = await fetch(`${API_BASE}/admin/promocodes`, {
    method: 'POST',
    headers: adminAuthHeaders(),
    body: JSON.stringify(promo),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка создания промокода');
  return data.promocode;
}

export async function deleteAdminPromocode(id) {
  const res = await fetch(`${API_BASE}/admin/promocodes/${id}`, {
    method: 'DELETE',
    headers: adminAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка удаления промокода');
  return data;
}

export async function fetchAdminUsers(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/users?${query}`, { headers: adminAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка загрузки пользователей');
  return data;
}

export async function fetchAdminUserDetail(id) {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, { headers: adminAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка загрузки профиля клиента');
  return data;
}

export async function adjustUserBalance(id, amount, reason) {
  const res = await fetch(`${API_BASE}/admin/users/${id}/adjust-balance`, {
    method: 'POST',
    headers: adminAuthHeaders(),
    body: JSON.stringify({ amount, reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка корректировки баланса');
  return data;
}

export async function toggleUserBan(id) {
  const res = await fetch(`${API_BASE}/admin/users/${id}/toggle-ban`, {
    method: 'POST',
    headers: adminAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка изменения статуса бана');
  return data.user;
}

export async function fetchAdminFeed() {
  const res = await fetch(`${API_BASE}/admin/feed`, { headers: adminAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка загрузки ленты');
  return data.items || [];
}

export async function saveAdminFeedItem(item) {
  const url = item.id ? `${API_BASE}/admin/feed/${item.id}` : `${API_BASE}/admin/feed`;
  const method = item.id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: adminAuthHeaders(),
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка сохранения элемента');
  return data.item;
}

export async function deleteAdminFeedItem(id) {
  const res = await fetch(`${API_BASE}/admin/feed/${id}`, {
    method: 'DELETE',
    headers: adminAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка удаления');
  return data;
}

export async function reorderAdminFeed(items) {
  const res = await fetch(`${API_BASE}/admin/feed/reorder`, {
    method: 'POST',
    headers: adminAuthHeaders(),
    body: JSON.stringify({ items }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка сортировки');
  return data;
}

export async function fetchAdminSettings() {
  const res = await fetch(`${API_BASE}/admin/settings`, { headers: adminAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка загрузки настроек');
  return data.settings || {};
}

export async function saveAdminSetting(key, value) {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'PUT',
    headers: adminAuthHeaders(),
    body: JSON.stringify({ key, value }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка сохранения настройки');
  return data.setting;
}

export async function sendAdminBroadcast(payload) {
  const res = await fetch(`${API_BASE}/admin/broadcast`, {
    method: 'POST',
    headers: adminAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка рассылки');
  return data;
}

export async function redeemPromocode(telegramId, code) {
  const id = telegramId || getTelegramUser().id;
  const res = await fetch(`${API_BASE}/users/${id}/promocode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка активации промокода');
  return data;
}

// ==========================================
// ПУБЛИЧНЫЙ КОНТЕНТ (КЛИЕНТ)
// ==========================================

export async function fetchPublicStories() {
  try {
    const res = await fetch(`${API_BASE}/stories`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.stories || [];
  } catch (err) {
    console.warn('[API] fetchPublicStories fallback:', err.message);
    return [];
  }
}

export async function fetchPublicModels() {
  try {
    const res = await fetch(`${API_BASE}/models`);
    if (!res.ok) return [];
    const data = await res.json();
    const list = data.models || [];
    return list.map(m => ({
      id: m.id,
      name: m.name,
      category: m.category,
      preview: m.preview_url || m.preview,
      tags: m.tags || [],
      desc: m.description || m.desc || '',
      cost: m.cost !== undefined ? m.cost : 10,
      versions: m.versions || [],
      aspectRatios: m.aspect_ratios || m.aspectRatios || ['16:9', '9:16', '1:1'],
      samplePrompts: m.sample_prompts || m.samplePrompts || [],
      isActive: m.is_active !== undefined ? m.is_active : true,
    }));
  } catch (err) {
    console.warn('[API] fetchPublicModels fallback:', err.message);
    return [];
  }
}

export async function fetchPublicTemplates(category) {
  try {
    const url = category ? `${API_BASE}/templates?category=${category}` : `${API_BASE}/templates`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.templates || [];
  } catch (err) {
    console.warn('[API] fetchPublicTemplates fallback:', err.message);
    return [];
  }
}

export async function fetchPhotoshootConfig() {
  try {
    const res = await fetch(`${API_BASE}/settings/photoshoot`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.config || null;
  } catch (err) {
    console.warn('[API] fetchPhotoshootConfig fallback:', err.message);
    return null;
  }
}

// ==========================================
// АДМИНКА: STORIES (КРУЖОЧКИ)
// ==========================================

export async function fetchAdminStories() {
  const res = await fetch(`${API_BASE}/admin/stories`, { headers: adminAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка загрузки Stories');
  return data.stories || [];
}

export async function saveAdminStory(story) {
  const url = story.id ? `${API_BASE}/admin/stories/${story.id}` : `${API_BASE}/admin/stories`;
  const method = story.id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: adminAuthHeaders(),
    body: JSON.stringify(story),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка сохранения Stories');
  return data.story;
}

export async function deleteAdminStory(id) {
  const res = await fetch(`${API_BASE}/admin/stories/${id}`, {
    method: 'DELETE',
    headers: adminAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка удаления Stories');
  return data;
}

export async function reorderAdminStories(items) {
  const res = await fetch(`${API_BASE}/admin/stories/reorder`, {
    method: 'POST',
    headers: adminAuthHeaders(),
    body: JSON.stringify({ items }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка изменения порядка Stories');
  return data;
}

// ==========================================
// АДМИНКА: ИИ МОДЕЛИ & ЦЕНЫ
// ==========================================

export async function fetchAdminModels() {
  const res = await fetch(`${API_BASE}/admin/models`, { headers: adminAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка загрузки моделей');
  return data.models || [];
}

export async function saveAdminModel(id, modelData) {
  const res = await fetch(`${API_BASE}/admin/models/${id}`, {
    method: 'PUT',
    headers: adminAuthHeaders(),
    body: JSON.stringify(modelData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка сохранения модели');
  return data.model;
}

// ==========================================
// ЗАГРУЗКА МЕДИА В CLOUDFLARE R2
// ==========================================

export async function uploadAdminMedia(file, folder = 'admin_media') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  let res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    try {
      res = await fetch(`${API_BASE}/admin/upload`, {
        method: 'POST',
        headers: adminAuthHeaders(),
        body: formData,
      });
    } catch {
      // Игнорируем ошибку резервного роута
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Ошибка загрузки медиафайла в R2');
  const finalUrl = data.url || data.file?.url || data.fileUrl;
  return { 
    url: finalUrl,
    key: data.key || data.file?.key,
    ...(data.file || {}), 
    ...data 
  };
}

// ==========================================
// AI ФОТОСТУДИЯ (PHOTOSHOOT)
// ==========================================

export async function startPhotoshoot({ telegram_id, user_id, image_url }) {
  const res = await fetch(`${API_BASE}/generate/photoshoot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegram_id, user_id, image_url }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка запуска фотостудии');
  return data;
}

export async function checkPhotoshootStatus(batchId) {
  const res = await fetch(`${API_BASE}/generate/photoshoot/status/${batchId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка получения статуса фотосессии');
  return data;
}

// ==========================================
// ПОВТОРИТЬ СТИЛЬ (REMIX)
// ==========================================

export async function executeRemix({ template_id, face_url, telegram_id, user_id, mode = 'face' }) {
  const res = await fetch(`${API_BASE}/generate/remix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template_id, face_url, telegram_id, user_id, mode }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка запуска Remix');
  return data;
}

export async function checkRemixStatus(taskId) {
  const res = await fetch(`${API_BASE}/generate/remix/status/${taskId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка проверки статуса Remix');
  return data;
}
