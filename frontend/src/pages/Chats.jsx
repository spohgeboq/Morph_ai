import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import { useLanguage } from '../components/LanguageContext';
import { useCurrency } from '../components/CurrencyContext';
import { 
  Plus, 
  ChevronRight, 
  Camera, 
  Play, 
  FileText, 
  Sparkles, 
  ArrowLeft, 
  Download, 
  Trash2, 
  Send, 
  Copy,
  Check,
  RotateCcw,
  X
} from 'lucide-react';
import { useUser } from '../components/UserContext';
import { fetchUserGenerations, checkTaskStatus } from '../services/api';
import { formatModelDisplayName } from '../utils/modelNames';

// Базовые соответствия стоимости моделей
const MODEL_COSTS = {
  'kling': 12,
  'hailuo': 12,
  'luma': 12,
  'runway': 15,
  'seedance': 12,
  'flux': 8,
  'dalle3': 10,
  'imagen3': 10,
  'gpt-4o': 3,
  'claude-3-5': 3,
  'gemini-flash': 2
};

const INITIAL_CHATS = [];

const getCleanModelBadge = (chat) => {
  if (!chat) return 'AI';
  if (chat.category === 'text') {
    const raw = chat.modelName || chat.versionName || 'AI Сказки';
    return raw.split(' • ')[0].trim();
  }
  const raw = chat.versionName || chat.modelName || 'AI';
  return raw.split(' • ')[0].trim();
};

const Chats = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, showConfirm } = useToast();
  const { t, translateDynamic } = useLanguage();
  const { formatPrice } = useCurrency();
  const { currentUser, balance: userBalance } = useUser();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Баланс пользователя
  const balance = userBalance !== undefined ? userBalance : 120;
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Загрузка сохраненных чатов или использование демо-данных
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('morphai_chats_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return INITIAL_CHATS;
      }
    }
    return INITIAL_CHATS;
  });

  // Загрузка реальных генераций с бэкенда при авторизованном пользователе
  useEffect(() => {
    if (currentUser) {
      const id = currentUser.telegram_id || currentUser.id;
      if (id) {
        fetchUserGenerations(id).then((serverGens) => {
          if (serverGens && serverGens.length > 0) {
            setChats(prev => {
              if (prev && prev.length > 0) return prev;
              return serverGens.map(g => {
                const isText = g.task_type === 'text';
                const isVideo = g.task_type === 'video';
                const cleanModel = formatModelDisplayName(g.model_name, g.task_type);

                return {
                  id: 'chat_' + (g.id || g.task_id),
                  title: g.prompt?.slice(0, 35) || 'Генерация',
                  modelId: g.model_name || (isText ? 'gpt-4o' : 'kling'),
                  modelName: cleanModel,
                  versionName: g.tier_name ? formatModelDisplayName(g.tier_name, g.task_type) : cleanModel,
                  cost: g.credits_charged || (isText ? 3 : 10),
                  category: isVideo ? 'video' : (isText ? 'text' : 'photo'),
                  time: 'Недавно',
                  dateStr: new Date(g.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                  preview: isText ? '' : g.result_url,
                  messages: [
                    {
                      id: 'm_u_' + g.id,
                      sender: 'user',
                      text: g.prompt,
                      time: '12:00'
                    },
                    {
                      id: 'm_a_' + g.id,
                      sender: 'ai',
                      type: isVideo ? 'video' : (isText ? 'text' : 'image'),
                      prompt: g.prompt,
                      mediaUrl: isText ? null : g.result_url,
                      text: isText ? (g.result_text || g.result_url || g.prompt) : `Генерация завершена через ${cleanModel}.`,
                      time: '12:01'
                    }
                  ]
                };
              });
            });
          }
        }).catch(() => {});
      }
    }
  }, [currentUser]);

  // Активная вкладка фильтра ('all' | 'photo' | 'video' | 'text')
  const [activeTab, setActiveTab] = useState('all');

  // Выбранный чат для открытия полноэкранного окна сессии
  const [activeChat, setActiveChat] = useState(null);

  // Автоматическое открытие чата при переходе из Создать (newChat) или Профиля (истории генераций)
  useEffect(() => {
    if (location.state?.newChat) {
      const newSession = location.state.newChat;
      setChats(prev => {
        const filtered = prev.filter(c => c.id !== newSession.id);
        return [newSession, ...filtered];
      });
      setActiveChat(newSession);
      return;
    }
    if (location.state?.chatId) {
      const found = chats.find(c => c.id === location.state.chatId);
      if (found) {
        setActiveChat(found);
        return;
      }
    }
    if (location.state?.work) {
      const work = location.state.work;
      const isText = work.type === 'text';
      const isVideo = work.type === 'video';
      const cleanModel = formatModelDisplayName(work.model, work.type);

      const found = chats.find(c => 
        c.id === work.chatId || 
        c.title === work.title ||
        c.messages?.some(m => m.prompt === work.prompt || m.mediaUrl === work.media || m.mediaUrl === work.thumb)
      );
      if (found) {
        setActiveChat(found);
      } else {
        const newSession = {
          id: 'chat_' + (work.id || Date.now()),
          title: work.title || 'Сессия генерации',
          modelId: work.model?.toLowerCase().includes('kling') ? 'kling-hd' : (isText ? 'gpt-4o' : 'flux-pro'),
          modelName: cleanModel,
          versionName: cleanModel,
          cost: work.cost || (isText ? 3 : 10),
          category: isVideo ? 'video' : (isText ? 'text' : 'photo'),
          time: 'Недавно',
          dateStr: work.date || 'Сегодня',
          preview: isText ? '' : (work.thumb || work.media),
          messages: [
            {
              id: 'm_init_user',
              sender: 'user',
              text: work.prompt || work.title,
              time: '14:30'
            },
            {
              id: 'm_init_ai',
              sender: 'ai',
              type: isVideo ? 'video' : (isText ? 'text' : 'image'),
              prompt: work.prompt,
              mediaUrl: isText ? null : (work.media || work.thumb),
              text: work.storyText || (isText ? work.prompt : `Шедевр успешно сгенерирован через ${cleanModel}.`),
              time: '14:31'
            }
          ]
        };
        setChats(prev => [newSession, ...prev]);
        setActiveChat(newSession);
      }
    }
  }, [location.state]);

  // Polling для незавершенных асинхронных генераций (видео / фото) в чате
  useEffect(() => {
    if (!activeChat) return;

    const pendingMsg = activeChat.messages?.find(
      m => m.sender === 'ai' && (m.status === 'pending' || (!m.mediaUrl && m.type !== 'text')) && m.taskId
    );
    if (!pendingMsg) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const res = await checkTaskStatus(pendingMsg.taskId);
        if (!isSubscribed) return;

        if (res?.status === 'completed') {
          clearInterval(interval);
          const resultUrl = res.resultUrl || res.result_url || res.output?.video || res.output?.image_url;

          setActiveChat(prev => {
            if (!prev) return null;
            const updatedMessages = prev.messages.map(m => {
              if (m.id === pendingMsg.id) {
                return {
                  ...m,
                  status: 'completed',
                  mediaUrl: resultUrl,
                  text: prev.category === 'video' ? 'Ваше видео готово!' : 'Ваше изображение готово!',
                };
              }
              return m;
            });
            const updated = {
              ...prev,
              preview: resultUrl || prev.preview,
              isGenerating: false,
              messages: updatedMessages,
            };
            setChats(all => all.map(c => (c.id === prev.id ? updated : c)));
            return updated;
          });
          showToast('Шедевр готов! Результат доставлен.', 'success');
        } else if (res?.status === 'failed') {
          clearInterval(interval);
          const errorMsg = res.errorMessage || res.error_message || 'Сбой провайдера';
          setActiveChat(prev => {
            if (!prev) return null;
            const updatedMessages = prev.messages.map(m => {
              if (m.id === pendingMsg.id) {
                return {
                  ...m,
                  status: 'failed',
                  text: `Ошибка генерации: ${errorMsg}. Кредиты возвращены.`,
                };
              }
              return m;
            });
            const updated = { ...prev, isGenerating: false, messages: updatedMessages };
            setChats(all => all.map(c => (c.id === prev.id ? updated : c)));
            return updated;
          });
          showToast('Сбой генерации. Кредиты возвращены на баланс.', 'error');
        }
      } catch (err) {
        console.error('Polling in chat error:', err);
      }
    }, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [activeChat?.id, activeChat?.messages]);

  // Поле ввода для продолжения диалога
  const [replyInput, setReplyInput] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState(null);

  // Синхронизация с localStorage
  useEffect(() => {
    localStorage.setItem('morphai_chats_history', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('morphai_balance', String(balance));
  }, [balance]);

  // Автоскролл к последнему сообщению в активном чате
  useEffect(() => {
    if (activeChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages, isReplying]);

  // Фильтрация чатов по вкладкам
  const filteredChats = chats.filter(chat => {
    if (activeTab === 'all') return true;
    return chat.category === activeTab;
  });

  // Быстрый переход в создание
  const handleGoCreate = () => {
    navigate('/create');
  };

  // Удаление чата
  const handleDeleteChat = (chatId, e) => {
    if (e) e.stopPropagation();
    showConfirm({
      title: 'Удалить диалог?',
      message: 'История сообщений и генераций в этой сессии будет удалена.',
      confirmText: 'Удалить',
      isDanger: true,
      onConfirm: () => {
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (activeChat?.id === chatId) {
          setActiveChat(null);
        }
        showToast('Диалог удален', 'info');
      }
    });
  };

  // Сброс истории (для демонстрации пустого состояния пользователю)
  const handleToggleEmptyState = () => {
    if (chats.length > 0) {
      setChats([]);
    } else {
      setChats(INITIAL_CHATS);
    }
  };

  // Прикрепление фото через кнопку камеры
  const handleAttachPhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedImage(URL.createObjectURL(file));
    }
  };

  // Автоматическое расширение textarea в высоту при вводе текста (как в WhatsApp / Telegram)
  const handleTextChange = (e) => {
    setReplyInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollH, 120)}px`;
    }
  };

  // Обработка клавиш: Enter отправляет, Shift+Enter переносит строку
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  // Стоимость отправки запроса в текущем чате
  const currentModelCost = activeChat 
    ? (activeChat.cost || MODEL_COSTS[activeChat.modelId] || 8) 
    : 8;

  // Отправка нового сообщения в открытом чате (ИДЕЯ 3: просто и понятно)
  const handleSendReply = () => {
    if (!replyInput.trim() || !activeChat || isReplying) return;

    if (balance < currentModelCost) {
      showToast('Недостаточно кредитов для генерации! Пополните баланс.', 'error');
      setShowRechargeModal(true);
      return;
    }

    const userText = replyInput.trim();
    const userAttached = attachedImage;
    setReplyInput('');
    setAttachedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Списание кредитов
    setBalance(prev => Math.max(0, prev - currentModelCost));

    const newMsgUser = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: userText,
      attachedImage: userAttached,
      time: 'Только что'
    };

    setActiveChat(prev => ({
      ...prev,
      messages: [...prev.messages, newMsgUser]
    }));

    setIsReplying(true);

    setTimeout(() => {
      const newMsgAi = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        type: activeChat.category === 'text' ? 'text' : 'image',
        mediaUrl: activeChat.preview || 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
        prompt: userText,
        text: activeChat.category === 'text' 
          ? `Ответ по запросу «${userText}» готов.` 
          : `Новый результат успешно сгенерирован по запросу: «${userText}».`,
        time: 'Только что'
      };

      setActiveChat(prev => {
        const updated = {
          ...prev,
          messages: [...prev.messages, newMsgAi]
        };
        // Обновить также в общем списке
        setChats(all => all.map(c => c.id === prev.id ? updated : c));
        return updated;
      });

      setIsReplying(false);
    }, 1800);
  };

  // Копирование промпта
  const handleCopyPrompt = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(msgId);
    setTimeout(() => setCopiedPromptId(null), 1800);
  };

  return (
    <div className="chats-page-wrapper">
      {/* 1. Верхняя шапка раздела "Чаты" */}
      <header className="chats-header-row">
        <div className="chats-title-wrap">
          <h1 className="chats-page-title">{t('chatsTitle')}</h1>
          {chats.length > 0 && (
            <span className="chats-count-badge">{chats.length}</span>
          )}
        </div>

        <div className="chats-header-actions">
          {/* Кнопка-тумблер демо: переключение между пустым экраном и списком */}
          <button 
            className="chats-demo-toggle-btn"
            onClick={handleToggleEmptyState}
            title="Тест пустого экрана и списка"
          >
            <RotateCcw size={12} />
            <span>{chats.length === 0 ? 'Загрузить историю' : 'Очистить историю'}</span>
          </button>

          {/* Кнопка создания нового чата (+) */}
          <button 
            className="chats-new-chat-btn" 
            onClick={() => handleGoCreate()}
            aria-label="Создать новый чат"
          >
            <Plus size={20} strokeWidth={2.6} />
          </button>
        </div>
      </header>

      {/* 2. ПУСТОЕ СОСТОЯНИЕ (КОГДА ЧЕЛОВЕК ЗАХОДИТ ВПЕРВЫЕ И НИЧЕГО НЕТ) */}
      {chats.length === 0 ? (
        <div className="chats-empty-stage">
          <div className="chats-empty-glow-orb">
            <Sparkles size={38} color="#e5b95c" />
          </div>

          <h2 className="chats-empty-title">Здесь начнется ваша история</h2>
          <p className="chats-empty-desc">
            Все сгенерированные вами фотографии, кинематографичные видео и тексты 
            будут бережно сохраняться в этом разделе. Возвращайтесь к ним в любой момент!
          </p>

          <button 
            className="chats-empty-create-btn"
            onClick={() => handleGoCreate()}
          >
            <Sparkles size={17} />
            <span>Создать первый шедевр</span>
          </button>

          {/* Быстрые подсказки для первого старта */}
          <div className="chats-empty-starters">
            <button className="chats-starter-pill" onClick={() => handleGoCreate()}>
              <Camera size={13} color="#e5b95c" />
              <span>Создать фото</span>
            </button>
            <button className="chats-starter-pill" onClick={() => handleGoCreate()}>
              <Play size={12} fill="#e5b95c" color="#e5b95c" />
              <span>Оживить видео</span>
            </button>
            <button className="chats-starter-pill" onClick={() => handleGoCreate()}>
              <FileText size={13} color="#e5b95c" />
              <span>Написать текст</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3. СПИСОК ЧАТОВ (ВАРИАНТ А: ИНТЕЛЛЕКТУАЛЬНЫЕ МЕДИА-КАРТОЧКИ) */
        <>
          {/* Фильтры категорий */}
          <div className="chats-filter-tabs">
            <button 
              className={`chats-filter-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <span>{t('all')}</span>
            </button>
            <button 
              className={`chats-filter-tab ${activeTab === 'photo' ? 'active' : ''}`}
              onClick={() => setActiveTab('photo')}
            >
              <Camera size={12} />
              <span>{t('photo')}</span>
            </button>
            <button 
              className={`chats-filter-tab ${activeTab === 'video' ? 'active' : ''}`}
              onClick={() => setActiveTab('video')}
            >
              <Play size={11} fill="currentColor" />
              <span>{t('video')}</span>
            </button>
            <button 
              className={`chats-filter-tab ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTab('text')}
            >
              <FileText size={12} />
              <span>{t('text')}</span>
            </button>
          </div>

          {/* Список сессий */}
          <div className="chats-list-grid">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <div 
                  key={chat.id}
                  className="chat-session-card"
                  onClick={() => setActiveChat(chat)}
                >
                  {/* Левое наглядное медиа-превью результата */}
                  <div className="chat-card-thumb-box">
                    {chat.category === 'text' ? (
                      <FileText size={22} color="#e5b95c" />
                    ) : (chat.category === 'video' || (typeof chat.preview === 'string' && chat.preview.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i))) ? (
                      <>
                        {chat.preview ? (
                          <video src={chat.preview} muted playsInline autoPlay loop className="chat-card-thumb-video" />
                        ) : null}
                        <span className="chat-thumb-cat-badge">
                          <Play size={10} fill="#ffffff" />
                        </span>
                      </>
                    ) : (
                      <>
                        {chat.preview ? (
                          <img src={chat.preview} alt="" className="chat-card-thumb-img" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : null}
                        <span className="chat-thumb-cat-badge">
                          <Camera size={10} />
                        </span>
                      </>
                    )}
                  </div>

                  {/* Центральный блок: заголовок и модель */}
                  <div className="chat-card-info-col">
                    <span className="chat-card-title">{chat.title}</span>
                    <div className="chat-card-meta-row">
                      <span className="chat-card-model-pill">
                        {getCleanModelBadge(chat)}
                      </span>
                    </div>
                  </div>

                  {/* Правый блок: время и стрелочка перехода */}
                  <div className="chat-card-right-col">
                    <span className="chat-card-time-pill">{chat.time}</span>
                    <ChevronRight size={18} className="chat-card-arrow" />
                  </div>
                </div>
              ))
            ) : (
              <div className="chats-empty-state">
                <div className="chats-empty-icon-wrap">
                  <Sparkles size={28} />
                </div>
                <h4 className="chats-empty-title">{t('emptyGenTitle') || 'У вас пока нет генераций'}</h4>
                <p className="chats-empty-sub">Выберите нейросеть и создайте свой первый шедевр</p>
                <button className="chats-empty-create-btn" onClick={handleGoCreate}>
                  <Plus size={16} strokeWidth={3} />
                  <span>Перейти в Создать</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* 4. ПОЛНОЭКРАННОЕ ОКНО СЕССИИ ДИАЛОГА (INSIDE CHAT VIEWER - ИДЕЯ 3) */}
      {activeChat && (
        <div className="chat-session-viewer-overlay">
          {/* Шапка окна сессии */}
          <header className="session-viewer-header">
            <button 
              className="session-back-btn" 
              onClick={() => setActiveChat(null)}
              aria-label="Назад к списку чатов"
            >
              <ArrowLeft size={18} />
            </button>

            {/* Название модели и версия (без зеленых статусов) */}
            <div className="session-header-title-box">
              <span className="session-model-name">{activeChat.modelName}</span>
              <span className="session-version-tag">{activeChat.versionName}</span>
            </div>

            {/* Правый блок: капсула баланса и кнопка удаления */}
            <div className="session-header-actions-right">
              <div className="balance-capsule mini" onClick={() => setShowRechargeModal(true)}>
                <div className="balance-info">
                  <div className="credit-token-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 12L12 22L22 12L12 2Z" stroke="#e5b95c" strokeWidth="2.4" strokeLinejoin="round" fill="rgba(229, 185, 92, 0.25)" />
                      <path d="M12 6L6 12L12 18L18 12L12 6Z" stroke="#e5b95c" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <span className="balance-amount">{balance}</span>
                </div>
                <button className="balance-add-btn mini">
                  <Plus size={10} strokeWidth={3} />
                </button>
              </div>

              <button 
                className="session-delete-btn"
                onClick={(e) => handleDeleteChat(activeChat.id, e)}
                title="Удалить сессию"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </header>

          {/* Лента сообщений сессии */}
          <div className="session-messages-scroll">
            {activeChat.messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`session-bubble-wrap ${msg.sender === 'user' ? 'user-msg' : 'ai-msg'}`}
              >
                {msg.sender === 'user' ? (
                  <div className="user-bubble-card">
                    {msg.attachedImage && (
                      <div className="user-attached-thumb">
                        <img src={msg.attachedImage} alt="Прикрепленное фото" />
                      </div>
                    )}
                    <div className="user-bubble-text">{msg.text}</div>
                    <span className="bubble-time-stamp">{msg.time}</span>
                  </div>
                ) : (
                  <div className="ai-bubble-card">
                    {msg.status === 'pending' || (!msg.mediaUrl && msg.type !== 'text') ? (
                      <div className="ai-pending-container" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                        <div className="generation-spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#ff4d8d', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <div style={{ fontSize: '13px', color: '#f3f4f6', fontWeight: 500 }}>{msg.text || 'Генерация в процессе...'}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>Создаём шедевр, подождите немного...</div>
                      </div>
                    ) : msg.mediaUrl ? (
                      <div className="ai-media-container">
                        {msg.type === 'video' || (msg.mediaUrl && msg.mediaUrl.includes('.mp4')) ? (
                          <video 
                            src={msg.mediaUrl} 
                            controls 
                            autoPlay 
                            loop 
                            playsInline 
                            className="ai-result-media" 
                            style={{ width: '100%', borderRadius: '12px', maxHeight: '420px', objectFit: 'contain', backgroundColor: '#000' }}
                          />
                        ) : (
                          <img src={msg.mediaUrl} alt="Результат" className="ai-result-media" />
                        )}
                        
                        {/* Кнопка быстрого скачивания в правом верхнем углу кадра */}
                        <a 
                          href={msg.mediaUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          download
                          className="ai-media-download-floating-btn"
                          title="Открыть или скачать в HD"
                        >
                          <Download size={15} />
                        </a>
                      </div>
                    ) : (
                      <div className="ai-text-result-box" style={{ padding: '14px 16px', fontSize: '14px', lineHeight: 1.6, color: '#f3f4f6', whiteSpace: 'pre-wrap' }}>
                        {msg.text}
                      </div>
                    )}

                    <div className="ai-bubble-details-box">
                      {/* Использованный промпт с кнопкой копирования */}
                      {msg.prompt && (
                        <div className="ai-bubble-prompt-row">
                          <span className="ai-prompt-quote">«{msg.prompt}»</span>
                          <button 
                            className="ai-copy-prompt-btn"
                            onClick={() => handleCopyPrompt(msg.id, msg.prompt)}
                            title="Скопировать промпт"
                          >
                            {copiedPromptId === msg.id ? (
                              <>
                                <Check size={12} color="#4ade80" />
                                <span style={{ color: '#4ade80' }}>{t('copied')}</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>{t('prompt')}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      <div className="ai-bubble-status-row">
                        <span className="ai-status-text">
                          {msg.status === 'pending' ? 'Обработка' : msg.status === 'failed' ? 'Сбой' : t('ready')} • {activeChat.versionName || activeChat.modelName}
                        </span>
                        <span className="bubble-time-stamp">{msg.time}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isReplying && (
              <div className="session-bubble-wrap ai-msg">
                <div className="ai-bubble-card typing-bubble">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="typing-label">Нейросеть генерирует продолжение...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ИДЕЯ 3: ПРОСТАЯ И ПОНЯТНАЯ ПАНЕЛЬ ВВОДА БЕЗ СЛЕПЫХ ИКОНОК */}
          <div className="session-bottom-dock">
            {/* Полоса прикрепленного фото (если выбрано) */}
            {attachedImage && (
              <div className="session-attached-strip">
                <img src={attachedImage} alt="Прикрепленное фото" className="session-attached-img" />
                <span className="session-attached-text">Фото прикреплено к запросу</span>
                <button 
                  className="session-remove-attached-btn" 
                  onClick={() => setAttachedImage(null)}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Скрытый input для загрузки фото */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }}
              onChange={handleAttachPhoto}
            />

            <div className="session-input-wrapper">
              {/* Понятная кнопка камеры (прикрепить фото) */}
              <button 
                type="button"
                className="session-camera-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Прикрепить фото или селфи"
              >
                <Camera size={18} />
              </button>

              {/* Удобное поле ввода с авто-расширением строк (как в WhatsApp / Telegram) */}
              <textarea 
                ref={textareaRef}
                rows={1}
                className="session-input-field session-textarea"
                placeholder={t('chatPlaceholder')}
                value={replyInput}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
              />

              {/* Кнопка отправки со стоимостью */}
              <button 
                className="session-send-action-btn"
                onClick={handleSendReply}
                disabled={!replyInput.trim() || isReplying}
                title={`Отправить (${currentModelCost} CR)`}
              >
                <Send size={14} />
                <span className="session-btn-cost">{currentModelCost} CR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. МОДАЛЬНОЕ ОКНО ПОПОЛНЕНИЯ БАЛАНСА */}
      {showRechargeModal && (
        <div className="modal-backdrop" onClick={() => setShowRechargeModal(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div>
                <h3 className="modal-title">Пополнение баланса</h3>
                <span className="sheet-subtitle">Текущий баланс: {balance} CR</span>
              </div>
              <button className="sheet-close-btn" onClick={() => setShowRechargeModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="credit-packages">
              <div className="credit-pkg-card" onClick={() => { setBalance(b => b + 100); setShowRechargeModal(false); showToast('Начислено +100 кредитов!', 'token'); }}>
                <div className="pkg-left">
                  <span className="pkg-amount">100 CR</span>
                  <span className="pkg-desc">Для сказок и фото</span>
                </div>
                <button className="pkg-price-btn">{formatPrice(1490)}</button>
              </div>

              <div className="credit-pkg-card popular" onClick={() => { setBalance(b => b + 350); setShowRechargeModal(false); showToast('Начислено +350 кредитов!', 'token'); }}>
                <span className="pkg-badge">ХИТ • +50 В ПОДАРОК</span>
                <div className="pkg-left">
                  <span className="pkg-amount">350 CR</span>
                  <span className="pkg-desc">Оптимальный набор</span>
                </div>
                <button className="pkg-price-btn accent">{formatPrice(3990)}</button>
              </div>

              <div className="credit-pkg-card" onClick={() => { setBalance(b => b + 1250); setShowRechargeModal(false); showToast('Начислено +1250 кредитов!', 'token'); }}>
                <span className="pkg-badge vip">VIP • +250 В ПОДАРОК</span>
                <div className="pkg-left">
                  <span className="pkg-amount">1250 CR</span>
                  <span className="pkg-desc">Максимум видео и музыки</span>
                </div>
                <button className="pkg-price-btn">{formatPrice(9990)}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;
