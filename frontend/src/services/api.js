import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8001',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Interceptor de errores global ───────────────────────────────
API.interceptors.response.use(
  response => response,
  error => {
    const detail = error.response?.data?.detail;
    if (Array.isArray(detail)) {
      error.userMessage = detail.map(d => d.msg).join(', ');
    } else if (typeof detail === 'string') {
      error.userMessage = detail;
    } else {
      error.userMessage = 'Error de conexión con el servidor';
    }
    return Promise.reject(error);
  }
);

// ── AUTH ────────────────────────────────────────────────────────
export const authAPI = {

  login:  (email, password) => API.post('/auth/login', { email, password }),
  getMe:  ()                => API.get('/auth/me'),
 
  resetPassword: (userId, nuevaPassword) =>
    API.put(`/auth/users/${userId}/reset-password`, { nueva_password: nuevaPassword }),

};

// ── SERVICIOS ───────────────────────────────────────────────────
export const servicesAPI = {
  getPublic:  ()           => API.get('/services/'),
  getAdmin:   ()           => API.get('/services/all'),
  getById:    (id)         => API.get(`/services/${id}`),
  create:     (data)       => API.post('/services/', {
    nombre:      data.nombre,
    descripcion: data.descripcion || null,
    duracion:    Number(data.duracion),
    precio:      Number(data.precio),
    imagen_url:  data.imagen_url || null,
  }),
  update:     (id, data)   => API.put(`/services/${id}`, {
    nombre:      data.nombre      || undefined,
    descripcion: data.descripcion || undefined,
    duracion:    data.duracion    ? Number(data.duracion)  : undefined,
    precio:      data.precio      ? Number(data.precio)    : undefined,
    imagen_url:  data.imagen_url  || undefined,
    activo:      data.activo      !== undefined ? data.activo : undefined,
  }),
  deactivate: (id)         => API.put(`/services/${id}`, { activo: false }),
};

// ── PROFESIONALES ───────────────────────────────────────────────
export const professionalsAPI = {
  getPublic:   ()           => API.get('/professionals/'),
  getAdmin:    ()           => API.get('/professionals/all'),
  getById:     (id)         => API.get(`/professionals/${id}`),
  create:      (data)       => API.post('/professionals/', {
    nombre:       data.nombre,
    especialidad: data.especialidad || null,
    telefono:     data.telefono     || null,
    email:        data.email        || null,
    descripcion:  data.descripcion  || null,
    avatar_url:   null,
    user_id:      null,
    service_ids:  [],
  }),
  update:      (id, data)   => API.put(`/professionals/${id}`, {
    nombre:       data.nombre       || undefined,
    especialidad: data.especialidad || undefined,
    telefono:     data.telefono     || undefined,
    email:        data.email        || undefined,
    descripcion:  data.descripcion  || undefined,
    activo:       data.activo       !== undefined ? data.activo : undefined,
    service_ids:  data.service_ids  || undefined,
  }),
  deactivate:  (id)         => API.put(`/professionals/${id}`, { activo: false }),
};

// ── CLIENTES ────────────────────────────────────────────────────
export const clientsAPI = {
  getAll:     ()           => API.get('/clients/'),
  search:     (q)          => API.get(`/clients/search?q=${encodeURIComponent(q)}`),
  getById:    (id)         => API.get(`/clients/${id}`),
  create:     (data)       => API.post('/clients/', {
    nombre:   data.nombre,
    telefono: data.telefono || null,
    email:    data.email    || null,
    notas:    data.notas    || null,
  }),
  update:     (id, data)   => API.put(`/clients/${id}`, data),
  deactivate: (id)         => API.delete(`/clients/${id}`),
  block:      (id)         => API.patch(`/clients/${id}/block`),
};

// ── CITAS ───────────────────────────────────────────────────────
export const appointmentsAPI = {
  getAll: (params = {}) =>
  api.get('/appointments/', { params }),
  byProfessional: (id) =>
  API.get(`/appointments/professional/${id}`),
  getAll:            ()                    => API.get('/appointments/'),
  getByProfessional: (id)                  => API.get(`/appointments/professional/${id}`),
  getByDate:         (start, end)          => API.get('/appointments/by-date', {
    params: { fecha_inicio: start, fecha_fin: end }
  }),
  checkAvailability: (profId, start, end)  => API.get('/appointments/check-availability', {
    params: { professional_id: profId, fecha_inicio: start, fecha_fin: end }
  }),
  getById:           (id)                  => API.get(`/appointments/${id}`),
  create:            (data)                => API.post('/appointments/', data),
  update:            (id, data)            => API.put(`/appointments/${id}`, data),
  cancel:            (id)                  => API.patch(`/appointments/${id}/cancel`),
  complete:          (id)                  => API.put(`/appointments/${id}`, {
    estado: 'completada'
  }),
  getWaitlist:       ()                    => API.get('/appointments/waitlist'),
};

// ── CONFIGURACIÓN DEL NEGOCIO ───────────────────────────────────
export const settingsAPI = {
  getBusiness:    ()     => API.get('/settings/business'),
  updateBusiness: (data) => API.put('/settings/business', data),
};

export default API;