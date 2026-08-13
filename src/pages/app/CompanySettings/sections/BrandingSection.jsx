import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, Typography, Spin } from 'antd';
import { FiDroplet, FiSave, FiEye } from 'react-icons/fi';
import { useLanguage } from '../../../../hooks/useLanguage';

const { Title, Text } = Typography;

export const BrandingSection = ({
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
        primary_color: settings.primary_color || '#1890ff',
        secondary_color: settings.secondary_color || '#0f172a',
      });
    }
  }, [settings, form]);

  const primaryColor = Form.useWatch('primary_color', form) || settings?.primary_color || '#1890ff';
  const secondaryColor = Form.useWatch('secondary_color', form) || settings?.secondary_color || '#0f172a';

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
              <FiDroplet style={{ color: 'var(--brand-teal, #1890ff)' }} />
              {t('companySettings.branding.title', 'Branding & Theme Customization')}
            </Title>
            <Text type="secondary">
              {t('companySettings.branding.subtitle', 'Customize brand colors used across job boards, notifications, and candidate portals.')}
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

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title={t('companySettings.branding.colorPalette', 'Brand Colors')} style={{ borderRadius: '8px', height: '100%' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item name="primary_color" label={t('companySettings.branding.primaryColor', 'Primary Accent Color')}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Input type="color" style={{ width: '45px', height: '38px', padding: '2px', cursor: 'pointer' }} />
                    <Input placeholder="#1890ff" />
                  </div>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item name="secondary_color" label={t('companySettings.branding.secondaryColor', 'Secondary Theme Color')}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Input type="color" style={{ width: '45px', height: '38px', padding: '2px', cursor: 'pointer' }} />
                    <Input placeholder="#0f172a" />
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiEye /> {t('companySettings.branding.livePreview', 'Theme Live Preview')}</span>} style={{ borderRadius: '8px', height: '100%' }}>
            <div
              style={{
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e8e8e8',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#8c8c8c', marginBottom: '8px' }}>
                BUTTON & ACCENT PREVIEW
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <Button style={{ backgroundColor: primaryColor, borderColor: primaryColor, color: '#fff' }}>
                  Primary Action
                </Button>
                <Button style={{ backgroundColor: secondaryColor, borderColor: secondaryColor, color: '#fff' }}>
                  Secondary Action
                </Button>
              </div>
              <div
                style={{
                  height: '4px',
                  borderRadius: '2px',
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

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

export default BrandingSection;
