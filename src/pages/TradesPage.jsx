import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Modal, { useModal } from '../components/Modal';

const PAGE_SIZE = 10;

function StateBadge({ state }) {
  const s = state?.toLowerCase();
  if (s === 'completed' || s === 'settled') return <span className="badge-mint">{state}</span>;
  if (s === 'open') return <span className="badge-accent">{state}</span>;
  return <span className="badge-amber">{state}</span>;
}

function PaginationBar({ page, totalPages, onPage }) {
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button className="btn-ghost-glow text-xs px-3 py-1.5" disabled={page === 0} onClick={() => onPage(0)}>« First</button>
      <button className="btn-ghost-glow text-xs px-3 py-1.5" disabled={page === 0} onClick={() => onPage(page - 1)}>‹ Prev</button>
      <span className="px-4 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
        {page + 1} / {totalPages}
      </span>
      <button className="btn-ghost-glow text-xs px-3 py-1.5" disabled={page >= totalPages - 1} onClick={() => onPage(page + 1)}>Next ›</button>
      <button className="btn-ghost-glow text-xs px-3 py-1.5" disabled={page >= totalPages - 1} onClick={() => onPage(totalPages - 1)}>Last »</button>
    </div>
  );
}

export default function TradesPage() {
  const [tab, setTab] = useState('open');
  const [trades, setTrades] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const toast = useToast();
  const createModal = useModal();
  const editModal = useModal();

  const [form, setForm] = useState({ sellCurrency: 'USD', buyCurrency: 'EUR', sellAmount: '', exchangeRate: '', expirationHours: '' });
  const [editForm, setEditForm] = useState({ sellAmount: '', exchangeRate: '' });

  useEffect(() => { setPage(0); loadTrades(0); }, [tab]);

  async function loadTrades(pg = page) {
    setLoading(true);
    try {
      const data = tab === 'open' ? await api.getOpenTrades(pg, 100) : await api.getMyTrades(pg, 100);
      let items = data.content || [];
      // If we are normal user in open market, hide our own trades from open market view?
      // Actually let's just show all trades in the marketplace as per request
      setTrades(items);
      setTotalPages(data.totalPages || 0);
      setPage(pg);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const exp = form.expirationHours ? parseInt(form.expirationHours) : null;
      await api.createTrade(form.sellCurrency, form.buyCurrency, parseFloat(form.sellAmount), parseFloat(form.exchangeRate), exp);
      toast.success('Trade offer created!');
      createModal.close();
      setForm({ sellCurrency: 'USD', buyCurrency: 'EUR', sellAmount: '', exchangeRate: '', expirationHours: '' });
      loadTrades(0);
    } catch (err) { toast.error(err.message); }
  }

  async function handleEdit(e) {
    e.preventDefault();
    try {
      await api.updateTrade(editModal.modalData.id, parseFloat(editForm.sellAmount), parseFloat(editForm.exchangeRate));
      toast.success('Trade updated!');
      editModal.close();
      loadTrades();
    } catch (err) { toast.error(err.message); }
  }

  async function handleAccept(id) {
    try { await api.acceptTrade(id); toast.success('Trade accepted & settled!'); loadTrades(); }
    catch (err) { toast.error(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this trade offer?')) return;
    try { await api.deleteTrade(id); toast.info('Trade deleted'); loadTrades(); }
    catch (err) { toast.error(err.message); }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    show:   { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 26 } },
  };

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center gap-4 flex-wrap justify-between">
        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          {[['open', 'Marketplace'], ['my', 'My Trades']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTab(val)}
              className="relative px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                color: tab === val ? '#fff' : '#64748b',
                background: tab === val ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent',
                boxShadow: tab === val ? '0 2px 12px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        
        <input 
          type="text" 
          placeholder="Search by Trade ID..."
          className="input-glow text-sm"
          style={{ width: '220px' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className="btn-glow"
          onClick={() => createModal.open()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Trade
        </motion.button>
      </div>

      {/* Trades Grid */}
      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            {trades.filter(t => search ? t.id.toString().includes(search) : true).length ? (
              <motion.div
                key={tab}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
              >
                {trades.map((t) => {
                  const isMine = user && t.sellerId === user.id;
                  const state = t.state?.toLowerCase();
                  const isCompleted = state === 'completed' || state === 'settled';
                  const borderColor = isCompleted ? 'rgba(0,255,163,0.25)' : state === 'open' ? 'rgba(99,102,241,0.2)' : 'rgba(251,191,36,0.2)';

                  return (
                    <motion.div
                      key={t.id}
                      variants={cardVariants}
                      whileHover={{ y: -4 }}
                      className="rounded-2xl overflow-hidden flex flex-col"
                      style={{
                        background: 'rgba(13,20,36,0.8)',
                        backdropFilter: 'blur(16px)',
                        border: `1px solid ${borderColor}`,
                        boxShadow: `0 4px 32px rgba(0,0,0,0.35)`,
                        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 48px rgba(0,0,0,0.5), 0 0 24px ${borderColor}`}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 32px rgba(0,0,0,0.35)'}
                    >
                      {/* Thin top strip */}
                      <div className="h-0.5 w-full" style={{
                        background: isCompleted ? 'linear-gradient(90deg, #00ffa3, #00c8ff)'
                          : state === 'open' ? 'linear-gradient(90deg, #6366f1, #a855f7)'
                          : 'linear-gradient(90deg, #fbbf24, #f97316)',
                      }} />

                      <div className="p-5 flex flex-col gap-4 flex-1">
                        {/* Header info */}
                        <div className="flex justify-between items-center text-xs font-mono" style={{ color: '#64748b' }}>
                          <span className="font-semibold text-slate-300">Trade #{t.id}</span>
                          <span>Seller: User #{t.sellerId} {t.buyerId && `| Buyer: User #${t.buyerId}`}</span>
                        </div>

                        {/* Currency pair */}
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-extrabold" style={{ color: '#ff4757', textShadow: '0 0 12px rgba(255,71,87,0.5)' }}>
                            {t.sellCurrency}
                          </span>
                          <motion.span
                            className="text-slate-500 text-lg"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            ➔
                          </motion.span>
                          <span className="text-2xl font-extrabold" style={{ color: '#00ffa3', textShadow: '0 0 12px rgba(0,255,163,0.5)' }}>
                            {t.buyCurrency}
                          </span>
                        </div>

                        {/* Details */}
                        <div
                          className="rounded-xl p-4 space-y-2.5"
                          style={{ background: 'rgba(5,8,17,0.5)', border: '1px solid rgba(99,102,241,0.08)' }}
                        >
                          {[
                            { label: 'Selling', value: `${api.fmt(t.sellAmount)} ${t.sellCurrency}` },
                            { label: 'Rate', value: t.exchangeRate },
                            { label: 'Receiving', value: `${api.fmt(t.sellAmount * t.exchangeRate)} ${t.buyCurrency}` },
                          ].map(row => (
                            <div key={row.label} className="flex items-center justify-between">
                              <span className="text-[0.7rem] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>{row.label}</span>
                              <span className="font-mono font-semibold text-sm text-slate-200">{row.value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-auto pt-1">
                          <StateBadge state={t.state} />
                          {t.state === 'OPEN' && (
                            isMine ? (
                              <div className="flex gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                                  className="btn-ghost-glow text-xs px-3 py-1.5"
                                  onClick={() => { setEditForm({ sellAmount: t.sellAmount, exchangeRate: t.exchangeRate }); editModal.open(t); }}
                                >
                                  Edit
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                                  className="btn-coral text-xs px-3 py-1.5 rounded-xl"
                                  onClick={() => handleDelete(t.id)}
                                >
                                  Delete
                                </motion.button>
                              </div>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                className="btn-glow text-xs px-4 py-1.5"
                                onClick={() => handleAccept(t.id)}
                              >
                                Accept Trade
                              </motion.button>
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 rounded-2xl"
                style={{ background: 'rgba(13,20,36,0.5)', border: '1px dashed rgba(99,102,241,0.15)' }}
              >
                <div className="text-5xl mb-4 opacity-20">⇄</div>
                <h3 className="text-lg font-bold text-slate-400 mb-2">No trades found</h3>
                <p className="text-sm" style={{ color: '#475569' }}>
                  {tab === 'open' ? 'No open offers on the market' : "You haven't created any trades yet"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Create Trade Modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Create Trade Offer">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>Sell</label>
              <select value={form.sellCurrency} onChange={e => setForm({ ...form, sellCurrency: e.target.value })} className="select-glow">
                {api.CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>Buy</label>
              <select value={form.buyCurrency} onChange={e => setForm({ ...form, buyCurrency: e.target.value })} className="select-glow">
                {api.CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>Sell Amount</label>
            <input type="number" step="0.01" min="0.01" placeholder="100.00" value={form.sellAmount}
              onChange={e => setForm({ ...form, sellAmount: e.target.value })} required className="input-glow" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>Exchange Rate</label>
            <input type="number" step="0.00000001" min="0.00000001" placeholder="1.0850" value={form.exchangeRate}
              onChange={e => setForm({ ...form, exchangeRate: e.target.value })} required className="input-glow" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>Expiration (hours, optional)</label>
            <input type="number" min="1" placeholder="24" value={form.expirationHours}
              onChange={e => setForm({ ...form, expirationHours: e.target.value })} className="input-glow" />
          </div>
          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-glow w-full">
            Create Offer
          </motion.button>
        </form>
      </Modal>

      {/* Edit Trade Modal */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Update Trade">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>New Sell Amount</label>
            <input type="number" step="0.01" min="0.01" value={editForm.sellAmount}
              onChange={e => setEditForm({ ...editForm, sellAmount: e.target.value })} required className="input-glow" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>New Exchange Rate</label>
            <input type="number" step="0.0001" min="0.0001" value={editForm.exchangeRate}
              onChange={e => setEditForm({ ...editForm, exchangeRate: e.target.value })} required className="input-glow" />
          </div>
          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-glow w-full">
            Update Trade
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}
