import apiClient from './apiClient';

/**
 * RecruitTrain Candidate API Service
 * Authoritative Backend Integration with Frappe Candidate Controller (recruitrain_employer.api.candidate)
 * Architectural Rule: Backend is single source of truth. Company scope set by backend session context.
 */
export const candidateApi = {
  /**
   * List company-scoped candidates with server-side pagination, search, and filtering
   * @param {Object} params - { page, pageSize, search, status, country, profession, employmentType, orderBy }
   * @returns {Promise<Object>} Backend response envelope
   */
  async listCandidates({
    page = 1,
    pageSize = 10,
    search = '',
    status = null,
    country = null,
    profession = null,
    employmentType = null,
    orderBy = 'creation desc',
  } = {}) {
    const payload = {
      page,
      page_size: pageSize,
      order_by: orderBy,
    };

    if (search && search.trim()) payload.search_term = search.trim();
    if (status) payload.status = status;
    if (country) payload.country = country;
    if (profession) payload.profession = profession;
    if (employmentType) payload.employment_type = employmentType;

    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.list_candidates', payload);
    return response;
  },

  /**
   * Search candidates by term
   * @param {Object} params - { query, search, page, pageSize }
   * @returns {Promise<Object>} Backend response envelope
   */
  async searchCandidates({ query = '', search = '', page = 1, pageSize = 10 } = {}) {
    const searchTerm = (query || search || '').trim();
    const payload = {
      query: searchTerm,
      search_term: searchTerm,
      page,
      page_size: pageSize,
    };
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.search_candidates', payload);
    return response;
  },

  /**
   * List domestic candidates
   * @param {Object} params - { page, pageSize, search, orderBy }
   * @returns {Promise<Object>} Backend response envelope
   */
  async listDomesticCandidates({ page = 1, pageSize = 10, search = '', orderBy = 'creation desc' } = {}) {
    const payload = {
      page,
      page_size: pageSize,
      order_by: orderBy,
    };
    if (search && search.trim()) payload.search_term = search.trim();
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.list_domestic_candidates', payload);
    return response;
  },

  /**
   * List international candidates
   * @param {Object} params - { page, pageSize, search, orderBy }
   * @returns {Promise<Object>} Backend response envelope
   */
  async listInternationalCandidates({ page = 1, pageSize = 10, search = '', orderBy = 'creation desc' } = {}) {
    const payload = {
      page,
      page_size: pageSize,
      order_by: orderBy,
    };
    if (search && search.trim()) payload.search_term = search.trim();
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.list_international_candidates', payload);
    return response;
  },

  /**
   * Get single candidate profile by candidate ID / record name
   * @param {string} candidateId - Primary key candidate ID
   * @returns {Promise<Object>} Backend response envelope
   */
  async getCandidate(candidateId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.get_candidate', {
      candidate_id: candidateId,
      name: candidateId,
    });
    return response;
  },

  /**
   * Create a new Candidate record
   * @param {Object} data - Candidate form payload
   * @returns {Promise<Object>} Backend response envelope
   */
  async createCandidate(data) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.create_candidate', data);
    return response;
  },

  /**
   * Update existing Candidate profile fields
   * @param {string} candidateId - Candidate ID
   * @param {Object} data - Updated candidate fields
   * @returns {Promise<Object>} Backend response envelope
   */
  async updateCandidate(candidateId, data) {
    const {
      candidate_id,
      id,
      company,
      full_name,
      email,
      location_display,
      is_international,
      latest_application,
      creation,
      modified,
      modified_by,
      owner,
      phone,
      mobile_number,
      location,
      salary,
      total_experience_years,
      ...updateFields
    } = data || {};

    const payload = {
      name: candidateId,
      ...updateFields,
    };
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_candidate', payload);
    return response;
  },

  /**
   * Delete Candidate record (fails with conflict if recruitment history exists)
   * @param {string} candidateId - Candidate ID
   * @returns {Promise<Object>} Backend response envelope
   */
  async deleteCandidate(candidateId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.delete_candidate', {
      candidate_id: candidateId,
      name: candidateId,
    });
    return response;
  },

  /**
   * Retrieve authoritative profile completeness score for candidate
   * @param {string} candidateId - Candidate ID
   * @returns {Promise<Object>} Backend response envelope
   */
  async getProfileCompleteness(candidateId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.get_profile_completeness', {
      candidate_id: candidateId,
      name: candidateId,
    });
    return response;
  },

  /**
   * Sub-resource Update Methods for Child Tables
   */
  async updateEducation(candidateId, items) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_education', {
      candidate_id: candidateId,
      education: items,
      items: items,
    });
    return response;
  },

  async updateExperience(candidateId, items) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_experience', {
      candidate_id: candidateId,
      experience: items,
      items: items,
    });
    return response;
  },

  async updateSkills(candidateId, items) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_skills', {
      candidate_id: candidateId,
      skills: items,
      items: items,
    });
    return response;
  },

  async updateLanguages(candidateId, items) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_languages', {
      candidate_id: candidateId,
      languages: items,
      items: items,
    });
    return response;
  },

  async updateCertifications(candidateId, items) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_certifications', {
      candidate_id: candidateId,
      certifications: items,
      items: items,
    });
    return response;
  },

  async updateDocuments(candidateId, items) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_documents', {
      candidate_id: candidateId,
      documents: items,
      items: items,
    });
    return response;
  },

  async updatePassportAndVisa(candidateId, payload) {
    const response = await apiClient.post('/method/recruitrain_employer.api.candidate.update_passport_and_visa', {
      candidate_id: candidateId,
      ...payload,
    });
    return response;
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
    return response;
  },
};

export default candidateApi;

