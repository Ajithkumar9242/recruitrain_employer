import React from 'react';
import { Card, Skeleton, Typography, Space } from 'antd';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import './DashboardComponents.css';

const { Text, Title } = Typography;

export const KpiCard = ({ title, value, icon: Icon, iconColor, trend, loading }) => {
  if (loading) {
    return (
      <Card className="dashboard-kpi-card">
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
      </Card>
    );
  }

  const displayValue = value !== null && value !== undefined ? value : '--';

  return (
    <Card className="dashboard-kpi-card" borderless={false}>
      <div className="kpi-card-inner">
        <div className="kpi-card-content">
          <Text type="secondary" className="kpi-card-label">
            {title}
          </Text>
          <div className="kpi-card-value-row">
            <Title level={2} className="kpi-card-value">
              {displayValue}
            </Title>
            {/* Render trend ONLY if backend provides authoritative trend data */}
            {trend && typeof trend === 'object' && trend.value !== undefined && (
              <span className={`kpi-card-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                {trend.isPositive ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                <span>{trend.value}</span>
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className="kpi-card-icon-wrapper" style={{ backgroundColor: iconColor || 'var(--brand-teal-light)' }}>
            <Icon size={22} style={{ color: iconColor ? 'var(--brand-navy)' : 'var(--brand-teal)' }} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default KpiCard;
