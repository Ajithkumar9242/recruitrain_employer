/**
 * RecruitTrain Analytics Data Normalizer
 * Pure, deterministic, presentation-oriented normalizers for Frappe Analytics API responses.
 *
 * CRITICAL RULE:
 * Must NEVER calculate metrics, rates, averages, percentages, or totals in React.
 * All authoritative metric values come directly from Frappe backend response payloads.
 */

/**
 * Unwrap Frappe API response envelope safely.
 * @param {Object} raw - Axios response body or unwrapped payload
 * @returns {Object|Array} Clean data object or array
 */

const extractPayload = (raw) => {
  if (!raw) return {};
  if (raw.data && typeof raw.data === 'object') {
    if (raw.data.data) return raw.data.data;
    return raw.data;
  }
  if (raw.message && typeof raw.message === 'object') {
    if (raw.message.data) return raw.message.data;
    return raw.message;
  }
  return raw;
};

/**
 * Normalize get_overview response
 * Backend keys: open_jobs, total_jobs, total_candidates, total_applications,
 * active_applications, todays_interviews, total_interviews, pending_offers,
 * accepted_offers, total_hires, rejected_applications
 */
export const normalizeOverview = (raw) => {
  const data = extractPayload(raw) || {};
  return {
    openJobs: Number(data.open_jobs ?? 0),
    totalJobs: Number(data.total_jobs ?? 0),
    totalCandidates: Number(data.total_candidates ?? 0),
    totalApplications: Number(data.total_applications ?? 0),
    activeApplications: Number(data.active_applications ?? 0),
    todaysInterviews: Number(data.todays_interviews ?? 0),
    totalInterviews: Number(data.total_interviews ?? 0),
    pendingOffers: Number(data.pending_offers ?? 0),
    acceptedOffers: Number(data.accepted_offers ?? 0),
    totalHires: Number(data.total_hires ?? 0),
    rejectedApplications: Number(data.rejected_applications ?? 0),
  };
};

/**
 * Normalize get_funnel response
 * Backend keys: funnel (dict), total (int), conversion_rates (dict)
 */
export const normalizeFunnel = (raw) => {
  const data = extractPayload(raw) || {};
  const rawFunnel = data.funnel && typeof data.funnel === 'object' ? data.funnel : {};
  const rawRates = data.conversion_rates && typeof data.conversion_rates === 'object' ? data.conversion_rates : {};

  // Standard stage order matching backend
  const stages = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'];

  const funnel = {};
  const conversionRates = {};

  stages.forEach((stage) => {
    funnel[stage] = Number(rawFunnel[stage] ?? 0);
    conversionRates[stage] = Number(rawRates[stage] ?? 0);
  });

  return {
    funnel,
    total: Number(data.total ?? 0),
    conversionRates,
  };
};

/**
 * Normalize get_trends response
 * Backend returns list of dicts: [{ period: "2026-08", count: 12 }, ...]
 */
export const normalizeTrends = (raw) => {
  const data = extractPayload(raw);
  const items = Array.isArray(data) ? data : Array.isArray(data?.trends) ? data.trends : [];

  return items.map((item) => ({
    period: String(item?.period ?? ''),
    count: Number(item?.count ?? 0),
  }));
};

/**
 * Normalize get_job_metrics response
 * Backend keys: by_status, total_jobs, open_jobs, filled_jobs, closed_jobs, total_openings, applications_per_job
 */
export const normalizeJobMetrics = (raw) => {
  const data = extractPayload(raw) || {};
  const rawStatus = data.by_status && typeof data.by_status === 'object' ? data.by_status : {};
  const rawApps = Array.isArray(data.applications_per_job) ? data.applications_per_job : [];

  return {
    byStatus: {
      Draft: Number(rawStatus.Draft ?? 0),
      Open: Number(rawStatus.Open ?? 0),
      Paused: Number(rawStatus.Paused ?? 0),
      Closed: Number(rawStatus.Closed ?? 0),
      Filled: Number(rawStatus.Filled ?? 0),
      Cancelled: Number(rawStatus.Cancelled ?? 0),
    },
    totalJobs: Number(data.total_jobs ?? 0),
    openJobs: Number(data.open_jobs ?? 0),
    filledJobs: Number(data.filled_jobs ?? 0),
    closedJobs: Number(data.closed_jobs ?? 0),
    totalOpenings: Number(data.total_openings ?? 0),
    applicationsPerJob: rawApps.map((item) => ({
      jobOpening: String(item.job_opening ?? ''),
      jobTitle: String(item.job_title ?? item.job_opening ?? ''),
      jobCode: String(item.job_code ?? ''),
      status: String(item.status ?? ''),
      openings: Number(item.openings ?? 0),
      applicationsCount: Number(item.applications_count ?? 0),
    })),
  };
};

/**
 * Normalize get_application_metrics response
 * Backend keys: by_status, by_stage, by_source, by_priority, total_applications
 */
export const normalizeApplicationMetrics = (raw) => {
  const data = extractPayload(raw) || {};
  return {
    byStatus: data.by_status && typeof data.by_status === 'object' ? data.by_status : {},
    byStage: data.by_stage && typeof data.by_stage === 'object' ? data.by_stage : {},
    bySource: data.by_source && typeof data.by_source === 'object' ? data.by_source : {},
    byPriority: data.by_priority && typeof data.by_priority === 'object' ? data.by_priority : {},
    totalApplications: Number(data.total_applications ?? 0),
  };
};

/**
 * Normalize get_interview_metrics response
 * Backend keys: by_status, by_type, by_result, total_interviews
 */
export const normalizeInterviewMetrics = (raw) => {
  const data = extractPayload(raw) || {};
  return {
    byStatus: data.by_status && typeof data.by_status === 'object' ? data.by_status : {},
    byType: data.by_type && typeof data.by_type === 'object' ? data.by_type : {},
    byResult: data.by_result && typeof data.by_result === 'object' ? data.by_result : {},
    totalInterviews: Number(data.total_interviews ?? 0),
  };
};

/**
 * Normalize get_offer_metrics response
 * Backend keys: by_status, total_offers, accepted_offers, acceptance_rate, total_offered_salary
 */
export const normalizeOfferMetrics = (raw) => {
  const data = extractPayload(raw) || {};
  const rawStatus = data.by_status && typeof data.by_status === 'object' ? data.by_status : {};

  return {
    byStatus: {
      Draft: Number(rawStatus.Draft ?? 0),
      Sent: Number(rawStatus.Sent ?? 0),
      Accepted: Number(rawStatus.Accepted ?? 0),
      Rejected: Number(rawStatus.Rejected ?? 0),
      Expired: Number(rawStatus.Expired ?? 0),
      Withdrawn: Number(rawStatus.Withdrawn ?? 0),
    },
    totalOffers: Number(data.total_offers ?? 0),
    acceptedOffers: Number(data.accepted_offers ?? 0),
    acceptanceRate: Number(data.acceptance_rate ?? 0),
    totalOfferedSalary: Number(data.total_offered_salary ?? 0),
  };
};

/**
 * Normalize get_time_to_hire response
 * Backend keys: avg_days, min_days, max_days, total_hires
 */
export const normalizeTimeToHire = (raw) => {
  const data = extractPayload(raw) || {};
  return {
    avgDays: Number(data.avg_days ?? 0),
    minDays: Number(data.min_days ?? 0),
    maxDays: Number(data.max_days ?? 0),
    totalHires: Number(data.total_hires ?? 0),
  };
};

/**
 * Normalize get_recent_activity response
 * Backend keys: data (array), page, page_size, total, total_pages
 */
export const normalizeRecentActivity = (raw) => {
  const payload = extractPayload(raw) || {};
  const items = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw)
    ? raw
    : [];

  const page = Number(payload.page ?? raw?.page ?? 1);
  const pageSize = Number(payload.page_size ?? raw?.page_size ?? 10);
  const total = Number(payload.total ?? raw?.total ?? items.length);
  const totalPages = Math.ceil(total / (pageSize || 1)) || 1;

  const normalizedItems = items.map((item) => ({
    doctype: String(item.doctype ?? ''),
    name: String(item.name ?? ''),
    title: String(item.title ?? item.name ?? ''),
    action: String(item.action ?? ''),
    modified: String(item.modified ?? item.creation ?? ''),
  }));

  return {
    items: normalizedItems,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
};

/**
 * Normalize full get_analytics response
 * Backend keys: overview, funnel, trends, jobs, applications, interviews, offers, time_to_hire
 */
export const normalizeFullAnalytics = (raw) => {
  const data = extractPayload(raw) || {};
  return {
    overview: normalizeOverview(data.overview),
    funnel: normalizeFunnel(data.funnel),
    trends: normalizeTrends(data.trends),
    jobMetrics: normalizeJobMetrics(data.jobs),
    applicationMetrics: normalizeApplicationMetrics(data.applications),
    interviewMetrics: normalizeInterviewMetrics(data.interviews),
    offerMetrics: normalizeOfferMetrics(data.offers),
    timeToHire: normalizeTimeToHire(data.time_to_hire),
  };
};
