import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, AlertCircle, Info, Sparkles, CreditCard, 
  Clock, Phone, Mail, CheckCircle2, Lock
} from 'lucide-react';
import { VisaLogo, MastercardLogo, ThreeDSecureBadge, PciDssBadge, PaymentTrustRow } from './PaymentBadges';
import { fetchPublicTariffs } from '../services/api';
import { useUser } from './UserContext';
import { useToast } from './ToastContext';
import { useCurrency } from './CurrencyContext';

// Статические дефолтные пакеты с неразрывными пробелами \u00A0
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
    priceFormatted: '1\u00A0490\u00A0₸',
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
    priceFormatted: '3\u00A0990\u00A0₸',
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
    priceFormatted: '9\u00A0990\u00A0₸',
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
    priceFormatted: '18\u00A0990\u00A0₸',
    popular: false,
    badge: 'МАКСИМУМ',
  },
];

const RechargeModal = ({ isOpen, onClose, balance = 0, initialPackage = null }) => {
  const { currentUser, refreshUser } = useUser();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

  const [tariffsList, setTariffsList] = useState(RECHARGE_PACKAGES);
  const [connectingPackage, setConnectingPackage] = useState(null);

  useEffect(() => {
    if (initialPackage && isOpen) {
      setConnectingPackage(initialPackage);
    }
  }, [initialPackage, isOpen]);

  // Динамическая загрузка актуальных тарифов с бэкенда
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    fetchPublicTariffs().then((serverTariffs) => {
      if (!isMounted || !Array.isArray(serverTariffs) || serverTariffs.length === 0) return;

      const formatted = serverTariffs.map((t) => {
        const cost = Number(t.price_rub || t.price || 0);
        const cr = Number(t.credits || 100);
        const isPop = !!(t.badge && (t.badge.toLowerCase().includes('хит') || t.badge.toLowerCase().includes('выгод') || t.badge.toLowerCase().includes('hit')));
        
        // Гарантируем неразрывный пробел \u00A0 между цифрами и символом ₸, чтобы кнопка никогда не переносилась на две строки
        const displayPrice = `${cost.toLocaleString('ru-RU').replace(/\s+/g, '\u00A0')}\u00A0₸`;

        return {
          id: t.id,
          amount: cr,
          credits: cr,
          title: t.name ? (t.name.includes('CR') ? t.name : `${cr} CR`) : `${cr} CR`,
          name: t.name || `${cr} CR`,
          desc: t.desc || t.description || `${cr} кредитов для всех ИИ-моделей`,
          price: cost,
          price_rub: cost,
          priceFormatted: displayPrice,
          popular: isPop,
          badge: t.badge || null,
        };
      });

      setTariffsList(formatted);
    }).catch((err) => {
      console.warn('[RechargeModal] Could not fetch server tariffs, using defaults:', err.message);
    });

    return () => { isMounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

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

      {/* ======================================================== */}
      {/* ОФИЦИАЛЬНОЕ ОКНО ДЛЯ ЭКВАЙРИНГА: ОПЛАТА ВРЕМЕННО ПОДКЛЮЧАЕТСЯ */}
      {/* ======================================================== */}
      {connectingPackage && (
        <div className="tariffs-modal-overlay" onClick={() => setConnectingPackage(null)}>
          <div 
            className="tariffs-modal-box" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '460px', padding: '28px 24px' }}
          >
            {/* Статус-иконка часов / подключения */}
            <div 
              className="modal-status-icon" 
              style={{ 
                background: 'rgba(229, 185, 92, 0.14)', 
                borderColor: 'rgba(229, 185, 92, 0.4)',
                color: '#e5b95c'
              }}
            >
              <Clock size={30} />
            </div>

            {/* Официальный заголовок по требованию эквайринга */}
            <h3 className="modal-title" style={{ fontSize: '1.35rem', marginBottom: '8px' }}>
              Оплата временно подключается
            </h3>

            {/* Выбранный тариф */}
            <div className="modal-badge-row" style={{ marginBottom: '16px' }}>
              <span className="modal-package-tag">{connectingPackage.title} ({connectingPackage.amount} CR)</span>
              <span className="modal-price-tag">{connectingPackage.priceFormatted}</span>
            </div>

            {/* Информационный текст для проверяющих органов и пользователей */}
            <div 
              className="modal-alert-box" 
              style={{ 
                background: 'rgba(229, 185, 92, 0.08)', 
                borderColor: 'rgba(229, 185, 92, 0.28)',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: '1.55',
                fontSize: '0.84rem',
                flexDirection: 'column',
                gap: '8px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e5b95c', fontWeight: 700 }}>
                <Info size={18} className="alert-box-icon" />
                <span>Интеграция онлайн-оплаты</span>
              </div>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)' }}>
                В настоящее время мы готовим подключение официального интернет-эквайринга для обеспечения безопасной онлайн-оплаты банковскими картами.
              </p>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.72)' }}>
                После завершения необходимых процедур и подтверждения подключения платёжного провайдера оплата станет доступна непосредственно в сервисе.
              </p>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.78rem' }}>
                До запуска онлайн-оплаты мы сообщим пользователям о доступных способах оплаты.
              </p>
            </div>

            {/* Блок контактов поддержки ИП */}
            <div 
              style={{ 
                background: 'rgba(255, 255, 255, 0.035)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 14px',
                textAlign: 'left',
                fontSize: '0.78rem',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} color="#e5b95c" />
                <span>Поддержка: <a href="mailto:zlznvoxana@gmail.com" style={{ color: '#e5b95c', textDecoration: 'none', fontWeight: 600 }}>zlznvoxana@gmail.com</a></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="#e5b95c" />
                <span>Телефон: <a href="tel:+77053326990" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 500 }}>+7 705 332 6990</a></span>
              </div>
            </div>

            {/* Банковские логотипы платежных систем */}
            <div className="modal-logos-row" style={{ marginTop: '4px', marginBottom: '18px' }}>
              <div className="modal-logo-pill"><VisaLogo height={22} /></div>
              <div className="modal-logo-pill"><MastercardLogo height={24} /></div>
              <ThreeDSecureBadge height={24} />
              <PciDssBadge height={24} />
            </div>

            {/* Кнопка закрытия */}
            <button
              type="button"
              className="checkout-submit-btn"
              onClick={() => setConnectingPackage(null)}
              style={{ 
                width: '100%', 
                padding: '13px', 
                fontSize: '0.92rem',
                background: 'linear-gradient(135deg, #b0173d 0%, #850e2b 100%)',
                borderColor: 'rgba(229, 185, 92, 0.4)'
              }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RechargeModal;
