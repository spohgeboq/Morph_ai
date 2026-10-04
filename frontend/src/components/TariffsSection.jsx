import React, { useState } from 'react';
import { Check, Sparkles, ShieldCheck, CreditCard, AlertCircle, Info, Zap } from 'lucide-react';
import { VisaLogo, MastercardLogo, PciDssBadge, ThreeDSecureBadge } from './PaymentBadges';

export const TARIFF_PACKAGES = [
  {
    id: 'starter',
    name: 'Стартовый',
    credits: 100,
    priceKzt: 1490,
    priceRub: 320,
    badge: 'Для пробы',
    popular: false,
    description: 'Идеально для знакомства с возможностями генеративного ИИ и быстрого создания первых фото и видео.',
    features: [
      '100 кредитов на баланс',
      'До 25 портретов студийного качества',
      'До 10 кинематографичных видео (Kling / Hailuo)',
      'Face Swap замена лиц в фото и видео',
      'Доступ ко всем популярным моделям',
      'Базовая скорость очереди',
    ],
  },
  {
    id: 'optimal',
    name: 'Оптимальный',
    credits: 350,
    priceKzt: 3990,
    priceRub: 850,
    badge: 'Хит продаж',
    popular: true,
    description: 'Самый сбалансированный пакет для создания полноценных фотосессий и яркого медиаконтента.',
    features: [
      '350 кредитов на баланс',
      'До 90 фотореалистичных 4K портретов',
      'До 35 видеороликов высокого разрешения',
      'Полный доступ к Студийному фотосету (5 фото)',
      'Неограниченный Face Swap в высоком качестве',
      'Приоритетная очередь генерации Fast Track',
      'Хранение истории в профиле',
    ],
  },
  {
    id: 'creator_pro',
    name: 'Создатель PRO',
    credits: 1250,
    priceKzt: 9990,
    priceRub: 2150,
    badge: 'VIP Студия',
    popular: false,
    description: 'Профессиональный тариф для блогеров, креаторов, маркетологов и создания коммерческого контента.',
    features: [
      '1250 кредитов на баланс',
      'До 300 портретов в максимальном разрешении',
      'До 125 видео с расширенным хронометражем',
      'Все премиум-модели без ограничений',
      'Высший VIP-приоритет на GPU-кластерах',
      'Коммерческие права на все материалы',
      'Персональная поддержка 24/7',
    ],
  },
  {
    id: 'studio_max',
    name: 'Studio Unlimited',
    credits: 2500,
    priceKzt: 18990,
    priceRub: 4090,
    badge: 'Максимум',
    popular: false,
    description: 'Максимальный объем ресурсов для агентств и студий, работающих с масштабным производством медиа.',
    features: [
      '2500 кредитов на баланс',
      'Массовая генерация фото и видео 4K',
      'Мгновенная обработка без ожидания',
      'Пакетный запуск фотосессий',
      'Пожизненный срок действия кредитов',
      'Выделенный канал генераций',
    ],
  },
];

export const TariffsSection = ({ onSelectPackage, title = 'Тарифные планы и пакеты кредитов', subtitle = 'Выберите подходящий пакет для мгновенного пополнения баланса. Кредиты не сгорают.' }) => {
  const [activeModal, setActiveModal] = useState(null);

  const handleBuyClick = (pkg) => {
    setActiveModal(pkg);
    if (onSelectPackage) onSelectPackage(pkg);
  };

  return (
    <div className="tariffs-showcase-wrapper">
      <div className="tariffs-header-box">
        <div className="tariffs-pretitle">
          <Sparkles size={16} color="#e5b95c" />
          <span>Прозрачные цены без скрытых комиссий</span>
        </div>
        <h2 className="tariffs-main-title">{title}</h2>
        <p className="tariffs-main-subtitle">{subtitle}</p>
      </div>

      <div className="tariffs-cards-grid">
        {TARIFF_PACKAGES.map((pkg) => (
          <div key={pkg.id} className={`tariff-card-item ${pkg.popular ? 'popular' : ''}`}>
            {pkg.badge && (
              <div className={`tariff-card-badge ${pkg.popular ? 'popular-badge' : ''}`}>
                {pkg.popular && <Zap size={13} fill="currentColor" />}
                <span>{pkg.badge}</span>
              </div>
            )}

            <div className="tariff-card-top">
              <h3 className="tariff-card-name">{pkg.name}</h3>
              <p className="tariff-card-desc">{pkg.description}</p>
            </div>

            <div className="tariff-card-pricing">
              <div className="tariff-credits-count">
                <span className="credits-number">{pkg.credits}</span>
                <span className="credits-label">CR (кредитов)</span>
              </div>
              <div className="tariff-price-amount">
                <span className="price-currency">{pkg.priceKzt.toLocaleString('ru-RU')} ₸</span>
                <span className="price-sub">/ пакет</span>
              </div>
              <div className="tariff-price-alt">
                ≈ {pkg.priceRub.toLocaleString('ru-RU')} ₽ (расчет в тенге)
              </div>
            </div>

            <button
              className={`tariff-buy-btn ${pkg.popular ? 'btn-popular' : ''}`}
              onClick={() => handleBuyClick(pkg)}
              type="button"
            >
              <CreditCard size={18} />
              <span>Оплатить картой</span>
            </button>

            <div className="tariff-features-list">
              <span className="features-title">В тариф включено:</span>
              <ul>
                {pkg.features.map((feat, idx) => (
                  <li key={idx}>
                    <Check size={14} className="feat-check-icon" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Плашка безопасности и стандартов банковских платежей */}
      <div className="tariffs-security-footer">
        <div className="tariffs-security-inner">
          <div className="tariffs-sec-badge-item">
            <ShieldCheck size={20} color="#10b981" />
            <span>Интернет-эквайринг АО «Народный Банк Казахстана» (Halyk Bank)</span>
          </div>
          <div className="tariffs-sec-logos">
            <div className="sec-logo-pill"><VisaLogo height={22} /></div>
            <div className="sec-logo-pill"><MastercardLogo height={24} /></div>
            <ThreeDSecureBadge height={24} />
            <PciDssBadge height={24} />
          </div>
        </div>
      </div>

      {/* Модальное окно: Оплата временно подключается */}
      {activeModal && (
        <div className="tariffs-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="tariffs-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-status-icon">
              <Info size={32} color="#3b82f6" />
            </div>

            <h3 className="modal-title">Оплата временно подключается</h3>
            
            <div className="modal-badge-row">
              <span className="modal-package-tag">Выбран тариф: {activeModal.name} ({activeModal.credits} CR)</span>
              <span className="modal-price-tag">{activeModal.priceKzt.toLocaleString('ru-RU')} ₸</span>
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
              По вопросам предзаказа пакетов или тестирования функционала обращайтесь в службу поддержки: <a href="mailto:support@morph-ai.asia">support@morph-ai.asia</a> или Telegram <a href="https://t.me/morphai_support" target="_blank" rel="noreferrer">@morphai_support</a>.
            </p>

            <button
              className="modal-close-btn"
              onClick={() => setActiveModal(null)}
              type="button"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TariffsSection;
