import React from 'react';
import { Button, Popconfirm, Space, Typography } from 'antd';
import { FiCheckSquare, FiTrash2, FiX } from 'react-icons/fi';
import { useLanguage } from '../../../hooks/useLanguage';

const { Text } = Typography;

export const NotificationBulkActions = ({
  selectedCount = 0,
  totalOnPage = 0,
  allSelected = false,
  onSelectAllToggle,
  onBulkMarkRead,
  onBulkDelete,
  onClearSelection,
  loading = false,
}) => {
  const { t } = useLanguage();

  if (selectedCount === 0) return null;

  return (
    <div className="bulk-actions-bar">
      <Space align="center" size="middle">
        <Text strong style={{ color: 'var(--brand-teal, #0ea5e9)' }}>
          {t('notifications.selectedCount', '{{count}} notification(s) selected', { count: selectedCount })}
        </Text>

        <Button type="link" size="small" onClick={onSelectAllToggle} style={{ padding: 0 }}>
          {allSelected
            ? t('notifications.deselectPage', 'Deselect Page')
            : t('notifications.selectAllPage', 'Select Page ({{count}})', { count: totalOnPage })}
        </Button>
      </Space>

      <Space align="center" size="small">
        <Button
          type="default"
          size="small"
          icon={<FiCheckSquare size={14} />}
          loading={loading}
          onClick={onBulkMarkRead}
        >
          {t('notifications.markReadSelected', 'Mark Read')}
        </Button>

        <Popconfirm
          title={t('notifications.bulkDeleteTitle', 'Delete Selected Notifications')}
          description={t('notifications.bulkDeleteDesc', 'Are you sure you want to delete {{count}} selected notifications?', { count: selectedCount })}
          okText={t('notifications.delete', 'Delete')}
          cancelText={t('notifications.cancel', 'Cancel')}
          okButtonProps={{ danger: true, loading }}
          onConfirm={onBulkDelete}
        >
          <Button type="primary" danger size="small" icon={<FiTrash2 size={14} />} loading={loading}>
            {t('notifications.deleteSelected', 'Delete')}
          </Button>
        </Popconfirm>

        <Button
          type="text"
          size="small"
          icon={<FiX size={16} />}
          onClick={onClearSelection}
          aria-label={t('notifications.clearSelection', 'Clear selection')}
        />
      </Space>
    </div>
  );
};

export default NotificationBulkActions;
