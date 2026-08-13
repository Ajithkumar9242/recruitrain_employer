import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Space, Row, Col } from 'antd';
import { useLanguage } from '../../../hooks/useLanguage';

const { Option } = Select;

export const JobApplicationFormModal = ({
  visible,
  application,
  loading,
  onClose,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const isEditing = Boolean(application);

  useEffect(() => {
    if (visible) {
      if (application) {
        form.setFieldsValue({
          candidate: application.candidate,
          jobOpening: application.jobOpening,
          source: application.source || 'Direct',
          priority: application.priority || 'Medium',
          expectedSalary: application.expectedSalary || undefined,
          notes: application.notes || '',
          coverLetter: application.coverLetter || '',
          rejectionReason: application.rejectionReason || '',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          source: 'Direct',
          priority: 'Medium',
        });
      }
    }
  }, [visible, application, form]);

  const handleFinish = async (values) => {
    await onSubmit(values, application?.id);
    form.resetFields();
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={isEditing ? t('jobApplications.form.editTitle') : t('jobApplications.form.createTitle')}
      footer={null}
      destroyOnClose
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          source: 'Direct',
          priority: 'Medium',
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="candidate"
              label={t('jobApplications.form.candidateLabel')}
              rules={[{ required: !isEditing, message: t('jobApplications.form.candidateRequired') }]}
            >
              <Input placeholder="CAND-0001" disabled={isEditing} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="jobOpening"
              label={t('jobApplications.form.jobOpeningLabel')}
              rules={[{ required: !isEditing, message: t('jobApplications.form.jobOpeningRequired') }]}
            >
              <Input placeholder="JOB-0001" disabled={isEditing} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="source" label={t('jobApplications.form.sourceLabel')}>
              <Select>
                <Option value="Direct">Direct Application</Option>
                <Option value="LinkedIn">LinkedIn</Option>
                <Option value="Career Portal">Career Portal</Option>
                <Option value="Referral">Employee Referral</Option>
                <Option value="Agency">Recruitment Agency</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="priority" label={t('jobApplications.form.priorityLabel')}>
              <Select defaultActiveFirstOption>
                <Option value="Low">Low</Option>
                <Option value="Medium">Medium</Option>
                <Option value="High">High</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="expectedSalary" label={t('jobApplications.form.expectedSalaryLabel')}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="e.g. 85000"
                min={0}
                formatter={(val) => (val ? `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notes" label={t('jobApplications.form.notesLabel', 'Internal Notes')}>
          <Input.TextArea rows={2} placeholder={t('jobApplications.form.notesPlaceholder', 'Add internal notes regarding this application...')} />
        </Form.Item>

        <Form.Item name="coverLetter" label={t('jobApplications.form.coverLetterLabel')}>
          <Input.TextArea rows={4} placeholder={t('jobApplications.form.coverLetterPlaceholder')} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditing ? t('common.save') : t('jobApplications.form.submit')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default JobApplicationFormModal;
