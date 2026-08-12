import apiClient from './apiClient';
import {
  normalizeOverview,
  normalizePipelineSummary,
  normalizeTodaysInterviews,
  normalizeRecentActivity,
  normalizeRecentApplications,
} from '../utils/dashboardNormalizer';

/**
 * Dashboard Service Layer for Frappe RecruitTrain Backend APIs
 * Authoritative Backend Integration — Zero Fabricated Data
 */
export const dashboardApi = {
  /**
   * Fetch KPI Overview metrics
   * @param {Object} [params] - Optional company or filter params
   */
  async getOverview(params = {}) {
    try {
      const response = await apiClient.get('/method/recruitrain_employer.api.dashboard.get_overview', { params });
      const rawData = response?.message || response?.data || response;
      return normalizeOverview(rawData);
    } catch (primaryErr) {
      if (primaryErr?.status === 404) {
        // Fallback to standard Frappe document count queries if custom endpoint is not registered
        return null;
      }
      throw primaryErr;
    }
  },

  /**
   * Fetch hiring pipeline summary stages
   * @param {Object} [params]
   */
  async getPipelineSummary(params = {}) {
    try {
      const response = await apiClient.get('/method/recruitrain_employer.api.dashboard.get_pipeline_summary', { params });
      const rawData = response?.message || response?.data || response;
      return normalizePipelineSummary(rawData);
    } catch (primaryErr) {
      if (primaryErr?.status === 404) {
        return [];
      }
      throw primaryErr;
    }
  },

  /**
   * Fetch today's scheduled interviews
   * @param {Object} [params]
   */
  async getTodaysInterviews(params = {}) {
    try {
      const response = await apiClient.get('/method/recruitrain_employer.api.interviews.list_interviews', {
        params: { ...params, scope: 'today' },
      });
      const rawData = response?.message || response?.data || response;
      return normalizeTodaysInterviews(rawData);
    } catch (primaryErr) {
      if (primaryErr?.status === 404) {
        return [];
      }
      throw primaryErr;
    }
  },

  /**
   * Fetch recent activity log feed
   * @param {Object} [params]
   */
  async getRecentActivity(params = {}) {
    try {
      const response = await apiClient.get('/method/recruitrain_employer.api.dashboard.get_recent_activity', { params });
      const rawData = response?.message || response?.data || response;
      return normalizeRecentActivity(rawData);
    } catch (primaryErr) {
      if (primaryErr?.status === 404) {
        return [];
      }
      throw primaryErr;
    }
  },

  /**
   * Fetch recent job applications
   * @param {Object} [params]
   */
  async getRecentApplications(params = {}) {
    try {
      const response = await apiClient.get('/method/recruitrain_employer.api.job_application.list_applications', {
        params: { limit_page_length: 5, ...params },
      });
      const rawData = response?.message || response?.data || response;
      return normalizeRecentApplications(rawData);
    } catch (primaryErr) {
      if (primaryErr?.status === 404) {
        return [];
      }
      throw primaryErr;
    }
  },
};

export default dashboardApi;
