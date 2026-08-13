import { extractPayload } from '../services/normalizer';

/**
 * RecruitTrain Job Opening Domain Normalizer
 * Pure, deterministic data transformation layer for Frappe Job Opening entities.
 * STRICT COMPLIANCE: Zero random generators, zero fake IDs, zero derived recruitment lifecycle state.
 */

/**
 * Normalize single Job Opening payload from Frappe backend
 * @param {Object} raw - Raw job object or message envelope
 * @returns {Object} Normalized Job Opening profile
 */
export const normalizeJob = (raw) => {
  if (!raw) return null;
  const d = extractPayload(raw) || raw;

  const city = d.city || '';
  const state = d.state || '';
  const country = d.country || '';
  const locationParts = [city, state, country].filter(Boolean);
  const location =
    d.location || (locationParts.length > 0 ? locationParts.join(', ') : d.remote ? 'Remote' : '');

  const minSalary =
    d.minimum_salary !== undefined && d.minimum_salary !== null
      ? Number(d.minimum_salary)
      : d.salary_min !== undefined && d.salary_min !== null
      ? Number(d.salary_min)
      : null;

  const maxSalary =
    d.maximum_salary !== undefined && d.maximum_salary !== null
      ? Number(d.maximum_salary)
      : d.salary_max !== undefined && d.salary_max !== null
      ? Number(d.salary_max)
      : null;

  const keywordsStr = Array.isArray(d.keywords)
    ? d.keywords.join(', ')
    : typeof d.keywords === 'string'
    ? d.keywords
    : '';

  return {
    id: d.name || d.job_id || d.job_code,
    name: d.name || d.job_id || d.job_code,
    jobCode: d.job_code || d.name || '',
    jobTitle: d.job_title || '',
    company: d.company || '',
    department: d.department || '',
    profession: d.profession || '',
    employmentType: d.employment_type || '',
    industry: d.industry || '',
    numberOfOpenings: Number(d.number_of_openings ?? d.number_of_positions ?? 1),
    hiringManager: d.hiring_manager || '',
    recruiter: d.recruiter || '',
    targetJoiningDate: d.target_joining_date || null,
    closingDate: d.closing_date || null,
    minimumExperience: Number(d.minimum_experience ?? 0),
    maximumExperience: Number(d.maximum_experience ?? 0),

    // Phase 14.5 Compensation Fields
    compensationType: d.compensation_type || 'Salary Range',
    currency: d.currency || 'EUR',
    minimumSalary: minSalary,
    maximumSalary: maxSalary,
    salaryNegotiable: Boolean(d.salary_negotiable),
    tariffGroup: d.tariff_group || '',
    entgeltgruppe: d.entgeltgruppe || '',

    // Location & Workplace
    address: d.address || '',
    country,
    state,
    city,
    location,
    remote: Boolean(d.remote),
    hybrid: Boolean(d.hybrid),

    // Phase 14.5 Language Requirements & Candidate Preferences
    germanLevelRequired: d.german_level_required || '',
    englishLevelRequired: d.english_level_required || '',
    otherLanguageRequirements: d.other_language_requirements || '',
    allowInternationalCandidates: Boolean(d.allow_international_candidates),
    allowDomesticCandidates: Boolean(d.allow_domestic_candidates ?? 1),

    // Phase 14.5 Application Settings
    maxApplicantsLimit:
      d.max_applicants_limit !== undefined && d.max_applicants_limit !== null
        ? Number(d.max_applicants_limit)
        : null,
    autoCloseOnLimit: Boolean(d.auto_close_on_limit),
    keywords: keywordsStr,

    // Description & Content
    jobSummary: d.job_summary || d.description || '',
    responsibilities: d.responsibilities || '',
    requirements: d.requirements || '',
    benefits: d.benefits || '',

    // Status & Publishing
    status: d.status || 'Draft',
    published: Boolean(d.published),
    publishedAt: d.published_at || null,
    publishedBy: d.published_by || '',
    featuredJob: Boolean(d.featured_job),

    // Authoritative Backend Metrics (never calculated in React)
    applicationCount: Number(d.application_count ?? 0),
    shortlistedCount: Number(d.shortlisted_count ?? 0),
    interviewCount: Number(d.interview_count ?? 0),
    offerCount: Number(d.offer_count ?? 0),
    hiredCount: Number(d.hired_count ?? 0),
    rejectedCount: Number(d.rejected_count ?? 0),

    // Metadata
    creation: d.creation || null,
    modified: d.modified || null,
  };
};

/**
 * Normalize paginated list of Job Openings from backend
 * @param {Object} rawEnvelope - Raw response from list_jobs or search_jobs
 * @returns {Object} Normalized paginated job list payload
 */
export const normalizeJobList = (rawEnvelope) => {
  if (!rawEnvelope) {
    return { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
  }

  // Handle various wrapper shapes from Frappe API (data, message, response)
  const root = rawEnvelope.message?.data || rawEnvelope.message || rawEnvelope.data?.data || rawEnvelope.data || rawEnvelope;
  const itemsRaw = root.items || root.data || (Array.isArray(root) ? root : []);
  const items = Array.isArray(itemsRaw) ? itemsRaw.map(normalizeJob) : [];

  const pagination = root.pagination || root.meta || rawEnvelope.meta || {};

  // AUDIT: Do NOT use items.length as a fallback for total.
  const total = Number(
    root.total ?? rawEnvelope.total ?? pagination.total ?? 0
  );
  const page = Number(root.page ?? rawEnvelope.page ?? pagination.page ?? 1);
  const pageSize = Number(root.page_size ?? rawEnvelope.page_size ?? pagination.page_size ?? 20);

  const totalPages = Number(
    root.total_pages ?? rawEnvelope.total_pages ?? pagination.total_pages ?? (total > 0 ? Math.ceil(total / (pageSize || 20)) : 0)
  );

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
};
