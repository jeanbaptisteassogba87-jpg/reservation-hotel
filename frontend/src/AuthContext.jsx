import { useEffect, useState } from 'react';
import api from './api';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api
      .get('/auth/profile')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, motDePasse) => {
    const { data } = await api.post('/auth/login', { email, motDePasse });
    localStorage.setItem('token', data.access_token);
    const profile = await api.get('/auth/profile');
    setUser(profile.data);
    return profile.data;
  };

  const register = async (form) => {
    await api.post('/auth/register', form);
    return login(form.email, form.motDePasse);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
