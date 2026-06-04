import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';

const PAGE_TITLES = {
  '/':        'Dashboard',
  '/wallets': 'Wallets',
  '/trades':  'Marketplace',
  '/ledger':  'Ledger',
  '/rates':   'Live Rates',
  '/admin':   'Admin Panel',
};

/* Pulsing live status dot with two rings */
function StatusDot() {
  return (
    <div className="relative flex items-center justify-center w-5 h-5">
      <span
        className="absolute inline-flex w-full h-full rounded-full opacity-75"
        style={{
          background: 'rgba(0,255,163,0.25)',
          animation: 'pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
        }}
      />
      <span
        className="absolute inline-flex w-3 h-3 rounded-full opacity-50"
        style={{
          background: 'rgba(0,255,163,0.35)',
          animation: 'pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite 0.4s',
        }}
      />
      <span
        className="relative w-2 h-2 rounded-full"
        style={{
          background: '#00ffa3',
          boxShadow: '0 0 8px rgba(0,255,163,0.9)',
        }}
      />
    </div>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'FinTech Ledger';

  return (
    <div className="flex min-h-screen" style={{ background: '#050811' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-h-screen md:ml-sidebar" style={{ minWidth: 0 }}>
        {/* Top bar */}
        <header
          className="sticky top-0 z-50 flex items-center justify-between px-6 h-16"
          style={{
            background: 'rgba(5,8,17,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(99,102,241,0.1)',
          }}
        >
          {/* Mobile menu */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#94a3b8' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Open sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Page title */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={location.pathname}
              className="text-lg font-bold gradient-text"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {title}
            </motion.h2>
          </AnimatePresence>

          {/* Status indicator */}
          <div className="flex items-center gap-2.5">
            <StatusDot />
            <span className="text-xs font-medium" style={{ color: '#00ffa3' }}>Connected</span>
          </div>
        </header>

        {/* Page content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="flex-1 p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
