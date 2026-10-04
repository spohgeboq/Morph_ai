import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { VisaLogo, MastercardLogo, ThreeDSecureBadge, PciDssBadge, PaymentTrustRow } from './PaymentBadges';

export const RECHARGE_PACKAGES = [
  {
    id: 'starter',
    amount: 100,
    title: '100 CR',
    desc: 'Для сказок и фото',
    price: 1490,
    priceFormatted: '1 490 ₸',
    popular: false,
    badge: null,
  },
  {
    id: 'optimal',
    amount: 350,
    title: '350 CR',
    desc: 'Оптимальный набор',
    price: 3990,
    priceFormatted: '3 990 ₸',
    popular: true,
    badge: 'ХИТ • +50 В ПОДАРОК',
  },
  {
    id: 'pro',
    amount: 1250,
    title: '1250 CR',
    desc: 'Максимум видео и музыки',
    price: 9990,
    priceFormatted: '9 990 ₸',
    popular: false,
    badge: 'VIP • +250 В ПОДАРОК',
  },
  {
    id: 'unlimited',
    amount: 2500,
    title: '2500 CR',
    desc: 'Studio Unlimited',
    price: 18990,
    priceFormatted: '18 990 ₸',
    popular: false,
    badge: 'МАКСИМУМ',
  },
];

const RechargeModal = ({ isOpen, onClose, balance = 0 }) => {
  const [connectingPackage, setConnectingPackage] = useState(null);

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
            {RECHARGE_PACKAGES.map((pkg) => (
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

      {/* Окно уведомления о подключении эквайринга */}
      {connectingPackage && (
        <div className="tariffs-modal-overlay" onClick={() => setConnectingPackage(null)}>
          <div className="tariffs-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-status-icon">
              <Info size={32} color="#3b82f6" />
            </div>

            <h3 className="modal-title">Оплата временно подключается</h3>

            <div className="modal-badge-row">
              <span className="modal-package-tag">Выбран пакет: {connectingPackage.title}</span>
              <span className="modal-price-tag">{connectingPackage.priceFormatted}</span>
            </div>

            <p className="modal-description">
              Интеграция с защищенным платежным шлюзом интернет-эквайринга <strong>АО «Народный Банк Казахстана» (Halyk Bank / Epay)</strong> находится в процессе финального подключения и банковской модерации.
            </p>

            <div className="modal-alert-box">
              <AlertCircle size={18} color="#e5b95c" className="alert-box-icon" />
              <span>
                Прием онлайн-оплаты банковскими картами <strong>Visa</strong> и <strong>Mastercard</strong> станет доступен сразу после завершения проверки банком.
              </span>
            </div>

            <div className="modal-logos-row">
              <div className="modal-logo-pill"><VisaLogo height={24} /></div>
              <div className="modal-logo-pill"><MastercardLogo height={26} /></div>
              <ThreeDSecureBadge height={26} />
              <PciDssBadge height={26} />
            </div>

            <p className="modal-contacts-note">
              По вопросам предзаказа пакетов или тестирования функционала: <a href="mailto:support@morph-ai.asia">support@morph-ai.asia</a> или Telegram <a href="https://t.me/morphai_support" target="_blank" rel="noreferrer">@morphai_support</a>.
            </p>

            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setConnectingPackage(null)}
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
