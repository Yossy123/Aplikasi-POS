import api from './axios';

export const createTransaction = (data) =>
  api.post('/transactions', data);

export const getTransactions = (params = {}) =>
  api.get('/transactions', { params });

export const getTransaction = (id) =>
  api.get(`/transactions/${id}`);

export const getTodayRevenue = () =>
  api.get('/transactions/today-revenue');

export const getDailyRevenueHistory = (params = {}) =>
  api.get('/transactions/daily-revenue', { params });

export const getMyTransactions = (params = {}) =>
  api.get('/my-transactions', { params });
