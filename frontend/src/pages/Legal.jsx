import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, FileText, RefreshCw, Lock, Mail, MapPin } from 'lucide-react';

const Legal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  // Map path to tab
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('terms')) return 'terms';
    if (path.includes('refund')) return 'refund';
    if (path.includes('security')) return 'security';
    if (path.includes('contacts')) return 'contacts';
    return 'privacy';
  };

  const activeTab = getTabFromPath();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const tabs = [
    { id: 'privacy', label: 'Политика конфиденциальности', path: '/privacy', icon: <ShieldCheck size={16} /> },
    { id: 'terms', label: 'Публичная оферта', path: '/terms', icon: <FileText size={16} /> },
    { id: 'refund', label: 'Условия возврата', path: '/refund', icon: <RefreshCw size={16} /> },
    { id: 'security', label: 'Безопасность платежей', path: '/security', icon: <Lock size={16} /> },
    { id: 'contacts', label: 'Реквизиты и контакты', path: '/contacts', icon: <MapPin size={16} /> },
  ];

  return (
    <div className="legal-page-container">
      {/* Header */}
      <header className="legal-header">
        <button className="legal-back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="legal-header-title">
          <h2>Документы</h2>
          <span>Morph AI Ecosystem</span>
        </div>
      </header>

      {/* Tabs / Navigation */}
      <div className="legal-tabs-wrapper">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`legal-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="legal-content-scroll" ref={contentRef}>
        <div className="legal-document-body">
          
          {activeTab === 'privacy' && (
            <div className="legal-doc-section">
              <h1 className="legal-h1">Политика конфиденциальности и защиты персональных данных</h1>
              <p className="legal-updated-date">Последнее обновление: 2024 год</p>
              
              <div className="legal-alert info">
                Настоящая Политика разработана в соответствии с Законом Республики Казахстан от 21 мая 2013 года № 94-V «О персональных данных и их защите» и стандартами безопасности международных платежных систем.
              </div>

              <h3 className="legal-h3">1. Общие положения</h3>
              <p className="legal-p">
                1.1. Настоящая Политика конфиденциальности (далее — Политика) действует в отношении всей информации, включая персональные данные, которую ИП/ТОО «Morph AI» (далее — Оператор, БИН/ИИН: 990140001234) может получить от Пользователя во время использования им веб-приложения и Telegram-бота Morph AI (далее — Сервис).
                <br/>1.2. Использование Сервиса означает безоговорочное согласие Пользователя с настоящей Политикой и указанными в ней условиями обработки данных.
              </p>

              <h3 className="legal-h3">2. Данные банковских карт и платежей (Важно)</h3>
              <p className="legal-p">
                2.1. <strong>Сервис НЕ собирает, НЕ обрабатывает и НЕ хранит полные данные банковских карт Пользователя (номер карты, срок действия, CVV/CVC-коды).</strong>
                <br/>2.2. Ввод платежных реквизитов и авторизация платежа происходят исключительно в защищенном окне платежного шлюза банка-эквайера АО «Народный Банк Казахстана» (Halyk Bank / Epay).
                <br/>2.3. Платежный шлюз сертифицирован по международному стандарту безопасности данных индустрии платежных карт PCI DSS Level 1. Передача данных осуществляется по закрытым каналам с использованием шифрования TLS 1.3 и технологии 3-D Secure (Visa Secure, Mastercard Identity Check).
              </p>

              <h3 className="legal-h3">3. Обрабатываемые данные и цели</h3>
              <p className="legal-p">
                3.1. Оператор обрабатывает следующие данные: идентификатор (ID) в Telegram, имя пользователя (username/nickname), загруженные изображения (фотографии/селфи) и текстовые промпты для генерации контента нейросетями.
                <br/>3.2. Цели обработки: оказание услуг по генерации цифрового контента (фото, видео, текст), идентификация в Сервисе, обеспечение безопасности и технической поддержки.
              </p>

              <h3 className="legal-h3">4. Хранение и удаление загруженных медиафайлов</h3>
              <p className="legal-p">
                4.1. Любые исходные изображения (фотографии лиц) обрабатываются в изолированной среде исключительно для выполнения запрошенной Пользователем генерации.
                <br/>4.2. Исходные файлы безвозвратно удаляются с серверов Сервиса в течение 24 часов после завершения процесса генерации.
                <br/>4.3. Сгенерированный контент сохраняется в кэше Пользователя для обеспечения доступа к истории (вкладка "Чаты/Профиль") и может быть удален по запросу Пользователя.
                <br/>4.4. Ваши данные никогда не используются для дообучения публичных моделей ИИ без вашего прямого согласия.
              </p>

              <h3 className="legal-h3">5. Права пользователя</h3>
              <p className="legal-p">
                Пользователь имеет право в любой момент отозвать свое согласие на обработку персональных данных, направив соответствующий запрос на электронную почту службы поддержки: support@morphai.kz. При этом аккаунт Пользователя и вся связанная история генераций будут удалены из системы в течение 5 рабочих дней.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="legal-doc-section">
              <h1 className="legal-h1">Публичная оферта (Пользовательское соглашение)</h1>
              
              <h3 className="legal-h3">1. Предмет соглашения</h3>
              <p className="legal-p">
                Настоящий документ является официальным предложением (Публичной офертой) ИП/ТОО «Morph AI», адресованным любому физическому лицу, заключить договор на оказание информационно-вычислительных услуг по генерации цифрового контента (фотографий, видеороликов, текстов) на базе технологий ИИ.
              </p>

              <h3 className="legal-h3">2. Момент заключения договора</h3>
              <p className="legal-p">
                Акцептом (принятием) настоящей Оферты признается факт запуска приложения/бота Пользователем и/или совершение платежа за внутренние кредиты (CR). С момента акцепта договор считается заключенным.
              </p>

              <h3 className="legal-h3">3. Стоимость услуг и оплата</h3>
              <p className="legal-p">
                3.1. Услуги Сервиса тарифицируются во внутренней валюте (Кредиты / CR). Покупка пакетов кредитов осуществляется в национальной валюте (тенге / KZT) по тарифам, указанным в Сервисе.
                <br/>3.2. Оплата производится безналичным путем с использованием банковских карт Visa/Mastercard.
                <br/>3.3. Моментом оказания услуги по предоставлению доступа считается факт зачисления Кредитов на внутренний баланс Пользователя.
              </p>

              <h3 className="legal-h3">4. Права на сгенерированный контент</h3>
              <p className="legal-p">
                Пользователь получает неисключительные коммерческие права на использование всего сгенерированного им контента. Сервис не претендует на авторство финальных изображений и видео.
              </p>

              <h3 className="legal-h3">5. Ограничения (Zero-Tolerance)</h3>
              <p className="legal-p">
                Запрещено использовать Сервис для создания материалов, нарушающих законодательство: детская порнография, дипфейки без согласия лиц, пропаганда насилия, экстремизма. При нарушении аккаунт блокируется без возврата средств.
              </p>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="legal-doc-section">
              <h1 className="legal-h1">Политика возврата денежных средств и отмены услуг</h1>
              
              <p className="legal-p">
                В соответствии с Законом Республики Казахстан «О защите прав потребителей» и правилами Международных платежных систем, Пользователь имеет право на возврат денежных средств на следующих условиях:
              </p>

              <h3 className="legal-h3">1. Основания для возврата</h3>
              <p className="legal-p">
                1.1. Технический сбой: списание денежных средств со счета Пользователя произошло, но пакет Кредитов (CR) не был начислен на баланс в Сервисе в течение 1 (одного) часа.
                <br/>1.2. Двойное списание (ошибочное дублирование транзакции).
                <br/>1.3. Отказ Пользователя от услуг до момента использования начисленных кредитов (не позднее 14 дней с момента оплаты при условии, что баланс кредитов не был потрачен).
              </p>

              <h3 className="legal-h3">2. Порядок возврата</h3>
              <p className="legal-p">
                2.1. Возврат осуществляется ИСКЛЮЧИТЕЛЬНО на ту же банковскую карту Visa или Mastercard, с которой была совершена изначальная оплата.
                <br/>2.2. Для инициации возврата Пользователю необходимо отправить запрос на email: <strong>support@morphai.kz</strong>, указав свой Telegram ID, дату, сумму платежа и причину возврата.
                <br/>2.3. Заявления на возврат рассматриваются в течение 2-х рабочих дней.
                <br/>2.4. Срок зачисления возвращенных денежных средств на карту зависит от банка-эмитента Пользователя и может составлять от 1 до 14 банковских дней.
              </p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="legal-doc-section">
              <h1 className="legal-h1">Безопасность онлайн-платежей</h1>
              <div className="legal-badges-grid">
                <ShieldCheck size={48} color="#10b981" />
                <Lock size={48} color="#e5b95c" />
              </div>
              <p className="legal-p">
                Оплата услуг в приложении Morph AI осуществляется банковскими картами Visa, Mastercard и другими поддерживаемыми платежными системами. 
              </p>
              
              <h3 className="legal-h3">Защищенный эквайринг</h3>
              <p className="legal-p">
                Процессинг платежей осуществляется надежным и сертифицированным партнером — АО «Народный Банк Казахстана» (система Epay).
                <br/>Мы гарантируем высочайший уровень защиты данных: наш сайт не запрашивает, не хранит и не обрабатывает реквизиты ваших платежных карт.
              </p>

              <h3 className="legal-h3">Технологии защиты</h3>
              <ul className="legal-list">
                <li><strong>PCI DSS Level 1:</strong> Эквайринг полностью соответствует высшему стандарту безопасности индустрии платежных карт.</li>
                <li><strong>Шифрование TLS 1.3:</strong> Все данные передаются по защищенным каналам с криптографическим ключом длиной 256 бит, что исключает их перехват третьими лицами.</li>
                <li><strong>3-D Secure:</strong> Мы используем технологии авторизации Verified by Visa и Mastercard Identity Check для подтверждения платежей через SMS или приложение вашего банка, защищая от мошеннических списаний.</li>
              </ul>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="legal-doc-section">
              <h1 className="legal-h1">Реквизиты и контакты</h1>
              <p className="legal-p">
                Сервис предоставляется и управляется юридическим лицом, зарегистрированным в Республике Казахстан.
              </p>
              
              <div className="legal-requisites-card">
                <div className="req-row">
                  <span className="req-key">Наименование:</span>
                  <span className="req-value">ИП / ТОО «Morph AI»</span>
                </div>
                <div className="req-row">
                  <span className="req-key">БИН / ИИН:</span>
                  <span className="req-value">990140001234</span>
                </div>
                <div className="req-row">
                  <span className="req-key">Юридический адрес:</span>
                  <span className="req-value">Республика Казахстан, г. Алматы / г. Астана</span>
                </div>
                <div className="req-row">
                  <span className="req-key">Электронная почта:</span>
                  <span className="req-value"><a href="mailto:support@morph-ai.asia">support@morph-ai.asia</a></span>
                </div>
                <div className="req-row">
                  <span className="req-key">Telegram-поддержка:</span>
                  <span className="req-value"><a href="https://t.me/morphai_support" target="_blank" rel="noreferrer">@morphai_support</a></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Legal;
