import axios, { AxiosInstance } from 'axios';
import { addUserActionBreadcrumb, trackUserAction } from './monitoring';

type PaymentTrackingContext = {
  actionName: string;
  method: string;
  url: string;
  path: string;
};

type PaymentTrackingConfig = {
  __actionTracking?: PaymentTrackingContext;
};

const mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const sanitizeUrlForTracking = (url?: string): string => {
  if (!url) return '';
  const [pathOnly] = url.split('?');

  return pathOnly
    .replace(/\/\d+(?=\/|$)/g, '/:id')
    .replace(/\/[0-9a-fA-F-]{8,}(?=\/|$)/g, '/:id');
};

const inferActionName = (method: string, url: string): string => {
  const resource = url.replace(/^\//, '').split('/')[0] || 'payment';

  if (method === 'POST') return `${resource}.create`;
  if (method === 'DELETE') return `${resource}.delete`;

  return `${resource}.update`;
};

// URL del microservicio de pagos
// En producción se recomienda usar ruta relativa y proxy nginx (/payment-api)
const getFallbackPaymentApiUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5150/api';
  }

  const host = window.location.hostname;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1';

  if (isLocalHost) {
    return window.location.protocol === 'https:'
      ? 'https://localhost:7250/api'
      : 'http://localhost:5150/api';
  }

  return '/payment-api';
};

const PAYMENT_API_URL = import.meta.env.VITE_PAYMENT_API_URL || getFallbackPaymentApiUrl();

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
    const method = config.method?.toUpperCase() ?? 'GET';
    const trackingUrl = sanitizeUrlForTracking(config.url);

    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (mutationMethods.has(method)) {
      const actionName = inferActionName(method, trackingUrl);
      const trackingContext: PaymentTrackingContext = {
        actionName,
        method,
        url: trackingUrl,
        path: window.location.pathname,
      };

      (config as typeof config & PaymentTrackingConfig).__actionTracking = trackingContext;
      addUserActionBreadcrumb(actionName, trackingContext, 'attempt');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

paymentApi.interceptors.response.use(
  (response) => {
    const tracking = (response.config as typeof response.config & PaymentTrackingConfig).__actionTracking;
    if (tracking) {
      trackUserAction(tracking.actionName, {
        ...tracking,
        statusCode: response.status,
      }, 'success');
    }

    return response;
  },
  (error) => {
    const tracking = (error.config as typeof error.config & PaymentTrackingConfig)?.__actionTracking;
    if (tracking) {
      trackUserAction(tracking.actionName, {
        ...tracking,
        statusCode: error.response?.status,
        reason: error.message,
      }, 'failure');
      addUserActionBreadcrumb(tracking.actionName, {
        ...tracking,
        statusCode: error.response?.status,
      }, 'failure');
    }

    return Promise.reject(error);
  }
);

export default paymentApi;
