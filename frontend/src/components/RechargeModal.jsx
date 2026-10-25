import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertCircle, Info, Sparkles, CreditCard, CheckCircle2, FlaskConical, ExternalLink } from 'lucide-react';
import { VisaLogo, MastercardLogo, ThreeDSecureBadge, PciDssBadge, PaymentTrustRow } from './PaymentBadges';
import { fetchPublicTariffs, triggerTributeTestPayment } from '../services/api';
import { useUser } from './UserContext';
import { useToast } from './ToastContext';
import { useCurrency } from './CurrencyContext';

// Статические дефолтные пакеты (используются как мгновенный фоллбэк до ответа бэкенда)
export const RECHARGE_PACKAGES = [
  {
    id: 1,
    amount: 100,
    credits: 100,
    title: '100 CR',
    name: 'Стартовый',
    desc: 'Для историй и фото',
    price: 1490,
    price_rub: 1490,
    priceFormatted: '1 490 ₸',
    popular: false,
    badge: null,
  },
  {
    id: 2,
    amount: 350,
    credits: 350,
    title: '350 CR',
    name: 'Оптимальный',
    desc: '350 CR + 50 в подарок (всего 400 CR)',
    price: 3990,
    price_rub: 3990,
    priceFormatted: '3 990 ₸',
    popular: true,
    badge: 'ХИТ • +50 В ПОДАРОК',
  },
  {
    id: 3,
    amount: 1250,
    credits: 1250,
    title: '1250 CR',
    name: 'Безлимитный PRO',
    desc: '1250 CR + 250 в подарок (всего 1500 CR)',
    price: 9990,
    price_rub: 9990,
    priceFormatted: '9 990 ₸',
    popular: false,
    badge: 'VIP • +250 В ПОДАРОК',
  },
  {
    id: 4,
    amount: 2500,
    credits: 2500,
    title: '2500 CR',
    name: 'Studio Unlimited',
    desc: 'Studio Unlimited',
    price: 18990,
    price_rub: 18990,
    priceFormatted: '18 990 ₸',
    popular: false,
    badge: 'МАКСИМУМ',
  },
];

const RechargeModal = ({ isOpen, onClose, balance = 0 }) => {
  const { currentUser, refreshUser } = useUser();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

  const [tariffsList, setTariffsList] = useState(RECHARGE_PACKAGES);
  const [connectingPackage, setConnectingPackage] = useState(null);
  const [isTestingSandbox, setIsTestingSandbox] = useState(false);

  // Динамическая загрузка актуальных тарифов с бэкенда (из базы данных PostgreSQL)
  // Если админ в админке меняет цены или добавляет тарифы — клиент сразу получает новые данные!
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    fetchPublicTariffs().then((serverTariffs) => {
      if (!isMounted || !Array.isArray(serverTariffs) || serverTariffs.length === 0) return;

      const formatted = serverTariffs.map((t) => {
        const cost = Number(t.price_rub || t.price || 0);
        const cr = Number(t.credits || 100);
        const isPop = !!(t.badge && (t.badge.toLowerCase().includes('хит') || t.badge.toLowerCase().includes('выгод') || t.badge.toLowerCase().includes('hit')));
        
        return {
          id: t.id,
          amount: cr,
          credits: cr,
          title: t.name ? (t.name.includes('CR') ? t.name : `${cr} CR`) : `${cr} CR`,
          name: t.name || `${cr} CR`,
          desc: t.desc || t.description || `${cr} кредитов для всех ИИ-моделей`,
          price: cost,
          price_rub: cost,
          priceFormatted: formatPrice ? formatPrice(cost) : `${cost.toLocaleString('ru-RU')} ₸`,
          popular: isPop,
          badge: t.badge || null,
          tribute_url: t.tribute_url || null,
        };
      });

      setTariffsList(formatted);
    }).catch((err) => {
      console.warn('[RechargeModal] Could not fetch server tariffs, using defaults:', err.message);
    });

    return () => { isMounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  // Открытие оплаты через Tribute
  const handleOpenTributePayment = (pkg) => {
    const targetUrl = pkg.tribute_url || 'https://t.me/tribute/app';

    if (window.Telegram?.WebApp?.openTelegramLink && targetUrl.includes('t.me/')) {
      window.Telegram.WebApp.openTelegramLink(targetUrl);
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }

    showToast('Открываем защищенную оплату Tribute...', 'info');

    // Периодически опрашиваем баланс, чтобы поймать начисление от вебхука
    const pollInterval = setInterval(() => {
      refreshUser();
    }, 4000);

    // Останавливаем поллинг через 2 минуты
    setTimeout(() => clearInterval(pollInterval), 120000);
  };

  // Бесплатное тестирование (Sandbox): мгновенно начисляет CR в базу без реальных денег!
  const handleExecuteSandboxTest = async (pkg) => {
    setIsTestingSandbox(true);
    try {
      const tgId = currentUser?.telegram_id || currentUser?.id;
      const res = await triggerTributeTestPayment({
        telegram_id: tgId,
        credits: pkg.amount || pkg.credits,
        package_name: pkg.name || pkg.title,
      });

      if (res?.success) {
        showToast(`🎉 +${res.credits_added || pkg.amount} CR успешно начислены!`, 'success');
        refreshUser();
        setConnectingPackage(null);
        onClose();
      } else {
        throw new Error(res?.error || 'Ошибка начисления');
      }
    } catch (err) {
      console.error('[Sandbox Error]', err);
      showToast(err.message || 'Ошибка тестовой оплаты', 'error');
    } finally {
      setIsTestingSandbox(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-header">
            <div className="sheet-title-info">
              <h3>Пополнение баланса</h3>
              <span className="sheet-subtitle">Текущий баланс: {balance} CR</span>
            </div>
            <button className="sheet-close-btn" onClick={onClose} aria-label="Закрыть">
              <X size={20} />
            </button>
          </div>

          <div className="credit-packages">
            {tariffsList.map((pkg) => (
              <div
                key={pkg.id}
                className={`credit-pkg-card ${pkg.popular ? 'popular' : ''}`}
                onClick={() => setConnectingPackage(pkg)}
              >
                {pkg.badge && (
                  <span className={`pkg-badge ${pkg.popular ? '' : 'vip'}`}>{pkg.badge}</span>
                )}
                <div className="pkg-left">
                  <span className="pkg-amount">{pkg.title}</span>
                  <span className="pkg-desc">{pkg.desc}</span>
                </div>
                <button
                  type="button"
                  className={`pkg-price-btn ${pkg.popular ? 'accent' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConnectingPackage(pkg);
                  }}
                >
                  {pkg.priceFormatted}
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px' }}>
            <PaymentTrustRow compact={true} />
          </div>
        </div>
      </div>

      {/* Окно подтверждения оплаты через Tribute (с привязкой карт Казахстана и Sandbox-тестом) */}
      {connectingPackage && (
        <div className="tariffs-modal-overlay" onClick={() => setConnectingPackage(null)}>
          <div className="tariffs-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-status-icon" style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
              <CreditCard size={32} color="#3b82f6" />
            </div>

            <h3 className="modal-title">Оплата через Tribute</h3>

            <div className="modal-badge-row">
              <span className="modal-package-tag">{connectingPackage.title} ({connectingPackage.amount} CR)</span>
              <span className="modal-price-tag">{connectingPackage.priceFormatted}</span>
            </div>

            <p className="modal-description" style={{ fontSize: '13px', lineHeight: '1.5' }}>
              Безопасный эквайринг Telegram от официального сервиса <strong>Tribute</strong> с моментальным зачислением токенов.
            </p>

            <div className="modal-alert-box" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <CheckCircle2 size={18} color="#10b981" className="alert-box-icon" />
              <span style={{ fontSize: '12px' }}>
                <strong>Поддерживаются любые карты Казахстана:</strong> Kaspi Gold, Halyk Bank, Jusan, Forte, CenterCredit, Freedom Bank, Visa, Mastercard и СБП. Вы можете привязать карту в Tribute для оплаты в 1 клик.
              </span>
            </div>

            <div className="modal-logos-row" style={{ marginTop: '12px', marginBottom: '16px' }}>
              <div className="modal-logo-pill"><VisaLogo height={22} /></div>
              <div className="modal-logo-pill"><MastercardLogo height={24} /></div>
              <ThreeDSecureBadge height={24} />
              <PciDssBadge height={24} />
            </div>

            {/* Основная кнопка реальной оплаты через Tribute */}
            <button
              type="button"
              className="modal-close-btn"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '10px'
              }}
              onClick={() => handleOpenTributePayment(connectingPackage)}
            >
              <span>Оплатить {connectingPackage.priceFormatted} картой</span>
              <ExternalLink size={16} />
            </button>

            {/* Кнопка бесплатного Sandbox-теста без списания средств */}
            <button
              type="button"
              className="modal-close-btn"
              style={{
                background: 'rgba(229, 185, 92, 0.12)',
                color: '#e5b95c',
                border: '1px solid rgba(229, 185, 92, 0.35)',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '10px'
              }}
              disabled={isTestingSandbox}
              onClick={() => handleExecuteSandboxTest(connectingPackage)}
            >
              <FlaskConical size={16} />
              <span>{isTestingSandbox ? 'Начисляем токены...' : `🧪 Тестовое пополнение (Sandbox • 0 ₸)`}</span>
            </button>

            <button
              type="button"
              className="modal-close-btn"
              style={{ background: 'transparent', color: 'rgba(255, 255, 255, 0.6)', border: 'none' }}
              onClick={() => setConnectingPackage(null)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RechargeModal;
