import React from 'react';
import { Card, Tag, Space, Button, Typography, Popconfirm, Tooltip } from 'antd';
import { FiEye, FiCheckCircle, FiXCircle, FiTrash2, FiCalendar, FiUser, FiBriefcase, FiTag } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';

const { Text } = Typography;

export const getStatusTagColor = (status) => {
  switch (status) {
    case 'Applied':
    case 'Open':
      return 'blue';
    case 'Screening':
      return 'cyan';
    case 'Shortlisted':
      return 'purple';
    case 'Interview Scheduled':
    case 'Interviewed':
      return 'geekblue';
    case 'Offer Extended':
      return 'orange';
    case 'Hired':
      return 'success';
    case 'Rejected':
      return 'error';
    case 'Withdrawn':
    case 'Closed':
      return 'default';
    default:
      return 'default';
  }
};

export const JobApplicationCard = ({
  application,
  onViewDetails,
  onQuickStatusChange,
  onDelete,
}) => {
  const { t } = useLanguage();

  if (!application) return null;

  return (
    <Card
      size="small"
      style={{
        marginBottom: 12,
        borderRadius: 8,
        border: '1px solid var(--border-color, #e2e8f0)',
        background: 'var(--bg-card, #ffffff)',
      }}
      bodyStyle={{ padding: '12px 16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <a
          onClick={() => onViewDetails(application)}
          style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand-teal, #1890ff)', fontSize: '0.95rem' }}
        >
          #{application.id}
        </a>
        <Tag color={getStatusTagColor(application.status)}>
          {t(`jobApplications.statuses.${application.status}`, application.status)}
        </Tag>
      </div>

      <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <FiUser style={{ color: 'var(--brand-teal, #1890ff)', flexShrink: 0 }} />
        <Text strong style={{ fontSize: '0.9rem', wordBreak: 'break-word' }}>
          {application.candidateName || application.candidate}
        </Text>
      </div>

      <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <FiBriefcase style={{ color: 'var(--text-secondary, #64748b)', flexShrink: 0 }} />
        <Text type="secondary" style={{ fontSize: '0.85rem', wordBreak: 'break-word' }}>
          {application.jobTitle || application.jobOpening}
        </Text>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <FiCalendar style={{ color: 'var(--text-secondary, #94a3b8)' }} />
          <Text type="secondary">
            {application.appliedOn ? dayjs(application.appliedOn).format('DD MMM YYYY') : '-'}
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <FiTag style={{ color: 'var(--text-secondary, #94a3b8)' }} />
          <Tag color={application.priority === 'High' ? 'red' : application.priority === 'Low' ? 'default' : 'orange'} style={{ margin: 0 }}>
            {application.priority || 'Medium'}
          </Tag>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: 8, borderTop: '1px dashed var(--border-color, #f1f5f9)' }}>
        <Space size="small">
          <Tooltip title={t('common.viewDetails')}>
            <Button
              type="text"
              size="small"
              icon={<FiEye />}
              onClick={() => onViewDetails(application)}
            />
          </Tooltip>

          {application.status !== 'Shortlisted' && application.status !== 'Hired' && (
            <Tooltip title={t('jobApplications.actions.shortlist')}>
              <Button
                type="text"
                size="small"
                icon={<FiCheckCircle style={{ color: '#52c41a' }} />}
                onClick={() => onQuickStatusChange(application.id, 'Shortlisted')}
              />
            </Tooltip>
          )}

          {application.status !== 'Rejected' && (
            <Tooltip title={t('jobApplications.actions.reject')}>
              <Button
                type="text"
                size="small"
                icon={<FiXCircle style={{ color: '#ff4d4f' }} />}
                onClick={() => onQuickStatusChange(application.id, 'Rejected')}
              />
            </Tooltip>
          )}

          <Popconfirm
            title={t('jobApplications.messages.deleteConfirmTitle')}
            description={t('jobApplications.messages.deleteConfirmSub')}
            onConfirm={() => onDelete(application.id)}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
          >
            <Tooltip title={t('common.delete')}>
              <Button type="text" size="small" danger icon={<FiTrash2 />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      </div>
    </Card>
  );
};

export default JobApplicationCard;
