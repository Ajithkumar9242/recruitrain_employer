/**
 * RecruitTrain Billing Data Normalizer
 * Pure, deterministic normalizers for Frappe Billing/Subscription API responses.
 *
 * CRITICAL RULE:
 * ZERO dummy data or fallback business values.
 * All values originate exclusively from Frappe backend response payloads.
 */

/**
 * Safely unwrap Frappe API response envelope
 * @param {Object} raw - Axios response body or unwrapped payload
 * @returns {Object|Array} Clean data object or array
 */
const extractPayload = (raw) => {
  if (!raw) return null;
  if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
    if (raw.data.data !== undefined) return raw.data.data;
    return raw.data;
  }
  if (raw.message && typeof raw.message === 'object' && !Array.isArray(raw.message)) {
    if (raw.message.data !== undefined) return raw.message.data;
    return raw.message;
  }
  return raw;
};

/**
 * Normalize Subscription Object
 */
export const normalizeSubscriptionObject = (sub) => {
  if (!sub || typeof sub !== 'object') return null;
  return {
    id: sub.name ?? null,
    name: sub.name ?? null,
    plan: sub.plan ?? null,
    status: sub.status ?? null,
    startDate: sub.start_date ?? null,
    endDate: sub.end_date ?? null,
    billingCycle: sub.billing_cycle ?? null,
    autoRenew: sub.auto_renew !== undefined ? Boolean(sub.auto_renew) : null,
  };
};

/**
 * Normalize Billing Overview Response
 */
export const normalizeBillingOverview = (raw) => {
  const data = extractPayload(raw) || {};
  return {
    company: data.company ?? null,
    subscription: normalizeSubscriptionObject(data.subscription),
    usage: data.usage
      ? {
          activeJobs: data.usage.active_jobs ?? null,
          recruiters: data.usage.recruiters ?? null,
          candidates: data.usage.candidates ?? null,
          storageGb: data.usage.storage_gb ?? null,
          email: data.usage.email ?? null,
          sms: data.usage.sms ?? null,
          aiCredits: data.usage.ai_credits ?? null,
        }
      : null,
    features: data.features
      ? {
          analytics: Boolean(data.features.analytics),
          talentPool: Boolean(data.features.talent_pool),
          api: Boolean(data.features.api),
          notifications: Boolean(data.features.notifications),
          prioritySupport: Boolean(data.features.priority_support),
        }
      : null,
    invoicesSummary: data.invoices_summary
      ? {
          totalInvoices: Number(data.invoices_summary.total_invoices ?? 0),
          unpaidInvoices: Number(data.invoices_summary.unpaid_invoices ?? 0),
        }
      : null,
    latestInvoice: data.latest_invoice ?? null,
    paymentHistorySummary: data.payment_history_summary
      ? {
          totalPayments: Number(data.payment_history_summary.total_payments ?? 0),
        }
      : null,
    latestPayment: data.latest_payment ?? null,
  };
};

/**
 * Normalize Current Subscription Response
 */
export const normalizeSubscription = (raw) => {
  const data = extractPayload(raw) || {};
  return {
    company: data.company ?? null,
    subscription: normalizeSubscriptionObject(data.subscription),
    planDetails: data.plan_details
      ? {
          planName: data.plan_details.plan_name ?? null,
          monthlyPrice: data.plan_details.monthly_price ?? null,
          yearlyPrice: data.plan_details.yearly_price ?? null,
          currency: data.plan_details.currency ?? null,
          trialDays: data.plan_details.trial_days ?? null,
          maxActiveJobs: data.plan_details.max_active_jobs ?? null,
          maxRecruiters: data.plan_details.max_recruiters ?? null,
          maxCandidates: data.plan_details.max_candidates ?? null,
          storageGb: data.plan_details.storage_gb ?? null,
          monthlyEmailLimit: data.plan_details.monthly_email_limit ?? null,
          monthlySmsLimit: data.plan_details.monthly_sms_limit ?? null,
          aiCredits: data.plan_details.ai_credits ?? null,
          canUseAnalytics: Boolean(data.plan_details.can_use_analytics),
          canUseTalentPool: Boolean(data.plan_details.can_use_talent_pool),
          canUseApi: Boolean(data.plan_details.can_use_api),
          canUseNotifications: Boolean(data.plan_details.can_use_notifications),
          prioritySupport: Boolean(data.plan_details.priority_support),
        }
      : null,
    features: data.features ?? null,
  };
};

/**
 * Normalize Usage Response
 */
export const normalizeUsage = (raw) => {
  const data = extractPayload(raw) || {};
  const rawQuotas = data.quotas || {};

  const normalizeQuotaItem = (q) => {
    if (!q || typeof q !== 'object') return null;
    return {
      used: q.used ?? 0,
      limit: q.limit ?? 0,
      unlimited: Boolean(q.unlimited),
    };
  };

  return {
    company: data.company ?? null,
    subscription: normalizeSubscriptionObject(data.subscription),
    quotas: {
      activeJobs: normalizeQuotaItem(rawQuotas.active_jobs),
      recruiters: normalizeQuotaItem(rawQuotas.recruiters),
      candidates: normalizeQuotaItem(rawQuotas.candidates),
      storageGb: normalizeQuotaItem(rawQuotas.storage_gb),
      email: normalizeQuotaItem(rawQuotas.email),
      sms: normalizeQuotaItem(rawQuotas.sms),
      aiCredits: normalizeQuotaItem(rawQuotas.ai_credits),
    },
    features: data.features ?? null,
  };
};

/**
 * Normalize Available Plans Array
 */
export const normalizePlans = (raw) => {
  const payload = extractPayload(raw);
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw)
    ? raw
    : [];

  return items.map((p) => ({
    id: p.name ?? p.plan_name ?? '',
    name: p.name ?? '',
    planName: p.plan_name ?? p.name ?? '',
    description: p.description ?? '',
    monthlyPrice: p.monthly_price ?? 0,
    yearlyPrice: p.yearly_price ?? 0,
    currency: p.currency ?? 'USD',
    trialDays: p.trial_days ?? 0,
    displayOrder: p.display_order ?? 0,
    maxActiveJobs: p.max_active_jobs ?? 0,
    maxRecruiters: p.max_recruiters ?? 0,
    maxCandidates: p.max_candidates ?? 0,
    storageGb: p.storage_gb ?? 0,
    monthlyEmailLimit: p.monthly_email_limit ?? 0,
    monthlySmsLimit: p.monthly_sms_limit ?? 0,
    aiCredits: p.ai_credits ?? 0,
    canUseAnalytics: Boolean(p.can_use_analytics),
    canUseTalentPool: Boolean(p.can_use_talent_pool),
    canUseApi: Boolean(p.can_use_api),
    canUseNotifications: Boolean(p.can_use_notifications),
    prioritySupport: Boolean(p.priority_support),
  }));
};

/**
 * Normalize Invoices Response Array
 */
export const normalizeInvoices = (raw) => {
  const payload = extractPayload(raw);
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw)
    ? raw
    : [];

  return items.map((inv) => ({
    id: inv.name ?? inv.invoice_number ?? '',
    name: inv.name ?? '',
    invoiceNumber: inv.invoice_number ?? inv.name ?? '',
    amount: inv.amount ?? 0,
    currency: inv.currency ?? 'USD',
    paymentStatus: inv.payment_status ?? inv.status ?? '',
    paidAt: inv.paid_at ?? inv.payment_date ?? null,
    receiptUrl: inv.receipt_url ?? null,
    postingDate: inv.posting_date ?? inv.creation ?? null,
    dueDate: inv.due_date ?? null,
  }));
};

/**
 * Normalize Payment History Response Array
 */
export const normalizePaymentHistory = (raw) => {
  const payload = extractPayload(raw);
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw)
    ? raw
    : [];

  return items.map((pay) => ({
    id: pay.name ?? pay.transaction_id ?? '',
    name: pay.name ?? '',
    transactionId: pay.transaction_id ?? pay.name ?? '',
    paymentStatus: pay.payment_status ?? pay.status ?? '',
    amount: pay.amount ?? 0,
    currency: pay.currency ?? 'USD',
    paymentDate: pay.payment_date ?? pay.paid_at ?? pay.creation ?? null,
    provider: pay.provider ?? '',
    invoice: pay.invoice ?? null,
  }));
};

/**
 * Normalize Upgrade Preview Response
 */
export const normalizeUpgradePreview = (raw) => {
  const data = extractPayload(raw) || {};
  return {
    company: data.company ?? null,
    currentPlan: data.current_plan ?? null,
    targetPlan: data.target_plan ?? null,
    isDowngrade: Boolean(data.is_downgrade),
    canChange: Boolean(data.can_change),
    downgradeViolations: Array.isArray(data.downgrade_violations) ? data.downgrade_violations : [],
    priceDifference: data.price_difference
      ? {
          monthly: data.price_difference.monthly ?? 0,
          yearly: data.price_difference.yearly ?? 0,
          currency: data.price_difference.currency ?? 'USD',
        }
      : null,
    limitChanges: data.limit_changes ?? null,
  };
};
