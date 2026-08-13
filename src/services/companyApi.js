import apiClient from './apiClient';
import { normalizeData, extractPayload } from './normalizer';

/**
 * RecruitTrain Company Profile API Service
 * Authoritative Backend Integration for Frappe Employer Company Profile
 */
export const companyApi = {
  /**
   * Fetch authenticated employer's Company Profile from Frappe backend.
   * Session cookie / auth header automatically determines company isolation.
   * DO NOT pass client-supplied company_id, tenant_id, or employer_id.
   * @returns {Promise<Object>} Normalized company profile object
   */
  async getCompanyProfile() {
    const response = await apiClient.get('/method/recruitrain_employer.api.company.get_company_profile');
    const rawData = extractPayload(response);
    return normalizeData(rawData);
  },
};

export default companyApi;
