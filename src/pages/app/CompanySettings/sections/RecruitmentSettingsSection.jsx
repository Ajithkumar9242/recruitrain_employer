import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select, Switch, Button, Card, Row, Col, Typography, Spin } from 'antd';
import { FiBriefcase, FiSave } from 'react-icons/fi';
import { useLanguage } from '../../../../hooks/useLanguage';

const { Title, Text } = Typography;
const { Option } = Select;

export const RecruitmentSettingsSection = ({
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
        default_hiring_pipeline: settings.default_hiring_pipeline || 'Standard',
        default_interview_duration: settings.default_interview_duration ?? 60,
        auto_archive_candidates: settings.auto_archive_candidates ?? false,
        enable_resume_parsing: settings.enable_resume_parsing ?? true,
        default_candidate_source: settings.default_candidate_source || 'Job Board',
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
              <FiBriefcase style={{ color: 'var(--brand-teal, #1890ff)' }} />
              {t('companySettings.recruitment.title', 'Recruitment & Hiring Pipeline Settings')}
            </Title>
            <Text type="secondary">
              {t('companySettings.recruitment.subtitle', 'Configure default hiring workflow rules, interview durations, and candidate sources.')}
            </Text>
          </div>
          <Button
            type="primary"
            icon={<FiSave />}
            htmlType="submit"
            loading={saving}
            style={{ backgroundColor: 'var(--brand-navy, #0f172a)' }}
          >
            {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Settings')}
          </Button>
        </div>
      </Card>

      <Card style={{ borderRadius: '8px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="default_hiring_pipeline"
              label={t('companySettings.recruitment.defaultPipeline', 'Default Hiring Pipeline Template')}
            >
              <Select placeholder="Select pipeline template">
                <Option value="Standard">Standard Pipeline (Applied → Screening → Interview → Offer → Hired)</Option>
                <Option value="Executive">Executive Search Pipeline</Option>
                <Option value="Technical">Engineering / Technical Assessment Pipeline</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="default_interview_duration"
              label={t('companySettings.recruitment.defaultDuration', 'Default Interview Duration (Minutes)')}
            >
              <InputNumber min={15} max={180} step={15} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="default_candidate_source"
              label={t('companySettings.recruitment.defaultSource', 'Default Candidate Source')}
            >
              <Select placeholder="Select default source">
                <Option value="Job Board">Careers Portal / Job Board</Option>
                <Option value="LinkedIn">LinkedIn Recruiter</Option>
                <Option value="Agency">Hiring Agency</Option>
                <Option value="Referral">Employee Referral</Option>
                <Option value="Direct">Direct Application</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="enable_resume_parsing"
              valuePropName="checked"
              label={t('companySettings.recruitment.enableResumeParsing', 'Enable Automated Resume Parsing')}
            >
              <Switch />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="auto_archive_candidates"
              valuePropName="checked"
              label={t('companySettings.recruitment.autoArchive', 'Auto-Archive Rejected Candidates')}
            >
              <Switch />
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
          {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Settings')}
        </Button>
      </div>
    </Form>
  );
};

export default RecruitmentSettingsSection;
