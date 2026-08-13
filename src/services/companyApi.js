import apiClient from './apiClient';
import { extractPayload } from './normalizer';

/**
 * RecruitTrain Company Profile API Service
 * Authoritative Backend Integration for Frappe Employer Company Profile
 * Endpoint Path Prefix: /api/method/recruitrain_employer.api.company.*
 */
export const companyApi = {
  /**
   * Fetch authenticated employer's Company Profile from Frappe backend.
   * Session cookie / auth header automatically determines company isolation.
   * @returns {Promise<Object>} Company profile object
   */
  async getCompanyProfile() {
    const response = await apiClient.get('/method/recruitrain_employer.api.company.get_company_profile');
    return extractPayload(response);
  },

  /**
   * Update Company Profile for the currently authenticated employer.
   * Accepts any subset of updatable company profile fields.
   * @param {Object} data - Profile update payload
   * @returns {Promise<Object>} Updated company profile object
   */
  async updateCompanyProfile(data) {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.company.update_company_profile',
      data
    );
    return extractPayload(response);
  },

  /**
   * Upload or replace the Company logo.
   * @param {File} file - Logo image file
   * @returns {Promise<Object>} Object containing logo_url
   */
  async uploadCompanyLogo(file) {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await apiClient.post(
      '/method/recruitrain_employer.api.company.upload_company_logo',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return extractPayload(response);
  },

  /**
   * Upload or replace the Company banner image.
   * @param {File} file - Banner image file
   * @returns {Promise<Object>} Object containing banner_url
   */
  async uploadCompanyBanner(file) {
    const formData = new FormData();
    formData.append('banner', file);

    const response = await apiClient.post(
      '/method/recruitrain_employer.api.company.upload_company_banner',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return extractPayload(response);
  },
};

export default companyApi;
