import api from './api';

export const authService = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  logout: (token: string) => api.post('/auth/logout', { token }),
  refreshToken: (token: string) => api.post('/auth/refresh-token', { token }),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => 
    api.post('/auth/reset-password', { token, password }),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};
