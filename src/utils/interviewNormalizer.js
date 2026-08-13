/**
 * RecruitTrain Interview Domain Normalizer
 * Pure, deterministic data transformation layer for Frappe Interview entities.
 * STRICT COMPLIANCE: Zero synthetic ID generation, zero fake fallback objects, zero client-calculated status logic.
 */

/**
 * Clean object of internal Frappe ORM metadata fields
 * @param {Object} row - Object or child table row
 * @returns {Object} Cleaned object
 */
export const cleanFrappeMetadata = (row) => {
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
 * Normalize single Interview payload from Frappe backend
 * @param {Object} raw - Raw interview object or message envelope
 * @returns {Object|null} Normalized Interview profile
 */
export const normalizeInterview = (raw) => {
  if (!raw) return null;
  const d = raw.data || raw.message || raw;
  if (!d || typeof d !== 'object') return null;

  const id = String(d.name || d.interview_id || '');
  if (!id) return null;

  const interviewName = d.interview_name || id;
  const candidateId = d.candidate || d.candidate_id || '';
  const jobOpeningId = d.job_opening || d.job_id || '';
  const jobApplicationId = d.job_application || d.application_id || '';

  const interviewType = d.interview_type || 'Technical';
  const scheduledOn = d.scheduled_on || d.creation || null;
  const duration = d.duration !== undefined && d.duration !== null ? Number(d.duration) : 0;
  const location = d.location || '';
  const meetingLink = d.meeting_link || '';
  const interviewer = d.interviewer || '';
  const recruiter = d.recruiter || '';
  const result = d.result || '';
  const status = d.status || 'Scheduled';
  const remarks = d.remarks || '';
  const company = d.company || '';

  return {
    id,
    name: id,
    interviewId: id,
    interviewName,

    // Authoritative foreign references (links owned by source domains)
    candidate: candidateId,
    candidateId,
    jobOpening: jobOpeningId,
    jobOpeningId,
    jobApplication: jobApplicationId,
    jobApplicationId,

    // Interview domain specific attributes
    interviewType,
    scheduledOn,
    duration,
    location,
    meetingLink,
    interviewer,
    recruiter,
    result,
    status,
    remarks,
    company,

    // Timestamps
    creation: d.creation || null,
    modified: d.modified || null,
  };
};

/**
 * Normalize paginated list of Interviews from backend
 * @param {Object} rawEnvelope - Raw response from list_interviews or search_interviews
 * @returns {Object} Normalized paginated interview list payload
 */
export const normalizeInterviewList = (rawEnvelope) => {
  if (!rawEnvelope) {
    return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  const payload = rawEnvelope.data || rawEnvelope.message || rawEnvelope;
  const itemsRaw = Array.isArray(payload)
    ? payload
    : payload.items || payload.data || [];

  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map(normalizeInterview).filter(Boolean)
    : [];

  const pagination = payload.pagination || payload.meta || rawEnvelope.pagination || {};

  // STRICT RULE: Total must come directly from backend response.
  // Do NOT fallback to items.length.
  const total = Number(
    payload.total ?? rawEnvelope.total ?? pagination.total ?? 0
  );
  const page = Number(payload.page ?? rawEnvelope.page ?? pagination.page ?? 1);
  const pageSize = Number(payload.page_size ?? rawEnvelope.page_size ?? pagination.page_size ?? 10);

  const totalPages = Number(
    payload.total_pages ?? rawEnvelope.total_pages ?? pagination.total_pages ?? (total > 0 ? Math.ceil(total / (pageSize || 10)) : 0)
  );

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
};
