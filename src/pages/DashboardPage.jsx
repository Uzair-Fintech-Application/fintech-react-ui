import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

/* Number count-up hook */
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

/* Individual stat card */
function StatCard({ icon, label, value, sub, valueClass, iconBg, iconGlow, delay, isNumeric, prefix = '', suffix = '' }) {
  const numericTarget = isNumeric ? parseFloat(value) || 0 : 0;
  const counted = useCountUp(numericTarget, 1000);

  const displayValue = isNumeric
    ? `${prefix}${counted >= 1000 ? counted.toLocaleString('en-US', { maximumFractionDigits: 2 }) : counted.toFixed(counted % 1 !== 0 ? 2 : 0)}${suffix}`
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28, delay }}
      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      className="p-5 rounded-2xl flex items-start gap-4 cursor-default"
      style={{
        background: 'rgba(13,20,36,0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(99,102,241,0.15)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.35)',
        transition: 'box-shadow 0.3s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.5), 0 0 24px ${iconGlow || 'rgba(99,102,241,0.2)'}`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 32px rgba(0,0,0,0.35)'}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{ background: iconBg || 'rgba(99,102,241,0.12)', boxShadow: iconGlow ? `0 0 16px ${iconGlow}` : undefined }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>{label}</p>
        <p className={`text-2xl font-extrabold font-mono leading-none mb-1 ${valueClass || 'text-slate-100'}`}>{displayValue}</p>
        <p className="text-xs" style={{ color: '#475569' }}>{sub}</p>
      </div>
    </motion.div>
  );
}

/* Container animation variant */
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  show:   { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 350, damping: 28 } },
};

export default function DashboardPage() {
  const [stats, setStats] = useState({ wallets: 0, currencies: 0, health: 'Checking' });
  const [wallets, setWallets] = useState([]);
  const [trades, setTrades] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    setLoading(true);
    let walletOk = false, tradeOk = false, ledgerOk = true, authOk = true;
    try {
      if (isAdmin) {
        const promises = [
          api.getAllWallets().then(r => { walletOk = true; return r; }).catch(() => []),
          api.getGlobalAudit(0, 5).then(r => { ledgerOk = true; return r.content || []; }).catch(() => []),
          api.getMetricsUsers().then(() => { authOk = true; }).catch(() => { authOk = false; })
        ];
        const [w, l] = await Promise.all(promises);
        setWallets(w.slice(0, 10));
        setLedgers(l);
        const currs = new Set(w.map(x => x.currency));
        setStats({
          wallets: w.length,
          currencies: currs.size,
          health: (walletOk && ledgerOk && authOk) ? 'Live' : 'Degraded',
        });
      } else {
        const promises = [
          api.getWallets().then(r => { walletOk = true; return r; }).catch(() => []),
          api.getMyTrades(0, 5).then(r => { tradeOk = true; return r.content || []; }).catch(() => ({ content: [] })),
        ];
        const [w, t] = await Promise.all(promises);
        const userW = (w || []).filter(x => !x.systemWallet);
        const currs = new Set(userW.map(x => x.currency));
        setWallets(userW);
        setTrades((t && t.content) || []);
        setStats({
          wallets: userW.length,
          currencies: currs.size,
          health: (walletOk && tradeOk) ? 'Live' : 'Degraded',
        });
      }
    } catch (err) {
      toast.error(err.message);
      setStats(prev => ({ ...prev, health: 'Offline' }));
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" />
    </div>
  );

  const isLive = stats.health === 'Live';

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isAdmin ? (
          <>
            <StatCard
              delay={0.05} icon="◈" label="Platform Wallets" value={stats.wallets}
              sub={`across ${stats.currencies} currencies`}
              isNumeric iconBg="rgba(99,102,241,0.12)" iconGlow="rgba(99,102,241,0.4)"
            />
            <StatCard
              delay={0.12} icon="⊕" label="Currencies Active" value={stats.currencies}
              sub={`of ${api.CURRENCIES.length} available`}
              isNumeric iconBg="rgba(0,255,163,0.1)" iconGlow="rgba(0,255,163,0.3)"
            />
            <StatCard
              delay={0.26} icon="●" label="Platform Status" value={stats.health}
              sub={isLive ? 'all systems operational' : 'one or more services down'}
              valueClass={isLive ? '' : ''}
              iconBg={isLive ? 'rgba(0,255,163,0.1)' : 'rgba(255,71,87,0.1)'}
              iconGlow={isLive ? 'rgba(0,255,163,0.5)' : 'rgba(255,71,87,0.5)'}
            />
          </>
        ) : (
          <>
            {wallets.map((w, i) => (
               <StatCard
                 key={w.id}
                 delay={0.05 + i * 0.05} icon="$" label={`${w.currency} Balance`}
                 value={w.availableBalance} isNumeric 
                 sub={`Wallet #${w.id}`}
                 iconBg="rgba(168,85,247,0.12)" iconGlow="rgba(168,85,247,0.4)"
               />
            ))}
            <StatCard
              delay={0.26} icon="●" label="System Status" value={stats.health}
              sub={isLive ? 'all systems operational' : 'one or more services down'}
              valueClass={isLive ? '' : ''}
              iconBg={isLive ? 'rgba(0,255,163,0.1)' : 'rgba(255,71,87,0.1)'}
              iconGlow={isLive ? 'rgba(0,255,163,0.5)' : 'rgba(255,71,87,0.5)'}
            />
          </>
        )}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My Wallets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(13,20,36,0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
            <h3 className="font-bold text-sm text-slate-100">{isAdmin ? 'All Platform Wallets' : 'My Wallets'}</h3>
            <button className="btn-ghost-glow text-xs px-3 py-1.5" onClick={() => navigate('/wallets')}>View All →</button>
          </div>
          <div className="p-3">
            {wallets.length ? (
              <motion.ul variants={listVariants} initial="hidden" animate="show" className="space-y-1">
                {wallets.slice(0, 5).map(w => (
                  <motion.li
                    key={w.id}
                    variants={rowVariants}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200"
                    style={{ cursor: 'default' }}
                    whileHover={{ background: 'rgba(99,102,241,0.07)' }}
                  >
                    <span className="text-sm text-slate-300">
                      {w.currency} <span style={{ color: '#475569' }}>({api.currName(w.currency)})</span>
                      {isAdmin && <span className="ml-2 text-xs text-indigo-400">User #{w.userId}</span>}
                    </span>
                    <span className="font-mono text-sm font-semibold" style={{ color: '#818cf8' }}>{api.fmt(w.availableBalance)}</span>
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              <div className="text-center py-8 text-sm" style={{ color: '#475569' }}>
                No wallets yet.{' '}
                {!isAdmin && <button className="text-indigo-400 hover:text-indigo-300" onClick={() => navigate('/wallets')}>Create one</button>}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Trades / Ledger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(13,20,36,0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
            <h3 className="font-bold text-sm text-slate-100">{isAdmin ? 'Global Ledger (Recent)' : 'Recent Trades'}</h3>
            <button className="btn-ghost-glow text-xs px-3 py-1.5" onClick={() => navigate(isAdmin ? '/ledger' : '/trades')}>View All →</button>
          </div>
          <div className="p-3">
            {isAdmin ? (
               ledgers.length ? (
                <motion.ul variants={listVariants} initial="hidden" animate="show" className="space-y-1">
                  {ledgers.map(l => (
                    <motion.li
                      key={l.id}
                      variants={rowVariants}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200"
                      whileHover={{ background: 'rgba(99,102,241,0.07)' }}
                    >
                      <span className="text-sm text-slate-300">
                        {l.transactionType} <span style={{ color: '#475569' }}>({l.currency})</span>
                      </span>
                      <span className={parseFloat(l.amount) > 0 ? "text-emerald-400 font-mono font-semibold text-sm" : "text-rose-400 font-mono font-semibold text-sm"}>
                        {parseFloat(l.amount) > 0 ? '+' : ''}{api.fmt(l.amount)}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <div className="text-center py-8 text-sm" style={{ color: '#475569' }}>No ledger entries</div>
              )
            ) : (
              trades.length ? (
                <motion.ul variants={listVariants} initial="hidden" animate="show" className="space-y-1">
                  {trades.map(t => {
                    const state = t.state?.toLowerCase();
                    const badgeClass = state === 'completed' || state === 'settled' ? 'badge-mint'
                      : state === 'open' ? 'badge-accent' : 'badge-amber';
                    return (
                      <motion.li
                        key={t.id}
                        variants={rowVariants}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200"
                        whileHover={{ background: 'rgba(99,102,241,0.07)' }}
                      >
                        <span className="text-sm text-slate-300">
                          <span style={{ color: '#ff4757' }}>{t.sellCurrency}</span>
                          {' → '}
                          <span style={{ color: '#00ffa3' }}>{t.buyCurrency}</span>
                        </span>
                        <span className={badgeClass}>{t.state}</span>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              ) : (
                <div className="text-center py-8 text-sm" style={{ color: '#475569' }}>No trades yet</div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

