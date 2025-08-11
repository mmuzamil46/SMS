import { createContext, useState, useEffect } from 'react';
import { isTokenExpired } from '../utils/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userFromStorage = localStorage.getItem('user');
    return userFromStorage ? JSON.parse(userFromStorage) : null;
  });

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (token && isTokenExpired(token)) {
        logout();
      }
    };

    // Check token every 60 seconds
    const interval = setInterval(checkToken, 60000);

    // Check token when the browser tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkToken();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial check on mount
    checkToken();

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
