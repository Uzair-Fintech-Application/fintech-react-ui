import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE = 10;

export default function LedgerPage() {
  const [searchParams] = useSearchParams();
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState('all');
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadWallets();
  }, []);

  async function loadWallets() {
    try {
      const data = await api.getWallets();
      const userW = (data || []).filter(w => !w.systemWallet);
      setWallets(userW);

      const preselect = searchParams.get('wallet');
      if (preselect) {
        setSelectedWallet(preselect);
        loadEntries(preselect, 0);
      } else {
        // Default: load ALL entries across all wallets
        loadAllEntries(0);
      }
    } catch (err) { toast.error(err.message); }
  }

  async function loadAllEntries(pg) {
    setLoading(true);
    try {
      // Load entries from each wallet and merge
      const results = await Promise.all(
        wallets.length > 0
          ? wallets.map(w => api.getLedger(w.id, 0, 200).catch(() => ({ content: [] })))
          : []
      );
      
      let all = [];
      results.forEach(r => { if (r && r.content) all = all.concat(r.content); });
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      const start = pg * PAGE_SIZE;
      const paged = all.slice(start, start + PAGE_SIZE);
      setEntries(paged);
      setTotalPages(Math.ceil(all.length / PAGE_SIZE));
      setPage(pg);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  async function loadEntries(walletId, pg) {
    if (!walletId || walletId === 'all') { loadAllEntries(pg); return; }
    setLoading(true);
    try {
      const data = await api.getLedger(walletId, pg, PAGE_SIZE);
      setEntries(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(pg);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  function handleWalletChange(e) {
    const id = e.target.value;
    setSelectedWallet(id);
    setPage(0);
    loadEntries(id, 0);
  }

  function goPage(pg) {
    if (pg < 0 || pg >= totalPages) return;
    loadEntries(selectedWallet, pg);
  }

  // We need wallets to be loaded before we can load "all" entries
  useEffect(() => {
    if (wallets.length > 0 && selectedWallet === 'all' && entries.length === 0 && !searchParams.get('wallet')) {
      loadAllEntries(0);
    }
  }, [wallets]);

  return (
    <div className="ledger-page">
      <div className="page-actions">
        <select className="select-input" value={selectedWallet} onChange={handleWalletChange}>
          <option value="all">All Wallets</option>
          {wallets.map(w => (
            <option key={w.id} value={w.id}>{w.currency} ({api.currName(w.currency)}) — Wallet #{w.id}</option>
          ))}
        </select>
      </div>

      {loading ? <div className="page-loader"><div className="spinner"></div></div> : (
        entries.length ? (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Description</th>
                    <th>Reference</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(e => (
                    <tr key={e.id}>
                      <td>{e.id}</td>
                      <td><span className={`type-badge ${e.entryType?.toLowerCase()}`}>{e.entryType}</span></td>
                      <td className={`mono ${e.entryType === 'CREDIT' ? 'text-success' : 'text-danger'}`}>
                        {e.entryType === 'CREDIT' ? '+' : '-'}{api.fmt(e.amount)}
                      </td>
                      <td className="mono">{api.fmt(e.balanceAfter)}</td>
                      <td>{e.description || '—'}</td>
                      <td className="text-muted text-sm">{(e.referenceId || '').substring(0, 12)}…</td>
                      <td className="text-sm">{api.fmtDate(e.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => goPage(0)}>« First</button>
                <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => goPage(page - 1)}>‹ Prev</button>
                <span className="pagination-info">Page {page + 1} of {totalPages}</span>
                <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => goPage(page + 1)}>Next ›</button>
                <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => goPage(totalPages - 1)}>Last »</button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state-large">
            <div className="empty-icon">☰</div>
            <h3>No entries found</h3>
            <p>No transaction history to display</p>
          </div>
        )
      )}
    </div>
  );
}
