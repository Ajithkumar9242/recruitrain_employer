import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Card,
  Typography,
  Popconfirm,
  Tooltip,
  Alert,
  Spin,
  message,
} from 'antd';
import {
  FiCalendar,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiVideo,
  FiClock,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import PageHeader from '../../../components/common/PageHeader';
import { useLanguage } from '../../../hooks/useLanguage';
import { useInterviews } from '../../../hooks/useInterviews';
import { InterviewDetailsDrawer, getInterviewStatusTagColor, getInterviewTypeTagColor } from './InterviewDetailsDrawer';
import { InterviewFormModal } from './InterviewFormModal';

const { Title, Text } = Typography;
const { Option } = Select;

export const InterviewsPage = () => {
  const { t } = useLanguage();
  const {
    items: interviews,
    selectedInterview,
    pagination,
    filters,
    search,
    loading,
    loadingDetails,
    saving,
    deleting,
    actionStatus,
    error,
    loadInterviews,
    getInterviewDetails,
    createInterview,
    updateInterview,
    changeStatus,
    deleteInterview,
    setSearch,
    setFilters,
    resetFilters,
    setPage,
    setPageSize,
    setSelectedInterview,
    clearSelectedInterview,
    clearError,
    clearActionStatus,
  } = useInterviews();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [searchInput, setSearchInput] = useState(search);

  const debounceTimerRef = useRef(null);

  // Initial load
  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  // Handle action status notifications
  useEffect(() => {
    if (actionStatus) {
      switch (actionStatus.type) {
        case 'create_success':
          message.success(t('interviews.messages.createSuccess'));
          setModalOpen(false);
          setEditingInterview(null);
          break;
        case 'update_success':
          message.success(t('interviews.messages.updateSuccess'));
          setModalOpen(false);
          setEditingInterview(null);
          break;
        case 'status_success':
          message.success(t('interviews.messages.statusSuccess'));
          break;
        case 'delete_success':
          message.success(t('interviews.messages.deleteSuccess'));
          setDrawerOpen(false);
          break;
        default:
          break;
      }
      clearActionStatus();
    }
  }, [actionStatus, clearActionStatus, t]);

  // Handle error notifications
  useEffect(() => {
    if (error) {
      const msg = typeof error === 'string' ? error : error?.message || t('common.error');
      if (msg.includes('feedback') || msg.includes('Interview Feedback')) {
        message.error(t('interviews.messages.deleteBlocked'));
      } else {
        message.error(msg);
      }
      clearError();
    }
  }, [error, clearError, t]);

  // Debounced search logic
  const triggerSearch = useCallback(
    (term) => {
      setSearch(term);
      loadInterviews({ page: 1, search: term });
    },
    [setSearch, loadInterviews]
  );

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      triggerSearch(val);
    }, 400);
  };

  const handleImmediateSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    triggerSearch(searchInput);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Filter change handlers
  const handleStatusFilterChange = (val) => {
    setFilters({ status: val });
    loadInterviews({ page: 1, status: val });
  };

  const handleTypeFilterChange = (val) => {
    setFilters({ interviewType: val });
    loadInterviews({ page: 1, interviewType: val });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    resetFilters();
    loadInterviews({ page: 1, search: '', status: null, interviewType: null });
  };

  const handleTableChange = (newPagination) => {
    if (newPagination.current !== pagination.page) {
      setPage(newPagination.current);
    }
    if (newPagination.pageSize !== pagination.pageSize) {
      setPageSize(newPagination.pageSize);
    }
    loadInterviews({ page: newPagination.current, pageSize: newPagination.pageSize });
  };

  // Action Handlers
  const handleViewDetails = (record) => {
    setSelectedInterview(record);
    getInterviewDetails(record.id);
    setDrawerOpen(true);
  };

  const handleOpenScheduleModal = () => {
    setEditingInterview(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingInterview(record);
    setModalOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    if (editingInterview?.id) {
      await updateInterview(editingInterview.id, payload);
    } else {
      await createInterview(payload);
    }
  };

  const handleQuickStatusChange = async (interviewId, newStatus) => {
    await changeStatus(interviewId, newStatus);
  };

  const handleDeleteInterview = async (interviewId) => {
    await deleteInterview(interviewId);
  };

  const columns = [
    {
      title: t('interviews.table.id'),
      dataIndex: 'name',
      key: 'name',
      width: 140,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => handleViewDetails(record)}
          style={{ padding: 0, fontWeight: 600, color: 'var(--brand-teal, #1890ff)' }}
        >
          {text || record.id}
        </Button>
      ),
    },
    {
      title: t('interviews.table.candidate'),
      dataIndex: 'candidate',
      key: 'candidate',
      width: 150,
      render: (text) => <Text copyable={{ text }}>{text || '-'}</Text>,
    },
    {
      title: t('interviews.table.jobOpening'),
      dataIndex: 'jobOpening',
      key: 'jobOpening',
      width: 150,
      render: (text) => <Text copyable={{ text }}>{text || '-'}</Text>,
    },
    {
      title: t('interviews.table.type'),
      dataIndex: 'interviewType',
      key: 'interviewType',
      width: 150,
      render: (type) => (
        <Tag color={getInterviewTypeTagColor(type)}>
          {t(`interviews.types.${type}`, type)}
        </Tag>
      ),
    },
    {
      title: t('interviews.table.scheduledOn'),
      dataIndex: 'scheduledOn',
      key: 'scheduledOn',
      width: 170,
      render: (date) => (
        <Space size={4}>
          <FiCalendar style={{ color: 'var(--brand-teal)' }} />
          <span>{date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'}</span>
        </Space>
      ),
    },
    {
      title: t('interviews.table.duration'),
      dataIndex: 'duration',
      key: 'duration',
      width: 110,
      render: (mins) => (mins ? `${mins} m` : '-'),
    },
    {
      title: t('interviews.table.interviewer'),
      dataIndex: 'interviewer',
      key: 'interviewer',
      width: 160,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: t('interviews.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => (
        <Tag color={getInterviewStatusTagColor(status)}>
          {t(`interviews.statuses.${status}`, status)}
        </Tag>
      ),
    },
    {
      title: t('interviews.table.actions'),
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('interviews.actions.viewDetails')}>
            <Button
              type="text"
              icon={<FiEye />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>

          <Tooltip title={t('interviews.actions.edit')}>
            <Button
              type="text"
              icon={<FiEdit />}
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>

          {record.meetingLink && (
            <Tooltip title={t('dashboard.meetingLink')}>
              <Button
                type="text"
                icon={<FiVideo style={{ color: '#1890ff' }} />}
                href={record.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
              />
            </Tooltip>
          )}

          <Popconfirm
            title={t('interviews.messages.deleteConfirmTitle')}
            description={t('interviews.messages.deleteConfirmSub')}
            onConfirm={() => handleDeleteInterview(record.id)}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
          >
            <Tooltip title={t('interviews.actions.delete')}>
              <Button type="text" danger icon={<FiTrash2 />} loading={deleting} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiCalendar style={{ color: 'var(--brand-teal, #1890ff)' }} />
            {t('interviews.title')}
          </Title>
          <Text type="secondary">{t('interviews.subtitle')}</Text>
        </div>

        <Space>
          <Button
            icon={<FiRefreshCw />}
            onClick={() => loadInterviews()}
            loading={loading}
          >
            {t('common.refresh')}
          </Button>
          <Button
            type="primary"
            icon={<FiPlus />}
            onClick={handleOpenScheduleModal}
            style={{ backgroundColor: 'var(--brand-navy, #0f172a)' }}
          >
            {t('interviews.scheduleInterview')}
          </Button>
        </Space>
      </div>

      {/* Search & Filter Toolbar */}
      <Card size="small" style={{ marginBottom: '20px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder={t('interviews.searchPlaceholder')}
            prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
            value={searchInput}
            onChange={handleSearchInputChange}
            onPressEnter={handleImmediateSearch}
            style={{ width: 340 }}
            allowClear
          />

          <Select
            placeholder={t('interviews.filters.status')}
            value={filters.status}
            onChange={handleStatusFilterChange}
            style={{ width: 180 }}
            allowClear
          >
            <Option value="Scheduled">{t('interviews.statuses.Scheduled')}</Option>
            <Option value="Rescheduled">{t('interviews.statuses.Rescheduled')}</Option>
            <Option value="Completed">{t('interviews.statuses.Completed')}</Option>
            <Option value="Cancelled">{t('interviews.statuses.Cancelled')}</Option>
          </Select>

          <Select
            placeholder={t('interviews.filters.interviewType')}
            value={filters.interviewType}
            onChange={handleTypeFilterChange}
            style={{ width: 200 }}
            allowClear
          >
            <Option value="Phone">{t('interviews.types.Phone')}</Option>
            <Option value="Video">{t('interviews.types.Video')}</Option>
            <Option value="Technical">{t('interviews.types.Technical')}</Option>
            <Option value="HR">{t('interviews.types.HR')}</Option>
            <Option value="Managerial">{t('interviews.types.Managerial')}</Option>
            <Option value="Final">{t('interviews.types.Final')}</Option>
          </Select>

          {(search || filters.status || filters.interviewType) && (
            <Button icon={<FiFilter />} onClick={handleResetFilters}>
              {t('interviews.filters.reset')}
            </Button>
          )}
        </div>
      </Card>

      {/* Main Table View */}
      <Card style={{ borderRadius: '8px' }}>
        <Table
          columns={columns}
          dataSource={interviews}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} interviews`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: t('interviews.empty.noInterviews'),
          }}
        />
      </Card>

      {/* Interview Details Drawer */}
      <InterviewDetailsDrawer
        visible={drawerOpen}
        interview={selectedInterview}
        loading={loadingDetails}
        saving={saving}
        deleting={deleting}
        onClose={() => {
          setDrawerOpen(false);
          clearSelectedInterview();
        }}
        onChangeStatus={handleQuickStatusChange}
        onEdit={(record) => {
          setDrawerOpen(false);
          handleOpenEditModal(record);
        }}
        onDelete={handleDeleteInterview}
      />

      {/* Interview Form / Schedule Modal */}
      <InterviewFormModal
        visible={modalOpen}
        interview={editingInterview}
        saving={saving}
        onClose={() => {
          setModalOpen(false);
          setEditingInterview(null);
        }}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default InterviewsPage;
