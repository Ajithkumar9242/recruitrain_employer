import React from 'react';
import { Card, Timeline, Skeleton, Empty, Space, Typography } from 'antd';
import { FiActivity, FiClock } from 'react-icons/fi';
import { useLanguage } from '../../../../hooks/useLanguage';
import './DashboardComponents.css';

const { Text, Paragraph } = Typography;

export const RecentActivityCard = ({ activities = [], loading }) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <Card title={t('dashboard.activityTitle')} className="dashboard-section-card">
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space align="center">
          <FiActivity style={{ color: 'var(--brand-amber)' }} />
          <span>{t('dashboard.activityTitle')}</span>
        </Space>
      }
      className="dashboard-section-card"
    >
      {activities.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('dashboard.noActivity')}
          style={{ margin: '24px 0' }}
        />
      ) : (
        <Timeline
          mode="left"
          items={activities.map((item) => ({
            key: item.id,
            color: 'var(--brand-teal)',
            children: (
              <div>
                <Text strong style={{ color: 'var(--text-main)', fontSize: '0.875rem' }}>
                  {item.title}
                </Text>
                {item.description && (
                  <Paragraph
                    type="secondary"
                    style={{ margin: '2px 0 4px', fontSize: '0.8125rem' }}
                  >
                    {item.description}
                  </Paragraph>
                )}
                {item.timestamp && (
                  <Text type="secondary" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <FiClock size={11} style={{ marginRight: 4 }} />
                    {item.timestamp}
                  </Text>
                )}
              </div>
            ),
          }))}
        />
      )}
    </Card>
  );
};

export default RecentActivityCard;
