import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });

  /* Particles */
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      size: Math.random() * 70 + 25,
      left: Math.random() * 100,
      duration: Math.random() * 15 + 12,
      delay: Math.random() * 8,
    }))
  );

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
    <div className="auth-screen">
      <div className="auth-particles">
        {particles.map(p => (
          <div key={p.id} className="particle" style={{
            width: p.size, height: p.size, left: `${p.left}%`,
            animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`,
          }} />
        ))}
      </div>

      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo">◆</div>
          <h1>FinTech Ledger</h1>
          <p>Secure Financial Platform</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Sign In</button>
          <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Register</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" name="fullName" value={form.fullName} onChange={onChange} placeholder="John Doe" required />
            </div>
          )}
          <div className="input-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={onChange} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="btn-loader"></span> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="auth-footer-text">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}>
            {isLogin ? 'Register here' : 'Sign in'}
          </a>
        </p>
      </div>
    </div>
  );
}
