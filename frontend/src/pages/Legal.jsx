import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ShieldCheck,
  FileText,
  RefreshCw,
  Lock,
  Mail,
  MapPin,
  Truck,
  CreditCard,
  Phone,
  Building2,
  CheckCircle2,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import TariffsSection from '../components/TariffsSection';
import Footer from '../components/Footer';

const Legal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  // Определение активной вкладки по URL
  const getTabFromPath = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('terms') || path.includes('oferta')) return 'terms';
    if (path.includes('refund')) return 'refund';
    if (path.includes('security')) return 'security';
    if (path.includes('delivery')) return 'delivery';
    if (path.includes('tariffs') || path.includes('pricing')) return 'tariffs';
    if (path.includes('contacts') || path.includes('requisites')) return 'contacts';
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
    { id: 'delivery', label: 'Доставка цифровых услуг', path: '/delivery', icon: <Truck size={16} /> },
    { id: 'tariffs', label: 'Тарифы и стоимость', path: '/tariffs', icon: <CreditCard size={16} /> },
    { id: 'contacts', label: 'Реквизиты и контакты', path: '/contacts', icon: <Building2 size={16} /> },
  ];

  return (
    <div className="legal-page-container">
      {/* Header */}
      <header className="legal-header">
        <button className="legal-back-btn" onClick={() => navigate(-1)} aria-label="Назад">
          <ChevronLeft size={24} />
        </button>
        <div className="legal-header-title">
          <h2>Правовая информация и оферта</h2>
          <span>ИП ЖЕЛЕЗНОВА • Morph AI Ecosystem</span>
        </div>
      </header>

      {/* Tabs / Navigation */}
      <div className="legal-tabs-wrapper">
        <div className="legal-tabs-scrollable">
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
      </div>

      {/* Content Area */}
      <div className="legal-content-scroll" ref={contentRef}>
        <div className="legal-document-body">

          {/* ======================================================== */}
          {/* 1. ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ */}
          {/* ======================================================== */}
          {activeTab === 'privacy' && (
            <div className="legal-doc-section">
              <h1 className="legal-h1">Политика конфиденциальности и защиты персональных данных</h1>
              <p className="legal-updated-date">Редакция от 23 сентября 2026 года • Вступает в силу с момента публикации</p>

              <div className="legal-alert info">
                Настоящая Политика конфиденциальности разработана в строгом соответствии с Законом Республики Казахстан от 21 мая 2013 года № 94-V «О персональных данных и их защите», а также международными стандартами безопасности хранения и передачи информации.
              </div>

              <h3 className="legal-h3">1. Общие положения</h3>
              <p className="legal-p">
                1.1. Настоящая Политика определяет порядок обработки и защиты персональной информации пользователей веб-сервиса, доступного по адресам <strong>https://morph-ai.asia</strong> и <strong>https://www.morph-ai.asia</strong>, а также в официальном Telegram-боте (далее — «Сервис»).
                <br />1.2. Оператором и владельцем Сервиса является <strong>Индивидуальный предприниматель ЖЕЛЕЗНОВА</strong> (свидетельство/уведомление № KZ41UUZ00570345 от 23.09.2026 г., ИИН: 791109400410, адрес: Республика Казахстан, Карагандинская область, г. Темиртау, ул. Чернышевского, д. 114, кв. 47).
                <br />1.3. Использование Сервиса означает полное и безоговорочное согласие Пользователя с условиями настоящей Политики. В случае несогласия с условиями пользователь обязан прекратить использование Сервиса.
              </p>

              <h3 className="legal-h3">2. Данные банковских карт и безопасность платежей (Критически важно)</h3>
              <p className="legal-p">
                2.1. <strong>Сервис ИП ЖЕЛЕЗНОВА НЕ собирает, НЕ обрабатывает и НЕ хранит данные банковских платежных карт Пользователей</strong> (включая полный номер карты, срок действия карты, CVV/CVC2-коды, ПИН-коды).
                <br />2.2. При оформлении покупки тарифов/пакетов генераций Пользователь осуществляет оплату через защищенный платежный шлюз сертифицированного банковского интернет-эквайринга (с полной поддержкой банковских карт Казахстана Kaspi Gold, Halyk Bank, Jusan, Forte, а также международных систем Visa и Mastercard).
                <br />2.3. Вся передача платежных реквизитов осуществляется по закрытым банковским каналам с применением шифрования TLS 1.3 / SSL 256-бит и протокола двухфакторной аутентификации <strong>3-D Secure</strong> (Verified by Visa, Mastercard Identity Check).
                <br />2.4. Платежный шлюз провайдера сертифицирован по наивысшему уровню безопасности индустрии платежных карт — <strong>PCI DSS Level 1</strong>.
              </p>

              <h3 className="legal-h3">3. Перечень обрабатываемых пользовательских данных</h3>
              <p className="legal-p">
                Для обеспечения работы функционала Сервис собирает исключительно следующие технические данные:
              </p>
              <ul className="legal-list">
                <li>Идентификатор пользователя в системе Telegram (Telegram ID) и публичное имя (username/first name) при входе через Telegram WebApp;</li>
                <li>Адрес электронной почты (e-mail) при обращении в службу технической поддержки;</li>
                <li>Загружаемые Пользователем фотоматериалы (селфи/портреты) и текстовые запросы (промпты) — исключительно на период выполнения генерации;</li>
                <li>Историю начисления и списания внутренних расчетных единиц сервиса (CR).</li>
              </ul>

              <h3 className="legal-h3">4. Политика обработки и удаления медиафайлов</h3>
              <p className="legal-p">
                4.1. Все исходные фотографии лиц, загруженные Пользователем для генерации фотосетов или Face Swap, обрабатываются в изолированных контейнерах нейросетей.
                <br />4.2. <strong>Исходные фотографии удаляются с серверов автоматически в течение 24 часов</strong> после завершения вычислительного процесса.
                <br />4.3. Исходные и сгенерированные файлы ни при каких условиях не передаются третьим лицам и не используются для публичного дообучения моделей искусственного интеллекта без прямого согласия Пользователя.
              </p>

              <h3 className="legal-h3">5. Права Пользователя</h3>
              <p className="legal-p">
                Пользователь имеет право в любой момент запросить информацию об обработке своих данных, потребовать их уточнения, блокирования или полного удаления аккаунта и истории генераций, направив официальный запрос на электронную почту: <strong>zlznvoxana@gmail.com</strong>. Запрос исполняется в срок не более 3 (трех) рабочих дней.
              </p>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. ПУБЛИЧНАЯ ОФЕРТА */}
          {/* ======================================================== */}
          {activeTab === 'terms' && (
            <div className="legal-doc-section">
              <h1 className="legal-h1">Публичная оферта (Пользовательское соглашение)</h1>
              <p className="legal-updated-date">Редакция от 23 сентября 2026 года • г. Темиртау, Республика Казахстан</p>

              <div className="legal-alert success">
                Настоящий документ является официальным предложением (Публичной офертой в соответствии со ст. 395 Гражданского Кодекса Республики Казахстан) заключить Договор возмездного оказания цифровых услуг с ИП ЖЕЛЕЗНОВА.
              </div>

              <h3 className="legal-h3">1. Стороны и предмет договора</h3>
              <p className="legal-p">
                1.1. Исполнитель — <strong>Индивидуальный предприниматель ЖЕЛЕЗНОВА</strong> (ИИН: 791109400410, адрес: Республика Казахстан, Карагандинская область, г. Темиртау, ул. Чернышевского, д. 114, кв. 47, телефон: <a href="tel:+77053326990">+7 705 332 6990</a>, e-mail: <a href="mailto:zlznvoxana@gmail.com">zlznvoxana@gmail.com</a>), с одной стороны, и любое физическое или юридическое лицо, принявшее условия настоящего договора (далее — «Заказчик» или «Пользователь»), с другой стороны.
                <br />1.2. Предметом Договора является предоставление Исполнителем возмездных информационно-вычислительных услуг в электронной форме: предоставление удаленного доступа к программному аппаратно-вычислительному комплексу Morph AI для генерации и редактирования цифрового медиаконтента (фотографий, видео, текста и замены лиц Face Swap) с использованием алгоритмов искусственного интеллекта.
              </p>

              <h3 className="legal-h3">2. Порядок акцепта оферты</h3>
              <p className="legal-p">
                2.1. Полным и безоговорочным акцептом настоящей Публичной оферты является совершение Заказчиком любого из следующих действий:
              </p>
              <ul className="legal-list">
                <li>Регистрация или авторизация на веб-сайте <strong>https://morph-ai.asia</strong> либо запуск Telegram-бота сервиса;</li>
                <li>Оформление заказа и оплата любого пакета услуг генерации банковской картой Visa / Mastercard / картами банков Казахстана через защищенный платежный сервис банковского интернет-эквайринга.</li>
              </ul>

              <h3 className="legal-h3">3. Стоимость услуг, тарифы и подарочные бонусы</h3>
              <p className="legal-p">
                3.1. Учет объема потребляемых услуг ведется во внутренних расчетных единицах — «CR».
                <br />3.2. Цены на пакеты генераций устанавливаются в национальной валюте Республики Казахстан — <strong>тенге (KZT)</strong>:
              </p>
              <ul className="legal-list">
                <li><strong>«Стартовый»</strong> — 100 CR за 1 490 ₸;</li>
                <li><strong>«Оптимальный»</strong> — 350 CR (+50 бонусных CR в подарок, итого 400 CR) за 3 990 ₸;</li>
                <li><strong>«Создатель PRO»</strong> — 1250 CR (+250 бонусных CR в подарок, итого 1500 CR) за 9 990 ₸;</li>
                <li><strong>«Studio Unlimited»</strong> — 2500 CR за 18 990 ₸.</li>
              </ul>
              <p className="legal-p">
                3.3. <strong>Политика подарочных бонусов:</strong> При покупке пакетов «Оптимальный» и «Создатель PRO» Заказчику единовременно и безвозмездно начисляются подарочные бонусные расчетные единицы (+50 CR и +250 CR соответственно). Подарочные бонусы не имеют срока действия, не сгорают и могут использоваться для оплаты любых видов генераций на общих основаниях.
                <br />3.4. Оплата производится безналичным расчетом в режиме онлайн через защищенный банковский интернет-эквайринг с использованием банковских карт Казахстана (Kaspi Gold, Halyk, Jusan, Forte, CenterCredit, Freedom) и международных карт Visa, Mastercard.
                <br />3.5. Моментом выполнения Исполнителем обязательств по предоставлению оплаченного пакета услуг является факт успешного зачисления расчетных единиц CR на баланс учетной записи Пользователя в Сервисе.
              </p>

              <h3 className="legal-h3">4. Интеллектуальная собственность</h3>
              <p className="legal-p">
                4.1. Все имущественные права на программное обеспечение Сервиса, дизайн, логотипы и базы данных принадлежат Исполнителю.
                <br />4.2. Исполнитель предоставляет Заказчику право коммерческого и некоммерческого использования сгенерированных им медиафайлов (изображений и видеороликов) без ограничений по территории и сроку.
              </p>

              <h3 className="legal-h3">5. Правила использования и ограничения</h3>
              <p className="legal-p">
                Категорически запрещается использовать Сервис для создания материалов, нарушающих законодательство Республики Казахстан и нормы международного права: порнографии с участием несовершеннолетних, разжигания межнациональной розни, пропаганды терроризма, создания дипфейков с целью мошенничества или диффамации. Аккаунты нарушителей подлежат немедленной блокировке без права возврата средств.
              </p>

              <h3 className="legal-h3">6. Реквизиты и контакты Исполнителя</h3>
              <p className="legal-p">
                <strong>Индивидуальный предприниматель ЖЕЛЕЗНОВА</strong><br />
                ИИН: 791109400410<br />
                Уведомление о начале деятельности: № KZ41UUZ00570345 от 23.09.2026 года<br />
                Юридический адрес: 101400, Республика Казахстан, Карагандинская обл., г. Темиртау, ул. Чернышевского, д. 114, кв. 47<br />
                Контактный телефон: <a href="tel:+77053326990" className="bold-phone">+7 705 332 6990</a><br />
                Электронная почта службы поддержки: <a href="mailto:zlznvoxana@gmail.com">zlznvoxana@gmail.com</a><br />
                Официальный Telegram-бот: <a href="https://t.me/morphai_app_bot" target="_blank" rel="noreferrer">@morphai_app_bot</a><br />
                Telegram-поддержка: <a href="https://t.me/morphai_support" target="_blank" rel="noreferrer">@morphai_support</a>
              </p>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. УСЛОВИЯ ВОЗВРАТА СРЕДСТВ */}
          {/* ======================================================== */}
          {activeTab === 'refund' && (
            <div className="legal-doc-section">
              <h1 className="legal-h1">Политика возврата денежных средств и отмены транзакций</h1>
              <p className="legal-updated-date">В соответствии с Законом РК «О защите прав потребителей» и регламентами Visa / Mastercard</p>

              <div className="legal-alert info">
                ИП ЖЕЛЕЗНОВА гарантирует соблюдение прав потребителей и обеспечивает прозрачный порядок возврата денежных средств в случае технических сбоев или мотивированного отказа от услуг.
              </div>

              <h3 className="legal-h3">1. Основания для оформления возврата</h3>
              <p className="legal-p">
                Возврат денежных средств Заказчику осуществляется в следующих случаях:
              </p>
              <ul className="legal-list">
                <li><strong>Технический сбой платежного шлюза:</strong> денежные средства были списаны со счета Заказчика, но пакет генераций (CR) не поступил на баланс в Сервисе в течение 1 (одного) часа;</li>
                <li><strong>Ошибочное двойное списание:</strong> дублирование банковской транзакции по вине платежной системы или банка;</li>
                <li><strong>Отказ от неиспользованных услуг:</strong> обращение Заказчика в течение 14 (четырнадцати) календарных дней с момента оплаты при условии, что начисленный баланс (CR) не был израсходован на генерации.</li>
              </ul>

              <h3 className="legal-h3">2. Важное правило возврата на банковскую карту</h3>
              <p className="legal-p">
                2.1. <strong>Возврат денежных средств осуществляется ИСКЛЮЧИТЕЛЬНО на ту же банковскую карту Visa или Mastercard, с которой была произведена первоначальная оплата</strong>.
                <br />2.2. Выплата наличными денежными средствами, перевод на счета третьих лиц или перевод на другие реквизиты строго запрещены правилами Международных платежных систем (МПС) в целях противодействия отмыванию доходов.
              </p>

              <h3 className="legal-h3">3. Порядок подачи и рассмотрения заявления</h3>
              <p className="legal-p">
                3.1. Для оформления возврата Заказчик направляет официальное заявление на адрес электронной почты: <strong>zlznvoxana@gmail.com</strong>.
                <br />3.2. В заявлении необходимо указать:
              </p>
              <ul className="legal-list">
                <li>Идентификатор учетной записи (Telegram ID или логин);</li>
                <li>Дату, время и точную сумму транзакции в тенге (KZT);</li>
                <li>Первые 6 и последние 4 цифры номера карты (например: 4400 43** **** 1234 — <strong>полный номер карты и CVV указывать категорически запрещено!</strong>);</li>
                <li>Причину запроса на возврат.</li>
              </ul>
              <p className="legal-p">
                3.3. Заявление рассматривается уполномоченным сотрудником Исполнителя в течение <strong>2 (двух) рабочих дней</strong>.
                <br />3.4. После одобрения возврата поручение направляется в платежный сервис банковского интернет-эквайринга. Фактический срок зачисления средств на карту Заказчика зависит от банка-эмитента карты и обычно составляет от 1 до 5 банковских дней.
              </p>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. БЕЗОПАСНОСТЬ ОНЛАЙН-ПЛАТЕЖЕЙ */}
          {/* ======================================================== */}
          {activeTab === 'security' && (
            <div className="legal-doc-section">
              <h1 className="legal-h1">Безопасность онлайн-платежей и протоколы защиты</h1>
              <p className="legal-updated-date">Стандарты банковского интернет-эквайринга (Visa, Mastercard, карты банков Казахстана)</p>

              <div className="legal-security-badges-bar">
                <div className="sec-pill-logo"><VisaLogo height={28} /></div>
                <div className="sec-pill-logo"><MastercardLogo height={32} /></div>
                <ThreeDSecureBadge height={32} />
                <PciDssBadge height={32} />
                <SslSecureBadge height={32} />
              </div>

              <h3 className="legal-h3">1. Гарантия защиты платежной информации</h3>
              <p className="legal-p">
                Сервис Morph AI обеспечивает максимальный уровень защиты конфиденциальности при совершении безналичных расчетов. Оплата осуществляется через сертифицированный банковский платежный шлюз (с поддержкой банковских карт Казахстана Kaspi, Halyk, Jusan, Forte, CenterCredit, Freedom, а также международных систем Visa и Mastercard), обладающий наивысшими международными сертификатами безопасности.
              </p>

              <h3 className="legal-h3">2. Стандарт PCI DSS Level 1</h3>
              <p className="legal-p">
                Обработка карточных данных сертифицирована в соответствии с высшим стандартом безопасности данных индустрии платежных карт — <strong>Payment Card Industry Data Security Standard (PCI DSS) Level 1</strong>. Это гарантирует, что конфиденциальные реквизиты карты плательщика не попадут в руки злоумышленников и надежно изолированы внутри защищенного банковского периметра.
              </p>

              <h3 className="legal-h3">3. Технология двухфакторной аутентификации 3-D Secure</h3>
              <p className="legal-p">
                Все онлайн-платежи защищены протоколом <strong>3-D Secure</strong> (программы <em>Visa Secure</em> и <em>Mastercard Identity Check</em>). При проведении оплаты банк-эмитент вашей карты запрашивает подтверждение операции:
              </p>
              <ul className="legal-list">
                <li>Вводом одноразового динамического СМС-кода;</li>
                <li>Либо подтверждением Push-уведомления в мобильном банкинге (например, Halyk Homebank, Kaspi и др.).</li>
              </ul>
              <p className="legal-p">
                Это исключает возможность несанкционированного списания средств в случае утери или компрометации данных карты.
              </p>

              <h3 className="legal-h3">4. Криптографическое шифрование TLS 1.3 / SSL 256-bit</h3>
              <p className="legal-p">
                Соединение между браузером Пользователя, веб-сервером и шлюзом банка защищено современным криптографическим протоколом TLS 1.3 с длиной ключа 256 бит. Данные передаются в строго зашифрованном виде, что делает невозможным их перехват или подмену в сети Интернет.
              </p>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. ДОСТАВКА И ОКАЗАНИЕ ЦИФРОВЫХ УСЛУГ */}
          {/* ======================================================== */}
          {activeTab === 'delivery' && (
            <div className="legal-doc-section">
              <h1 className="legal-h1">Описание услуг, порядок и сроки их оказания (Доставка)</h1>
              <p className="legal-updated-date">Правила предоставления цифровых и информационно-вычислительных услуг</p>

              <div className="legal-alert info">
                Все услуги Сервиса носят <strong>исключительно цифровой (электронный) характер</strong>. Доставка на физических носителях (почтой, курьером) не осуществляется.
              </div>

              <h3 className="legal-h3">1. Описание предоставляемых услуг</h3>
              <p className="legal-p">
                ИП ЖЕЛЕЗНОВА предоставляет Пользователю доступ к облачной вычислительной платформе Morph AI со следующим функционалом:
              </p>
              <ul className="legal-list">
                <li><strong>Генерация фотореалистичных портретов (4K AI Photos):</strong> создание изображений по текстовому описанию и стилистическим референсам;</li>
                <li><strong>Профессиональный студийный фотосет:</strong> создание серии из 5 журнальных кадров студийного качества на основе одной эталонной фотографии лица;</li>
                <li><strong>Генерация видеороликов (AI Video):</strong> синтез коротких видеороликов с использованием передовых нейросетевых моделей (Kling AI, Hailuo, Runway);</li>
                <li><strong>Face Swap:</strong> интеллектуальная замена лиц на статичных изображениях и в видеопотоке с сохранением естественной мимики и освещения;</li>
                <li><strong>Генерация текстов и сценариев:</strong> помощь в составлении креативных описаний и промптов.</li>
              </ul>

              <h3 className="legal-h3">2. Сроки и порядок доставки цифровых услуг</h3>
              <p className="legal-p">
                2.1. <strong>Моментальное начисление баланса:</strong> сразу после подтверждения успешной авторизации платежа банком-эквайером единицы CR зачисляются на баланс учетной записи Пользователя в автоматическом режиме в срок от <strong>1 до 60 секунд</strong>.
                <br />2.2. <strong>Срок генерации контента:</strong> вычислительный процесс создания медиафайлов запускается по команде Пользователя и составляет:
              </p>
              <ul className="legal-list">
                <li>Генерация одиночного фотопортрета: от 5 до 30 секунд;</li>
                <li>Студийный пакетный фотосет (5 кадров): от 30 до 90 секунд;</li>
                <li>Синтез видеоролика высокой четкости: от 60 до 180 секунд (в зависимости от очереди на вычислительных GPU-кластерах).</li>
              </ul>
              <p className="legal-p">
                2.3. Готовые файлы становятся доступны для мгновенного просмотра и скачивания в высоком разрешении непосредственно в интерфейсе Сервиса (разделы «Чаты», «Профиль», «Лента»).
              </p>
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. ТАРИФЫ И СТОИМОСТЬ */}
          {/* ======================================================== */}
          {activeTab === 'tariffs' && (
            <div className="legal-doc-section">
              <h1 className="legal-h1">Тарифы, стоимость услуг и правила расчетов</h1>
              <p className="legal-updated-date">Официальный прейскурант цен ИП ЖЕЛЕЗНОВА • Валюта расчетов: Казахстанский тенге (KZT)</p>

              <div className="legal-alert success">
                Оплата производится в национальной валюте Республики Казахстан — тенге (₸). Для удобства пользователей указан ориентировочный расчет в рублях.
              </div>

              {/* Интерактивный компонент Тарифов с кнопками */}
              <TariffsSection
                title="Пакеты пополнения баланса генераций"
                subtitle="Выберите подходящий пакет. Единицы CR используются для запуска нейросетевых генераций фото и видео."
              />

              <h3 className="legal-h3" style={{ marginTop: '30px' }}>Расход единиц CR по видам услуг</h3>
              <div className="tariffs-rates-table-wrapper">
                <table className="tariffs-rates-table">
                  <thead>
                    <tr>
                      <th>Услуга / Тип генерации</th>
                      <th>Стоимость (CR)</th>
                      <th>Результат</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Генерация фото (Seedream, Flux, GPT Image, Nano Banana)</td>
                      <td><strong>4–12 CR</strong></td>
                      <td>Изображение ультравысокого разрешения 4K</td>
                    </tr>
                    <tr>
                      <td>Студийный профессиональный фотосет</td>
                      <td><strong>10 CR</strong></td>
                      <td>Пакет из 5 журнальных кадров 4K (2 CR / фото)</td>
                    </tr>
                    <tr>
                      <td>Face Swap и шаблоны (замена лиц в фото и видео)</td>
                      <td><strong>6–10 CR</strong></td>
                      <td>Фотомонтаж высокой точности</td>
                    </tr>
                    <tr>
                      <td>Кинематографичное видео (Kling, Veo, Seedance, MiniMax, Wan)</td>
                      <td><strong>8–18 CR</strong></td>
                      <td>HD/4K видеоролик 5–10 секунд</td>
                    </tr>
                    <tr>
                      <td>Текстовые истории и сценарии (GPT-4o, Claude)</td>
                      <td><strong>2–4 CR</strong></td>
                      <td>Готовый текст / сценарий / сказка</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="legal-subtext-note" style={{ marginTop: '12px', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                * При покупке тарифов «Оптимальный» (350 CR) и «Создатель PRO» (1250 CR) начисляются дополнительные подарочные бонусы (+50 CR и +250 CR соответственно). Бонусные кредиты бессрочны и расходуются наравне с основными.
              </p>
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. РЕКВИЗИТЫ И ОФИЦИАЛЬНЫЕ КОНТАКТЫ */}
          {/* ======================================================== */}
          {activeTab === 'contacts' && (
            <div className="legal-doc-section">
              <h1 className="legal-h1">Реквизиты продавца и официальные контакты</h1>
              <p className="legal-updated-date">Полные регистрационные данные в соответствии с законодательством Республики Казахстан</p>

              <div className="legal-requisites-grid">
                <div className="legal-requisite-card primary">
                  <div className="req-card-header">
                    <Building2 size={24} color="#e5b95c" />
                    <div>
                      <h3>ИП ЖЕЛЕЗНОВА</h3>
                      <span>Индивидуальный предприниматель</span>
                    </div>
                  </div>

                  <div className="req-data-table">
                    <div className="req-data-row">
                      <span className="req-data-label">ФИО предпринимателя:</span>
                      <span className="req-data-val">ЖЕЛЕЗНОВА ОКСАНА ЮРЬЕВНА</span>
                    </div>
                    <div className="req-data-row">
                      <span className="req-data-label">ИИН:</span>
                      <span className="req-data-val bold-accent">791109400410</span>
                    </div>
                    <div className="req-data-row">
                      <span className="req-data-label">Номер уведомления о начале деятельности:</span>
                      <span className="req-data-val">№ KZ41UUZ00570345 от 23.09.2026 года</span>
                    </div>
                    <div className="req-data-row">
                      <span className="req-data-label">Орган государственных доходов:</span>
                      <span className="req-data-val">3012 УГД по городу Темиртау ДГД по Карагандинской области КГД МФ РК</span>
                    </div>
                    <div className="req-data-row">
                      <span className="req-data-label">Юридический адрес:</span>
                      <span className="req-data-val">101400, Республика Казахстан, Карагандинская область, город Темиртау, улица Чернышевского, дом 114, квартира 47</span>
                    </div>
                    <div className="req-data-row">
                      <span className="req-data-label">Контактный телефон:</span>
                      <span className="req-data-val bold-accent"><a href="tel:+77053326990" style={{ color: 'inherit', textDecoration: 'none' }}>+7 705 332 6990</a></span>
                    </div>
                    <div className="req-data-row">
                      <span className="req-data-label">Вид деятельности (код ОКЭД):</span>
                      <span className="req-data-val">96090 (Предоставление прочих индивидуальных услуг, не включенных в другие группировки)</span>
                    </div>
                    <div className="req-data-row">
                      <span className="req-data-label">Режим налогообложения:</span>
                      <span className="req-data-val">Упрощенная декларация для субъектов малого бизнеса</span>
                    </div>
                  </div>
                </div>

                <div className="legal-requisite-card secondary">
                  <div className="req-card-header">
                    <HelpCircle size={24} color="#10b981" />
                    <div>
                      <h3>Служба поддержки клиентов</h3>
                      <span>Режим работы: 24/7 (Круглосуточно)</span>
                    </div>
                  </div>

                  <div className="contacts-list-box">
                    <div className="contact-box-item">
                      <Phone size={18} color="#10b981" />
                      <div>
                        <span className="contact-box-label">Контактный телефон поддержки:</span>
                        <a href="tel:+77053326990" className="contact-box-link bold-phone">+7 705 332 6990</a>
                      </div>
                    </div>

                    <div className="contact-box-item">
                      <Mail size={18} color="#3b82f6" />
                      <div>
                        <span className="contact-box-label">Электронная почта поддержки:</span>
                        <a href="mailto:zlznvoxana@gmail.com" className="contact-box-link">zlznvoxana@gmail.com</a>
                      </div>
                    </div>

                    <div className="contact-box-item">
                      <FileCheck size={18} color="#10b981" />
                      <div>
                        <span className="contact-box-label">Telegram-поддержка:</span>
                        <a href="https://t.me/morphai_support" target="_blank" rel="noreferrer" className="contact-box-link">@morphai_support</a>
                      </div>
                    </div>

                    <div className="contact-box-item">
                      <Building2 size={18} color="#e5b95c" />
                      <div>
                        <span className="contact-box-label">Официальный веб-сайт:</span>
                        <a href="https://morph-ai.asia" target="_blank" rel="noreferrer" className="contact-box-link">https://morph-ai.asia</a>
                      </div>
                    </div>

                    <div className="contact-box-item">
                      <CreditCard size={18} color="#a855f7" />
                      <div>
                        <span className="contact-box-label">Платежный провайдер интернет-эквайринга:</span>
                        <span className="contact-box-text">Банковский интернет-эквайринг (для карт Казахстана: Kaspi, Halyk, Jusan, Forte, карт Visa, Mastercard по стандарту PCI DSS Level 1)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Интегрированный подвал сайта */}
          <div style={{ marginTop: '40px' }}>
            <Footer />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Legal;
