import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function RatesPage() {
  const [base, setBase] = useState('USD');
  const [rates, setRates] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const toast = useToast();

  const bases = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'BTC', 'CHF', 'AUD', 'CAD'];

  useEffect(() => { loadRates(); }, [base]);

  async function loadRates() {
    setLoading(true);
    try {
      const data = await api.getOracleRates(base);
      setRates(data.rates || {});
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      toast.error('Could not load rates: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredRates = Object.entries(rates)
    .filter(([k]) => k !== base)
    .filter(([code]) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return code.toLowerCase().includes(q) || (api.currName(code) || '').toLowerCase().includes(q);
    });

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.94 },
    show:   { opacity: 1, y: 0,  scale: 1,    transition: { type: 'spring', stiffness: 300, damping: 26 } },
  };

  // Simple color assignment per currency code char sum
  const getAccentColor = (code) => {
    const sum = code.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const colors = [
      '#6366f1', '#a855f7', '#ec4899', '#00ffa3', '#00c8ff',
      '#fbbf24', '#f97316', '#06b6d4', '#10b981', '#f43f5e',
    ];
    return colors[sum % colors.length];
  };

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="select-glow"
          style={{ maxWidth: 220 }}
          value={base}
          onChange={e => setBase(e.target.value)}
        >
          {bases.map(b => <option key={b} value={b}>{b} — {api.currName(b)}</option>)}
        </select>

        <div className="relative flex-1" style={{ minWidth: 200 }}>
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#475569" strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="input-glow pl-9"
            placeholder="Search currency (e.g. EUR, Rupee)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.04, rotate: 180 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.3 }}
          onClick={loadRates}
          className="btn-ghost-glow px-4 py-2.5 text-sm"
        >
          ↻ Refresh
        </motion.button>

        {lastUpdate && (
          <span className="text-xs" style={{ color: '#475569' }}>
            Updated: <span style={{ color: '#64748b' }}>{lastUpdate}</span>
          </span>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : filteredRates.length ? (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          initial="hidden"
          animate="show"
        >
          {filteredRates.map(([code, value]) => {
            const color = getAccentColor(code);
            const isSmallNum = parseFloat(value) < 0.01;
            const precision = ['JPY', 'KRW', 'IDR', 'VND'].includes(code) ? 2 : 6;

            return (
              <motion.div
                key={code}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${color}30`,
                  transition: { duration: 0.2 },
                }}
                className="p-4 rounded-2xl text-center cursor-default"
                style={{
                  background: 'rgba(13,20,36,0.7)',
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${color}25`,
                  boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
                  transition: 'box-shadow 0.3s ease',
                }}
              >
                {/* Color dot */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold"
                  style={{
                    background: `${color}18`,
                    border: `1px solid ${color}40`,
                    color,
                    textShadow: `0 0 8px ${color}`,
                  }}
                >
                  {code.substring(0, 2)}
                </div>

                <p className="font-bold text-sm mb-0.5" style={{ color }}>
                  {code}
                </p>
                <p className="text-[0.65rem] mb-2" style={{ color: '#475569' }}>
                  {api.currName(code)}
                </p>
                <p
                  className="font-mono font-bold text-base leading-none mb-1"
                  style={{ color: '#f1f5f9' }}
                >
                  {parseFloat(value).toFixed(precision)}
                </p>
                <p className="text-[0.62rem]" style={{ color: '#334155' }}>
                  1 {base} = {parseFloat(value).toFixed(4)} {code}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 rounded-2xl"
          style={{ background: 'rgba(13,20,36,0.5)', border: '1px dashed rgba(99,102,241,0.15)' }}
        >
          <div className="text-5xl mb-4 opacity-20">◎</div>
          <h3 className="text-lg font-bold text-slate-400 mb-2">No rates match "{search}"</h3>
          <p className="text-sm" style={{ color: '#475569' }}>Try a different search term</p>
        </motion.div>
      )}
    </div>
  );
}
