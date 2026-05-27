import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal, { useModal } from '../components/Modal';

export default function WalletsPage() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const createModal = useModal();
  const depositModal = useModal();
  const withdrawModal = useModal();

  const [newCurrency, setNewCurrency] = useState('USD');
  const [txAmount, setTxAmount] = useState('');

  useEffect(() => { loadWallets(); }, []);

  async function loadWallets() {
    setLoading(true);
    try {
      const data = await api.getWallets();
      setWallets((data || []).filter(w => !w.systemWallet));
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  async function handleCreateWallet(e) {
    e.preventDefault();
    try {
      await api.createWallet(newCurrency);
      toast.success(`${newCurrency} wallet created!`);
      createModal.close();
      loadWallets();
    } catch (err) { toast.error(err.message); }
  }

  async function handleDeposit(e) {
    e.preventDefault();
    try {
      await api.deposit(depositModal.modalData.id, parseFloat(txAmount));
      toast.success('Deposit successful!');
      depositModal.close(); setTxAmount('');
      loadWallets();
    } catch (err) { toast.error(err.message); }
  }

  async function handleWithdraw(e) {
    e.preventDefault();
    try {
      await api.withdraw(withdrawModal.modalData.id, parseFloat(txAmount));
      toast.success('Withdrawal successful!');
      withdrawModal.close(); setTxAmount('');
      loadWallets();
    } catch (err) { toast.error(err.message); }
  }

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  return (
    <div className="wallets-page">
      <div className="page-actions">
        <button className="btn btn-primary" onClick={() => createModal.open()}>
          <span>＋</span> New Wallet
        </button>
      </div>

      <div className="wallets-grid">
        {wallets.length ? wallets.map(w => (
          <div key={w.id} className="wallet-card">
            <div className="wallet-header">
              <span className="wallet-currency-badge">{w.currency} ({api.currName(w.currency)})</span>
              <span className="wallet-id">#{w.id}</span>
            </div>
            <div className="wallet-balance">{api.fmt(w.availableBalance)}</div>
            <div className="wallet-actions">
              <button className="btn btn-success btn-sm" onClick={() => { setTxAmount(''); depositModal.open(w); }}>Deposit</button>
              <button className="btn btn-danger btn-sm" onClick={() => { setTxAmount(''); withdrawModal.open(w); }}>Withdraw</button>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/ledger?wallet=${w.id}`)}>History</button>
            </div>
          </div>
        )) : (
          <div className="empty-state-large">
            <div className="empty-icon">◈</div>
            <h3>No wallets yet</h3>
            <p>Create your first wallet to start managing your finances</p>
            <button className="btn btn-primary" onClick={() => createModal.open()}>Create Wallet</button>
          </div>
        )}
      </div>

      {/* Create Wallet Modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Create Wallet">
        <form onSubmit={handleCreateWallet}>
          <div className="input-group">
            <label>Currency</label>
            <select value={newCurrency} onChange={e => setNewCurrency(e.target.value)}>
              {api.CURRENCIES.map(c => <option key={c} value={c}>{c} ({api.currName(c)})</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-full">Create Wallet</button>
        </form>
      </Modal>

      {/* Deposit Modal */}
      <Modal isOpen={depositModal.isOpen} onClose={depositModal.close}
        title={`Deposit ${depositModal.modalData?.currency || ''}`}>
        <form onSubmit={handleDeposit}>
          <div className="input-group">
            <label>Amount</label>
            <input type="number" step="0.01" min="0.01" placeholder="0.00" value={txAmount}
              onChange={e => setTxAmount(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-success btn-full">Deposit</button>
        </form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={withdrawModal.isOpen} onClose={withdrawModal.close}
        title={`Withdraw ${withdrawModal.modalData?.currency || ''}`}>
        <form onSubmit={handleWithdraw}>
          <div className="input-group">
            <label>Amount</label>
            <input type="number" step="0.01" min="0.01" placeholder="0.00" value={txAmount}
              onChange={e => setTxAmount(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-danger btn-full">Withdraw</button>
        </form>
      </Modal>
    </div>
  );
}
