import axios, { AxiosInstance } from 'axios';

// URL del microservicio de pagos
const fallbackPaymentApiUrl =
  typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? 'https://localhost:7250/api'
    : 'http://localhost:5150/api';

const PAYMENT_API_URL = import.meta.env.VITE_PAYMENT_API_URL || fallbackPaymentApiUrl;

const paymentApi: AxiosInstance = axios.create({
  baseURL: PAYMENT_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT
paymentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default paymentApi;
