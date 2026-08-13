import React from 'react';
import { Card, Typography, Row, Col, Statistic, Skeleton, Tag, Progress } from 'antd';
import { useLanguage } from '../../../../hooks/useLanguage';
import './AnalyticsComponents.css';

const { Title, Text } = Typography;

export const OfferMetricsSection = ({ offerMetrics, loading = false }) => {
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
    totalOffers = 0,
    acceptedOffers = 0,
    acceptanceRate = 0,
    totalOfferedSalary = 0,
  } = offerMetrics || {};

  const formattedSalary = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(totalOfferedSalary);

  return (
    <Card className="analytics-card">
      <div className="analytics-card-header">
        <div>
          <Title level={4} className="analytics-card-title">
            {t('analytics.offerMetrics.title')}
          </Title>
          <Text type="secondary" className="analytics-card-sub">
            {t('analytics.offerMetrics.subtitle')}
          </Text>
        </div>
        <Tag color="gold" className="analytics-total-tag">
          {totalOffers.toLocaleString()} Total Offers
        </Tag>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={8}>
          <div className="offer-kpi-highlight">
            <Statistic
              title={t('analytics.offerMetrics.acceptanceRate')}
              value={acceptanceRate}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#10B981', fontSize: '2rem' }}
            />
            <Text type="secondary" style={{ fontSize: '0.8rem', display: 'block', marginTop: 4 }}>
              Authoritative backend calculation ({acceptedOffers} of {totalOffers} accepted)
            </Text>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <div className="offer-kpi-highlight">
            <Statistic
              title={t('analytics.offerMetrics.totalOfferedSalary')}
              value={formattedSalary}
              valueStyle={{ color: 'var(--brand-teal)', fontSize: '1.75rem' }}
            />
            <Text type="secondary" style={{ fontSize: '0.8rem', display: 'block', marginTop: 4 }}>
              Cumulative salary across all created offer records
            </Text>
          </div>
        </Col>

        <Col xs={24} sm={24} md={8}>
          <div className="metrics-box">
            <Title level={5} className="metrics-box-title">
              {t('analytics.offerMetrics.byStatus')}
            </Title>
            <div className="distribution-list">
              {Object.entries(byStatus).map(([st, count]) => {
                const val = Number(count ?? 0);
                const percent = totalOffers > 0 ? Math.round((val / totalOffers) * 100) : 0;
                let color = '#3B82F6';
                if (st === 'Accepted') color = '#10B981';
                if (st === 'Rejected' || st === 'Withdrawn') color = '#EF4444';
                if (st === 'Sent') color = '#F59E0B';

                return (
                  <div key={st} className="distribution-item">
                    <div className="distribution-meta">
                      <Text className="distribution-label">{st}</Text>
                      <Text strong className="distribution-val">
                        {val}
                      </Text>
                    </div>
                    <Progress
                      percent={percent}
                      strokeColor={color}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default OfferMetricsSection;
