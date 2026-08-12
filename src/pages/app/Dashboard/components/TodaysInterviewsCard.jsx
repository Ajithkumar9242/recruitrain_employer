import React from 'react';
import { Card, Table, Skeleton, Empty, Tag, Button, Space, Typography } from 'antd';
import { FiCalendar, FiExternalLink, FiClock } from 'react-icons/fi';
import { useLanguage } from '../../../../hooks/useLanguage';
import './DashboardComponents.css';

const { Text } = Typography;

export const TodaysInterviewsCard = ({ interviews = [], loading }) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <Card title={t('dashboard.interviewsTitle')} className="dashboard-section-card">
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
      title: t('dashboard.time'),
      dataIndex: 'scheduledTime',
      key: 'scheduledTime',
      render: (text) => (
        <Space size={4}>
          <FiClock size={12} style={{ color: 'var(--brand-teal)' }} />
          <Text style={{ fontSize: '0.8125rem' }}>{text || '--'}</Text>
        </Space>
      ),
    },
    {
      title: t('dashboard.interviewer'),
      dataIndex: 'interviewer',
      key: 'interviewer',
      render: (text) => <Text type="secondary">{text || '--'}</Text>,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) =>
        record.meetingLink ? (
          <Button
            type="link"
            size="small"
            icon={<FiExternalLink />}
            href={record.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('dashboard.meetingLink')}
          </Button>
        ) : (
          <Tag color="default">Scheduled</Tag>
        ),
    },
  ];

  return (
    <Card
      title={
        <Space align="center">
          <FiCalendar style={{ color: 'var(--brand-navy)' }} />
          <span>{t('dashboard.interviewsTitle')}</span>
        </Space>
      }
      className="dashboard-section-card"
    >
      {interviews.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('dashboard.noInterviews')}
          style={{ margin: '24px 0' }}
        />
      ) : (
        <Table
          dataSource={interviews}
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

export default TodaysInterviewsCard;
