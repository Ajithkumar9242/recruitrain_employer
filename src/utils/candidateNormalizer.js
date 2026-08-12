/**
 * RecruitTrain Candidate Domain Normalizer
 * Pure, deterministic data transformation layer for Frappe Candidate entities.
 * STRICT COMPLIANCE: Zero random generators, zero fake IDs, zero derived recruitment lifecycle state.
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
 * @returns {Object} Normalized Candidate profile
 */
export const normalizeCandidate = (raw) => {
  if (!raw) return null;
  const d = raw.data || raw.message || raw;

  const firstName = d.first_name || '';
  const middleName = d.middle_name || '';
  const lastName = d.last_name || '';
  const fullName =
    d.full_name ||
    [firstName, middleName, lastName].filter(Boolean).join(' ') ||
    d.candidate_name ||
    d.name ||
    '';

  const city = d.city || '';
  const state = d.state || '';
  const country = d.country || '';
  const locationParts = [city, state, country].filter(Boolean);
  const locationDisplay =
    d.location_display || (locationParts.length > 0 ? locationParts.join(', ') : d.preferred_location || '');

  return {
    id: d.name || d.candidate_id,
    name: d.name || d.candidate_id,
    candidateId: d.candidate_id || d.name,
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
    profileCompletion: Number(d.profile_completion || 0),

    // Passport & Visa
    passportNumber: d.passport_number || '',
    passportExpiry: d.passport_expiry || null,
    visaStatus: d.visa_status || '',
    workPermit: Boolean(d.work_permit),
    isInternational: Boolean(d.is_international),

    // Timestamps
    creation: d.creation || null,
    modified: d.modified || null,

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
 * @param {Object} rawEnvelope - Raw response from list_candidates
 * @returns {Object} Normalized paginated candidate list payload
 */
export const normalizeCandidateList = (rawEnvelope) => {
  if (!rawEnvelope) {
    return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  const itemsRaw = rawEnvelope.items || rawEnvelope.data || [];
  const items = Array.isArray(itemsRaw) ? itemsRaw.map(normalizeCandidate) : [];

  const pagination = rawEnvelope.pagination || rawEnvelope.meta || {};

  // AUDIT: Do NOT use items.length as a fallback for total.
  // If the backend doesn't return total, keep it at 0 so the UI does not
  // falsely calculate pagination from an incomplete page of results.
  const total = Number(
    rawEnvelope.total ?? pagination.total ?? 0
  );
  const page = Number(rawEnvelope.page ?? pagination.page ?? 1);
  const pageSize = Number(rawEnvelope.page_size ?? pagination.page_size ?? 10);

  // totalPages: use backend value if provided, otherwise derive from total.
  // This is a safe display-only computation, not a business rule.
  const totalPages = Number(
    rawEnvelope.total_pages ?? pagination.total_pages ?? (total > 0 ? Math.ceil(total / (pageSize || 10)) : 0)
  );

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
};
