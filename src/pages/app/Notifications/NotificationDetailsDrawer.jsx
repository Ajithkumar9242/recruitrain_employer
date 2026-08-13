import React, { useEffect } from 'react';
import { Drawer, Tag, Button, Spin, Divider, Typography, Space } from 'antd';
import {
  FiCheckCircle,
  FiClock,
  FiUser,
  FiLayers,
  FiExternalLink,
  FiBookmark,
  FiTrash2,
} from 'react-icons/fi';
import { useLanguage } from '../../../hooks/useLanguage';

const { Text, Paragraph, Title } = Typography;

export const NotificationDetailsDrawer = ({
  open = false,
  notification = null,
  loading = false,
  onClose,
  onMarkAsRead,
  onDelete,
}) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (open && notification && !notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  }, [open, notification, onMarkAsRead]);

  if (!notification) return null;

  const {
    id,
    title,
    message,
    type,
    priority,
    category,
    company,
    recipient,
    read,
    readAt,
    fromUser,
    actionUrl,
    actionLabel,
    entityType,
    entityId,
    createdAt,
  } = notification;

  const getPriorityTagColor = (p) => {
    switch (String(p).toLowerCase()) {
      case 'urgent':
        return 'magenta';
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'blue';
      default:
        return 'default';
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return isoString;
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiBookmark size={18} style={{ color: 'var(--brand-teal, #0ea5e9)' }} />
          <span>{t('notifications.detailTitle', 'Notification Details')}</span>
        </div>
      }
      placement="right"
      width={520}
      onClose={onClose}
      open={open}
      aria-label={t('notifications.detailTitle', 'Notification Details')}
      extra={
        <Space>
          {onDelete && (
            <Button
              danger
              type="text"
              icon={<FiTrash2 size={16} />}
              onClick={() => {
                onDelete(id);
                onClose();
              }}
              aria-label={t('notifications.delete', 'Delete')}
            />
          )}
        </Space>
      }
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header Title & Tags */}
          <div style={{ marginBottom: '20px' }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: '12px', color: 'var(--text-main, #111827)' }}>
              {title}
            </Title>
            <Space wrap size={[8, 8]}>
              <Tag color={getPriorityTagColor(priority)}>{priority}</Tag>
              <Tag color="blue">{type}</Tag>
              {category && category !== type && <Tag>{category}</Tag>}
              {read ? (
                <Tag color="success" icon={<FiCheckCircle />}>
                  {t('notifications.read', 'Read')}
                </Tag>
              ) : (
                <Tag color="warning">{t('notifications.unread', 'Unread')}</Tag>
              )}
            </Space>
          </div>

          <Divider style={{ margin: '12px 0 20px 0' }} />

          {/* Notification Message Content */}
          <div style={{ marginBottom: '24px' }}>
            <Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {t('notifications.messageLabel', 'Message')}
            </Text>
            <Paragraph
              style={{
                marginTop: '8px',
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                color: 'var(--text-main, #111827)',
                whiteSpace: 'pre-line',
                background: 'var(--bg-main, #f9fafb)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e5e7eb)',
              }}
            >
              {message}
            </Paragraph>
          </div>

          {/* Action Link if available */}
          {actionUrl && (
            <div style={{ marginBottom: '24px' }}>
              <Button
                type="primary"
                icon={<FiExternalLink size={16} />}
                href={actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                block
              >
                {actionLabel || t('notifications.takeAction', 'Take Action')}
              </Button>
            </div>
          )}

          <Divider style={{ margin: '12px 0 20px 0' }} />

          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="drawer-meta-item">
              <span className="drawer-meta-label">{t('notifications.createdLabel', 'Created At')}</span>
              <span className="drawer-meta-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiClock size={14} />
                {formatDate(createdAt)}
              </span>
            </div>

            <div className="drawer-meta-item">
              <span className="drawer-meta-label">{t('notifications.readAtLabel', 'Read At')}</span>
              <span className="drawer-meta-value">{readAt ? formatDate(readAt) : '—'}</span>
            </div>

            {fromUser && (
              <div className="drawer-meta-item">
                <span className="drawer-meta-label">{t('notifications.senderLabel', 'From')}</span>
                <span className="drawer-meta-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiUser size={14} />
                  {fromUser}
                </span>
              </div>
            )}

            {recipient && (
              <div className="drawer-meta-item">
                <span className="drawer-meta-label">{t('notifications.recipientLabel', 'Recipient')}</span>
                <span className="drawer-meta-value">{recipient}</span>
              </div>
            )}

            {entityType && (
              <div className="drawer-meta-item">
                <span className="drawer-meta-label">{t('notifications.entityTypeLabel', 'Entity Type')}</span>
                <span className="drawer-meta-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiLayers size={14} />
                  {entityType}
                </span>
              </div>
            )}

            {entityId && (
              <div className="drawer-meta-item">
                <span className="drawer-meta-label">{t('notifications.entityIdLabel', 'Entity ID')}</span>
                <span className="drawer-meta-value">{entityId}</span>
              </div>
            )}

            {company && (
              <div className="drawer-meta-item">
                <span className="drawer-meta-label">{t('notifications.companyLabel', 'Company')}</span>
                <span className="drawer-meta-value">{company}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default NotificationDetailsDrawer;
