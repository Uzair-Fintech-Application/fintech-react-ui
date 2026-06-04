import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  {
    to: '/', label: 'Dashboard', end: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    to: '/wallets', label: 'Wallets',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
        <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
      </svg>
    ),
  },
  {
    to: '/trades', label: 'Marketplace',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3L4 7l4 4"/><path d="M4 7h16"/><path d="M16 21l4-4-4-4"/><path d="M20 17H4"/>
      </svg>
    ),
  },
  {
    to: '/ledger', label: 'Ledger',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
    ),
  },
  {
    to: '/rates', label: 'Live Rates',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
];

const ADMIN_ITEM = {
  to: '/admin', label: 'Admin Panel',
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      <path d="M19.07 4.93L12 12l7.07 7.07M4.93 4.93L12 12l-7.07 7.07"/>
    </svg>
  ),
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const initials = (user?.fullName || user?.email || 'U').charAt(0).toUpperCase();

  const navVariants = {
    hidden: {},
    show:   { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -16 },
    show:   { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 350, damping: 28 } },
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[90] md:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 bottom-0 z-[100] sidebar-w flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{
          background: 'linear-gradient(180deg, #080d1a 0%, #050811 100%)',
          borderRight: '1px solid rgba(99,102,241,0.12)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
              boxShadow: '0 0 20px rgba(99,102,241,0.5)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-extrabold gradient-text leading-none">FinTech</h1>
            <span className="text-[0.65rem] uppercase tracking-[2px]" style={{ color: '#475569' }}>Ledger Platform</span>
          </div>
        </div>

        {/* Nav */}
        <motion.nav
          className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto"
          variants={navVariants}
          initial="hidden"
          animate="show"
        >
          {NAV_ITEMS.map((item) => (
            <motion.div key={item.to} variants={itemVariants}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline
                  ${isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active glow background */}
                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(168,85,247,0.1))',
                          borderLeft: '3px solid #6366f1',
                          boxShadow: 'inset 0 0 20px rgba(99,102,241,0.08)',
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Hover background */}
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: 'rgba(99,102,241,0.06)' }}
                    />

                    <span
                      className="relative z-10 flex-shrink-0 transition-colors duration-200"
                      style={{ color: isActive ? '#818cf8' : undefined }}
                    >
                      {item.icon}
                    </span>
                    <span className="relative z-10">{item.label}</span>

                    {isActive && (
                      <span
                        className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ background: '#6366f1', boxShadow: '0 0 6px rgba(99,102,241,0.8)' }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}

          {/* Admin separator */}
          {isAdmin && (
            <motion.div variants={itemVariants} className="mt-auto">
              <div className="my-3" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }} />
              <NavLink
                to={ADMIN_ITEM.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline
                  ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-100'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(168,85,247,0.1))',
                          borderLeft: '3px solid #6366f1',
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(99,102,241,0.06)' }} />
                    <span className="relative z-10" style={{ color: isActive ? '#818cf8' : undefined }}>{ADMIN_ITEM.icon}</span>
                    <span className="relative z-10">{ADMIN_ITEM.label}</span>
                  </>
                )}
              </NavLink>
            </motion.div>
          )}
        </motion.nav>

        {/* Footer / User */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)' }}>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                boxShadow: '0 0 12px rgba(99,102,241,0.4)',
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">{user?.fullName || user?.email}</p>
              <p className="text-[0.65rem] uppercase tracking-widest" style={{ color: '#475569' }}>{user?.role || 'USER'}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={logout}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: 'transparent',
              color: '#64748b',
              border: '1px solid rgba(99,102,241,0.12)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,71,87,0.08)';
              e.currentTarget.style.color = '#ff4757';
              e.currentTarget.style.borderColor = 'rgba(255,71,87,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.12)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </motion.button>
        </div>
      </aside>
    </>
  );
}
