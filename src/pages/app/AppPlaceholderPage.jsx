import React from 'react';
import { Card, Button, Typography, Space, Tag, Alert, Row, Col } from 'antd';
import { LogoutOutlined, CheckCircleFilled, UserOutlined, BankOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import ThemeToggle from '../../components/common/ThemeToggle';
import LanguageToggle from '../../components/common/LanguageToggle';

const { Title, Text, Paragraph } = Typography;

export const AppPlaceholderPage = () => {
  const { user, logout, isLoggingOut } = useAuth();
  const { t } = useLanguage();

  return (
    <div style={{ padding: '32px 16px', maxWidth: '960px', margin: '0 auto' }}>
      {/* Top Header Bar */}
      <Card style={{ marginBottom: 24, borderColor: 'var(--border-color)' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={14}>
            <Space align="center" size="middle">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: 'var(--brand-navy)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 18,
                  fontFamily: 'var(--font-family-heading)',
                }}
              >
                RT
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  RecruitTrain ATS
                </Title>
                <Text type="secondary" style={{ fontSize: '0.8125rem' }}>
                  Authenticated Session Area
                </Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} sm={10} style={{ textAlign: 'right' }}>
            <Space wrap align="center">
              <LanguageToggle size="small" />
              <ThemeToggle size="small" />
              <Button
                type="default"
                danger
                icon={<LogoutOutlined />}
                loading={isLoggingOut}
                onClick={logout}
              >
                {isLoggingOut ? t('auth.loggingOut') : t('auth.logout')}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Success Notification Banner */}
      <Alert
        title={
          <Space align="center">
            <CheckCircleFilled style={{ color: '#10B981', fontSize: 20 }} />
            <Text strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>
              {t('auth.sessionActive')}
            </Text>
          </Space>
        }
        description={t('auth.placeholderNotice')}
        type="success"
        showIcon={false}
        style={{
          marginBottom: 24,
          backgroundColor: 'var(--color-accent-bg)',
          borderColor: 'var(--color-accent)',
        }}
      />

      {/* Authenticated Employer User Card */}
      <Card
        title={
          <Space>
            <UserOutlined style={{ color: 'var(--brand-teal)' }} />
            <span>Authenticated User Context (Backend Authoritative)</span>
          </Space>
        }
        style={{ borderColor: 'var(--border-color)' }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Text type="secondary" style={{ fontSize: '0.8125rem', display: 'block', marginBottom: 4 }}>
              {t('auth.authenticatedAs')}
            </Text>
            <Text strong style={{ fontSize: '1.125rem', color: 'var(--text-main)' }}>
              {user?.fullName || user?.name || user?.email || 'Authenticated User'}
            </Text>
            {user?.email && (
              <Paragraph type="secondary" style={{ margin: 0, fontSize: '0.875rem' }}>
                {user.email}
              </Paragraph>
            )}
          </Col>

          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Space>
                  <BankOutlined style={{ color: 'var(--brand-navy)' }} />
                  <Text type="secondary">{t('auth.companyContext')}:</Text>
                  <Text strong>{user?.companyName || user?.company || 'N/A'}</Text>
                </Space>
              </div>

              <div>
                <Space>
                  <SafetyOutlined style={{ color: 'var(--brand-amber)' }} />
                  <Text type="secondary">{t('auth.roleContext')}:</Text>
                  <Tag color="blue">{user?.role || user?.roles?.[0] || 'Employer User'}</Tag>
                </Space>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AppPlaceholderPage;
