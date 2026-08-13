import apiClient from './apiClient';
import { normalizeInterview, normalizeInterviewList } from '../utils/interviewNormalizer';

/**
 * RecruitTrain Interview API Service
 * Authoritative Backend Integration with Frappe Interview Controller (recruitrain_employer.api.interviews)
 * Architectural Rule: Backend is single source of truth. Company scope set by backend session.
 */
export const interviewApi = {
  /**
   * List company-scoped interviews with server-side pagination and filters
   * @param {Object} params - { page, pageSize, candidate, jobOpening, jobApplication, interviewer, scheduledOn, status, interviewType, orderBy, orderDir }
   * @returns {Promise<Object>} Normalized paginated interview list
   */
  async listInterviews({
    page = 1,
    pageSize = 10,
    candidate = null,
    jobOpening = null,
    jobApplication = null,
    interviewer = null,
    scheduledOn = null,
    status = null,
    interviewType = null,
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
    if (jobApplication) payload.job_application = jobApplication;
    if (interviewer) payload.interviewer = interviewer;
    if (scheduledOn) payload.scheduled_on = scheduledOn;
    if (status) payload.status = status;
    if (interviewType) payload.interview_type = interviewType;

    const response = await apiClient.post('/method/recruitrain_employer.api.interviews.list_interviews', payload);
    return normalizeInterviewList(response);
  },

  /**
   * Search interviews using backend multi-field search across candidate, company, job_opening, interviewer, scheduled_on, status, interview_type
   * @param {Object} params - { search, page, pageSize, candidate, jobOpening, jobApplication, interviewer, scheduledOn, status, interviewType, orderBy, orderDir }
   * @returns {Promise<Object>} Normalized search results
   */
  async searchInterviews({
    search = '',
    page = 1,
    pageSize = 10,
    candidate = null,
    jobOpening = null,
    jobApplication = null,
    interviewer = null,
    scheduledOn = null,
    status = null,
    interviewType = null,
    orderBy = 'creation',
    orderDir = 'desc',
  } = {}) {
    const payload = {
      search,
      page,
      page_size: pageSize,
      order_by: orderBy,
      order_dir: orderDir,
    };

    if (candidate) payload.candidate = candidate;
    if (jobOpening) payload.job_opening = jobOpening;
    if (jobApplication) payload.job_application = jobApplication;
    if (interviewer) payload.interviewer = interviewer;
    if (scheduledOn) payload.scheduled_on = scheduledOn;
    if (status) payload.status = status;
    if (interviewType) payload.interview_type = interviewType;

    const response = await apiClient.post('/method/recruitrain_employer.api.interviews.search_interviews', payload);
    return normalizeInterviewList(response);
  },

  /**
   * Retrieve a single Interview record by ID
   * @param {string} interviewId - Primary key name / ID of Interview
   * @returns {Promise<Object>} Normalized Interview object
   */
  async getInterview(interviewId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.interviews.get_interview', {
      interview_id: interviewId,
    });
    return normalizeInterview(response);
  },

  /**
   * Create / Schedule a new Interview record
   * @param {Object} data - Interview payload
   * @returns {Promise<Object>} Normalized created interview
   */
  async createInterview(data) {
    const payload = {
      job_application: data.jobApplication || data.job_application,
      interview_type: data.interviewType || data.interview_type,
      scheduled_on: data.scheduledOn || data.scheduled_on,
      duration: data.duration !== undefined && data.duration !== null ? Number(data.duration) : undefined,
      meeting_link: data.meetingLink || data.meeting_link,
      location: data.location,
      interviewer: data.interviewer,
      recruiter: data.recruiter,
      result: data.result,
      status: data.status || 'Scheduled',
      remarks: data.remarks,
    };

    // Remove undefined values
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    const response = await apiClient.post('/method/recruitrain_employer.api.interviews.create_interview', payload);
    return normalizeInterview(response);
  },

  /**
   * Alias for createInterview
   */
  async scheduleInterview(data) {
    return this.createInterview(data);
  },

  /**
   * Update mutable fields of an existing Interview
   * @param {string} interviewId - Interview ID
   * @param {Object} data - Updatable fields
   * @returns {Promise<Object>} Normalized updated interview
   */
  async updateInterview(interviewId, data) {
    const payload = {
      interview_id: interviewId,
    };

    if (data.interviewType || data.interview_type) payload.interview_type = data.interviewType || data.interview_type;
    if (data.scheduledOn || data.scheduled_on) payload.scheduled_on = data.scheduledOn || data.scheduled_on;
    if (data.duration !== undefined && data.duration !== null) payload.duration = Number(data.duration);
    if (data.meetingLink !== undefined) payload.meeting_link = data.meetingLink;
    if (data.meeting_link !== undefined) payload.meeting_link = data.meeting_link;
    if (data.location !== undefined) payload.location = data.location;
    if (data.interviewer !== undefined) payload.interviewer = data.interviewer;
    if (data.recruiter !== undefined) payload.recruiter = data.recruiter;
    if (data.result !== undefined) payload.result = data.result;
    if (data.status !== undefined) payload.status = data.status;
    if (data.remarks !== undefined) payload.remarks = data.remarks;

    const response = await apiClient.post('/method/recruitrain_employer.api.interviews.update_interview', payload);
    return normalizeInterview(response);
  },

  /**
   * Transition status of an Interview atomically
   * @param {string} interviewId - Interview ID
   * @param {string} status - New status ('Scheduled', 'Rescheduled', 'Completed', 'Cancelled')
   * @returns {Promise<Object>} Normalized updated interview object
   */
  async changeStatus(interviewId, status) {
    const payload = {
      interview_id: interviewId,
      new_status: status,
    };

    const response = await apiClient.post('/method/recruitrain_employer.api.interviews.change_status', payload);
    return normalizeInterview(response);
  },

  /**
   * Delete an Interview record safely (blocked by backend if linked Interview Feedback exists)
   * @param {string} interviewId - Interview ID
   * @returns {Promise<Object>} Confirmation payload
   */
  async deleteInterview(interviewId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.interviews.delete_interview', {
      interview_id: interviewId,
    });
    return response?.data || response?.message || response;
  },

  /**
   * List Job Applications in 'Interview' stage awaiting scheduling (no Interview record yet)
   * @returns {Promise<Array>} List of unscheduled application objects
   */
  async listUnscheduledApplications() {
    const response = await apiClient.post('/method/recruitrain_employer.api.interviews.list_unscheduled_applications', {});
    const rawData = response?.data || response?.message?.data || response?.message || [];
    return Array.isArray(rawData) ? rawData : [];
  },
};

export default interviewApi;
