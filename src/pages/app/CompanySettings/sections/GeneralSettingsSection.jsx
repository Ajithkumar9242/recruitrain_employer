import React, { useEffect } from 'react';
import { Form, Select, Button, Card, Row, Col, Typography, Spin } from 'antd';
import { FiGlobe, FiClock, FiDollarSign, FiCalendar, FiSun, FiSave } from 'react-icons/fi';
import { useLanguage } from '../../../../hooks/useLanguage';

const { Title, Text } = Typography;
const { Option } = Select;

// Backend-Supported Timezone Options (from SettingsValidator)
const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
  { value: 'Europe/Zurich', label: 'Europe/Zurich (CET/CEST)' },
  { value: 'Europe/Amsterdam', label: 'Europe/Amsterdam (CET/CEST)' },
  { value: 'Europe/Brussels', label: 'Europe/Brussels (CET/CEST)' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid (CET/CEST)' },
  { value: 'Europe/Rome', label: 'Europe/Rome (CET/CEST)' },
  { value: 'Europe/Stockholm', label: 'Europe/Stockholm (CET/CEST)' },
  { value: 'Europe/Warsaw', label: 'Europe/Warsaw (CET/CEST)' },
  { value: 'Europe/Vienna', label: 'Europe/Vienna (CET/CEST)' },
  { value: 'Europe/Prague', label: 'Europe/Prague (CET/CEST)' },
  { value: 'Europe/Helsinki', label: 'Europe/Helsinki (EET/EEST)' },
  { value: 'Europe/Istanbul', label: 'Europe/Istanbul (TRT)' },
  { value: 'Europe/Moscow', label: 'Europe/Moscow (MSK)' },
  { value: 'Europe/Lisbon', label: 'Europe/Lisbon (WET/WEST)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
  { value: 'America/Toronto', label: 'America/Toronto (EST/EDT)' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (BRT)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (ICT)' },
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta (WIB)' },
  { value: 'Asia/Kuala_Lumpur', label: 'Asia/Kuala_Lumpur (MYT)' },
  { value: 'Asia/Manila', label: 'Asia/Manila (PST)' },
  { value: 'Asia/Seoul', label: 'Asia/Seoul (KST)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
  { value: 'Asia/Taipei', label: 'Asia/Taipei (CST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT)' },
  { value: 'Asia/Colombo', label: 'Asia/Colombo (SLST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
  { value: 'Australia/Melbourne', label: 'Australia/Melbourne (AEST/AEDT)' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST/NZDT)' },
  { value: 'Pacific/Honolulu', label: 'Pacific/Honolulu (HST)' },
  { value: 'Africa/Nairobi', label: 'Africa/Nairobi (EAT)' },
];

// Backend-Supported Language Options
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English (US/UK)' },
  { value: 'de', label: 'Deutsch (German)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'it', label: 'Italiano (Italian)' },
  { value: 'nl', label: 'Nederlands (Dutch)' },
  { value: 'pt', label: 'Português (Portuguese)' },
  { value: 'pl', label: 'Polski (Polish)' },
  { value: 'cs', label: 'Čeština (Czech)' },
  { value: 'ro', label: 'Română (Romanian)' },
  { value: 'hu', label: 'Magyar (Hungarian)' },
  { value: 'ar', label: 'العربية (Arabic)' },
  { value: 'zh', label: '中文 (Chinese)' },
  { value: 'ja', label: '日本語 (Japanese)' },
  { value: 'ko', label: '한국어 (Korean)' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'tr', label: 'Türkçe (Turkish)' },
  { value: 'ru', label: 'Русский (Russian)' },
  { value: 'uk', label: 'Українська (Ukrainian)' },
  { value: 'vi', label: 'Tiếng Việt (Vietnamese)' },
];

// Backend-Supported Currency Options
const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CHF', label: 'CHF (Fr)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'AED', label: 'AED (د.إ)' },
  { value: 'SGD', label: 'SGD ($)' },
  { value: 'MYR', label: 'MYR (RM)' },
  { value: 'THB', label: 'THB (฿)' },
  { value: 'PHP', label: 'PHP (₱)' },
  { value: 'IDR', label: 'IDR (Rp)' },
  { value: 'BRL', label: 'BRL (R$)' },
  { value: 'NZD', label: 'NZD ($)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CNY', label: 'CNY (¥)' },
  { value: 'KRW', label: 'KRW (₩)' },
  { value: 'TRY', label: 'TRY (₺)' },
  { value: 'RUB', label: 'RUB (₽)' },
  { value: 'ZAR', label: 'ZAR (R)' },
  { value: 'SEK', label: 'SEK (kr)' },
  { value: 'NOK', label: 'NOK (kr)' },
  { value: 'DKK', label: 'DKK (kr)' },
  { value: 'PLN', label: 'PLN (zł)' },
  { value: 'CZK', label: 'CZK (Kč)' },
  { value: 'HUF', label: 'HUF (Ft)' },
  { value: 'RON', label: 'RON (lei)' },
];

// Backend-Supported Date Format Options
const DATE_FORMAT_OPTIONS = [
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-08-14)' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (14.08.2026)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (08/14/2026)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (14/08/2026)' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (14-08-2026)' },
  { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY (08-14-2026)' },
];

// Backend-Supported Theme Options
const THEME_OPTIONS = [
  { value: 'light', label: 'Light Mode' },
  { value: 'dark', label: 'Dark Mode' },
  { value: 'system', label: 'System Default' },
];

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
        theme: settings.theme || 'light',
      });
    }
  }, [settings, form]);

  const handleFinish = (values) => {
    // Sanitize payload to strip undefined/null values for partial update safety
    const sanitized = {};
    Object.keys(values).forEach((key) => {
      if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
        sanitized[key] = values[key];
      }
    });
    onUpdateSettings(sanitized);
  };

  if (loading && !settings) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" tip={t('common.loading', 'Loading General Settings...')} />
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
          {/* System Timezone */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="timezone"
              label={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FiClock style={{ color: '#1890ff' }} />
                  {t('companySettings.general.timezone', 'System Timezone')}
                </span>
              }
              rules={[{ required: true, message: 'Please select a system timezone' }]}
            >
              <Select
                showSearch
                placeholder="Select timezone"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {TIMEZONE_OPTIONS.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Default Portal Language */}
          {/* <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="language"
              label={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FiGlobe style={{ color: '#52c41a' }} />
                  {t('companySettings.general.language', 'Default Portal Language')}
                </span>
              }
              rules={[{ required: true, message: 'Please select default language' }]}
            >
              <Select
                showSearch
                placeholder="Select default language"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col> */}

          {/* Default Currency */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="currency"
              label={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FiDollarSign style={{ color: '#faad14' }} />
                  {t('companySettings.general.currency', 'Default Currency')}
                </span>
              }
              rules={[{ required: true, message: 'Please select default currency' }]}
            >
              <Select
                showSearch
                placeholder="Select default currency"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Date Display Format */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="date_format"
              label={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FiCalendar style={{ color: '#722ed1' }} />
                  {t('companySettings.general.dateFormat', 'Date Display Format')}
                </span>
              }
              rules={[{ required: true, message: 'Please select date format' }]}
            >
              <Select placeholder="Select date format">
                {DATE_FORMAT_OPTIONS.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Portal Theme Preference */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="theme"
              label={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FiSun style={{ color: '#eb2f96' }} />
                  {t('companySettings.general.theme', 'Portal Theme Preference')}
                </span>
              }
              rules={[{ required: true, message: 'Please select theme preference' }]}
            >
              <Select placeholder="Select theme">
                {THEME_OPTIONS.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
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
