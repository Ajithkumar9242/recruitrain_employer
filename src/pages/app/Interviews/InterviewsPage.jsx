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
import { INTERVIEW_TYPES } from '../../../constants/interviewConstants';

import candidateApi from '../../../services/candidateApi';
import jobApi from '../../../services/jobApi';
import jobApplicationApi from '../../../services/jobApplicationApi';

const { Title, Text } = Typography;
const { Option } = Select;

export const InterviewsPage = () => {
  const { t } = useLanguage();
  const {
    items: interviews,
    unscheduledItems,
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
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [searchInput, setSearchInput] = useState(search);

  const [candidatesMap, setCandidatesMap] = useState({});
  const [jobsMap, setJobsMap] = useState({});
  const [applicationsMap, setApplicationsMap] = useState({});

  const debounceTimerRef = useRef(null);

  const loadEntityMasters = useCallback(async () => {
    try {
      const [candRes, jobRes, appRes] = await Promise.all([
        candidateApi.listCandidates({ pageSize: 100 }).catch(() => null),
        jobApi.listJobs({ pageSize: 100 }).catch(() => null),
        jobApplicationApi.listApplications({ pageSize: 100 }).catch(() => null),
      ]);

      const cMap = {};
      const rawCands =
        candRes?.data?.items ||
        candRes?.items ||
        candRes?.data ||
        candRes?.message?.data ||
        candRes?.message?.items ||
        [];
      if (Array.isArray(rawCands)) {
        rawCands.forEach((c) => {
          const cid = String(c.id || c.name || c.candidateId || '').trim();
          if (cid) {
            const mid = c.middle_name ? `${c.middle_name} ` : '';
            const cName =
              c.first_name || c.last_name
                ? `${c.first_name || ''} ${mid}${c.last_name || ''}`.trim()
                : c.candidateName || c.full_name || c.name;
            const obj = { ...c, candidateName: cName };
            cMap[cid] = obj;
            if (!isNaN(Number(cid))) {
              cMap[Number(cid)] = obj;
            }
          }
        });
      }
      setCandidatesMap(cMap);

      const jMap = {};
      const rawJobs =
        jobRes?.items ||
        jobRes?.data?.items ||
        jobRes?.data ||
        jobRes?.message?.data ||
        jobRes?.message?.items ||
        [];
      if (Array.isArray(rawJobs)) {
        rawJobs.forEach((j) => {
          const jid = String(j.id || j.name || j.jobOpeningId || '').trim();
          if (jid) {
            const jTitle = j.jobTitle || j.title || j.job_title || j.name;
            const obj = { ...j, jobTitle: jTitle };
            jMap[jid] = obj;
            if (!isNaN(Number(jid))) {
              jMap[Number(jid)] = obj;
            }
          }
        });
      }
      setJobsMap(jMap);

      const aMap = {};
      const rawApps =
        appRes?.items ||
        appRes?.data?.items ||
        appRes?.data ||
        appRes?.message?.data ||
        appRes?.message?.items ||
        [];
      if (Array.isArray(rawApps)) {
        rawApps.forEach((a) => {
          const aid = String(a.id || a.name || a.applicationId || '').trim();
          if (aid) {
            aMap[aid] = a;
            if (!isNaN(Number(aid))) {
              aMap[Number(aid)] = a;
            }
          }
        });
      }
      setApplicationsMap(aMap);
    } catch (err) {
      console.error('Error loading entity masters for interviews:', err);
    }
  }, []);

  const enrichInterview = useCallback(
    (record) => {
      if (!record) return null;

      const appIdStr = String(
        record.jobApplication || record.job_application || record.application_id || ''
      ).trim();

      const appData = applicationsMap[appIdStr] || (appIdStr && applicationsMap[Number(appIdStr)]) || null;

      let candId = '';
      let candName = '';
      let candEmail = '';
      let candMobile = '';

      let jobOpeningId = '';
      let jobOpeningTitle = '';

      let currentStage = '';
      let applicationStatus = '';

      if (appData) {
        currentStage = appData.currentStage || appData.current_stage || 'Not available';
        applicationStatus = appData.status || appData.application_status || 'Not available';

        candId = String(
          appData.candidate || appData.candidateId || record.candidate || record.candidateId || ''
        ).trim();

        jobOpeningId = String(
          appData.jobOpening ||
            appData.job_opening ||
            appData.jobOpeningId ||
            record.jobOpening ||
            record.jobOpeningId ||
            ''
        ).trim();
      } else {
        currentStage = record.currentStage || record.current_stage || 'Not available';
        applicationStatus = record.applicationStatus || record.application_status || 'Not available';
        candId = String(record.candidate || record.candidateId || '').trim();
        jobOpeningId = String(record.jobOpening || record.jobOpeningId || record.job_opening || '').trim();
      }

      // Resolve candidate details
      const candData = candidatesMap[candId] || (candId && candidatesMap[Number(candId)]) || {};
      if (candData.first_name || candData.last_name) {
        const mid = candData.middle_name ? `${candData.middle_name} ` : '';
        candName = `${candData.first_name || ''} ${mid}${candData.last_name || ''}`.trim();
      } else {
        candName =
          candData.candidateName ||
          candData.name ||
          (appData ? appData.candidateName || appData.candidate_name : null) ||
          record.candidateName ||
          record.candidate_name ||
          (candId ? candId : 'Not available');
      }
      candEmail = candData.email || (appData ? appData.candidateEmail : null) || record.candidateEmail || '';
      candMobile = candData.mobile_no || candData.mobile || candData.phone || record.candidateMobile || '';

      // Resolve job opening details
      const jobData = jobsMap[jobOpeningId] || (jobOpeningId && jobsMap[Number(jobOpeningId)]) || {};
      jobOpeningTitle =
        jobData.jobTitle ||
        jobData.title ||
        jobData.job_title ||
        (appData ? appData.jobOpeningTitle || appData.job_title : null) ||
        record.jobOpeningTitle ||
        record.job_title ||
        (jobOpeningId ? jobOpeningId : 'Not available');

      const isStale = Boolean(appIdStr && !appData && candName === 'Not available' && jobOpeningTitle === 'Not available');

      return {
        ...record,
        isStale,
        resolvedCandidateId: candId,
        resolvedCandidateName: candName,
        resolvedCandidateEmail: candEmail,
        resolvedCandidateMobile: candMobile,
        resolvedJobOpeningId: jobOpeningId,
        resolvedJobOpeningTitle: jobOpeningTitle,
        resolvedJobApplicationId: appIdStr,
        resolvedCurrentStage: currentStage,
        resolvedApplicationStatus: applicationStatus,
      };
    },
    [candidatesMap, jobsMap, applicationsMap]
  );

  // Action Handlers
  const handleViewDetails = (record) => {
    const interviewId = String(record?.interview_name || record?.interviewName || record?.name || record?.id || record || '');
    if (!interviewId) return;

    setSelectedInterviewId(interviewId);
    setSelectedInterview(record);
    setDrawerOpen(true);
    getInterviewDetails(interviewId);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedInterviewId(null);
    clearSelectedInterview();
  };

  // Initial load
  useEffect(() => {
    loadInterviews();
    loadEntityMasters();
  }, [loadInterviews, loadEntityMasters]);

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
          if (selectedInterviewId) {
            getInterviewDetails(selectedInterviewId);
          }
          break;
        case 'status_success':
          message.success(t('interviews.messages.statusSuccess'));
          if (selectedInterviewId) {
            getInterviewDetails(selectedInterviewId);
          }
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
  }, [actionStatus, clearActionStatus, t, selectedInterviewId, getInterviewDetails]);

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

  const enrichUnscheduledApp = useCallback(
    (item) => {
      if (!item) return null;
      const appId = String(item.job_application || item.jobApplication || item.id || item.name || '').trim();
      const candId = String(item.candidate || item.candidateId || '').trim();
      const jobOpeningId = String(item.job_opening || item.jobOpening || '').trim();

      const candData = candidatesMap[candId] || (candId && candidatesMap[Number(candId)]) || {};
      let candName = '';
      if (candData.first_name || candData.last_name) {
        const mid = candData.middle_name ? `${candData.middle_name} ` : '';
        candName = `${candData.first_name || ''} ${mid}${candData.last_name || ''}`.trim();
      } else {
        candName = candData.candidateName || candData.name || (candId ? candId : 'Candidate');
      }

      const jobData = jobsMap[jobOpeningId] || (jobOpeningId && jobsMap[Number(jobOpeningId)]) || {};
      const jobOpeningTitle = jobData.jobTitle || jobData.title || jobData.job_title || (jobOpeningId ? jobOpeningId : 'Job Opening');

      return {
        id: `unscheduled-${appId}`,
        jobApplication: appId,
        candidate: candId,
        candidateName: candName,
        jobOpening: jobOpeningId,
        jobOpeningTitle: jobOpeningTitle,
        currentStage: item.current_stage || 'Interview',
        status: 'Not Scheduled',
        isUnscheduled: true,
        appliedOn: item.applied_on,
      };
    },
    [candidatesMap, jobsMap]
  );

  const enrichedUnscheduledApps = Array.isArray(unscheduledItems)
    ? unscheduledItems.map(enrichUnscheduledApp).filter(Boolean)
    : [];

  const filteredUnscheduledApps = enrichedUnscheduledApps.filter((item) => {
    if (filters.status && filters.status !== 'Not Scheduled') return false;
    if (searchInput && searchInput.trim() !== '') {
      const term = searchInput.toLowerCase();
      const appMatch = String(item.jobApplication).toLowerCase().includes(term);
      const candMatch = String(item.candidateName).toLowerCase().includes(term);
      const jobMatch = String(item.jobOpeningTitle).toLowerCase().includes(term);
      return appMatch || candMatch || jobMatch;
    }
    return true;
  });

  const handleOpenScheduleModalWithApp = (jobAppId) => {
    setEditingInterview({ jobApplication: jobAppId, job_application: jobAppId });
    setModalOpen(true);
  };

  const enrichedInterviews = Array.isArray(interviews) ? interviews.map(enrichInterview) : [];
  const enrichedSelectedInterview = enrichInterview(selectedInterview);

  const columns = [
    {
      title: t('interviews.table.id', 'Interview ID'),
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
      title: t('interviews.table.candidate', 'Candidate'),
      key: 'candidate',
      width: 180,
      render: (_, record) => {
        if (record.isStale || record.resolvedCandidateName === 'Candidate unavailable') {
          return (
            <Tooltip title="Linked job application no longer exists">
              <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                Candidate unavailable
              </Text>
            </Tooltip>
          );
        }
        return (
          <div>
            <Text strong style={{ display: 'block' }}>
              {record.resolvedCandidateName}
            </Text>
            {record.resolvedCandidateId && (
              <Text type="secondary" style={{ fontSize: '0.75rem' }} copyable={{ text: record.resolvedCandidateId }}>
                {record.resolvedCandidateId}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: t('interviews.table.jobApplication', 'Job Application'),
      key: 'jobApplication',
      width: 160,
      render: (_, record) => {
        const appId = record.resolvedJobApplicationId || record.jobApplication || record.job_application;
        if (record.isStale) {
          return (
            <Tooltip title="Linked job application no longer exists">
              <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                {appId ? `${appId} (unavailable)` : 'Unavailable'}
              </Text>
            </Tooltip>
          );
        }
        return (
          <Text copyable={{ text: appId }}>
            {appId || '-'}
          </Text>
        );
      },
    },
    {
      title: t('interviews.table.jobOpening', 'Job Opening'),
      key: 'jobOpening',
      width: 190,
      render: (_, record) => {
        if (record.isStale || record.resolvedJobOpeningTitle === 'Job Opening unavailable') {
          return (
            <Tooltip title="Linked job application no longer exists">
              <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                Job Opening unavailable
              </Text>
            </Tooltip>
          );
        }
        return (
          <div>
            <Text strong style={{ display: 'block' }}>
              {record.resolvedJobOpeningTitle}
            </Text>
            {record.resolvedJobOpeningId && (
              <Text type="secondary" style={{ fontSize: '0.75rem' }} copyable={{ text: record.resolvedJobOpeningId }}>
                {record.resolvedJobOpeningId}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: t('interviews.table.type', 'Interview Type'),
      dataIndex: 'interviewType',
      key: 'interviewType',
      width: 130,
      render: (type) => (
        <Tag color={getInterviewTypeTagColor(type)}>
          {t(`interviews.types.${type}`, type)}
        </Tag>
      ),
    },
    {
      title: t('interviews.table.scheduledOn', 'Scheduled On'),
      dataIndex: 'scheduledOn',
      key: 'scheduledOn',
      width: 160,
      render: (date) => (
        <Space size={4}>
          <FiCalendar style={{ color: 'var(--brand-teal)' }} />
          <span>{date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'}</span>
        </Space>
      ),
    },
    {
      title: t('interviews.table.interviewer', 'Interviewer'),
      dataIndex: 'interviewer',
      key: 'interviewer',
      width: 140,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Recruiter',
      dataIndex: 'recruiter',
      key: 'recruiter',
      width: 140,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Result',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (res) => {
        const colorMap = { Pass: 'success', Fail: 'error', Hold: 'warning', Pending: 'default' };
        return <Tag color={colorMap[res] || 'default'}>{res || 'Pending'}</Tag>;
      },
    },
    {
      title: 'App Stage',
      key: 'applicationStage',
      width: 120,
      render: (_, record) => (
        <Tag color={record.isStale ? 'default' : 'geekblue'}>
          {record.resolvedCurrentStage || '-'}
        </Tag>
      ),
    },
    {
      title: t('interviews.table.status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => (
        <Tag color={getInterviewStatusTagColor(status)}>
          {t(`interviews.statuses.${status}`, status)}
        </Tag>
      ),
    },
    {
      title: t('interviews.table.actions', 'Actions'),
      key: 'actions',
      width: 160,
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

      {/* Applications Awaiting Interview Scheduling Section */}
      {filteredUnscheduledApps.length > 0 && (
        <Card
          size="small"
          style={{
            marginBottom: '20px',
            borderRadius: '8px',
            borderColor: 'var(--brand-gold, #f59e0b)',
            background: 'var(--bg-subtle, #fefce8)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '4px 8px' }}>
            <Space align="center">
              <FiClock style={{ color: '#d97706', fontSize: '1.2rem' }} />
              <Title level={4} style={{ margin: 0, fontSize: '1rem', color: '#92400e' }}>
                Applications Awaiting Interview Scheduling
              </Title>
              <Tag color="gold" style={{ fontWeight: 600 }}>
                {filteredUnscheduledApps.length} Not Scheduled
              </Tag>
            </Space>
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>
              Job Applications in 'Interview' stage without a scheduled interview
            </Text>
          </div>

          <Table
            size="small"
            dataSource={filteredUnscheduledApps}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'Job Application',
                dataIndex: 'jobApplication',
                key: 'jobApplication',
                width: 150,
                render: (appId) => (
                  <Text strong copyable={{ text: appId }}>
                    #{appId}
                  </Text>
                ),
              },
              {
                title: 'Candidate',
                key: 'candidate',
                render: (_, record) => (
                  <div>
                    <Text strong style={{ display: 'block' }}>
                      {record.candidateName}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                      {record.candidate}
                    </Text>
                  </div>
                ),
              },
              {
                title: 'Job Opening',
                key: 'jobOpening',
                render: (_, record) => (
                  <div>
                    <Text strong style={{ display: 'block' }}>
                      {record.jobOpeningTitle}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                      {record.jobOpening}
                    </Text>
                  </div>
                ),
              },
              {
                title: 'App Stage',
                dataIndex: 'currentStage',
                key: 'currentStage',
                width: 120,
                render: (stage) => <Tag color="geekblue">{stage || 'Interview'}</Tag>,
              },
              {
                title: 'Interview Status',
                dataIndex: 'status',
                key: 'status',
                width: 130,
                render: (status) => <Tag color="gold">{status || 'Not Scheduled'}</Tag>,
              },
              {
                title: 'Action',
                key: 'action',
                width: 170,
                align: 'right',
                render: (_, record) => (
                  <Button
                    type="primary"
                    size="small"
                    icon={<FiCalendar />}
                    onClick={() => handleOpenScheduleModalWithApp(record.jobApplication)}
                    style={{ backgroundColor: 'var(--brand-teal, #008080)', borderColor: 'var(--brand-teal, #008080)' }}
                  >
                    Schedule Interview
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      )}

      {/* Main Table View */}
      <Card style={{ borderRadius: '8px' }}>
        <Table
          columns={columns}
          dataSource={enrichedInterviews}
          rowKey="id"
          loading={loading}
          onRow={(record) => ({
            onClick: (e) => {
              if (
                e.target.closest('button') ||
                e.target.closest('a') ||
                e.target.closest('.ant-popover') ||
                e.target.closest('.ant-popconfirm')
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
        open={drawerOpen}
        visible={drawerOpen}
        interviewId={selectedInterviewId}
        interview={enrichedSelectedInterview}
        loading={loadingDetails || (loading && !selectedInterview)}
        saving={saving}
        deleting={deleting}
        onClose={handleCloseDrawer}
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
        error={error}
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
