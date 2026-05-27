import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';

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
      toast.success("User promoted successfully");
      setPromoteId('');
      loadAdmin();
    } catch (e) { toast.error(e.message); }
  }

  async function handleFreeze() {
    if (!freezeId) return;
    try {
      const res = await api.toggleFreezeWallet(freezeId);
      toast.success(res.message || "Wallet status updated");
      setFreezeId('');
    } catch (e) { toast.error(e.message); }
  }

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  return (
    <div className="admin-page">
      <div className="admin-grid">
        <div className="card">
          <div className="card-header"><h3>Platform Metrics</h3></div>
          <div className="card-body">
            <div className="metric-row">
              <span className="metric-label">Total Registered Users</span>
              <span className="metric-value">{metrics.totalRegisteredUsers || '—'}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Liquidity Pool</h3></div>
          <div className="card-body card-body-scroll">
            {Object.keys(liquidity).length ? Object.entries(liquidity).map(([k, v]) => (
              <div key={k} className="metric-row">
                <span className="metric-label">{k} ({api.currName(k)})</span>
                <span className="metric-value">{api.fmt(v)}</span>
              </div>
            )) : <div className="empty-state">No liquidity data</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Revenue (Commission)</h3></div>
          <div className="card-body card-body-scroll">
            {Object.keys(revenue).length ? Object.entries(revenue).map(([k, v]) => (
              <div key={k} className="metric-row">
                <span className="metric-label">{k} ({api.currName(k)})</span>
                <span className="metric-value text-success">{api.fmt(v)}</span>
              </div>
            )) : <div className="empty-state">No revenue data</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Reconciliation</h3></div>
          <div className="card-body">
            <p className="text-muted text-sm" style={{ marginBottom: '1rem' }}>
              Run a full audit of all wallet balances against ledger entries to detect data corruption.
            </p>
            <button className="btn btn-primary" onClick={handleReconcile}>Run Reconciliation</button>
            {reconcileResult && (
              <div className="reconcile-result">{reconcileResult}</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>User Management</h3></div>
          <div className="card-body">
            <p className="text-muted text-sm" style={{ marginBottom: '1rem' }}>Promote a user to ADMIN role by entering their User ID.</p>
            <div className="admin-action-row">
              <input type="number" placeholder="User ID" value={promoteId} onChange={e => setPromoteId(e.target.value)} />
              <button className="btn btn-primary" onClick={handlePromote}>Promote</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Wallet Security</h3></div>
          <div className="card-body">
            <p className="text-muted text-sm" style={{ marginBottom: '1rem' }}>Freeze or Unfreeze a specific wallet by ID. Frozen wallets cannot perform transactions.</p>
            <div className="admin-action-row">
              <input type="number" placeholder="Wallet ID" value={freezeId} onChange={e => setFreezeId(e.target.value)} />
              <button className="btn btn-danger" onClick={handleFreeze}>Toggle Freeze</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
