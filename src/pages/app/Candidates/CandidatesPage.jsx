import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Progress,
  Avatar,
  Card,
  Row,
  Col,
  Typography,
  Radio,
  Popconfirm,
  message,
  Grid,
} from 'antd';
import {
  FiUserPlus,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiTrash2,
  FiMail,
  FiPhone,
  FiGlobe,
  FiRefreshCw,
  FiGrid,
  FiList,
} from 'react-icons/fi';
import dayjs from 'dayjs';

import PageHeader from '../../../components/common/PageHeader';
import CandidateProfileDrawer from './CandidateProfileDrawer';
import CandidateFormModal from './CandidateFormModal';
import CandidateSubresourceModal from './CandidateSubresourceModal';
import CandidateCard from './CandidateCard';
import RecruitmentKanban from '../../../components/kanban/RecruitmentKanban';
import JobApplicationDetailsDrawer from '../JobApplications/JobApplicationDetailsDrawer';

import { useCandidates } from '../../../hooks/useCandidates';
import { useLanguage } from '../../../hooks/useLanguage';
import jobApplicationApi from '../../../services/jobApplicationApi';

const { Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

export const CandidatesPage = () => {
  const { t } = useLanguage();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const {
    candidates,
    selectedCandidate,
    profileCompleteness,
    status,
    loading,
    drawerLoading,
    actionStatus,
    saving,
    deleting,
    error,
    viewMode,
    pagination,
    filters,
    loadCandidates,
    loadDomesticCandidates,
    loadInternationalCandidates,
    getCandidateDetails,
    getProfileCompleteness,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    saveSubresource,
    setFilters,
    setViewMode,
    clearSelected,
  } = useCandidates();

  // Local UI State
  const [displayType, setDisplayType] = useState('table'); // 'table' | 'kanban'
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [subresourceModalVisible, setSubresourceModalVisible] = useState(false);
  const [subresourceType, setSubresourceType] = useState('education');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const searchDebounceRef = useRef(null);

  // Application Drawer state (when opening an application from Kanban)
  const [appDrawerVisible, setAppDrawerVisible] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loadingApp, setLoadingApp] = useState(false);

  // Initial & View Mode Data Fetcher
  const loadData = useCallback(
    (overrideParams = {}) => {
      if (viewMode === 'domestic') {
        loadDomesticCandidates(overrideParams);
      } else if (viewMode === 'international') {
        loadInternationalCandidates(overrideParams);
      } else {
        loadCandidates(overrideParams);
      }
    },
    [viewMode, loadCandidates, loadDomesticCandidates, loadInternationalCandidates]
  );

  useEffect(() => {
    if (displayType === 'table') {
      loadData();
    }
  }, [loadData, displayType]);

  // Handle View Mode Change (All / Domestic / International)
  const handleViewModeChange = (e) => {
    const newMode = e.target.value;
    setViewMode(newMode);
    if (newMode === 'domestic') {
      loadDomesticCandidates({ page: 1 });
    } else if (newMode === 'international') {
      loadInternationalCandidates({ page: 1 });
    } else {
      loadCandidates({ page: 1 });
    }
  };

  // Handle Search Input Change (debounced: 400ms)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setFilters({ search: value });
      loadData({ search: value, page: 1 });
    }, 400);
  };

  // Handle Search Submit (immediate: Enter key or button)
  const handleSearchSubmit = (value) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setFilters({ search: value });
    loadData({ search: value, page: 1 });
  };

  // Handle Filter Changes
  const handleFilterChange = (key, value) => {
    const updated = { [key]: value || null };
    setFilters(updated);
    loadData({ ...updated, page: 1 });
  };

  // Handle Sort Change
  const handleSortChange = (val) => {
    handleFilterChange('orderBy', val);
  };

  // Handle Pagination Change
  const handleTableChange = (newPagination) => {
    loadData({
      page: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // Drawer View Profile
  const handleViewProfile = async (record) => {
    const id = typeof record === 'string' ? record : record.id || record.name || record.candidateId;
    if (!id) return;
    try {
      await getCandidateDetails(id);
      await getProfileCompleteness(id);
      setDrawerVisible(true);
    } catch (err) {
      message.error(typeof err === 'string' ? err : err?.message || 'Failed to view profile');
    }
  };

  // Handle View Application from Kanban
  const handleViewApplicationFromKanban = async (app) => {
    const appId = app.id || app;
    setLoadingApp(true);
    setAppDrawerVisible(true);
    try {
      const res = await jobApplicationApi.getApplication(appId);
      const data = res?.data || res?.message || res;
      setSelectedApp(data);
    } catch (err) {
      message.error('Failed to load application details');
    } finally {
      setLoadingApp(false);
    }
  };

  // Form Modal Openers
  const handleOpenAddModal = () => {
    setEditingCandidate(null);
    setFormModalVisible(true);
  };

  const handleOpenEditModal = async (record) => {
    const id = typeof record === 'string' ? record : record.id || record.name || record.candidateId;
    if (!id) return;
    try {
      const fullCand = await getCandidateDetails(id);
      setEditingCandidate(fullCand || record);
    } catch (err) {
      setEditingCandidate(record);
    }
    setFormModalVisible(true);
  };

  // Form Submission
  const handleFormSubmit = async (values) => {
    try {
      if (editingCandidate?.id || editingCandidate?.name) {
        const targetId = editingCandidate.id || editingCandidate.name;
        await updateCandidate(targetId, values);
        message.success(t('candidate.messages.updateSuccess', 'Candidate profile updated successfully.'));
      } else {
        await createCandidate(values);
        message.success(t('candidate.messages.createSuccess', 'Candidate profile created successfully.'));
      }
      loadData();
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || t('candidate.messages.validationError');
      message.error(msg);
      throw err;
    }
  };

  // Delete Candidate
  const handleDelete = async (candidateId) => {
    try {
      await deleteCandidate(candidateId);
      message.success(t('candidate.messages.deleteSuccess', 'Candidate record deleted successfully.'));
      if (drawerVisible && (selectedCandidate?.id === candidateId || selectedCandidate?.name === candidateId)) {
        setDrawerVisible(false);
        clearSelected();
      }
      loadData();
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || t('candidate.messages.deleteBlocked');
      message.error(msg);
    }
  };

  // Subresource Modal Openers & State
  const [subresourceInitialValues, setSubresourceInitialValues] = useState(null);
  const [subresourceEditIndex, setSubresourceEditIndex] = useState(null);

  const handleOpenSubresourceModal = (type, item = null, index = null) => {
    setSubresourceType(type);
    setSubresourceInitialValues(item);
    setSubresourceEditIndex(index);
    setSubresourceModalVisible(true);
  };

  const handleSubresourceSubmit = async ({ resourceType, items }) => {
    if (!selectedCandidate?.id) return;
    try {
      const res = await saveSubresource(selectedCandidate.id, resourceType, items);
      if (res?.error) throw new Error(res.error.message || 'Subresource save failed');
      message.success(t('candidate.messages.subresourceSuccess', 'Child record updated successfully.'));
      // Refresh selected candidate inside drawer
      getCandidateDetails(selectedCandidate.id);
    } catch (err) {
      const errMsg = typeof err === 'string' ? err : err?.message || err?.error?.message || t('candidate.messages.subresourceError', { type: resourceType });
      message.error(errMsg);
      throw err;
    }
  };

  // Table Columns
  const columns = [
    {
      title: t('candidate.table.name'),
      dataIndex: 'fullName',
      key: 'fullName',
      render: (_, record) => (
        <Space align="center" size="middle">
          <Avatar
            style={{
              backgroundColor: 'var(--brand-navy-soft, #e6f0fa)',
              color: 'var(--brand-teal, #008080)',
              fontWeight: 600,
            }}
          >
            {(record.fullName || 'C').charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>
              <a onClick={() => handleViewProfile(record)} style={{ color: 'inherit' }}>
                {record.fullName}
              </a>
              {record.isInternational && (
                <Tag color="cyan" style={{ marginLeft: 8, fontSize: '0.7rem' }}>
                  Intl
                </Tag>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>
              <FiMail style={{ marginRight: 4 }} />
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: t('candidate.table.profession'),
      dataIndex: 'currentJobTitle',
      key: 'profession',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.currentJobTitle || record.profession || '-'}</div>
          {record.currentCompany && (
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>
              {record.currentCompany}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: t('candidate.table.experience'),
      dataIndex: 'yearsOfExperience',
      key: 'yearsOfExperience',
      render: (val) => `${val || 0} yrs`,
    },
    {
      title: t('candidate.table.location'),
      dataIndex: 'locationDisplay',
      key: 'locationDisplay',
      render: (val) => val || '-',
    },
    {
      title: t('candidate.table.completion'),
      dataIndex: 'profileCompletion',
      key: 'profileCompletion',
      render: (score) => (
        <Progress
          percent={score || 0}
          size="small"
          strokeColor="var(--brand-teal)"
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: t('candidate.table.created'),
      dataIndex: 'creation',
      key: 'creation',
      render: (dateStr) => (dateStr ? dayjs(dateStr).format('DD MMM YYYY') : '-'),
    },
    {
      title: t('candidate.table.actions'),
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<FiEye />}
            onClick={() => handleViewProfile(record)}
            title={t('candidate.actions.viewProfile')}
          />
          <Button
            type="text"
            icon={<FiEdit />}
            onClick={() => handleOpenEditModal(record)}
            title={t('candidate.actions.edit')}
          />
          <Popconfirm
            title={t('candidate.messages.deleteConfirmTitle')}
            description={t('candidate.messages.deleteConfirmSub')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<FiTrash2 />} title={t('candidate.actions.delete')} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="candidates-page" style={{ padding: '24px 32px' }}>
      {/* Page Header */}
      <PageHeader
        title={t('candidate.title', 'Candidates')}
        subtitle={t('candidate.subtitle', 'Enterprise talent pool management and recruitment stage pipeline.')}
        extra={
          <Space wrap>
            <Radio.Group
              value={displayType}
              onChange={(e) => setDisplayType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="table">
                <FiList style={{ marginRight: 4, verticalAlign: '-1px' }} /> Table
              </Radio.Button>
              <Radio.Button value="kanban">
                <FiGrid style={{ marginRight: 4, verticalAlign: '-1px' }} /> Recruitment Kanban
              </Radio.Button>
            </Radio.Group>
            <Button icon={<FiRefreshCw />} onClick={() => loadData()}>
              {t('common.refresh')}
            </Button>
            <Button
              type="primary"
              icon={<FiUserPlus />}
              onClick={handleOpenAddModal}
              style={{ backgroundColor: 'var(--brand-navy)', borderColor: 'var(--brand-navy)' }}
            >
              {t('candidate.addCandidate')}
            </Button>
          </Space>
        }
      />

      {displayType === 'kanban' ? (
        <RecruitmentKanban
          onViewApplication={handleViewApplicationFromKanban}
          onViewCandidate={handleViewProfile}
        />
      ) : (
        <>
          {/* View Mode Radio Switcher & Filters Toolbar */}
          <Card size="small" style={{ marginBottom: 24, borderRadius: '8px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col>
                  <Radio.Group value={viewMode} onChange={handleViewModeChange} buttonStyle="solid">
                    <Radio.Button value="all">{t('candidate.allCandidates', 'All Candidates')}</Radio.Button>
                    <Radio.Button value="domestic">{t('candidate.domesticCandidates', 'Domestic')}</Radio.Button>
                    <Radio.Button value="international">{t('candidate.internationalCandidates', 'International')}</Radio.Button>
                  </Radio.Group>
                </Col>
                <Col>
                  <Select
                    value={filters.orderBy || 'creation desc'}
                    onChange={handleSortChange}
                    style={{ width: 180 }}
                    placeholder="Sort by"
                  >
                    <Option value="creation desc">Newest First</Option>
                    <Option value="creation asc">Oldest First</Option>
                    <Option value="first_name asc">Name (A-Z)</Option>
                    <Option value="first_name desc">Name (Z-A)</Option>
                    <Option value="modified desc">Recently Modified</Option>
                  </Select>
                </Col>
              </Row>

              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={10}>
                  <Input.Search
                    placeholder={t('candidate.searchPlaceholder')}
                    allowClear
                    enterButton={<FiSearch />}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onSearch={handleSearchSubmit}
                  />
                </Col>
                <Col xs={12} sm={6} md={7}>
                  <Select
                    placeholder={t('candidate.filterStatus', 'Status')}
                    allowClear
                    style={{ width: '100%' }}
                    value={filters.status}
                    onChange={(val) => handleFilterChange('status', val)}
                  >
                    <Option value="Draft">Draft</Option>
                    <Option value="Active">Active</Option>
                    <Option value="In Review">In Review</Option>
                    <Option value="Interviewing">Interviewing</Option>
                    <Option value="Offered">Offered</Option>
                    <Option value="Hired">Hired</Option>
                    <Option value="Rejected">Rejected</Option>
                    <Option value="Archived">Archived</Option>
                  </Select>
                </Col>
                <Col xs={12} sm={6} md={7}>
                  <Select
                    placeholder={t('candidate.filterEmploymentType', 'Employment Type')}
                    allowClear
                    style={{ width: '100%' }}
                    value={filters.employmentType}
                    onChange={(val) => handleFilterChange('employmentType', val)}
                  >
                    <Option value="Full Time">Full Time</Option>
                    <Option value="Part Time">Part Time</Option>
                    <Option value="Contract">Contract</Option>
                    <Option value="Internship">Internship</Option>
                    <Option value="Freelance">Freelance</Option>
                    <Option value="Temporary">Temporary</Option>
                  </Select>
                </Col>
              </Row>
            </Space>
          </Card>

          {/* Candidate Data Display: Responsive Table or Mobile Cards */}
          {isMobile ? (
            <div>
              {loading ? (
                <Card loading style={{ borderRadius: '8px' }} />
              ) : candidates.length === 0 ? (
                <Card style={{ borderRadius: '8px', textAlign: 'center', padding: '32px' }}>
                  <Text type="secondary">{t('candidate.empty.noCandidates')}</Text>
                </Card>
              ) : (
                candidates.map((cand) => (
                  <CandidateCard
                    key={cand.id}
                    candidate={cand}
                    onViewProfile={handleViewProfile}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          ) : (
            <Card size="small" style={{ borderRadius: '8px' }}>
              <Table
                columns={columns}
                dataSource={candidates}
                rowKey="id"
                loading={loading}
                onChange={handleTableChange}
                pagination={{
                  current: pagination.page,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '25', '50', '100'],
                  showTotal: (tot, range) => `${range[0]}-${range[1]} of ${tot} candidates`,
                }}
                locale={{
                  emptyText: t('candidate.empty.noCandidates'),
                }}
                scroll={{ x: 800 }}
              />
            </Card>
          )}
        </>
      )}

      {/* Talent Profile Drawer */}
      <CandidateProfileDrawer
        visible={drawerVisible}
        candidate={selectedCandidate}
        loading={drawerLoading}
        onClose={() => setDrawerVisible(false)}
        onEdit={(cand) => {
          setEditingCandidate(cand);
          setFormModalVisible(true);
        }}
        onDelete={handleDelete}
        onRefresh={() => selectedCandidate && getCandidateDetails(selectedCandidate.id)}
        onOpenSubresourceModal={handleOpenSubresourceModal}
      />

      {/* Application Details Drawer (from Kanban) */}
      <JobApplicationDetailsDrawer
        visible={appDrawerVisible}
        application={selectedApp}
        loading={loadingApp}
        onClose={() => setAppDrawerVisible(false)}
        onChangeStatus={async (appId, st) => {
          await jobApplicationApi.changeStatus(appId, st);
          message.success(`Status updated to ${st}`);
        }}
        onChangeStage={async (appId, stg) => {
          await jobApplicationApi.changeStage(appId, stg);
          message.success(`Stage updated to ${stg}`);
        }}
        onDelete={async (appId) => {
          await jobApplicationApi.deleteApplication(appId);
          message.success('Application deleted');
          setAppDrawerVisible(false);
        }}
      />

      {/* Candidate Form Modal */}
      <CandidateFormModal
        visible={formModalVisible}
        candidate={editingCandidate}
        loading={saving}
        onClose={() => setFormModalVisible(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Subresource Child Table Modal */}
      <CandidateSubresourceModal
        visible={subresourceModalVisible}
        resourceType={subresourceType}
        candidate={selectedCandidate}
        initialValues={subresourceInitialValues}
        editIndex={subresourceEditIndex}
        loading={saving}
        onClose={() => {
          setSubresourceModalVisible(false);
          setSubresourceInitialValues(null);
          setSubresourceEditIndex(null);
        }}
        onSubmit={handleSubresourceSubmit}
      />
    </div>
  );
};

export default CandidatesPage;
