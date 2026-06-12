import axios from 'axios';

// URL base de la API
const API = axios.create({
  baseURL: 'http://localhost:8001',
});

// Interceptor — agrega token automáticamente a cada request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Servicios de autenticación
export const authService = {
  login: async (email, password) => {
  const formData = new URLSearchParams();

  formData.append('username', email);
  formData.append('password', password);

  return API.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
},

  getMe: () =>
    API.get('/auth/me'),
};

export default API;