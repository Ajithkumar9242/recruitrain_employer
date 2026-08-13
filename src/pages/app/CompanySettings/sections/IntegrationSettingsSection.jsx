import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Switch, Button, Card, Row, Col, Typography, Spin, Alert, Tag, Divider } from 'antd';
import { FiCpu, FiMail, FiCalendar, FiLink, FiCheckCircle, FiSave, FiAlertTriangle, FiLock } from 'react-icons/fi';
import { useLanguage } from '../../../../hooks/useLanguage';

const { Title, Text } = Typography;

export const IntegrationSettingsSection = ({
  settings,
  loading,
  saving,
  permissionError,
  onUpdateSettings,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        smtp_host: settings.smtp_host || '',
        smtp_port: settings.smtp_port ?? 587,
        smtp_username: settings.smtp_username || '',
        smtp_use_tls: settings.smtp_use_tls ?? true,
        smtp_password: '', // Kept empty; optional replacement
        google_calendar_enabled: settings.google_calendar_enabled ?? false,
        google_calendar_client_id: settings.google_calendar_client_id || '',
        google_calendar_client_secret: '', // Kept empty; optional replacement
        webhook_urls: Array.isArray(settings.webhook_urls) ? settings.webhook_urls.join(', ') : settings.webhook_urls || '',
      });
    }
  }, [settings, form]);

  const handleFinish = (values) => {
    const payload = { ...values };
    // Only send password/secret fields if user typed a new value
    if (!payload.smtp_password) {
      delete payload.smtp_password;
    }
    if (!payload.google_calendar_client_secret) {
      delete payload.google_calendar_client_secret;
    }
    // Parse webhook URLs comma-separated list into array if string
    if (typeof payload.webhook_urls === 'string') {
      payload.webhook_urls = payload.webhook_urls
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    onUpdateSettings(payload);
  };

  if (loading && !settings) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const isSmtpConfigured = settings?.smtp_password_configured || settings?.smtp_configured;
  const isGoogleSecretConfigured = settings?.google_calendar_client_secret_configured;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading || saving || !!permissionError}
    >
      <Card size="small" style={{ marginBottom: '24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCpu style={{ color: 'var(--brand-teal, #1890ff)' }} />
              {t('companySettings.integration.title', 'Third-Party Integrations & SMTP')}
            </Title>
            <Text type="secondary">
              {t('companySettings.integration.subtitle', 'Configure enterprise email relay (SMTP), calendar synchronization, and webhooks.')}
            </Text>
          </div>
          {!permissionError && (
            <Button
              type="primary"
              icon={<FiSave />}
              htmlType="submit"
              loading={saving}
              style={{ backgroundColor: 'var(--brand-navy, #0f172a)' }}
            >
              {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Integrations')}
            </Button>
          )}
        </div>
      </Card>

      {permissionError && (
        <Alert
          type="warning"
          showIcon
          icon={<FiAlertTriangle />}
          message={t('companySettings.integration.permissionTitle', 'Administrator Role Required')}
          description={permissionError || t('companySettings.integration.permissionSub', 'Managing integration settings and secrets requires Administrator permissions.')}
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* SMTP Email Relay Card */}
      <Card
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiMail /> {t('companySettings.integration.smtpSection', 'SMTP Email Relay Configuration')}
          </span>
        }
        style={{ marginBottom: '24px', borderRadius: '8px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="smtp_host" label={t('companySettings.integration.smtpHost', 'SMTP Host Server')}>
              <Input placeholder="smtp.sendgrid.net" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Form.Item name="smtp_port" label={t('companySettings.integration.smtpPort', 'Port')}>
              <InputNumber min={1} max={65535} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item name="smtp_username" label={t('companySettings.integration.smtpUsername', 'SMTP Username')}>
              <Input placeholder="apikey@sendgrid.net" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="smtp_password"
              label={
                <span>
                  {t('companySettings.integration.smtpPassword', 'SMTP Password / Secret')}{' '}
                  {isSmtpConfigured && <Tag color="success" icon={<FiCheckCircle />}>Configured</Tag>}
                </span>
              }
              extra={t('companySettings.integration.secretMaskHint', 'Leave empty to preserve existing configured secret')}
            >
              <Input.Password placeholder={isSmtpConfigured ? '••••••••••••••••' : 'Enter new password'} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item name="smtp_use_tls" valuePropName="checked" label={t('companySettings.integration.useTLS', 'Enable TLS / SSL Security')}>
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Calendar Integrations Card */}
      <Card
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiCalendar /> {t('companySettings.integration.calendarSection', 'Google Calendar Integration')}
          </span>
        }
        style={{ marginBottom: '24px', borderRadius: '8px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="google_calendar_enabled" valuePropName="checked" label={t('companySettings.integration.enableGCal', 'Enable Google Calendar Sync')}>
              <Switch />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={9}>
            <Form.Item name="google_calendar_client_id" label={t('companySettings.integration.gcalClientId', 'Google OAuth Client ID')}>
              <Input placeholder="123456789-abc...apps.googleusercontent.com" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={9}>
            <Form.Item
              name="google_calendar_client_secret"
              label={
                <span>
                  {t('companySettings.integration.gcalClientSecret', 'Google OAuth Client Secret')}{' '}
                  {isGoogleSecretConfigured && <Tag color="success" icon={<FiCheckCircle />}>Configured</Tag>}
                </span>
              }
            >
              <Input.Password placeholder={isGoogleSecretConfigured ? '••••••••••••••••' : 'Enter new secret'} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Webhooks & APIs */}
      <Card
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiLink /> {t('companySettings.integration.webhooksSection', 'Webhooks & Event Dispatches')}
          </span>
        }
        style={{ marginBottom: '24px', borderRadius: '8px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item
              name="webhook_urls"
              label={t('companySettings.integration.webhookUrls', 'Active Webhook Destination Endpoints')}
              extra={t('companySettings.integration.webhookHint', 'Comma-separated URLs e.g. https://hooks.example.com/ats, https://api.partner.com/events')}
            >
              <Input placeholder="https://hooks.example.com/ats" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {!permissionError && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Button
            type="primary"
            icon={<FiSave />}
            htmlType="submit"
            loading={saving}
            size="large"
            style={{ backgroundColor: 'var(--brand-navy, #0f172a)', padding: '0 32px' }}
          >
            {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Integrations')}
          </Button>
        </div>
      )}
    </Form>
  );
};

export default IntegrationSettingsSection;
