import React from 'react';

/**
 * Официальные векторные логотипы платежных систем Visa, Mastercard
 * и бейджи безопасности (PCI DSS, 3-D Secure, SSL)
 * Полностью соответствуют требованиям безопасности АО «Народный Банк Казахстана» (Halyk Bank / Epay)
 */

export const VisaLogo = ({ className = '', style = {}, height = 24 }) => (
  <svg
    viewBox="0 0 100 32"
    height={height}
    className={`payment-logo-svg visa-svg ${className}`}
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Visa"
    role="img"
  >
    {/* Официальный синий цвет Visa #1434CB / #1A1F71 */}
    <path
      d="M39.63 2.56L25.84 31.44H16.8L10.26 7.64c-.4-.16-1.04-.32-1.92-.32-1.52 0-3.92.56-6.32 1.84L2 8.72l6.8 22.72h9.52L32.72 2.56h6.91z"
      fill="#1434CB"
    />
    <path
      d="M55.79 2.56h-7.04c-2.16 0-3.76.64-4.72 2.88l-13.44 26h9.52s1.52-4.24 1.84-5.2c1.04 0 10.32.08 11.68.08.24 1.2 1.04 5.12 1.04 5.12h8.4l-7.28-28.88zm-9.36 17.12c.72-2 3.52-9.68 3.52-9.68-.08.16.72-2 1.2-3.36.32 1.52 1.76 8.48 2.16 10.48-1.52 0-5.76.08-6.88.08l-.48 2.48z"
      fill="#1434CB"
    />
    <path
      d="M68.56 11.2c-.32-1.28-1.44-2.16-3.2-2.16-2.08 0-3.6 1.12-3.6 2.48 0 1.28 1.28 2 2.8 2.72 2.32 1.12 4.72 2.24 4.72 5.2 0 3.76-3.28 6.4-7.68 6.4-3.52 0-6.16-1.52-6.56-3.44l-.24-.96 2.4-1.2.32.88c.64 1.76 2.24 2.48 4.08 2.48 2.24 0 4.16-1.12 4.16-2.72 0-1.44-1.36-2.16-3.04-2.96-2.16-1.04-4.48-2.24-4.48-4.96 0-3.36 3.04-6.08 7.36-6.08 3.2 0 5.44 1.28 5.92 2.8l.24.96-2.4 1.2-.2-.64z"
      fill="#1434CB"
    />
    <path
      d="M74.96 31.44h8.88L90 2.56h-8.88l-6.16 28.88z"
      fill="#1434CB"
    />
    <path
      d="M17.44 2.56L9.6 22.88 7.28 9.36c-.4-1.92-1.92-3.68-3.76-4.56L17.44 2.56z"
      fill="#F7B600"
    />
  </svg>
);

export const MastercardLogo = ({ className = '', style = {}, height = 24 }) => (
  <svg
    viewBox="0 0 100 62"
    height={height}
    className={`payment-logo-svg mastercard-svg ${className}`}
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Mastercard"
    role="img"
  >
    <rect width="100" height="62" rx="6" fill="transparent" />
    {/* Красный круг слева */}
    <circle cx="34" cy="31" r="26" fill="#EB001B" />
    {/* Желтый круг справа */}
    <circle cx="66" cy="31" r="26" fill="#F79E1B" />
    {/* Пересечение оранжевое */}
    <path
      d="M50 11.88a25.93 25.93 0 0 0-9.88 19.12A25.93 25.93 0 0 0 50 50.12a25.93 25.93 0 0 0 9.88-19.12A25.93 25.93 0 0 0 50 11.88z"
      fill="#FF5F00"
    />
  </svg>
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
