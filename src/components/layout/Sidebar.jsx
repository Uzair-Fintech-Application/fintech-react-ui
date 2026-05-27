import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { to: '/', icon: '◉', label: 'Dashboard' },
    { to: '/wallets', icon: '◈', label: 'Wallets' },
    { to: '/trades', icon: '⇄', label: 'Marketplace' },
    { to: '/ledger', icon: '☰', label: 'Ledger' },
    { to: '/rates', icon: '◎', label: 'Live Rates' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">◆</div>
        <div>
          <h1 className="brand-name">FinTech</h1>
          <span className="brand-sub">Ledger Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `nav-item admin-nav ${isActive ? 'active' : ''}`} onClick={onClose}>
            <span className="nav-icon">⚙</span>
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">{user?.fullName || user?.email}</span>
            <span className="user-role">{user?.role || 'USER'}</span>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={logout} style={{ marginTop: '0.5rem', width: '100%' }}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
