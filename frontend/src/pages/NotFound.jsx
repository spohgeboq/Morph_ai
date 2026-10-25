import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Sparkles, ArrowLeft, CreditCard, HelpCircle, Phone, FileText, Search } from 'lucide-react';
import Footer from '../components/Footer';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page-wrapper">
      <div className="not-found-ambient-aura" />
      <div className="not-found-ambient-aura-second" />

      <div className="not-found-container">
        {/* Статус-капсула в стиле Apple UI */}
        <div className="not-found-status-capsule">
          <span className="not-found-pulse-dot" />
          <span className="not-found-status-text">404 • ОШИБКА МАРШРУТИЗАЦИИ</span>
        </div>

        {/* Числовой акцент */}
        <div className="not-found-glitch-badge">
          <span className="not-found-number">404</span>
        </div>

        {/* Текстовый блок */}
        <h1 className="not-found-title">Страница не найдена</h1>
        <p className="not-found-desc">
          Запрашиваемый веб-адрес не существует, был перемещен или введен с неточностью. Выберите нужный раздел ниже или вернитесь на главную страницу студии.
        </p>

        {/* Главные кнопки действий */}
        <div className="not-found-actions-group">
          <Link to="/" className="not-found-btn-primary">
            <Home size={18} />
            <span>На главную страницу</span>
          </Link>
          <Link to="/create" className="not-found-btn-secondary">
            <Sparkles size={18} color="#e5b95c" />
            <span>Студия генерации</span>
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="not-found-btn-ghost"
            title="Назад"
          >
            <ArrowLeft size={16} />
            <span>Назад</span>
          </button>
        </div>

        {/* Быстрые полезные ссылки */}
        <div className="not-found-quick-links-card">
          <span className="not-found-quick-links-title">Полезные разделы платформы</span>
          <div className="not-found-links-grid">
            <Link to="/tariffs" className="not-found-link-pill">
              <CreditCard size={15} color="#e5b95c" />
              <span>Тарифы и пополнение</span>
            </Link>
            <Link to="/contacts" className="not-found-link-pill">
              <Phone size={15} color="#10b981" />
              <span>Реквизиты и контакты</span>
            </Link>
            <Link to="/terms" className="not-found-link-pill">
              <FileText size={15} color="#3b82f6" />
              <span>Публичная оферта</span>
            </Link>
            <a href="mailto:zlznvoxana@gmail.com" className="not-found-link-pill">
              <HelpCircle size={15} color="#a855f7" />
              <span>Поддержка 24/7</span>
            </a>
          </div>
        </div>
      </div>

      {/* Обязательный подвал с контактами и эквайрингом */}
      <Footer />
    </div>
  );
};

export default NotFound;
