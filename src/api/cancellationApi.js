import api from './axios';

export const createCancellationRequest = (type, details = '') =>
  api.post('/cancellation-requests', { type, details });

export const getCancellationRequestStatus = (id) =>
  api.get(`/cancellation-requests/${id}`);

export const getPendingCancellationRequests = () =>
  api.get('/cancellation-requests');

export const approveCancellationRequest = (id) =>
  api.post(`/cancellation-requests/${id}/approve`);

export const rejectCancellationRequest = (id) =>
  api.post(`/cancellation-requests/${id}/reject`);
