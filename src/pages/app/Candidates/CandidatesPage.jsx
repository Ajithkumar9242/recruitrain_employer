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
  Dropdown,
  Popconfirm,
  message,
} from 'antd';
import {
  FiUserPlus,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiMail,
  FiPhone,
  FiGlobe,
  FiRefreshCw,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import PageHeader from '../../../components/common/PageHeader';
import CandidateProfileDrawer from './CandidateProfileDrawer';
import CandidateFormModal from './CandidateFormModal';
import CandidateSubresourceModal from './CandidateSubresourceModal';

import {
  fetchCandidates,
  fetchCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  saveSubresource,
  setCandidateFilters,
  setSelectedCandidate,
  clearSelectedCandidate,
  selectCandidateList,
  selectSelectedCandidate,
  selectCandidateStatus,
  selectCandidateDrawerLoading,
  selectCandidateActionStatus,
  selectCandidatePagination,
  selectCandidateFilters,
} from '../../../store/slices/candidateSlice';
import { useLanguage } from '../../../hooks/useLanguage';

const { Text } = Typography;
const { Option } = Select;

export const CandidatesPage = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();

  // Redux Selectors
  const candidates = useSelector(selectCandidateList);
  const selectedCandidate = useSelector(selectSelectedCandidate);
  const status = useSelector(selectCandidateStatus);
  const drawerLoading = useSelector(selectCandidateDrawerLoading);
  const actionStatus = useSelector(selectCandidateActionStatus);
  const pagination = useSelector(selectCandidatePagination);
  const filters = useSelector(selectCandidateFilters);

  // Local State
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [subresourceModalVisible, setSubresourceModalVisible] = useState(false);
  const [subresourceType, setSubresourceType] = useState('education');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const searchDebounceRef = useRef(null);

  // Initial Fetch & Dependencies
  const loadData = useCallback(
    (overrideParams = {}) => {
      dispatch(fetchCandidates(overrideParams));
    },
    [dispatch]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Search Input Change (debounced: 400ms)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      dispatch(setCandidateFilters({ search: value }));
      loadData({ search: value, page: 1 });
    }, 400);
  };

  // Handle Search Submit (immediate: Enter or search button click)
  const handleSearchSubmit = (value) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    dispatch(setCandidateFilters({ search: value }));
    loadData({ search: value, page: 1 });
  };

  // Handle Filter Changes
  const handleFilterChange = (key, value) => {
    const updated = { [key]: value || null };
    dispatch(setCandidateFilters(updated));
    loadData({ ...updated, page: 1 });
  };

  // Handle Pagination Change
  const handleTableChange = (newPagination) => {
    loadData({
      page: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // Drawer Open
  const handleViewProfile = (record) => {
    dispatch(fetchCandidateById(record.id));
    setDrawerVisible(true);
  };

  // Form Modal Open
  const handleOpenAddModal = () => {
    setEditingCandidate(null);
    setFormModalVisible(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingCandidate(record);
    setFormModalVisible(true);
  };

  // Form Submission
  const handleFormSubmit = async (values) => {
    if (editingCandidate?.id) {
      await dispatch(
        updateCandidate({ candidateId: editingCandidate.id, data: values })
      ).unwrap();
      message.success(t('candidate.messages.updateSuccess'));
    } else {
      await dispatch(createCandidate(values)).unwrap();
      message.success(t('candidate.messages.createSuccess'));
    }
  };

  // Delete Candidate
  const handleDelete = async (candidateId) => {
    try {
      await dispatch(deleteCandidate(candidateId)).unwrap();
      message.success(t('candidate.messages.deleteSuccess'));
      if (drawerVisible && selectedCandidate?.id === candidateId) {
        setDrawerVisible(false);
        dispatch(clearSelectedCandidate());
      }
    } catch (err) {
      message.error(err || 'Failed to delete candidate.');
    }
  };

  // Subresource Modal Open
  const handleOpenSubresourceModal = (type) => {
    setSubresourceType(type);
    setSubresourceModalVisible(true);
  };

  const handleSubresourceSubmit = async ({ resourceType, items }) => {
    if (!selectedCandidate?.id) return;
    await dispatch(
      saveSubresource({
        candidateId: selectedCandidate.id,
        resourceType,
        items,
      })
    ).unwrap();
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
              backgroundColor: 'var(--brand-navy-soft)',
              color: 'var(--brand-teal)',
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
      sorter: false,
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
        title={t('candidate.title')}
        subtitle={t('candidate.subtitle')}
        extra={
          <Space>
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

      {/* Search & Server-Side Filters Toolbar */}
      <Card size="small" style={{ marginBottom: 24, borderRadius: '8px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder={t('candidate.searchPlaceholder')}
              allowClear
              enterButton={<FiSearch />}
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearchSubmit}
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              placeholder={t('candidate.filterStatus')}
              allowClear
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(val) => handleFilterChange('status', val)}
            >
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
              <Option value="Archived">Archived</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              placeholder={t('candidate.filterEmploymentType')}
              allowClear
              style={{ width: '100%' }}
              value={filters.employmentType}
              onChange={(val) => handleFilterChange('employmentType', val)}
            >
              <Option value="Full-Time">Full-Time</Option>
              <Option value="Part-Time">Part-Time</Option>
              <Option value="Contract">Contract</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Candidate Table */}
      <Card size="small" style={{ borderRadius: '8px' }}>
        <Table
          columns={columns}
          dataSource={candidates}
          rowKey="id"
          loading={status === 'loading'}
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
        onRefresh={() => selectedCandidate && dispatch(fetchCandidateById(selectedCandidate.id))}
        onOpenSubresourceModal={handleOpenSubresourceModal}
      />

      {/* Candidate Form Modal */}
      <CandidateFormModal
        visible={formModalVisible}
        candidate={editingCandidate}
        loading={actionStatus === 'saving'}
        onClose={() => setFormModalVisible(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Subresource Child Table Modal */}
      <CandidateSubresourceModal
        visible={subresourceModalVisible}
        resourceType={subresourceType}
        candidate={selectedCandidate}
        loading={actionStatus === 'saving'}
        onClose={() => setSubresourceModalVisible(false)}
        onSubmit={handleSubresourceSubmit}
      />
    </div>
  );
};

export default CandidatesPage;
