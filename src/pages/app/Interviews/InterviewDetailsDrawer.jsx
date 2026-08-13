import React, { useState } from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Button,
  Space,
  Typography,
  Divider,
  Select,
  Popconfirm,
  Card,
  Spin,
  Alert,
} from 'antd';
import {
  FiCalendar,
  FiUser,
  FiBriefcase,
  FiFileText,
  FiVideo,
  FiMapPin,
  FiClock,
  FiTrash2,
  FiExternalLink,
  FiTag,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiAlertCircle,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';
import { ROUTES } from '../../../routes/routes';

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

export const getInterviewStatusTagColor = (status) => {
  switch (status) {
    case 'Scheduled':
      return 'processing';
    case 'Rescheduled':
      return 'warning';
    case 'Completed':
      return 'success';
    case 'Cancelled':
      return 'error';
    default:
      return 'default';
  }
};

export const getInterviewTypeTagColor = (type) => {
  switch (type) {
    case 'Phone':
      return 'cyan';
    case 'Video':
      return 'blue';
    case 'Technical':
      return 'purple';
    case 'HR':
      return 'magenta';
    case 'Managerial':
      return 'geekblue';
    case 'Final':
      return 'gold';
    default:
      return 'default';
  }
};

export const InterviewDetailsDrawer = ({
  open,
  visible,
  interviewId,
  interview,
  loading,
  saving,
  deleting,
  onClose,
  onChangeStatus,
  onEdit,
  onDelete,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [selectedNextStatus, setSelectedNextStatus] = useState(null);

  const isOpen = open !== undefined ? open : visible;
  const currentId = interviewId || interview?.interview_name || interview?.interviewName || interview?.name || interview?.id;
  const hasId = Boolean(currentId);
  const isLoading = Boolean(loading) || (hasId && !interview);

  if (!interview) {
    return (
      <Drawer open={isOpen} onClose={onClose} width={640} title={t('interviews.drawer.title', 'Interview Details')}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Spin tip="Loading interview details..." />
          </div>
        ) : (
          <Text type="secondary">{t('interviews.drawer.noData', 'No interview selected.')}</Text>
        )}
      </Drawer>
    );
  }

  const handleStatusSubmit = async () => {
    if (!selectedNextStatus || !interview?.id) return;
    await onChangeStatus(interview.id, selectedNextStatus);
    setSelectedNextStatus(null);
  };

  const handleQuickStatus = async (newStatus) => {
    if (!interview?.id) return;
    await onChangeStatus(interview.id, newStatus);
  };

  const handleNavigateCandidate = () => {
    navigate(ROUTES.CANDIDATES);
  };

  const handleNavigateJob = () => {
    navigate(ROUTES.JOBS);
  };

  const handleNavigateApp = () => {
    navigate(ROUTES.APPLICATIONS);
  };

  return (
    <Drawer
      open={visible}
      onClose={onClose}
      width={640}
      title={
        <Space align="center">
          <FiCalendar style={{ color: 'var(--brand-teal, #1890ff)' }} />
          <span>
            {t('interviews.drawer.title')} — #{interview?.name || ''}
          </span>
        </Space>
      }
      extra={
        <Space>
          {onEdit && (
            <Button
              type="default"
              icon={<FiRefreshCw />}
              onClick={() => onEdit(interview)}
              disabled={saving || deleting}
            >
              {t('interviews.actions.reschedule')}
            </Button>
          )}
          <Popconfirm
            title={t('interviews.messages.deleteConfirmTitle')}
            description={t('interviews.messages.deleteConfirmSub')}
            onConfirm={() => onDelete(interview?.id)}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
          >
            <Button type="primary" danger icon={<FiTrash2 />} loading={deleting}>
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      <Spin spinning={Boolean(loading)}>
        {interview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Stale Application Banner */}
            {interview.isStale && (
              <Alert
                type="warning"
                showIcon
                icon={<FiAlertCircle />}
                style={{ borderRadius: '8px' }}
                message="Linked Job Application no longer exists."
                description={`This historical interview record is linked to application "${interview.resolvedJobApplicationId || interview.jobApplication}", which has been removed from the system.`}
              />
            )}

            {/* 1. INTERVIEW DETAILS */}
            <Card title={t('interviews.drawer.interviewDetails', '1. Interview Details')} size="small" style={{ borderRadius: '8px', background: 'var(--bg-subtle, #f8fafc)' }}>
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label={t('interviews.table.id', 'Interview ID')}>
                  <Text copyable={{ text: interview.name }}>{interview.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('interviews.table.type', 'Interview Type')}>
                  <Tag color={getInterviewTypeTagColor(interview.interviewType)}>
                    {t(`interviews.types.${interview.interviewType}`, interview.interviewType)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('interviews.table.scheduledOn', 'Scheduled On')}>
                  <Text strong>
                    {interview.scheduledOn ? dayjs(interview.scheduledOn).format('YYYY-MM-DD HH:mm') : '-'}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('interviews.table.duration', 'Duration')}>
                  {interview.duration ? `${interview.duration} mins` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('interviews.table.status', 'Interview Status')}>
                  <Tag color={getInterviewStatusTagColor(interview.status)}>
                    {t(`interviews.statuses.${interview.status}`, interview.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('interviews.drawer.result', 'Result')}>
                  <Tag color={interview.result === 'Pass' ? 'success' : interview.result === 'Fail' ? 'error' : interview.result === 'Hold' ? 'warning' : 'default'}>
                    {interview.result || 'Pending'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 2. JOB APPLICATION DETAILS */}
            <Card title={t('interviews.drawer.applicationDetails', '2. Job Application Details')} size="small" style={{ borderRadius: '8px' }}>
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Application ID">
                  {interview.isStale ? (
                    <Text type="secondary" style={{ fontStyle: 'italic' }}>
                      {interview.resolvedJobApplicationId ? `${interview.resolvedJobApplicationId} (unavailable)` : 'Unavailable'}
                    </Text>
                  ) : (
                    <Text strong copyable={{ text: interview.resolvedJobApplicationId || interview.jobApplication }}>
                      {interview.resolvedJobApplicationId || interview.jobApplication || '-'}
                    </Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Current Stage">
                  <Tag color={interview.isStale ? 'default' : 'geekblue'}>
                    {interview.resolvedCurrentStage || 'Unavailable'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Application Status" span={2}>
                  <Tag color={interview.isStale ? 'default' : 'blue'}>
                    {interview.resolvedApplicationStatus || 'Open'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
              {!interview.isStale && interview.resolvedJobApplicationId && (
                <div style={{ marginTop: 8, textAlign: 'right' }}>
                  <Button type="link" icon={<FiExternalLink />} onClick={handleNavigateApp} style={{ padding: 0 }}>
                    {t('interviews.drawer.viewApp', 'View Application Details')}
                  </Button>
                </div>
              )}
            </Card>

            {/* 3. CANDIDATE DETAILS */}
            <Card title={t('interviews.drawer.candidateDetails', '3. Candidate Details')} size="small" style={{ borderRadius: '8px' }}>
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Candidate Name">
                  <Text
                    strong
                    style={{
                      fontStyle: interview.isStale ? 'italic' : 'normal',
                      color: interview.isStale ? 'var(--text-secondary, #64748b)' : 'inherit',
                    }}
                  >
                    {interview.resolvedCandidateName || 'Candidate unavailable'}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Candidate ID">
                  {interview.resolvedCandidateId ? (
                    <Text copyable={{ text: interview.resolvedCandidateId }}>
                      {interview.resolvedCandidateId}
                    </Text>
                  ) : (
                    <Text type="secondary">-</Text>
                  )}
                </Descriptions.Item>
                {interview.resolvedCandidateEmail && (
                  <Descriptions.Item label="Email" span={2}>
                    <Text copyable={{ text: interview.resolvedCandidateEmail }}>{interview.resolvedCandidateEmail}</Text>
                  </Descriptions.Item>
                )}
                {interview.resolvedCandidateMobile && (
                  <Descriptions.Item label="Mobile" span={2}>
                    {interview.resolvedCandidateMobile}
                  </Descriptions.Item>
                )}
              </Descriptions>
              {!interview.isStale && interview.resolvedCandidateId && (
                <div style={{ marginTop: 8, textAlign: 'right' }}>
                  <Button type="link" icon={<FiExternalLink />} onClick={handleNavigateCandidate} style={{ padding: 0 }}>
                    {t('interviews.drawer.viewCandidate', 'View Candidate Profile')}
                  </Button>
                </div>
              )}
            </Card>

            {/* 4. JOB OPENING DETAILS */}
            <Card title={t('interviews.drawer.jobDetails', '4. Job Opening Details')} size="small" style={{ borderRadius: '8px' }}>
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Job Title" span={2}>
                  <Text
                    strong
                    style={{
                      fontStyle: interview.isStale ? 'italic' : 'normal',
                      color: interview.isStale ? 'var(--text-secondary, #64748b)' : 'inherit',
                    }}
                  >
                    {interview.resolvedJobOpeningTitle || 'Job Opening unavailable'}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Job Opening ID" span={2}>
                  {interview.resolvedJobOpeningId ? (
                    <Text copyable={{ text: interview.resolvedJobOpeningId }}>
                      {interview.resolvedJobOpeningId}
                    </Text>
                  ) : (
                    <Text type="secondary">-</Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
              {!interview.isStale && interview.resolvedJobOpeningId && (
                <div style={{ marginTop: 8, textAlign: 'right' }}>
                  <Button type="link" icon={<FiExternalLink />} onClick={handleNavigateJob} style={{ padding: 0 }}>
                    {t('interviews.drawer.viewJob', 'View Job Opening')}
                  </Button>
                </div>
              )}
            </Card>

            {/* 5. ASSIGNMENT DETAILS */}
            <Card title={t('interviews.drawer.assignmentDetails', '5. Assignment')} size="small" style={{ borderRadius: '8px' }}>
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label={t('interviews.drawer.interviewer', 'Interviewer')}>
                  {interview.interviewer || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('interviews.drawer.recruiter', 'Recruiter')}>
                  {interview.recruiter || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 6. MEETING & LOCATION DETAILS */}
            <Card title={t('interviews.drawer.meetingDetails', '6. Meeting & Location')} size="small" style={{ borderRadius: '8px' }}>
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label={t('interviews.drawer.location', 'Location')} span={interview.meetingLink ? 1 : 2}>
                  {interview.location ? (
                    <Space size={4}>
                      <FiMapPin style={{ color: 'var(--brand-teal)' }} />
                      <span>{interview.location}</span>
                    </Space>
                  ) : (
                    '-'
                  )}
                </Descriptions.Item>
                {interview.meetingLink && (
                  <Descriptions.Item label={t('interviews.drawer.meetingLink', 'Meeting Link')}>
                    <Button
                      type="primary"
                      ghost
                      size="small"
                      icon={<FiVideo />}
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('dashboard.meetingLink', 'Join Meeting')}
                    </Button>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* 7. REMARKS SECTION */}
            <Card title={t('interviews.drawer.remarks', '7. Remarks')} size="small" style={{ borderRadius: '8px' }}>
              <Paragraph
                style={{
                  background: 'var(--bg-subtle, #f8fafc)',
                  padding: 12,
                  borderRadius: 6,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  color: interview.remarks ? 'inherit' : 'var(--text-secondary, #94a3b8)',
                  fontStyle: interview.remarks ? 'normal' : 'italic',
                }}
              >
                {interview.remarks || 'No remarks'}
              </Paragraph>
            </Card>

            <Divider style={{ margin: '4px 0' }} />

            {/* Status Transition Action Card */}
            <Card title={t('interviews.drawer.changeStatusTitle', 'Update Interview Status')} size="small" style={{ borderRadius: '8px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Select
                    placeholder={t('interviews.drawer.selectNextStatus', 'Select new interview status')}
                    style={{ flex: 1 }}
                    value={selectedNextStatus}
                    onChange={(val) => setSelectedNextStatus(val)}
                  >
                    <Option value="Scheduled">{t('interviews.statuses.Scheduled', 'Scheduled')}</Option>
                    <Option value="Rescheduled">{t('interviews.statuses.Rescheduled', 'Rescheduled')}</Option>
                    <Option value="Completed">{t('interviews.statuses.Completed', 'Completed')}</Option>
                    <Option value="Cancelled">{t('interviews.statuses.Cancelled', 'Cancelled')}</Option>
                  </Select>
                  <Button
                    type="primary"
                    onClick={handleStatusSubmit}
                    disabled={!selectedNextStatus}
                    loading={saving}
                  >
                    {t('interviews.drawer.updateStatus', 'Update Status')}
                  </Button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 4, flexWrap: 'wrap' }}>
                  <Button
                    icon={<FiCheckCircle />}
                    style={{ color: '#52c41a', borderColor: '#52c41a' }}
                    onClick={() => handleQuickStatus('Completed')}
                    loading={saving}
                    disabled={interview.status === 'Completed'}
                  >
                    {t('interviews.statuses.Completed', 'Completed')}
                  </Button>
                  <Button
                    icon={<FiRefreshCw />}
                    onClick={() => handleQuickStatus('Rescheduled')}
                    loading={saving}
                    disabled={interview.status === 'Rescheduled'}
                  >
                    {t('interviews.statuses.Rescheduled', 'Rescheduled')}
                  </Button>
                  <Button
                    danger
                    icon={<FiXCircle />}
                    onClick={() => handleQuickStatus('Cancelled')}
                    loading={saving}
                    disabled={interview.status === 'Cancelled'}
                  >
                    {t('interviews.statuses.Cancelled', 'Cancelled')}
                  </Button>
                </div>
              </Space>
            </Card>
          </div>
        )}
      </Spin>
    </Drawer>
  );
};

export default InterviewDetailsDrawer;
