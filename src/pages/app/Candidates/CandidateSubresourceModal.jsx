import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Checkbox, Upload, Button, message, Space, Typography } from 'antd';
import { FiUpload, FiFileText } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';
import candidateApi from '../../../services/candidateApi';

const { Option } = Select;
const { Text } = Typography;

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export const CandidateSubresourceModal = ({
  visible,
  resourceType,
  candidate,
  initialValues = null,
  editIndex = null,
  loading,
  onClose,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [fileUrl, setFileUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const isEdit = initialValues !== null && editIndex !== null;

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setFileUrl('');
      if (initialValues) {
        const formatted = { ...initialValues };
        if (formatted.start_date) formatted.start_date = dayjs(formatted.start_date);
        if (formatted.end_date) formatted.end_date = dayjs(formatted.end_date);
        if (formatted.issue_date) formatted.issue_date = dayjs(formatted.issue_date);
        if (formatted.expiry_date) formatted.expiry_date = dayjs(formatted.expiry_date);
        if (formatted.current_company) formatted.current_company = Boolean(formatted.current_company);
        if (formatted.reading) formatted.reading = Boolean(formatted.reading);
        if (formatted.writing) formatted.writing = Boolean(formatted.writing);
        if (formatted.speaking) formatted.speaking = Boolean(formatted.speaking);
        if (formatted.verified) formatted.verified = Boolean(formatted.verified);
        if (formatted.file) setFileUrl(formatted.file);

        form.setFieldsValue(formatted);
      }
    }
  }, [visible, resourceType, initialValues, form]);

  const handleFileUpload = async (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      message.error(t('candidate.messages.invalidFileType', `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} are allowed.`));
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
      message.error(t('candidate.messages.fileTooLarge', `File size must be under ${MAX_FILE_SIZE_MB}MB.`));
      return Upload.LIST_IGNORE;
    }

    setUploadingFile(true);
    try {
      const res = await candidateApi.uploadFile({
        file,
        doctype: 'Candidate',
        docname: candidate?.id || candidate?.name || '',
        fieldname: 'documents',
      });
      const raw = res?.message?.data || res?.message || res?.data || res;
      const uploadedUrl = raw?.file_url || raw?.file || '';
      if (uploadedUrl) {
        setFileUrl(uploadedUrl);
        form.setFieldsValue({ file: uploadedUrl });
        message.success(t('candidate.messages.uploadSuccess', 'Document uploaded successfully.'));
      } else {
        throw new Error('No file URL returned');
      }
    } catch (err) {
      message.error(err?.message || t('candidate.messages.uploadError', 'File upload failed'));
    } finally {
      setUploadingFile(false);
    }
    return false;
  };

  const handleFinish = async (values) => {
    let newItem = { ...values };

    if (values.start_date && dayjs.isDayjs(values.start_date)) {
      newItem.start_date = values.start_date.format('YYYY-MM-DD');
    }
    if (values.end_date && dayjs.isDayjs(values.end_date)) {
      newItem.end_date = values.end_date.format('YYYY-MM-DD');
    }
    if (values.issue_date && dayjs.isDayjs(values.issue_date)) {
      newItem.issue_date = values.issue_date.format('YYYY-MM-DD');
    }
    if (values.expiry_date && dayjs.isDayjs(values.expiry_date)) {
      newItem.expiry_date = values.expiry_date.format('YYYY-MM-DD');
    }

    // Convert boolean checks to 1 or 0 for Frappe
    if (values.current_company !== undefined) newItem.current_company = values.current_company ? 1 : 0;
    if (values.reading !== undefined) newItem.reading = values.reading ? 1 : 0;
    if (values.writing !== undefined) newItem.writing = values.writing ? 1 : 0;
    if (values.speaking !== undefined) newItem.speaking = values.speaking ? 1 : 0;
    if (values.verified !== undefined) newItem.verified = values.verified ? 1 : 0;

    if (fileUrl) newItem.file = fileUrl;

    const currentList = Array.isArray(candidate?.[resourceType]) ? [...candidate[resourceType]] : [];
    
    let updatedList;
    if (isEdit && editIndex >= 0 && editIndex < currentList.length) {
      // Preserve row 'name' identifier on edit
      const existingRow = currentList[editIndex];
      updatedList = [...currentList];
      updatedList[editIndex] = {
        ...existingRow,
        ...newItem,
        name: existingRow?.name || existingRow?.id,
      };
    } else {
      updatedList = [...currentList, newItem];
    }

    try {
      await onSubmit({ resourceType, items: updatedList });
      message.success(t('candidate.messages.subresourceSuccess', 'Child record updated successfully.'));
      onClose();
    } catch (err) {
      const errMsg = typeof err === 'string' ? err : err?.message || err?.error?.message || t('candidate.messages.subresourceError', { type: resourceType });
      message.error(errMsg);
    }
  };

  const getTitle = () => {
    const actionKey = isEdit ? 'edit' : 'add';
    switch (resourceType) {
      case 'education':
        return isEdit ? t('candidate.actions.editEducation', 'Edit Education') : t('candidate.actions.addEducation', 'Add Education');
      case 'experience':
        return isEdit ? t('candidate.actions.editExperience', 'Edit Experience') : t('candidate.actions.addExperience', 'Add Experience');
      case 'skills':
        return isEdit ? t('candidate.actions.editSkill', 'Edit Skill') : t('candidate.actions.addSkill', 'Add Skill');
      case 'languages':
        return isEdit ? t('candidate.actions.editLanguage', 'Edit Language') : t('candidate.actions.addLanguage', 'Add Language');
      case 'certifications':
        return isEdit ? t('candidate.actions.editCertification', 'Edit Certification') : t('candidate.actions.addCertification', 'Add Certification');
      case 'documents':
        return isEdit ? t('candidate.actions.editDocument', 'Edit Document') : t('candidate.actions.addDocument', 'Add Document');
      default:
        return t('common.actions');
    }
  };

  return (
    <Modal
      title={getTitle()}
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {/* === EDUCATION === */}
        {resourceType === 'education' && (
          <>
            <Form.Item
              name="institution"
              label={t('candidate.subresource.institution', 'Institution')}
              rules={[{ required: true, message: t('candidate.subresource.institutionRequired', 'Institution is required') }]}
            >
              <Input placeholder="e.g. Stanford University" />
            </Form.Item>
            <Form.Item
              name="degree"
              label={t('candidate.subresource.degree', 'Degree / Qualification')}
              rules={[{ required: true, message: t('candidate.subresource.degreeRequired', 'Degree is required') }]}
            >
              <Input placeholder="e.g. Bachelor of Science" />
            </Form.Item>
            <Form.Item name="specialization" label={t('candidate.subresource.specialization', 'Specialization')}>
              <Input placeholder="e.g. Computer Science / Finance" />
            </Form.Item>
            <Form.Item name="start_date" label={t('candidate.subresource.startDate', 'Start Date')}>
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="end_date" label={t('candidate.subresource.endDate', 'End Date / Year')}>
              <Input placeholder="e.g. 2023 or YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="percentage__cgpa" label={t('candidate.subresource.grade', 'Percentage / CGPA')}>
              <Input placeholder="e.g. 3.8 / 85%" />
            </Form.Item>
          </>
        )}

        {/* === EXPERIENCE === */}
        {resourceType === 'experience' && (
          <>
            <Form.Item
              name="company"
              label={t('candidate.subresource.company', 'Company')}
              rules={[{ required: true, message: t('candidate.subresource.companyRequired', 'Company name is required') }]}
            >
              <Input placeholder="e.g. ABC Hospital / Acme Corp" />
            </Form.Item>
            <Form.Item
              name="designation"
              label={t('candidate.subresource.designation', 'Designation / Title')}
              rules={[{ required: true, message: t('candidate.subresource.designationRequired', 'Designation is required') }]}
            >
              <Input placeholder="e.g. Senior Nurse / Software Engineer" />
            </Form.Item>
            <Form.Item name="employment_type" label={t('candidate.fields.employmentType', 'Employment Type')}>
              <Select placeholder="Select employment type" allowClear>
                <Option value="Full Time">Full Time</Option>

                <Option value="Part Time">Part Time</Option>
                <Option value="Contract">Contract</Option>
                <Option value="Internship">Internship</Option>
                <Option value="Freelance">Freelance</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="start_date"
              label={t('candidate.subresource.startDate', 'Start Date')}
              rules={[{ required: true, message: t('candidate.subresource.startDateRequired', 'Start date is required') }]}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="end_date" label={t('candidate.subresource.endDateExperience', 'End Date')}>
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="current_company" valuePropName="checked">
              <Checkbox>{t('candidate.subresource.currentlyWorking', 'Currently working here')}</Checkbox>
            </Form.Item>
            <Form.Item name="responsibilities" label={t('candidate.subresource.responsibilities', 'Key Responsibilities')}>
              <Input.TextArea rows={3} placeholder="Summarize roles and key achievements" />
            </Form.Item>
          </>
        )}

        {/* === SKILLS === */}
        {resourceType === 'skills' && (
          <>
            <Form.Item
              name="skill"
              label={t('candidate.subresource.skillName', 'Skill Name')}
              rules={[{ required: true, message: t('candidate.subresource.skillNameRequired', 'Skill name is required') }]}
            >
              <Input placeholder="e.g. Patient Care, React.js, Python" />
            </Form.Item>
            <Form.Item name="experience_years" label={t('candidate.subresource.experienceYears', 'Experience (Years)')}>
              <InputNumber min={0} step={0.5} style={{ width: '100%' }} placeholder="3.5" />
            </Form.Item>
            <Form.Item name="proficiency" label={t('candidate.subresource.proficiency', 'Proficiency')}>
              <Select placeholder="Select proficiency" allowClear>
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Advanced">Advanced</Option>
                <Option value="Expert">Expert</Option>
              </Select>
            </Form.Item>
          </>
        )}

        {/* === LANGUAGES === */}
        {resourceType === 'languages' && (
          <>
            <Form.Item
              name="language"
              label={t('candidate.fields.language', 'Language')}
              rules={[{ required: true, message: t('candidate.subresource.languageRequired', 'Language is required') }]}
            >
              <Input placeholder="e.g. English, German, French, Hindi" />
            </Form.Item>
            <Form.Item name="reading" valuePropName="checked">
              <Checkbox>{t('candidate.subresource.reading', 'Can Read')}</Checkbox>
            </Form.Item>
            <Form.Item name="writing" valuePropName="checked">
              <Checkbox>{t('candidate.subresource.writing', 'Can Write')}</Checkbox>
            </Form.Item>
            <Form.Item name="speaking" valuePropName="checked">
              <Checkbox>{t('candidate.subresource.speaking', 'Can Speak')}</Checkbox>
            </Form.Item>
          </>
        )}

        {/* === CERTIFICATIONS === */}
        {resourceType === 'certifications' && (
          <>
            <Form.Item
              name="certification"
              label={t('candidate.subresource.certificationName', 'Certification Name')}
              rules={[{ required: true, message: t('candidate.subresource.certificationRequired', 'Certification name is required') }]}
            >
              <Input placeholder="e.g. AWS Certified Solutions Architect" />
            </Form.Item>
            <Form.Item name="issued_by" label={t('candidate.subresource.issuedBy', 'Issued By')}>
              <Input placeholder="e.g. Amazon Web Services, Cisco" />
            </Form.Item>
            <Form.Item name="issue_date" label={t('candidate.subresource.issueDate', 'Issue Date')}>
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="expiry_date" label={t('candidate.subresource.expiryDate', 'Expiry Date')}>
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="credential_url" label={t('candidate.subresource.credentialUrl', 'Credential / Verification URL')}>
              <Input placeholder="https://verify.certification.com/id/12345" />
            </Form.Item>
          </>
        )}

        {/* === DOCUMENTS === */}
        {resourceType === 'documents' && (
          <>
            <Form.Item
              name="document_type"
              label={t('candidate.subresource.documentType', 'Document Type')}
              rules={[{ required: true, message: t('candidate.subresource.documentTypeRequired', 'Document type is required') }]}
            >
              <Select placeholder="Select document type">
                <Option value="Passport">Passport</Option>
                <Option value="Visa">Visa</Option>
                <Option value="Driving License">Driving License</Option>
                <Option value="Certificate">Certificate</Option>
                <Option value="Resume">Resume</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item label={t('candidate.subresource.fileAttachment', 'File Attachment')}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Upload beforeUpload={handleFileUpload} showUploadList={false}>
                  <Button icon={<FiUpload />} loading={uploadingFile}>
                    {fileUrl ? t('candidate.actions.replaceFile', 'Replace File') : t('candidate.actions.uploadFile', 'Upload File (PDF/DOC)')}
                  </Button>
                </Upload>
                {fileUrl && (
                  <Text type="secondary" style={{ fontSize: '0.8rem' }}>
                    <FiFileText style={{ marginRight: 4 }} />
                    {fileUrl.split('/').pop()}
                  </Text>
                )}
              </Space>
            </Form.Item>
            <Form.Item name="verified" valuePropName="checked">
              <Checkbox>{t('candidate.subresource.verified', 'Document Verified')}</Checkbox>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default CandidateSubresourceModal;
