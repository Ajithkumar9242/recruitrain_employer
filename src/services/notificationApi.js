import apiClient from './apiClient';

/**
 * RecruitTrain Notification API Service
 * Authoritative Backend Integration with Frappe Notification Controller (recruitrain_employer.api.notifications)
 * Architectural Rule: Backend is single source of truth. Company & user scope set by backend session context.
 */
export const notificationApi = {
  /**
   * List user's notifications with server-side pagination, search, and filters
   * @param {Object} params - { page, pageSize, search, type, priority, read, category, orderBy, orderDir }
   * @returns {Promise<Object>} Backend API response envelope
   */
  async listNotifications({
    page = 1,
    pageSize = 20,
    search = '',
    type = null,
    priority = null,
    read = null,
    category = null,
    orderBy = 'creation',
    orderDir = 'desc',
  } = {}) {
    const payload = {
      page,
      page_size: pageSize,
      order_by: orderBy,
      order_dir: orderDir,
    };

    if (search && search.trim()) payload.search = search.trim();
    if (type) payload.type = type;
    if (priority) payload.priority = priority;
    if (read !== null && read !== undefined) payload.read = read;
    if (category) payload.category = category;

    const response = await apiClient.post(
      '/method/recruitrain_employer.api.notifications.list_notifications',
      payload
    );
    return response;
  },

  /**
   * Retrieve authoritative single Notification record by ID
   * @param {string} notificationId - Notification ID / name
   * @returns {Promise<Object>} Backend API response envelope
   */
  async getNotification(notificationId) {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.notifications.get_notification',
      { notification_id: notificationId }
    );
    return response;
  },

  /**
   * Retrieve authoritative notification count statistics (unread, read, total, high, urgent)
   * @returns {Promise<Object>} Backend API response envelope
   */
  async getNotificationCounts() {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.notifications.notification_counts'
    );
    return response;
  },

  /**
   * Retrieve authoritative unread notification count
   * @returns {Promise<Object>} Backend API response envelope
   */
  async getUnreadCount() {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.notifications.get_unread_count'
    );
    return response;
  },

  /**
   * Mark a single notification as read
   * @param {string} notificationId - Notification ID / name
   * @returns {Promise<Object>} Backend API response envelope
   */
  async markNotificationRead(notificationId) {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.notifications.mark_notification_read',
      { notification_id: notificationId }
    );
    return response;
  },

  /**
   * Mark all user notifications as read
   * @returns {Promise<Object>} Backend API response envelope
   */
  async markAllNotificationsRead() {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.notifications.mark_all_notifications_read'
    );
    return response;
  },

  /**
   * Delete a single notification record
   * @param {string} notificationId - Notification ID / name
   * @returns {Promise<Object>} Backend API response envelope
   */
  async deleteNotification(notificationId) {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.notifications.delete_notification',
      { notification_id: notificationId }
    );
    return response;
  },

  /**
   * Clear notifications (supports backend clear modes such as 'all' or 'read')
   * @param {string} mode - Clear mode ('all' | 'read')
   * @returns {Promise<Object>} Backend API response envelope
   */
  async clearNotifications(mode = 'read') {
    const payload = {
      clear_mode: mode,
      mode: mode,
      read_only: mode === 'read',
    };
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.notifications.clear_notifications',
      payload
    );
    return response;
  },

  /**
   * Retrieve user notification preferences
   * @returns {Promise<Object>} Backend API response envelope
   */
  async getNotificationPreferences() {
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.notifications.notification_preferences'
    );
    return response;
  },

  /**
   * Update user notification preferences
   * @param {Object} preferences - Preferences object/fields to update
   * @returns {Promise<Object>} Backend API response envelope
   */
  async updateNotificationPreferences(preferences) {
    const payload = {
      preferences: preferences,
      ...preferences,
    };
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.notifications.update_notification_preferences',
      payload
    );
    return response;
  },

  /**
   * Execute bulk operations on selected notifications (mark_read, delete)
   * @param {Array<string>} notificationIds - Array of notification IDs
   * @param {string} action - Bulk action ('mark_read' | 'delete')
   * @returns {Promise<Object>} Backend API response envelope
   */
  async bulkUpdateNotifications(notificationIds, action) {
    const payload = {
      notification_ids: notificationIds,
      action: action,
      bulk_action: action,
    };
    const response = await apiClient.post(
      '/method/recruitrain_employer.api.notifications.bulk_update_notifications',
      payload
    );
    return response;
  },
};

export default notificationApi;
