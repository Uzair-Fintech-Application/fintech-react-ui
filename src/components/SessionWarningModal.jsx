import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../services/api';

const WARN_BEFORE_MS = 5 * 60 * 1000; // 5 minutes
const TICK_INTERVAL_MS = 1000;

export default function SessionWarningModal({ onLogout }) {
  const [showModal, setShowModal] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef(null);
  const didExpireRef = useRef(false);

  const clearTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startTimer = useCallback(() => {
    clearTimer();
    didExpireRef.current = false;

    intervalRef.current = setInterval(() => {
      const expiryMs = api.getTokenExpiryMs();
      if (!expiryMs) return;

      const remaining = expiryMs - Date.now();

      if (remaining <= 0 && !didExpireRef.current) {
        didExpireRef.current = true;
        clearTimer();
        setShowModal(false);
        onLogout();
        return;
      }

      if (remaining <= WARN_BEFORE_MS && remaining > 0) {
        setSecondsLeft(Math.ceil(remaining / 1000));
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    }, TICK_INTERVAL_MS);
  }, [onLogout]);

  // Start timer whenever a new token is stored
  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer]);

  // Re-arm when token changes (e.g. after refresh)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'ft_token') startTimer();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [startTimer]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.refreshToken();
      setShowModal(false);
      // Manually fire a storage event so the interval restarts
      window.dispatchEvent(new StorageEvent('storage', { key: 'ft_token' }));
    } catch {
      onLogout();
    } finally {
      setRefreshing(false);
    }
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeLabel = `${mins}:${secs.toString().padStart(2, '0')}`;
  // Danger threshold at 60s
  const isDanger = secondsLeft <= 60;
  const progressPct = Math.min(100, ((WARN_BEFORE_MS / 1000 - secondsLeft) / (WARN_BEFORE_MS / 1000)) * 100);

  return (
    <AnimatePresence>
      {showModal && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          >
            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="relative rounded-2xl overflow-hidden w-full max-w-md mx-4"
              style={{
                background: 'rgba(10,16,30,0.97)',
                border: `1px solid ${isDanger ? 'rgba(255,71,87,0.5)' : 'rgba(251,191,36,0.4)'}`,
                boxShadow: isDanger
                  ? '0 0 48px rgba(255,71,87,0.25), 0 24px 64px rgba(0,0,0,0.6)'
                  : '0 0 48px rgba(251,191,36,0.15), 0 24px 64px rgba(0,0,0,0.6)',
              }}
            >
              {/* Gradient top strip */}
              <div
                className="h-1 w-full transition-all duration-500"
                style={{
                  background: isDanger
                    ? 'linear-gradient(90deg, #ff4757, #ff6b81)'
                    : 'linear-gradient(90deg, #fbbf24, #f97316)',
                }}
              />

              <div className="p-7 space-y-6">
                {/* Icon + Title */}
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl"
                    style={{
                      background: isDanger ? 'rgba(255,71,87,0.12)' : 'rgba(251,191,36,0.12)',
                      border: `1px solid ${isDanger ? 'rgba(255,71,87,0.3)' : 'rgba(251,191,36,0.3)'}`,
                    }}
                  >
                    {isDanger ? '⚠️' : '🕐'}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-slate-100">Session Expiring Soon</h2>
                    <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
                      You have only 5 minutes left in your session. Would you like to stay logged in?
                    </p>
                  </div>
                </div>

                {/* Countdown display */}
                <div
                  className="rounded-xl p-4 text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: '#64748b' }}>
                    Time Remaining
                  </p>
                  <p
                    className="font-mono text-4xl font-extrabold transition-colors duration-300"
                    style={{ color: isDanger ? '#ff4757' : '#fbbf24', textShadow: isDanger ? '0 0 20px rgba(255,71,87,0.5)' : '0 0 20px rgba(251,191,36,0.4)' }}
                  >
                    {timeLabel}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-3 rounded-full overflow-hidden h-1.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: isDanger ? '#ff4757' : '#fbbf24' }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 text-white"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                      opacity: refreshing ? 0.7 : 1,
                    }}
                  >
                    {refreshing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"/></svg>
                        Refreshing…
                      </span>
                    ) : '✓ Stay Logged In'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={onLogout}
                    className="flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                    style={{
                      color: '#94a3b8',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    Log Out
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
