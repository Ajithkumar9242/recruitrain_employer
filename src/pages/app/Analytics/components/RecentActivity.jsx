import React from 'react';
import { Card, Typography, Table, Tag, Skeleton, Select, Space } from 'antd';
import dayjs from 'dayjs';
import { useLanguage } from '../../../../hooks/useLanguage';
import './AnalyticsComponents.css';

const { Title, Text } = Typography;

export const RecentActivity = ({
  recentActivity = [],
  pagination = {},
  selectedEntity = null,
  onEntityChange,
  onPageChange,
  loading = false,
}) => {
  const { t } = useLanguage();

  if (loading && (!recentActivity || recentActivity.length === 0)) {
    return (
      <Card className="analytics-card">
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  const columns = [
    {
      title: t('analytics.recentActivity.table.timestamp'),
      dataIndex: 'modified',
      key: 'modified',
      width: 170,
      render: (val) => (
        <Text type="secondary" style={{ fontSize: '0.82rem' }}>
          {val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'}
        </Text>
      ),
    },
    {
      title: t('analytics.recentActivity.table.entityType'),
      dataIndex: 'doctype',
      key: 'doctype',
      width: 150,
      render: (doctype) => {
        let color = 'blue';
        if (doctype === 'Candidate') color = 'teal';
        if (doctype === 'Job Application') color = 'purple';
        if (doctype === 'Interview') color = 'magenta';
        if (doctype === 'Offer') color = 'gold';
        return <Tag color={color}>{doctype}</Tag>;
      },
    },
    {
      title: t('analytics.recentActivity.table.title'),
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => <Text strong>{text || record.name}</Text>,
    },
    {
      title: t('analytics.recentActivity.table.action'),
      dataIndex: 'action',
      key: 'action',
      width: 130,
      render: (action) => <Tag color="geekblue">{action || 'Updated'}</Tag>,
    },
  ];

  return (
    <Card className="analytics-card">
      <div className="analytics-card-header">
        <div>
          <Title level={4} className="analytics-card-title">
            {t('analytics.recentActivity.title')}
          </Title>
          <Text type="secondary" className="analytics-card-sub">
            {t('analytics.recentActivity.subtitle')}
          </Text>
        </div>
        <Space wrap>
          <Text type="secondary" style={{ fontSize: '0.85rem' }}>
            {t('analytics.recentActivity.entityFilter')}:
          </Text>
          <Select
            value={selectedEntity || ''}
            onChange={(val) => onEntityChange && onEntityChange(val || null)}
            style={{ width: 160 }}
            size="small"
            options={[
              { value: '', label: t('analytics.recentActivity.allEntities') },
              { value: 'Candidate', label: t('analytics.recentActivity.candidate') },
              { value: 'Job Application', label: t('analytics.recentActivity.application') },
              { value: 'Interview', label: t('analytics.recentActivity.interview') },
              { value: 'Offer', label: t('analytics.recentActivity.offer') },
            ]}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={recentActivity}
        rowKey={(r, idx) => `${r.doctype}-${r.name}-${idx}`}
        loading={loading}
        pagination={{
          current: pagination.page || 1,
          pageSize: pagination.pageSize || 10,
          total: pagination.total || 0,
          onChange: (p) => onPageChange && onPageChange(p),
          showSizeChanger: false,
        }}
        size="small"
      />
    </Card>
  );
};

export default RecentActivity;
