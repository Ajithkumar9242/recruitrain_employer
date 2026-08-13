import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Row,
  Col,
  Rate,
  Upload,
  Typography,
  Spin,
  Alert,
  message,
} from 'antd';
import {
  FiUpload,
  FiFileText,
  FiUser,
  FiBriefcase,
  FiCheckCircle,
  FiExternalLink,
  FiTrash2,
  FiStar,
} from 'react-icons/fi';
import { useLanguage } from '../../../hooks/useLanguage';
import candidateApi from '../../../services/candidateApi';
import jobApi from '../../../services/jobApi';
import jobApplicationApi from '../../../services/jobApplicationApi';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const SOURCE_OPTIONS = [
  { label: 'Career Portal', value: 'Career Portal' },
  { label: 'LinkedIn', value: 'LinkedIn' },
  { label: 'Referral', value: 'Referral' },
  { label: 'Naukri', value: 'Naukri' },
  { label: 'Foundit', value: 'Foundit' },
  { label: 'Manual', value: 'Manual' },
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Critical', value: 'Critical' },
];

const STAGE_OPTIONS = [
  'Applied',
  'Screening',
  'Shortlisted',
  'Interview',
  'Technical',
  'HR',
  'Offered',
  'Hired',
  'Rejected',
  'Withdrawn',
].map((s) => ({ label: s, value: s }));

const STATUS_OPTIONS = [
  { label: 'Open', value: 'Open' },
  { label: 'Closed', value: 'Closed' },
  { label: 'Hired', value: 'Hired' },
  { label: 'Rejected', value: 'Rejected' },
];

export const JobApplicationFormModal = ({
  visible,
  application,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const isEditing = Boolean(application && (application.id || application.name));

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [mastersLoading, setMastersLoading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [formError, setFormError] = useState(null);

  const watchStatus = Form.useWatch('status', form);
  const watchStage = Form.useWatch('currentStage', form);

  const loadOptions = useCallback(async () => {
    setMastersLoading(true);
    try {
      const [candRes, jobsRes, usersRes] = await Promise.all([
        candidateApi.listCandidates({ pageSize: 100 }).catch(() => null),
        jobApi.listJobs({ pageSize: 100 }).catch(() => null),
        jobApi.getUsers().catch(() => []),
      ]);

      const rawCandItems =
        candRes?.data?.items ||
        candRes?.data ||
        candRes?.message?.data ||
        candRes?.message?.items ||
        candRes?.message ||
        candRes?.items ||
        [];
      setCandidates(Array.isArray(rawCandItems) ? rawCandItems : []);

      const rawJobItems =
        jobsRes?.items ||
        jobsRes?.data?.items ||
        jobsRes?.data ||
        jobsRes?.message?.data ||
        jobsRes?.message?.items ||
        jobsRes?.message ||
        [];
      setJobs(Array.isArray(rawJobItems) ? rawJobItems : []);

      const rawUserItems = Array.isArray(usersRes)
        ? usersRes
        : usersRes?.data || usersRes?.items || usersRes?.message?.data || [];
      setRecruiters(Array.isArray(rawUserItems) ? rawUserItems : []);
    } catch (err) {
      console.error('Failed loading select options:', err);
    } finally {
      setMastersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setFormError(null);
      loadOptions();

      if (application) {
        setResumeUrl(application.resume || '');
        form.setFieldsValue({
          candidate: application.candidate || application.candidateId,
          jobOpening: application.jobOpening || application.jobOpeningId,
          source: application.source || 'Career Portal',
          priority: application.priority || 'Medium',
          rating: application.rating || 0,
          assignedRecruiter: application.assignedRecruiter || application.recruiter || undefined,
          status: application.status || 'Open',
          currentStage: application.currentStage || 'Applied',
          notes: application.notes || '',
          coverLetter: application.coverLetter || '',
          rejectionReason: application.rejectionReason || '',
        });
      } else {
        setResumeUrl('');
        form.resetFields();
        form.setFieldsValue({
          source: 'Career Portal',
          priority: 'Medium',
          rating: 0,
          status: 'Open',
          currentStage: 'Applied',
        });
      }
    }
  }, [visible, application, form, loadOptions]);

  const handleResumeUpload = async ({ file, onSuccess, onError }) => {
    setUploadingResume(true);
    try {
      const fileUrl = await jobApplicationApi.uploadResume(file, application?.id);
      if (fileUrl) {
        setResumeUrl(fileUrl);
        form.setFieldsValue({ resume: fileUrl });
        message.success(t('candidate.messages.resumeUploadSuccess', 'Resume uploaded successfully.'));
        onSuccess(fileUrl);
      } else {
        throw new Error('No file URL returned from server.');
      }
    } catch (err) {
      message.error(err.message || t('candidate.messages.resumeUploadError', 'Failed to upload resume.'));
      onError(err);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleRemoveResume = () => {
    setResumeUrl('');
    form.setFieldsValue({ resume: '' });
  };

  const handleFinish = async (values) => {
    setFormError(null);
    try {
      const payload = {
        ...values,
        resume: resumeUrl || values.resume || null,
      };
      await onSubmit(payload, application?.id || application?.name);
    } catch (err) {
      setFormError(err?.message || String(err));
    }
  };

  const isRejected = watchStatus === 'Rejected' || watchStage === 'Rejected';

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={
        <Space align="center">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: 'rgba(24, 144, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-teal, #1890ff)',
            }}
          >
            <FiBriefcase size={18} />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {isEditing
              ? t('jobApplications.form.editTitle', 'Edit Job Application')
              : t('jobApplications.form.createTitle', 'Submit New Job Application')}
          </span>
        </Space>
      }
      footer={null}
      destroyOnClose
      width={680}
      maskClosable={!loading && !uploadingResume}
    >
      <Spin spinning={mastersLoading}>
        {formError && (
          <Alert
            type="error"
            message="Submission Failed"
            description={formError}
            showIcon
            closable
            onClose={() => setFormError(null)}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="candidate"
                label={t('jobApplications.form.candidateLabel', 'Candidate')}
                rules={[{ required: !isEditing, message: t('jobApplications.form.candidateRequired', 'Please select a candidate.') }]}
              >
                <Select
                  showSearch
                  disabled={isEditing}
                  placeholder="Select Candidate"
                  optionFilterProp="label"
                  options={candidates.map((c) => {
                    const val = c.name || c.candidate_id || c.id;
                    const displayName = c.full_name || (c.first_name ? `${c.first_name} ${c.last_name || ''}`.trim() : val);
                    return {
                      label: `${displayName} (${val})`,
                      value: val,
                    };
                  })}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="jobOpening"
                label={t('jobApplications.form.jobOpeningLabel', 'Job Opening')}
                rules={[{ required: !isEditing, message: t('jobApplications.form.jobOpeningRequired', 'Please select a job opening.') }]}
              >
                <Select
                  showSearch
                  disabled={isEditing}
                  placeholder="Select Job Opening"
                  optionFilterProp="label"
                  options={jobs.map((j) => {
                    const val = j.name || j.id || j.job_opening_id;
                    const title = j.job_title || j.jobTitle || j.title || val;
                    const code = j.job_code || j.jobCode || val;
                    return {
                      label: `${title} (${code})`,
                      value: val,
                    };
                  })}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="source" label={t('jobApplications.form.sourceLabel', 'Source')}>
                <Select options={SOURCE_OPTIONS} placeholder="Select Source" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item name="priority" label={t('jobApplications.form.priorityLabel', 'Priority')}>
                <Select options={PRIORITY_OPTIONS} placeholder="Select Priority" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item name="assignedRecruiter" label={t('jobApplications.drawer.recruiter', 'Assigned Recruiter')}>
                <Select
                  showSearch
                  allowClear
                  placeholder="Select Recruiter"
                  optionFilterProp="label"
                  options={recruiters.map((u) => ({
                    label: u.full_name ? `${u.full_name} (${u.name})` : u.name,
                    value: u.name,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="currentStage" label={t('jobApplications.table.currentStage', 'Current Stage')}>
                <Select options={STAGE_OPTIONS} placeholder="Select Stage" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item name="status" label={t('jobApplications.table.status', 'Status')}>
                <Select options={STATUS_OPTIONS} placeholder="Select Status" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item name="rating" label="Candidate Rating">
                <Rate allowHalf={false} character={<FiStar size={16} />} style={{ fontSize: 16 }} />
              </Form.Item>
            </Col>
          </Row>

          {isRejected && (
            <Form.Item
              name="rejectionReason"
              label={t('jobApplications.drawer.rejectionReason', 'Rejection Reason')}
              rules={[{ required: true, message: 'Please provide a rejection reason.' }]}
            >
              <TextArea rows={2} placeholder="Explain reason for rejection..." />
            </Form.Item>
          )}

          {/* Resume File Upload Section */}
          <Form.Item label="Resume Document">
            {resumeUrl ? (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--bg-subtle, #f8fafc)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Space align="center">
                  <FiFileText style={{ color: 'var(--brand-teal, #1890ff)' }} size={20} />
                  <div>
                    <Text strong style={{ fontSize: '0.85rem' }}>
                      {resumeUrl.split('/').pop()}
                    </Text>
                    <div>
                      <a href={resumeUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', marginRight: 12 }}>
                        <FiExternalLink style={{ marginRight: 4 }} /> View / Download
                      </a>
                    </div>
                  </div>
                </Space>
                <Space>
                  <Upload customRequest={handleResumeUpload} showUploadList={false}>
                    <Button size="small" icon={<FiUpload />}>
                      Replace
                    </Button>
                  </Upload>
                  <Button size="small" danger icon={<FiTrash2 />} onClick={handleRemoveResume} />
                </Space>
              </div>
            ) : (
              <Upload customRequest={handleResumeUpload} showUploadList={false}>
                <Button icon={<FiUpload />} loading={uploadingResume}>
                  Upload Resume File (PDF / DOC)
                </Button>
              </Upload>
            )}
          </Form.Item>

          <Form.Item name="notes" label={t('jobApplications.form.notesLabel', 'Internal Notes')}>
            <TextArea rows={2} placeholder={t('jobApplications.form.notesPlaceholder', 'Add internal notes regarding this application...')} />
          </Form.Item>

          <Form.Item name="coverLetter" label={t('jobApplications.form.coverLetterLabel', 'Cover Letter')}>
            <TextArea rows={3} placeholder={t('jobApplications.form.coverLetterPlaceholder', 'Enter candidate cover letter...')} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={onClose} disabled={loading || uploadingResume}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} disabled={uploadingResume}>
                {isEditing ? t('common.save', 'Save Changes') : t('jobApplications.form.submit', 'Submit Application')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default JobApplicationFormModal;
