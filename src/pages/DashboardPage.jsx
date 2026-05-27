import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const [stats, setStats] = useState({ wallets: 0, balance: 0, currencies: 0, health: 'Checking' });
  const [wallets, setWallets] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    let walletOk = false, tradeOk = false, ledgerOk = true, authOk = true;

    try {
      // Ping services to check health. Only ping admin endpoints if user is actually an admin.
      const promises = [
        api.getWallets().then(r => { walletOk = true; return r; }).catch(() => []),
        api.getMyTrades(0, 5).then(r => { tradeOk = true; return r; }).catch(() => ({ content: [] }))
      ];

      if (isAdmin) {
        promises.push(api.getAuditLedger(0, 1).then(() => { ledgerOk = true; }).catch(() => { ledgerOk = false; }));
        promises.push(api.getMetricsUsers().then(() => { authOk = true; }).catch(() => { authOk = false; }));
      }

      const [w, t] = await Promise.all(promises);

      const userW = (w || []).filter(x => !x.systemWallet);
      const total = userW.reduce((s, x) => s + parseFloat(x.availableBalance || 0), 0);
      const currs = new Set(userW.map(x => x.currency));
      
      setWallets(userW.slice(0, 5));
      setTrades((t && t.content) || []);
      
      const allUp = walletOk && tradeOk && ledgerOk && authOk;
      
      setStats({ 
        wallets: userW.length, 
        balance: total, 
        currencies: currs.size,
        health: allUp ? 'Live' : 'Degraded'
      });
    } catch (err) {
      toast.error(err.message);
      setStats(prev => ({ ...prev, health: 'Offline' }));
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  const healthClass = stats.health === 'Live' ? 'stat-live' : 'stat-offline';
  const healthSub = stats.health === 'Live' 
    ? 'all systems operational' 
    : 'one or more services down';

  return (
    <div className="dashboard-page">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">◈</div>
          <div className="stat-body">
            <span className="stat-label">Total Wallets</span>
            <span className="stat-value">{stats.wallets}</span>
            <span className="stat-sub">across {stats.currencies} currencies</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">$</div>
          <div className="stat-body">
            <span className="stat-label">Combined Balance</span>
            <span className="stat-value">{api.fmt(stats.balance)}</span>
            <span className="stat-sub">all currencies combined</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⊕</div>
          <div className="stat-body">
            <span className="stat-label">Currencies Active</span>
            <span className="stat-value">{stats.currencies}</span>
            <span className="stat-sub">of {api.CURRENCIES.length} available</span>
          </div>
        </div>
        <div className="stat-card">
          <div className={`stat-icon ${healthClass}`}>●</div>
          <div className="stat-body">
            <span className="stat-label">Platform Status</span>
            <span className={`stat-value ${healthClass}`}>{stats.health}</span>
            <span className="stat-sub">{healthSub}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>My Wallets</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/wallets')}>View All</button>
          </div>
          <div className="card-body">
            {wallets.length ? wallets.map(w => (
              <div key={w.id} className="metric-row">
                <span className="metric-label">{w.currency} ({api.currName(w.currency)})</span>
                <span className="metric-value">{api.fmt(w.availableBalance)}</span>
              </div>
            )) : <div className="empty-state">No wallets yet. <a href="#" onClick={(e) => { e.preventDefault(); navigate('/wallets'); }}>Create one</a></div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Trades</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/trades')}>View All</button>
          </div>
          <div className="card-body">
            {trades.length ? trades.map(t => (
              <div key={t.id} className="metric-row">
                <span className="metric-label">{t.sellCurrency} → {t.buyCurrency}</span>
                <span className={`trade-badge ${t.state?.toLowerCase()}`}>{t.state}</span>
              </div>
            )) : <div className="empty-state">No trades yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
