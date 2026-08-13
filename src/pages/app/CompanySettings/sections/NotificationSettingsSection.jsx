import React, { useEffect } from 'react';
import { Form, Switch, Button, Card, Row, Col, Typography, Spin, Divider } from 'antd';
import { FiBell, FiMail, FiSave } from 'react-icons/fi';
import { useLanguage } from '../../../../hooks/useLanguage';

const { Title, Text } = Typography;

export const NotificationSettingsSection = ({
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
        new_application_email: settings.new_application_email ?? true,
        new_application_inapp: settings.new_application_inapp ?? true,
        interview_reminder_email: settings.interview_reminder_email ?? true,
        interview_reminder_inapp: settings.interview_reminder_inapp ?? true,
        offer_response_email: settings.offer_response_email ?? true,
        offer_response_inapp: settings.offer_response_inapp ?? true,
        weekly_digest_email: settings.weekly_digest_email ?? false,
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
              <FiBell style={{ color: 'var(--brand-teal, #1890ff)' }} />
              {t('companySettings.notifications.title', 'User Notification Preferences')}
            </Title>
            <Text type="secondary">
              {t('companySettings.notifications.subtitle', 'Configure individual notification dispatch rules for applications, interviews, and offers.')}
            </Text>
          </div>
          <Button
            type="primary"
            icon={<FiSave />}
            htmlType="submit"
            loading={saving}
            style={{ backgroundColor: 'var(--brand-navy, #0f172a)' }}
          >
            {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Preferences')}
          </Button>
        </div>
      </Card>

      <Card style={{ borderRadius: '8px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Title level={5}>{t('companySettings.notifications.applicationSection', 'Job Applications Alerts')}</Title>
            <Divider style={{ margin: '12px 0 20px 0' }} />
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="new_application_email" valuePropName="checked" label={t('companySettings.notifications.newAppEmail', 'Email alert when candidate applies')}>
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="new_application_inapp" valuePropName="checked" label={t('companySettings.notifications.newAppInapp', 'In-app banner notification for new applications')}>
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          <Col xs={24}>
            <Title level={5}>{t('companySettings.notifications.interviewSection', 'Interview Scheduling Alerts')}</Title>
            <Divider style={{ margin: '12px 0 20px 0' }} />
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="interview_reminder_email" valuePropName="checked" label={t('companySettings.notifications.interviewEmail', 'Email reminders for upcoming scheduled interviews')}>
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="interview_reminder_inapp" valuePropName="checked" label={t('companySettings.notifications.interviewInapp', 'In-app notification for interview updates')}>
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          <Col xs={24}>
            <Title level={5}>{t('companySettings.notifications.offerSection', 'Offer Management Alerts')}</Title>
            <Divider style={{ margin: '12px 0 20px 0' }} />
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="offer_response_email" valuePropName="checked" label={t('companySettings.notifications.offerEmail', 'Email notification when candidate responds to offer')}>
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="offer_response_inapp" valuePropName="checked" label={t('companySettings.notifications.offerInapp', 'In-app alert for offer acceptances or rejections')}>
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
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
          {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Preferences')}
        </Button>
      </div>
    </Form>
  );
};

export default NotificationSettingsSection;
