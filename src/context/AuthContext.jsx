import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(api.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(api.isLoggedIn());
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    api.logout();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    api.setOnUnauthorized(() => {
      handleLogout();
    });
  }, [handleLogout]);

  const handleLogin = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  const handleRegister = useCallback(async (fullName, email, password) => {
    const data = await api.register(fullName, email, password);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login: handleLogin, register: handleRegister, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
