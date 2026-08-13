import React, { useEffect } from 'react';
import { Form, Select, Button, Card, Row, Col, Typography, Spin } from 'antd';
import { FiGlobe, FiClock, FiDollarSign, FiCalendar, FiSun, FiSave } from 'react-icons/fi';
import { useLanguage } from '../../../../hooks/useLanguage';

const { Title, Text } = Typography;
const { Option } = Select;

export const GeneralSettingsSection = ({
  settings,
  loading,
  saving,
  onUpdateSettings,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        timezone: settings.timezone || 'UTC',
        language: settings.language || 'en',
        currency: settings.currency || 'USD',
        date_format: settings.date_format || 'YYYY-MM-DD',
        theme: settings.theme || 'system',
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
    <Form form={form} layout="vertical" onFinish={handleFinish} disabled={loading || saving}>
      <Card size="small" style={{ marginBottom: '24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiGlobe style={{ color: 'var(--brand-teal, #1890ff)' }} />
              {t('companySettings.general.title', 'General System Settings')}
            </Title>
            <Text type="secondary">
              {t('companySettings.general.subtitle', 'Configure default regional formats, timezone, currency, and portal theme preferences.')}
            </Text>
          </div>
          <Button
            type="primary"
            icon={<FiSave />}
            htmlType="submit"
            loading={saving}
            style={{ backgroundColor: 'var(--brand-navy, #0f172a)' }}
          >
            {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Changes')}
          </Button>
        </div>
      </Card>

      <Card style={{ borderRadius: '8px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="timezone" label={t('companySettings.general.timezone', 'System Timezone')}>
              <Select placeholder="Select timezone">
                <Option value="UTC">UTC (Coordinated Universal Time)</Option>
                <Option value="Europe/Berlin">Europe/Berlin (CET/CEST)</Option>
                <Option value="Europe/London">Europe/London (GMT/BST)</Option>
                <Option value="America/New_York">America/New_York (EST/EDT)</Option>
                <Option value="America/Chicago">America/Chicago (CST/CDT)</Option>
                <Option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</Option>
                <Option value="Asia/Dubai">Asia/Dubai (GST)</Option>
                <Option value="Asia/Singapore">Asia/Singapore (SGT)</Option>
                <Option value="Asia/Kolkata">Asia/Kolkata (IST)</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item name="language" label={t('companySettings.general.language', 'Default Portal Language')}>
              <Select placeholder="Select default language">
                <Option value="en">English (US/UK)</Option>
                <Option value="de">Deutsch (German)</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item name="currency" label={t('companySettings.general.currency', 'Default Currency')}>
              <Select placeholder="Select default currency">
                <Option value="USD">USD ($)</Option>
                <Option value="EUR">EUR (€)</Option>
                <Option value="GBP">GBP (£)</Option>
                <Option value="CHF">CHF (Fr)</Option>
                <Option value="CAD">CAD ($)</Option>
                <Option value="AUD">AUD ($)</Option>
                <Option value="INR">INR (₹)</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item name="date_format" label={t('companySettings.general.dateFormat', 'Date Display Format')}>
              <Select placeholder="Select date format">
                <Option value="YYYY-MM-DD">YYYY-MM-DD (2026-08-14)</Option>
                <Option value="DD.MM.YYYY">DD.MM.YYYY (14.08.2026)</Option>
                <Option value="MM/DD/YYYY">MM/DD/YYYY (08/14/2026)</Option>
                <Option value="DD/MM/YYYY">DD/MM/YYYY (14/08/2026)</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item name="theme" label={t('companySettings.general.theme', 'Portal Theme Preference')}>
              <Select placeholder="Select theme">
                <Option value="system">System Default</Option>
                <Option value="light">Light Mode</Option>
                <Option value="dark">Dark Mode</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <Button
          type="primary"
          icon={<FiSave />}
          htmlType="submit"
          loading={saving}
          size="large"
          style={{ backgroundColor: 'var(--brand-navy, #0f172a)', padding: '0 32px' }}
        >
          {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Changes')}
        </Button>
      </div>
    </Form>
  );
};

export default GeneralSettingsSection;
