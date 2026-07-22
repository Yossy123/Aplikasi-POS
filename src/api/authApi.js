import api from './axios';

export const login = (email, password) =>
  api.post('/login', { email, password });

export const logout = () =>
  api.post('/logout');

export const getUser = () =>
  api.get('/user');
