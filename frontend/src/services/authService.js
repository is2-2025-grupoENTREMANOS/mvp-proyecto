// authService.js — archivo limpio
// Este archivo solo re-exporta lo necesario desde api.js
// para compatibilidad con imports existentes

import API, { authAPI } from './api';

export const authService = {
  login:  (email, password) => authAPI.login(email, password),
  getMe:  () => authAPI.getMe(),
};

export default API;