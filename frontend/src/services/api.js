import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('em_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally (session expired)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('em_token')
      localStorage.removeItem('em_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth endpoints ──
export const authService = {
  login:   (credentials) => api.post('/auth/login', credentials),
  me:      ()            => api.get('/auth/me'),
  logout:  ()            => api.post('/auth/logout'),
}

// ── Appointments ──
export const appointmentService = {
  getAll:    (params) => api.get('/appointments', { params }),
  getById:   (id)     => api.get(`/appointments/${id}`),
  create:    (data)   => api.post('/appointments', data),
  update:    (id, d)  => api.put(`/appointments/${id}`, d),
  cancel:    (id)     => api.patch(`/appointments/${id}/cancel`),
}

// ── Professionals ──
export const professionalService = {
  getAll:          ()         => api.get('/professionals'),
  getAvailability: (id, date) => api.get(`/professionals/${id}/availability`, { params: { date } }),
}

// ── Services ──
export const serviceService = {
  getAll: () => api.get('/services'),
}

// ── Admin ──
export const adminService = {
  getStats:       ()     => api.get('/admin/stats'),
  getEmployees:   ()     => api.get('/admin/employees'),
  createEmployee: (data) => api.post('/admin/employees', data),
}

export default api
