/**
 * Authoritative Interview Module Constants
 * Aligned strictly with certified Frappe Interview DocType schema
 */

export const INTERVIEW_TYPES = [
  'Phone',
  'Video',
  'Technical',
  'HR',
  'Managerial',
  'Final',
];

export const INTERVIEW_STATUSES = [
  'Scheduled',
  'Rescheduled',
  'Completed',
  'Cancelled',
];

export const INTERVIEW_RESULTS = [
  'Pending',
  'Pass',
  'Fail',
  'Hold',
];

/**
 * Job Application stages that are eligible for scheduling a NEW interview per Phase 17.7 backend certification.
 * Eligible: Applied, Screening, Shortlisted, Interview, Technical, HR, Offered.
 * Ineligible: Hired, Rejected, Withdrawn, Closed.
 */
export const INTERVIEW_ELIGIBLE_STAGES = [
  'Applied',
  'Screening',
  'Shortlisted',
  'Interview',
  'Technical',
  'HR',
  'Offered',
  'Interview Scheduled',
];

export const INTERVIEW_INELIGIBLE_STAGES = [
  'Hired',
  'Rejected',
  'Withdrawn',
  'Closed',
];
