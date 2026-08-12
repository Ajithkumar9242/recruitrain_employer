import React, { useState } from 'react';
import { Card, Tag, Button, Space, Typography, Row, Col, Alert, Divider } from 'antd';
import {
  CheckCircleFilled,
  SafetyCertificateOutlined,
  GlobalOutlined,
  BgColorsOutlined,
  ApiOutlined,
  MobileOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useResponsive } from '../../hooks/useResponsive';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import ThemeToggle from '../common/ThemeToggle';
import LanguageToggle from '../common/LanguageToggle';
import { normalizeApiError, ERROR_CODES } from '../../services/errorNormalizer';

const { Title, Text, Paragraph } = Typography;

export const FoundationDemo = () => {
  const { isDarkMode, themePreference } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const responsive = useResponsive();
  const prefersReducedMotion = usePrefersReducedMotion();
  const reduxState = useSelector((state) => state);

  const [simulatedError, setSimulatedError] = useState(null);

  const handleSimulateError = (statusCode) => {
    let mockError = {};
    if (statusCode === 'NETWORK') {
      mockError = { message: 'Network Error' };
    } else if (statusCode === 'TIMEOUT') {
      mockError = { code: 'ECONNABORTED', message: 'timeout of 15000ms exceeded' };
    } else {
      mockError = {
        response: {
          status: statusCode,
          data: {
            message: `Sample backend response for status ${statusCode}`,
            error: `API_ERROR_${statusCode}`,
          },
        },
      };
    }
    const normalized = normalizeApiError(mockError);
    setSimulatedError(normalized);
  };

  return (
    <div style={{ padding: responsive.isMobile ? '16px' : '32px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Bar Header */}
      <Card
        style={{
          marginBottom: '24px',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Space align="center" size="middle">
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 8,
                  backgroundColor: 'var(--brand-navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 20,
                  fontFamily: 'var(--font-family-heading)',
                }}
              >
                RT
              </div>
              <div>
                <Title level={3} style={{ margin: 0, fontSize: '1.25rem' }}>
                  {t('app.title')}
                </Title>
                <Text type="secondary" style={{ fontSize: '0.875rem' }}>
                  {t('app.tagline')}
                </Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={10} style={{ textAlign: responsive.isMobile ? 'left' : 'right' }}>
            <Space size="middle" wrap>
              <LanguageToggle />
              <ThemeToggle />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Status Banner */}
      <Alert
        title={
          <Space>
            <CheckCircleFilled style={{ color: '#10B981', fontSize: '18px' }} />
            <Text strong style={{ color: 'var(--text-main)' }}>
              {t('app.phase1Status')}
            </Text>
          </Space>
        }
        description="Clean, unpolluted frontend foundation ready for Phase 2. No business data invented."
        type="success"
        showIcon={false}
        style={{
          marginBottom: '24px',
          backgroundColor: 'var(--color-accent-bg)',
          borderColor: 'var(--color-accent)',
        }}
      />

      <Row gutter={[24, 24]}>
        {/* Core Architecture Matrix */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined style={{ color: 'var(--brand-teal)' }} />
                <span>Architecture Components</span>
              </Space>
            }
            style={{ height: '100%', borderColor: 'var(--border-color)' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Row justify="space-between" align="middle">
                <Text>UI Framework</Text>
                <Tag color="blue">React 18 + Vite</Tag>
              </Row>
              <Divider style={{ margin: '8px 0' }} />
              <Row justify="space-between" align="middle">
                <Text>Component Library</Text>
                <Tag color="cyan">Ant Design 5.x</Tag>
              </Row>
              <Divider style={{ margin: '8px 0' }} />
              <Row justify="space-between" align="middle">
                <Text>State Management</Text>
                <Tag color="purple">Redux Toolkit + Redux Persist</Tag>
              </Row>
              <Divider style={{ margin: '8px 0' }} />
              <Row justify="space-between" align="middle">
                <Text>HTTP Client</Text>
                <Tag color="geekblue">Axios + Error Normalizer</Tag>
              </Row>
              <Divider style={{ margin: '8px 0' }} />
              <Row justify="space-between" align="middle">
                <Text>Localization (i18n)</Text>
                <Tag color="green">i18next (EN / DE)</Tag>
              </Row>
              <Divider style={{ margin: '8px 0' }} />
              <Row justify="space-between" align="middle">
                <Text>Validation & Forms</Text>
                <Tag color="gold">React Hook Form + Zod</Tag>
              </Row>
            </Space>
          </Card>
        </Col>

        {/* Brand Tokens Inspector */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BgColorsOutlined style={{ color: 'var(--brand-teal)' }} />
                <span>{t('foundation.tokensSection')}</span>
              </Space>
            }
            style={{ height: '100%', borderColor: 'var(--border-color)' }}
          >
            <Paragraph type="secondary" style={{ fontSize: '0.875rem' }}>
              Centralized CSS design tokens consumed dynamically across components.
            </Paragraph>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--brand-navy)',
                    color: '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 600, display: 'block' }}>Primary Navy</Text>
                  <Text style={{ color: '#94A3B8', fontSize: '11px' }}>#16313F (--navy)</Text>
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--brand-navy-soft)',
                    color: '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 600, display: 'block' }}>Navy Soft</Text>
                  <Text style={{ color: '#CBD5E1', fontSize: '11px' }}>#1B4965 (--navy-soft)</Text>
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--brand-teal)',
                    color: '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 600, display: 'block' }}>Accent Teal</Text>
                  <Text style={{ color: '#EAF5F8', fontSize: '11px' }}>#4FA8C0 (--teal)</Text>
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--brand-amber)',
                    color: '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 600, display: 'block' }}>Warning Amber</Text>
                  <Text style={{ color: '#FCEFE0', fontSize: '11px' }}>#E8943C (--amber)</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Responsive & Accessibility Detector */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <MobileOutlined style={{ color: 'var(--brand-teal)' }} />
                <span>Responsive & Accessibility System</span>
              </Space>
            }
            style={{ borderColor: 'var(--border-color)' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row justify="space-between" align="middle">
                <Text>Viewport Breakpoint:</Text>
                <Tag color="orange" style={{ fontWeight: 600 }}>
                  {responsive.breakpoint.toUpperCase()} ({responsive.width}px × {responsive.height}px)
                </Tag>
              </Row>
              <Row justify="space-between" align="middle">
                <Text>Layout View:</Text>
                <Text strong>
                  {responsive.isMobile ? 'Mobile' : responsive.isTablet ? 'Tablet' : 'Desktop'}
                </Text>
              </Row>
              <Row justify="space-between" align="middle">
                <Text>{t('foundation.reducedMotion')}:</Text>
                <Tag color={prefersReducedMotion ? 'volcano' : 'green'}>
                  {prefersReducedMotion ? 'Enabled' : 'Standard Animations'}
                </Tag>
              </Row>
            </Space>
          </Card>
        </Col>

        {/* API Error Normalizer Testing Component */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ApiOutlined style={{ color: 'var(--brand-teal)' }} />
                <span>API Error Normalizer Simulator</span>
              </Space>
            }
            style={{ borderColor: 'var(--border-color)' }}
          >
            <Paragraph type="secondary" style={{ fontSize: '0.875rem', marginBottom: 12 }}>
              Tests backend response transformation. Guarantees user-safe error messages.
            </Paragraph>
            <Space wrap style={{ marginBottom: 16 }}>
              <Button size="small" onClick={() => handleSimulateError(400)}>
                Simulate 400
              </Button>
              <Button size="small" onClick={() => handleSimulateError(401)}>
                Simulate 401
              </Button>
              <Button size="small" onClick={() => handleSimulateError(403)}>
                Simulate 403
              </Button>
              <Button size="small" onClick={() => handleSimulateError(404)}>
                Simulate 404
              </Button>
              <Button size="small" onClick={() => handleSimulateError(429)}>
                Simulate 429
              </Button>
              <Button size="small" danger onClick={() => handleSimulateError(500)}>
                Simulate 500
              </Button>
              <Button size="small" onClick={() => handleSimulateError('NETWORK')}>
                Network Err
              </Button>
            </Space>

            {simulatedError && (
              <Alert
                title={`Normalized Code: ${simulatedError.code} (Status ${simulatedError.status})`}
                description={simulatedError.message}
                type={simulatedError.status >= 500 ? 'error' : 'warning'}
                showIcon
              />
            )}
          </Card>
        </Col>

        {/* Redux State Verification */}
        <Col span={24}>
          <Card
            title="Redux Store Inspection (Persisted UI & Language Slices)"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <pre
              style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '16px',
                borderRadius: '6px',
                color: 'var(--text-main)',
                fontSize: '12px',
                overflowX: 'auto',
                margin: 0,
                border: '1px solid var(--border-color)',
              }}
            >
              {JSON.stringify(
                {
                  ui: reduxState.ui,
                  language: reduxState.language,
                  auth: {
                    isAuthenticated: reduxState.auth.isAuthenticated,
                    user: reduxState.auth.user,
                  },
                },
                null,
                2
              )}
            </pre>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FoundationDemo;
