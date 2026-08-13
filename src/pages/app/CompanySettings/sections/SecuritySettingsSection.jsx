import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Switch, Button, Card, Row, Col, Typography, Spin, Alert } from 'antd';
import { FiShield, FiLock, FiAlertTriangle, FiSave } from 'react-icons/fi';
import { useLanguage } from '../../../../hooks/useLanguage';

const { Title, Text } = Typography;

export const SecuritySettingsSection = ({
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
        session_timeout_minutes: settings.session_timeout_minutes ?? 240,
        password_min_length: settings.password_min_length ?? 10,
        password_require_uppercase: settings.password_require_uppercase ?? true,
        password_require_number: settings.password_require_number ?? true,
        password_require_special: settings.password_require_special ?? false,
        enable_two_factor_auth: settings.enable_two_factor_auth ?? false,
        enable_login_alerts: settings.enable_login_alerts ?? true,
        allowed_domains: settings.allowed_domains || '',
      });
    }
  }, [settings, form]);

  const handleFinish = (values) => {
    onUpdateSettings(values);
  };

  if (loading && !settings) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

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
              <FiShield style={{ color: 'var(--brand-teal, #1890ff)' }} />
              {t('companySettings.security.title', 'Security & Access Settings')}
            </Title>
            <Text type="secondary">
              {t('companySettings.security.subtitle', 'Configure password policy, session timeout, 2FA enforcement, and domain controls.')}
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
              {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Security Settings')}
            </Button>
          )}
        </div>
      </Card>

      {permissionError && (
        <Alert
          type="warning"
          showIcon
          icon={<FiAlertTriangle />}
          message={t('companySettings.security.permissionTitle', 'Administrator Authorization Required')}
          description={permissionError || t('companySettings.security.permissionSub', 'Modifying security settings requires the Administrator role. Values are rendered in read-only mode.')}
          style={{ marginBottom: '24px' }}
        />
      )}

      <Card style={{ borderRadius: '8px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="session_timeout_minutes"
              label={t('companySettings.security.sessionTimeout', 'Session Inactivity Timeout (Minutes)')}
            >
              <InputNumber min={15} max={1440} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="password_min_length"
              label={t('companySettings.security.passwordMinLength', 'Minimum Password Length')}
            >
              <InputNumber min={8} max={64} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="allowed_domains"
              label={t('companySettings.security.allowedDomains', 'Allowed Corporate Email Domains')}
              extra={t('companySettings.security.allowedDomainsHint', 'Comma-separated e.g. company.com, company.de')}
            >
              <Input placeholder="company.com, company.de" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="password_require_uppercase"
              valuePropName="checked"
              label={t('companySettings.security.reqUppercase', 'Require Uppercase Letter')}
            >
              <Switch />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="password_require_number"
              valuePropName="checked"
              label={t('companySettings.security.reqNumber', 'Require Number')}
            >
              <Switch />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="password_require_special"
              valuePropName="checked"
              label={t('companySettings.security.reqSpecial', 'Require Special Character')}
            >
              <Switch />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="enable_two_factor_auth"
              valuePropName="checked"
              label={t('companySettings.security.enable2FA', 'Enforce 2FA for All Users')}
            >
              <Switch />
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
            {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Security Settings')}
          </Button>
        </div>
      )}
    </Form>
  );
};

export default SecuritySettingsSection;
