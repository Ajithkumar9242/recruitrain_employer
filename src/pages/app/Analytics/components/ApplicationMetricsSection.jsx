import React from 'react';
import { Card, Typography, Row, Col, Skeleton, Tag, Progress } from 'antd';
import { useLanguage } from '../../../../hooks/useLanguage';
import './AnalyticsComponents.css';

const { Title, Text } = Typography;

const renderDistributionList = (dataDict, total = 1, accentColor = 'var(--brand-teal)') => {
  if (!dataDict || Object.keys(dataDict).length === 0) {
    return <Text type="secondary" style={{ fontSize: '0.85rem' }}>No data recorded</Text>;
  }

  const entries = Object.entries(dataDict);
  const maxVal = Math.max(...Object.values(dataDict), 1);

  return (
    <div className="distribution-list">
      {entries.map(([key, val]) => {
        const count = Number(val ?? 0);
        const percent = Math.min(100, Math.round((count / (total || maxVal || 1)) * 100));

        return (
          <div key={key} className="distribution-item">
            <div className="distribution-meta">
              <Text className="distribution-label">{key}</Text>
              <Text strong className="distribution-val">
                {count.toLocaleString()}
              </Text>
            </div>
            <Progress
              percent={percent}
              strokeColor={accentColor}
              showInfo={false}
              size="small"
            />
          </div>
        );
      })}
    </div>
  );
};

export const ApplicationMetricsSection = ({ applicationMetrics, loading = false }) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <Card className="analytics-card">
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  const {
    byStatus = {},
    byStage = {},
    bySource = {},
    byPriority = {},
    totalApplications = 0,
  } = applicationMetrics || {};

  return (
    <Card className="analytics-card">
      <div className="analytics-card-header">
        <div>
          <Title level={4} className="analytics-card-title">
            {t('analytics.applicationMetrics.title')}
          </Title>
          <Text type="secondary" className="analytics-card-sub">
            {t('analytics.applicationMetrics.subtitle')}
          </Text>
        </div>
        <Tag color="cyan" className="analytics-total-tag">
          {totalApplications.toLocaleString()} Total
        </Tag>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <div className="metrics-box">
            <Title level={5} className="metrics-box-title">
              {t('analytics.applicationMetrics.byStatus')}
            </Title>
            {renderDistributionList(byStatus, totalApplications, '#3B82F6')}
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="metrics-box">
            <Title level={5} className="metrics-box-title">
              {t('analytics.applicationMetrics.byStage')}
            </Title>
            {renderDistributionList(byStage, totalApplications, '#8B5CF6')}
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="metrics-box">
            <Title level={5} className="metrics-box-title">
              {t('analytics.applicationMetrics.bySource')}
            </Title>
            {renderDistributionList(bySource, totalApplications, '#10B981')}
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="metrics-box">
            <Title level={5} className="metrics-box-title">
              {t('analytics.applicationMetrics.byPriority')}
            </Title>
            {renderDistributionList(byPriority, totalApplications, '#F59E0B')}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default ApplicationMetricsSection;
