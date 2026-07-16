import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, removeToken, setToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tipe, setTipe] = useState(null); // 'alumni' | 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sialumni_token');
    if (token) {
      getMe()
        .then((res) => {
          setUser(res.data.user);
          setTipe(res.data.tipe);
        })
        .catch(() => {
          removeToken();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function login(token, userData, tipeUser) {
    setToken(token);
    localStorage.setItem('sialumni_user', JSON.stringify(userData));
    localStorage.setItem('sialumni_tipe', tipeUser);
    setUser(userData);
    setTipe(tipeUser);
  }

  function logout() {
    removeToken();
    setUser(null);
    setTipe(null);
  }

  function updateUser(updated) {
    setUser(updated);
    localStorage.setItem('sialumni_user', JSON.stringify(updated));
  }

  return (
    <AuthContext.Provider value={{ user, tipe, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
