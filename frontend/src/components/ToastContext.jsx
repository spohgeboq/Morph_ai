import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Показ современного тоста
  const showToast = useCallback((message, type = 'success', duration = 2600) => {
    try {
      if (WebApp?.HapticFeedback) {
        if (type === 'error') WebApp.HapticFeedback.notificationOccurred('error');
        else if (type === 'success') WebApp.HapticFeedback.notificationOccurred('success');
        else WebApp.HapticFeedback.impactOccurred('light');
      }
    } catch (e) {}

    setToast({ id: Date.now(), message, type });

    if (window._toastTimeout) clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  // Показ современного диалога подтверждения вместо window.confirm
  const showConfirm = useCallback(({
    title = 'Подтверждение',
    message = 'Вы уверены, что хотите выполнить это действие?',
    confirmText = 'Подтвердить',
    cancelText = 'Отмена',
    isDanger = false,
    onConfirm = () => {},
    onCancel = () => {}
  }) => {
    try {
      if (WebApp?.HapticFeedback) {
        WebApp.HapticFeedback.impactOccurred('medium');
      }
    } catch (e) {}

    setConfirmDialog({
      title,
      message,
      confirmText,
      cancelText,
      isDanger,
      onConfirm: () => {
        try {
          if (WebApp?.HapticFeedback) WebApp.HapticFeedback.impactOccurred('medium');
        } catch (e) {}
        setConfirmDialog(null);
        onConfirm();
      },
      onCancel: () => {
        setConfirmDialog(null);
        onCancel();
      }
    });
  }, []);

  const closeToast = () => setToast(null);

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* Всплывающий стильный Тост */}
      {toast && (
        <div className="morphi-toast-container" onClick={closeToast}>
          <div className={`morphi-toast-card ${toast.type || 'success'}`}>
            <div className="morphi-toast-icon">
              {toast.type === 'error' && <AlertCircle size={18} color="#f87171" />}
              {toast.type === 'info' && <Info size={18} color="var(--color-accent)" />}
              {toast.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
              {toast.type === 'token' && <Sparkles size={18} color="var(--color-accent)" />}
            </div>
            <span className="morphi-toast-text">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Премиальный диалог подтверждения вместо window.confirm */}
      {confirmDialog && (
        <div className="morphi-confirm-backdrop" onClick={confirmDialog.onCancel}>
          <div className="morphi-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="morphi-confirm-header">
              <h3 className="morphi-confirm-title">{confirmDialog.title}</h3>
              <button className="profile-modal-close-btn" onClick={confirmDialog.onCancel}>
                <X size={16} />
              </button>
            </div>

            <p className="morphi-confirm-message">{confirmDialog.message}</p>

            <div className="morphi-confirm-actions">
              <button 
                className="morphi-confirm-cancel-btn"
                onClick={confirmDialog.onCancel}
              >
                {confirmDialog.cancelText}
              </button>

              <button 
                className={`morphi-confirm-submit-btn ${confirmDialog.isDanger ? 'danger' : ''}`}
                onClick={confirmDialog.onConfirm}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback safe dummy if used outside provider
    return {
      showToast: (msg) => console.log('Toast:', msg),
      showConfirm: ({ onConfirm }) => onConfirm?.()
    };
  }
  return context;
};
