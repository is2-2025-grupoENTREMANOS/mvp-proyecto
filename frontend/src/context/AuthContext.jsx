import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate  = useNavigate();
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, verificar si hay sesión activa
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService.getMe()
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * login — recibe los datos ya obtenidos por LoginPage.
   * NO hace otra llamada a la API.
   * Solo guarda el token y el usuario en el estado.
   */
  const login = (userData, token) => {
  localStorage.setItem('token', token);
  setUser(userData);

  if (userData.rol === 'admin') {
    navigate('/admin');
  } else {
    navigate('/profesional');
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);