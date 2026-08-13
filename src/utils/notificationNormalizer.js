/**
 * RecruitTrain Notification Domain Normalizer
 * Pure, deterministic data transformation layer for Frappe Notification entities.
 * STRICT COMPLIANCE: Zero synthetic ID generation, zero fake fallback objects, zero client-calculated business logic.
 */

/**
 * Clean object of internal Frappe ORM metadata fields
 * @param {Object} row - Object or record
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
 * Normalize single Notification payload from Frappe backend
 * @param {Object} raw - Raw notification object or message envelope
 * @returns {Object|null} Normalized Notification record
 */
export const normalizeNotification = (raw) => {
  if (!raw) return null;
  const d = raw.data || raw.message || raw;
  if (!d || typeof d !== 'object') return null;

  const id = String(d.name || d.notification_id || d.id || '');
  if (!id) return null;

  const title = String(d.subject || d.title || d.name || id);
  const message = String(d.email_content || d.message || '');
  const type = String(d.type || d.notification_type || 'General');
  const priority = String(d.priority || 'Medium');
  const category = String(d.category || d.type || d.notification_type || 'General');
  const company = String(d.company || '');
  const recipient = String(d.for_user || d.recipient || '');
  const recipientType = String(d.recipient_type || d.recipientType || '');

  const read = Boolean(
    d.read !== undefined ? d.read : (d.is_read !== undefined ? d.is_read : false)
  );
  const readAt = d.read_at || d.readAt || null;
  const fromUser = String(d.from_user || d.fromUser || d.created_by || '');

  const actionUrl = String(d.action_url || d.link || d.actionUrl || '');
  const actionLabel = String(d.action_label || d.email_header || d.actionLabel || '');

  const entityType = String(d.document_type || d.entity_type || d.entityType || '');
  const entityId = String(d.document_name || d.entity_id || d.entityId || '');

  let metadata = d.metadata || {};
  if (typeof metadata === 'string') {
    try {
      metadata = JSON.parse(metadata);
    } catch {
      metadata = {};
    }
  }

  const createdAt = d.creation || d.created_at || d.createdAt || null;
  const modifiedAt = d.modified || d.modified_at || d.modifiedAt || null;

  return {
    id,
    name: id,
    notificationId: id,
    title,
    message,
    type,
    notificationType: type,
    priority,
    category,
    company,
    recipient,
    recipientType,
    read,
    isRead: read,
    readAt,
    fromUser,
    actionUrl,
    link: actionUrl,
    actionLabel,
    entityType,
    documentType: entityType,
    entityId,
    documentName: entityId,
    metadata,
    createdAt,
    creation: createdAt,
    modifiedAt,
    modified: modifiedAt,
  };
};

/**
 * Normalize paginated list of Notifications from backend
 * @param {Object} rawEnvelope - Raw response from list_notifications
 * @returns {Object} Normalized paginated notification list payload
 */
export const normalizeNotificationList = (rawEnvelope) => {
  if (!rawEnvelope) {
    return { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
  }

  const payload = rawEnvelope.data || rawEnvelope.message || rawEnvelope;
  const itemsRaw = Array.isArray(payload)
    ? payload
    : (payload.items || payload.data || []);

  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map(normalizeNotification).filter(Boolean)
    : [];

  const meta = payload.meta || payload.pagination || rawEnvelope.meta || rawEnvelope.pagination || {};

  // STRICT RULE: Total must come directly from backend metadata.
  // Do NOT fall back to items.length.
  const total = Number(
    payload.total ?? rawEnvelope.total ?? meta.total ?? 0
  );
  const page = Number(payload.page ?? rawEnvelope.page ?? meta.page ?? 1);
  const pageSize = Number(
    payload.page_size ?? rawEnvelope.page_size ?? meta.page_size ?? meta.pageSize ?? 20
  );

  const totalPages = Number(
    payload.total_pages ?? rawEnvelope.total_pages ?? meta.total_pages ?? meta.totalPages ?? (total > 0 ? Math.ceil(total / (pageSize || 20)) : 0)
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
 * Normalize notification count statistics from backend
 * @param {Object} rawEnvelope - Raw response from notification_counts or get_unread_count
 * @returns {Object} Normalized count stats
 */
export const normalizeNotificationCounts = (rawEnvelope) => {
  if (!rawEnvelope) {
    return { unread: 0, read: 0, total: 0, high: 0, urgent: 0 };
  }

  const data = rawEnvelope.data || rawEnvelope.message || rawEnvelope;

  if (typeof data === 'number') {
    return { unread: Number(data) || 0, read: 0, total: 0, high: 0, urgent: 0 };
  }

  if (typeof data === 'object' && data !== null) {
    return {
      unread: Number(data.unread ?? data.unread_count ?? 0),
      read: Number(data.read ?? data.read_count ?? 0),
      total: Number(data.total ?? data.total_count ?? 0),
      high: Number(data.high ?? data.high_priority ?? 0),
      urgent: Number(data.urgent ?? data.urgent_priority ?? 0),
    };
  }

  return { unread: 0, read: 0, total: 0, high: 0, urgent: 0 };
};

/**
 * Normalize notification preferences from backend
 * @param {Object} rawEnvelope - Raw response from notification_preferences
 * @returns {Object|null} Normalized notification preferences object
 */
export const normalizeNotificationPreferences = (rawEnvelope) => {
  if (!rawEnvelope) return null;
  const data = rawEnvelope.data || rawEnvelope.message || rawEnvelope;
  if (!data || typeof data !== 'object') return null;

  return cleanFrappeMetadata(data);
};
