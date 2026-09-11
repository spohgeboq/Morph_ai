import React, { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  Zap, 
  TrendingUp, 
  Film, 
  Image as ImageIcon, 
  BookOpen, 
  Repeat, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight,
  Sparkles,
  Server,
  RefreshCw
} from 'lucide-react';

const DashboardTab = ({ stats, loading, onRefresh, onNavigateTab }) => {
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'generations'

  if (loading && !stats) {
    return (
      <div className="admin-tab-loading">
        <div className="admin-spinner" />
        <p>Загрузка сводной аналитики...</p>
      </div>
    );
  }

  const rev = stats?.revenue || {};
  const usr = stats?.users || {};
  const gen = stats?.generations || {};
  const topModels = stats?.topModels || [];
  const chartData = stats?.chartData || [];
  const health = stats?.systemHealth || {};

  const totalGens = parseInt(gen.total_generations || 0);
  const completedGens = parseInt(gen.completed_generations || 0);
  const successRate = totalGens > 0 ? Math.round((completedGens / totalGens) * 100) : 100;

  // Расчет максимума для SVG-графика
  const maxVal = Math.max(
    ...chartData.map((d) => (chartMetric === 'revenue' ? parseFloat(d.revenue) : parseInt(d.generations))),
    chartMetric === 'revenue' ? 1000 : 10
  );

  return (
    <div className="admin-dashboard-tab">
      {/* Шапка дашборда */}
      <div className="admin-tab-header">
        <div>
          <h2 className="admin-tab-title">Сводная аналитика платформы</h2>
          <p className="admin-tab-desc">Финансы, пользовательская активность и статус нейросетей в реальном времени</p>
        </div>
        <button className="admin-refresh-btn" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'admin-spin' : ''} />
          <span>Обновить</span>
        </button>
      </div>

      {/* Верхние ключевые метрики (KPI Cards) */}
      <div className="admin-kpi-grid">
        {/* Карточка 1: Выручка */}
        <div className="admin-kpi-card revenue-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Общая выручка</span>
            <div className="admin-kpi-icon-wrap gold">
              <DollarSign size={20} color="#e5b95c" />
            </div>
          </div>
          <div className="admin-kpi-value">
            {Number(rev.total_revenue || 0).toLocaleString('ru-RU')} ₸
          </div>
          <div className="admin-kpi-sub-stats">
            <span className="sub-stat-item">Сегодня: <strong>+{Number(rev.revenue_today || 0).toLocaleString()} ₸</strong></span>
            <span className="sub-stat-item">7 дней: <strong>{Number(rev.revenue_7d || 0).toLocaleString()} ₸</strong></span>
          </div>
        </div>

        {/* Карточка 2: Пользователи */}
        <div className="admin-kpi-card users-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Пользователи</span>
            <div className="admin-kpi-icon-wrap blue">
              <Users size={20} color="#60a5fa" />
            </div>
          </div>
          <div className="admin-kpi-value">
            {Number(usr.total_users || 0).toLocaleString('ru-RU')}
          </div>
          <div className="admin-kpi-sub-stats">
            <span className="sub-stat-item">Новых за сутки: <strong>+{usr.new_today || 0}</strong></span>
            <span className="sub-stat-item">За неделю: <strong>+{usr.new_7d || 0}</strong></span>
          </div>
        </div>

        {/* Карточка 3: Всего генераций */}
        <div className="admin-kpi-card gens-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Всего генераций</span>
            <div className="admin-kpi-icon-wrap red">
              <Zap size={20} color="#f43f5e" />
            </div>
          </div>
          <div className="admin-kpi-value">
            {totalGens.toLocaleString('ru-RU')}
          </div>
          <div className="admin-kpi-sub-stats">
            <span className="sub-stat-item">Успешность: <strong>{successRate}%</strong></span>
            <span className="sub-stat-item">Списано: <strong>{Number(gen.total_credits_spent || 0).toLocaleString()} CR</strong></span>
          </div>
        </div>

        {/* Карточка 4: Кредиты на руках */}
        <div className="admin-kpi-card balance-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Баланс в обращении</span>
            <div className="admin-kpi-icon-wrap purple">
              <Sparkles size={20} color="#c084fc" />
            </div>
          </div>
          <div className="admin-kpi-value">
            {Number(usr.total_credits_in_circulation || 0).toLocaleString('ru-RU')} CR
          </div>
          <div className="admin-kpi-sub-stats">
            <span className="sub-stat-item">Заказов оплачено: <strong>{rev.total_orders || 0}</strong></span>
            <span className="sub-stat-item">Заблокировано: <strong>{usr.banned_count || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* График динамики за 14 дней */}
      <div className="admin-card admin-chart-card">
        <div className="admin-chart-card-header">
          <div className="admin-chart-title-group">
            <TrendingUp size={18} color="#e5b95c" />
            <h3 className="admin-card-title">Динамика за 14 дней</h3>
          </div>
          <div className="admin-segmented-controls">
            <button
              className={`admin-seg-btn ${chartMetric === 'revenue' ? 'active' : ''}`}
              onClick={() => setChartMetric('revenue')}
            >
              Выручка (₸)
            </button>
            <button
              className={`admin-seg-btn ${chartMetric === 'generations' ? 'active' : ''}`}
              onClick={() => setChartMetric('generations')}
            >
              Генерации (шт)
            </button>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="admin-chart-svg-container">
            <div className="admin-chart-bars-wrap">
              {chartData.map((point, index) => {
                const val = chartMetric === 'revenue' ? parseFloat(point.revenue) : parseInt(point.generations);
                const heightPercent = maxVal > 0 ? Math.max(6, Math.round((val / maxVal) * 100)) : 6;
                const dateLabel = new Date(point.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

                return (
                  <div key={index} className="admin-chart-col" title={`${dateLabel}: ${val} ${chartMetric === 'revenue' ? '₸' : 'ген.'}`}>
                    <div className="admin-chart-tooltip">
                      <span className="tooltip-date">{dateLabel}</span>
                      <span className="tooltip-val">{val.toLocaleString('ru-RU')} {chartMetric === 'revenue' ? '₸' : 'ген.'}</span>
                    </div>
                    <div className="admin-bar-outer">
                      <div 
                        className={`admin-bar-inner ${chartMetric === 'revenue' ? 'gold' : 'ruby'}`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="admin-chart-x-label">{dateLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="admin-empty-chart">Данных о динамике пока недостаточно</div>
        )}
      </div>

      {/* Двухколоночный блок: Распределение генераций и Топ моделей */}
      <div className="admin-grid-2col">
        {/* Разбивка по типам генераций */}
        <div className="admin-card">
          <h3 className="admin-card-title">Распределение по медиа-форматам</h3>
          <div className="admin-breakdown-list">
            <div className="admin-breakdown-item">
              <div className="breakdown-info-row">
                <div className="breakdown-label-with-icon">
                  <Film size={15} color="#60a5fa" />
                  <span>Видеоролики</span>
                </div>
                <span className="breakdown-count">
                  {gen.video_count || 0} ({totalGens > 0 ? Math.round(((gen.video_count || 0) / totalGens) * 100) : 0}%)
                </span>
              </div>
              <div className="admin-progress-bar">
                <div 
                  className="admin-progress-fill blue" 
                  style={{ width: `${totalGens > 0 ? ((gen.video_count || 0) / totalGens) * 100 : 0}%` }} 
                />
              </div>
            </div>

            <div className="admin-breakdown-item">
              <div className="breakdown-info-row">
                <div className="breakdown-label-with-icon">
                  <ImageIcon size={15} color="#e5b95c" />
                  <span>Фото и Портреты</span>
                </div>
                <span className="breakdown-count">
                  {gen.photo_count || 0} ({totalGens > 0 ? Math.round(((gen.photo_count || 0) / totalGens) * 100) : 0}%)
                </span>
              </div>
              <div className="admin-progress-bar">
                <div 
                  className="admin-progress-fill gold" 
                  style={{ width: `${totalGens > 0 ? ((gen.photo_count || 0) / totalGens) * 100 : 0}%` }} 
                />
              </div>
            </div>

            <div className="admin-breakdown-item">
              <div className="breakdown-info-row">
                <div className="breakdown-label-with-icon">
                  <BookOpen size={15} color="#c084fc" />
                  <span>Сказки и Истории</span>
                </div>
                <span className="breakdown-count">
                  {gen.text_count || 0} ({totalGens > 0 ? Math.round(((gen.text_count || 0) / totalGens) * 100) : 0}%)
                </span>
              </div>
              <div className="admin-progress-bar">
                <div 
                  className="admin-progress-fill purple" 
                  style={{ width: `${totalGens > 0 ? ((gen.text_count || 0) / totalGens) * 100 : 0}%` }} 
                />
              </div>
            </div>

            <div className="admin-breakdown-item">
              <div className="breakdown-info-row">
                <div className="breakdown-label-with-icon">
                  <Repeat size={15} color="#34d399" />
                  <span>Face Swap (Замена лица)</span>
                </div>
                <span className="breakdown-count">
                  {gen.faceswap_count || 0} ({totalGens > 0 ? Math.round(((gen.faceswap_count || 0) / totalGens) * 100) : 0}%)
                </span>
              </div>
              <div className="admin-progress-bar">
                <div 
                  className="admin-progress-fill green" 
                  style={{ width: `${totalGens > 0 ? ((gen.faceswap_count || 0) / totalGens) * 100 : 0}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Топ-5 популярных нейросетей */}
        <div className="admin-card">
          <h3 className="admin-card-title">Топ используемых моделей ИИ</h3>
          {topModels.length > 0 ? (
            <div className="admin-top-models-list">
              {topModels.map((item, idx) => (
                <div key={idx} className="admin-top-model-row">
                  <span className="model-rank-badge">#{idx + 1}</span>
                  <div className="model-row-meta">
                    <span className="model-row-name">{item.model_name || 'Неизвестно'}</span>
                    <span className="model-row-type">{item.task_type}</span>
                  </div>
                  <span className="model-row-count">{Number(item.count).toLocaleString()} ген.</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state-text">Генераций пока не зарегистрировано</div>
          )}
        </div>
      </div>

      {/* Мониторинг провайдеров (System Health) */}
      <div className="admin-card admin-health-card">
        <div className="admin-health-header">
          <div className="health-title-group">
            <Server size={18} color="#10b981" />
            <h3 className="admin-card-title">Статус серверов и провайдеров</h3>
          </div>
          <span className="admin-health-ok-badge">
            <ShieldCheck size={14} color="#10b981" />
            <span>Все системы в норме</span>
          </span>
        </div>

        <div className="admin-health-grid">
          <div className="admin-health-node">
            <span className="health-node-name">PostgreSQL DB</span>
            <div className="health-status-badge online">
              <span className="pulsing-dot" />
              <span>Подключена</span>
            </div>
          </div>

          <div className="admin-health-node">
            <span className="health-node-name">Telegram Bot</span>
            <div className={`health-status-badge ${health.bot === 'active' ? 'online' : 'offline'}`}>
              <span className="pulsing-dot" />
              <span>{health.bot === 'active' ? 'Активен' : 'Отключён'}</span>
            </div>
          </div>

          <div className="admin-health-node">
            <span className="health-node-name">OpenRouter AI</span>
            <div className={`health-status-badge ${health.openrouter === 'operational' ? 'online' : 'offline'}`}>
              <span className="pulsing-dot" />
              <span>{health.openrouter === 'operational' ? 'Operational' : 'Offline'}</span>
            </div>
          </div>

          <div className="admin-health-node">
            <span className="health-node-name">PiAPI (Kling/Flux)</span>
            <div className={`health-status-badge ${health.piapi === 'operational' ? 'online' : 'offline'}`}>
              <span className="pulsing-dot" />
              <span>{health.piapi === 'operational' ? 'Operational' : 'Offline'}</span>
            </div>
          </div>

          <div className="admin-health-node">
            <span className="health-node-name">RunwayML Video</span>
            <div className={`health-status-badge ${health.runway === 'operational' ? 'online' : 'offline'}`}>
              <span className="pulsing-dot" />
              <span>{health.runway === 'operational' ? 'Operational' : 'Offline'}</span>
            </div>
          </div>

          <div className="admin-health-node">
            <span className="health-node-name">FaceSwap Service</span>
            <div className={`health-status-badge ${health.faceswap === 'operational' ? 'online' : 'offline'}`}>
              <span className="pulsing-dot" />
              <span>{health.faceswap === 'operational' ? 'Operational' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
