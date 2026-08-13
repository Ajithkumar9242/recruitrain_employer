import apiClient from './apiClient';
import { normalizeJobApplication, normalizeJobApplicationList } from '../utils/jobApplicationNormalizer';

/**
 * RecruitTrain Job Application API Service
 * Authoritative Backend Integration with Frappe Job Application Controller
 * Domain: recruitrain_employer.api.job_application
 * Architectural Rule: Backend is single source of truth. Company scope set by backend session.
 */
export const jobApplicationApi = {
  /**
   * List company-scoped job applications with server-side pagination, sorting, and filters
   * @param {Object} params - { page, pageSize, candidate, jobOpening, status, currentStage, source, priority, orderBy, orderDir }
   * @returns {Promise<Object>} Normalized paginated job application list
   */
  async listApplications({
    page = 1,
    pageSize = 20,
    candidate = null,
    jobOpening = null,
    status = null,
    currentStage = null,
    source = null,
    priority = null,
    orderBy = 'creation',
    orderDir = 'desc',
  } = {}) {
    const payload = {
      page,
      page_size: pageSize,
      order_by: orderBy,
      order_dir: orderDir,
    };

    if (candidate) payload.candidate = candidate;
    if (jobOpening) payload.job_opening = jobOpening;
    if (status) payload.status = status;
    if (currentStage) payload.current_stage = currentStage;
    if (source) payload.source = source;
    if (priority) payload.priority = priority;

    const response = await apiClient.post('/method/recruitrain_employer.api.job_application.list_applications', payload);
    return normalizeJobApplicationList(response);
  },

  /**
   * Search job applications using backend multi-field search
   * @param {Object} params - { search, page, pageSize, status, currentStage, candidate, jobOpening, source, priority, orderBy, orderDir }
   * @returns {Promise<Object>} Normalized search results
   */
  async searchApplications({
    search = '',
    page = 1,
    pageSize = 20,
    status = null,
    currentStage = null,
    candidate = null,
    jobOpening = null,
    source = null,
    priority = null,
    orderBy = 'creation',
    orderDir = 'desc',
  } = {}) {
    const payload = {
      search: search ? search.trim() : '',
      page,
      page_size: pageSize,
      order_by: orderBy,
      order_dir: orderDir,
    };

    if (status) payload.status = status;
    if (currentStage) payload.current_stage = currentStage;
    if (candidate) payload.candidate = candidate;
    if (jobOpening) payload.job_opening = jobOpening;
    if (source) payload.source = source;
    if (priority) payload.priority = priority;

    const response = await apiClient.post('/method/recruitrain_employer.api.job_application.search_applications', payload);
    return normalizeJobApplicationList(response);
  },

  /**
   * Retrieve a single Job Application record by ID
   * @param {string|number} applicationId - Primary key name / ID of Job Application
   * @returns {Promise<Object>} Normalized Job Application object
   */
  async getApplication(applicationId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.job_application.get_application', {
      application_id: applicationId,
    });
    return normalizeJobApplication(response);
  },

  /**
   * Create a new Job Application record (Apply candidate to job)
   * @param {Object} data - Application payload { candidate, jobOpening, source, priority, applicationDate, notes, coverLetter, resume, expectedSalary }
   * @returns {Promise<Object>} Normalized created job application
   */
  async createApplication(data) {
    const payload = {
      candidate: data.candidate,
      job_opening: data.jobOpening || data.job_opening,
      source: data.source,
      priority: data.priority,
      application_date: data.applicationDate || data.application_date,
      notes: data.notes,
      cover_letter: data.coverLetter || data.cover_letter,
      resume: data.resume,
      expected_salary: data.expectedSalary !== undefined ? data.expectedSalary : data.expected_salary,
    };

    // Remove undefined values
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    const response = await apiClient.post('/method/recruitrain_employer.api.job_application.create_application', payload);
    return normalizeJobApplication(response);
  },

  /**
   * Update mutable fields of an existing Job Application
   * @param {string|number} applicationId - Application ID
   * @param {Object} data - Mutable fields { priority, coverLetter, rejectionReason, expectedSalary, notes, source }
   * @returns {Promise<Object>} Normalized updated job application
   */
  async updateApplication(applicationId, data) {
    const payload = {
      application_id: applicationId,
      ...(data.priority ? { priority: data.priority } : {}),
      ...(data.coverLetter !== undefined ? { cover_letter: data.coverLetter } : {}),
      ...(data.cover_letter !== undefined ? { cover_letter: data.cover_letter } : {}),
      ...(data.rejectionReason !== undefined ? { rejection_reason: data.rejectionReason } : {}),
      ...(data.rejection_reason !== undefined ? { rejection_reason: data.rejection_reason } : {}),
      ...(data.expectedSalary !== undefined ? { expected_salary: data.expectedSalary } : {}),
      ...(data.expected_salary !== undefined ? { expected_salary: data.expected_salary } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.source !== undefined ? { source: data.source } : {}),
    };

    const response = await apiClient.post('/method/recruitrain_employer.api.job_application.update_application', payload);
    return normalizeJobApplication(response);
  },

  /**
   * Transition status of a Job Application
   * @param {string|number} applicationId - Application ID
   * @param {string} status - New pipeline status ('Applied', 'Screening', 'Shortlisted', 'Interview Scheduled', 'Interviewed', 'Offer Extended', 'Hired', 'Rejected', 'Withdrawn')
   * @param {string|null} rejectionReason - Optional rejection reason if status is 'Rejected'
   * @returns {Promise<Object>} Normalized updated application object
   */
  async changeStatus(applicationId, status, rejectionReason = null) {
    const payload = {
      application_id: applicationId,
      new_status: status,
    };
    if (rejectionReason) {
      payload.rejection_reason = rejectionReason;
    }

    const response = await apiClient.post('/method/recruitrain_employer.api.job_application.change_status', payload);
    return normalizeJobApplication(response);
  },

  /**
   * Transition recruitment stage of a Job Application
   * @param {string|number} applicationId - Application ID
   * @param {string} stage - New recruitment stage
   * @returns {Promise<Object>} Normalized updated application object
   */
  async changeStage(applicationId, stage) {
    const payload = {
      application_id: applicationId,
      new_stage: stage,
    };

    const response = await apiClient.post('/method/recruitrain_employer.api.job_application.change_stage', payload);
    return normalizeJobApplication(response);
  },

  /**
   * Delete a Job Application record safely (blocked by backend if active recruitment history exists)
   * @param {string|number} applicationId - Application ID
   * @returns {Promise<Object>} Confirmation payload
   */
  async deleteApplication(applicationId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.job_application.delete_application', {
      application_id: applicationId,
    });
    return response?.data || response?.message || response;
  },
};

export default jobApplicationApi;
