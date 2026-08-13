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

  return (
    <div className="distribution-list">
      {entries.map(([key, val]) => {
        const count = Number(val ?? 0);
        const percent = Math.min(100, Math.round((count / (total || 1)) * 100));

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

export const InterviewMetricsSection = ({ interviewMetrics, loading = false }) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <Card className="analytics-card">
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  const {
    byStatus = {},
    byType = {},
    byResult = {},
    totalInterviews = 0,
  } = interviewMetrics || {};

  return (
    <Card className="analytics-card">
      <div className="analytics-card-header">
        <div>
          <Title level={4} className="analytics-card-title">
            {t('analytics.interviewMetrics.title')}
          </Title>
          <Text type="secondary" className="analytics-card-sub">
            {t('analytics.interviewMetrics.subtitle')}
          </Text>
        </div>
        <Tag color="purple" className="analytics-total-tag">
          {totalInterviews.toLocaleString()} Total
        </Tag>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <div className="metrics-box">
            <Title level={5} className="metrics-box-title">
              {t('analytics.interviewMetrics.byStatus')}
            </Title>
            {renderDistributionList(byStatus, totalInterviews, '#6366F1')}
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div className="metrics-box">
            <Title level={5} className="metrics-box-title">
              {t('analytics.interviewMetrics.byType')}
            </Title>
            {renderDistributionList(byType, totalInterviews, '#EC4899')}
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div className="metrics-box">
            <Title level={5} className="metrics-box-title">
              {t('analytics.interviewMetrics.byResult')}
            </Title>
            {renderDistributionList(byResult, totalInterviews, '#10B981')}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default InterviewMetricsSection;
