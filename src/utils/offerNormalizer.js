/**
 * RecruitTrain Offer Domain Normalizer
 * Pure, deterministic data transformation layer for Frappe Offer entities.
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
 * Normalize single Offer payload from Frappe backend
 * @param {Object} raw - Raw offer object or message envelope
 * @returns {Object|null} Normalized Offer record
 */
export const normalizeOffer = (raw) => {
  if (!raw) return null;
  const d = raw.data || raw.message || raw;
  if (!d || typeof d !== 'object') return null;

  const id = String(d.name || d.offer_id || d.id || '');
  if (!id) return null;

  const offerName = d.offer_name || id;
  const candidateId = d.candidate || d.candidate_id || '';
  const jobApplicationId = d.job_application || d.application_id || '';
  const jobOpeningId = d.job_opening || d.job_id || '';
  const company = d.company || '';

  const offeredSalary = d.offered_salary !== undefined && d.offered_salary !== null ? Number(d.offered_salary) : 0;
  const currency = d.currency || 'USD';
  const joiningDate = d.joining_date || null;
  const probationPeriodMonths = d.probation_period_months !== undefined && d.probation_period_months !== null ? Number(d.probation_period_months) : 0;
  const offerDate = d.offer_date || null;
  const expiryDate = d.expiry_date || null;
  const responseDate = d.response_date || null;
  const employmentType = d.employment_type || '';
  const reportingManager = d.reporting_manager || '';
  const offerStatus = d.offer_status || d.status || 'Draft';
  const candidateRemarks = d.candidate_remarks || '';
  const offerLetter = d.offer_letter || '';
  const notes = d.notes || '';

  return {
    id,
    name: id,
    offerId: id,
    offerName,

    // Authoritative relationships derived by backend
    candidate: candidateId,
    candidateId,
    jobApplication: jobApplicationId,
    jobApplicationId,
    jobOpening: jobOpeningId,
    jobOpeningId,
    company,

    // Offer domain attributes
    offeredSalary,
    currency,
    joiningDate,
    probationPeriodMonths,
    offerDate,
    expiryDate,
    responseDate,
    employmentType,
    reportingManager,
    offerStatus,
    status: offerStatus,
    candidateRemarks,
    offerLetter,
    notes,

    // Timestamps
    creation: d.creation || null,
    modified: d.modified || null,
  };
};

/**
 * Normalize paginated list of Offers from backend
 * @param {Object} rawEnvelope - Raw response from list_offers or search_offers
 * @returns {Object} Normalized paginated offer list payload
 */
export const normalizeOfferList = (rawEnvelope) => {
  if (!rawEnvelope) {
    return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  const payload = rawEnvelope.data || rawEnvelope.message || rawEnvelope;
  const itemsRaw = Array.isArray(payload)
    ? payload
    : payload.items || payload.data || [];

  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map(normalizeOffer).filter(Boolean)
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
