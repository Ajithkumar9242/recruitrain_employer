import React from 'react';
import { Card, Skeleton, Typography, Tooltip } from 'antd';
import { FiInfo } from 'react-icons/fi';
import './AnalyticsComponents.css';

const { Text, Title } = Typography;

export const AnalyticsKpiCard = ({
  title,
  value,
  icon: Icon,
  loading = false,
  subtitle,
  tooltip,
  accentColor = 'var(--brand-teal)',
  className = '',
}) => {
  if (loading) {
    return (
      <Card className={`analytics-kpi-card ${className}`}>
        <Skeleton active paragraph={{ rows: 1 }} />
      </Card>
    );
  }

  const formattedValue =
    typeof value === 'number'
      ? value.toLocaleString()
      : value !== undefined && value !== null
      ? String(value)
      : '0';

  return (
    <Card
      className={`analytics-kpi-card ${className}`}
      bodyStyle={{ padding: '16px 20px' }}
      aria-label={`${title}: ${formattedValue}`}
    >
      <div className="analytics-kpi-header">
        <span className="analytics-kpi-title-wrap">
          <Text className="analytics-kpi-title">{title}</Text>
          {tooltip && (
            <Tooltip title={tooltip}>
              <FiInfo className="analytics-kpi-info-icon" size={14} />
            </Tooltip>
          )}
        </span>
        {Icon && (
          <div className="analytics-kpi-icon-wrap" style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`, color: accentColor }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="analytics-kpi-body">
        <Title level={2} className="analytics-kpi-value">
          {formattedValue}
        </Title>
        {subtitle && (
          <Text type="secondary" className="analytics-kpi-subtitle">
            {subtitle}
          </Text>
        )}
      </div>
    </Card>
  );
};

export default AnalyticsKpiCard;
