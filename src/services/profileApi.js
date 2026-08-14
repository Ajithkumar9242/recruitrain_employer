import apiClient from './apiClient';
import { extractPayload } from './normalizer';

/**
 * RecruitTrain Employer Profile API Service
 * Authoritative Backend Integration for Frappe Employer User Profile Management
 * Endpoints:
 * - GET  /api/method/recruitrain_employer.api.profile.get_my_profile
 * - POST /api/method/recruitrain_employer.api.profile.update_my_profile
 * - POST /api/method/recruitrain_employer.api.profile.upload_profile_photo
 * - POST /api/method/recruitrain_employer.api.profile.remove_profile_photo
 */
export const profileApi = {
  /**
   * Fetch complete Employer User profile for active session.
   * @returns {Promise<Object>} Unwrapped raw backend profile object
   */
  async getMyProfile() {
    const response = await apiClient.get(
      '/method/recruitrain_employer.api.profile.get_my_profile'
    );
    return extractPayload(response);
  },

  /**
   * Apply partial profile updates for mutable fields.
   * @param {Object} payload - Only changed mutable fields (first_name, phone, designation, etc.)
   * @returns {Promise<Object>} Updated profile response
   */
  async updateMyProfile(payload) {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.profile.update_my_profile',
      payload
    );
    return extractPayload(response);
  },

  /**
   * Upload or update profile photo avatar.
   * @param {File} file - Image file (PNG, JPG, WEBP, SVG up to 5MB)
   * @returns {Promise<Object>} Response containing file_url, profile_image, thumbnail
   */
  async uploadProfilePhoto(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      '/method/recruitrain_employer.api.profile.upload_profile_photo',
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
   * Remove active profile photo attachment and clear avatar references.
   * @returns {Promise<Object>} Confirmation payload
   */
  async removeProfilePhoto() {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.profile.remove_profile_photo'
    );
    return extractPayload(response);
  },
};

export default profileApi;
