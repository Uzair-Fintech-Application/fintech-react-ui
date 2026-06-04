import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';

function AdminCard({ title, icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28, delay }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(13,20,36,0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(99,102,241,0.15)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.35)',
      }}
    >
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
        <span className="text-lg">{icon}</span>
        <h3 className="font-bold text-sm text-slate-100">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

function MetricRow({ label, value, valueColor }) {
  return (
    <div
      className="flex items-center justify-between py-2.5 transition-all duration-150"
      style={{ borderBottom: '1px solid rgba(99,102,241,0.05)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'}
      onMouseLeave={e => e.currentTarget.style.background = ''}
    >
      <span className="text-sm" style={{ color: '#94a3b8' }}>{label}</span>
      <span className="font-mono text-sm font-semibold" style={{ color: valueColor || '#818cf8' }}>{value}</span>
    </div>
  );
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState({});
  const [liquidity, setLiquidity] = useState({});
  const [revenue, setRevenue] = useState({});
  const [reconcileResult, setReconcileResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promoteId, setPromoteId] = useState('');
  const [freezeId, setFreezeId] = useState('');
  const toast = useToast();

  useEffect(() => { loadAdmin(); }, []);

  async function loadAdmin() {
    setLoading(true);
    try {
      const [m, l, r] = await Promise.all([
        api.getMetricsUsers().catch(() => ({})),
        api.getLiquidity().catch(() => ({})),
        api.getRevenue().catch(() => ({})),
      ]);
      setMetrics(m); setLiquidity(l); setRevenue(r);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  async function handleReconcile() {
    try {
      const result = await api.reconcile();
      setReconcileResult(typeof result === 'string' ? result : JSON.stringify(result));
      toast.success('Reconciliation triggered');
    } catch (err) { toast.error(err.message); }
  }

  async function handlePromote() {
    if (!promoteId) return;
    try {
      await api.promoteUser(promoteId);
      toast.success('User promoted successfully');
      setPromoteId('');
      loadAdmin();
    } catch (e) { toast.error(e.message); }
  }

  async function handleFreeze() {
    if (!freezeId) return;
    try {
      const res = await api.toggleFreezeWallet(freezeId);
      toast.success(res.message || 'Wallet status updated');
      setFreezeId('');
    } catch (e) { toast.error(e.message); }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Platform Metrics */}
      <AdminCard title="Platform Metrics" icon="📊" delay={0.05}>
        <MetricRow label="Total Registered Users" value={metrics.totalRegisteredUsers || '—'} />
      </AdminCard>

      {/* Liquidity Pool */}
      <AdminCard title="Liquidity Pool" icon="💧" delay={0.12}>
        <div className="max-h-56 overflow-y-auto space-y-0">
          {Object.keys(liquidity).length ? (
            Object.entries(liquidity).map(([k, v]) => (
              <MetricRow key={k} label={`${k} (${api.currName(k)})`} value={api.fmt(v)} valueColor="#818cf8" />
            ))
          ) : (
            <p className="text-sm text-center py-6" style={{ color: '#475569' }}>No liquidity data</p>
          )}
        </div>
      </AdminCard>

      {/* Revenue */}
      <AdminCard title="Revenue (Commission)" icon="💰" delay={0.19}>
        <div className="max-h-56 overflow-y-auto space-y-0">
          {Object.keys(revenue).length ? (
            Object.entries(revenue).map(([k, v]) => (
              <MetricRow key={k} label={`${k} (${api.currName(k)})`} value={api.fmt(v)} valueColor="#00ffa3" />
            ))
          ) : (
            <p className="text-sm text-center py-6" style={{ color: '#475569' }}>No revenue data</p>
          )}
        </div>
      </AdminCard>

      {/* Reconciliation */}
      <AdminCard title="Reconciliation" icon="🔍" delay={0.26}>
        <p className="text-xs mb-4" style={{ color: '#64748b' }}>
          Run a full audit of all wallet balances against ledger entries to detect data corruption.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="btn-glow w-full"
          onClick={handleReconcile}
        >
          Run Reconciliation
        </motion.button>
        {reconcileResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl font-mono text-xs"
            style={{
              background: 'rgba(0,255,163,0.07)',
              border: '1px solid rgba(0,255,163,0.2)',
              color: '#00ffa3',
            }}
          >
            {reconcileResult}
          </motion.div>
        )}
      </AdminCard>

      {/* User Management */}
      <AdminCard title="User Management" icon="👤" delay={0.32}>
        <p className="text-xs mb-4" style={{ color: '#64748b' }}>Promote a user to ADMIN role by entering their User ID.</p>
        <div className="flex gap-2">
          <input
            type="number" placeholder="User ID"
            value={promoteId} onChange={e => setPromoteId(e.target.value)}
            className="input-glow flex-1"
          />
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={handlePromote}
            className="btn-glow px-5 text-sm"
          >
            Promote
          </motion.button>
        </div>
      </AdminCard>

      {/* Wallet Security */}
      <AdminCard title="Wallet Security" icon="🔒" delay={0.38}>
        <p className="text-xs mb-4" style={{ color: '#64748b' }}>
          Freeze or Unfreeze a specific wallet by ID. Frozen wallets cannot perform transactions.
        </p>
        <div className="flex gap-2">
          <input
            type="number" placeholder="Wallet ID"
            value={freezeId} onChange={e => setFreezeId(e.target.value)}
            className="input-glow flex-1"
          />
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={handleFreeze}
            className="btn-coral px-5 text-sm rounded-xl"
          >
            Toggle Freeze
          </motion.button>
        </div>
      </AdminCard>
    </div>
  );
}
