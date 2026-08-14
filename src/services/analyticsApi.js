import apiClient from './apiClient';
import {
  normalizeOverview,
  normalizeFunnel,
  normalizeTrends,
  normalizeJobMetrics,
  normalizeApplicationMetrics,
  normalizeInterviewMetrics,
  normalizeOfferMetrics,
  normalizeTimeToHire,
  normalizeRecentActivity,
  normalizeFullAnalytics,
} from '../utils/analyticsNormalizer';

/**
 * RecruitTrain Analytics API Service
 * Authoritative Backend Integration with Frappe Analytics Controller (recruitrain_employer.api.analytics)
 * Strictly Thin Client: Backend is the single source of truth for all business calculations.
 * Company scope is handled exclusively by backend session context.
 */
export const analyticsApi = {
  /**
   * Fetch full analytics dataset from get_analytics endpoint
   * GET /api/method/recruitrain_employer.api.analytics.get_analytics
   * @param {Object} params - { jobOpening, fromDate, toDate, granularity }
   * @returns {Promise<Object>} Full normalized analytics payload
   */
  async getAnalytics({ jobOpening = null, fromDate = null, toDate = null, granularity = 'monthly' } = {}) {
    const params = { granularity };
    if (jobOpening) params.job_opening = jobOpening;
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;

    const response = await apiClient.get('/method/recruitrain_employer.api.analytics.get_analytics', { params });
    return normalizeFullAnalytics(response);
  },
  /**
   * Fetch top-level KPI overview metrics
   * @param {Object} params - { fromDate, toDate }
   * @returns {Promise<Object>} Normalized Overview object
   */
  async getOverview({ fromDate = null, toDate = null } = {}) {
    const payload = {};
    if (fromDate) payload.from_date = fromDate;
    if (toDate) payload.to_date = toDate;

    const response = await apiClient.post(
      '/method/recruitrain_employer.api.analytics.get_overview',
      payload
    );
    return normalizeOverview(response);
  },

  /**
   * Fetch recruitment funnel breakdown and stage conversion rates
   * @param {Object} params - { jobOpening, fromDate, toDate }
   * @returns {Promise<Object>} Normalized Funnel object
   */
  async getFunnel({ jobOpening = null, fromDate = null, toDate = null } = {}) {
    const payload = {};
    if (jobOpening) payload.job_opening = jobOpening;
    if (fromDate) payload.from_date = fromDate;
    if (toDate) payload.to_date = toDate;

    const response = await apiClient.post(
      '/method/recruitrain_employer.api.analytics.get_funnel',
      payload
    );
    return normalizeFunnel(response);
  },

  /**
   * Fetch application time-series trends
   * @param {Object} params - { jobOpening, granularity, fromDate, toDate }
   * @returns {Promise<Array>} Normalized Trends array
   */
  async getTrends({
    jobOpening = null,
    granularity = 'monthly',
    fromDate = null,
    toDate = null,
  } = {}) {
    const payload = { granularity };
    if (jobOpening) payload.job_opening = jobOpening;
    if (fromDate) payload.from_date = fromDate;
    if (toDate) payload.to_date = toDate;

    const response = await apiClient.post(
      '/method/recruitrain_employer.api.analytics.get_trends',
      payload
    );
    return normalizeTrends(response);
  },

  /**
   * Fetch job performance metrics and applications per job
   * @param {Object} params - { fromDate, toDate }
   * @returns {Promise<Object>} Normalized Job Metrics object
   */
  async getJobMetrics({ fromDate = null, toDate = null } = {}) {
    const payload = {};
    if (fromDate) payload.from_date = fromDate;
    if (toDate) payload.to_date = toDate;

    const response = await apiClient.post(
      '/method/recruitrain_employer.api.analytics.get_job_metrics',
      payload
    );
    return normalizeJobMetrics(response);
  },

  /**
   * Fetch job application metrics by status, stage, source, priority
   * @param {Object} params - { jobOpening, fromDate, toDate }
   * @returns {Promise<Object>} Normalized Application Metrics object
   */
  async getApplicationMetrics({ jobOpening = null, fromDate = null, toDate = null } = {}) {
    const payload = {};
    if (jobOpening) payload.job_opening = jobOpening;
    if (fromDate) payload.from_date = fromDate;
    if (toDate) payload.to_date = toDate;

    const response = await apiClient.post(
      '/method/recruitrain_employer.api.analytics.get_application_metrics',
      payload
    );
    return normalizeApplicationMetrics(response);
  },

  /**
   * Fetch interview metrics by status, type, result
   * @param {Object} params - { jobOpening, fromDate, toDate }
   * @returns {Promise<Object>} Normalized Interview Metrics object
   */
  async getInterviewMetrics({ jobOpening = null, fromDate = null, toDate = null } = {}) {
    const payload = {};
    if (jobOpening) payload.job_opening = jobOpening;
    if (fromDate) payload.from_date = fromDate;
    if (toDate) payload.to_date = toDate;

    const response = await apiClient.post(
      '/method/recruitrain_employer.api.analytics.get_interview_metrics',
      payload
    );
    return normalizeInterviewMetrics(response);
  },

  /**
   * Fetch offer metrics including status distribution and acceptance rate
   * @param {Object} params - { jobOpening, fromDate, toDate }
   * @returns {Promise<Object>} Normalized Offer Metrics object
   */
  async getOfferMetrics({ jobOpening = null, fromDate = null, toDate = null } = {}) {
    const payload = {};
    if (jobOpening) payload.job_opening = jobOpening;
    if (fromDate) payload.from_date = fromDate;
    if (toDate) payload.to_date = toDate;

    const response = await apiClient.post(
      '/method/recruitrain_employer.api.analytics.get_offer_metrics',
      payload
    );
    return normalizeOfferMetrics(response);
  },

  /**
   * Fetch average time-to-hire in days
   * @param {Object} params - { jobOpening, department, fromDate, toDate }
   * @returns {Promise<Object>} Normalized Time to Hire object
   */
  async getTimeToHire({
    jobOpening = null,
    department = null,
    fromDate = null,
    toDate = null,
  } = {}) {
    const payload = {};
    if (jobOpening) payload.job_opening = jobOpening;
    if (department) payload.department = department;
    if (fromDate) payload.from_date = fromDate;
    if (toDate) payload.to_date = toDate;

    const response = await apiClient.post(
      '/method/recruitrain_employer.api.analytics.get_time_to_hire',
      payload
    );
    return normalizeTimeToHire(response);
  },

  /**
   * Fetch paginated recent activity stream
   * @param {Object} params - { entity, page, pageSize }
   * @returns {Promise<Object>} Normalized Recent Activity payload
   */
  async getRecentActivity({ entity = null, page = 1, pageSize = 10 } = {}) {
    const payload = {
      page,
      page_size: pageSize,
    };
    if (entity) payload.entity = entity;

    const response = await apiClient.post(
      '/method/recruitrain_employer.api.analytics.get_recent_activity',
      payload
    );
    return normalizeRecentActivity(response);
  },
};

export default analyticsApi;
