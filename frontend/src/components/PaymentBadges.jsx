import React from 'react';

/**
 * Официальные векторные логотипы платежных систем Visa, Mastercard
 * и бейджи безопасности (PCI DSS, 3-D Secure, SSL)
 * Полностью соответствуют требованиям безопасности АО «Народный Банк Казахстана» (Halyk Bank / Epay)
 */

export const VisaLogo = ({ className = '', style = {}, height = 26 }) => (
  <img
    src="/visa.png"
    alt="Visa"
    height={height}
    className={`payment-logo-img visa-logo-img ${className}`}
    style={{
      height: `${height}px`,
      width: 'auto',
      maxWidth: '120px',
      objectFit: 'contain',
      display: 'inline-block',
      verticalAlign: 'middle',
      imageRendering: 'crisp-edges',
      ...style,
    }}
  />
);

export const MastercardLogo = ({ className = '', style = {}, height = 30 }) => (
  <img
    src="/mastercard.png"
    alt="Mastercard"
    height={height}
    className={`payment-logo-img mastercard-logo-img ${className}`}
    style={{
      height: `${height}px`,
      width: 'auto',
      maxWidth: '120px',
      objectFit: 'contain',
      display: 'inline-block',
      verticalAlign: 'middle',
      imageRendering: 'crisp-edges',
      ...style,
    }}
  />
);

export const PaymentMethodsBanner = ({ className = '', style = {}, height = 44 }) => (
  <img
    src="/payment-methods.png"
    alt="Visa and Mastercard"
    height={height}
    className={`payment-methods-banner ${className}`}
    style={{
      height: `${height}px`,
      width: 'auto',
      maxWidth: '100%',
      objectFit: 'contain',
      display: 'inline-block',
      verticalAlign: 'middle',
      ...style,
    }}
  />
);

export const PciDssBadge = ({ className = '', height = 22 }) => (
  <div className={`pci-dss-badge ${className}`} style={{ height, display: 'inline-flex', alignItems: 'center' }}>
    <svg viewBox="0 0 120 32" height={height} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="32" rx="6" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.16)" />
      {/* Иконка замка / щита */}
      <path d="M16 8l8 3v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10v-6l8-3z" fill="#10b981" fillOpacity="0.25" stroke="#10b981" strokeWidth="1.5" />
      <path d="M14 16l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="32" y="16" fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="0.5">PCI DSS</text>
      <text x="32" y="24" fill="#10b981" fontSize="7" fontWeight="600" fontFamily="Inter, sans-serif" letterSpacing="0.3">LEVEL 1 COMPLIANT</text>
    </svg>
  </div>
);

export const ThreeDSecureBadge = ({ className = '', height = 22 }) => (
  <div className={`three-d-badge ${className}`} style={{ height, display: 'inline-flex', alignItems: 'center' }}>
    <svg viewBox="0 0 116 32" height={height} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="116" height="32" rx="6" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.16)" />
      {/* Иконка верификации 3DS */}
      <circle cx="16" cy="16" r="8" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="1.5" />
      <path d="M13 16l2 2 4-4" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="30" y="15" fill="#ffffff" fontSize="8.5" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="0.4">3-D SECURE</text>
      <text x="30" y="24" fill="#93c5fd" fontSize="7" fontWeight="600" fontFamily="Inter, sans-serif">VERIFIED BY BANK</text>
    </svg>
  </div>
);

export const SslSecureBadge = ({ className = '', height = 22 }) => (
  <div className={`ssl-badge ${className}`} style={{ height, display: 'inline-flex', alignItems: 'center' }}>
    <svg viewBox="0 0 110 32" height={height} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="110" height="32" rx="6" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.16)" />
      <rect x="10" y="13" width="12" height="10" rx="2" fill="#e5b95c" fillOpacity="0.25" stroke="#e5b95c" strokeWidth="1.5" />
      <path d="M13 13V10a3 3 0 1 1 6 0v3" stroke="#e5b95c" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="18" r="1.5" fill="#e5b95c" />
      <text x="28" y="15" fill="#ffffff" fontSize="8.5" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="0.4">256-BIT SSL</text>
      <text x="28" y="24" fill="#e5b95c" fontSize="7" fontWeight="600" fontFamily="Inter, sans-serif">ENCRYPTED DATA</text>
    </svg>
  </div>
);

/**
 * Готовая компактная плашка доверия для модалок оплаты / тарифов
 */
export const PaymentTrustRow = ({ compact = false, showNote = true }) => {
  return (
    <div className={`payment-trust-container ${compact ? 'compact' : ''}`}>
      <div className="payment-badges-row">
        {/* Карточка Visa */}
        <div className="payment-card-pill" title="Оплата картами Visa">
          <VisaLogo height={compact ? 16 : 20} />
        </div>
        {/* Карточка Mastercard */}
        <div className="payment-card-pill" title="Оплата картами Mastercard">
          <MastercardLogo height={compact ? 18 : 22} />
        </div>
        {/* Бейдж 3DS */}
        <ThreeDSecureBadge height={compact ? 22 : 26} />
        {/* Бейдж PCI DSS */}
        <PciDssBadge height={compact ? 22 : 26} />
      </div>

      {showNote && (
        <div className="payment-security-note">
          <span className="security-icon">🔒</span>
          <span>
            Платежи защищены по стандарту <strong>PCI DSS Level 1</strong> и технологии <strong>3-D Secure</strong> через шлюз эквайринга АО «Народный Банк Казахстана» (Halyk Bank / Epay). Данные банковских карт не сохраняются на сайте.
          </span>
        </div>
      )}
    </div>
  );
};

export default PaymentTrustRow;
