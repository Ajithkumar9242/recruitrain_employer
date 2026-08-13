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

  // Iteratively unpack nested response envelopes from Frappe
  let d = raw;
  if (d && typeof d === 'object' && d.message && typeof d.message === 'object') {
    d = d.message;
  }
  if (d && typeof d === 'object' && d.data && typeof d.data === 'object') {
    d = d.data;
  }
  if (d && typeof d === 'object' && d.data && typeof d.data === 'object') {
    d = d.data;
  }
  if (!d || typeof d !== 'object') return null;

  const id = String(d.name || d.interview_name || d.interview_id || d.id || '');
  if (!id) return null;

  // Candidate extraction
  let candidateId = '';
  let candidateName = '';
  let candidateEmail = '';
  let candidateMobile = '';

  if (d.candidate && typeof d.candidate === 'object') {
    candidateId = d.candidate.name || d.candidate.id || d.candidate_id || '';
    candidateName = d.candidate.candidate_name || d.candidate.full_name ||
      (d.candidate.first_name ? `${d.candidate.first_name} ${d.candidate.last_name || ''}`.trim() : '');
    candidateEmail = d.candidate.email || '';
    candidateMobile = d.candidate.mobile || d.candidate.phone || '';
  } else if (typeof d.candidate === 'string') {
    candidateId = d.candidate;
  }
  if (!candidateId) candidateId = d.candidate_id || '';
  if (!candidateName) candidateName = d.candidate_name || d.applicant_name || d.candidate_title || '';
  if (!candidateEmail) candidateEmail = d.candidate_email || d.email || '';

  // Job Opening extraction
  let jobOpeningId = '';
  let jobOpeningTitle = '';

  if (d.job_opening && typeof d.job_opening === 'object') {
    jobOpeningId = d.job_opening.name || d.job_opening.id || d.job_id || '';
    jobOpeningTitle = d.job_opening.job_title || d.job_opening.title || '';
  } else if (typeof d.job_opening === 'string') {
    jobOpeningId = d.job_opening;
  }
  if (!jobOpeningId) jobOpeningId = d.job_id || d.job_opening_id || '';
  if (!jobOpeningTitle) jobOpeningTitle = d.job_title || d.job_opening_title || d.position || '';

  // Job Application extraction
  let jobApplicationId = '';
  let currentStage = '';
  let applicationStatus = '';

  if (d.job_application && typeof d.job_application === 'object') {
    jobApplicationId = d.job_application.name || d.job_application.id || d.application_id || '';
    currentStage = d.job_application.current_stage || d.job_application.currentStage || '';
    applicationStatus = d.job_application.status || '';
  } else if (typeof d.job_application === 'string') {
    jobApplicationId = d.job_application;
  }
  if (!jobApplicationId) jobApplicationId = d.application_id || d.job_application_id || '';
  if (!currentStage) currentStage = d.current_stage || d.currentStage || '';
  if (!applicationStatus) applicationStatus = d.application_status || '';

  const interviewType = d.interview_type || 'Technical';
  const scheduledOn = d.scheduled_on || d.creation || null;
  const duration = d.duration !== undefined && d.duration !== null ? Number(d.duration) : 0;
  const location = d.location || '';
  const meetingLink = d.meeting_link || '';
  const interviewer = d.interviewer || '';
  const recruiter = d.recruiter || '';
  const result = d.result || 'Pending';
  const status = d.status || 'Scheduled';
  const remarks = d.remarks || '';
  const company = d.company || '';

  return {
    id,
    name: id,
    interviewId: id,
    interviewName: id,
    interview_name: id,

    // Authoritative foreign references
    candidate: candidateId,
    candidateId,
    candidateName,
    candidateEmail,
    candidateMobile,

    jobOpening: jobOpeningId,
    jobOpeningId,
    jobOpeningTitle,
    job_opening: jobOpeningId,

    jobApplication: jobApplicationId,
    jobApplicationId,
    job_application: jobApplicationId,
    currentStage,
    applicationStatus,

    // Attributes
    interviewType,
    interview_type: interviewType,
    scheduledOn,
    scheduled_on: scheduledOn,
    duration,
    location,
    meetingLink,
    meeting_link: meetingLink,
    interviewer,
    recruiter,
    result,
    status,
    remarks,
    company,

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

  let payload = rawEnvelope;
  if (payload && typeof payload === 'object' && payload.message && typeof payload.message === 'object' && !Array.isArray(payload.message)) {
    payload = payload.message;
  }
  if (payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    payload = payload.data;
  }

  const itemsRaw = Array.isArray(payload)
    ? payload
    : payload.items || payload.data || [];

  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map(normalizeInterview).filter(Boolean)
    : [];

  const pagination = payload.pagination || payload.meta || rawEnvelope.pagination || {};

  const total = Number(
    payload.total ?? rawEnvelope.total ?? pagination.total ?? items.length ?? 0
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
