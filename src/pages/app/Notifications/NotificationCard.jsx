import React from 'react';
import { Tag, Button, Checkbox, Popconfirm, Tooltip } from 'antd';
import {
  FiCheck,
  FiTrash2,
  FiExternalLink,
  FiClock,
  FiUser,
  FiLayers,
} from 'react-icons/fi';
import { useLanguage } from '../../../hooks/useLanguage';

export const NotificationCard = ({
  notification,
  isSelected = false,
  onSelect,
  onOpenDetails,
  onMarkAsRead,
  onDelete,
  loadingRead = false,
  loadingDelete = false,
}) => {
  const { t } = useLanguage();

  if (!notification) return null;

  const {
    id,
    title,
    message,
    type,
    priority,
    category,
    read,
    createdAt,
    fromUser,
    actionUrl,
    actionLabel,
  } = notification;

  const getPriorityColor = (p) => {
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

  const getTypeColor = (t) => {
    switch (String(t).toLowerCase()) {
      case 'interview':
        return 'purple';
      case 'offer':
        return 'cyan';
      case 'candidate':
        return 'blue';
      case 'job':
        return 'green';
      case 'system':
        return 'gold';
      case 'application':
        return 'geekblue';
      default:
        return 'default';
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      className={`notification-card ${read ? 'read' : 'unread'} ${String(priority).toLowerCase()}`}
      role="article"
      aria-label={`${read ? t('notifications.read', 'Read') : t('notifications.unread', 'Unread')} notification: ${title}`}
    >
      <div className="card-header">
        <div className="card-title-group">
          {onSelect && (
            <Checkbox
              checked={isSelected}
              onChange={(e) => onSelect(id, e.target.checked)}
              aria-label={t('notifications.selectNotification', 'Select notification')}
            />
          )}
          {!read && <span className="unread-dot" title={t('notifications.unread', 'Unread')} />}
          <div
            className="card-title"
            onClick={() => onOpenDetails && onOpenDetails(notification)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenDetails && onOpenDetails(notification);
              }
            }}
          >
            {title}
          </div>
        </div>

        <div className="card-meta-tags">
          <Tag color={getTypeColor(type)} style={{ margin: 0 }}>
            {type}
          </Tag>
          <Tag color={getPriorityColor(priority)} style={{ margin: 0 }}>
            {priority}
          </Tag>
        </div>
      </div>

      <div className="card-body" onClick={() => onOpenDetails && onOpenDetails(notification)}>
        {message}
      </div>

      <div className="card-footer">
        <div className="card-meta-tags">
          {createdAt && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <FiClock size={12} />
              {formatDate(createdAt)}
            </span>
          )}
          {fromUser && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <FiUser size={12} />
              {fromUser}
            </span>
          )}
          {category && category !== type && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <FiLayers size={12} />
              {category}
            </span>
          )}
        </div>

        <div className="card-actions">
          {actionUrl && (
            <Button
              type="link"
              size="small"
              icon={<FiExternalLink size={14} />}
              href={actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '0 4px' }}
            >
              {actionLabel || t('notifications.viewAction', 'View')}
            </Button>
          )}

          {!read && onMarkAsRead && (
            <Tooltip title={t('notifications.markAsRead', 'Mark as read')}>
              <Button
                type="text"
                size="small"
                icon={<FiCheck size={14} />}
                loading={loadingRead}
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(id);
                }}
                aria-label={t('notifications.markAsRead', 'Mark as read')}
              />
            </Tooltip>
          )}

          {onDelete && (
            <Popconfirm
              title={t('notifications.deleteConfirmTitle', 'Delete Notification')}
              description={t('notifications.deleteConfirmDesc', 'Are you sure you want to delete this notification?')}
              okText={t('notifications.delete', 'Delete')}
              cancelText={t('notifications.cancel', 'Cancel')}
              okButtonProps={{ danger: true, loading: loadingDelete }}
              onConfirm={() => onDelete(id)}
            >
              <Tooltip title={t('notifications.delete', 'Delete')}>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<FiTrash2 size={14} />}
                  aria-label={t('notifications.deleteNotification', 'Delete notification')}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
