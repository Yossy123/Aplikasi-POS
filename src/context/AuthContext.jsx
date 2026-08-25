import { createContext, useContext, useState, useEffect } from 'react';
import { getUser } from '../api/authApi';
import { getToken, setToken, clearAuth } from '../utils/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getUser()
        .then((res) => {
          setUser(res.data.data);
          setLoading(false);
        })
        .catch(() => {
          clearAuth();
          setTokenState(null);
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const loginAction = (userData, authToken) => {
    setToken(authToken);
    setTokenState(authToken);
    setUser(userData);
  };

  const logoutAction = () => {
    clearAuth();
    setTokenState(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isKasir = user?.role === 'kasir';

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAdmin, isKasir, login: loginAction, logout: logoutAction }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
