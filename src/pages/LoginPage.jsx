import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/* Floating orb particle */
function Orb({ size, left, top, color, duration, delay }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        left, top,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(40px)',
        animation: `float-up ${duration}s linear ${delay}s infinite`,
      }}
    />
  );
}

export default function LoginPage() {
  const { login, register } = useAuth();
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });

  const orbs = [
    { size: 400, left: '-10%', top: '-10%',  color: 'rgba(99,102,241,0.25)',  duration: 18, delay: 0 },
    { size: 350, left: '60%',  top: '50%',   color: 'rgba(168,85,247,0.2)',   duration: 22, delay: 3 },
    { size: 300, left: '20%',  top: '70%',   color: 'rgba(236,72,153,0.15)',  duration: 20, delay: 7 },
    { size: 250, left: '75%',  top: '5%',    color: 'rgba(0,255,163,0.12)',   duration: 25, delay: 1 },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back!');
        setTimeout(() => window.location.href = '/', 100);
      } else {
        await register(form.fullName, form.email, form.password);
        toast.success('Account created successfully!');
        setTimeout(() => window.location.href = '/', 100);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-4"
      style={{ background: '#050811' }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {orbs.map((orb, i) => <Orb key={i} {...orb} />)}

        {/* Static mesh gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.08) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Auth Card */}
      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.1 }}
      >
        <div
          className="p-8 rounded-3xl"
          style={{
            background: 'rgba(8,13,26,0.88)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08) inset',
          }}
        >
          {/* Brand */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
                boxShadow: '0 0 32px rgba(99,102,241,0.5), 0 0 80px rgba(168,85,247,0.2)',
              }}
              animate={{ boxShadow: ['0 0 32px rgba(99,102,241,0.5)', '0 0 48px rgba(168,85,247,0.7)', '0 0 32px rgba(99,102,241,0.5)'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </motion.div>
            <h1 className="text-2xl font-extrabold gradient-text mb-1">FinTech Ledger</h1>
            <p className="text-sm" style={{ color: '#475569' }}>Secure Financial Platform</p>
          </div>

          {/* Tabs */}
          <div
            className="flex gap-1 p-1 rounded-xl mb-6"
            style={{ background: 'rgba(15,23,42,0.6)' }}
          >
            {['Sign In', 'Register'].map((label, i) => {
              const active = (i === 0) === isLogin;
              return (
                <button
                  key={label}
                  onClick={() => setIsLogin(i === 0)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-250 relative"
                  style={{
                    color: active ? '#fff' : '#64748b',
                    background: active ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent',
                    boxShadow: active ? '0 2px 12px rgba(99,102,241,0.4)' : 'none',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5"
              >
                <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>
                  Full Name
                </label>
                <input
                  type="text" name="fullName" value={form.fullName}
                  onChange={onChange} placeholder="John Doe" required
                  className="input-glow"
                />
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>Email</label>
              <input
                type="email" name="email" value={form.email}
                onChange={onChange} placeholder="you@example.com" required
                className="input-glow"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>Password</label>
              <input
                type="password" name="password" value={form.password}
                onChange={onChange} placeholder="••••••••" required
                className="input-glow"
              />
            </div>

            <motion.button
              type="submit"
              className="btn-glow w-full mt-2 relative overflow-hidden"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {/* Shimmer sweep */}
              {!loading && (
                <span
                  className="absolute top-0 bottom-0 w-16 skew-x-[-20deg]"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                    animation: 'shimmer-sweep 2.5s ease infinite',
                    left: '-60px',
                  }}
                />
              )}
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : (isLogin ? 'Sign In' : 'Create Account')
              }
            </motion.button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: '#475569' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              className="font-semibold transition-colors"
              style={{ color: '#818cf8' }}
              onClick={() => setIsLogin(!isLogin)}
              onMouseEnter={e => e.currentTarget.style.color = '#a855f7'}
              onMouseLeave={e => e.currentTarget.style.color = '#818cf8'}
            >
              {isLogin ? 'Register here' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
