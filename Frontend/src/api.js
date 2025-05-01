import axios from 'axios';
import { getToken } from './utils/auth';

const api = axios.create({
  // baseURL: 'http://localhost:5000/api',
  baseURL: 'https://task-tracker-1-496a.onrender.com/api',
});

api.interceptors.request.use((req) => {
  const token = getToken();
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default api;
