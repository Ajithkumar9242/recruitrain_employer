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
   * @param {Object} params - { page, pageSize, candidate, jobOpening, status, currentStage, company, orderBy, orderDir }
   * @returns {Promise<Object>} Normalized paginated job application list
   */
  async listApplications({
    page = 1,
    pageSize = 20,
    candidate = null,
    jobOpening = null,
    company = null,
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
    if (company) payload.company = company;
    if (status) payload.status = status;
    if (currentStage) payload.current_stage = currentStage;
    if (source) payload.source = source;
    if (priority) payload.priority = priority;

    const response = await apiClient.post('/method/recruitrain_employer.api.job_application.list_applications', payload);
    return normalizeJobApplicationList(response);
  },

  /**
   * Search job applications using backend multi-field search
   * @param {Object} params - { search, page, pageSize, status, currentStage, company, candidate, jobOpening, source, priority, orderBy, orderDir }
   * @returns {Promise<Object>} Normalized search results
   */
  async searchApplications({
    search = '',
    page = 1,
    pageSize = 20,
    status = null,
    currentStage = null,
    company = null,
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
    if (company) payload.company = company;
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
      application_id: String(applicationId),
    });
    return normalizeJobApplication(response);
  },

  /**
   * Create a new Job Application record (Apply candidate to job)
   * @param {Object} data - Application payload { candidate, jobOpening, source, resume, coverLetter, notes, priority, rating, assignedRecruiter }
   * @returns {Promise<Object>} Normalized created job application
   */
  async createApplication(data) {
    const payload = {
      candidate: data.candidate,
      job_opening: data.jobOpening || data.job_opening,
      source: data.source,
      resume: data.resume || null,
      cover_letter: data.coverLetter !== undefined ? data.coverLetter : data.cover_letter,
      notes: data.notes || '',
      priority: data.priority || 'Medium',
      rating: data.rating !== undefined && data.rating !== null ? Number(data.rating) : 0,
      assigned_recruiter: data.assignedRecruiter || data.assigned_recruiter || null,
    };

    // Remove undefined values
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    const response = await apiClient.post('/method/recruitrain_employer.api.job_application.create_application', payload);
    return normalizeJobApplication(response);
  },

  /**
   * Update mutable fields of an existing Job Application
   * @param {string|number} applicationId - Application ID
   * @param {Object} data - Mutable fields { cover_letter, resume, notes, priority, rating, assigned_recruiter, current_stage, rejection_reason }
   * @returns {Promise<Object>} Normalized updated job application
   */
  async updateApplication(applicationId, data) {
    const payload = {
      application_id: String(applicationId),
    };

    if (data.coverLetter !== undefined) payload.cover_letter = data.coverLetter;
    if (data.cover_letter !== undefined) payload.cover_letter = data.cover_letter;

    if (data.resume !== undefined) payload.resume = data.resume;

    if (data.notes !== undefined) payload.notes = data.notes;

    if (data.priority !== undefined) payload.priority = data.priority;

    if (data.rating !== undefined) payload.rating = Number(data.rating);

    if (data.assignedRecruiter !== undefined) payload.assigned_recruiter = data.assignedRecruiter;
    if (data.assigned_recruiter !== undefined) payload.assigned_recruiter = data.assigned_recruiter;

    if (data.currentStage !== undefined) payload.current_stage = data.currentStage;
    if (data.current_stage !== undefined) payload.current_stage = data.current_stage;

    if (data.rejectionReason !== undefined) payload.rejection_reason = data.rejectionReason;
    if (data.rejection_reason !== undefined) payload.rejection_reason = data.rejection_reason;

    const response = await apiClient.post('/method/recruitrain_employer.api.job_application.update_application', payload);
    return normalizeJobApplication(response);
  },

  /**
   * Transition status/stage of a Job Application
   * Endpoint: recruitrain_employer.api.job_application.change_status
   * @param {string|number} applicationId - Application ID
   * @param {string} newStatus - Target stage/status
   * @param {string|null} rejectionReason - Optional rejection reason if status is 'Rejected'
   * @returns {Promise<Object>} Normalized updated application object
   */
  async changeStatus(applicationId, newStatus, rejectionReason = null) {
    const payload = {
      application_id: String(applicationId),
      new_status: newStatus,
    };
    if (rejectionReason) {
      payload.rejection_reason = rejectionReason;
    }

    const response = await apiClient.post('/method/recruitrain_employer.api.job_application.change_status', payload);
    return normalizeJobApplication(response);
  },

  /**
   * Transition stage of a Job Application (delegates to changeStatus)
   * @param {string|number} applicationId - Application ID
   * @param {string} stage - Target stage
   * @returns {Promise<Object>} Normalized updated application object
   */
  async changeStage(applicationId, stage) {
    return this.changeStatus(applicationId, stage);
  },

  /**
   * Delete a Job Application record safely (blocked by backend if active recruitment history exists)
   * @param {string|number} applicationId - Application ID
   * @returns {Promise<Object>} Confirmation payload
   */
  async deleteApplication(applicationId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.job_application.delete_application', {
      application_id: String(applicationId),
    });
    return response?.data || response?.message || response;
  },

  /**
   * Upload resume attachment for Job Application
   * @param {File} file - Resume file object
   * @param {string|null} applicationId - Optional Job Application ID
   * @returns {Promise<string>} Uploaded file URL
   */
  async uploadResume(file, applicationId = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doctype', 'Job Application');
    if (applicationId) formData.append('docname', String(applicationId));
    formData.append('fieldname', 'resume');
    formData.append('is_private', 0);

    const response = await apiClient.post('/method/upload_file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const fileUrl =
      response?.message?.file_url ||
      response?.data?.file_url ||
      response?.file_url ||
      response?.message?.file_name;
    return fileUrl;
  },
};

export default jobApplicationApi;
