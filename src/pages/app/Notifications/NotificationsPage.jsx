import React, { useEffect, useState, useCallback } from 'react';
import {
  Typography,
  Button,
  Pagination,
  Spin,
  Alert,
  Popconfirm,
  Dropdown,
  Space,
  message,
} from 'antd';
import {
  FiBell,
  FiRefreshCw,
  FiCheckCircle,
  FiTrash2,
  FiSliders,
  FiInbox,
  FiAlertCircle,
  FiClock,
  FiZap,
} from 'react-icons/fi';
import { useNotifications } from '../../../hooks/useNotifications';
import { useLanguage } from '../../../hooks/useLanguage';
import NotificationCard from './NotificationCard';
import NotificationFilters from './NotificationFilters';
import NotificationDetailsDrawer from './NotificationDetailsDrawer';
import NotificationPreferencesModal from './NotificationPreferencesModal';
import NotificationEmptyState from './NotificationEmptyState';
import NotificationBulkActions from './NotificationBulkActions';
import './NotificationCenter.css';

const { Title, Text } = Typography;

export const NotificationsPage = () => {
  const { t } = useLanguage();

  const {
    notifications,
    selectedNotification,
    pagination,
    search,
    filters,
    counts,
    preferences,
    loading,
    loadingDetails,
    saving,
    deleting,
    bulkProcessing,
    error,
    actionStatus,
    fetchNotifications,
    fetchNotification,
    fetchCounts,
    searchNotifications,
    setFilters,
    resetFilters,
    changePage,
    changePageSize,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    bulkUpdate,
    fetchPreferences,
    updatePreferences,
    selectNotification,
    clearActionStatus,
    refresh,
  } = useNotifications();

  // Selected item IDs for bulk operations
  const [selectedIds, setSelectedIds] = useState([]);
  // UI drawers & modals state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  // Initial fetch on mount
  useEffect(() => {
    fetchNotifications({ page: 1 });
    fetchCounts();
  }, [fetchNotifications, fetchCounts]);

  // Handle action status toasts
  useEffect(() => {
    if (actionStatus) {
      if (actionStatus === 'mark_all_read_success') {
        message.success(t('notifications.markAllReadSuccess', 'All notifications marked as read'));
      } else if (actionStatus === 'delete_success') {
        message.success(t('notifications.deleteSuccess', 'Notification deleted successfully'));
      } else if (actionStatus === 'clear_success') {
        message.success(t('notifications.clearSuccess', 'Notifications cleared successfully'));
      } else if (actionStatus === 'preferences_update_success') {
        message.success(t('notifications.preferencesSuccess', 'Notification preferences saved'));
      } else if (actionStatus === 'bulk_update_success') {
        message.success(t('notifications.bulkUpdateSuccess', 'Bulk action completed successfully'));
        setSelectedIds([]);
      }
      clearActionStatus();
    }
  }, [actionStatus, clearActionStatus, t]);

  // Selection handlers for bulk operations
  const handleSelectCard = useCallback((id, checked) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  }, []);

  const handleSelectAllToggle = useCallback(() => {
    const pageIds = notifications.map((n) => n.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  }, [notifications, selectedIds]);

  const handleOpenDetails = useCallback(
    async (notification) => {
      selectNotification(notification);
      setDrawerOpen(true);
      fetchNotification(notification.id);
    },
    [selectNotification, fetchNotification]
  );

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    selectNotification(null);
  }, [selectNotification]);

  const handleOpenPreferences = useCallback(() => {
    fetchPreferences();
    setPreferencesOpen(true);
  }, [fetchPreferences]);

  const handleBulkMarkRead = useCallback(() => {
    if (selectedIds.length === 0) return;
    bulkUpdate(selectedIds, 'mark_read');
  }, [selectedIds, bulkUpdate]);

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    bulkUpdate(selectedIds, 'delete');
  }, [selectedIds, bulkUpdate]);

  const clearMenuItems = [
    {
      key: 'clear-read',
      label: t('notifications.clearReadOnly', 'Clear Read Notifications'),
      icon: <FiCheckCircle size={14} />,
      onClick: () => clearNotifications('read'),
    },
    {
      key: 'clear-all',
      danger: true,
      label: t('notifications.clearAll', 'Clear All Notifications'),
      icon: <FiTrash2 size={14} />,
      onClick: () => clearNotifications('all'),
    },
  ];

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(filters.type) ||
    Boolean(filters.priority) ||
    filters.read !== null ||
    Boolean(filters.category);

  const pageIds = notifications.map((n) => n.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  return (
    <div className="notifications-page-container">
      {/* Header */}
      <div className="notifications-header">
        <div className="notifications-title-area">
          <Title level={2} style={{ margin: 0, color: 'var(--text-main, #111827)' }}>
            <Space align="center" size="small">
              <FiBell style={{ color: 'var(--brand-teal, #0ea5e9)' }} />
              {t('notifications.pageTitle', 'Notification Center')}
            </Space>
          </Title>
          <Text type="secondary" style={{ fontSize: '0.875rem' }}>
            {t('notifications.pageSubtitle', 'Manage system alerts, recruitment updates, and communication preferences')}
          </Text>
        </div>

        <div className="notifications-header-actions">
          <Button
            icon={<FiRefreshCw size={14} className={loading ? 'spin-icon' : ''} />}
            onClick={refresh}
            loading={loading}
          >
            {t('notifications.refresh', 'Refresh')}
          </Button>

          <Button
            type="default"
            icon={<FiCheckCircle size={14} />}
            onClick={markAllAsRead}
            loading={saving}
          >
            {t('notifications.markAllRead', 'Mark All Read')}
          </Button>

          <Dropdown menu={{ items: clearMenuItems }} trigger={['click']}>
            <Button icon={<FiTrash2 size={14} />}>
              {t('notifications.clear', 'Clear')}
            </Button>
          </Dropdown>

          <Button
            type="primary"
            icon={<FiSliders size={14} />}
            onClick={handleOpenPreferences}
          >
            {t('notifications.preferences', 'Preferences')}
          </Button>
        </div>
      </div>

      {/* KPI Statistics Ribbon */}
      <div className="notification-stats-ribbon">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiInbox />
          </div>
          <div className="stat-content">
            <span className="stat-value">{counts.total}</span>
            <span className="stat-label">{t('notifications.total', 'Total')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon unread">
            <FiClock />
          </div>
          <div className="stat-content">
            <span className="stat-value">{counts.unread}</span>
            <span className="stat-label">{t('notifications.unread', 'Unread')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon read">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <span className="stat-value">{counts.read}</span>
            <span className="stat-label">{t('notifications.read', 'Read')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon high">
            <FiAlertCircle />
          </div>
          <div className="stat-content">
            <span className="stat-value">{counts.high}</span>
            <span className="stat-label">{t('notifications.highPriority', 'High')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon urgent">
            <FiZap />
          </div>
          <div className="stat-content">
            <span className="stat-value">{counts.urgent}</span>
            <span className="stat-label">{t('notifications.urgentPriority', 'Urgent')}</span>
          </div>
        </div>
      </div>

      {/* Toolbar Filters */}
      <NotificationFilters
        search={search}
        filters={filters}
        onSearchChange={searchNotifications}
        onFilterChange={setFilters}
        onResetFilters={resetFilters}
        loading={loading}
      />

      {/* Bulk Actions Bar */}
      <NotificationBulkActions
        selectedCount={selectedIds.length}
        totalOnPage={notifications.length}
        allSelected={allPageSelected}
        onSelectAllToggle={handleSelectAllToggle}
        onBulkMarkRead={handleBulkMarkRead}
        onBulkDelete={handleBulkDelete}
        onClearSelection={() => setSelectedIds([])}
        loading={bulkProcessing}
      />

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          message={t('notifications.errorTitle', 'Error')}
          description={typeof error === 'string' ? error : JSON.stringify(error)}
          showIcon
          closable
          style={{ marginBottom: '20px' }}
        />
      )}

      {/* Notifications List */}
      {loading ? (
        <div style={{ padding: '64px 0', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '12px', color: 'var(--text-muted, #6b7280)' }}>
            {t('notifications.loading', 'Loading notifications...')}
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <NotificationEmptyState
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />
      ) : (
        <>
          <div className="notifications-list">
            {notifications.map((item) => (
              <NotificationCard
                key={item.id}
                notification={item}
                isSelected={selectedIds.includes(item.id)}
                onSelect={handleSelectCard}
                onOpenDetails={handleOpenDetails}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                loadingDelete={deleting}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="notifications-pagination">
            <Pagination
              current={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={(p, ps) => {
                if (ps !== pagination.pageSize) {
                  changePageSize(ps);
                } else {
                  changePage(p);
                }
              }}
              showSizeChanger
              pageSizeOptions={['10', '20', '50', '100']}
              showTotal={(tot, range) =>
                t('notifications.paginationTotal', '{{from}}-{{to}} of {{total}} notifications', {
                  from: range[0],
                  to: range[1],
                  total: tot,
                })
              }
            />
          </div>
        </>
      )}

      {/* Notification Details Drawer */}
      <NotificationDetailsDrawer
        open={drawerOpen}
        notification={selectedNotification}
        loading={loadingDetails}
        onClose={handleCloseDrawer}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
      />

      {/* Notification Preferences Modal */}
      <NotificationPreferencesModal
        open={preferencesOpen}
        preferences={preferences}
        loading={loading}
        saving={saving}
        onClose={() => setPreferencesOpen(false)}
        onSave={updatePreferences}
      />
    </div>
  );
};

export default NotificationsPage;
