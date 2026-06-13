import API from './api';

export const serviceService = {
  getAll: () => API.get('/services/'),
};