import React, { useState, useEffect, useRef } from 'react';
import { Input, Select, Button, Space } from 'antd';
import { FiSearch, FiRotateCcw } from 'react-icons/fi';
import { useLanguage } from '../../../hooks/useLanguage';

const { Option } = Select;

export const NotificationFilters = ({
  search = '',
  filters = {},
  onSearchChange,
  onFilterChange,
  onResetFilters,
  loading = false,
}) => {
  const { t } = useLanguage();

  const [localSearch, setLocalSearch] = useState(search);
  const debounceTimerRef = useRef(null);

  // Sync local search when parent search prop changes externally
  useEffect(() => {
    setLocalSearch(search || '');
  }, [search]);

  // Handle debounced search input
  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalSearch(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(val);
    }, 400);
  };

  // Immediate search on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      onSearchChange(localSearch);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const hasActiveFilters =
    Boolean(localSearch) ||
    Boolean(filters.type) ||
    Boolean(filters.priority) ||
    filters.read !== null ||
    Boolean(filters.category);

  return (
    <div className="notifications-toolbar">
      <div className="toolbar-controls">
        {/* Server-side Search Input */}
        <div className="search-input-wrapper">
          <Input
            prefix={<FiSearch size={16} style={{ color: 'var(--text-muted, #9ca3af)' }} />}
            placeholder={t('notifications.searchPlaceholder', 'Search notifications by title or content...')}
            value={localSearch}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            allowClear={{
              onClear: () => {
                setLocalSearch('');
                onSearchChange('');
              },
            }}
            aria-label={t('notifications.searchPlaceholder', 'Search notifications')}
          />
        </div>

        {/* Filters Wrapper */}
        <div className="filter-selects-wrapper">
          {/* Read Status Filter */}
          <Select
            placeholder={t('notifications.filterReadStatus', 'Status')}
            value={filters.read === null ? undefined : (filters.read ? 'read' : 'unread')}
            onChange={(val) => {
              const readVal = val === undefined ? null : val === 'read';
              onFilterChange({ read: readVal });
            }}
            allowClear
            style={{ width: 140 }}
            aria-label={t('notifications.filterReadStatus', 'Filter by read status')}
          >
            <Option value="unread">{t('notifications.unread', 'Unread')}</Option>
            <Option value="read">{t('notifications.read', 'Read')}</Option>
          </Select>

          {/* Priority Filter */}
          <Select
            placeholder={t('notifications.filterPriority', 'Priority')}
            value={filters.priority || undefined}
            onChange={(val) => onFilterChange({ priority: val || null })}
            allowClear
            style={{ width: 140 }}
            aria-label={t('notifications.filterPriority', 'Filter by priority')}
          >
            <Option value="Low">{t('notifications.priorityLow', 'Low')}</Option>
            <Option value="Medium">{t('notifications.priorityMedium', 'Medium')}</Option>
            <Option value="High">{t('notifications.priorityHigh', 'High')}</Option>
            <Option value="Urgent">{t('notifications.priorityUrgent', 'Urgent')}</Option>
          </Select>

          {/* Type Filter */}
          <Select
            placeholder={t('notifications.filterType', 'Type')}
            value={filters.type || undefined}
            onChange={(val) => onFilterChange({ type: val || null })}
            allowClear
            style={{ width: 140 }}
            aria-label={t('notifications.filterType', 'Filter by type')}
          >
            <Option value="System">{t('notifications.typeSystem', 'System')}</Option>
            <Option value="Application">{t('notifications.typeApplication', 'Application')}</Option>
            <Option value="Interview">{t('notifications.typeInterview', 'Interview')}</Option>
            <Option value="Offer">{t('notifications.typeOffer', 'Offer')}</Option>
            <Option value="Candidate">{t('notifications.typeCandidate', 'Candidate')}</Option>
            <Option value="Job">{t('notifications.typeJob', 'Job')}</Option>
            <Option value="General">{t('notifications.typeGeneral', 'General')}</Option>
          </Select>

          {/* Category Filter */}
          <Select
            placeholder={t('notifications.filterCategory', 'Category')}
            value={filters.category || undefined}
            onChange={(val) => onFilterChange({ category: val || null })}
            allowClear
            style={{ width: 140 }}
            aria-label={t('notifications.filterCategory', 'Filter by category')}
          >
            <Option value="System">{t('notifications.categorySystem', 'System')}</Option>
            <Option value="Application">{t('notifications.categoryApplication', 'Application')}</Option>
            <Option value="Interview">{t('notifications.categoryInterview', 'Interview')}</Option>
            <Option value="Offer">{t('notifications.categoryOffer', 'Offer')}</Option>
            <Option value="Candidate">{t('notifications.categoryCandidate', 'Candidate')}</Option>
            <Option value="Job">{t('notifications.categoryJob', 'Job')}</Option>
            <Option value="General">{t('notifications.categoryGeneral', 'General')}</Option>
          </Select>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button
              icon={<FiRotateCcw size={14} />}
              onClick={() => {
                setLocalSearch('');
                onResetFilters();
              }}
              aria-label={t('notifications.resetFilters', 'Reset filters')}
            >
              {t('notifications.reset', 'Reset')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationFilters;
