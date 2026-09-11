import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { adminLogin } from '../../services/api';

const AdminLogin = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Пожалуйста, введите мастер-пароль');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await adminLogin(password.trim());
      if (data && data.success) {
        onLoginSuccess(data);
      }
    } catch (err) {
      setError(err.message || 'Неверный пароль администратора');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-glow-bg" />
      
      <div className="admin-login-card">
        <div className="admin-login-brand-header">
          <div className="admin-login-logo-circle">
            <Sparkles size={24} color="#e5b95c" />
          </div>
          <h1 className="admin-login-title">Morphi Admin Hub</h1>
          <p className="admin-login-subtitle">Центр управления и аналитики платформы</p>
        </div>

        {error && (
          <div className="admin-login-error-alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-input-group">
            <label className="admin-login-label">Мастер-пароль доступа</label>
            <div className="admin-login-input-wrapper">
              <Lock size={18} className="admin-login-icon-left" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••••••"
                className="admin-login-input"
                autoFocus
              />
              <button
                type="button"
                className="admin-login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="admin-login-submit-btn"
          >
            {loading ? (
              <span>Вход в систему...</span>
            ) : (
              <>
                <span>Войти в панель</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer-badge">
          <ShieldCheck size={14} color="#10b981" />
          <span>Защищённое сквозное TLS 1.3 соединение</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
