import React from 'react';
import { Card, Typography, Row, Col, Statistic, Skeleton, Tag } from 'antd';
import { FiClock } from 'react-icons/fi';
import { useLanguage } from '../../../../hooks/useLanguage';
import './AnalyticsComponents.css';

const { Title, Text } = Typography;

export const TimeToHireCard = ({ timeToHire, loading = false }) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <Card className="analytics-card">
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  const {
    avgDays = 0,
    minDays = 0,
    maxDays = 0,
    totalHires = 0,
  } = timeToHire || {};

  return (
    <Card className="analytics-card">
      <div className="analytics-card-header">
        <div>
          <Title level={4} className="analytics-card-title">
            <FiClock size={18} style={{ marginRight: 8, color: 'var(--brand-teal)' }} />
            {t('analytics.timeToHire.title')}
          </Title>
          <Text type="secondary" className="analytics-card-sub">
            {t('analytics.timeToHire.subtitle')}
          </Text>
        </div>
        <Tag color="cyan" className="analytics-total-tag">
          {totalHires} {t('analytics.timeToHire.totalHires')}
        </Tag>
      </div>

      <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
        <Col xs={24} sm={8}>
          <div className="time-to-hire-box main">
            <Statistic
              title={t('analytics.timeToHire.avgDays')}
              value={avgDays}
              suffix="days"
              precision={1}
              valueStyle={{ color: 'var(--brand-teal)', fontSize: '2rem', fontWeight: 600 }}
            />
          </div>
        </Col>
        <Col xs={12} sm={8}>
          <div className="time-to-hire-box">
            <Statistic
              title={t('analytics.timeToHire.minDays')}
              value={minDays}
              suffix="days"
              valueStyle={{ color: '#10B981', fontSize: '1.5rem' }}
            />
          </div>
        </Col>
        <Col xs={12} sm={8}>
          <div className="time-to-hire-box">
            <Statistic
              title={t('analytics.timeToHire.maxDays')}
              value={maxDays}
              suffix="days"
              valueStyle={{ color: '#F59E0B', fontSize: '1.5rem' }}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default TimeToHireCard;
