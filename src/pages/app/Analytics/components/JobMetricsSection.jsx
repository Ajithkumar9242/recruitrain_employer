import React from 'react';
import { Card, Typography, Table, Tag, Skeleton, Row, Col, Statistic } from 'antd';
import { useLanguage } from '../../../../hooks/useLanguage';
import './AnalyticsComponents.css';

const { Title, Text } = Typography;

export const JobMetricsSection = ({ jobMetrics, loading = false }) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <Card className="analytics-card">
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  const {
    totalJobs = 0,
    openJobs = 0,
    filledJobs = 0,
    closedJobs = 0,
    totalOpenings = 0,
    applicationsPerJob = [],
  } = jobMetrics || {};

  const columns = [
    {
      title: t('analytics.jobMetrics.table.jobTitle'),
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      render: (text, record) => (
        <div>
          <Text strong>{text || record.jobOpening}</Text>
          {record.jobCode && (
            <Text type="secondary" style={{ display: 'block', fontSize: '0.75rem' }}>
              {record.jobCode}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: t('analytics.jobMetrics.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status) => {
        let color = 'default';
        if (status === 'Open') color = 'green';
        if (status === 'Filled') color = 'blue';
        if (status === 'Closed') color = 'gray';
        if (status === 'Draft') color = 'orange';
        return <Tag color={color}>{status || 'Draft'}</Tag>;
      },
    },
    {
      title: t('analytics.jobMetrics.table.openings'),
      dataIndex: 'openings',
      key: 'openings',
      width: 100,
      align: 'right',
      render: (val) => Number(val ?? 0).toLocaleString(),
    },
    {
      title: t('analytics.jobMetrics.table.applicationsCount'),
      dataIndex: 'applicationsCount',
      key: 'applicationsCount',
      width: 120,
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: 'var(--brand-teal)' }}>
          {Number(val ?? 0).toLocaleString()}
        </Text>
      ),
    },
  ];

  return (
    <Card className="analytics-card">
      <div className="analytics-card-header">
        <div>
          <Title level={4} className="analytics-card-title">
            {t('analytics.jobMetrics.title')}
          </Title>
          <Text type="secondary" className="analytics-card-sub">
            {t('analytics.jobMetrics.subtitle')}
          </Text>
        </div>
      </div>

      <Row gutter={[16, 16]} className="job-metrics-stat-row">
        <Col xs={12} sm={6}>
          <div className="job-stat-box">
            <Statistic title={t('analytics.jobMetrics.totalOpenings')} value={totalOpenings} />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="job-stat-box">
            <Statistic title={t('analytics.jobMetrics.openJobs')} value={openJobs} valueStyle={{ color: '#10B981' }} />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="job-stat-box">
            <Statistic title={t('analytics.jobMetrics.filledJobs')} value={filledJobs} valueStyle={{ color: '#3B82F6' }} />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="job-stat-box">
            <Statistic title={t('analytics.jobMetrics.closedJobs')} value={closedJobs} />
          </div>
        </Col>
      </Row>

      <div className="job-metrics-table-wrap">
        <Title level={5} style={{ marginTop: 20, marginBottom: 12 }}>
          {t('analytics.jobMetrics.applicationsPerJob')}
        </Title>
        <Table
          columns={columns}
          dataSource={applicationsPerJob}
          rowKey={(r) => r.jobOpening || r.jobTitle}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </div>
    </Card>
  );
};

export default JobMetricsSection;
