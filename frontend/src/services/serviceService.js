import API from './authService';

export const serviceService = {
  getAll: () => API.get('/services/'),
};
