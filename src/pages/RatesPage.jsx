import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function RatesPage() {
  const [base, setBase] = useState('USD');
  const [rates, setRates] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const toast = useToast();

  useEffect(() => { loadRates(); }, [base]);

  async function loadRates() {
    setLoading(true);
    try {
      const data = await api.getOracleRates(base);
      setRates(data.rates || {});
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) { toast.error('Could not load rates: ' + err.message); }
    finally { setLoading(false); }
  }

  const bases = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'BTC', 'CHF', 'AUD', 'CAD'];

  // Filter rates by search term (code or full name)
  const filteredRates = Object.entries(rates)
    .filter(([k]) => k !== base)
    .filter(([code]) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return code.toLowerCase().includes(q) || (api.currName(code) || '').toLowerCase().includes(q);
    });

  return (
    <div className="rates-page">
      <div className="page-actions">
        <select className="select-input" value={base} onChange={e => setBase(e.target.value)} style={{ maxWidth: 220 }}>
          {bases.map(b => <option key={b} value={b}>{b} ({api.currName(b)})</option>)}
        </select>
        <input
          type="text"
          className="search-input"
          placeholder="Search currency (e.g. EUR, Rupee)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-ghost" onClick={loadRates}>↻ Refresh</button>
        {lastUpdate && <span className="text-muted text-sm">Last updated: {lastUpdate}</span>}
      </div>

      {loading ? <div className="page-loader"><div className="spinner"></div></div> : (
        <div className="rates-grid">
          {filteredRates.length ? filteredRates.map(([code, value]) => (
              <div key={code} className="rate-card">
                <div className="rate-header">
                  <span className="rate-code">{code}</span>
                </div>
                <div className="rate-name">{api.currName(code)}</div>
                <div className="rate-value">
                  {parseFloat(value).toFixed(['JPY','KRW','IDR','VND'].includes(code) ? 2 : 6)}
                </div>
                <div className="rate-base">1 {base} = {parseFloat(value).toFixed(4)} {code}</div>
              </div>
            )) : (
              <div className="empty-state-large" style={{ gridColumn: '1/-1' }}>
                <div className="empty-icon">◎</div>
                <h3>No rates match "{search}"</h3>
                <p>Try a different search term</p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
