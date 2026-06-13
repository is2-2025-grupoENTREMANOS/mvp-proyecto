import axios from 'axios';
 
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
  withCredentials: true,
});
 
// ── TOKEN AUTOMÁTICO ─────────────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
 
// ── INTERCEPTOR DE ERRORES ───────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    if (Array.isArray(detail))           error.userMessage = detail.map((d) => d.msg).join(', ');
    else if (typeof detail === 'string') error.userMessage = detail;
    else                                 error.userMessage = 'Error de conexión con el servidor';
    return Promise.reject(error);
  }
);
 
// ── AUTH ─────────────────────────────────────────
// Backend recibe JSON {email, password} — NO form-urlencoded
export const authAPI = {
  login:         (email, password) => API.post('/auth/login', { email, password }),
  getMe:         ()                => API.get('/auth/me'),
  resetPassword: (userId, password) =>
    API.put(`/auth/users/${userId}/reset-password`, { password }),
};
 
// ── SERVICIOS ────────────────────────────────────
// GET /services/    → activos (público)
// GET /services/all → todos incluidos inactivos (admin)
export const servicesAPI = {
  getPublic:  ()         => API.get('/services/'),
  getAll:     ()         => API.get('/services/'),
  getAdmin:   ()         => API.get('/services/all'),
  getById:    (id)       => API.get(`/services/${id}`),
  create:     (data)     => API.post('/services/', data),
  update:     (id, data) => API.put(`/services/${id}`, data),
  deactivate: (id)       => API.put(`/services/${id}`, { activo: false }),
};
 
// ── PROFESIONALES ───────────────────────────────
// GET /professionals/    → activos (público)
// GET /professionals/all → todos incluidos inactivos (admin)
export const professionalsAPI = {
  getPublic:  ()         => API.get('/professionals/'),
  getAll:     ()         => API.get('/professionals/'),
  getAdmin:   ()         => API.get('/professionals/all'),
  getById:    (id)       => API.get(`/professionals/${id}`),
  create:     (data)     => API.post('/professionals/', data),
  update:     (id, data) => API.put(`/professionals/${id}`, data),
  deactivate: (id)       => API.delete(`/professionals/${id}`),
};
 
// ── CLIENTES ────────────────────────────────────
export const clientsAPI = {
  getAll:     ()         => API.get('/clients/'),
  search:     (q)        => API.get('/clients/search', { params: { q } }),
  getById:    (id)       => API.get(`/clients/${id}`),
  create:     (data)     => API.post('/clients/', {
    nombre:   data.nombre,
    telefono: data.telefono || null,
    email:    data.email    || null,
    notas:    data.notas    || null,
  }),
  update:     (id, data) => API.put(`/clients/${id}`, data),
  deactivate: (id)       => API.delete(`/clients/${id}`),
  block:      (id)       => API.patch(`/clients/${id}/block`),
};
 
// ── CITAS ───────────────────────────────────────
export const appointmentsAPI = {
  // Lista con filtro opcional por client_id (público cuando viene client_id)
  getAll:            (params = {})                       => API.get('/appointments/', { params }),
  getById:           (id)                                => API.get(`/appointments/${id}`),
  getByProfessional: (professionalId)                    => API.get(`/appointments/professional/${professionalId}`),
  getByDate:         (fechaInicio, fechaFin)             => API.get('/appointments/by-date', { params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin } }),
  getWaitlist:       ()                                  => API.get('/appointments/waitlist'),
  checkAvailability: (professionalId, fechaInicio, fechaFin) =>
    API.get('/appointments/check-availability', {
      params: { professional_id: professionalId, fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    }),
  create:  (data)     => API.post('/appointments/', data),
  update:  (id, data) => API.put(`/appointments/${id}`, data),
  cancel:  (id)       => API.patch(`/appointments/${id}/cancel`),
};
 
// ── SETTINGS ────────────────────────────────────
export const settingsAPI = {
  getBusiness:    ()     => API.get('/settings/business'),
  updateBusiness: (data) => API.put('/settings/business', data),
};
 
export default API;