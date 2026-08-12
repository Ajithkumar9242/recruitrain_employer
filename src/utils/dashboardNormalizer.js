import { normalizeData } from '../services/normalizer';

/**
 * Deterministic Normalizer for Frappe Backend Dashboard API Data
 * Strictly converts backend snake_case properties to frontend camelCase.
 * Does NOT invent mock metrics, fallback counters, or fake records.
 */

export const normalizeOverview = (data) => {
  if (!data || typeof data !== 'object') return null;
  const raw = normalizeData(data);
  return {
    openJobs: raw.openJobs !== undefined ? Number(raw.openJobs) : (raw.open_jobs !== undefined ? Number(raw.open_jobs) : null),
    totalCandidates: raw.totalCandidates !== undefined ? Number(raw.totalCandidates) : (raw.total_candidates !== undefined ? Number(raw.total_candidates) : null),
    activeApplications: raw.activeApplications !== undefined ? Number(raw.activeApplications) : (raw.active_applications !== undefined ? Number(raw.active_applications) : null),
    todaysInterviews: raw.todaysInterviews !== undefined ? Number(raw.todaysInterviews) : (raw.todays_interviews !== undefined ? Number(raw.todays_interviews) : null),
    pendingOffers: raw.pendingOffers !== undefined ? Number(raw.pendingOffers) : (raw.pending_offers !== undefined ? Number(raw.pending_offers) : null),
    unreadNotifications: raw.unreadNotifications !== undefined ? Number(raw.unreadNotifications) : (raw.unread_notifications !== undefined ? Number(raw.unread_notifications) : null),
    trendOpenJobs: raw.trendOpenJobs || raw.trend_open_jobs || null,
    trendApplications: raw.trendApplications || raw.trend_applications || null,
  };
};

export const normalizePipelineSummary = (data) => {
  if (!data) return [];
  const rawList = Array.isArray(data) ? data : (data.stages || data.summary || []);
  return rawList.map((item, idx) => {
    const norm = normalizeData(item);
    return {
      stageId: norm.stageId || norm.stage_id || norm.name || `stage-${idx}`,
      stageName: norm.stageName || norm.stage_name || norm.stage || 'Stage',
      count: Number(norm.count || norm.total || 0),
      color: norm.color || null,
    };
  });
};

export const normalizeTodaysInterviews = (data) => {
  if (!data) return [];
  const rawList = Array.isArray(data) ? data : (data.interviews || data.data || []);
  return rawList.map((item, idx) => {
    const norm = normalizeData(item);
    return {
      id: norm.name || norm.id || norm.interviewId || `interview-${idx}`,
      candidateName: norm.candidateName || norm.candidate_name || norm.candidate || '',
      jobTitle: norm.jobTitle || norm.job_title || norm.jobOpening || '',
      interviewType: norm.interviewType || norm.interview_type || 'Interview',
      scheduledTime: norm.scheduledTime || norm.scheduled_time || norm.time || '',
      interviewer: norm.interviewerName || norm.interviewer_name || norm.interviewer || '',
      meetingLink: norm.meetingLink || norm.meeting_link || norm.link || null,
    };
  });
};

export const normalizeRecentActivity = (data) => {
  if (!data) return [];
  const rawList = Array.isArray(data) ? data : (data.activities || data.logs || data.data || []);
  return rawList.map((item, idx) => {
    const norm = normalizeData(item);
    return {
      id: norm.name || norm.id || `activity-${idx}`,
      title: norm.title || norm.heading || norm.action || 'Activity',
      description: norm.description || norm.details || norm.message || '',
      timestamp: norm.timestamp || norm.creation || norm.createdAt || '',
      user: norm.user || norm.owner || norm.userName || '',
      actionType: norm.actionType || norm.action_type || 'info',
    };
  });
};

export const normalizeRecentApplications = (data) => {
  if (!data) return [];
  const rawList = Array.isArray(data) ? data : (data.applications || data.data || []);
  return rawList.map((item, idx) => {
    const norm = normalizeData(item);
    return {
      id: norm.name || norm.id || norm.applicationId || `app-${idx}`,
      candidateName: norm.candidateName || norm.candidate_name || norm.applicant_name || '',
      jobTitle: norm.jobTitle || norm.job_title || norm.job_opening || '',
      stageName: norm.stageName || norm.stage_name || norm.status || '',
      appliedDate: norm.appliedDate || norm.applied_date || norm.creation || '',
      recruiterName: norm.recruiterName || norm.recruiter_name || norm.owner || '',
    };
  });
};
