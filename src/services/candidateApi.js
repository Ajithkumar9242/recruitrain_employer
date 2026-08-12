import apiClient from './apiClient';
import { normalizeCandidate, normalizeCandidateList } from '../utils/candidateNormalizer';

/**
 * RecruitTrain Candidate API Service
 * Authoritative Backend Integration with Frappe Candidate Controller
 */
export const candidateApi = {
  /**
   * List company-scoped candidates with server-side pagination, search, and filtering
   * @param {Object} params - { page, pageSize, search, status, profession, employmentType, country, orderBy }
   * @returns {Promise<Object>} Normalized paginated candidates
   */
  async listCandidates({
    page = 1,
    pageSize = 10,
    search = '',
    status = null,
    profession = null,
    employmentType = null,
    country = null,
    orderBy = 'creation desc',
  } = {}) {
    const payload = {
      page,
      page_size: pageSize,
      order_by: orderBy,
    };

    if (search) payload.search = search;
    if (status) payload.status = status;
    if (profession) payload.profession = profession;
    if (employmentType) payload.employment_type = employmentType;
    if (country) payload.country = country;

    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.list_candidates', payload);
    const rawData = response?.data || response?.message || response;
    return normalizeCandidateList(rawData);
  },

  /**
   * Search candidates by term
   * @param {Object} params - { query, page, pageSize }
   * @returns {Promise<Object>} Normalized search results
   */
  async searchCandidates({ query = '', page = 1, pageSize = 10 } = {}) {
    const payload = {
      query,
      search_term: query,
      page,
      page_size: pageSize,
    };
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.search_candidates', payload);
    const rawData = response?.data || response?.message || response;
    return normalizeCandidateList(rawData);
  },

  /**
   * Get single candidate profile by candidate ID / record name
   * @param {string} candidateId - Primary key name
   * @returns {Promise<Object>} Normalized candidate profile
   */
  async getCandidate(candidateId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.get_candidate', {
      candidate_id: candidateId,
      name: candidateId,
    });
    const rawData = response?.data || response?.message || response;
    return normalizeCandidate(rawData);
  },

  /**
   * Create a new Candidate record
   * @param {Object} data - Candidate form payload
   * @returns {Promise<Object>} Normalized created candidate
   */
  async createCandidate(data) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.create_candidate', data);
    const rawData = response?.data || response?.message || response;
    return normalizeCandidate(rawData);
  },

  /**
   * Update existing Candidate profile fields
   * @param {string} candidateId - Candidate ID
   * @param {Object} data - Updated candidate fields
   * @returns {Promise<Object>} Normalized updated candidate
   */
  async updateCandidate(candidateId, data) {
    const payload = {
      ...data,
      candidate_id: candidateId,
      name: candidateId,
    };
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_candidate', payload);
    const rawData = response?.data || response?.message || response;
    return normalizeCandidate(rawData);
  },

  /**
   * Delete Candidate record
   * @param {string} candidateId - Candidate ID
   * @returns {Promise<Object>} Confirmation payload
   */
  async deleteCandidate(candidateId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.delete_candidate', {
      candidate_id: candidateId,
      name: candidateId,
    });
    return response?.data || response?.message || response;
  },

  /**
   * Sub-resource Update Methods for Child Tables
   */
  async updateEducation(candidateId, items) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_education', {
      candidate_id: candidateId,
      education: items,
    });
    return response?.data || response?.message || response;
  },

  async updateExperience(candidateId, items) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_experience', {
      candidate_id: candidateId,
      experience: items,
    });
    return response?.data || response?.message || response;
  },

  async updateSkills(candidateId, items) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_skills', {
      candidate_id: candidateId,
      skills: items,
    });
    return response?.data || response?.message || response;
  },

  async updateLanguages(candidateId, items) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_languages', {
      candidate_id: candidateId,
      languages: items,
    });
    return response?.data || response?.message || response;
  },

  async updateCertifications(candidateId, items) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_certifications', {
      candidate_id: candidateId,
      certifications: items,
    });
    return response?.data || response?.message || response;
  },

  async updateDocuments(candidateId, items) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_documents', {
      candidate_id: candidateId,
      documents: items,
    });
    return response?.data || response?.message || response;
  },

  async updatePassportAndVisa(candidateId, payload) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_passport_and_visa', {
      candidate_id: candidateId,
      ...payload,
    });
    const rawData = response?.data || response?.message || response;
    return normalizeCandidate(rawData);
  },

  /**
   * Upload file to Frappe attachment repository
   * @param {File} file - File object
   * @param {string} doctype - Target DocType ("Candidate")
   * @param {string} docname - Target Candidate name
   * @param {string} fieldname - Fieldname ("resume")
   * @returns {Promise<Object>} Upload response containing file_url
   */
  async uploadFile({ file, doctype = 'Candidate', docname, fieldname = 'resume', isPrivate = 0 }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doctype', doctype);
    formData.append('docname', docname);
    formData.append('fieldname', fieldname);
    formData.append('is_private', isPrivate ? 1 : 0);

    const response = await apiClient.post('/method/upload_file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response?.message || response?.data || response;
  },
};

export default candidateApi;
