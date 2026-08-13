import React from 'react';
import { Empty, Button } from 'antd';
import { FiBellOff, FiRotateCcw } from 'react-icons/fi';
import { useLanguage } from '../../../hooks/useLanguage';

export const NotificationEmptyState = ({ hasActiveFilters = false, onResetFilters }) => {
  const { t } = useLanguage();

  return (
    <div style={{ padding: '48px 16px', textAlign: 'center' }}>
      <Empty
        image={<FiBellOff size={48} style={{ color: 'var(--text-muted, #9ca3af)', margin: '0 auto' }} />}
        description={
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main, #111827)' }}>
              {hasActiveFilters
                ? t('notifications.noFilteredResults', 'No notifications match your filters')
                : t('notifications.noNotifications', 'No notifications found')}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted, #6b7280)', marginTop: '4px' }}>
              {hasActiveFilters
                ? t('notifications.tryResettingFilters', 'Try resetting filters or searching with different keywords.')
                : t('notifications.emptySubtitle', 'You are all caught up! New notifications will appear here.')}
            </div>
          </div>
        }
      >
        {hasActiveFilters && onResetFilters && (
          <Button
            type="primary"
            icon={<FiRotateCcw size={14} />}
            onClick={onResetFilters}
            style={{ marginTop: '16px' }}
          >
            {t('notifications.resetFilters', 'Reset Filters')}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default NotificationEmptyState;
