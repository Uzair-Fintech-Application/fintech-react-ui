import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal, { useModal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const CURRENCY_ICONS = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', INR: '🇮🇳',
  BTC: '₿',   ETH: 'Ξ',   AUD: '🇦🇺', CAD: '🇨🇦', CHF: '🇨🇭',
};

const CURRENCY_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #a855f7)',
  'linear-gradient(135deg, #a855f7, #ec4899)',
  'linear-gradient(135deg, #06b6d4, #6366f1)',
  'linear-gradient(135deg, #00ffa3, #06b6d4)',
  'linear-gradient(135deg, #fbbf24, #f97316)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
];

export default function WalletsPage() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const createModal = useModal();
  const depositModal = useModal();
  const withdrawModal = useModal();

  const [newCurrency, setNewCurrency] = useState('USD');
  const [txAmount, setTxAmount] = useState('');

  useEffect(() => { loadWallets(); }, []);

  async function loadWallets() {
    setLoading(true);
    try {
      const data = isAdmin ? await api.getAllWallets() : await api.getWallets();
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

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show:   { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 26 } },
  };

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#64748b' }}>{wallets.length} wallet{wallets.length !== 1 ? 's' : ''} active {isAdmin && '(Global)'}</p>
        {!isAdmin && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-glow"
            onClick={() => createModal.open()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Wallet
          </motion.button>
        )}
      </div>

      {/* Admin Search Bar */}
      {isAdmin && (
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search by Wallet ID..."
            className="input-glow text-sm"
            style={{ width: '250px' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Wallets Grid */}
      {wallets.filter(w => search ? w.id.toString().includes(search) : true).length ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {wallets.filter(w => search ? w.id.toString().includes(search) : true).map((w, i) => {
            const gradient = CURRENCY_GRADIENTS[i % CURRENCY_GRADIENTS.length];
            const icon = CURRENCY_ICONS[w.currency] || '💱';

            return (
              <motion.div
                key={w.id}
                variants={cardVariants}
                whileHover={{ y: -4, boxShadow: '0 12px 48px rgba(0,0,0,0.5), 0 0 28px rgba(99,102,241,0.2)' }}
                className="rounded-2xl overflow-hidden relative"
                style={{
                  background: 'rgba(13,20,36,0.8)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  boxShadow: '0 4px 32px rgba(0,0,0,0.35)',
                  transition: 'box-shadow 0.3s ease',
                }}
              >
                {/* Gradient top strip */}
                <div className="h-1 w-full" style={{ background: gradient }} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ background: gradient, boxShadow: `0 0 16px ${gradient.includes('ffa3') ? 'rgba(0,255,163,0.4)' : 'rgba(99,102,241,0.4)'}` }}
                      >
                        {icon}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-100">{w.currency}</p>
                        <p className="text-xs" style={{ color: '#64748b' }}>{api.currName(w.currency)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-mono" style={{ color: '#334155' }}>W#{w.id}</span>
                      {isAdmin && <span className="block text-xs text-indigo-400 font-semibold">User #{w.userId}</span>}
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#475569' }}>Available Balance</p>
                    <p
                      className="font-mono text-2xl font-bold"
                      style={{
                        background: gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {api.fmt(w.availableBalance)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!isAdmin && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          className="btn-mint flex-1 text-xs py-2 rounded-xl"
                          onClick={() => { setTxAmount(''); depositModal.open(w); }}
                        >
                          ↓ Deposit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          className="btn-coral flex-1 text-xs py-2 rounded-xl"
                          onClick={() => { setTxAmount(''); withdrawModal.open(w); }}
                        >
                          ↑ Withdraw
                        </motion.button>
                      </>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      className="btn-ghost-glow text-xs py-2 px-3 rounded-xl flex-1"
                      onClick={() => navigate(`/ledger?wallet=${w.id}`)}
                    >
                      History
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 rounded-2xl"
          style={{
            background: 'rgba(13,20,36,0.5)',
            border: '1px dashed rgba(99,102,241,0.2)',
          }}
        >
          <div className="text-5xl mb-4 opacity-30">◈</div>
          <h3 className="text-lg font-bold text-slate-300 mb-2">No wallets yet</h3>
          <p className="text-sm mb-6" style={{ color: '#475569' }}>Create your first wallet to start managing your finances</p>
          <button className="btn-glow" onClick={() => createModal.open()}>Create Wallet</button>
        </motion.div>
      )}

      {/* Create Wallet Modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Create New Wallet">
        <form onSubmit={handleCreateWallet} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>Currency</label>
            <select
              value={newCurrency}
              onChange={e => setNewCurrency(e.target.value)}
              className="select-glow"
            >
              {api.CURRENCIES.map(c => <option key={c} value={c}>{c} — {api.currName(c)}</option>)}
            </select>
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-glow w-full"
          >
            Create Wallet
          </motion.button>
        </form>
      </Modal>

      {/* Deposit Modal */}
      <Modal isOpen={depositModal.isOpen} onClose={depositModal.close} title={`Deposit ${depositModal.modalData?.currency || ''}`}>
        <form onSubmit={handleDeposit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>Amount</label>
            <input
              type="number" step="0.01" min="0.01" placeholder="0.00"
              value={txAmount} onChange={e => setTxAmount(e.target.value)} required
              className="input-glow"
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-mint w-full text-sm font-bold py-2.5 rounded-xl"
          >
            Confirm Deposit
          </motion.button>
        </form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={withdrawModal.isOpen} onClose={withdrawModal.close} title={`Withdraw ${withdrawModal.modalData?.currency || ''}`}>
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>Amount</label>
            <input
              type="number" step="0.01" min="0.01" placeholder="0.00"
              value={txAmount} onChange={e => setTxAmount(e.target.value)} required
              className="input-glow"
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-coral w-full text-sm font-bold py-2.5 rounded-xl"
          >
            Confirm Withdrawal
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}
