import React from 'react';
import { Card, Table, Skeleton, Empty, Tag, Space, Typography } from 'antd';
import { FiFileText } from 'react-icons/fi';
import { useLanguage } from '../../../../hooks/useLanguage';
import './DashboardComponents.css';

const { Text } = Typography;

export const RecentApplicationsCard = ({ applications = [], loading }) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <Card title={t('dashboard.applicationsTitle')} className="dashboard-section-card">
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  const columns = [
    {
      title: t('dashboard.candidate'),
      dataIndex: 'candidateName',
      key: 'candidateName',
      render: (text) => <Text strong style={{ color: 'var(--text-main)' }}>{text || '--'}</Text>,
    },
    {
      title: t('dashboard.jobTitle'),
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      render: (text) => <Text type="secondary">{text || '--'}</Text>,
    },
    {
      title: t('dashboard.stage'),
      dataIndex: 'stageName',
      key: 'stageName',
      render: (text) => <Tag color="processing">{text || 'Submitted'}</Tag>,
    },
    {
      title: t('dashboard.appliedDate'),
      dataIndex: 'appliedDate',
      key: 'appliedDate',
      render: (text) => <Text style={{ fontSize: '0.8125rem' }}>{text || '--'}</Text>,
    },
  ];

  return (
    <Card
      title={
        <Space align="center">
          <FiFileText style={{ color: 'var(--brand-teal)' }} />
          <span>{t('dashboard.applicationsTitle')}</span>
        </Space>
      }
      className="dashboard-section-card"
    >
      {applications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('dashboard.noApplications')}
          style={{ margin: '24px 0' }}
        />
      ) : (
        <Table
          dataSource={applications}
          columns={columns}
          rowKey={(record) => record.id || record.candidateName}
          pagination={false}
          size="small"
          scroll={{ x: true }}
        />
      )}
    </Card>
  );
};

export default RecentApplicationsCard;
