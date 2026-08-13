import React, { useEffect } from 'react';
import { DatePicker, Select, Button, Space, Tooltip } from 'antd';
import { FiCalendar, FiBriefcase, FiRefreshCw, FiRotateCcw, FiBarChart2 } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useLanguage } from '../../../../hooks/useLanguage';
import { useJobs } from '../../../../hooks/useJobs';
import './AnalyticsComponents.css';

const { RangePicker } = DatePicker;

export const AnalyticsFilterBar = ({
  filters,
  onFilterChange,
  onReset,
  onRefresh,
  loading = false,
}) => {
  const { t } = useLanguage();
  const { items: jobList, loadJobs } = useJobs();

  useEffect(() => {
    if (!jobList || jobList.length === 0) {
      loadJobs();
    }
  }, [jobList, loadJobs]);

  const handleDateRangeChange = (dates) => {
    if (!dates || dates.length !== 2) {
      onFilterChange({ fromDate: null, toDate: null });
      return;
    }
    const [start, end] = dates;
    onFilterChange({
      fromDate: start ? start.format('YYYY-MM-DD') : null,
      toDate: end ? end.format('YYYY-MM-DD') : null,
    });
  };

  const rangeValue =
    filters.fromDate && filters.toDate
      ? [dayjs(filters.fromDate), dayjs(filters.toDate)]
      : null;

  return (
    <div className="analytics-filter-bar">
      <Space wrap size="middle" className="analytics-filter-space">
        {/* Date Range Picker */}
        <div className="analytics-filter-item">
          <label className="analytics-filter-label">
            <FiCalendar size={14} style={{ marginRight: 6 }} />
            {t('analytics.filters.dateRange')}
          </label>
          <RangePicker
            value={rangeValue}
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
            allowClear
            className="analytics-date-picker"
            placeholder={[t('analytics.filters.fromDate'), t('analytics.filters.toDate')]}
          />
        </div>

        {/* Job Opening Selector */}
        <div className="analytics-filter-item">
          <label className="analytics-filter-label">
            <FiBriefcase size={14} style={{ marginRight: 6 }} />
            {t('analytics.filters.jobOpening')}
          </label>
          <Select
            value={filters.jobOpening || undefined}
            onChange={(val) => onFilterChange({ jobOpening: val || null })}
            allowClear
            placeholder={t('analytics.filters.allJobs')}
            className="analytics-select"
            style={{ width: 220 }}
            options={[
              { value: '', label: t('analytics.filters.allJobs') },
              ...(jobList || []).map((j) => ({
                value: j.name || j.jobCode || j.job_title,
                label: j.jobTitle ? `${j.jobTitle} (${j.jobCode || j.name})` : j.name,
              })),
            ]}
          />
        </div>

        {/* Granularity Selector */}
        <div className="analytics-filter-item">
          <label className="analytics-filter-label">
            <FiBarChart2 size={14} style={{ marginRight: 6 }} />
            {t('analytics.filters.granularity')}
          </label>
          <Select
            value={filters.granularity || 'monthly'}
            onChange={(val) => onFilterChange({ granularity: val })}
            className="analytics-select"
            style={{ width: 140 }}
            options={[
              { value: 'daily', label: t('analytics.filters.daily') },
              { value: 'weekly', label: t('analytics.filters.weekly') },
              { value: 'monthly', label: t('analytics.filters.monthly') },
            ]}
          />
        </div>
      </Space>

      {/* Action Buttons */}
      <Space wrap size="small" className="analytics-action-space">
        <Tooltip title={t('analytics.filters.reset')}>
          <Button
            icon={<FiRotateCcw size={14} />}
            onClick={onReset}
            disabled={loading}
          >
            {t('analytics.filters.reset')}
          </Button>
        </Tooltip>
        <Button
          type="primary"
          icon={<FiRefreshCw size={14} className={loading ? 'spin-icon' : ''} />}
          onClick={onRefresh}
          loading={loading}
        >
          {t('analytics.refresh')}
        </Button>
      </Space>
    </div>
  );
};

export default AnalyticsFilterBar;
