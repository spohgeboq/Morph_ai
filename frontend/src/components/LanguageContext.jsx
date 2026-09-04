import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  ru: {
    // Навигация
    navHome: 'Главная',
    navFeed: 'Лента',
    navCreate: 'Создать',
    navChats: 'Чаты',
    navProfile: 'Профиль',

    // Общие кнопки
    topUp: 'Пополнить',
    share: 'Поделиться',
    remix: 'Повторить',
    grid: 'Сетка',
    stream: 'Поток',
    all: 'Все',
    photo: 'Фото',
    video: 'Видео',
    text: 'Текст',
    search: 'Поиск...',

    // Home
    storyKling: 'Kling 1.5',
    storyOldMoney: 'Old Money',
    storyFairytale: 'Сказка',
    storyNeon: 'Неон 2077',

    studioBadge: '10 ФОТО В 1 СЕТЕ',
    studioTitle: 'Студийный фотосет',
    studioDesc: '10 премиальных 4K-портретов для соцсетей из одного твоего селфи',
    studioBtn: 'Загрузить селфи и создать 10 фото (15 CR)',
    studioGenerating: 'Генерация: {step} из 10 кадров...',
    studioBtnReady: 'Создать 10 фотосессий (15 CR)',

    specModesTitle: 'СПЕЦИАЛЬНЫЕ РЕЖИМЫ',
    specEngineBadge: 'Движок: Claude 3.5 + Flux',
    specStoryTitle: 'Сказка или Квест',
    specStoryDesc: 'Укажи имя героя — ИИ автоматически напишет законченную историю и нарисует книжную обложку',
    specStoryBtn: 'Создать сказку с финалом',

    examplesTitle: 'Примеры генераций',
    exBirthday: 'День Рождения',
    exReels: 'Reels — Столкновение',
    exCyberpunk: 'Cyberpunk 2077',
    exOldMoney: 'Old Money 35mm',

    // Feed
    feedTitle: 'Лента Трендов',
    feedSubtitle: 'Выбери стиль для повтора или переключись в полноэкранный поток',
    feedSearchPlaceholder: 'Поиск по стилям...',
    feedEmptySearchTitle: 'Видео не найдены',
    feedEmptySearchDesc: 'По вашему запросу ничего не найдено',
    feedResetSearch: 'Сбросить поиск',

    // Create
    createTitle: 'Создать',
    createSubtitle: 'Выберите подходящую нейросеть или задачу',
    createSearchPlaceholder: 'Поиск нейросети или стиля...',
    noModelsFound: 'Нейросети не найдены',
    tagPhoto8K: 'Фото 8K',
    tagPortraits: 'Портреты',
    tagExclusive: 'Эксклюзив',
    tagDigitalArt: 'Digital Арт',
    tagVideo1080p: 'Видео 1080p',
    tagCinePhysics: 'Кино-физика',
    tagArt: 'Арт',
    tagDesign3D: 'Дизайн & 3D',
    tagAnimatePhoto: 'Оживление фото',
    tagDynamics: 'Динамика',
    tagQuality: 'Качество',
    tagArchitecture: 'Архитектура',
    tagTales: 'Сказки & Квесты',
    tagCoding: 'Кодинг',
    tagRewriting: 'Рерайтинг',

    // Chats
    chatsTitle: 'Чаты',
    chatsSubtitle: 'История создания и доработки ваших генераций',
    chatPlaceholder: 'Напишите сообщение или уточнение к генерации...',
    send: 'Отправить',
    startChat: 'Начать новый диалог',

    // Профиль - вкладки и шапка
    tabProfile: 'Профиль',
    tabSettings: 'Настройки',
    tokenBalance: 'Баланс токенов',
    recharge: 'Пополнить',
    approxHint: 'Хватит на ~{photos} фото или ~{videos} видео',
    
    // Витрина
    tabGenerations: 'Генерации',
    tabLiked: 'Избранное',
    tabAlbums: 'Альбомы',
    filterAll: 'Все',
    filterPhoto: 'Фото',
    filterVideo: 'Видео',

    // Альбомы
    createAlbum: 'Создать альбом',
    newCollection: 'Новая коллекция',
    backToAlbums: 'Альбомы',
    addWorks: 'Добавить работы',
    worksInCollection: 'работ в коллекции',
    workInCollection: 'работа в коллекции',
    albumCreated: 'Альбом создан!',
    albumDeleted: 'Альбом удален',
    albumUpdated: 'Альбом обновлен!',
    saveAlbum: 'Готово',
    chooseCover: 'Выберите обложку (или будет первая генерация):',
    albumNamePlaceholder: 'Например: Мои портреты, Reels 2026...',
    albumNameLabel: 'Название коллекции',
    deleteConfirmTitle: 'Удалить альбом?',
    deleteConfirmDesc: 'Все работы сохранятся в вашей общей галерее генераций.',
    deleteBtn: 'Удалить',

    // Пустые состояния
    emptyGenTitle: 'Пока нет генераций',
    emptyGenDesc: 'Запустите первую генерацию — ваши фото и видео мгновенно появятся в этой галерее',
    createMasterpiece: 'Создать шедевр',
    emptyLikedTitle: 'Нет сохраненных работ',
    emptyLikedDesc: 'Ставьте лайки видео и фото в общей Ленте, чтобы они сохранились здесь',
    goToFeed: 'Перейти в Ленту',
    emptyAlbumTitle: 'В альбоме пока пусто',
    emptyAlbumDesc: 'Нажмите «+ Добавить работы», чтобы выбрать генерации для этой подборки.',

    // Настройки
    secBadgeTitle: 'Безопасность данных & Telegram Verified',
    secBadgeDesc: 'Сервис строго следует стандартам Telegram Bot API, защищён протоколами шифрования AES-256 и безопасной модерацией контента.',
    
    langSectionTitle: 'Локализация',
    langLabel: 'Язык интерфейса',
    langDesc: 'Выберите комфортный язык приложения',

    legalSectionTitle: 'Конфиденциальность & Безопасность',
    privacyPolicy: 'Политика конфиденциальности',
    privacyDesc: 'Защита персональных данных и фото',
    termsAndSafety: 'Правила сервиса & AI Безопасность',
    termsDesc: 'Стандарты контента и гарантия защиты от бана',
    
    supportSectionTitle: 'Информация & Поддержка',
    supportCare: 'Служба заботы в Telegram',
    supportCareDesc: 'Ответ оператора в течение 5 минут',
    officialChannel: 'Официальный канал Morphi',
    officialChannelDesc: 'Анонсы релизов, промпты и обновления',

    clearCache: 'Очистить кэш генераций',
    clearCacheDesc: 'Освободить локальную память устройства',
    clearCacheSuccess: 'Локальный кэш успешно очищен!',
    clearCacheConfirmTitle: 'Очистить кэш?',
    clearCacheConfirmDesc: 'Временные превью и кэшированные файлы генераций будут сброшены.',
    clearBtn: 'Очистить',

    logout: 'Выйти из аккаунта',
    logoutConfirmTitle: 'Выйти из аккаунта?',
    logoutConfirmDesc: 'Вы сможете снова вернуться в любой момент через Telegram.',
    logoutSessionEnded: 'Сессия завершена',

    // Пополнение
    rechargeModalTitle: 'Пополнение баланса',
    rechargeModalCredits: 'Пополнение кредитов',
    currentBalance: 'Текущий баланс: {balance} CR',
    pkgStoriesPhotos: 'Для сказок и фото',
    pkgHitBonus: 'ХИТ • +50 В ПОДАРОК',
    pkgOptimalSet: 'Оптимальный набор',
    pkgVipBonus: 'VIP • +250 В ПОДАРОК',
    pkgMaxVideo: 'Максимум видео и музыки',
    paymentMethodsHint: 'Оплата через Telegram Stars, СБП и банковские карты',
    ready: 'Готово',
    prompt: 'Промпт',
    copied: 'Скопировано',
    pack100Hint: '~10 фото / ~8 видео',
    pack350Hint: '~35 фото / ~30 видео',
    rechargeModalDesc: 'Выберите пакет токенов для доступа к моделям Flux 1.1 Pro и Kling HD:',
    hitBadge: 'Хит • Выгода 30%',
    vipBadge: 'VIP Запас',
    tokensCredited: 'Начислено +{amount} кредитов!'
  },

  en: {
    // Navigation
    navHome: 'Home',
    navFeed: 'Feed',
    navCreate: 'Create',
    navChats: 'Chats',
    navProfile: 'Profile',

    // Common Buttons
    topUp: 'Top up',
    share: 'Share',
    remix: 'Remix',
    grid: 'Grid',
    stream: 'Stream',
    all: 'All',
    photo: 'Photo',
    video: 'Video',
    text: 'Text',
    search: 'Search...',

    // Home
    storyKling: 'Kling 1.5',
    storyOldMoney: 'Old Money',
    storyFairytale: 'Fairy Tale',
    storyNeon: 'Neon 2077',

    studioBadge: '10 PHOTOS IN 1 SET',
    studioTitle: 'Studio Photoset',
    studioDesc: '10 premium 4K portraits for social media from a single selfie',
    studioBtn: 'Upload selfie & create 10 photos (15 CR)',
    studioGenerating: 'Generating: {step} of 10 photos...',
    studioBtnReady: 'Create 10 photos (15 CR)',

    specModesTitle: 'SPECIAL MODES',
    specEngineBadge: 'Engine: Claude 3.5 + Flux',
    specStoryTitle: 'Fairy Tale or Quest',
    specStoryDesc: 'Enter hero name — AI will write a complete story and draw a book cover',
    specStoryBtn: 'Create story with finale',

    examplesTitle: 'Generation Examples',
    exBirthday: 'Birthday',
    exReels: 'Reels — Collision',
    exCyberpunk: 'Cyberpunk 2077',
    exOldMoney: 'Old Money 35mm',

    // Feed
    feedTitle: 'Trending Feed',
    feedSubtitle: 'Choose a style to remix or switch to fullscreen stream',
    feedSearchPlaceholder: 'Search styles...',
    feedEmptySearchTitle: 'No videos found',
    feedEmptySearchDesc: 'Nothing matches your search query',
    feedResetSearch: 'Reset search',

    // Create
    createTitle: 'Create',
    createSubtitle: 'Choose a neural network or task',
    createSearchPlaceholder: 'Search neural net or style...',
    noModelsFound: 'No neural networks found',
    tagPhoto8K: '8K Photo',
    tagPortraits: 'Portraits',
    tagExclusive: 'Exclusive',
    tagDigitalArt: 'Digital Art',
    tagVideo1080p: '1080p Video',
    tagCinePhysics: 'Cinema Physics',
    tagArt: 'Art',
    tagDesign3D: 'Design & 3D',
    tagAnimatePhoto: 'Animate photo',
    tagDynamics: 'Dynamics',
    tagQuality: 'Quality',
    tagArchitecture: 'Architecture',
    tagTales: 'Stories & Quests',
    tagCoding: 'Coding',
    tagRewriting: 'Rewriting',

    // Chats
    chatsTitle: 'Chats',
    chatsSubtitle: 'History and dialogue of your AI creations',
    chatPlaceholder: 'Write a message or refine generation prompt...',
    send: 'Send',
    startChat: 'Start new chat',

    // Profile
    tabProfile: 'Profile',
    tabSettings: 'Settings',
    tokenBalance: 'Token Balance',
    recharge: 'Top up',
    approxHint: 'Enough for ~{photos} photos or ~{videos} videos',

    // Showcase
    tabGenerations: 'Generations',
    tabLiked: 'Favorites',
    tabAlbums: 'Albums',
    filterAll: 'All',
    filterPhoto: 'Photos',
    filterVideo: 'Videos',

    // Albums
    createAlbum: 'Create Album',
    newCollection: 'New collection',
    backToAlbums: 'Albums',
    addWorks: 'Add works',
    worksInCollection: 'works in collection',
    workInCollection: 'work in collection',
    albumCreated: 'Album created!',
    albumDeleted: 'Album deleted',
    albumUpdated: 'Album updated!',
    saveAlbum: 'Done',
    chooseCover: 'Select cover (or the first generation will be used):',
    albumNamePlaceholder: 'E.g., Portraits, Reels 2026...',
    albumNameLabel: 'Collection title',
    deleteConfirmTitle: 'Delete album?',
    deleteConfirmDesc: 'All creations will remain saved in your main gallery.',
    deleteBtn: 'Delete',

    // Empty states
    emptyGenTitle: 'No generations yet',
    emptyGenDesc: 'Start your first generation — your photos and videos will appear right here',
    createMasterpiece: 'Create masterpiece',
    emptyLikedTitle: 'No saved works',
    emptyLikedDesc: 'Like photos and videos in the Feed to save them here',
    goToFeed: 'Go to Feed',
    emptyAlbumTitle: 'Album is empty',
    emptyAlbumDesc: 'Tap "+ Add works" to select creations for this collection.',

    // Settings
    secBadgeTitle: 'Data Security & Telegram Verified',
    secBadgeDesc: 'The service strictly follows Telegram Bot API standards, secured with AES-256 encryption and automated AI safety filters.',

    langSectionTitle: 'Localization',
    langLabel: 'Interface Language',
    langDesc: 'Select your preferred language',

    legalSectionTitle: 'Privacy & Security',
    privacyPolicy: 'Privacy Policy',
    privacyDesc: 'User data protection and media safety',
    termsAndSafety: 'Terms of Service & AI Safety',
    termsDesc: 'Content guidelines and anti-ban standards',

    supportSectionTitle: 'Support & Community',
    supportCare: 'Telegram Customer Care',
    supportCareDesc: 'Operator response within 5 minutes',
    officialChannel: 'Official Morphi Channel',
    officialChannelDesc: 'Release notes, prompts, and updates',

    clearCache: 'Clear generation cache',
    clearCacheDesc: 'Free up local device memory',
    clearCacheSuccess: 'Local cache cleared successfully!',
    clearCacheConfirmTitle: 'Clear cache?',
    clearCacheConfirmDesc: 'Temporary previews and cached media files will be reset.',
    clearBtn: 'Clear',

    logout: 'Log out',
    logoutConfirmTitle: 'Log out?',
    logoutConfirmDesc: 'You can log back in at any time via Telegram.',
    logoutSessionEnded: 'Session ended',

    // Recharge
    rechargeModalTitle: 'Top Up Balance',
    rechargeModalCredits: 'Top Up Credits',
    currentBalance: 'Current balance: {balance} CR',
    pkgStoriesPhotos: 'For stories & photos',
    pkgHitBonus: 'POPULAR • +50 BONUS',
    pkgOptimalSet: 'Optimal pack',
    pkgVipBonus: 'VIP • +250 BONUS',
    pkgMaxVideo: 'Maximum video & music',
    paymentMethodsHint: 'Payment via Telegram Stars, Instant Pay & bank cards',
    ready: 'Ready',
    prompt: 'Prompt',
    copied: 'Copied',
    pack100Hint: '~10 photos / ~8 videos',
    pack350Hint: '~35 photos / ~30 videos',
    rechargeModalDesc: 'Select a token pack for instant access to Flux 1.1 Pro and Kling HD:',
    hitBadge: 'Popular • Save 30%',
    vipBadge: 'VIP Pack',
    tokensCredited: '+{amount} credits added!'
  },

  kz: {
    // Navigation
    navHome: 'Басты',
    navFeed: 'Таспа',
    navCreate: 'Жасау',
    navChats: 'Чаттар',
    navProfile: 'Профиль',

    // Common Buttons
    topUp: 'Толықтыру',
    share: 'Бөлісу',
    remix: 'Қайталау',
    grid: 'Тор',
    stream: 'Ағын',
    all: 'Барлығы',
    photo: 'Фото',
    video: 'Бейне',
    text: 'Мәтін',
    search: 'Іздеу...',

    // Home
    storyKling: 'Kling 1.5',
    storyOldMoney: 'Old Money',
    storyFairytale: 'Ертегі',
    storyNeon: 'Неон 2077',

    studioBadge: '1 СЕТТЕ 10 ФОТО',
    studioTitle: 'Студиялық фотосет',
    studioDesc: 'Бір ғана селфиден әлеуметтік желілерге арналған 10 премиум 4K портрет',
    studioBtn: 'Селфи жүктеп, 10 фото жасау (15 CR)',
    studioGenerating: 'Жасалуда: 10-нан {step} кадр...',
    studioBtnReady: '10 фотосессия жасау (15 CR)',

    specModesTitle: 'АРНАЙЫ РЕЖИМДЕР',
    specEngineBadge: 'Қозғалтқыш: Claude 3.5 + Flux',
    specStoryTitle: 'Ертегі немесе Квест',
    specStoryDesc: 'Батырдың атын жазыңыз — AI толық әңгіме жазып, кітап мұқабасын салады',
    specStoryBtn: 'Аяқталған ертегі жасау',

    examplesTitle: 'Генерация үлгілері',
    exBirthday: 'Туған күн',
    exReels: 'Reels — Соқтығысу',
    exCyberpunk: 'Cyberpunk 2077',
    exOldMoney: 'Old Money 35mm',

    // Feed
    feedTitle: 'Трендтер таспасы',
    feedSubtitle: 'Қайталау үшін стильді таңдаңыз немесе толық экранға өтіңіз',
    feedSearchPlaceholder: 'Стильдер бойынша іздеу...',
    feedEmptySearchTitle: 'Бейнелер табылмады',
    feedEmptySearchDesc: 'Сұрауыңыз бойынша ештеңе табылмады',
    feedResetSearch: 'Іздеуді тазарту',

    // Create
    createTitle: 'Жасау',
    createSubtitle: 'Қолайлы нейрожеліні немесе тапсырманы таңдаңыз',
    createSearchPlaceholder: 'Нейрожеліні немесе стильді іздеу...',
    noModelsFound: 'Нейрожелілер табылмады',
    tagPhoto8K: '8K Фото',
    tagPortraits: 'Портреттер',
    tagExclusive: 'Эксклюзив',
    tagDigitalArt: 'Сандық Арт',
    tagVideo1080p: '1080p Бейне',
    tagCinePhysics: 'Кино-физика',
    tagArt: 'Арт',
    tagDesign3D: 'Дизайн & 3D',
    tagAnimatePhoto: 'Фотоны жандандыру',
    tagDynamics: 'Динамика',
    tagQuality: 'Сапа',
    tagArchitecture: 'Сәулет',
    tagTales: 'Ертегілер & Квесттер',
    tagCoding: 'Бағдарламалау',
    tagRewriting: 'Қайта жазу',

    // Chats
    chatsTitle: 'Чаттар',
    chatsSubtitle: 'Генерацияларыңыздың тарихы мен диалогы',
    chatPlaceholder: 'Хабарлама немесе промптқа нақтылау жазыңыз...',
    send: 'Жіберу',
    startChat: 'Жаңа чат бастау',

    // Profile
    tabProfile: 'Профиль',
    tabSettings: 'Баптаулар',
    tokenBalance: 'Токен теңгерімі',
    recharge: 'Толықтыру',
    approxHint: '~{photos} фото немесе ~{videos} бейнеге жетеді',

    // Showcase
    tabGenerations: 'Генерациялар',
    tabLiked: 'Таңдаулы',
    tabAlbums: 'Альбомдар',
    filterAll: 'Барлығы',
    filterPhoto: 'Фото',
    filterVideo: 'Бейне',

    // Albums
    createAlbum: 'Альбом жасау',
    newCollection: 'Жаңа топтама',
    backToAlbums: 'Альбомдар',
    addWorks: 'Жұмыс қосу',
    worksInCollection: 'жұмыс топтамада',
    workInCollection: 'жұмыс топтамада',
    albumCreated: 'Альбом жасалды!',
    albumDeleted: 'Альбом жойылды',
    albumUpdated: 'Альбом жаңартылды!',
    saveAlbum: 'Дайын',
    chooseCover: 'Мұқабаны таңдаңыз (немесе бірінші жұмыс қойылады):',
    albumNamePlaceholder: 'Мысалы: Менің портреттерім, Reels 2026...',
    albumNameLabel: 'Топтама атауы',
    deleteConfirmTitle: 'Альбомды жою?',
    deleteConfirmDesc: 'Барлық жұмыстар негізгі генерациялар галереясында сақталады.',
    deleteBtn: 'Жою',

    // Empty states
    emptyGenTitle: 'Әзірше жұмыстар жоқ',
    emptyGenDesc: 'Алғашқы генерацияны бастаңыз — фото мен бейнелеріңіз осында пайда болады',
    createMasterpiece: 'Шедевр жасау',
    emptyLikedTitle: 'Сақталған жұмыстар жоқ',
    emptyLikedDesc: 'Таспадағы фотолар мен бейнелерге лайк басып, осында сақтаңыз',
    goToFeed: 'Таспаға өту',
    emptyAlbumTitle: 'Альбом әзірше бос',
    emptyAlbumDesc: 'Осы топтамаға генерацияларды қосу үшін «+ Жұмыс қосу» түймесін басыңыз.',

    // Settings
    secBadgeTitle: 'Деректер қауіпсіздігі & Telegram Verified',
    secBadgeDesc: 'Қызмет Telegram Bot API стандарттарын қатаң сақтайды, AES-256 шифрлауымен және AI қауіпсіздігімен қорғалған.',

    langSectionTitle: 'Тілді таңдау',
    langLabel: 'Интерфейс тілі',
    langDesc: 'Қосымшаның ыңғайлы тілін таңдаңыз',

    legalSectionTitle: 'Құпиялылық & Қауіпсіздік',
    privacyPolicy: 'Құпиялылық саясаты',
    privacyDesc: 'Жеке деректер мен медиа файлдарды қорғау',
    termsAndSafety: 'Сервис ережелері & AI Қауіпсіздігі',
    termsDesc: 'Контент стандарттары және бұғаттаудан қорғау кепілі',

    supportSectionTitle: 'Ақпарат & Қолдау',
    supportCare: 'Telegram қолдау қызметі',
    supportCareDesc: 'Оператор 5 минут ішінде жауап береді',
    officialChannel: 'Morphi ресми арнасы',
    officialChannelDesc: 'Жаңалықтар, промпттар және хабарландырулар',

    clearCache: 'Кэшті тазалау',
    clearCacheDesc: 'Құрылғының жергілікті жадын босату',
    clearCacheSuccess: 'Жергілікті кэш сәтті тазаланды!',
    clearCacheConfirmTitle: 'Кэшті тазалау керек пе?',
    clearCacheConfirmDesc: 'Уақытша файлдар мен кэштелген превьюлер қайта жүктеледі.',
    clearBtn: 'Тазалау',

    logout: 'Аккаунттан шығу',
    logoutConfirmTitle: 'Аккаунттан шығу керек пе?',
    logoutConfirmDesc: 'Telegram арқылы кез келген уақытта қайта кіре аласыз.',
    logoutSessionEnded: 'Сессия аяқталды',

    // Recharge
    rechargeModalTitle: 'Балансты толтыру',
    rechargeModalCredits: 'Несиені толтыру',
    currentBalance: 'Ағымдағы теңгерім: {balance} CR',
    pkgStoriesPhotos: 'Ертегілер мен фото үшін',
    pkgHitBonus: 'ХИТ • +50 СЫЙЛЫҚҚА',
    pkgOptimalSet: 'Оңтайлы жинақ',
    pkgVipBonus: 'VIP • +250 СЫЙЛЫҚҚА',
    pkgMaxVideo: 'Максимум бейне мен музыка',
    paymentMethodsHint: 'Telegram Stars, СБП және банк карталары арқылы төлем',
    ready: 'Дайын',
    prompt: 'Промпт',
    copied: 'Көшірілді',
    pack100Hint: '~10 фото / ~8 бейне',
    pack350Hint: '~35 фото / ~30 бейне',
    rechargeModalDesc: 'Flux 1.1 Pro және Kling HD модельдеріне кіру үшін токендер пакетін таңдаңыз:',
    hitBadge: 'Хит • 30% пайда',
    vipBadge: 'VIP Пакет',
    tokensCredited: '+{amount} несие есептелді!'
  }
};

// Функция помощник для перевода тегов и названий
export const translateDynamic = (text, lang = 'ru') => {
  if (!text) return '';
  const mapping = {
    // Теги
    'Фото 8K': { en: '8K Photo', kz: '8K Фото' },
    'Портреты': { en: 'Portraits', kz: 'Портреттер' },
    'Эксклюзив': { en: 'Exclusive', kz: 'Эксклюзив' },
    'Digital Арт': { en: 'Digital Art', kz: 'Сандық Арт' },
    'Видео 1080p': { en: '1080p Video', kz: '1080p Бейне' },
    'Кино-физика': { en: 'Cinema Physics', kz: 'Кино-физика' },
    'Арт': { en: 'Art', kz: 'Арт' },
    'Дизайн & 3D': { en: 'Design & 3D', kz: 'Дизайн & 3D' },
    'Оживление фото': { en: 'Animate photo', kz: 'Фотоны жандандыру' },
    'Динамика': { en: 'Dynamics', kz: 'Динамика' },
    'Качество': { en: 'Quality', kz: 'Сапа' },
    'Архитектура': { en: 'Architecture', kz: 'Сәулет' },
    'Сказки & Квесты': { en: 'Stories & Quests', kz: 'Ертегілер & Квесттер' },
    'Кодинг': { en: 'Coding', kz: 'Бағдарламалау' },
    'Рерайтинг': { en: 'Rewriting', kz: 'Қайта жазу' },
    'Фото': { en: 'Photo', kz: 'Фото' },
    'Видео': { en: 'Video', kz: 'Бейне' },
    'Текст': { en: 'Text', kz: 'Мәтін' },
    'Все': { en: 'All', kz: 'Барлығы' },
    // Примеры
    'День Рождения': { en: 'Birthday', kz: 'Туған күн' },
    'Reels — Столкновение': { en: 'Reels — Collision', kz: 'Reels — Соқтығысу' },
    'Сказка': { en: 'Fairy Tale', kz: 'Ертегі' },
    'Видео-морфинг': { en: 'Video morphing', kz: 'Бейне-морфинг' },
    'Книга ИИ': { en: 'AI Book', kz: 'AI Кітабы' },
    // Описания
    'Гиперреалистичные портреты и фото студийного качества': { 
      en: 'Hyper-realistic studio-quality portraits and photos', 
      kz: 'Гиперреалистік студиялық сападағы портреттер мен фотолар' 
    },
    'Креативная генерация ярких digital-артов и дизайн-иллюстраций': { 
      en: 'Creative generation of bright digital arts and illustrations', 
      kz: 'Жарқын цифрлық өнер мен дизайн-иллюстрацияларды жасау' 
    },
    'Плавные кинематографичные видео и анимация персонажей': { 
      en: 'Smooth cinematic videos and character animation', 
      kz: 'Тегіс кинематографиялық бейнелер мен кейіпкерлер анимациясы' 
    },
    'Непревзойденная художественная композиция и стиль': { 
      en: 'Unmatched artistic composition and styling', 
      kz: 'Теңдессіз көркемдік композиция және стиль' 
    }
  };

  if (lang === 'ru') return text;
  return mapping[text]?.[lang] || text;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('morphai_lang') || 'ru';
  });

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLanguage(newLang);
      localStorage.setItem('morphai_lang', newLang);
    }
  };

  const t = (key, params = {}) => {
    const langDict = translations[language] || translations.ru;
    let text = langDict[key] || translations.ru[key] || key;
    
    Object.keys(params).forEach(p => {
      text = text.replace(`{${p}}`, params[p]);
    });
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, translateDynamic: (text) => translateDynamic(text, language) }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
