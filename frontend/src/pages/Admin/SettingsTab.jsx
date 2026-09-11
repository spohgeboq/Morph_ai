import React, { useState, useEffect } from 'react';
import { 
  Send, 
  ShieldAlert, 
  Settings, 
  Check, 
  Bot, 
  AlertTriangle, 
  FileText, 
  Sparkles,
  Link2,
  Users
} from 'lucide-react';
import { 
  fetchAdminSettings, 
  saveAdminSetting, 
  sendAdminBroadcast 
} from '../../services/api';

const SettingsTab = ({ onShowToast }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Состояние формы рассылки
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastBtnText, setBroadcastBtnText] = useState('');
  const [broadcastBtnUrl, setBroadcastBtnUrl] = useState('');
  const [testTgId, setTestTgId] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  // Режим техработ
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');

  // Тексты бота
  const [botWelcomeText, setBotWelcomeText] = useState('');
  const [botButtonText, setBotButtonText] = useState('');

  // Тексты документов
  const [termsText, setTermsText] = useState('');
  const [privacyText, setPrivacyText] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminSettings();
      setSettings(data);

      if (data.maintenance_mode) {
        setMaintenanceEnabled(data.maintenance_mode.enabled || false);
        setMaintenanceMsg(data.maintenance_mode.message || '');
      }

      if (data.bot_welcome) {
        setBotWelcomeText(data.bot_welcome.text || '');
        setBotButtonText(data.bot_welcome.button_text || '');
      }

      if (data.terms_safety) {
        setTermsText(data.terms_safety.text || '');
      }

      if (data.privacy_policy) {
        setPrivacyText(data.privacy_policy.text || '');
      }
    } catch (err) {
      onShowToast(err.message || 'Ошибка загрузки настроек', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Сохранение техработ
  const handleSaveMaintenance = async () => {
    try {
      await saveAdminSetting('maintenance_mode', {
        enabled: maintenanceEnabled,
        message: maintenanceMsg,
      });
      onShowToast(maintenanceEnabled ? 'Режим техработ включён' : 'Режим техработ отключён', 'success');
    } catch (err) {
      onShowToast(err.message || 'Ошибка сохранения', 'error');
    }
  };

  // Сохранение текстов бота
  const handleSaveBotTexts = async () => {
    try {
      await saveAdminSetting('bot_welcome', {
        text: botWelcomeText,
        button_text: botButtonText,
      });
      onShowToast('Тексты Telegram-бота сохранены', 'success');
    } catch (err) {
      onShowToast(err.message || 'Ошибка сохранения', 'error');
    }
  };

  // Сохранение юридических текстов
  const handleSaveLegal = async () => {
    try {
      await Promise.all([
        saveAdminSetting('terms_safety', { text: termsText }),
        saveAdminSetting('privacy_policy', { text: privacyText }),
      ]);
      onShowToast('Юридические документы обновлены', 'success');
    } catch (err) {
      onShowToast(err.message || 'Ошибка сохранения', 'error');
    }
  };

  // Отправка рассылки (Тест или Всем)
  const handleBroadcast = async (isTest = false) => {
    if (!broadcastMessage.trim()) {
      onShowToast('Введите текст сообщения для рассылки', 'error');
      return;
    }

    if (isTest && !testTgId) {
      onShowToast('Укажите Telegram ID для тестовой отправки', 'error');
      return;
    }

    if (!isTest && !window.confirm('Внимание! Сообщение будет отправлено ВСЕМ активным пользователям бота. Продолжить?')) {
      return;
    }

    setSendingBroadcast(true);
    setBroadcastResult(null);

    try {
      const res = await sendAdminBroadcast({
        message: broadcastMessage,
        buttonText: broadcastBtnText,
        buttonUrl: broadcastBtnUrl,
        testTelegramId: isTest ? testTgId : null,
      });

      if (isTest) {
        onShowToast('Тестовое сообщение успешно отправлено вам в Telegram!', 'success');
      } else {
        onShowToast(`Рассылка завершена: доставлено ${res.sentCount} сообщений`, 'success');
        setBroadcastResult(res);
      }
    } catch (err) {
      onShowToast(err.message || 'Ошибка отправки рассылки', 'error');
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <div className="admin-settings-tab">
      {/* Шапка раздела */}
      <div className="admin-tab-header">
        <div>
          <h2 className="admin-tab-title">Системные настройки и Рассылка</h2>
          <p className="admin-tab-desc">Управление Telegram-ботом, отправка маркетинговых рассылок и режим технических работ</p>
        </div>
      </div>

      {/* Двухколоночный лейаут для десктопа, на мобилке в 1 колонку */}
      <div className="admin-settings-layout-2col">
        {/* Левая колонка: Telegram Рассылка */}
        <div className="admin-settings-col-left">
          <div className="admin-card" style={{ height: '100%', marginBottom: 0 }}>
            <div className="admin-card-header-actions">
              <div className="broadcast-header-title">
                <Send size={18} color="#e5b95c" />
                <h3 className="admin-card-title">Массовая Telegram-рассылка (Broadcast)</h3>
              </div>
              <span className="broadcast-tip-badge">Поддерживается HTML</span>
            </div>

            <p className="admin-card-subtitle">
              Мгновенная отправка новостей, анонсов новых моделей или промокодов всем пользователям бота
            </p>

            <div className="admin-broadcast-form">
              <div className="admin-form-group">
                <label>Текст сообщения (поддерживаются теги &lt;b&gt;, &lt;i&gt;, &lt;a&gt;)</label>
                <textarea
                  rows="7"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="✨ Привет! Мы запустили новую модель Kling 3.0. Используйте промокод SPRING20 для получения 50 кредитов!"
                  className="admin-form-textarea"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Текст кнопки (опционально)</label>
                  <input
                    type="text"
                    value={broadcastBtnText}
                    onChange={(e) => setBroadcastBtnText(e.target.value)}
                    placeholder="🔥 Открыть Morphi Studio"
                    className="admin-form-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Ссылка кнопки (URL)</label>
                  <input
                    type="text"
                    value={broadcastBtnUrl}
                    onChange={(e) => setBroadcastBtnUrl(e.target.value)}
                    placeholder="https://t.me/your_bot/app"
                    className="admin-form-input"
                  />
                </div>
              </div>

              <div className="broadcast-actions-panel">
                <div className="broadcast-test-send-group">
                  <input
                    type="text"
                    value={testTgId}
                    onChange={(e) => setTestTgId(e.target.value)}
                    placeholder="Ваш Telegram ID"
                    className="admin-form-input test-tg-input"
                  />
                  <button 
                    type="button"
                    className="admin-btn-secondary"
                    disabled={sendingBroadcast}
                    onClick={() => handleBroadcast(true)}
                  >
                    Тест себе
                  </button>
                </div>

                <button
                  type="button"
                  className="admin-btn-primary"
                  disabled={sendingBroadcast || !broadcastMessage.trim()}
                  onClick={() => handleBroadcast(false)}
                >
                  <Send size={16} />
                  <span>{sendingBroadcast ? 'Отправка...' : 'Рассылка всем'}</span>
                </button>
              </div>

              {broadcastResult && (
                <div className="broadcast-result-alert">
                  <Users size={16} color="#10b981" />
                  <span>
                    Рассылка завершена: успешно доставлено <strong>{broadcastResult.sentCount}</strong> из {broadcastResult.totalTargeted} пользователей. Ошибок: {broadcastResult.failedCount}.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Правая колонка: Техработы + Тексты бота + Юридические тексты */}
        <div className="admin-settings-col-right">
          {/* Блок: Режим технических работ */}
          <div className="admin-card">
            <div className="admin-card-header-actions">
              <div className="broadcast-header-title">
                <AlertTriangle size={18} color="#f59e0b" />
                <h3 className="admin-card-title">Режим технических работ (Maintenance)</h3>
              </div>
              <label className="admin-toggle-switch">
                <input
                  type="checkbox"
                  checked={maintenanceEnabled}
                  onChange={(e) => setMaintenanceEnabled(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <p className="admin-card-subtitle">
              Включение заглушки в приложении при проведении обновлений сервера или баз данных
            </p>

            <div className="admin-form-group" style={{ marginTop: '14px' }}>
              <label>Сообщение для пользователей</label>
              <input
                type="text"
                value={maintenanceMsg}
                onChange={(e) => setMaintenanceMsg(e.target.value)}
                placeholder="Проводятся технические работы. Сервис возобновит работу через 15 минут."
                className="admin-form-input"
              />
            </div>

            <button className="admin-btn-primary" onClick={handleSaveMaintenance} style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
              <Check size={16} />
              <span>Применить статус</span>
            </button>
          </div>

          {/* Блок: Настройки текстов Telegram-бота */}
          <div className="admin-card">
            <div className="broadcast-header-title" style={{ marginBottom: '12px' }}>
              <Bot size={18} color="#60a5fa" />
              <h3 className="admin-card-title">Тексты Telegram-бота</h3>
            </div>

            <div className="admin-form-group">
              <label>Приветственное сообщение команды /start</label>
              <textarea
                rows="3"
                value={botWelcomeText}
                onChange={(e) => setBotWelcomeText(e.target.value)}
                className="admin-form-textarea"
              />
            </div>

            <div className="admin-form-group">
              <label>Надпись на кнопке открытия WebApp</label>
              <input
                type="text"
                value={botButtonText}
                onChange={(e) => setBotButtonText(e.target.value)}
                className="admin-form-input"
              />
            </div>

            <button className="admin-btn-primary" onClick={handleSaveBotTexts} style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
              <Check size={16} />
              <span>Сохранить тексты бота</span>
            </button>
          </div>

          {/* Блок: Юридические документы */}
          <div className="admin-card" style={{ marginBottom: 0 }}>
            <div className="broadcast-header-title" style={{ marginBottom: '12px' }}>
              <FileText size={18} color="#c084fc" />
              <h3 className="admin-card-title">Юридические документы</h3>
            </div>

            <div className="admin-form-group">
              <label>Правила безопасности (Terms & Safety)</label>
              <textarea
                rows="3"
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                className="admin-form-textarea"
              />
            </div>

            <div className="admin-form-group">
              <label>Политика конфиденциальности (Privacy Policy)</label>
              <textarea
                rows="3"
                value={privacyText}
                onChange={(e) => setPrivacyText(e.target.value)}
                className="admin-form-textarea"
              />
            </div>

            <button className="admin-btn-primary" onClick={handleSaveLegal} style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
              <Check size={16} />
              <span>Сохранить документы</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SettingsTab;
