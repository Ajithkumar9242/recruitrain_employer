import React, { useEffect } from 'react';
import { Modal, Form, Switch, Select, Divider, Typography, Space, Button, message } from 'antd';
import { FiSliders, FiMail, FiBell } from 'react-icons/fi';
import { useLanguage } from '../../../hooks/useLanguage';

const { Text, Title } = Typography;
const { Option } = Select;

export const NotificationPreferencesModal = ({
  open = false,
  preferences = null,
  loading = false,
  saving = false,
  onClose,
  onSave,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (preferences && typeof preferences === 'object') {
        form.setFieldsValue({
          email_notifications: preferences.email_notifications ?? preferences.emailNotifications ?? true,
          in_app_notifications: preferences.in_app_notifications ?? preferences.inAppNotifications ?? true,
          interview_reminders: preferences.interview_reminders ?? preferences.interviewReminders ?? true,
          application_updates: preferences.application_updates ?? preferences.applicationUpdates ?? true,
          offer_alerts: preferences.offer_alerts ?? preferences.offerAlerts ?? true,
          digest_frequency: preferences.digest_frequency ?? preferences.digestFrequency ?? 'realtime',
        });
      } else {
        form.setFieldsValue({
          email_notifications: true,
          in_app_notifications: true,
          interview_reminders: true,
          application_updates: true,
          offer_alerts: true,
          digest_frequency: 'realtime',
        });
      }
    }
  }, [open, preferences, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values);
      onClose();
    } catch {
      // Form validation error
    }
  };

  return (
    <Modal
      title={
        <Space align="center">
          <FiSliders size={18} style={{ color: 'var(--brand-teal, #0ea5e9)' }} />
          <span>{t('notifications.preferencesTitle', 'Notification Preferences')}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t('notifications.cancel', 'Cancel')}
        </Button>,
        <Button key="save" type="primary" loading={saving} onClick={handleSubmit}>
          {t('notifications.savePreferences', 'Save Preferences')}
        </Button>,
      ]}
      width={540}
      aria-label={t('notifications.preferencesTitle', 'Notification Preferences')}
    >
      <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
        <Title level={5} style={{ marginBottom: '8px', color: 'var(--text-main, #111827)' }}>
          <Space>
            <FiBell size={16} />
            {t('notifications.deliveryChannels', 'Delivery Channels')}
          </Space>
        </Title>

        <Form.Item
          name="in_app_notifications"
          valuePropName="checked"
          style={{ marginBottom: '12px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>{t('notifications.inAppNotifications', 'In-App Notifications')}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                  {t('notifications.inAppSubtitle', 'Receive real-time notifications inside RecruitTrain')}
                </Text>
              </div>
            </div>
            <Switch />
          </div>
        </Form.Item>

        <Form.Item
          name="email_notifications"
          valuePropName="checked"
          style={{ marginBottom: '12px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>{t('notifications.emailNotifications', 'Email Notifications')}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                  {t('notifications.emailSubtitle', 'Send email alerts for critical candidate and job updates')}
                </Text>
              </div>
            </div>
            <Switch />
          </div>
        </Form.Item>

        <Divider style={{ margin: '16px 0' }} />

        <Title level={5} style={{ marginBottom: '8px', color: 'var(--text-main, #111827)' }}>
          <Space>
            <FiMail size={16} />
            {t('notifications.notificationCategories', 'Notification Categories')}
          </Space>
        </Title>

        <Form.Item
          name="interview_reminders"
          valuePropName="checked"
          style={{ marginBottom: '12px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>{t('notifications.interviewReminders', 'Interview Reminders')}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                  {t('notifications.interviewSub', 'Scheduled interview alerts and feedback requests')}
                </Text>
              </div>
            </div>
            <Switch />
          </div>
        </Form.Item>

        <Form.Item
          name="application_updates"
          valuePropName="checked"
          style={{ marginBottom: '12px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>{t('notifications.applicationUpdates', 'Application Updates')}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                  {t('notifications.applicationSub', 'Candidate stage transitions and application submission alerts')}
                </Text>
              </div>
            </div>
            <Switch />
          </div>
        </Form.Item>

        <Form.Item
          name="offer_alerts"
          valuePropName="checked"
          style={{ marginBottom: '12px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>{t('notifications.offerAlerts', 'Offer Alerts')}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                  {t('notifications.offerSub', 'Offer letter approvals, acceptances, and rejections')}
                </Text>
              </div>
            </div>
            <Switch />
          </div>
        </Form.Item>

        <Divider style={{ margin: '16px 0' }} />

        <Form.Item
          name="digest_frequency"
          label={t('notifications.digestFrequency', 'Email Digest Frequency')}
        >
          <Select placeholder={t('notifications.selectFrequency', 'Select frequency')}>
            <Option value="realtime">{t('notifications.realtime', 'Real-time Instant Alerts')}</Option>
            <Option value="daily">{t('notifications.daily', 'Daily Digest')}</Option>
            <Option value="weekly">{t('notifications.weekly', 'Weekly Digest')}</Option>
            <Option value="never">{t('notifications.never', 'Never')}</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NotificationPreferencesModal;
