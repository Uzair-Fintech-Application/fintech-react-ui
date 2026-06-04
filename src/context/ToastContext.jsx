import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

const TOAST_CONFIG = {
  success: {
    icon: '✓',
    color: '#00ffa3',
    bg: 'rgba(0,255,163,0.08)',
    border: 'rgba(0,255,163,0.25)',
    glow: '0 0 20px rgba(0,255,163,0.15)',
  },
  error: {
    icon: '✕',
    color: '#ff4757',
    bg: 'rgba(255,71,87,0.08)',
    border: 'rgba(255,71,87,0.25)',
    glow: '0 0 20px rgba(255,71,87,0.15)',
  },
  info: {
    icon: 'ℹ',
    color: '#818cf8',
    bg: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.25)',
    glow: '0 0 20px rgba(99,102,241,0.15)',
  },
  warning: {
    icon: '⚠',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.25)',
    glow: '0 0 20px rgba(251,191,36,0.15)',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
    warn:    (msg) => addToast(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2" style={{ maxWidth: 360 }}>
        <AnimatePresence>
          {toasts.map(t => {
            const cfg = TOAST_CONFIG[t.type] || TOAST_CONFIG.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: cfg.bg,
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${cfg.border}`,
                  boxShadow: `0 4px 24px rgba(0,0,0,0.4), ${cfg.glow}`,
                  color: cfg.color,
                  minWidth: 280,
                }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${cfg.color}20`, color: cfg.color }}
                >
                  {cfg.icon}
                </span>
                <span style={{ color: '#e2e8f0' }}>{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};
