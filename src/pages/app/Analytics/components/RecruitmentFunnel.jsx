import React from 'react';
import { Card, Typography, Skeleton, Tag, Progress } from 'antd';
import { useLanguage } from '../../../../hooks/useLanguage';
import './AnalyticsComponents.css';

const { Title, Text } = Typography;

const STAGE_COLORS = {
  Applied: '#3B82F6',
  Screening: '#8B5CF6',
  Shortlisted: '#6366F1',
  Interview: '#EC4899',
  Offer: '#F59E0B',
  Hired: '#10B981',
  Rejected: '#EF4444',
};

export const RecruitmentFunnel = ({ funnelData, loading = false }) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <Card className="analytics-card">
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  const stages = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'];
  const funnel = funnelData?.funnel || {};
  const conversionRates = funnelData?.conversionRates || {};
  const total = funnelData?.total ?? 0;

  return (
    <Card className="analytics-card">
      <div className="analytics-card-header">
        <div>
          <Title level={4} className="analytics-card-title">
            {t('analytics.funnel.title')}
          </Title>
          <Text type="secondary" className="analytics-card-sub">
            {t('analytics.funnel.subtitle')}
          </Text>
        </div>
        <Tag color="blue" className="analytics-total-tag">
          {t('analytics.funnel.total')}: {total.toLocaleString()}
        </Tag>
      </div>

      <div className="funnel-container">
        {stages.map((stage, idx) => {
          const count = Number(funnel[stage] ?? 0);
          const rate = Number(conversionRates[stage] ?? 0);
          const color = STAGE_COLORS[stage] || 'var(--brand-teal)';

          return (
            <div key={stage} className="funnel-stage-item">
              <div className="funnel-stage-meta">
                <div className="funnel-stage-name-wrap">
                  <span className="funnel-stage-bullet" style={{ backgroundColor: color }} />
                  <Text strong className="funnel-stage-name">
                    {stage}
                  </Text>
                </div>
                <div className="funnel-stage-values">
                  <Text strong className="funnel-stage-count">
                    {count.toLocaleString()}
                  </Text>
                  <Tag className="funnel-rate-badge" style={{ color: color, borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}>
                    {rate}%
                  </Tag>
                </div>
              </div>

              <Progress
                percent={rate}
                strokeColor={color}
                showInfo={false}
                size="small"
                className="funnel-progress"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RecruitmentFunnel;
