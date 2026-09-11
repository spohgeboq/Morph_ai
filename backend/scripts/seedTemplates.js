const db = require('../db');

const initialTemplates = [
  {
    name: 'День Рождения',
    category: 'photo',
    thumb_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=900&auto=format&fit=crop',
    video_url: null,
    prompt: 'Праздничный стильный портрет в мягком свете софитов, неоновые блики',
    model_name: 'Flux 1.1 Pro',
    cost: 10,
    is_trending: true,
    sort_order: 1
  },
  {
    name: 'Reels — Столкновение',
    category: 'video',
    thumb_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=900&auto=format&fit=crop',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-vintage-camera-42845-large.mp4',
    prompt: 'Динамичное замедленное видео для Reels, яркие эмоции, 1080p кино',
    model_name: 'Kling 1.5 HD',
    cost: 12,
    is_trending: true,
    sort_order: 2
  },
  {
    name: 'Cyberpunk 2077',
    category: 'video',
    thumb_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=900&auto=format&fit=crop',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robot-turning-its-head-41477-large.mp4',
    prompt: 'Киберпанк девушка под неоновым дождем Токио, 8K Ultra HD',
    model_name: 'Kling 1.5 AI',
    cost: 12,
    is_trending: true,
    sort_order: 3
  },
  {
    name: 'Old Money 35mm',
    category: 'photo',
    thumb_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=900&auto=format&fit=crop',
    video_url: null,
    prompt: 'Винтажная пленочная эстетика 35mm, Монако, естественный свет',
    model_name: 'Flux 1.1 Pro',
    cost: 10,
    is_trending: false,
    sort_order: 4
  },
  {
    name: 'Готический Замок',
    category: 'video',
    thumb_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=900&auto=format&fit=crop',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-fireflies-glowing-in-the-forest-at-night-42805-large.mp4',
    prompt: 'Туманный рассвет над древним замком, кинематографичный пролет камеры',
    model_name: 'Hailuo H2',
    cost: 14,
    is_trending: false,
    sort_order: 5
  },
  {
    name: 'Chromatic Liquid',
    category: 'photo',
    thumb_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=900&auto=format&fit=crop',
    video_url: null,
    prompt: 'Хромированный жидкий футуризм, переливающийся градиент, высокая мода',
    model_name: 'DALL-E 3',
    cost: 8,
    is_trending: false,
    sort_order: 6
  }
];

async function seed() {
  console.log('[Seed] Проверка наличия шаблонов...');
  const check = await db.query('SELECT COUNT(*) FROM templates');
  if (parseInt(check.rows[0].count) === 0) {
    console.log('[Seed] Заполнение базы шаблонов...');
    for (const t of initialTemplates) {
      await db.query(
        `INSERT INTO templates (name, category, thumb_url, video_url, prompt, model_name, cost, is_active, is_trending, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, $8, $9)`,
        [t.name, t.category, t.thumb_url, t.video_url, t.prompt, t.model_name, t.cost, t.is_trending, t.sort_order]
      );
    }
    console.log('[Seed] ✓ 6 начальных шаблонов успешно добавлены!');
  } else {
    console.log('[Seed] Шаблоны уже существуют, пропуск.');
  }
  process.exit(0);
}

seed().catch(err => {
  console.error('[Seed] Ошибка:', err);
  process.exit(1);
});
