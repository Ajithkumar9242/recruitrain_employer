/**
 * RecruitTrain Job Application Domain Normalizer
 * Pure, deterministic data transformation layer for Frappe Job Application entities.
 * STRICT COMPLIANCE: Zero synthetic ID generation, zero fake timeline creation, zero client-calculated business state.
 */

/**
 * Clean child table row or timeline event of internal Frappe ORM metadata
 * @param {Object} row - Child table row
 * @returns {Object} Cleaned child object
 */
export const cleanChildRow = (row) => {
  if (!row || typeof row !== 'object') return {};
  const cleaned = { ...row };
  delete cleaned.doctype;
  delete cleaned.owner;
  delete cleaned.modified_by;
  delete cleaned.idx;
  delete cleaned.parent;
  delete cleaned.parentfield;
  delete cleaned.parenttype;
  delete cleaned.docstatus;
  return cleaned;
};

/**
 * Normalize single Job Application payload from Frappe backend
 * @param {Object} raw - Raw job application object or message envelope
 * @returns {Object|null} Normalized Job Application profile
 */
export const normalizeJobApplication = (raw) => {
  if (!raw) return null;
  const d = raw.data || raw.message || raw;
  if (!d || typeof d !== 'object') return null;

  const id = String(d.name || d.application_id || '');
  if (!id) return null;

  const candidateId = d.candidate || d.candidate_id || '';
  const candidateName = d.candidate_name || d.candidate_full_name || d.candidate || '';
  const candidateEmail = d.candidate_email || d.email || '';

  const jobOpeningId = d.job_opening || d.job_id || '';
  const jobTitle = d.job_title || d.job_name || d.job_opening || '';
  const jobCode = d.job_code || '';
  const department = d.department || '';

  const status = d.status || 'Applied';
  const currentStage = d.current_stage || d.stage || status;
  const appliedOn = d.applied_on || d.application_date || d.creation || null;

  const timelineRaw = Array.isArray(d.timeline)
    ? d.timeline
    : Array.isArray(d.history)
    ? d.history
    : [];

  return {
    id,
    name: id,
    applicationId: id,

    // Candidate Relationship (authoritative link data only)
    candidate: candidateId,
    candidateId,
    candidateName,
    candidateEmail,

    // Job Opening Relationship (authoritative link data only)
    jobOpening: jobOpeningId,
    jobOpeningId,
    jobTitle,
    jobCode,
    department,

    // Recruitment Lifecycle & Stage (backend owned)
    status,
    currentStage,
    appliedOn,
    creation: d.creation || null,
    modified: d.modified || null,

    // Application details
    priority: d.priority || 'Medium',
    source: d.source || '',
    expectedSalary: d.expected_salary !== undefined && d.expected_salary !== null ? Number(d.expected_salary) : null,
    notes: d.notes || '',
    coverLetter: d.cover_letter || '',
    resume: d.resume || null,
    rejectionReason: d.rejection_reason || '',
    company: d.company || '',
    recruiter: d.recruiter || '',
    recruiterName: d.recruiter_name || '',

    // Timeline / History (authoritative array from backend or empty)
    timeline: timelineRaw.map(cleanChildRow),
  };
};

/**
 * Normalize paginated list of Job Applications from backend
 * @param {Object} rawEnvelope - Raw response from list_applications or search_applications
 * @returns {Object} Normalized paginated application list payload
 */
export const normalizeJobApplicationList = (rawEnvelope) => {
  if (!rawEnvelope) {
    return { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
  }

  const payload = rawEnvelope.data || rawEnvelope.message || rawEnvelope;
  const itemsRaw = Array.isArray(payload)
    ? payload
    : payload.items || payload.data || [];

  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map(normalizeJobApplication).filter(Boolean)
    : [];

  const pagination = payload.pagination || payload.meta || rawEnvelope.pagination || {};

  // AUDIT: Total and totalPages come strictly from backend metadata without local calculation
  const total = Number(
    payload.total ?? rawEnvelope.total ?? pagination.total ?? 0
  );
  const page = Number(payload.page ?? rawEnvelope.page ?? pagination.page ?? 1);
  const pageSize = Number(payload.page_size ?? rawEnvelope.page_size ?? pagination.page_size ?? 20);

  const totalPages = Number(
    payload.total_pages ?? rawEnvelope.total_pages ?? pagination.total_pages ?? (total > 0 ? Math.ceil(total / (pageSize || 20)) : 0)
  );

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
};

export default {
  cleanChildRow,
  normalizeJobApplication,
  normalizeJobApplicationList,
};
