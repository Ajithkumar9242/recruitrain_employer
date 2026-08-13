import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Row,
  Col,
  Checkbox,
  Upload,
  Button,
  Space,
  Typography,
  message,
  Card,
  Progress,
} from 'antd';
import {
  FiUpload,
  FiFileText,
  FiDownload,
  FiTrash2,
  FiExternalLink,
  FiCheckCircle,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';
import candidateApi from '../../../services/candidateApi';
import jobApi from '../../../services/jobApi';

const { Option } = Select;
const { Text } = Typography;

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/rtf',
];

const MAX_FILE_SIZE_MB = 10;

export const CandidateFormModal = ({
  visible,
  candidate,
  loading,
  onClose,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();

  const isEdit = Boolean(candidate?.id);

  // Resume State
  const [resumeUrl, setResumeUrl] = useState(candidate?.resume || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Master Data Options State
  const [professions, setProfessions] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [mastersLoading, setMastersLoading] = useState(false);
  const [professionError, setProfessionError] = useState(false);

  // Load backend master records for link fields
  useEffect(() => {
    if (visible) {
      setMastersLoading(true);
      setProfessionError(false);

      Promise.all([
        jobApi.getProfessions().catch((err) => {
          console.error('Failed to load professions master:', err);
          setProfessionError(true);
          return [];
        }),
        jobApi.getEmploymentTypes().catch((err) => {
          console.error('Failed to load employment types master:', err);
          return [];
        }),
        jobApi.getCountries().catch((err) => {
          console.error('Failed to load countries master:', err);
          return [];
        }),
      ])
        .then(([profRes, empRes, countryRes]) => {
          if (Array.isArray(profRes)) {
            setProfessions(profRes);
          } else {
            setProfessionError(true);
          }

          if (Array.isArray(empRes)) setEmploymentTypes(empRes);
          if (Array.isArray(countryRes)) setCountries(countryRes);
        })
        .finally(() => {
          setMastersLoading(false);
        });
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setResumeUrl(candidate?.resume || null);
      setSelectedFile(null);
      setUploadingResume(false);
      setUploadProgress(0);

      if (candidate) {
        form.setFieldsValue({
          company: candidate.company || '',
          candidate_name: candidate.candidateName || candidate.candidate_name || '',
          profile_completion: candidate.profileCompletion ?? candidate.profile_completion ?? 0,
          first_name: candidate.firstName || '',
          middle_name: candidate.middleName || '',
          last_name: candidate.lastName || '',
          email: candidate.email || '',
          mobile_no: candidate.mobileNo || '',
          alternate_mobile: candidate.alternateMobile || '',
          date_of_birth: candidate.dateOfBirth ? dayjs(candidate.dateOfBirth) : null,
          gender: candidate.gender || undefined,
          nationality: candidate.nationality || undefined,
          marital_status: candidate.maritalStatus || undefined,
          current_job_title: candidate.currentJobTitle || '',
          current_company: candidate.currentCompany || '',
          years_of_experience: candidate.yearsOfExperience || 0,
          notice_period: candidate.noticePeriod || 0,
          current_salary: candidate.currentSalary || null,
          expected_salary: candidate.expectedSalary || null,
          preferred_location: candidate.preferredLocation || '',
          profession: candidate.profession || undefined,
          employment_type: candidate.employmentType || undefined,
          address_line_1: candidate.addressLine1 || '',
          address_line_2: candidate.addressLine2 || '',
          city: candidate.city || '',
          state: candidate.state || '',
          country: candidate.country || undefined,
          postal_code: candidate.postalCode || '',
          passport_number: candidate.passportNumber || '',
          passport_expiry: candidate.passportExpiry ? dayjs(candidate.passportExpiry) : null,
          visa_status: candidate.visaStatus || undefined,
          work_permit: candidate.workPermit || false,
          status: candidate.status || 'Active',
          source: candidate.source || 'Career Portal',
          linkedin: candidate.linkedin || '',
          portfolio: candidate.portfolio || '',
          github: candidate.github || '',
          resume: candidate.resume || null,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          company: '',
          candidate_name: '',
          profile_completion: 0,
          country: undefined,
          nationality: undefined,
          profession: undefined,
          employment_type: undefined,
          status: 'Active',
          source: 'Career Portal',
          years_of_experience: 0,
          notice_period: 0,
        });
      }
    }
  }, [visible, candidate, form]);

  // Handle custom file upload or selection
  const handleBeforeUpload = (file) => {
    // File size check
    const isLtMax = file.size / 1024 / 1024 < MAX_FILE_SIZE_MB;
    if (!isLtMax) {
      message.error(t('candidate.validation.fileTooLarge', `File must be smaller than ${MAX_FILE_SIZE_MB}MB.`));
      return Upload.LIST_IGNORE;
    }

    setSelectedFile(file);
    return false; // Prevent automatic upload by Ant Design
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;

    setUploadingResume(true);
    setUploadProgress(20);

    try {
      // If editing existing candidate, attach directly to the document
      const docname = candidate?.id || 'temp';
      const uploadRes = await candidateApi.uploadFile({
        file: selectedFile,
        doctype: 'Candidate',
        docname: isEdit ? candidate.id : '',
        fieldname: 'resume',
      });

      setUploadProgress(80);

      const rawData = uploadRes?.message?.data || uploadRes?.message || uploadRes?.data || uploadRes;
      const uploadedUrl = rawData?.file_url || rawData?.file || '';

      if (uploadedUrl) {
        setResumeUrl(uploadedUrl);
        form.setFieldsValue({ resume: uploadedUrl });
        message.success(t('candidate.messages.resumeUploadSuccess', 'Resume uploaded successfully.'));
        setSelectedFile(null);

        // If editing existing candidate, persist candidate.resume field immediately
        if (isEdit && candidate?.id) {
          await candidateApi.updateCandidate(candidate.id, { resume: uploadedUrl });
        }
      } else {
        throw new Error('Upload succeeded but no file URL returned.');
      }

      setUploadProgress(100);
    } catch (err) {
      console.error('Resume upload error:', err);
      message.error(err.message || t('candidate.messages.resumeUploadError', 'Failed to upload resume file.'));
    } finally {
      setUploadingResume(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveResume = () => {
    setResumeUrl(null);
    setSelectedFile(null);
    form.setFieldsValue({ resume: null });
  };

  const handleFinish = async (values) => {
    let finalResume = resumeUrl || values.resume || null;

    // If a file was selected but not uploaded manually yet, upload it now
    if (selectedFile && !finalResume) {
      setUploadingResume(true);
      try {
        const uploadRes = await candidateApi.uploadFile({
          file: selectedFile,
          doctype: 'Candidate',
          docname: isEdit ? candidate.id : '',
          fieldname: 'resume',
        });
        const rawData = uploadRes?.message?.data || uploadRes?.message || uploadRes?.data || uploadRes;
        finalResume = rawData?.file_url || '';
      } catch (err) {
        message.error(err.message || 'Failed to upload resume before submission');
        setUploadingResume(false);
        return;
      } finally {
        setUploadingResume(false);
      }
    }

    const payload = {
      ...values,
      resume: finalResume,
      date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
      passport_expiry: values.passport_expiry ? values.passport_expiry.format('YYYY-MM-DD') : null,
    };

    try {
      await onSubmit(payload);
      form.resetFields();
      onClose();
    } catch (err) {
      const errMsg = typeof err === 'string' ? err : err.message || t('candidate.messages.validationError');
      message.error(errMsg);
    }
  };

  return (
    <Modal
      title={isEdit ? t('candidate.editCandidate') : t('candidate.addCandidate')}
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading || uploadingResume}
      width={840}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          company: '',
          candidate_name: '',
          profile_completion: 0,
          country: 'India',
          nationality: 'India',
          status: 'Active',
          source: 'Career Portal',
          years_of_experience: 0,
          notice_period: 0,
        }}
      >
        {/* === RESUME UPLOAD SECTION === */}
        <Card
          size="small"
          title={
            <Space align="center">
              <FiFileText style={{ color: 'var(--brand-teal, #008080)' }} />
              <Text strong>{t('candidate.fields.resume', 'Resume Attachment')}</Text>
            </Space>
          }
          style={{ marginBottom: 20, borderRadius: 8, borderColor: 'var(--brand-teal-light, #cbd5e1)' }}
        >
          {resumeUrl ? (
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space align="center">
                <FiCheckCircle style={{ color: '#52c41a', fontSize: '1.2rem' }} />
                <div>
                  <Text strong style={{ fontSize: '0.9rem', display: 'block' }}>
                    {resumeUrl.split('/').pop() || 'Resume Attached'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                    {resumeUrl}
                  </Text>
                </div>
              </Space>
              <Space>
                <Button
                  size="small"
                  icon={<FiExternalLink />}
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('candidate.actions.viewResume', 'View Resume')}
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<FiTrash2 />}
                  onClick={handleRemoveResume}
                >
                  {t('common.remove', 'Remove')}
                </Button>
              </Space>
            </Space>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={16} align="middle">
                <Col xs={24} sm={16}>
                  <Upload
                    beforeUpload={handleBeforeUpload}
                    showUploadList={false}
                    accept=".pdf,.doc,.docx,.txt,.rtf"
                  >
                    <Button icon={<FiUpload />}>
                      {selectedFile ? selectedFile.name : t('candidate.actions.selectResume', 'Select Resume File (.pdf, .docx, .txt)')}
                    </Button>
                  </Upload>
                  {selectedFile && (
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: '0.8rem' }}>
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Text>
                  )}
                </Col>
                <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
                  {selectedFile && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<FiUpload />}
                      onClick={handleUploadClick}
                      loading={uploadingResume}
                    >
                      {t('candidate.actions.uploadNow', 'Upload Now')}
                    </Button>
                  )}
                </Col>
              </Row>

              {uploadingResume && (
                <Progress percent={uploadProgress} size="small" strokeColor="var(--brand-teal)" />
              )}
            </Space>
          )}
        </Card>

        {/* === PERSONAL INFORMATION === */}
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="company" label={t('candidate.fields.company', 'Company')}>
              <Input placeholder="Company Name" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="candidate_name" label={t('candidate.fields.candidateName', 'Candidate Name')}>
              <Input placeholder="Full Candidate Name" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="profile_completion" label={t('candidate.fields.profileCompletion', 'Profile Completion (%)')}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="first_name"
              label={t('candidate.fields.firstName', 'First Name')}
              rules={[{ required: true, message: t('candidate.validation.firstNameRequired') }]}
            >
              <Input placeholder="John" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="middle_name" label={t('candidate.fields.middleName', 'Middle Name')}>
              <Input placeholder="" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="last_name"
              label={t('candidate.fields.lastName', 'Last Name')}
              rules={[{ required: true, message: t('candidate.validation.lastNameRequired') }]}
            >
              <Input placeholder="Doe" />
            </Form.Item>
          </Col>
        </Row>

        {/* Candidate Name Auto-Generated Preview Hint */}
        <Row gutter={16} style={{ marginBottom: 12 }}>
          <Col span={24}>
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>
              ℹ️ {t('candidate.fields.candidateNameHint', 'Candidate Name is auto-generated from First Name + Middle Name + Last Name.')}
            </Text>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="email"
              label={t('candidate.fields.email', 'Email Address')}
              rules={[
                { required: true, message: t('candidate.validation.emailRequired') },
                { type: 'email', message: t('candidate.validation.emailInvalid') },
              ]}
            >
              <Input placeholder="candidate@example.com" disabled={isEdit} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="mobile_no"
              label={t('candidate.fields.mobileNo', 'Mobile Number')}
              rules={[{ required: true, message: t('candidate.validation.mobileRequired') }]}
            >
              <Input placeholder="+91 9876543210" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="alternate_mobile"
              label={t('candidate.fields.alternateMobile', 'Alternate Mobile Number')}
            >
              <Input placeholder="+91 9876543211" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Form.Item
              name="date_of_birth"
              label={t('candidate.fields.dateOfBirth')}
              rules={[{ required: true, message: t('candidate.validation.dobRequired') }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="gender" label={t('candidate.fields.gender')}>
              <Select placeholder="Select gender" allowClear>
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Non-Binary">Non-Binary</Option>
                <Option value="Prefer Not To Say">Prefer Not To Say</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="marital_status" label={t('candidate.fields.maritalStatus', 'Marital Status')}>
              <Select placeholder="Select marital status" allowClear>
                <Option value="Married">Married</Option>
                <Option value="Un-Married">Un-Married</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="nationality" label={t('candidate.fields.nationality')}>
              <Select
                showSearch
                allowClear
                placeholder={t('candidate.placeholders.selectNationality', 'Select nationality')}
                loading={mastersLoading}
                optionFilterProp="label"
                options={countries.map((c) => ({
                  label: c.country_name || c.name,
                  value: c.name,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* === PROFESSIONAL INFORMATION === */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="profession"
              label={t('candidate.fields.profession', 'Profession')}
              rules={[{ required: true, message: t('candidate.validation.professionRequired', 'Please select a profession') }]}
            >
              <Select
                showSearch
                allowClear
                placeholder={
                  professionError
                    ? t('candidate.messages.professionsLoadError', 'Unable to load professions. Please try again.')
                    : professions.length === 0 && !mastersLoading
                    ? t('candidate.messages.noProfessionsAvailable', 'No professions available')
                    : t('candidate.placeholders.selectProfession', 'Select profession')
                }
                disabled={mastersLoading || (professions.length === 0 && !mastersLoading) || Boolean(professionError)}
                loading={mastersLoading}
                optionFilterProp="label"
                options={professions.map((p) => ({
                  label: p.display_name || p.name,
                  value: p.name,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="employment_type"
              label={t('candidate.fields.employmentType', 'Employment Type')}
              rules={[{ required: true, message: t('candidate.validation.employmentTypeRequired', 'Please select an employment type') }]}
            >
              <Select
                showSearch
                allowClear
                placeholder={t('candidate.placeholders.selectEmploymentType', 'Select employment type')}
                loading={mastersLoading}
                optionFilterProp="label"
                options={employmentTypes.map((et) => ({
                  label: et.display_name || et.name,
                  value: et.name,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="current_job_title" label={t('candidate.fields.currentJobTitle')}>
              <Input placeholder="Senior Software Engineer" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="current_company" label={t('candidate.fields.currentCompany')}>
              <Input placeholder="Tech Solutions Ltd" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Form.Item name="years_of_experience" label={t('candidate.fields.yearsOfExperience')}>
              <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="notice_period" label={t('candidate.fields.noticePeriod')}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="current_salary" label={t('candidate.fields.currentSalary', 'Current Salary')}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="50000" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="expected_salary" label={t('candidate.fields.expectedSalary', 'Expected Salary')}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="65000" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="preferred_location" label={t('candidate.fields.preferredLocation', 'Preferred Location')}>
              <Input placeholder="Berlin, Munich, Remote" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="source" label={t('candidate.fields.source', 'Source')}>
              <Select placeholder="Select source" allowClear>
                <Option value="Career Portal">Career Portal</Option>
                <Option value="Referral">Referral</Option>
                <Option value="LinkedIn">LinkedIn</Option>
                <Option value="Indeed">Indeed</Option>
                <Option value="Naukri">Naukri</Option>
                <Option value="Foundit">Foundit</Option>
                <Option value="Campus">Campus</Option>
                <Option value="Agency">Agency</Option>
                <Option value="Manual">Manual</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="status" label={t('candidate.fields.status')}>
              <Select>
                <Option value="Draft">Draft</Option>
                <Option value="Active">Active</Option>
                <Option value="In Review">In Review</Option>
                <Option value="Interviewing">Interviewing</Option>
                <Option value="Offered">Offered</Option>
                <Option value="Hired">Hired</Option>
                <Option value="Rejected">Rejected</Option>
                <Option value="Archived">Archived</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* === ADDRESS INFORMATION === */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="address_line_1"
              label={t('candidate.fields.addressLine1')}
              rules={[{ required: true, message: t('candidate.validation.addressRequired') }]}
            >
              <Input placeholder="123 Main Street" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="address_line_2" label={t('candidate.fields.addressLine2')}>
              <Input placeholder="Apartment / Suite" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Form.Item
              name="city"
              label={t('candidate.fields.city')}
              rules={[{ required: true, message: t('candidate.validation.cityRequired') }]}
            >
              <Input placeholder="Mumbai" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item
              name="state"
              label={t('candidate.fields.state')}
              rules={[{ required: true, message: t('candidate.validation.stateRequired') }]}
            >
              <Input placeholder="Maharashtra" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="country" label={t('candidate.fields.country')}>
              <Select
                showSearch
                allowClear
                placeholder={t('candidate.placeholders.selectCountry', 'Select country')}
                loading={mastersLoading}
                optionFilterProp="label"
                options={countries.map((c) => ({
                  label: c.country_name || c.name,
                  value: c.name,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="postal_code" label={t('candidate.fields.postalCode', 'Postal Code')}>
              <Input placeholder="400001" />
            </Form.Item>
          </Col>
        </Row>

        {/* === PASSPORT & VISA === */}
        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Form.Item name="passport_number" label={t('candidate.fields.passportNumber')}>
              <Input placeholder="P1234567" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="passport_expiry" label={t('candidate.fields.passportExpiry')}>
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="visa_status" label={t('candidate.fields.visaStatus', 'Visa Status')}>
              <Select placeholder="Select visa status" allowClear>
                <Option value="Citizen">Citizen</Option>
                <Option value="Permanent Resident">Permanent Resident</Option>
                <Option value="Work Visa">Work Visa</Option>
                <Option value="Student Visa">Student Visa</Option>
                <Option value="Tourist Visa">Tourist Visa</Option>
                <Option value="Requires Sponsorship">Requires Sponsorship</Option>
                <Option value="Not Applicable">Not Applicable</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="work_permit" valuePropName="checked" style={{ marginTop: '30px' }}>
              <Checkbox>{t('candidate.fields.workPermit')}</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* === SOCIAL PROFILES === */}
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="linkedin" label="LinkedIn Profile">
              <Input placeholder="https://linkedin.com/in/username" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="portfolio" label="Portfolio URL">
              <Input placeholder="https://portfolio.com" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="github" label="GitHub Profile">
              <Input placeholder="https://github.com/username" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CandidateFormModal;
