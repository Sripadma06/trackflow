import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('trackflow_user');
    return stored ? JSON.parse(stored) : null;
  });

  async function login(username, password) {
    const res = await api.post('/api/auth/login', { username, password });
    const { token, ...userInfo } = res.data;
    localStorage.setItem('trackflow_token', token);
    localStorage.setItem('trackflow_user', JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  }

  function logout() {
    localStorage.removeItem('trackflow_token');
    localStorage.removeItem('trackflow_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
