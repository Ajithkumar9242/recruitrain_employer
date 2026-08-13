import React from 'react';
import { Card, Space, Avatar, Tag, Progress, Typography, Button, Popconfirm } from 'antd';
import { FiMail, FiPhone, FiMapPin, FiEye, FiEdit, FiTrash2, FiGlobe } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';

const { Text, Title } = Typography;

export const CandidateCard = ({ candidate, onViewProfile, onEdit, onDelete }) => {
  const { t } = useLanguage();

  if (!candidate) return null;

  return (
    <Card
      size="small"
      style={{
        borderRadius: '12px',
        marginBottom: '16px',
        border: '1px solid var(--border-color, #e5e7eb)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      }}
      actions={[
        <Button key="view" type="text" icon={<FiEye />} onClick={() => onViewProfile(candidate)}>
          {t('candidate.actions.viewProfile')}
        </Button>,
        <Button key="edit" type="text" icon={<FiEdit />} onClick={() => onEdit(candidate)}>
          {t('candidate.actions.edit')}
        </Button>,
        <Popconfirm
          key="delete"
          title={t('candidate.messages.deleteConfirmTitle')}
          description={t('candidate.messages.deleteConfirmSub')}
          onConfirm={() => onDelete(candidate.id)}
          okText={t('common.confirm')}
          cancelText={t('common.cancel')}
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<FiTrash2 />}>
            {t('candidate.actions.delete')}
          </Button>
        </Popconfirm>,
      ]}
    >
      <Space align="start" style={{ width: '100%', justifyContent: 'space-between', marginBottom: '12px' }}>
        <Space align="center">
          <Avatar
            size={48}
            style={{
              backgroundColor: 'var(--brand-navy-soft, #e6f0fa)',
              color: 'var(--brand-teal, #008080)',
              fontWeight: 600,
              fontSize: '1.2rem',
            }}
          >
            {(candidate.fullName || 'C').charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              {candidate.fullName}
            </Title>
            <Text type="secondary" style={{ fontSize: '0.85rem' }}>
              {candidate.currentJobTitle || candidate.profession || t('candidate.title')}
              {candidate.currentCompany ? ` @ ${candidate.currentCompany}` : ''}
            </Text>
          </div>
        </Space>
        <Tag color={candidate.status === 'Active' ? 'green' : 'default'}>{candidate.status}</Tag>
      </Space>

      <Space direction="vertical" size={4} style={{ width: '100%', marginBottom: '12px' }}>
        <Text type="secondary" style={{ fontSize: '0.8rem' }}>
          <FiMail style={{ marginRight: 6, color: 'var(--brand-teal)' }} />
          {candidate.email}
        </Text>
        {candidate.mobileNo && (
          <Text type="secondary" style={{ fontSize: '0.8rem' }}>
            <FiPhone style={{ marginRight: 6, color: 'var(--brand-teal)' }} />
            {candidate.mobileNo}
          </Text>
        )}
        {candidate.locationDisplay && (
          <Text type="secondary" style={{ fontSize: '0.8rem' }}>
            <FiMapPin style={{ marginRight: 6, color: 'var(--brand-teal)' }} />
            {candidate.locationDisplay}
          </Text>
        )}
      </Space>

      <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
        <div>
          <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block' }}>
            {t('candidate.table.completion')}
          </Text>
          <Progress
            percent={candidate.profileCompletion || 0}
            size="small"
            strokeColor="var(--brand-teal)"
            style={{ width: 120 }}
          />
        </div>
        <div>
          {candidate.isInternational && (
            <Tag color="cyan" icon={<FiGlobe />}>
              {t('candidate.badges.international')}
            </Tag>
          )}
          <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block', textAlign: 'right' }}>
            {candidate.creation ? dayjs(candidate.creation).format('DD MMM YYYY') : ''}
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default CandidateCard;
