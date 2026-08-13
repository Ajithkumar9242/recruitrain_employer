import apiClient from './apiClient';
import { normalizeOffer, normalizeOfferList } from '../utils/offerNormalizer';

/**
 * RecruitTrain Offer API Service
 * Authoritative Backend Integration with Frappe Offer Controller (recruitrain_employer.api.offers)
 * Architectural Rule: Backend is single source of truth. Company scope set by backend session context.
 */
export const offerApi = {
  /**
   * List company-scoped offers with server-side pagination and filters
   * @param {Object} params - { page, pageSize, offerStatus, jobApplication, candidate, jobOpening, orderBy, orderDir }
   * @returns {Promise<Object>} Normalized paginated offer list
   */
  async listOffers({
    page = 1,
    pageSize = 10,
    offerStatus = null,
    jobApplication = null,
    candidate = null,
    jobOpening = null,
    orderBy = 'creation',
    orderDir = 'desc',
  } = {}) {
    const payload = {
      page,
      page_size: pageSize,
      order_by: orderBy,
      order_dir: orderDir,
    };

    if (offerStatus) payload.offer_status = offerStatus;
    if (jobApplication) payload.job_application = jobApplication;
    if (candidate) payload.candidate = candidate;
    if (jobOpening) payload.job_opening = jobOpening;

    const response = await apiClient.post('/method/recruitrain_employer.api.offers.list_offers', payload);
    return normalizeOfferList(response);
  },

  /**
   * Search offers using backend search across fields
   * @param {Object} params - { search, page, pageSize, offerStatus, jobApplication, candidate, jobOpening, orderBy, orderDir }
   * @returns {Promise<Object>} Normalized search results
   */
  async searchOffers({
    search = '',
    page = 1,
    pageSize = 10,
    offerStatus = null,
    jobApplication = null,
    candidate = null,
    jobOpening = null,
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

    if (offerStatus) payload.offer_status = offerStatus;
    if (jobApplication) payload.job_application = jobApplication;
    if (candidate) payload.candidate = candidate;
    if (jobOpening) payload.job_opening = jobOpening;

    const response = await apiClient.post('/method/recruitrain_employer.api.offers.search_offers', payload);
    return normalizeOfferList(response);
  },

  /**
   * Retrieve a single Offer record by ID
   * @param {string} offerId - Primary key name / ID of Offer
   * @returns {Promise<Object>} Normalized Offer object
   */
  async getOffer(offerId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.offers.get_offer', {
      offer_id: offerId,
    });
    return normalizeOffer(response);
  },

  /**
   * Create a new Offer record
   * @param {Object} data - Offer payload
   * @returns {Promise<Object>} Normalized created offer
   */
  async createOffer(data) {
    const payload = {
      job_application: data.jobApplication || data.job_application,
      offered_salary: data.offeredSalary !== undefined && data.offeredSalary !== null ? Number(data.offeredSalary) : (data.offered_salary !== undefined ? Number(data.offered_salary) : undefined),
      currency: data.currency || 'USD',
      joining_date: data.joiningDate || data.joining_date,
      probation_period_months: data.probationPeriodMonths !== undefined && data.probationPeriodMonths !== null ? Number(data.probationPeriodMonths) : (data.probation_period_months !== undefined ? Number(data.probation_period_months) : undefined),
      offer_date: data.offerDate || data.offer_date,
      expiry_date: data.expiryDate || data.expiry_date,
      employment_type: data.employmentType || data.employment_type,
      reporting_manager: data.reportingManager || data.reporting_manager,
      candidate_remarks: data.candidateRemarks || data.candidate_remarks,
      offer_letter: data.offerLetter || data.offer_letter,
      notes: data.notes,
    };

    // Remove undefined values
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    const response = await apiClient.post('/method/recruitrain_employer.api.offers.create_offer', payload);
    return normalizeOffer(response);
  },

  /**
   * Update mutable fields of an existing Offer
   * @param {string} offerId - Offer ID
   * @param {Object} data - Updatable fields
   * @returns {Promise<Object>} Normalized updated offer
   */
  async updateOffer(offerId, data) {
    const payload = {
      offer_id: offerId,
    };

    if (data.offeredSalary !== undefined && data.offeredSalary !== null) payload.offered_salary = Number(data.offeredSalary);
    if (data.offered_salary !== undefined && data.offered_salary !== null) payload.offered_salary = Number(data.offered_salary);
    if (data.currency !== undefined) payload.currency = data.currency;
    if (data.joiningDate !== undefined) payload.joining_date = data.joiningDate;
    if (data.joining_date !== undefined) payload.joining_date = data.joining_date;
    if (data.probationPeriodMonths !== undefined && data.probationPeriodMonths !== null) payload.probation_period_months = Number(data.probationPeriodMonths);
    if (data.probation_period_months !== undefined && data.probation_period_months !== null) payload.probation_period_months = Number(data.probation_period_months);
    if (data.offerDate !== undefined) payload.offer_date = data.offerDate;
    if (data.offer_date !== undefined) payload.offer_date = data.offer_date;
    if (data.expiryDate !== undefined) payload.expiry_date = data.expiryDate;
    if (data.expiry_date !== undefined) payload.expiry_date = data.expiry_date;
    if (data.employmentType !== undefined) payload.employment_type = data.employmentType;
    if (data.employment_type !== undefined) payload.employment_type = data.employment_type;
    if (data.reportingManager !== undefined) payload.reporting_manager = data.reportingManager;
    if (data.reporting_manager !== undefined) payload.reporting_manager = data.reporting_manager;
    if (data.candidateRemarks !== undefined) payload.candidate_remarks = data.candidateRemarks;
    if (data.candidate_remarks !== undefined) payload.candidate_remarks = data.candidate_remarks;
    if (data.offerLetter !== undefined) payload.offer_letter = data.offerLetter;
    if (data.offer_letter !== undefined) payload.offer_letter = data.offer_letter;
    if (data.notes !== undefined) payload.notes = data.notes;

    const response = await apiClient.post('/method/recruitrain_employer.api.offers.update_offer', payload);
    return normalizeOffer(response);
  },

  /**
   * Transition status of an Offer generic method
   * @param {string} offerId - Offer ID
   * @param {string} newStatus - New status
   * @returns {Promise<Object>} Normalized updated offer object
   */
  async changeStatus(offerId, newStatus) {
    const payload = {
      offer_id: offerId,
      new_status: newStatus,
    };

    const response = await apiClient.post('/method/recruitrain_employer.api.offers.change_status', payload);
    return normalizeOffer(response);
  },

  /**
   * Workflow action: Send Offer
   * @param {string} offerId - Offer ID
   * @returns {Promise<Object>} Normalized updated offer object
   */
  async sendOffer(offerId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.offers.send_offer', {
      offer_id: offerId,
    });
    return normalizeOffer(response);
  },

  /**
   * Workflow action: Accept Offer
   * @param {string} offerId - Offer ID
   * @returns {Promise<Object>} Normalized updated offer object
   */
  async acceptOffer(offerId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.offers.accept_offer', {
      offer_id: offerId,
    });
    return normalizeOffer(response);
  },

  /**
   * Workflow action: Reject Offer
   * @param {string} offerId - Offer ID
   * @returns {Promise<Object>} Normalized updated offer object
   */
  async rejectOffer(offerId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.offers.reject_offer', {
      offer_id: offerId,
    });
    return normalizeOffer(response);
  },

  /**
   * Workflow action: Withdraw Offer
   * @param {string} offerId - Offer ID
   * @returns {Promise<Object>} Normalized updated offer object
   */
  async withdrawOffer(offerId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.offers.withdraw_offer', {
      offer_id: offerId,
    });
    return normalizeOffer(response);
  },

  /**
   * Delete an Offer record safely
   * @param {string} offerId - Offer ID
   * @returns {Promise<Object>} Confirmation payload
   */
  async deleteOffer(offerId) {
    const response = await apiClient.post('/method/recruitrain_employer.api.offers.delete_offer', {
      offer_id: offerId,
    });
    return response?.data || response?.message || response;
  },
};

export default offerApi;
