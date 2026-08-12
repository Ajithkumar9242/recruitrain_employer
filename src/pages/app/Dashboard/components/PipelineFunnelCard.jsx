import React from 'react';
import { Card, Progress, Skeleton, Empty, Typography, Row, Col, Space } from 'antd';
import { FiFilter } from 'react-icons/fi';
import { useLanguage } from '../../../../hooks/useLanguage';
import './DashboardComponents.css';

const { Text, Title } = Typography;

export const PipelineFunnelCard = ({ stages = [], loading }) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <Card title={t('dashboard.funnelTitle')} className="dashboard-section-card">
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  // Calculate max count for relative percentage bars safely without modifying data
  const maxCount = stages.length > 0 ? Math.max(...stages.map((s) => s.count || 0), 1) : 1;

  return (
    <Card
      title={
        <Space align="center">
          <FiFilter style={{ color: 'var(--brand-teal)' }} />
          <span>{t('dashboard.funnelTitle')}</span>
        </Space>
      }
      extra={<Text type="secondary" style={{ fontSize: '0.75rem' }}>{t('dashboard.funnelSub')}</Text>}
      className="dashboard-section-card"
    >
      {stages.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('dashboard.noFunnelData')}
          style={{ margin: '24px 0' }}
        />
      ) : (
        <div className="funnel-container" role="region" aria-label="Hiring Pipeline Stages">
          {stages.map((stage) => {
            const percent = Math.round(((stage.count || 0) / maxCount) * 100);
            return (
              <div key={stage.stageId || stage.stageName} className="funnel-stage-row">
                <Row align="middle" gutter={[12, 8]}>
                  <Col xs={12} sm={8} md={6}>
                    <Text strong style={{ color: 'var(--text-main)', fontSize: '0.875rem' }}>
                      {stage.stageName}
                    </Text>
                  </Col>
                  <Col xs={8} sm={12} md={15}>
                    <Progress
                      percent={percent}
                      showInfo={false}
                      strokeColor="var(--brand-teal)"
                      trailColor="var(--border-subtle)"
                    />
                  </Col>
                  <Col xs={4} sm={4} md={3} style={{ textAlign: 'right' }}>
                    <Text strong style={{ color: 'var(--brand-navy-soft)', fontSize: '0.9375rem' }}>
                      {stage.count}
                    </Text>
                  </Col>
                </Row>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default PipelineFunnelCard;
