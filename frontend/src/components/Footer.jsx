import React from 'react';
import { Link } from 'react-router-dom';
import { VisaLogo, MastercardLogo, PciDssBadge, ThreeDSecureBadge, SslSecureBadge } from './PaymentBadges';
import { ShieldCheck, FileText, RefreshCw, Lock, HelpCircle, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        {/* Верхняя часть: Брендинг и информация */}
        <div className="footer-top-row">
          <div className="footer-brand-col">
            <div className="footer-brand-logo">
              <span className="brand-gradient-text">Morph AI</span>
              <span className="brand-tag">Ecosystem</span>
            </div>
            <p className="footer-brand-desc">
              Интеллектуальная мультимодальная платформа генеративного ИИ. Создание фотореалистичных портретов 4K, кинематографичных видео и авторских историй на базе передовых нейросетей.
            </p>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-nav-title">
              <FileText size={16} />
              <span>Документы и оферта</span>
            </h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/privacy" className="footer-link">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link to="/terms" className="footer-link">
                  Публичная оферта и правила
                </Link>
              </li>
              <li>
                <Link to="/refund" className="footer-link">
                  Условия возврата средств
                </Link>
              </li>
              <li>
                <Link to="/security" className="footer-link">
                  Безопасность платежей
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="footer-link">
                  Доставка цифровых услуг
                </Link>
              </li>
              <li>
                <Link to="/tariffs" className="footer-link">
                  Тарифы и стоимость
                </Link>
              </li>
              <li>
                <Link to="/contacts" className="footer-link">
                  Реквизиты и контакты
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-contacts-col">
            <h4 className="footer-nav-title">
              <HelpCircle size={16} />
              <span>Поддержка и реквизиты</span>
            </h4>
            <div className="footer-contacts-info">
              <div className="footer-contact-item">
                <Mail size={14} />
                <a href="mailto:support@morph-ai.asia" className="footer-contact-link">support@morph-ai.asia</a>
              </div>
              <div className="footer-contact-item">
                <MapPin size={14} />
                <span>РК, Карагандинская обл., г. Темиртау, ул. Чернышевского, д. 114, кв. 47</span>
              </div>
              <div className="footer-requisites-box">
                <span className="req-label">Поставщик услуг:</span>
                <span className="req-val">ИП ЖЕЛЕЗНОВА (Железнова Оксана Юрьевна)</span>
                <span className="req-label">ИИН:</span>
                <span className="req-val">791109400410</span>
                <span className="req-label">Уведомление:</span>
                <span className="req-val">№ KZ41UUZ00570345 от 23.09.2026 г.</span>
                <span className="req-sub">Служба поддержки пользователей: 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Разделитель */}
        <div className="footer-divider" />

        {/* ОБЯЗАТЕЛЬНЫЙ БЛОК ДЛЯ ЭКВАЙРИНГА ХАЛЫК БАНКА: ЛОГОТИПЫ VISA И MASTERCARD */}
        <div className="footer-acquiring-section">
          <div className="acquiring-heading">
            <ShieldCheck size={18} color="#10b981" />
            <span className="acquiring-title">Безопасный прием платежей и интернет-эквайринг</span>
          </div>

          <p className="acquiring-desc">
            Оплата банковскими картами осуществляется через защищенный платежный шлюз АО «Народный Банк Казахстана» (Halyk Bank / Epay). Наш сервис <strong>не собирает, не передает и не хранит</strong> данные ваших банковских карт (номер карты, срок действия, CVV/CVC-коды). Все расчеты проводятся в строгом соответствии с требованиями международных платежных систем Visa и Mastercard.
          </p>

          <div className="acquiring-logos-container">
            {/* Карточка Visa */}
            <div className="payment-brand-card visa" title="Visa">
              <VisaLogo height={26} />
            </div>

            {/* Карточка Mastercard */}
            <div className="payment-brand-card mastercard" title="Mastercard">
              <MastercardLogo height={30} />
            </div>

            {/* Бейджи стандартов безопасности */}
            <div className="security-badges-group">
              <PciDssBadge height={32} />
              <ThreeDSecureBadge height={32} />
              <SslSecureBadge height={32} />
            </div>
          </div>
        </div>

        {/* Нижний копирайт */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © 2024–2026 Morph AI. Все права защищены. Разрешено к использованию на территории Республики Казахстан и по всему миру.
          </div>
          <div className="footer-bottom-secure">
            <Lock size={13} color="#10b981" />
            <span>256-bit SSL Cryptographic Protection</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
