import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Typography,
  Popconfirm,
  message,
  Badge,
  Tooltip,
} from 'antd';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiSend,
  FiLock,
  FiBriefcase,
  FiUsers,
  FiRotateCcw,
} from 'react-icons/fi';
import dayjs from 'dayjs';

import PageHeader from '../../../components/common/PageHeader';
import JobFormModal from './JobFormModal';
import JobDetailsDrawer from './JobDetailsDrawer';
import { useJobs } from '../../../hooks/useJobs';
import { useLanguage } from '../../../hooks/useLanguage';

const { Text } = Typography;
const { Option } = Select;

const getStatusColor = (status) => {
  switch (status) {
    case 'Open':
      return 'success';
    case 'Draft':
      return 'default';
    case 'Paused':
    case 'On Hold':
      return 'warning';
    case 'Closed':
    case 'Filled':
      return 'processing';
    case 'Cancelled':
      return 'error';
    default:
      return 'default';
  }
};

export const JobsPage = () => {
  const { t } = useLanguage();

  const {
    items,
    selectedJob,
    pagination,
    filters,
    search,
    sorting,
    loading,
    refreshJobs,
    getJobDetails,
    saveDraft,
    createJob,
    updateJob,
    publishJob,
    closeJob,
    deleteJob,
    setSearch,
    setFilters,
    resetFilters,
    setPage,
    setPageSize,
    setSelectedJob,
    saving,
    publishing,
    closing,
    deleting,
    error,
    actionStatus,
    clearActionStatus,
    clearError,
  } = useJobs();

  // Local Modal & Drawer States
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState(search || '');
  const searchDebounceRef = useRef(null);

  // Initial Data Load
  useEffect(() => {
    refreshJobs();
  }, [pagination.page, pagination.pageSize, filters, sorting, search]);

  // Toast Notifications for Action Status
  useEffect(() => {
    if (actionStatus) {
      if (actionStatus.type === 'save_draft_success') {
        message.success(t('jobs.messages.saveDraftSuccess'));
      } else if (actionStatus.type === 'create_success') {
        message.success(t('jobs.messages.createSuccess'));
      } else if (actionStatus.type === 'update_success') {
        message.success(t('jobs.messages.updateSuccess'));
      } else if (actionStatus.type === 'publish_success') {
        message.success(t('jobs.messages.publishSuccess'));
      } else if (actionStatus.type === 'close_success') {
        message.success(t('jobs.messages.closeSuccess'));
      } else if (actionStatus.type === 'delete_success') {
        message.success(t('jobs.messages.deleteSuccess'));
      }
      clearActionStatus();
    }
  }, [actionStatus, clearActionStatus, t]);

  // Error Handling
  useEffect(() => {
    if (error) {
      const msg = typeof error === 'string' ? error : error?.message || t('common.error');
      if (msg.includes('limit') || msg.includes('quota') || msg.includes('SUBSCRIPTION')) {
        message.error(t('jobs.messages.limitExceeded'));
      } else if (msg.includes('conflict') || msg.includes('modified')) {
        message.error(t('jobs.messages.concurrencyConflict'));
      } else if (msg.includes('referenced') || msg.includes('linked')) {
        message.error(t('jobs.messages.deleteBlocked'));
      } else {
        message.error(msg);
      }
      clearError();
    }
  }, [error, clearError, t]);

  // Debounced Search Handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearch(value);
    }, 400);
  };

  const handleSearchSubmit = (value) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setSearch(value);
  };

  // Filter Changes
  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value || null });
  };

  // Table Change
  const handleTableChange = (newPagination) => {
    if (newPagination.current !== pagination.page) {
      setPage(newPagination.current);
    }
    if (newPagination.pageSize !== pagination.pageSize) {
      setPageSize(newPagination.pageSize);
    }
  };

  // Drawer View
  const handleViewDetails = (jobRecord) => {
    getJobDetails(jobRecord.id);
    setDrawerVisible(true);
  };

  // Modal Triggers
  const handleOpenAddModal = () => {
    setSelectedJob(null);
    setEditingJob(null);
    setFormModalVisible(true);
  };

  const handleOpenEditModal = async (jobRecord) => {
    setEditingJob(jobRecord);
    await getJobDetails(jobRecord.id);
    setFormModalVisible(true);
  };

  // Form Modal Submissions
  const handleSaveDraftModal = async (values) => {
    const res = await saveDraft(values, editingJob?.id);
    if (!res.error) {
      setFormModalVisible(false);
      refreshJobs();
    }
  };

  const handlePublishModal = async (jobIdOrValues, valuesIfId) => {
    if (typeof jobIdOrValues === 'string') {
      const jobId = jobIdOrValues;
      if (valuesIfId) {
        await updateJob(jobId, valuesIfId);
      }
      const res = await publishJob(jobId);
      if (!res.error) {
        setFormModalVisible(false);
        refreshJobs();
      }
    } else {
      const values = jobIdOrValues;
      const res = await createJob({ ...values, status: 'Open', published: 1 });
      if (!res.error) {
        setFormModalVisible(false);
        refreshJobs();
      }
    }
  };

  const handleUpdateModal = async (jobId, values) => {
    const res = await updateJob(jobId, values);
    if (!res.error) {
      setFormModalVisible(false);
      refreshJobs();
    }
  };

  // Lifecycle Quick Actions
  const handlePublishClick = async (jobId) => {
    const res = await publishJob(jobId);
    if (!res.error) {
      refreshJobs();
    }
  };

  const handleCloseClick = async (jobId) => {
    const res = await closeJob(jobId);
    if (!res.error) {
      refreshJobs();
    }
  };

  const handleDeleteClick = async (jobId) => {
    const res = await deleteJob(jobId);
    if (!res.error) {
      if (selectedJob?.id === jobId) {
        setDrawerVisible(false);
      }
      refreshJobs();
    }
  };

  // Table Columns
  const columns = [
    {
      title: t('jobs.table.jobCode'),
      dataIndex: 'jobCode',
      key: 'jobCode',
      width: 120,
      render: (text, record) => (
        <a
          onClick={() => handleViewDetails(record)}
          style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand-teal, #1890ff)' }}
        >
          {text || record.name}
        </a>
      ),
    },
    {
      title: t('jobs.table.jobTitle'),
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink, #0f172a)' }}>
            <a onClick={() => handleViewDetails(record)} style={{ color: 'inherit' }}>
              {text}
            </a>
            {record.featuredJob && (
              <Tag color="gold" style={{ marginLeft: 8, fontSize: '0.7rem' }}>
                Featured
              </Tag>
            )}
          </div>
          <Text type="secondary" style={{ fontSize: '0.8rem' }}>
            {record.department ? `${record.department} • ` : ''}
            {record.profession || ''}
          </Text>
        </div>
      ),
    },
    {
      title: t('jobs.table.employmentType'),
      dataIndex: 'employmentType',
      key: 'employmentType',
      width: 140,
      render: (val) => val || '-',
    },
    {
      title: t('jobs.table.location'),
      dataIndex: 'location',
      key: 'location',
      render: (val, record) => (
        <div>
          <span style={{ fontSize: '0.85rem' }}>{val || '-'}</span>
          <div style={{ marginTop: 2 }}>
            {record.remote && <Tag color="blue" style={{ fontSize: '0.68rem', padding: '0 4px' }}>Remote</Tag>}
            {record.hybrid && <Tag color="purple" style={{ fontSize: '0.68rem', padding: '0 4px' }}>Hybrid</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: t('jobs.table.openings'),
      dataIndex: 'numberOfOpenings',
      key: 'numberOfOpenings',
      width: 90,
      align: 'center',
      render: (val) => <Text style={{ fontWeight: 600 }}>{val || 1}</Text>,
    },
    {
      title: t('jobs.table.applications'),
      dataIndex: 'applicationCount',
      key: 'applicationCount',
      width: 110,
      align: 'center',
      render: (cnt) => (
        <Badge
          count={cnt || 0}
          showZero
          overflowCount={9999}
          style={{
            backgroundColor: cnt > 0 ? 'var(--brand-teal, #1890ff)' : '#d9d9d9',
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      title: t('jobs.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {t(`jobs.statuses.${status}`, status)}
        </Tag>
      ),
    },
    {
      title: t('jobs.table.created'),
      dataIndex: 'creation',
      key: 'creation',
      width: 130,
      render: (dateStr) => (dateStr ? dayjs(dateStr).format('DD MMM YYYY') : '-'),
    },
    {
      title: t('jobs.table.actions'),
      key: 'actions',
      align: 'right',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<FiEye />}
            onClick={() => handleViewDetails(record)}
            title={t('jobs.drawer.title')}
          />
          <Button
            type="text"
            icon={<FiEdit />}
            onClick={() => handleOpenEditModal(record)}
            title={t('jobs.editJob')}
          />
          {(!record.published && record.status !== 'Open') && (
            <Button
              size="small"
              type="primary"
              icon={<FiSend />}
              onClick={() => handlePublishClick(record.id)}
              style={{ backgroundColor: 'var(--brand-teal, #1890ff)', borderColor: 'var(--brand-teal, #1890ff)' }}
            >
              {t('jobs.publishJob')}
            </Button>
          )}
          {(record.published || record.status === 'Open') && record.status !== 'Closed' && (
            <Tooltip title={t('jobs.closeJob')}>
              <Button
                type="text"
                icon={<FiLock />}
                onClick={() => handleCloseClick(record.id)}
                style={{ color: '#fa8c16' }}
              />
            </Tooltip>
          )}
          <Popconfirm
            title={t('jobs.messages.deleteConfirmTitle')}
            description={t('jobs.messages.deleteConfirmSub', { code: record.jobCode })}
            onConfirm={() => handleDeleteClick(record.id)}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<FiTrash2 />} title={t('jobs.deleteJob')} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="jobs-page" style={{ padding: '24px 32px' }}>
      {/* Page Header */}
      <PageHeader
        title={t('jobs.title')}
        subtitle={t('jobs.subtitle')}
        extra={
          <Space>
            <Button icon={<FiRefreshCw />} onClick={() => refreshJobs()} loading={loading}>
              {t('common.refresh')}
            </Button>
            <Button
              type="primary"
              icon={<FiPlus />}
              onClick={handleOpenAddModal}
              style={{ backgroundColor: 'var(--brand-navy, #0f172a)', borderColor: 'var(--brand-navy, #0f172a)' }}
            >
              {t('jobs.createJob')}
            </Button>
          </Space>
        }
      />

      {/* Search & Server-Side Filters Toolbar */}
      <Card size="small" style={{ marginBottom: 24, borderRadius: '8px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={7}>
            <Input.Search
              placeholder={t('jobs.searchPlaceholder')}
              allowClear
              enterButton={<FiSearch />}
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearchSubmit}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder={t('jobs.filters.status')}
              allowClear
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(val) => handleFilterChange('status', val)}
            >
              <Option value="Draft">{t('jobs.statuses.Draft')}</Option>
              <Option value="Open">{t('jobs.statuses.Open')}</Option>
              <Option value="Paused">{t('jobs.statuses.Paused')}</Option>
              <Option value="Closed">{t('jobs.statuses.Closed')}</Option>
              <Option value="Filled">{t('jobs.statuses.Filled')}</Option>
              <Option value="Cancelled">{t('jobs.statuses.Cancelled')}</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder={t('jobs.filters.employmentType')}
              allowClear
              style={{ width: '100%' }}
              value={filters.employmentType}
              onChange={(val) => handleFilterChange('employmentType', val)}
            >
              <Option value="Full-Time">Full-Time</Option>
              <Option value="Part-Time">Part-Time</Option>
              <Option value="Contract">Contract</Option>
              <Option value="Internship">Internship</Option>
              <Option value="Temporary">Temporary</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder={t('jobs.filters.workplaceType')}
              allowClear
              style={{ width: '100%' }}
              value={filters.remote ? 'remote' : filters.hybrid ? 'hybrid' : undefined}
              onChange={(val) => {
                if (val === 'remote') {
                  setFilters({ remote: 1, hybrid: null });
                } else if (val === 'hybrid') {
                  setFilters({ remote: null, hybrid: 1 });
                } else {
                  setFilters({ remote: null, hybrid: null });
                }
              }}
            >
              <Option value="remote">{t('jobs.filters.remoteOnly')}</Option>
              <Option value="hybrid">{t('jobs.filters.hybridOnly')}</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={5} style={{ textAlign: 'right' }}>
            <Button icon={<FiRotateCcw />} onClick={resetFilters}>
              {t('jobs.filters.resetFilters')}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Job Openings Table */}
      <Card size="small" style={{ borderRadius: '8px' }}>
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (tot, range) => `${range[0]}-${range[1]} of ${tot} jobs`,
          }}
          locale={{
            emptyText: t('jobs.empty.noJobs'),
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Job Profile Drawer */}
      <JobDetailsDrawer
        visible={drawerVisible}
        job={selectedJob}
        loading={loading}
        publishing={publishing}
        closing={closing}
        deleting={deleting}
        onClose={() => setDrawerVisible(false)}
        onEdit={(j) => {
          setEditingJob(j);
          setFormModalVisible(true);
        }}
        onPublish={handlePublishClick}
        onCloseJob={handleCloseClick}
        onDelete={handleDeleteClick}
        onRefresh={() => selectedJob && getJobDetails(selectedJob.id)}
      />

      {/* Job Form Modal */}
      <JobFormModal
        visible={formModalVisible}
        job={editingJob ? (selectedJob && selectedJob.id === editingJob.id ? selectedJob : editingJob) : null}
        loading={saving}
        savingDraft={saving}
        publishing={publishing}
        onClose={() => setFormModalVisible(false)}
        onSaveDraft={handleSaveDraftModal}
        onPublish={handlePublishModal}
        onUpdate={handleUpdateModal}
      />
    </div>
  );
};

export default JobsPage;
