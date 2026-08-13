import React from 'react';
import { Card, Typography, Skeleton, Empty, Radio } from 'antd';
import { useLanguage } from '../../../../hooks/useLanguage';
import './AnalyticsComponents.css';

const { Title, Text } = Typography;

export const TrendsChart = ({
  trends = [],
  granularity = 'monthly',
  onGranularityChange,
  loading = false,
}) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <Card className="analytics-card">
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  const hasData = trends && trends.length > 0;
  const maxCount = hasData ? Math.max(...trends.map((t) => t.count), 1) : 1;

  return (
    <Card className="analytics-card">
      <div className="analytics-card-header">
        <div>
          <Title level={4} className="analytics-card-title">
            {t('analytics.trends.title')}
          </Title>
          <Text type="secondary" className="analytics-card-sub">
            {t('analytics.trends.subtitle')}
          </Text>
        </div>
        <Radio.Group
          value={granularity}
          onChange={(e) => onGranularityChange && onGranularityChange(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="daily">{t('analytics.filters.daily')}</Radio.Button>
          <Radio.Button value="weekly">{t('analytics.filters.weekly')}</Radio.Button>
          <Radio.Button value="monthly">{t('analytics.filters.monthly')}</Radio.Button>
        </Radio.Group>
      </div>

      {!hasData ? (
        <Empty description={t('analytics.trends.noData')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className="trends-chart-container">
          <div className="trends-bar-chart">
            {trends.map((item, idx) => {
              const heightPercent = Math.max(8, Math.round((item.count / maxCount) * 100));
              return (
                <div key={item.period || idx} className="trends-bar-col">
                  <div className="trends-bar-wrapper">
                    <div className="trends-bar-value">{item.count}</div>
                    <div
                      className="trends-bar-fill"
                      style={{ height: `${heightPercent}%` }}
                      title={`${item.period}: ${item.count} applications`}
                    />
                  </div>
                  <div className="trends-bar-label">{item.period}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

export default TrendsChart;
