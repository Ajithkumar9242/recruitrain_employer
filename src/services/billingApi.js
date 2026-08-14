import apiClient from './apiClient';
import {
  normalizeBillingOverview,
  normalizeSubscription,
  normalizeUsage,
  normalizePlans,
  normalizeInvoices,
  normalizePaymentHistory,
  normalizeUpgradePreview,
} from '../utils/billingNormalizer';

/**
 * RecruitTrain Billing API Service
 * Authoritative Backend Integration with Frappe Subscription Controller (recruitrain_employer.api.subscription)
 * Strictly Thin Client: Backend is single source of truth.
 * Company scope is determined exclusively by the authenticated Frappe session.
 */
export const billingApi = {
  /**
   * GET /api/method/recruitrain_employer.api.subscription.get_billing_overview
   * @returns {Promise<Object>} Normalized Billing Overview payload
   */
  async getBillingOverview() {
    const response = await apiClient.get('/method/recruitrain_employer.api.subscription.get_billing_overview');
    return normalizeBillingOverview(response);
  },

  /**
   * GET /api/method/recruitrain_employer.api.subscription.get_current_subscription
   * @returns {Promise<Object>} Normalized Subscription payload
   */
  async getCurrentSubscription() {
    const response = await apiClient.get('/method/recruitrain_employer.api.subscription.get_current_subscription');
    return normalizeSubscription(response);
  },

  /**
   * GET /api/method/recruitrain_employer.api.subscription.get_usage
   * @returns {Promise<Object>} Normalized Usage payload
   */
  async getUsage() {
    const response = await apiClient.get('/method/recruitrain_employer.api.subscription.get_usage');
    return normalizeUsage(response);
  },

  /**
   * GET /api/method/recruitrain_employer.api.subscription.get_available_plans
   * @returns {Promise<Array>} Normalized Plans array
   */
  async getAvailablePlans() {
    const response = await apiClient.get('/method/recruitrain_employer.api.subscription.get_available_plans');
    return normalizePlans(response);
  },

  /**
   * POST /api/method/recruitrain_employer.api.subscription.upgrade_preview
   * @param {Object|string} payload - { new_plan_name } or plan name string
   * @returns {Promise<Object>} Normalized Upgrade Preview payload
   */
  async upgradePreview(payload) {
    const planName = typeof payload === 'string' ? payload : payload?.new_plan_name || payload?.newPlanName || payload?.plan_name || payload?.name;
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.subscription.upgrade_preview',
      { new_plan_name: planName }
    );
    return normalizeUpgradePreview(response);
  },

  /**
   * GET /api/method/recruitrain_employer.api.subscription.get_invoices
   * @returns {Promise<Array>} Normalized Invoices array
   */
  async getInvoices() {
    const response = await apiClient.get('/method/recruitrain_employer.api.subscription.get_invoices');
    return normalizeInvoices(response);
  },

  /**
   * GET /api/method/recruitrain_employer.api.subscription.get_payment_history
   * @returns {Promise<Array>} Normalized Payment History array
   */
  async getPaymentHistory() {
    const response = await apiClient.get('/method/recruitrain_employer.api.subscription.get_payment_history');
    return normalizePaymentHistory(response);
  },
};

export default billingApi;
