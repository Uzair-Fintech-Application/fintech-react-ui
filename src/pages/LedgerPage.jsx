import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 10;

function TypeBadge({ type }) {
  const isCredit = type === 'CREDIT';
  return (
    <span className={isCredit ? 'badge-mint' : 'badge-coral'}>
      {isCredit ? '↑' : '↓'} {type}
    </span>
  );
}

function PaginationBar({ page, totalPages, onPage }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-2 pt-4"
    >
      <button
        className="btn-ghost-glow text-xs px-3 py-1.5"
        disabled={page === 0}
        onClick={() => onPage(0)}
      >« First</button>
      <button
        className="btn-ghost-glow text-xs px-3 py-1.5"
        disabled={page === 0}
        onClick={() => onPage(page - 1)}
      >‹ Prev</button>
      <span
        className="px-4 py-1.5 rounded-xl text-xs font-semibold"
        style={{
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.2)',
          color: '#818cf8',
        }}
      >
        {page + 1} / {totalPages}
      </span>
      <button
        className="btn-ghost-glow text-xs px-3 py-1.5"
        disabled={page >= totalPages - 1}
        onClick={() => onPage(page + 1)}
      >Next ›</button>
      <button
        className="btn-ghost-glow text-xs px-3 py-1.5"
        disabled={page >= totalPages - 1}
        onClick={() => onPage(totalPages - 1)}
      >Last »</button>
    </motion.div>
  );
}

export default function LedgerPage() {
  const [searchParams] = useSearchParams();
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState('all');
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => { loadWallets(); }, []);

  async function loadWallets() {
    try {
      const data = isAdmin ? await api.getAllWallets() : await api.getWallets();
      const userW = (data || []).filter(w => !w.systemWallet);
      setWallets(userW);
      const preselect = searchParams.get('wallet');
      if (isAdmin && !preselect) {
        setSelectedWallet('all');
        loadAllEntries(null, 0);
      } else if (preselect) { 
        setSelectedWallet(preselect); 
        loadEntries(preselect, 0); 
      }
      else { loadAllEntries(userW, 0); }
    } catch (err) { toast.error(err.message); }
  }

  async function loadAllEntries(wList, pg) {
    setLoading(true);
    try {
      if (isAdmin) {
        const data = await api.getGlobalAudit(pg, PAGE_SIZE);
        setEntries(data.content || []);
        setTotalPages(data.totalPages || 0);
        setPage(pg);
        return;
      }
      const list = wList || wallets;
      const results = await Promise.all(list.map(w => api.getLedger(w.id, 0, 200).catch(() => ({ content: [] }))));
      let all = [];
      results.forEach(r => { if (r && r.content) all = all.concat(r.content); });
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const start = pg * PAGE_SIZE;
      setEntries(all.slice(start, start + PAGE_SIZE));
      setTotalPages(Math.ceil(all.length / PAGE_SIZE));
      setPage(pg);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  async function loadEntries(walletId, pg) {
    if (!walletId || walletId === 'all') { loadAllEntries(null, pg); return; }
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

  useEffect(() => {
    if (wallets.length > 0 && selectedWallet === 'all' && entries.length === 0 && !searchParams.get('wallet')) {
      loadAllEntries(wallets, 0);
    }
  }, [wallets]);

  const rowVariants = {
    hidden: { opacity: 0, x: -8 },
    show:   { opacity: 1, x: 0 },
  };

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          className="select-glow"
          style={{ maxWidth: 300 }}
          value={selectedWallet}
          onChange={handleWalletChange}
        >
          <option value="all">{isAdmin ? 'Global Audit (All Wallets)' : 'All Wallets'}</option>
          {wallets.map(w => (
            <option key={w.id} value={w.id}>
              {w.currency} ({api.currName(w.currency)}) — Wallet #{w.id}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : entries.length ? (
        <>
          {/* Table */}
          <div
            className="overflow-x-auto rounded-2xl"
            style={{
              background: 'rgba(13,20,36,0.7)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(99,102,241,0.15)',
            }}
          >
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                  {['ID', isAdmin ? 'Wallet ID' : null, 'Type', 'Amount', 'Balance After', 'Description', 'Reference', 'Date'].filter(Boolean).map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[0.7rem] font-bold uppercase tracking-widest"
                      style={{ color: '#475569', background: 'rgba(5,8,17,0.4)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
                initial="hidden"
                animate="show"
              >
                {entries.map((e, i) => {
                  const isCredit = e.entryType === 'CREDIT';
                  return (
                    <motion.tr
                      key={e.id}
                      variants={rowVariants}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="group transition-all duration-150"
                      style={{
                        borderBottom: '1px solid rgba(99,102,241,0.05)',
                        borderLeft: isCredit
                          ? '3px solid rgba(0,255,163,0.5)'
                          : '3px solid rgba(255,71,87,0.5)',
                      }}
                      onMouseEnter={ev => {
                        ev.currentTarget.style.background = isCredit
                          ? 'rgba(0,255,163,0.04)'
                          : 'rgba(255,71,87,0.04)';
                      }}
                      onMouseLeave={ev => { ev.currentTarget.style.background = ''; }}
                    >
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: '#475569' }}>{e.id}</td>
                      {isAdmin && <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: '#818cf8' }}>#{e.walletId}</td>}
                      <td className="px-4 py-3"><TypeBadge type={e.entryType} /></td>
                      <td className={`px-4 py-3 font-mono font-semibold text-sm`}
                        style={{ color: isCredit ? '#00ffa3' : '#ff4757', textShadow: isCredit ? '0 0 8px rgba(0,255,163,0.5)' : '0 0 8px rgba(255,71,87,0.5)' }}>
                        {isCredit ? '+' : '−'}{api.fmt(e.amount)}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm" style={{ color: '#94a3b8' }}>{api.fmt(e.balanceAfter)}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#64748b' }}>{e.description || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: '#334155' }}>
                        {(e.referenceId || '').substring(0, 12)}…
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#475569' }}>{api.fmtDate(e.createdAt)}</td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <PaginationBar page={page} totalPages={totalPages} onPage={pg => loadEntries(selectedWallet, pg)} />
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 rounded-2xl"
          style={{ background: 'rgba(13,20,36,0.5)', border: '1px dashed rgba(99,102,241,0.15)' }}
        >
          <div className="text-5xl mb-4 opacity-20">☰</div>
          <h3 className="text-lg font-bold text-slate-400 mb-2">No entries found</h3>
          <p className="text-sm" style={{ color: '#475569' }}>No transaction history to display</p>
        </motion.div>
      )}
    </div>
  );
}
