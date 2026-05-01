import axios from 'axios';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('meritinfi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('meritinfi_token');
      localStorage.removeItem('meritinfi_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
