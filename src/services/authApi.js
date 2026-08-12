import apiClient from './apiClient';
import { normalizeData } from './normalizer';

/**
 * RecruitTrain Authentication API Service
 * Authoritative Backend Integration for Frappe Employer ATS Session
 */
export const authApi = {
  /**
   * Submit login credentials to Frappe backend
   * @param {Object} payload - { email, password, rememberMe }
   * @returns {Promise<Object>} Normalized user session response
   */
  async login({ email, password, rememberMe }) {
    // Standard Frappe login parameters (usr/pwd or email/password)
    const payload = {
      usr: email,
      pwd: password,
      email,
      password,
      remember_me: Boolean(rememberMe),
    };

    try {
      const response = await apiClient.post('/method/recruitrain_employer.api.auth.login', payload);
      const rawData = response?.message || response?.data || response;
      return normalizeData(rawData);
    } catch (primaryErr) {
      // Fallback to standard Frappe core login method if custom app endpoint path differs
      if (primaryErr?.status === 404) {
        const response = await apiClient.post('/method/login', { usr: email, pwd: password });
        const rawData = response?.message || response?.data || response;
        return normalizeData(rawData);
      }
      throw primaryErr;
    }
  },

  /**
   * Verify existing Frappe session and fetch current authenticated Employer User
   * @returns {Promise<Object>} Authorized user profile
   */
  async me() {
    try {
      const response = await apiClient.get('/method/recruitrain_employer.api.auth.me');
      const rawData = response?.message || response?.data || response;
      return normalizeData(rawData);
    } catch (primaryErr) {
      if (primaryErr?.status === 404) {
        const response = await apiClient.get('/method/frappe.auth.get_logged_user');
        const rawData = response?.message || response?.data || response;
        return normalizeData(rawData);
      }
      throw primaryErr;
    }
  },

  /**
   * Invalidate active session on backend
   * @returns {Promise<Object>} Logout confirmation
   */
  async logout() {
    try {
      const response = await apiClient.post('/method/recruitrain_employer.api.auth.logout');
      return normalizeData(response);
    } catch (primaryErr) {
      if (primaryErr?.status === 404) {
        const response = await apiClient.post('/method/logout');
        return normalizeData(response);
      }
      throw primaryErr;
    }
  },

  /**
   * Dispatch password reset request to backend
   * @param {Object} payload - { email }
   */
  async forgotPassword({ email }) {
    try {
      const response = await apiClient.post('/method/recruitrain_employer.api.auth.forgot_password', { email });
      return normalizeData(response);
    } catch (primaryErr) {
      if (primaryErr?.status === 404) {
        const response = await apiClient.post('/method/frappe.core.doctype.user.user.reset_password', { user: email });
        return normalizeData(response);
      }
      throw primaryErr;
    }
  },

  /**
   * Confirm password reset with token/key
   * @param {Object} payload - { key, password, confirmPassword }
   */
  async resetPassword({ key, password, confirmPassword }) {
    const payload = {
      key,
      new_password: password,
      confirm_password: confirmPassword,
    };
    const response = await apiClient.post('/method/recruitrain_employer.api.auth.reset_password', payload);
    return normalizeData(response);
  },
};

export default authApi;
