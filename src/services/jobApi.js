import apiClient from './apiClient';
import { extractPayload } from './normalizer';
import { normalizeJob, normalizeJobList } from '../utils/jobNormalizer';

/**
 * RecruitTrain Job Opening API Service
 * Authoritative Backend Integration with Frappe Job Controller
 */
export const jobApi = {
  /**
   * List company-scoped job openings with server-side pagination and filters
   * @param {Object} params - { page, pageSize, filters, orderBy, orderDir }
   * @returns {Promise<Object>} Normalized paginated job list
   */
  async listJobs({
    page = 1,
    pageSize = 20,
    filters = {},
    orderBy = 'creation',
    orderDir = 'desc',
  } = {}) {
    const payload = {
      page,
      page_size: pageSize,
      order_by: orderBy,
      order_dir: orderDir,
      ...filters,
    };

    const response = await apiClient.post('/method/recruitrain_employer.api.jobs.list_jobs', payload);
    return normalizeJobList(response);
  },

  /**
   * Search job openings across searchable fields using backend search
   * @param {Object} params - { search, page, pageSize, filters, orderBy, orderDir }
   * @returns {Promise<Object>} Normalized search results
   */
  async searchJobs({
    search = '',
    page = 1,
    pageSize = 20,
    filters = {},
    orderBy = 'creation',
    orderDir = 'desc',
  } = {}) {
    const payload = {
      search,
      page,
      page_size: pageSize,
      order_by: orderBy,
      order_dir: orderDir,
      ...filters,
    };

    const response = await apiClient.post('/method/recruitrain_employer.api.jobs.search_jobs', payload);
    return normalizeJobList(response);
  },

  /**
   * Retrieve a single Job Opening record by ID
   * @param {string} jobId - Name / job_id of Job Opening
   * @returns {Promise<Object>} Normalized Job Opening
   */
  async getJob(jobId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.jobs.get_job', {
      job_id: jobId,
    });
    return normalizeJob(response);
  },

  /**
   * Save a Job Opening draft (create new or update existing draft)
   * @param {Object} data - Form data
   * @param {string|null} jobId - Optional existing job ID
   * @returns {Promise<Object>} Normalized draft job payload
   */
  async saveDraft(data, jobId = null) {
    const payload = {
      ...data,
      ...(jobId ? { job_id: jobId, name: jobId } : {}),
    };
    const response = await apiClient.post('/method/recruitrain_employer.api.jobs.save_draft', payload);
    return normalizeJob(response);
  },

  /**
   * Create a new Job Opening record
   * @param {Object} data - Full job creation payload
   * @returns {Promise<Object>} Normalized created job payload
   */
  async createJob(data) {
    const response = await apiClient.post('/method/recruitrain_employer.api.jobs.create_job', data);
    return normalizeJob(response);
  },

  /**
   * Update an existing Job Opening record
   * @param {string} jobId - Job ID
   * @param {Object} data - Updatable fields
   * @returns {Promise<Object>} Normalized updated job payload
   */
  async updateJob(jobId, data) {
    const payload = {
      ...data,
      job_id: jobId,
    };
    const response = await apiClient.post('/method/recruitrain_employer.api.jobs.update_job', payload);
    return normalizeJob(response);
  },

  /**
   * Publish a Job Opening (enforces mandatory publish validation on backend)
   * @param {string} jobId - Job ID
   * @param {Object|null} data - Optional payload updates before publishing
   * @returns {Promise<Object>} Normalized published job payload
   */
  async publishJob(jobId, data = null) {
    const payload = {
      ...(data || {}),
      job_id: jobId,
    };
    const response = await apiClient.post('/method/recruitrain_employer.api.jobs.publish_job', payload);
    return normalizeJob(response);
  },

  /**
   * Close an active Job Opening
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} Normalized closed job payload
   */
  async closeJob(jobId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.jobs.close_job', {
      job_id: jobId,
    });
    return normalizeJob(response);
  },

  /**
   * Delete a Job Opening record
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} Confirmation message response
   */
  async deleteJob(jobId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.jobs.delete_job', {
      job_id: jobId,
    });
    const payload = extractPayload(response);
    return payload?.message || payload;
  },

  /**
   * Fetch Master Departments from Frappe backend
   */
  async getDepartments() {
    const response = await apiClient.get('/method/recruitrain_employer.api.master.list_departments');
    return extractPayload(response);
  },

  /**
   * Fetch Master Professions (optionally filtered by department) from Frappe backend
   */
  async getProfessions(department = '') {
    const params = department ? { department } : {};
    const response = await apiClient.get('/method/recruitrain_employer.api.master.list_professions', { params });
    return extractPayload(response);
  },

  /**
   * Fetch Master Employment Types from Frappe backend
   */
  async getEmploymentTypes() {
    const response = await apiClient.get('/method/recruitrain_employer.api.master.list_employment_types');
    return extractPayload(response);
  },

  /**
   * Fetch Master Industries from Frappe backend
   */
  async getIndustries() {
    const response = await apiClient.get('/method/recruitrain_employer.api.master.list_industries');
    return extractPayload(response);
  },

  /**
   * Fetch Master Users (Hiring Managers / Recruiters) from Frappe backend
   */
  async getUsers() {
    const response = await apiClient.get('/method/frappe.client.get_list', {
      params: {
        doctype: 'User',
        fields: JSON.stringify(['name', 'full_name']),
        limit_page_length: 100,
      },
    });
    return extractPayload(response);
  },

  /**
   * Fetch Master Currencies from Frappe backend
   */
  async getCurrencies() {
    const response = await apiClient.get('/method/frappe.client.get_list', {
      params: {
        doctype: 'Currency',
        fields: JSON.stringify(['name', 'currency_name']),
        limit_page_length: 100,
      },
    });
    return extractPayload(response);
  },

  /**
   * Fetch Master Countries from Frappe backend
   */
  async getCountries() {
    const response = await apiClient.get('/method/frappe.client.get_list', {
      params: {
        doctype: 'Country',
        fields: JSON.stringify(['name', 'country_name']),
        limit_page_length: 300,
      },
    });
    return extractPayload(response);
  },

  /**
   * Fetch Master Tariff Groups (optionally filtered by profession or department) from Frappe backend
   */
  async getTariffGroups(profession = '', department = '') {
    const params = {};
    if (profession) params.profession = profession;
    if (department) params.department = department;
    const response = await apiClient.get('/method/recruitrain_employer.api.master.list_tariff_groups', { params });
    return extractPayload(response);
  },
};

export default jobApi;
