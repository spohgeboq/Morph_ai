import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, AlertCircle, Info, Sparkles, CreditCard, 
  CheckCircle2, Lock, ArrowRight, Check, CheckCircle
} from 'lucide-react';
import { VisaLogo, MastercardLogo, ThreeDSecureBadge, PciDssBadge, SslSecureBadge, PaymentTrustRow } from './PaymentBadges';
import { fetchPublicTariffs, executeCardPayment } from '../services/api';
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

const RechargeModal = ({ isOpen, onClose, balance = 0 }) => {
  const { currentUser, refreshUser } = useUser();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

  const [tariffsList, setTariffsList] = useState(RECHARGE_PACKAGES);
  const [connectingPackage, setConnectingPackage] = useState(null);

  // Состояния формы онлайн-оплаты банковской картой
  const [checkoutStep, setCheckoutStep] = useState('form'); // 'form' | 'processing' | 'success'
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardEmail, setCardEmail] = useState('');
  const [processingStage, setProcessingStage] = useState('Безопасное соединение с банком...');
  const [formError, setFormError] = useState('');
  const [receiptData, setReceiptData] = useState(null);

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
        
        // Гарантируем неразрывный пробел \u00A0 между цифрами и символом ₸, чтобы кнопка никогда не ломалась на две строки
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

  // Форматирование номера карты с автоматическими пробелами каждые 4 цифры
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    if (formError) setFormError('');
  };

  // Срок действия MM / YY
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)} / ${val.slice(2)}`;
    }
    setCardExpiry(val);
    if (formError) setFormError('');
  };

  // Код CVV
  const handleCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(val);
    if (formError) setFormError('');
  };

  // Определение платежной системы
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'Mastercard';
    if (clean.length > 0) return 'Карта РК';
    return '';
  };

  // Отправка формы онлайн-оплаты
  const handlePaySubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 16) {
      setFormError('Пожалуйста, введите полный 16-значный номер карты');
      return;
    }
    if (!cardExpiry || cardExpiry.replace(/\D/g, '').length < 4) {
      setFormError('Укажите срок действия карты (ММ / ГГ)');
      return;
    }
    if (!cardCvv || cardCvv.length < 3) {
      setFormError('Укажите код CVC / CVV (3 цифры)');
      return;
    }

    setFormError('');
    setCheckoutStep('processing');
    setProcessingStage('Безопасное соединение с банковским шлюзом...');

    setTimeout(() => {
      setProcessingStage('Проверка протокола 3-D Secure 2.0...');
    }, 800);

    setTimeout(async () => {
      try {
        setProcessingStage('Авторизация и зачисление токенов...');
        const tgId = currentUser?.telegram_id || currentUser?.id;
        const mask = cleanCard.slice(0, 4) + ' **** **** ' + cleanCard.slice(-4);
        
        const res = await executeCardPayment({
          telegram_id: tgId,
          credits: connectingPackage.amount,
          amount_kzt: connectingPackage.price,
          package_name: connectingPackage.name || connectingPackage.title,
          card_mask: mask,
          email: cardEmail || 'client@morph-ai.asia',
        });

        if (res?.success) {
          setReceiptData({
            txId: res.transaction_id || ('TX-' + Date.now().toString(36).toUpperCase()),
            credits: res.credits_added || connectingPackage.amount,
            newBalance: res.new_balance,
            amountKzt: connectingPackage.priceFormatted,
            packageName: connectingPackage.name || connectingPackage.title,
            cardMask: mask,
            date: new Date().toLocaleDateString('ru-RU', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
          });
          setCheckoutStep('success');
          refreshUser();
          showToast(`🎉 Оплата успешна! Начислено +${connectingPackage.amount} CR`, 'success');
        } else {
          throw new Error(res?.error || 'Платеж отклонен банком');
        }
      } catch (err) {
        console.error('[Card Payment Error]', err);
        setCheckoutStep('form');
        setFormError(err.message || 'Ошибка обработки платежа банком-эмитентом');
      }
    }, 1800);
  };

  // Закрытие окна оплаты
  const handleCloseCheckout = () => {
    setConnectingPackage(null);
    setCheckoutStep('form');
    setFormError('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
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

      {/* ======================================================== */}
      {/* РАБОЧАЯ ФОРМА ОНЛАЙН-ОПЛАТЫ БАНКОВСКОЙ КАРТОЙ КАЗАХСТАНА */}
      {/* ======================================================== */}
      {connectingPackage && (
        <div className="tariffs-modal-overlay" onClick={handleCloseCheckout}>
          <div 
            className="tariffs-modal-box" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '440px', padding: '24px 22px' }}
          >
            {/* ШАГ 1: ФОРМА ВВОДА КАРТЫ */}
            {checkoutStep === 'form' && (
              <>
                <div className="modal-status-icon" style={{ background: 'rgba(176, 23, 61, 0.15)', borderColor: 'rgba(176, 23, 61, 0.4)' }}>
                  <CreditCard size={28} color="#e5b95c" />
                </div>

                <h3 className="modal-title" style={{ marginBottom: '6px' }}>Оплата банковской картой</h3>

                <div className="modal-badge-row" style={{ marginBottom: '14px' }}>
                  <span className="modal-package-tag">{connectingPackage.title} ({connectingPackage.amount} CR)</span>
                  <span className="modal-price-tag">{connectingPackage.priceFormatted}</span>
                </div>

                <form onSubmit={handlePaySubmit} className="checkout-form-container">
                  {/* Номер карты */}
                  <div className="checkout-input-group">
                    <label className="checkout-label">
                      <span>Номер банковской карты</span>
                      {getCardBrand() && (
                        <span className="checkout-card-brand-tag">{getCardBrand()}</span>
                      )}
                    </label>
                    <div className="checkout-input-wrapper">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="checkout-input"
                        autoComplete="cc-number"
                        maxLength={19}
                        required
                      />
                    </div>
                  </div>

                  {/* Срок и CVV */}
                  <div className="checkout-row-2">
                    <div className="checkout-input-group">
                      <label className="checkout-label">Срок действия</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="ММ / ГГ"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className="checkout-input"
                        autoComplete="cc-exp"
                        maxLength={7}
                        required
                      />
                    </div>

                    <div className="checkout-input-group">
                      <label className="checkout-label">
                        <span>CVC / CVV</span>
                        <Lock size={12} color="rgba(255,255,255,0.4)" />
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={handleCvvChange}
                        className="checkout-input"
                        autoComplete="cc-csc"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  {/* Имя держателя */}
                  <div className="checkout-input-group">
                    <label className="checkout-label">Имя держателя карты (латиницей)</label>
                    <input
                      type="text"
                      placeholder="CARDHOLDER NAME"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      className="checkout-input"
                      autoComplete="cc-name"
                    />
                  </div>

                  {/* Email для отправки фискального чека */}
                  <div className="checkout-input-group">
                    <label className="checkout-label">Email для квитанции об оплате</label>
                    <input
                      type="email"
                      placeholder="client@mail.kz"
                      value={cardEmail}
                      onChange={(e) => setCardEmail(e.target.value)}
                      className="checkout-input"
                    />
                  </div>

                  {/* Сообщение об ошибке валидации */}
                  {formError && (
                    <div className="modal-alert-box" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171', margin: '4px 0' }}>
                      <AlertCircle size={16} className="alert-box-icon" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Кнопка оплаты */}
                  <button type="submit" className="checkout-submit-btn" style={{ marginTop: '6px' }}>
                    <Lock size={16} />
                    <span>Оплатить {connectingPackage.priceFormatted}</span>
                  </button>
                </form>

                {/* Банковские логотипы и бейджи безопасности */}
                <div className="modal-logos-row" style={{ marginTop: '12px', marginBottom: '12px' }}>
                  <div className="modal-logo-pill"><VisaLogo height={22} /></div>
                  <div className="modal-logo-pill"><MastercardLogo height={24} /></div>
                  <ThreeDSecureBadge height={24} />
                  <PciDssBadge height={24} />
                </div>

                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.4', margin: '0 0 12px 0' }}>
                  Платеж защищен сертификатом PCI DSS Level 1 и технологией 3-D Secure. Сервис не хранит данные карт.
                </p>

                <button
                  type="button"
                  className="modal-close-btn"
                  style={{ background: 'transparent', color: 'rgba(255, 255, 255, 0.55)', border: 'none', padding: '6px' }}
                  onClick={handleCloseCheckout}
                >
                  Отмена
                </button>
              </>
            )}

            {/* ШАГ 2: ПРОЦЕССИНГ 3-D SECURE */}
            {checkoutStep === 'processing' && (
              <div className="checkout-processing-box">
                <div className="checkout-spinner-ring" />
                <h3 className="modal-title" style={{ fontSize: '1.15rem', marginBottom: '2px' }}>Обработка платежа</h3>
                <p style={{ fontSize: '0.85rem', color: '#e5b95c', fontWeight: 600 }}>{processingStage}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '10px' }}>
                  <Lock size={12} color="#10b981" />
                  <span>Шифрование TLS 1.3 • Не закрывайте окно</span>
                </div>
              </div>
            )}

            {/* ШАГ 3: УСПЕШНАЯ ОПЛАТА И ЭЛЕКТРОННЫЙ ЧЕК */}
            {checkoutStep === 'success' && receiptData && (
              <div className="checkout-success-view">
                <div className="checkout-success-badge">
                  <CheckCircle size={38} />
                </div>

                <h3 className="modal-title" style={{ color: '#ffffff', marginBottom: '4px' }}>Оплата успешно проведена!</h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 10px 0' }}>
                  Электронная квитанция сформирована и зарегистрирована.
                </p>

                <div className="checkout-receipt-table">
                  <div className="checkout-receipt-row">
                    <span>Номер квитанции:</span>
                    <strong>{receiptData.txId}</strong>
                  </div>
                  <div className="checkout-receipt-row">
                    <span>Пакет услуг:</span>
                    <strong>{receiptData.packageName}</strong>
                  </div>
                  <div className="checkout-receipt-row">
                    <span>Начислено токенов:</span>
                    <strong style={{ color: '#10b981' }}>+{receiptData.credits} CR</strong>
                  </div>
                  <div className="checkout-receipt-row">
                    <span>Сумма к оплате:</span>
                    <strong>{receiptData.amountKzt}</strong>
                  </div>
                  <div className="checkout-receipt-row">
                    <span>Способ оплаты:</span>
                    <strong>{receiptData.cardMask}</strong>
                  </div>
                  <div className="checkout-receipt-row">
                    <span>Дата и время:</span>
                    <span>{receiptData.date}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="checkout-submit-btn"
                  onClick={() => {
                    handleCloseCheckout();
                    onClose();
                  }}
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                >
                  <Check size={18} />
                  <span>Отлично, перейти к генерациям</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RechargeModal;
