import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Modal, { useModal } from '../components/Modal';

const PAGE_SIZE = 10;

export default function TradesPage() {
  const [tab, setTab] = useState('open');
  const [trades, setTrades] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
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
      const data = tab === 'open' ? await api.getOpenTrades(pg, PAGE_SIZE) : await api.getMyTrades(pg, PAGE_SIZE);
      let items = data.content || [];
      
      // Filter out own trades from "Open Market" tab
      if (tab === 'open' && user) {
        items = items.filter(t => t.sellerId !== user.id);
      }
      
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

  function goPage(pg) {
    if (pg < 0 || pg >= totalPages) return;
    loadTrades(pg);
  }

  return (
    <div className="trades-page">
      <div className="page-actions">
        <div className="tabs">
          <button className={`tab ${tab === 'open' ? 'active' : ''}`} onClick={() => setTab('open')}>Open Market</button>
          <button className={`tab ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>My Trades</button>
        </div>
        <button className="btn btn-primary" onClick={() => createModal.open()}>
          <span>＋</span> New Trade
        </button>
      </div>

      {loading ? <div className="page-loader"><div className="spinner"></div></div> : (
        <>
          <div className="trades-grid">
            {trades.length ? trades.map(t => {
              const isMine = user && t.sellerId === user.id;
              return (
                <div key={t.id} className={`trade-card trade-card-${t.state?.toLowerCase()}`}>
                  <div className="trade-pair">
                    <span className="pair-sell">{t.sellCurrency}</span>
                    <span className="pair-arrow">➔</span>
                    <span className="pair-buy">{t.buyCurrency}</span>
                  </div>
                  <div className="trade-details">
                    <div className="trade-detail">
                      <span className="detail-label">Selling</span>
                      <span className="detail-value">
                        {api.fmt(t.sellAmount)}
                        <span className="detail-unit">{t.sellCurrency}</span>
                      </span>
                    </div>
                    <div className="trade-detail">
                      <span className="detail-label">Exchange Rate</span>
                      <span className="detail-value">{t.exchangeRate}</span>
                    </div>
                    <div className="trade-detail">
                      <span className="detail-label">Receiving</span>
                      <span className="detail-value">
                        {api.fmt(t.sellAmount * t.exchangeRate)}
                        <span className="detail-unit">{t.buyCurrency}</span>
                      </span>
                    </div>
                  </div>
                  <div className="trade-footer">
                    <span className={`trade-badge ${t.state?.toLowerCase()}`}>{t.state}</span>
                    {t.state === 'OPEN' && (
                      isMine ? (
                        <div className="trade-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => { setEditForm({ sellAmount: t.sellAmount, exchangeRate: t.exchangeRate }); editModal.open(t); }}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Delete</button>
                        </div>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => handleAccept(t.id)}>Accept Trade</button>
                      )
                    )}
                  </div>
                </div>
              );
            }) : <div className="empty-state-large"><div className="empty-icon">⇄</div><h3>No trades found</h3><p>{tab === 'open' ? 'No open offers on the market' : 'You haven\'t created any trades yet'}</p></div>}
          </div>

          {/* Pagination */}
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
      )}

      {/* Create Trade Modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Create Trade Offer">
        <form onSubmit={handleCreate}>
          <div className="input-row">
            <div className="input-group">
              <label>Sell Currency</label>
              <select value={form.sellCurrency} onChange={e => setForm({ ...form, sellCurrency: e.target.value })}>
                {api.CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Buy Currency</label>
              <select value={form.buyCurrency} onChange={e => setForm({ ...form, buyCurrency: e.target.value })}>
                {api.CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="input-group">
            <label>Sell Amount</label>
            <input type="number" step="0.01" min="0.01" placeholder="100.00" value={form.sellAmount}
              onChange={e => setForm({ ...form, sellAmount: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Exchange Rate</label>
            <input type="number" step="0.00000001" min="0.00000001" placeholder="1.0850" value={form.exchangeRate}
              onChange={e => setForm({ ...form, exchangeRate: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Expiration (hours, optional)</label>
            <input type="number" min="1" placeholder="24" value={form.expirationHours}
              onChange={e => setForm({ ...form, expirationHours: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Create Offer</button>
        </form>
      </Modal>

      {/* Edit Trade Modal */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Update Trade">
        <form onSubmit={handleEdit}>
          <div className="input-group">
            <label>New Sell Amount</label>
            <input type="number" step="0.01" min="0.01" value={editForm.sellAmount}
              onChange={e => setEditForm({ ...editForm, sellAmount: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>New Exchange Rate</label>
            <input type="number" step="0.0001" min="0.0001" value={editForm.exchangeRate}
              onChange={e => setEditForm({ ...editForm, exchangeRate: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Update</button>
        </form>
      </Modal>
    </div>
  );
}
