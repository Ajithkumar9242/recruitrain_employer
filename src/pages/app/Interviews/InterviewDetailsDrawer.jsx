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
  visible,
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

  if (!interview && !loading) {
    return (
      <Drawer open={visible} onClose={onClose} width={640} title={t('interviews.drawer.title')}>
        <Text type="secondary">{t('interviews.drawer.noData')}</Text>
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
            {/* Header Status Card */}
            <Card size="small" style={{ borderRadius: '8px', background: 'var(--bg-subtle, #f8fafc)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {t('interviews.table.status')}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={getInterviewStatusTagColor(interview.status)} style={{ fontSize: '0.9rem', padding: '4px 12px' }}>
                      {t(`interviews.statuses.${interview.status}`, interview.status)}
                    </Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {t('interviews.table.type')}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={getInterviewTypeTagColor(interview.interviewType)} style={{ fontSize: '0.9rem', padding: '4px 12px' }}>
                      {t(`interviews.types.${interview.interviewType}`, interview.interviewType)}
                    </Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {t('interviews.table.duration')}
                  </Text>
                  <div style={{ marginTop: 4, fontWeight: 600 }}>
                    {interview.duration ? `${interview.duration} mins` : '-'}
                  </div>
                </div>
              </div>
            </Card>

            {/* Overview Section */}
            <div>
              <Title level={5} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiClock style={{ color: 'var(--brand-teal, #1890ff)' }} />
                {t('interviews.drawer.overview')}
              </Title>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label={t('interviews.table.id')}>
                  <Text copyable={{ text: interview.name }}>{interview.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('interviews.table.scheduledOn')}>
                  <Text strong>
                    {interview.scheduledOn ? dayjs(interview.scheduledOn).format('YYYY-MM-DD HH:mm') : '-'}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('interviews.drawer.interviewer')} span={2}>
                  {interview.interviewer || '-'}
                </Descriptions.Item>
                {interview.recruiter && (
                  <Descriptions.Item label={t('interviews.drawer.recruiter')} span={2}>
                    {interview.recruiter}
                  </Descriptions.Item>
                )}
                {interview.location && (
                  <Descriptions.Item label={t('interviews.drawer.location')} span={2}>
                    <Space size={4}>
                      <FiMapPin style={{ color: 'var(--brand-teal)' }} />
                      <span>{interview.location}</span>
                    </Space>
                  </Descriptions.Item>
                )}
                {interview.meetingLink && (
                  <Descriptions.Item label={t('interviews.drawer.meetingLink')} span={2}>
                    <Button
                      type="primary"
                      ghost
                      size="small"
                      icon={<FiVideo />}
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('dashboard.meetingLink')}
                    </Button>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>

            <Divider style={{ margin: '4px 0' }} />

            {/* Authoritative Domain Relationships (Candidate, Job Opening, Job Application) */}
            <div>
              <Title level={5} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiTag style={{ color: 'var(--brand-teal, #1890ff)' }} />
                Linked Entities
              </Title>

              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={t('interviews.drawer.candidateRef')}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <FiUser style={{ color: 'var(--brand-teal)' }} />
                      <Text strong copyable={{ text: interview.candidate }}>
                        {interview.candidate}
                      </Text>
                    </Space>
                    <Button type="link" icon={<FiExternalLink />} onClick={handleNavigateCandidate} style={{ padding: 0 }}>
                      {t('interviews.drawer.viewCandidate')}
                    </Button>
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label={t('interviews.drawer.jobOpeningRef')}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <FiBriefcase style={{ color: 'var(--brand-teal)' }} />
                      <Text strong copyable={{ text: interview.jobOpening }}>
                        {interview.jobOpening}
                      </Text>
                    </Space>
                    <Button type="link" icon={<FiExternalLink />} onClick={handleNavigateJob} style={{ padding: 0 }}>
                      {t('interviews.drawer.viewJob')}
                    </Button>
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label={t('interviews.drawer.jobAppRef')}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <FiFileText style={{ color: 'var(--brand-teal)' }} />
                      <Text strong copyable={{ text: interview.jobApplication }}>
                        {interview.jobApplication}
                      </Text>
                    </Space>
                    <Button type="link" icon={<FiExternalLink />} onClick={handleNavigateApp} style={{ padding: 0 }}>
                      {t('interviews.drawer.viewApp')}
                    </Button>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider style={{ margin: '4px 0' }} />

            {/* Status Transition Card */}
            <Card title={t('interviews.drawer.changeStatusTitle')} size="small" style={{ borderRadius: '8px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Select
                    placeholder={t('interviews.drawer.selectNextStatus')}
                    style={{ flex: 1 }}
                    value={selectedNextStatus}
                    onChange={(val) => setSelectedNextStatus(val)}
                  >
                    <Option value="Scheduled">{t('interviews.statuses.Scheduled')}</Option>
                    <Option value="Rescheduled">{t('interviews.statuses.Rescheduled')}</Option>
                    <Option value="Completed">{t('interviews.statuses.Completed')}</Option>
                    <Option value="Cancelled">{t('interviews.statuses.Cancelled')}</Option>
                  </Select>
                  <Button
                    type="primary"
                    onClick={handleStatusSubmit}
                    disabled={!selectedNextStatus}
                    loading={saving}
                  >
                    {t('interviews.drawer.updateStatus')}
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
                    {t('interviews.statuses.Completed')}
                  </Button>
                  <Button
                    icon={<FiRefreshCw />}
                    onClick={() => handleQuickStatus('Rescheduled')}
                    loading={saving}
                    disabled={interview.status === 'Rescheduled'}
                  >
                    {t('interviews.statuses.Rescheduled')}
                  </Button>
                  <Button
                    danger
                    icon={<FiXCircle />}
                    onClick={() => handleQuickStatus('Cancelled')}
                    loading={saving}
                    disabled={interview.status === 'Cancelled'}
                  >
                    {t('interviews.statuses.Cancelled')}
                  </Button>
                </div>
              </Space>
            </Card>

            {/* Additional Remarks / Notes */}
            {interview.remarks && (
              <div>
                <Text strong>{t('interviews.drawer.remarks')}:</Text>
                <Paragraph
                  style={{
                    background: 'var(--bg-subtle, #f8fafc)',
                    padding: 12,
                    borderRadius: 6,
                    marginTop: 4,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {interview.remarks}
                </Paragraph>
              </div>
            )}
          </div>
        )}
      </Spin>
    </Drawer>
  );
};

export default InterviewDetailsDrawer;
