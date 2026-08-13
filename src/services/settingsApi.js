import apiClient from './apiClient';
import { extractPayload } from './normalizer';

/**
 * RecruitTrain Employer Settings API Service
 * Authoritative Backend Integration for Frappe Employer Settings & Notification Preferences
 * Endpoint Path Prefix: /api/method/recruitrain_employer.api.settings.*
 */
export const settingsApi = {
  /**
   * Fetch all settings groups for the authenticated employer's company.
   * @returns {Promise<Object>} Object containing all settings groups
   */
  async getSettings() {
    const response = await apiClient.get('/method/recruitrain_employer.api.settings.get_settings');
    return extractPayload(response);
  },

  /**
   * Update one or more settings groups.
   * @param {Object} data - Multi-group settings payload
   * @returns {Promise<Object>} Complete updated settings payload
   */
  async updateSettings(data) {
    const response = await apiClient.post('/method/recruitrain_employer.api.settings.update_settings', data);
    return extractPayload(response);
  },

  /**
   * Fetch general settings.
   * @returns {Promise<Object>} General settings object
   */
  async getGeneralSettings() {
    const response = await apiClient.get('/method/recruitrain_employer.api.settings.get_general_settings');
    return extractPayload(response);
  },

  /**
   * Update general settings.
   * @param {Object} data - General settings payload
   * @returns {Promise<Object>} Updated general settings
   */
  async updateGeneralSettings(data) {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.settings.update_general_settings',
      data
    );
    return extractPayload(response);
  },

  /**
   * Fetch branding settings.
   * @returns {Promise<Object>} Branding settings object
   */
  async getBrandingSettings() {
    const response = await apiClient.get('/method/recruitrain_employer.api.settings.get_branding_settings');
    return extractPayload(response);
  },

  /**
   * Update branding settings.
   * @param {Object} data - Branding settings payload
   * @returns {Promise<Object>} Updated branding settings
   */
  async updateBrandingSettings(data) {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.settings.update_branding_settings',
      data
    );
    return extractPayload(response);
  },

  /**
   * Fetch notification preferences for current user.
   * @returns {Promise<Object>} Notification settings object
   */
  async getNotificationSettings() {
    const response = await apiClient.get('/method/recruitrain_employer.api.settings.get_notification_settings');
    return extractPayload(response);
  },

  /**
   * Update notification preferences for current user.
   * @param {Object} data - Notification preferences payload
   * @returns {Promise<Object>} Updated notification settings
   */
  async updateNotificationSettings(data) {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.settings.update_notification_settings',
      data
    );
    return extractPayload(response);
  },

  /**
   * Fetch security settings (Requires Employer User session).
   * @returns {Promise<Object>} Security settings object
   */
  async getSecuritySettings() {
    const response = await apiClient.get('/method/recruitrain_employer.api.settings.get_security_settings');
    return extractPayload(response);
  },

  /**
   * Update security settings (Requires Administrator role).
   * @param {Object} data - Security settings payload
   * @returns {Promise<Object>} Updated security settings
   */
  async updateSecuritySettings(data) {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.settings.update_security_settings',
      data
    );
    return extractPayload(response);
  },

  /**
   * Fetch recruitment settings.
   * @returns {Promise<Object>} Recruitment settings object
   */
  async getRecruitmentSettings() {
    const response = await apiClient.get('/method/recruitrain_employer.api.settings.get_recruitment_settings');
    return extractPayload(response);
  },

  /**
   * Update recruitment settings (Requires HR Manager role or above).
   * @param {Object} data - Recruitment settings payload
   * @returns {Promise<Object>} Updated recruitment settings
   */
  async updateRecruitmentSettings(data) {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.settings.update_recruitment_settings',
      data
    );
    return extractPayload(response);
  },

  /**
   * Fetch integration settings (Requires Administrator role).
   * @returns {Promise<Object>} Integration settings object (secrets masked)
   */
  async getIntegrationSettings() {
    const response = await apiClient.get('/method/recruitrain_employer.api.settings.get_integration_settings');
    return extractPayload(response);
  },

  /**
   * Update integration settings (Requires Administrator role).
   * @param {Object} data - Integration settings payload
   * @returns {Promise<Object>} Updated integration settings
   */
  async updateIntegrationSettings(data) {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.settings.update_integration_settings',
      data
    );
    return extractPayload(response);
  },
};

export default settingsApi;
