import API from './api';

export const professionalService = {
  getAll: () =>
    API.get('/professionals/'),

  getAppointments: (professionalId) =>
    API.get(`/appointments/professional/${professionalId}`),

  updateAppointment: (id, data) =>
    API.put(`/appointments/${id}`, data),

  cancelAppointment: (id) =>
    API.patch(`/appointments/${id}/cancel`),
};