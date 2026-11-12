import { request } from './apiClient';

export const authApi = {
  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  getMe: () =>
    request('/auth/me', {
      method: 'GET',
    }),
};

