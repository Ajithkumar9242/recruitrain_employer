import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Spin,
  Card,
  Space,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';
import jobApplicationApi from '../../../services/jobApplicationApi';
import jobApi from '../../../services/jobApi';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

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

  const [jobApplications, setJobApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(false);

  const selectedAppId = Form.useWatch('job_application', form);
  const selectedApp = jobApplications.find(
    (a) => (a.id || a.name || a.applicationId) === selectedAppId
  );

  const loadMasters = useCallback(async () => {
    setLoadingMasters(true);
    try {
      const [appsRes, usersRes] = await Promise.all([
        jobApplicationApi.listApplications({ pageSize: 100 }).catch(() => null),
        jobApi.getUsers().catch(() => []),
      ]);

      const rawAppItems =
        appsRes?.items ||
        appsRes?.data?.items ||
        appsRes?.data ||
        appsRes?.message?.data ||
        appsRes?.message?.items ||
        [];
      setJobApplications(Array.isArray(rawAppItems) ? rawAppItems : []);

      const rawUserItems = Array.isArray(usersRes)
        ? usersRes
        : usersRes?.data || usersRes?.items || usersRes?.message?.data || [];
      setUsers(Array.isArray(rawUserItems) ? rawUserItems : []);
    } catch (err) {
      console.error('Failed to load interview form masters:', err);
    } finally {
      setLoadingMasters(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadMasters();
      if (interview) {
        form.setFieldsValue({
          job_application: interview.jobApplication || interview.job_application || '',
          interview_type: interview.interviewType || interview.interview_type || 'Technical',
          scheduled_on: interview.scheduledOn ? dayjs(interview.scheduledOn) : null,
          duration: interview.duration || 45,
          meeting_link: interview.meetingLink || interview.meeting_link || '',
          location: interview.location || '',
          interviewer: interview.interviewer || '',
          recruiter: interview.recruiter || '',
          result: interview.result || 'Pending',
          status: interview.status || 'Scheduled',
          remarks: interview.remarks || '',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          interview_type: 'Technical',
          duration: 45,
          result: 'Pending',
          status: 'Scheduled',
        });
      }
    }
  }, [visible, interview, form, loadMasters]);

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
      title={isEditing ? t('interviews.form.editTitle', 'Edit Interview') : t('interviews.form.createTitle', 'Schedule Interview')}
      okText={t('interviews.form.submit', 'Save Interview')}
      cancelText={t('common.cancel', 'Cancel')}
      destroyOnClose
      width={680}
    >
      <Spin spinning={loadingMasters}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            interview_type: 'Technical',
            duration: 45,
            result: 'Pending',
            status: 'Scheduled',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="job_application"
                label={t('interviews.form.jobApplicationLabel', 'Job Application')}
                rules={[{ required: !isEditing, message: t('interviews.form.jobApplicationRequired', 'Please select a job application') }]}
              >
                <Select
                  showSearch
                  placeholder="Select Job Application"
                  disabled={isEditing}
                  optionFilterProp="children"
                >
                  {jobApplications.map((app) => {
                    const appId = app.id || app.name || app.applicationId;
                    const label = `${appId} — ${app.candidateName || app.candidate || 'Candidate'} (${app.jobOpeningTitle || app.jobOpening || 'Job'})`;
                    return (
                      <Option key={appId} value={appId}>
                        {label}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>

              {selectedApp && (
                <Card
                  size="small"
                  style={{
                    marginBottom: 16,
                    background: 'var(--bg-subtle, #f8fafc)',
                    borderRadius: 6,
                    borderColor: 'var(--brand-teal, #1890ff)',
                  }}
                >
                  <Space direction="vertical" size={4} style={{ width: '100%', fontSize: '0.85rem' }}>
                    <Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      Relationship Preview (Informational):
                    </Text>
                    <div>
                      <Text strong>Job Application:</Text> #{selectedApp.id || selectedApp.name}
                    </div>
                    <div>
                      <Text strong>Candidate:</Text>{' '}
                      {selectedApp.candidateName || selectedApp.candidate || 'Candidate'}
                    </div>
                    <div>
                      <Text strong>Job Opening:</Text>{' '}
                      {selectedApp.jobOpeningTitle || selectedApp.jobTitle || selectedApp.jobOpening || 'Job'}
                    </div>
                    <div>
                      <Text strong>Application Stage:</Text>{' '}
                      <Tag color="geekblue" style={{ margin: 0 }}>
                        {selectedApp.currentStage || 'Applied'}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Application Status:</Text>{' '}
                      <Tag color="blue" style={{ margin: 0 }}>
                        {selectedApp.status || 'Open'}
                      </Tag>
                    </div>
                  </Space>
                </Card>
              )}
            </Col>
            <Col span={12}>
              <Form.Item
                name="interview_type"
                label={t('interviews.form.interviewTypeLabel', 'Interview Type')}
                rules={[{ required: true, message: t('interviews.form.interviewTypeRequired', 'Please select interview type') }]}
              >
                <Select>
                  <Option value="Phone">{t('interviews.types.Phone', 'Phone')}</Option>
                  <Option value="Video">{t('interviews.types.Video', 'Video')}</Option>
                  <Option value="Technical">{t('interviews.types.Technical', 'Technical')}</Option>
                  <Option value="HR">{t('interviews.types.HR', 'HR')}</Option>
                  <Option value="Managerial">{t('interviews.types.Managerial', 'Managerial')}</Option>
                  <Option value="Final">{t('interviews.types.Final', 'Final')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="scheduled_on"
                label={t('interviews.form.scheduledOnLabel', 'Scheduled Date & Time')}
                rules={[{ required: true, message: t('interviews.form.scheduledOnRequired', 'Please select date & time') }]}
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
                label={t('interviews.form.durationLabel', 'Duration (mins)')}
                rules={[{ type: 'number', min: 1, message: 'Duration must be positive' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('interviews.form.durationPlaceholder', 'e.g. 45')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="interviewer"
                label={t('interviews.form.interviewerLabel', 'Interviewer')}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Select Interviewer"
                  optionFilterProp="children"
                >
                  {users.map((u) => (
                    <Option key={u.name} value={u.name}>
                      {u.full_name ? `${u.full_name} (${u.name})` : u.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="recruiter"
                label={t('interviews.drawer.recruiter', 'Recruiter')}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Select Recruiter"
                  optionFilterProp="children"
                >
                  {users.map((u) => (
                    <Option key={u.name} value={u.name}>
                      {u.full_name ? `${u.full_name} (${u.name})` : u.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="meeting_link"
                label={t('interviews.form.meetingLinkLabel', 'Meeting Link')}
                rules={[{ type: 'url', warningOnly: true, message: 'Please enter a valid URL' }]}
              >
                <Input placeholder={t('interviews.form.meetingLinkPlaceholder', 'https://meet.google.com/...')} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="location"
                label={t('interviews.form.locationLabel', 'Location')}
              >
                <Input placeholder={t('interviews.form.locationPlaceholder', 'Office Room 3B / Remote')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="result"
                label={t('interviews.drawer.result', 'Result')}
              >
                <Select>
                  <Option value="Pending">Pending</Option>
                  <Option value="Pass">Pass</Option>
                  <Option value="Fail">Fail</Option>
                  <Option value="Hold">Hold</Option>
                </Select>
              </Form.Item>
            </Col>
            {isEditing && (
              <Col span={12}>
                <Form.Item
                  name="status"
                  label={t('interviews.form.statusLabel', 'Status')}
                >
                  <Select>
                    <Option value="Scheduled">{t('interviews.statuses.Scheduled', 'Scheduled')}</Option>
                    <Option value="Rescheduled">{t('interviews.statuses.Rescheduled', 'Rescheduled')}</Option>
                    <Option value="Completed">{t('interviews.statuses.Completed', 'Completed')}</Option>
                    <Option value="Cancelled">{t('interviews.statuses.Cancelled', 'Cancelled')}</Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          <Form.Item
            name="remarks"
            label={t('interviews.form.remarksLabel', 'Remarks / Notes')}
          >
            <TextArea rows={3} placeholder={t('interviews.form.remarksPlaceholder', 'Add notes...')} />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default InterviewFormModal;
