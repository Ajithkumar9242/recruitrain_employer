import axios from 'axios';
import { normalizeApiError } from './errorNormalizer';
import { store } from '../store';
import { clearAuth } from '../store/slices/authSlice';

/**
 * Extract a named cookie value from document.cookie safely.
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const raw = parts.pop().split(';').shift();
    return raw ? decodeURIComponent(raw) : null;
  }
  return null;
};

// API Base URL (defaults to /api or Frappe backend origin if set in window/env)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach active language header
    const currentLang = state.language?.currentLanguage || 'en';
    config.headers['Accept-Language'] = currentLang;

    // Attach Frappe CSRF token for unsafe HTTP methods (POST, PUT, DELETE, PATCH)
    const method = (config.method || '').toLowerCase();
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
      const csrfToken =
        getCookie('csrf_token') ||
        state.auth?.csrfToken ||
        state.auth?.user?.csrf_token ||
        window.csrf_token ||
        window.frappe?.csrf_token;

      if (csrfToken) {
        config.headers['X-Frappe-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(normalizeApiError(error));
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Capture CSRF token if returned in response payload or set in cookie
    const data = response.data;
    const extractedToken =
      data?.csrf_token ||
      data?.data?.csrf_token ||
      data?.message?.csrf_token ||
      data?.message?.data?.csrf_token ||
      getCookie('csrf_token');

    if (extractedToken) {
      window.csrf_token = extractedToken;
      apiClient.defaults.headers.common['X-Frappe-CSRF-Token'] = extractedToken;
    }

    // Return standard response payload
    return response.data;
  },
  (error) => {
    const normalizedError = normalizeApiError(error);

    // Auto-clear auth state on 401 Unauthorized
    if (normalizedError.status === 401) {
      store.dispatch(clearAuth());
    }

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
