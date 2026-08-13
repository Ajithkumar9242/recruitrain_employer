import React from 'react';
import { Typography, Row, Col, Space } from 'antd';
import { useResponsive } from '../../hooks/useResponsive';

const { Title, Paragraph } = Typography;

export const PageHeader = ({ title, description, subtitle, actions, extra, style = {} }) => {
  const { isMobile } = useResponsive();
  const displayDescription = description || subtitle;
  const displayActions = actions || extra;

  return (
    <div
      style={{
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: '1px solid var(--border-subtle)',
        ...style,
      }}
    >
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col xs={24} md={displayActions ? 16 : 24}>
          <Title level={2} style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>
            {title}
          </Title>
          {displayDescription && (
            <Paragraph
              type="secondary"
              style={{ marginTop: 4, marginBottom: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}
            >
              {displayDescription}
            </Paragraph>
          )}
        </Col>
        {displayActions && (
          <Col xs={24} md={8} style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <Space wrap align="center">
              {displayActions}
            </Space>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default PageHeader;
