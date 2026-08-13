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
  message,
} from 'antd';
import {
  FiAward,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiSend,
  FiCheckCircle,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';
import { useOffers } from '../../../hooks/useOffers';
import { OfferDetailsDrawer, getOfferStatusTagColor } from './OfferDetailsDrawer';
import { OfferFormModal } from './OfferFormModal';
import { getOfferId } from '../../../utils/offerNormalizer';

const { Title, Text } = Typography;
const { Option } = Select;

export const OffersPage = () => {
  const { t } = useLanguage();
  const {
    items: offers,
    selectedOffer,
    pagination,
    filters,
    search,
    loading,
    loadingDetails,
    saving,
    deleting,
    actionStatus,
    error,
    loadOffers,
    getOfferDetails,
    createOffer,
    updateOffer,
    sendOffer,
    acceptOffer,
    rejectOffer,
    withdrawOffer,
    deleteOffer,
    setSearch,
    setFilters,
    resetFilters,
    setPage,
    setPageSize,
    clearSelectedOffer,
    clearError,
    clearActionStatus,
  } = useOffers();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [searchInput, setSearchInput] = useState(search);

  const debounceTimerRef = useRef(null);

  // Initial load
  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  // Handle action status notifications
  useEffect(() => {
    if (actionStatus) {
      switch (actionStatus.type) {
        case 'create_success':
          message.success(t('offers.messages.createSuccess', 'Offer created successfully.'));
          setModalOpen(false);
          setEditingOffer(null);
          break;
        case 'update_success':
          message.success(t('offers.messages.updateSuccess', 'Offer updated successfully.'));
          setModalOpen(false);
          setEditingOffer(null);
          break;
        case 'status_success':
          message.success(t('offers.messages.statusSuccess', 'Offer status updated successfully.'));
          break;
        case 'send_success':
          message.success(t('offers.messages.sendSuccess', 'Offer sent successfully.'));
          break;
        case 'accept_success':
          message.success(t('offers.messages.acceptSuccess', 'Offer accepted successfully.'));
          break;
        case 'reject_success':
          message.success(t('offers.messages.rejectSuccess', 'Offer rejected.'));
          break;
        case 'withdraw_success':
          message.success(t('offers.messages.withdrawSuccess', 'Offer withdrawn.'));
          break;
        case 'delete_success':
          message.success(t('offers.messages.deleteSuccess', 'Offer deleted successfully.'));
          handleCloseDrawer();
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
      const msg = typeof error === 'string' ? error : error?.message || t('common.error', 'An error occurred.');
      message.error(msg);
      clearError();
    }
  }, [error, clearError, t]);

  // Debounced search logic
  const triggerSearch = useCallback(
    (term) => {
      setSearch(term);
      loadOffers({ page: 1, search: term });
    },
    [setSearch, loadOffers]
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
    setFilters({ offerStatus: val });
    loadOffers({ page: 1, offerStatus: val });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    resetFilters();
    loadOffers({ page: 1, search: '', offerStatus: null });
  };

  const handleTableChange = (newPagination) => {
    if (newPagination.current !== pagination.page) {
      setPage(newPagination.current);
    }
    if (newPagination.pageSize !== pagination.pageSize) {
      setPageSize(newPagination.pageSize);
    }
    loadOffers({ page: newPagination.current, pageSize: newPagination.pageSize });
  };

  // View Details Authoritative Action Handler
  const handleViewDetails = async (record) => {
    const canonicalOfferId = getOfferId(record);
    if (!canonicalOfferId) {
      message.error(t('offers.messages.invalidOfferId', 'Invalid offer record or missing Offer ID.'));
      return;
    }
    const cleanId = String(canonicalOfferId).trim();
    setSelectedOfferId(cleanId);
    setDrawerOpen(true);
    await getOfferDetails(cleanId);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedOfferId(null);
    clearSelectedOffer();
  };

  const handleOpenCreateModal = () => {
    setEditingOffer(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingOffer(record);
    setModalOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    const canonicalId = getOfferId(editingOffer);
    if (canonicalId) {
      await updateOffer(canonicalId, payload);
    } else {
      await createOffer(payload);
    }
  };

  const handleSendOffer = async (id) => {
    const cleanId = String(id || '').trim();
    if (cleanId) await sendOffer(cleanId);
  };

  const handleAcceptOffer = async (id) => {
    const cleanId = String(id || '').trim();
    if (cleanId) await acceptOffer(cleanId);
  };

  const handleRejectOffer = async (id) => {
    const cleanId = String(id || '').trim();
    if (cleanId) await rejectOffer(cleanId);
  };

  const handleWithdrawOffer = async (id) => {
    const cleanId = String(id || '').trim();
    if (cleanId) await withdrawOffer(cleanId);
  };

  const handleDeleteOffer = async (id) => {
    const cleanId = String(id || '').trim();
    if (cleanId) await deleteOffer(cleanId);
  };

  const columns = [
    {
      title: t('offers.table.id', 'Offer ID'),
      dataIndex: 'name',
      key: 'name',
      width: 140,
      render: (text, record) => {
        const displayId = getOfferId(record) || text || record.id;
        return (
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(record);
            }}
            style={{ padding: 0, fontWeight: 600, color: 'var(--brand-teal, #1890ff)' }}
          >
            {displayId}
          </Button>
        );
      },
    },
    {
      title: t('offers.table.candidate', 'Candidate'),
      dataIndex: 'candidate',
      key: 'candidate',
      width: 150,
      render: (text) => (text ? <Text copyable={{ text }}>{text}</Text> : '-'),
    },
    {
      title: t('offers.table.jobApplication', 'Job Application'),
      dataIndex: 'jobApplication',
      key: 'jobApplication',
      width: 150,
      render: (text) => (text ? <Text copyable={{ text }}>{text}</Text> : '-'),
    },
    {
      title: t('offers.table.jobOpening', 'Job Opening'),
      dataIndex: 'jobOpening',
      key: 'jobOpening',
      width: 150,
      render: (text) => (text ? <Text copyable={{ text }}>{text}</Text> : '-'),
    },
    {
      title: t('offers.table.offeredSalary', 'Offered Salary'),
      dataIndex: 'offeredSalary',
      key: 'offeredSalary',
      width: 140,
      render: (salary, record) =>
        salary !== undefined && salary !== null ? `${record.currency || 'USD'} ${Number(salary).toLocaleString()}` : '-',
    },
    {
      title: t('offers.table.joiningDate', 'Joining Date'),
      dataIndex: 'joiningDate',
      key: 'joiningDate',
      width: 130,
      render: (date) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: t('offers.table.offerDate', 'Offer Date'),
      dataIndex: 'offerDate',
      key: 'offerDate',
      width: 130,
      render: (date) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: t('offers.table.employmentType', 'Employment Type'),
      dataIndex: 'employmentType',
      key: 'employmentType',
      width: 140,
      render: (text) => text || '-',
    },
    {
      title: t('offers.table.offerStatus', 'Offer Status'),
      dataIndex: 'offerStatus',
      key: 'offerStatus',
      width: 150,
      render: (status) => (
        <Tag color={getOfferStatusTagColor(status)}>
          {t(`offers.statuses.${status}`, status)}
        </Tag>
      ),
    },
    {
      title: t('common.actions', 'Actions'),
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => {
        const status = record.offerStatus || record.status;
        const offerId = getOfferId(record);

        return (
          <Space size="small" onClick={(e) => e.stopPropagation()}>
            <Tooltip title={t('offers.actions.viewDetails', 'View Details')}>
              <Button
                type="text"
                icon={<FiEye />}
                onClick={() => handleViewDetails(record)}
              />
            </Tooltip>

            <Tooltip title={t('common.edit', 'Edit')}>
              <Button
                type="text"
                icon={<FiEdit />}
                onClick={() => handleOpenEditModal(record)}
              />
            </Tooltip>

            {(status === 'Draft' || status === 'Approved' || status === 'Pending Approval') && (
              <Tooltip title={t('offers.actions.send', 'Send Offer')}>
                <Button
                  type="text"
                  icon={<FiSend style={{ color: 'var(--brand-teal, #1890ff)' }} />}
                  loading={saving}
                  onClick={() => handleSendOffer(offerId)}
                />
              </Tooltip>
            )}

            {status === 'Sent' && (
              <Tooltip title={t('offers.actions.accept', 'Accept Offer')}>
                <Button
                  type="text"
                  icon={<FiCheckCircle style={{ color: '#52c41a' }} />}
                  loading={saving}
                  onClick={() => handleAcceptOffer(offerId)}
                />
              </Tooltip>
            )}

            <Popconfirm
              title={t('offers.messages.deleteConfirmTitle', 'Delete Offer?')}
              description={t('offers.messages.deleteConfirmSub', 'This action will permanently delete this offer record.')}
              onConfirm={() => handleDeleteOffer(offerId)}
              okText={t('common.confirm', 'Confirm')}
              cancelText={t('common.cancel', 'Cancel')}
              okButtonProps={{ danger: true }}
            >
              <Tooltip title={t('common.delete', 'Delete')}>
                <Button type="text" danger icon={<FiTrash2 />} loading={deleting} />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
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
            <FiAward style={{ color: 'var(--brand-teal, #1890ff)' }} />
            {t('offers.title', 'Offers')}
          </Title>
          <Text type="secondary">{t('offers.subtitle', 'Backend-driven offer management and candidate compensation tracking.')}</Text>
        </div>

        <Space>
          <Button
            icon={<FiRefreshCw />}
            onClick={() => loadOffers()}
            loading={loading}
          >
            {t('common.refresh', 'Refresh')}
          </Button>
          <Button
            type="primary"
            icon={<FiPlus />}
            onClick={handleOpenCreateModal}
            style={{ backgroundColor: 'var(--brand-navy, #0f172a)' }}
          >
            {t('offers.createOffer', 'Create Offer')}
          </Button>
        </Space>
      </div>

      {/* Search & Filter Toolbar */}
      <Card size="small" style={{ marginBottom: '20px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder={t('offers.searchPlaceholder', 'Search offers by ID, candidate, job opening, status...')}
            prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
            value={searchInput}
            onChange={handleSearchInputChange}
            onPressEnter={handleImmediateSearch}
            style={{ width: 360 }}
            allowClear
          />

          <Select
            placeholder={t('offers.filters.status', 'Filter Status')}
            value={filters.offerStatus}
            onChange={handleStatusFilterChange}
            style={{ width: 200 }}
            allowClear
          >
            <Option value="Draft">{t('offers.statuses.Draft', 'Draft')}</Option>
            <Option value="Pending Approval">{t('offers.statuses.Pending Approval', 'Pending Approval')}</Option>
            <Option value="Approved">{t('offers.statuses.Approved', 'Approved')}</Option>
            <Option value="Sent">{t('offers.statuses.Sent', 'Sent')}</Option>
            <Option value="Accepted">{t('offers.statuses.Accepted', 'Accepted')}</Option>
            <Option value="Rejected">{t('offers.statuses.Rejected', 'Rejected')}</Option>
            <Option value="Withdrawn">{t('offers.statuses.Withdrawn', 'Withdrawn')}</Option>
            <Option value="Expired">{t('offers.statuses.Expired', 'Expired')}</Option>
          </Select>

          {(search || filters.offerStatus) && (
            <Button icon={<FiFilter />} onClick={handleResetFilters}>
              {t('offers.filters.reset', 'Reset Filters')}
            </Button>
          )}
        </div>
      </Card>

      {/* Main Table View */}
      <Card style={{ borderRadius: '8px' }}>
        <Table
          columns={columns}
          dataSource={offers}
          rowKey="id"
          loading={loading}
          onRow={(record) => ({
            onClick: (e) => {
              if (
                e.target.closest('.ant-btn') ||
                e.target.closest('.ant-popover') ||
                e.target.closest('a') ||
                e.target.closest('.ant-dropdown')
              ) {
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
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} offers`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1300 }}
          locale={{
            emptyText: t('offers.empty.noOffers', 'No offers found matching the active search criteria.'),
          }}
        />
      </Card>

      {/* Offer Details Drawer */}
      <OfferDetailsDrawer
        open={drawerOpen}
        offerId={selectedOfferId}
        offer={selectedOffer}
        loading={loadingDetails}
        saving={saving}
        deleting={deleting}
        onClose={handleCloseDrawer}
        onSend={handleSendOffer}
        onAccept={handleAcceptOffer}
        onReject={handleRejectOffer}
        onWithdraw={handleWithdrawOffer}
        onEdit={(record) => {
          handleCloseDrawer();
          handleOpenEditModal(record);
        }}
        onDelete={handleDeleteOffer}
      />

      {/* Offer Form Modal */}
      <OfferFormModal
        visible={modalOpen}
        offer={editingOffer}
        saving={saving}
        onClose={() => {
          setModalOpen(false);
          setEditingOffer(null);
        }}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default OffersPage;
