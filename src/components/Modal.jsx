import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ background: 'rgba(3,5,9,0.75)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="w-full max-w-md overflow-hidden"
            style={{
              background: 'rgba(8,13,26,0.92)',
              backdropFilter: 'blur(32px)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '20px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1) inset, 0 0 60px rgba(99,102,241,0.06)',
            }}
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
              <h3 className="font-bold text-base gradient-text">{title}</h3>
              <motion.button
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                ✕
              </motion.button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Input Group used inside Modals ── */
export function InputGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Hook for easy modal state management ── */
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const open = (data = null) => { setModalData(data); setIsOpen(true); };
  const close = () => { setIsOpen(false); setModalData(null); };

  return { isOpen, modalData, open, close };
}
