import React, { useEffect, useState, useRef } from 'react';
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
  Tooltip,
  Radio,
} from 'antd';
import {
  FiPlus,
  FiSearch,
  FiEye,
  FiTrash2,
  FiRefreshCw,
  FiRotateCcw,
  FiCheckCircle,
  FiXCircle,
  FiGrid,
  FiList,
} from 'react-icons/fi';
import dayjs from 'dayjs';

import PageHeader from '../../../components/common/PageHeader';
import JobApplicationDetailsDrawer from './JobApplicationDetailsDrawer';
import JobApplicationFormModal from './JobApplicationFormModal';
import JobApplicationCard, { getStatusTagColor } from './JobApplicationCard';
import RecruitmentKanban from '../../../components/kanban/RecruitmentKanban';
import CandidateProfileDrawer from '../Candidates/CandidateProfileDrawer';

import { useJobApplications } from '../../../hooks/useJobApplications';
import { useLanguage } from '../../../hooks/useLanguage';
import candidateApi from '../../../services/candidateApi';

const { Text } = Typography;
const { Option } = Select;

export const JobApplicationsPage = () => {
  const { t } = useLanguage();

  const {
    items,
    selectedApplication,
    pagination,
    filters,
    sorting,
    search,
    loading,
    loadingDetails,
    saving,
    deleting,
    changingStatus,
    changingStage,
    actionStatus,
    error,
    loadApplications,
    refreshApplications,
    getApplicationDetails,
    createApplication,
    updateApplication,
    changeStatus,
    changeStage,
    deleteApplication,
    setSearch,
    setFilters,
    resetFilters,
    setSorting,
    setPage,
    clearSelectedApplication,
    clearActionStatus,
    clearError,
  } = useJobApplications();

  // Local Component State
  const [viewType, setViewType] = useState('table'); // 'table' | 'kanban'
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState(search || '');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const searchDebounceRef = useRef(null);

  // Candidate Drawer state
  const [candidateDrawerVisible, setCandidateDrawerVisible] = useState(false);
  const [candidateProfileData, setCandidateProfileData] = useState(null);
  const [loadingCandidate, setLoadingCandidate] = useState(false);

  // Canonical Identifier Normalizer for Job Application
  const getAppId = (app) => {
    if (!app) return '';
    if (typeof app === 'string') return app;
    return String(
      app.applicationId ||
      app.application_id ||
      app.name ||
      app.id ||
      ''
    );
  };

  // Responsive Viewport Resize Listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial & Reactive Data Loading
  useEffect(() => {
    if (viewType === 'table') {
      loadApplications();
    }
  }, [pagination.page, pagination.pageSize, filters, sorting, search, viewType]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  // Toast Notifications for Action Status
  useEffect(() => {
    if (actionStatus) {
      if (actionStatus.type === 'create_success') {
        message.success(t('jobApplications.messages.createSuccess', 'Job application created successfully.'));
      } else if (actionStatus.type === 'update_success') {
        message.success(t('jobApplications.messages.updateSuccess', 'Job application updated successfully.'));
      } else if (actionStatus.type === 'status_success') {
        message.success(t('jobApplications.messages.statusSuccess', 'Application status updated successfully.'));
      } else if (actionStatus.type === 'stage_success') {
        message.success(t('jobApplications.messages.stageSuccess', 'Recruitment stage updated successfully.'));
      } else if (actionStatus.type === 'delete_success') {
        message.success(t('jobApplications.messages.deleteSuccess', 'Job application deleted successfully.'));
      }
      clearActionStatus();
    }
  }, [actionStatus, clearActionStatus, t]);

  // Error Toast Notifications
  useEffect(() => {
    if (error) {
      const msg = typeof error === 'string' ? error : error?.message || t('common.error');
      if (msg.includes('Conflict') || msg.includes('409') || msg.includes('already applied')) {
        message.error(t('jobApplications.messages.duplicateConflict'));
      } else if (msg.includes('history') || msg.includes('Interview') || msg.includes('Offer')) {
        message.error(t('jobApplications.messages.deleteBlocked'));
      } else {
        message.error(msg);
      }
      clearError();
    }
  }, [error, clearError, t]);

  // Server-Side Search with 400ms Debounce
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
  const handleStageFilterChange = (val) => {
    setFilters({ currentStage: val || null });
  };

  const handleStatusFilterChange = (val) => {
    setFilters({ status: val || null });
  };

  const handlePriorityFilterChange = (val) => {
    setFilters({ priority: val || null });
  };

  const handleSourceFilterChange = (val) => {
    setFilters({ source: val || null });
  };

  const handleResetAllFilters = () => {
    setSearchTerm('');
    resetFilters();
  };

  // Server-Side Sort Change
  const handleSortChange = (sorter) => {
    if (sorter && sorter.field) {
      setSorting({
        orderBy: sorter.field === 'candidateName' ? 'candidate' : sorter.field === 'jobTitle' ? 'job_opening' : sorter.field,
        orderDir: sorter.order === 'ascend' ? 'asc' : 'desc',
      });
    }
  };

  // Table Change (Pagination & Sorting)
  const handleTableChange = (newPagination, _, sorter) => {
    if (newPagination.current !== pagination.page) {
      setPage(newPagination.current);
    }
    if (newPagination.pageSize !== pagination.pageSize) {
      setPageSize(newPagination.pageSize);
    }
    if (sorter && sorter.field) {
      handleSortChange(sorter);
    }
  };

  // Drawer View Details Flow
  const handleViewDetails = async (record) => {
    const appId = getAppId(record);
    if (!appId) return;

    setSelectedApplicationId(appId);
    setDrawerVisible(true);

    await getApplicationDetails(appId);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedApplicationId(null);
    clearSelectedApplication();
  };

  // View Candidate Profile Drawer
  const handleViewCandidateProfile = async (candidateId) => {
    if (!candidateId) return;
    setLoadingCandidate(true);
    setCandidateDrawerVisible(true);
    try {
      const res = await candidateApi.getCandidate(candidateId);
      const data = res?.data || res?.message || res;
      setCandidateProfileData(data);
    } catch (err) {
      message.error('Failed to load candidate profile');
      setCandidateDrawerVisible(false);
    } finally {
      setLoadingCandidate(false);
    }
  };

  // Modal Open Handlers
  const handleOpenCreateModal = () => {
    setEditingApplication(null);
    setFormModalVisible(true);
  };

  const handleFormSubmit = async (values, applicationId) => {
    if (applicationId) {
      const res = await updateApplication(applicationId, values);
      if (!res.error) setFormModalVisible(false);
    } else {
      const res = await createApplication(values);
      if (!res.error) setFormModalVisible(false);
    }
  };

  // Quick Action Handlers
  const handleQuickStatusChange = async (applicationId, status) => {
    const appId = getAppId(applicationId);
    await changeStatus(appId, status);
  };

  const handleDeleteClick = async (applicationId) => {
    const appId = getAppId(applicationId);
    const res = await deleteApplication(appId);
    if (!res.error) {
      if (selectedApplicationId === appId || selectedApplication?.id === appId) {
        handleCloseDrawer();
      }
    }
  };

  // Desktop Table Columns
  const columns = [
    {
      title: t('jobApplications.table.id'),
      dataIndex: 'id',
      key: 'id',
      width: 120,
      sorter: true,
      render: (text, record) => (
        <a
          onClick={() => handleViewDetails(record)}
          style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand-teal, #1890ff)' }}
        >
          #{text}
        </a>
      ),
    },
    {
      title: t('jobApplications.table.candidate'),
      dataIndex: 'candidateName',
      key: 'candidateName',
      sorter: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink, #0f172a)' }}>
            <a onClick={() => handleViewCandidateProfile(record.candidate)} style={{ color: 'inherit' }}>
              {text || record.candidate}
            </a>
          </div>
          {record.candidateEmail && (
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>
              {record.candidateEmail}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: t('jobApplications.table.jobOpening'),
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      sorter: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text || record.jobOpening}</div>
          {record.jobCode && (
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>
              {record.jobCode}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: t('jobApplications.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 140,
      sorter: true,
      render: (status) => (
        <Tag color={getStatusTagColor(status)}>
          {t(`jobApplications.statuses.${status}`, status)}
        </Tag>
      ),
    },
    {
      title: t('jobApplications.table.currentStage', 'Current Stage'),
      dataIndex: 'currentStage',
      key: 'currentStage',
      width: 140,
      render: (stage, record) => (
        <Tag color="geekblue">{stage || record.status || 'Applied'}</Tag>
      ),
    },
    {
      title: t('jobApplications.table.priority'),
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      sorter: true,
      render: (p) => (
        <Tag color={p === 'High' ? 'red' : p === 'Low' ? 'default' : 'orange'}>{p || 'Medium'}</Tag>
      ),
    },
    {
      title: t('jobApplications.table.source'),
      dataIndex: 'source',
      key: 'source',
      width: 110,
      render: (src) => src || '-',
    },
    {
      title: t('jobApplications.table.appliedOn'),
      dataIndex: 'appliedOn',
      key: 'appliedOn',
      width: 130,
      sorter: true,
      render: (dateStr) => (dateStr ? dayjs(dateStr).format('DD MMM YYYY') : '-'),
    },
    {
      title: t('jobApplications.table.actions'),
      key: 'actions',
      align: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('common.viewDetails', 'View Details')}>
            <Button
              type="text"
              icon={<FiEye />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>

          {record.status !== 'Shortlisted' &&
            record.currentStage !== 'Shortlisted' &&
            record.status !== 'Rejected' &&
            record.currentStage !== 'Rejected' && (
              <Tooltip title={t('jobApplications.actions.shortlist', 'Shortlist')}>
                <Button
                  type="text"
                  icon={<FiCheckCircle style={{ color: '#52c41a' }} />}
                  onClick={() => handleQuickStatusChange(record.id, 'Shortlisted')}
                />
              </Tooltip>
            )}

          {record.status !== 'Rejected' && record.currentStage !== 'Rejected' && (
            <Tooltip title={t('jobApplications.actions.reject', 'Reject')}>
              <Button
                type="text"
                icon={<FiXCircle style={{ color: '#ff4d4f' }} />}
                onClick={() => handleQuickStatusChange(record.id, 'Rejected')}
              />
            </Tooltip>
          )}

          <Popconfirm
            title={t('jobApplications.messages.deleteConfirmTitle')}
            description={t('jobApplications.messages.deleteConfirmSub')}
            onConfirm={() => handleDeleteClick(record.id)}
            okText={t('common.confirm', 'Confirm')}
            cancelText={t('common.cancel', 'Cancel')}
            okButtonProps={{ danger: true }}
          >
            <Tooltip title={t('common.delete', 'Delete')}>
              <Button type="text" danger icon={<FiTrash2 />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="job-applications-page" style={{ padding: '24px 32px' }}>
      {/* Page Header */}
      <PageHeader
        title={t('jobApplications.title', 'Job Applications')}
        subtitle={t('jobApplications.subtitle', 'Backend-driven recruitment lifecycle and candidate pipeline tracking.')}
        extra={
          <Space wrap>
            <Radio.Group
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="table">
                <FiList style={{ marginRight: 4, verticalAlign: '-1px' }} /> Table
              </Radio.Button>
              <Radio.Button value="kanban">
                <FiGrid style={{ marginRight: 4, verticalAlign: '-1px' }} /> Kanban
              </Radio.Button>
            </Radio.Group>
            <Button icon={<FiRefreshCw />} onClick={() => refreshApplications()} loading={loading}>
              {t('common.refresh', 'Refresh')}
            </Button>
            <Button
              type="primary"
              icon={<FiPlus />}
              onClick={handleOpenCreateModal}
              style={{ backgroundColor: 'var(--brand-navy, #0f172a)', borderColor: 'var(--brand-navy, #0f172a)' }}
            >
              {t('jobApplications.createApplication', 'New Application')}
            </Button>
          </Space>
        }
      />

      {viewType === 'kanban' ? (
        <RecruitmentKanban
          onViewApplication={(app) => handleViewDetails(app)}
          onViewCandidate={(candId) => handleViewCandidateProfile(candId)}
        />
      ) : (
        <>
          {/* Toolbar with Search and Filters */}
          <Card size="small" style={{ marginBottom: 24, borderRadius: '8px' }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={12} md={6}>
                <Input.Search
                  placeholder={t('jobApplications.searchPlaceholder')}
                  allowClear
                  enterButton={<FiSearch />}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onSearch={handleSearchSubmit}
                />
              </Col>

              <Col xs={12} sm={6} md={4}>
                <Select
                  placeholder={t('jobApplications.table.currentStage', 'Stage')}
                  allowClear
                  style={{ width: '100%' }}
                  value={filters.currentStage}
                  onChange={handleStageFilterChange}
                >
                  <Option value="Applied">Applied</Option>
                  <Option value="Screening">Screening</Option>
                  <Option value="Shortlisted">Shortlisted</Option>
                  <Option value="Interview">Interview</Option>
                  <Option value="Technical">Technical</Option>
                  <Option value="HR">HR</Option>
                  <Option value="Offered">Offered</Option>
                  <Option value="Hired">Hired</Option>
                  <Option value="Rejected">Rejected</Option>
                  <Option value="Withdrawn">Withdrawn</Option>
                </Select>
              </Col>

              <Col xs={12} sm={6} md={4}>
                <Select
                  placeholder={t('jobApplications.filters.status', 'Status')}
                  allowClear
                  style={{ width: '100%' }}
                  value={filters.status}
                  onChange={handleStatusFilterChange}
                >
                  <Option value="Open">Open</Option>
                  <Option value="Closed">Closed</Option>
                  <Option value="Hired">Hired</Option>
                  <Option value="Rejected">Rejected</Option>
                </Select>
              </Col>

              <Col xs={12} sm={6} md={3}>
                <Select
                  placeholder={t('jobApplications.table.priority', 'Priority')}
                  allowClear
                  style={{ width: '100%' }}
                  value={filters.priority}
                  onChange={handlePriorityFilterChange}
                >
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                  <Option value="Critical">Critical</Option>
                </Select>
              </Col>

              <Col xs={12} sm={6} md={4}>
                <Select
                  placeholder={t('jobApplications.table.source', 'Source')}
                  allowClear
                  style={{ width: '100%' }}
                  value={filters.source}
                  onChange={handleSourceFilterChange}
                >
                  <Option value="Career Portal">Career Portal</Option>
                  <Option value="LinkedIn">LinkedIn</Option>
                  <Option value="Referral">Employee Referral</Option>
                  <Option value="Naukri">Naukri</Option>
                  <Option value="Foundit">Foundit</Option>
                  <Option value="Direct">Direct</Option>
                  <Option value="Agency">Agency</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Col>

              <Col xs={12} sm={6} md={3} style={{ textAlign: 'right' }}>
                <Button icon={<FiRotateCcw />} onClick={handleResetAllFilters} style={{ width: '100%' }}>
                  {t('jobApplications.filters.reset', 'Reset')}
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Main Content Area (Table or Cards for Mobile) */}
          {isMobileView ? (
            <div className="mobile-applications-list">
              {items.length === 0 && !loading ? (
                <Card style={{ textAlign: 'center', borderRadius: 8 }}>
                  <Text type="secondary">{t('jobApplications.empty.noApplications')}</Text>
                </Card>
              ) : (
                items.map((app) => (
                  <JobApplicationCard
                    key={app.id}
                    application={app}
                    onViewDetails={handleViewDetails}
                    onQuickStatusChange={handleQuickStatusChange}
                    onDelete={handleDeleteClick}
                  />
                ))
              )}
            </div>
          ) : (
            <Card size="small" style={{ borderRadius: '8px' }}>
              <Table
                columns={columns}
                dataSource={items}
                rowKey="id"
                loading={loading}
                onChange={handleTableChange}
                onRow={(record) => ({
                  onClick: (e) => {
                    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.ant-popover')) {
                      return;
                    }
                    handleViewDetails(record);
                  },
                  style: { cursor: 'pointer' },
                })}
                pagination={{
                  current: pagination.page,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (tot, range) => `${range[0]}-${range[1]} of ${tot} applications`,
                }}
                locale={{
                  emptyText: t('jobApplications.empty.noApplications'),
                }}
                scroll={{ x: 900 }}
              />
            </Card>
          )}
        </>
      )}

      {/* Application Details Drawer */}
      <JobApplicationDetailsDrawer
        open={drawerVisible}
        visible={drawerVisible}
        applicationId={selectedApplicationId}
        application={selectedApplication}
        loading={loadingDetails || (loading && !selectedApplication)}
        saving={saving}
        deleting={deleting}
        changingStatus={changingStatus}
        changingStage={changingStage}
        onClose={handleCloseDrawer}
        onEdit={(app) => {
          setEditingApplication(app);
          setFormModalVisible(true);
        }}
        onChangeStatus={handleQuickStatusChange}
        onChangeStage={changeStage}
        onDelete={handleDeleteClick}
      />

      {/* Candidate Profile Drawer */}
      <CandidateProfileDrawer
        visible={candidateDrawerVisible}
        candidate={candidateProfileData}
        loading={loadingCandidate}
        onClose={() => setCandidateDrawerVisible(false)}
        onEdit={() => {}}
        onDelete={() => {}}
      />

      {/* Application Create / Edit Modal */}
      <JobApplicationFormModal
        visible={formModalVisible}
        application={editingApplication}
        loading={saving}
        onClose={() => setFormModalVisible(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default JobApplicationsPage;
