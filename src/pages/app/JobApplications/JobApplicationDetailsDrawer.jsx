import React, { useState } from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Button,
  Space,
  Typography,
  Divider,
  Timeline,
  Select,
  Input,
  Popconfirm,
  Card,
  Spin,
  Alert,
} from 'antd';
import {
  FiUser,
  FiBriefcase,
  FiCalendar,
  FiFileText,
  FiDownload,
  FiTrash2,
  FiExternalLink,
  FiClock,
  FiTag,
  FiLayers,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';
import { ROUTES } from '../../../routes/routes';
import { getStatusTagColor } from './JobApplicationCard';

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

export const JobApplicationDetailsDrawer = ({
  open,
  visible,
  applicationId,
  application,
  loading,
  saving,
  deleting,
  changingStatus,
  changingStage,
  onClose,
  onEdit,
  onChangeStatus,
  onChangeStage,
  onDelete,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [selectedNextStage, setSelectedNextStage] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const isOpen = open !== undefined ? open : visible;
  const currentId = applicationId || application?.applicationId || application?.id || application?.name || application?.application_id;
  const hasId = Boolean(currentId);
  const isLoading = Boolean(loading) || (hasId && !application);

  if (!application) {
    return (
      <Drawer open={isOpen} onClose={onClose} width={640} title={t('jobApplications.drawer.title', 'Job Application Details')}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Spin tip="Loading application details..." />
          </div>
        ) : (
          <Text type="secondary">{t('jobApplications.drawer.noData', 'No application selected.')}</Text>
        )}
      </Drawer>
    );
  }

  const handleStageSubmit = async () => {
    if (!selectedNextStage) return;
    const stageHandler = onChangeStage || onChangeStatus;
    if (stageHandler) {
      await stageHandler(
        application.id,
        selectedNextStage,
        selectedNextStage === 'Rejected' ? rejectionReason : null
      );
    }
    setSelectedNextStage(null);
    setRejectionReason('');
  };

  const handleNavigateCandidate = () => {
    navigate(ROUTES.CANDIDATES);
  };

  const handleNavigateJob = () => {
    navigate(ROUTES.JOBS);
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      width={640}
      title={
        <Space align="center">
          <FiFileText style={{ color: 'var(--brand-teal, #1890ff)' }} />
          <span>
            {t('jobApplications.drawer.title')} — #{application?.id || ''}
          </span>
        </Space>
      }
      extra={
        <Space>
          {onEdit && (
            <Button icon={<FiFileText />} onClick={() => onEdit(application)}>
              {t('common.edit', 'Edit')}
            </Button>
          )}
          <Popconfirm
            title={t('jobApplications.messages.deleteConfirmTitle')}
            description={t('jobApplications.messages.deleteConfirmSub')}
            onConfirm={() => onDelete(application?.id)}
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
      <Spin spinning={Boolean(isLoading)}>
        {application && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Overview Header Card */}
            <Card size="small" style={{ borderRadius: '8px', background: 'var(--bg-subtle, #f8fafc)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    {t('jobApplications.table.status')}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={getStatusTagColor(application.status)} style={{ fontSize: '0.9rem', padding: '4px 10px' }}>
                      {t(`jobApplications.statuses.${application.status}`, application.status)}
                    </Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    {t('jobApplications.table.currentStage', 'Stage')}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="geekblue" style={{ fontSize: '0.9rem', padding: '4px 10px' }}>
                      {application.currentStage || application.status}
                    </Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    {t('jobApplications.table.priority')}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={application.priority === 'High' ? 'red' : application.priority === 'Low' ? 'default' : 'orange'}>
                      {application.priority}
                    </Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    {t('jobApplications.table.appliedOn')}
                  </Text>
                  <div style={{ marginTop: 4, fontWeight: 500 }}>
                    {application.appliedOn ? dayjs(application.appliedOn).format('DD MMM YYYY') : '-'}
                  </div>
                </div>
              </div>
            </Card>

            {/* Candidate Relationship Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Title level={5} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiUser style={{ color: 'var(--brand-teal, #1890ff)' }} />
                  {t('jobApplications.drawer.candidateInfo')}
                </Title>
                <Button type="link" icon={<FiExternalLink />} onClick={handleNavigateCandidate} style={{ padding: 0 }}>
                  {t('jobApplications.drawer.viewCandidateProfile')}
                </Button>
              </div>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label={t('jobApplications.table.candidate')}>
                  <Text strong>{application.candidateName || application.candidate}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('jobApplications.drawer.candidateId')}>
                  <Text copyable={{ text: application.candidate }}>{application.candidate}</Text>
                </Descriptions.Item>
                {application.candidateEmail && (
                  <Descriptions.Item label={t('jobApplications.drawer.email')} span={2}>
                    {application.candidateEmail}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>

            <Divider style={{ margin: '4px 0' }} />

            {/* Job Opening Relationship Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Title level={5} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiBriefcase style={{ color: 'var(--brand-teal, #1890ff)' }} />
                  {t('jobApplications.drawer.jobInfo')}
                </Title>
                <Button type="link" icon={<FiExternalLink />} onClick={handleNavigateJob} style={{ padding: 0 }}>
                  {t('jobApplications.drawer.viewJobDetails')}
                </Button>
              </div>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label={t('jobApplications.table.jobOpening')}>
                  <Text strong>{application.jobTitle || application.jobOpening}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('jobApplications.drawer.jobCode')}>
                  {application.jobCode || application.jobOpening}
                </Descriptions.Item>
                {application.department && (
                  <Descriptions.Item label={t('jobApplications.drawer.department')} span={2}>
                    {application.department}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>

            <Divider style={{ margin: '4px 0' }} />

            {/* Single Pipeline Stage Transition Control */}
            <Card title={t('jobApplications.drawer.updateStage', 'Current Stage')} size="small" style={{ borderRadius: '8px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Select
                    placeholder={t('jobApplications.drawer.selectNextStage', 'Select recruitment stage')}
                    style={{ flex: 1, minWidth: 200 }}
                    value={selectedNextStage || application.currentStage || application.status || 'Applied'}
                    onChange={(val) => setSelectedNextStage(val)}
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
                  <Button
                    type="primary"
                    onClick={handleStageSubmit}
                    disabled={!selectedNextStage || selectedNextStage === (application.currentStage || application.status)}
                    loading={saving || changingStage || changingStatus}
                    icon={<FiLayers />}
                  >
                    {t('jobApplications.drawer.updateStageBtn', 'Update Stage')}
                  </Button>
                </div>

                {selectedNextStage === 'Rejected' && (
                  <Input.TextArea
                    rows={2}
                    placeholder={t('jobApplications.drawer.rejectionReasonPlaceholder', 'Enter rejection reason...')}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                )}
              </Space>
            </Card>

            <Divider style={{ margin: '4px 0' }} />

            {/* Application Information Details */}
            <div>
              <Title level={5} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiTag style={{ color: 'var(--brand-teal, #1890ff)' }} />
                {t('jobApplications.drawer.applicationInfo')}
              </Title>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label={t('jobApplications.table.source')}>
                  {application.source || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('jobApplications.table.expectedSalary')}>
                  {application.expectedSalary !== null ? `$${application.expectedSalary.toLocaleString()}` : '-'}
                </Descriptions.Item>
                {application.recruiterName && (
                  <Descriptions.Item label={t('jobApplications.drawer.recruiter')} span={2}>
                    {application.recruiterName}
                  </Descriptions.Item>
                )}
                {application.rejectionReason && (
                  <Descriptions.Item label={t('jobApplications.drawer.rejectionReason')} span={2}>
                    <Text type="danger">{application.rejectionReason}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>

              {application.notes && (
                <div style={{ marginTop: 12 }}>
                  <Text strong>{t('jobApplications.form.notesLabel', 'Internal Notes')}:</Text>
                  <Paragraph
                    style={{
                      background: 'var(--bg-subtle, #f8fafc)',
                      padding: 12,
                      borderRadius: 6,
                      marginTop: 4,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {application.notes}
                  </Paragraph>
                </div>
              )}

              {application.coverLetter && (
                <div style={{ marginTop: 12 }}>
                  <Text strong>{t('jobApplications.drawer.coverLetter')}:</Text>
                  <Paragraph
                    style={{
                      background: 'var(--bg-subtle, #f8fafc)',
                      padding: 12,
                      borderRadius: 6,
                      marginTop: 4,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {application.coverLetter}
                  </Paragraph>
                </div>
              )}

              {application.resume && (
                <div style={{ marginTop: 12 }}>
                  <Button
                    type="outline"
                    icon={<FiDownload />}
                    href={application.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('jobApplications.drawer.downloadResume')}
                  </Button>
                </div>
              )}
            </div>

            <Divider style={{ margin: '4px 0' }} />

            {/* Timeline / History Section */}
            <div>
              <Title level={5} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiClock style={{ color: 'var(--brand-teal, #1890ff)' }} />
                {t('jobApplications.drawer.timeline')}
              </Title>
              {Array.isArray(application.timeline) && application.timeline.length > 0 ? (
                <Timeline
                  items={application.timeline.map((event, idx) => ({
                    color: 'blue',
                    children: (
                      <div key={idx}>
                        <Text strong>{event.stage || event.status || event.event || 'Status Event'}</Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: '0.8rem' }}>
                            {event.timestamp ? dayjs(event.timestamp).format('DD MMM YYYY HH:mm') : ''}
                          </Text>
                        </div>
                        {event.description && <Text style={{ fontSize: '0.85rem' }}>{event.description}</Text>}
                      </div>
                    ),
                  }))}
                />
              ) : (
                <Alert
                  type="info"
                  message={t('jobApplications.drawer.noTimeline')}
                  showIcon
                  style={{ fontSize: '0.85rem' }}
                />
              )}
            </div>
          </div>
        )}
      </Spin>
    </Drawer>
  );
};

export default JobApplicationDetailsDrawer;
