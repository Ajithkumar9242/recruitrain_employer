import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Row,
  Col,
} from 'antd';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';

const { Option } = Select;
const { TextArea } = Input;

export const InterviewFormModal = ({
  visible,
  interview = null,
  saving,
  onClose,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const isEditing = Boolean(interview?.id);

  useEffect(() => {
    if (visible) {
      if (interview) {
        form.setFieldsValue({
          job_application: interview.jobApplication || interview.job_application || '',
          interview_type: interview.interviewType || interview.interview_type || 'Technical',
          scheduled_on: interview.scheduledOn ? dayjs(interview.scheduledOn) : null,
          duration: interview.duration || 45,
          meeting_link: interview.meetingLink || interview.meeting_link || '',
          location: interview.location || '',
          interviewer: interview.interviewer || '',
          remarks: interview.remarks || '',
          status: interview.status || 'Scheduled',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          interview_type: 'Technical',
          duration: 45,
          status: 'Scheduled',
        });
      }
    }
  }, [visible, interview, form]);

  const handleFinish = (values) => {
    const payload = {
      ...values,
      scheduled_on: values.scheduled_on ? values.scheduled_on.format('YYYY-MM-DD HH:mm:ss') : null,
    };
    onSubmit(payload);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={saving}
      title={isEditing ? t('interviews.form.editTitle') : t('interviews.form.createTitle')}
      okText={t('interviews.form.submit')}
      cancelText={t('common.cancel')}
      destroyOnClose
      width={680}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          interview_type: 'Technical',
          duration: 45,
          status: 'Scheduled',
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="job_application"
              label={t('interviews.form.jobApplicationLabel')}
              rules={[{ required: !isEditing, message: t('interviews.form.jobApplicationRequired') }]}
            >
              <Input
                placeholder="APP-00001"
                disabled={isEditing}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="interview_type"
              label={t('interviews.form.interviewTypeLabel')}
              rules={[{ required: true, message: t('interviews.form.interviewTypeRequired') }]}
            >
              <Select>
                <Option value="Phone">{t('interviews.types.Phone')}</Option>
                <Option value="Video">{t('interviews.types.Video')}</Option>
                <Option value="Technical">{t('interviews.types.Technical')}</Option>
                <Option value="HR">{t('interviews.types.HR')}</Option>
                <Option value="Managerial">{t('interviews.types.Managerial')}</Option>
                <Option value="Final">{t('interviews.types.Final')}</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={14}>
            <Form.Item
              name="scheduled_on"
              label={t('interviews.form.scheduledOnLabel')}
              rules={[{ required: true, message: t('interviews.form.scheduledOnRequired') }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="duration"
              label={t('interviews.form.durationLabel')}
              rules={[{ type: 'number', min: 1, message: 'Duration must be positive' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder={t('interviews.form.durationPlaceholder')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={14}>
            <Form.Item
              name="meeting_link"
              label={t('interviews.form.meetingLinkLabel')}
              rules={[{ type: 'url', warningOnly: true, message: 'Please enter a valid URL' }]}
            >
              <Input placeholder={t('interviews.form.meetingLinkPlaceholder')} />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="interviewer"
              label={t('interviews.form.interviewerLabel')}
            >
              <Input placeholder={t('interviews.form.interviewerPlaceholder')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={14}>
            <Form.Item
              name="location"
              label={t('interviews.form.locationLabel')}
            >
              <Input placeholder={t('interviews.form.locationPlaceholder')} />
            </Form.Item>
          </Col>
          {isEditing && (
            <Col span={10}>
              <Form.Item
                name="status"
                label={t('interviews.form.statusLabel')}
              >
                <Select>
                  <Option value="Scheduled">{t('interviews.statuses.Scheduled')}</Option>
                  <Option value="Rescheduled">{t('interviews.statuses.Rescheduled')}</Option>
                  <Option value="Completed">{t('interviews.statuses.Completed')}</Option>
                  <Option value="Cancelled">{t('interviews.statuses.Cancelled')}</Option>
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>

        <Form.Item
          name="remarks"
          label={t('interviews.form.remarksLabel')}
        >
          <TextArea rows={3} placeholder={t('interviews.form.remarksPlaceholder')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InterviewFormModal;
