import React, { useState } from 'react';
import { Check, Sparkles, ShieldCheck, CreditCard, Gift, Zap } from 'lucide-react';
import { VisaLogo, MastercardLogo, PciDssBadge, ThreeDSecureBadge } from './PaymentBadges';
import RechargeModal from './RechargeModal';

export const TARIFF_PACKAGES = [
  {
    id: 'starter',
    name: 'Стартовый',
    credits: 100,
    bonusCredits: 0,
    totalCredits: 100,
    priceKzt: 1490,
    priceRub: 320,
    badge: 'Для пробы',
    popular: false,
    description: 'Идеально для знакомства с возможностями генеративного ИИ и быстрого создания первых фото и видео.',
    features: [
      '100 генераций (CR) на баланс',
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
    bonusCredits: 50,
    totalCredits: 400,
    priceKzt: 3990,
    priceRub: 850,
    badge: 'ХИТ • +50 В ПОДАРОК',
    popular: true,
    description: 'Самый сбалансированный пакет для создания полноценных фотосессий и яркого медиаконтента.',
    features: [
      '350 CR + 50 CR в подарок (всего 400 CR)',
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
    bonusCredits: 250,
    totalCredits: 1500,
    priceKzt: 9990,
    priceRub: 2150,
    badge: 'VIP • +250 В ПОДАРОК',
    popular: false,
    description: 'Профессиональный тариф для блогеров, креаторов, маркетологов и создания коммерческого контента.',
    features: [
      '1250 CR + 250 CR в подарок (всего 1500 CR)',
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
    bonusCredits: 0,
    totalCredits: 2500,
    priceKzt: 18990,
    priceRub: 4090,
    badge: 'МАКСИМУМ',
    popular: false,
    description: 'Максимальный объем ресурсов для агентств и студий, работающих с масштабным производством медиа.',
    features: [
      '2500 генераций (CR) на баланс',
      'Массовая генерация фото и видео 4K',
      'Мгновенная обработка без ожидания',
      'Пакетный запуск фотосессий',
      'Бессрочный период действия баланса',
      'Выделенный канал генераций',
    ],
  },
];

export const TariffsSection = ({ onSelectPackage, title = 'Тарифные планы и пакеты генераций', subtitle = 'Выберите подходящий пакет для мгновенного пополнения баланса. Единицы генерации не сгорают.' }) => {
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const handleBuyClick = (pkg) => {
    if (onSelectPackage) {
      onSelectPackage(pkg);
    }
    setShowRechargeModal(true);
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
                {pkg.bonusCredits > 0 ? <Gift size={13} fill="currentColor" /> : (pkg.popular && <Zap size={13} fill="currentColor" />)}
                <span>{pkg.badge}</span>
              </div>
            )}

            <div className="tariff-card-top">
              <h3 className="tariff-card-name">{pkg.name}</h3>
              <p className="tariff-card-desc">{pkg.description}</p>
            </div>

            <div className="tariff-card-pricing">
              <div className="tariff-credits-count">
                <span className="credits-number">{pkg.totalCredits}</span>
                <span className="credits-label">CR {pkg.bonusCredits > 0 ? `(${pkg.credits} + ${pkg.bonusCredits} бонус)` : 'генераций'}</span>
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
            <span>Интернет-эквайринг Tribute (Kaspi, Halyk, Jusan, Visa, Mastercard)</span>
          </div>
          <div className="tariffs-sec-logos">
            <div className="sec-logo-pill"><VisaLogo height={22} /></div>
            <div className="sec-logo-pill"><MastercardLogo height={24} /></div>
            <ThreeDSecureBadge height={24} />
            <PciDssBadge height={24} />
          </div>
        </div>
      </div>

      {/* Рабочая форма онлайн-оплаты через подключенный эквайринг */}
      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
      />
    </div>
  );
};

export default TariffsSection;
