import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import { useLanguage } from '../components/LanguageContext';
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
import { fetchUserGenerations } from '../services/api';

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



const Chats = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, showConfirm } = useToast();
  const { t, translateDynamic } = useLanguage();
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
              return serverGens.map(g => ({
                id: 'chat_' + (g.id || g.task_id),
                title: g.prompt?.slice(0, 35) || 'Генерация',
                modelId: g.model_name || 'kling',
                modelName: g.model_name || 'MorphAI',
                versionName: g.tier_name || g.model_name || 'Pro',
                cost: g.credits_charged || 10,
                category: g.task_type === 'video' ? 'video' : (g.task_type === 'text' ? 'text' : 'photo'),
                time: 'Недавно',
                dateStr: new Date(g.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                preview: g.result_url,
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
                    type: g.task_type === 'video' ? 'video' : (g.task_type === 'text' ? 'text' : 'image'),
                    prompt: g.prompt,
                    mediaUrl: g.result_url,
                    text: g.task_type === 'text' ? g.result_url : `Генерация завершена через ${g.model_name || 'MorphAI'}.`,
                    time: '12:01'
                  }
                ]
              }));
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

  // Автоматическое открытие чата при переходе из Профиля (истории генераций)
  useEffect(() => {
    if (location.state?.chatId) {
      const found = chats.find(c => c.id === location.state.chatId);
      if (found) {
        setActiveChat(found);
        return;
      }
    }
    if (location.state?.work) {
      const work = location.state.work;
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
          modelId: work.model?.toLowerCase().includes('kling') ? 'kling-hd' : 'flux-pro',
          modelName: work.model || 'Flux 1.1 Pro',
          versionName: work.model || 'Flux 1.1 Pro',
          cost: work.cost || 10,
          category: work.type === 'video' ? 'video' : 'photo',
          time: 'Недавно',
          dateStr: work.date || 'Сегодня',
          preview: work.thumb || work.media,
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
              type: work.type === 'video' ? 'video' : 'image',
              prompt: work.prompt,
              mediaUrl: work.media || work.thumb,
              text: `Шедевр успешно сгенерирован через ${work.model || 'Morphi AI'}.`,
              time: '14:31'
            }
          ]
        };
        setChats(prev => [newSession, ...prev]);
        setActiveChat(newSession);
      }
    }
  }, [location.state]);

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
                  <div 
                    className="chat-card-thumb-box"
                    style={chat.preview ? { backgroundImage: `url(${chat.preview})` } : {}}
                  >
                    {chat.category === 'text' ? (
                      <FileText size={22} color="#e5b95c" />
                    ) : (
                      <span className="chat-thumb-cat-badge">
                        {chat.category === 'video' ? (
                          <Play size={10} fill="#ffffff" />
                        ) : (
                          <Camera size={10} />
                        )}
                      </span>
                    )}
                  </div>

                  {/* Центральный блок: заголовок и модель */}
                  <div className="chat-card-info-col">
                    <span className="chat-card-title">{chat.title}</span>
                    <div className="chat-card-meta-row">
                      <span className="chat-card-model-pill">
                        {chat.modelName} • {chat.versionName}
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
                    {msg.mediaUrl && (
                      <div className="ai-media-container">
                        <img src={msg.mediaUrl} alt="Результат" className="ai-result-media" />
                        
                        {/* Кнопка быстрого скачивания в правом верхнем углу кадра */}
                        <button 
                          className="ai-media-download-floating-btn"
                          onClick={() => showToast('Шедевр сохранен в галерею в HD!', 'success')}
                          title="Скачать шедевр в HD"
                        >
                          <Download size={15} />
                        </button>
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
                        <span className="ai-status-text">✓ {t('ready')} • {activeChat.versionName}</span>
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

              {/* Кнопка отправки с прозрачной стоимостью [ ➤ 8 CR ] */}
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
                <button className="pkg-price-btn">199 ₽</button>
              </div>

              <div className="credit-pkg-card popular" onClick={() => { setBalance(b => b + 350); setShowRechargeModal(false); showToast('Начислено +350 кредитов!', 'token'); }}>
                <span className="pkg-badge">ХИТ • +50 В ПОДАРОК</span>
                <div className="pkg-left">
                  <span className="pkg-amount">350 CR</span>
                  <span className="pkg-desc">Оптимальный набор</span>
                </div>
                <button className="pkg-price-btn accent">490 ₽</button>
              </div>

              <div className="credit-pkg-card" onClick={() => { setBalance(b => b + 1250); setShowRechargeModal(false); showToast('Начислено +1250 кредитов!', 'token'); }}>
                <span className="pkg-badge vip">VIP • +250 В ПОДАРОК</span>
                <div className="pkg-left">
                  <span className="pkg-amount">1250 CR</span>
                  <span className="pkg-desc">Максимум видео и музыки</span>
                </div>
                <button className="pkg-price-btn">1 290 ₽</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;
