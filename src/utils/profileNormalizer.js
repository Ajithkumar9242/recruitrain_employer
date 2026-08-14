/**
 * RecruitTrain Employer Profile Normalizer
 * Pure utility to convert raw backend responses into a canonical, normalized profile structure.
 * CRITICAL RULE: DOES NOT INVENT OR FABRICATE DATA. ONLY TRANSLATES AND DESTRUCTURES BACKEND RESPONSE.
 */

export const normalizeProfile = (raw) => {
  if (!raw) return null;

  // Handle nested Frappe response wrappers if passed directly
  let target = raw;
  if (raw.data && typeof raw.data === 'object' && (raw.data.user || raw.data.first_name || raw.data.email)) {
    target = raw.data;
  } else if (raw.message && typeof raw.message === 'object') {
    target = raw.message.data || raw.message;
  }

  const user = target.user || target.employer || (target.first_name || target.email ? target : {});
  const company = target.company || {};
  const preferences = target.preferences || {};

  const firstName = user.first_name ?? user.firstName ?? null;
  const lastName = user.last_name ?? user.lastName ?? null;
  const fullName =
    user.full_name ??
    user.fullName ??
    ([firstName, lastName].filter(Boolean).join(' ') || user.email || null);

  const avatarUrl = user.avatar ?? user.profile_image ?? target.avatar ?? target.profile_image ?? target.avatar_url ?? null;
  const companyLogoUrl = company.logo ?? null;

  // Notification preferences safe parsing
  let notificationPreferences = user.notification_preferences ?? preferences.notification_preferences ?? target.notification_preferences ?? null;
  if (typeof notificationPreferences === 'string') {
    try {
      notificationPreferences = JSON.parse(notificationPreferences);
    } catch (e) {
      // Keep raw string if parsing fails
    }
  }

  return {
    id: user.id ?? user.name ?? null,
    user: user.user ?? user.email ?? null,
    firstName,
    lastName,
    fullName,
    email: user.email ?? user.user ?? null,
    phone: user.phone ?? user.mobile_no ?? null,
    profileImage: avatarUrl,
    avatar: avatarUrl,
    designation: user.designation ?? target.designation ?? null,
    department: user.department ?? null,
    role: user.role ?? target.role ?? null,
    status: user.status ?? target.status ?? null,
    employeeId: user.employee_id ?? user.employeeId ?? null,
    bio: user.bio ?? null,
    city: user.city ?? null,
    state: user.state ?? null,
    country: user.country ?? null,

    // Permissions
    isPrimaryRecruiter: user.is_primary_recruiter ?? target.is_primary_recruiter ?? null,
    canPublishJobs: user.can_publish_jobs ?? target.can_publish_jobs ?? null,
    canHire: user.can_hire ?? target.can_hire ?? null,
    canManageRecruiters: user.can_manage_recruiters ?? target.can_manage_recruiters ?? null,

    // Preferences & Settings
    timezone: user.timezone ?? preferences.timezone ?? target.timezone ?? null,
    language: user.language ?? preferences.language ?? target.language ?? null,
    notificationPreferences,

    // Audit Information
    lastLogin: user.last_login ?? target.last_login ?? null,
    lastLoginAt: user.last_login_at ?? target.last_login_at ?? null,
    lastLoginIp: user.last_login_ip ?? target.last_login_ip ?? null,
    lastLoginUserAgent: user.last_login_user_agent ?? target.last_login_user_agent ?? null,
    loginCount: user.login_count ?? target.login_count ?? null,

    // Company Context
    company: company && (company.name || company.company_name || company.id) ? {
      id: company.name ?? company.id ?? null,
      name: company.company_name ?? company.name ?? null,
      companyName: company.company_name ?? company.name ?? null,
      companyCode: company.company_code ?? null,
      logo: companyLogoUrl,
      email: company.email ?? null,
      website: company.website ?? null,
      legalName: company.legal_name ?? null,
      industry: company.industry ?? null,
      companySize: company.company_size ?? null,
    } : null,

    preferences: {
      language: user.language ?? preferences.language ?? target.language ?? null,
      timezone: user.timezone ?? preferences.timezone ?? target.timezone ?? null,
      notificationPreferences,
    },
  };
};

export default normalizeProfile;

