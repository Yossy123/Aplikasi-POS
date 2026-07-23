import api from './axios';

export const login = (email, password) =>
  api.post('/login', { email, password });

export const logout = () =>
  api.post('/logout');

export const getUser = () =>
  api.get('/user');

export const getSupervisorCode = () =>
  api.get('/supervisor-code');

export const regenerateSupervisorCode = (warungName = null) =>
  api.post('/supervisor-code/regenerate', { warung_name: warungName });

export const verifySupervisorCode = (code, warungName = null) =>
  api.post('/verify-supervisor-code', { code, warung_name: warungName });
