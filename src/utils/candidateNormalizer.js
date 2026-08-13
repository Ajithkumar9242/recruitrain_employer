/**
 * RecruitTrain Candidate Domain Normalizer
 * Pure, deterministic data transformation layer for Frappe Candidate entities.
 * STRICT COMPLIANCE: Zero synthetic ID generation, zero fake fallback objects, zero client-calculated business logic.
 */

/**
 * Clean child table row of internal Frappe ORM metadata
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
  return cleaned;
};

/**
 * Normalize single Candidate profile payload from Frappe backend
 * @param {Object} raw - Raw candidate object or message envelope
 * @returns {Object|null} Normalized Candidate profile
 */
export const normalizeCandidate = (raw) => {
  if (!raw) return null;
  const d = raw.data || raw.message || raw;
  if (!d || typeof d !== 'object') return null;

  const id = String(d.name || d.candidate_id || d.id || '');
  if (!id) return null;

  const firstName = d.first_name || '';
  const middleName = d.middle_name || '';
  const lastName = d.last_name || '';
  const fullName =
    d.full_name ||
    [firstName, middleName, lastName].filter(Boolean).join(' ') ||
    d.candidate_name ||
    id;

  const city = d.city || '';
  const state = d.state || '';
  const country = d.country || '';
  const locationParts = [city, state, country].filter(Boolean);
  const locationDisplay =
    d.location_display || (locationParts.length > 0 ? locationParts.join(', ') : d.preferred_location || '');

  return {
    id,
    name: id,
    candidateId: id,
    candidateName: d.candidate_name || fullName,
    company: d.company || '',
    firstName,
    middleName,
    lastName,
    fullName,
    email: d.email || '',
    mobileNo: d.mobile_no || d.phone || d.mobile_number || '',
    alternateMobile: d.alternate_mobile || '',
    dateOfBirth: d.date_of_birth || null,
    gender: d.gender || '',
    nationality: d.nationality || '',
    maritalStatus: d.marital_status || '',

    // Social & Portfolios
    linkedin: d.linkedin || '',
    portfolio: d.portfolio || '',
    github: d.github || '',

    // Professional Profile
    profession: d.profession || '',
    employmentType: d.employment_type || '',
    currentJobTitle: d.current_job_title || '',
    currentCompany: d.current_company || '',
    yearsOfExperience: Number(d.years_of_experience || d.total_experience_years || 0),
    noticePeriod: Number(d.notice_period || 0),
    currentSalary: d.current_salary !== undefined && d.current_salary !== null ? Number(d.current_salary) : null,
    expectedSalary: d.expected_salary !== undefined && d.expected_salary !== null ? Number(d.expected_salary) : null,
    preferredLocation: d.preferred_location || '',

    // Address
    addressLine1: d.address_line_1 || '',
    addressLine2: d.address_line_2 || '',
    city,
    state,
    country,
    postalCode: d.postal_code || '',
    locationDisplay,

    // Status & Files
    status: d.status || 'Active',
    source: d.source || '',
    resume: d.resume || null,
    profileCompletion: Number(d.profile_completion ?? d.completeness ?? 0),

    // Passport & Visa
    passportNumber: d.passport_number || '',
    passportExpiry: d.passport_expiry || null,
    visaStatus: d.visa_status || '',
    workPermit: Boolean(d.work_permit),
    isInternational: Boolean(d.is_international),

    // Timestamps
    creation: d.creation || d.created_at || null,
    modified: d.modified || d.modified_at || null,

    // Child table arrays
    education: Array.isArray(d.education) ? d.education.map(cleanChildRow) : [],
    experience: Array.isArray(d.experience) ? d.experience.map(cleanChildRow) : [],
    skills: Array.isArray(d.skills) ? d.skills.map(cleanChildRow) : [],
    languages: Array.isArray(d.languages) ? d.languages.map(cleanChildRow) : [],
    certifications: Array.isArray(d.certifications) ? d.certifications.map(cleanChildRow) : [],
    documents: Array.isArray(d.documents) ? d.documents.map(cleanChildRow) : [],
  };
};

/**
 * Normalize paginated list of Candidates from backend
 * @param {Object} rawEnvelope - Raw response from list_candidates, search_candidates, list_domestic_candidates, list_international_candidates
 * @returns {Object} Normalized paginated candidate list payload
 */
export const normalizeCandidateList = (rawEnvelope) => {
  if (!rawEnvelope) {
    return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  const payload = rawEnvelope.data || rawEnvelope.message || rawEnvelope;
  const itemsRaw = Array.isArray(payload)
    ? payload
    : (payload.items || payload.data || []);

  const items = Array.isArray(itemsRaw) ? itemsRaw.map(normalizeCandidate).filter(Boolean) : [];

  const meta = payload.meta || payload.pagination || rawEnvelope.meta || rawEnvelope.pagination || {};

  // STRICT RULE: Total must come directly from backend metadata.
  // Do NOT fall back to items.length.
  const total = Number(
    payload.total ?? rawEnvelope.total ?? meta.total ?? 0
  );
  const page = Number(payload.page ?? rawEnvelope.page ?? meta.page ?? 1);
  const pageSize = Number(
    payload.page_size ?? rawEnvelope.page_size ?? meta.page_size ?? meta.pageSize ?? 10
  );

  const totalPages = Number(
    payload.total_pages ?? rawEnvelope.total_pages ?? meta.total_pages ?? meta.totalPages ?? (total > 0 ? Math.ceil(total / (pageSize || 10)) : 0)
  );

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
};

/**
 * Normalize profile completeness score from backend
 * @param {Object} rawEnvelope - Raw response from get_profile_completeness
 * @returns {Object} Normalized profile completeness object
 */
export const normalizeProfileCompleteness = (rawEnvelope) => {
  if (!rawEnvelope) return { score: 0, completeness: 0, fields: {} };
  const d = rawEnvelope.data || rawEnvelope.message || rawEnvelope;
  if (typeof d === 'number') {
    return { score: Number(d) || 0, completeness: Number(d) || 0, fields: {} };
  }
  if (typeof d === 'object' && d !== null) {
    return {
      score: Number(d.score ?? d.completeness ?? d.percentage ?? d.profile_completion ?? 0),
      completeness: Number(d.completeness ?? d.score ?? d.percentage ?? d.profile_completion ?? 0),
      fields: d.fields || d.details || {},
      missingFields: d.missing_fields || d.missingFields || [],
    };
  }
  return { score: 0, completeness: 0, fields: {} };
};

