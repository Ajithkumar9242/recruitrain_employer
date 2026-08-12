import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Checkbox, message } from 'antd';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';

const { Option } = Select;

export const CandidateSubresourceModal = ({
  visible,
  resourceType,
  candidate,
  loading,
  onClose,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, resourceType, form]);

  const handleFinish = async (values) => {
    let newItem = { ...values };

    if (values.start_date && dayjs.isDayjs(values.start_date)) {
      newItem.start_date = values.start_date.format('YYYY-MM-DD');
    }
    if (values.end_date && dayjs.isDayjs(values.end_date)) {
      newItem.end_date = values.end_date.format('YYYY-MM-DD');
    }

    const currentList = Array.isArray(candidate?.[resourceType]) ? candidate[resourceType] : [];
    const updatedList = [...currentList, newItem];

    try {
      await onSubmit({ resourceType, items: updatedList });
      message.success(t('candidate.messages.subresourceSuccess'));
      onClose();
    } catch (err) {
      message.error(err.message || t('candidate.messages.subresourceError', { type: resourceType }));
    }
  };

  const getTitle = () => {
    switch (resourceType) {
      case 'education':
        return t('candidate.actions.addEducation');
      case 'experience':
        return t('candidate.actions.addExperience');
      case 'skills':
        return t('candidate.actions.addSkill');
      case 'languages':
        return t('candidate.actions.addLanguage');
      case 'certifications':
        return t('candidate.actions.addCertification');
      case 'documents':
        return t('candidate.actions.addDocument');
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
              label={t('candidate.subresource.institution')}
              rules={[{ required: true, message: t('candidate.subresource.institutionRequired') }]}
            >
              <Input placeholder={t('candidate.subresource.institutionPlaceholder')} />
            </Form.Item>
            <Form.Item
              name="degree"
              label={t('candidate.subresource.degree')}
              rules={[{ required: true, message: t('candidate.subresource.degreeRequired') }]}
            >
              <Input placeholder={t('candidate.subresource.degreePlaceholder')} />
            </Form.Item>
            <Form.Item name="specialization" label={t('candidate.subresource.specialization')}>
              <Input placeholder={t('candidate.subresource.specializationPlaceholder')} />
            </Form.Item>
            <Form.Item name="start_date" label={t('candidate.subresource.startDate')}>
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="end_date" label={t('candidate.subresource.endDate')}>
              <Input placeholder={t('candidate.subresource.endDatePlaceholder')} />
            </Form.Item>
            <Form.Item name="percentage__cgpa" label={t('candidate.subresource.grade')}>
              <Input placeholder={t('candidate.subresource.gradePlaceholder')} />
            </Form.Item>
          </>
        )}

        {/* === EXPERIENCE === */}
        {resourceType === 'experience' && (
          <>
            <Form.Item
              name="company"
              label={t('candidate.subresource.company')}
              rules={[{ required: true, message: t('candidate.subresource.companyRequired') }]}
            >
              <Input placeholder={t('candidate.subresource.companyPlaceholder')} />
            </Form.Item>
            <Form.Item
              name="designation"
              label={t('candidate.subresource.designation')}
              rules={[{ required: true, message: t('candidate.subresource.designationRequired') }]}
            >
              <Input placeholder={t('candidate.subresource.designationPlaceholder')} />
            </Form.Item>
            <Form.Item
              name="start_date"
              label={t('candidate.subresource.startDate')}
              rules={[{ required: true, message: t('candidate.subresource.startDateRequired') }]}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="end_date" label={t('candidate.subresource.endDateExperience')}>
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="current_company" valuePropName="checked">
              <Checkbox>{t('candidate.subresource.currentlyWorking')}</Checkbox>
            </Form.Item>
            <Form.Item name="responsibilities" label={t('candidate.subresource.responsibilities')}>
              <Input.TextArea rows={3} placeholder={t('candidate.subresource.responsibilitiesPlaceholder')} />
            </Form.Item>
          </>
        )}

        {/* === SKILLS === */}
        {resourceType === 'skills' && (
          <>
            <Form.Item
              name="skill"
              label={t('candidate.subresource.skillName')}
              rules={[{ required: true, message: t('candidate.subresource.skillNameRequired') }]}
            >
              <Input placeholder={t('candidate.subresource.skillNamePlaceholder')} />
            </Form.Item>
            <Form.Item name="experience_years" label={t('candidate.subresource.experienceYears')}>
              <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="proficiency" label={t('candidate.subresource.proficiency')}>
              <Select placeholder={t('candidate.subresource.proficiencySelect')}>
                <Option value="Beginner">{t('candidate.subresource.beginner')}</Option>
                <Option value="Intermediate">{t('candidate.subresource.intermediate')}</Option>
                <Option value="Expert">{t('candidate.subresource.expert')}</Option>
              </Select>
            </Form.Item>
          </>
        )}

        {/* === LANGUAGES === */}
        {resourceType === 'languages' && (
          <>
            <Form.Item
              name="language"
              label={t('candidate.fields.language', { defaultValue: 'Language' })}
              rules={[{ required: true, message: t('candidate.subresource.skillNameRequired', { defaultValue: 'Language is required' }) }]}
            >
              <Input placeholder="e.g. English, German, Hindi" />
            </Form.Item>
            <Form.Item name="proficiency" label={t('candidate.subresource.proficiency')}>
              <Select placeholder={t('candidate.subresource.proficiencySelect')}>
                <Option value="Native">{t('candidate.subresource.native', { defaultValue: 'Native' })}</Option>
                <Option value="Fluent">{t('candidate.subresource.fluent', { defaultValue: 'Fluent' })}</Option>
                <Option value="Intermediate">{t('candidate.subresource.intermediate')}</Option>
                <Option value="Basic">{t('candidate.subresource.beginner')}</Option>
              </Select>
            </Form.Item>
          </>
        )}

        {/* === CERTIFICATIONS === */}
        {resourceType === 'certifications' && (
          <>
            <Form.Item
              name="certification_name"
              label={t('candidate.subresource.certificationName', { defaultValue: 'Certification Name' })}
              rules={[{ required: true, message: t('candidate.subresource.certificationRequired', { defaultValue: 'Certification name is required' }) }]}
            >
              <Input placeholder="e.g. AWS Certified Solutions Architect" />
            </Form.Item>
            <Form.Item name="issuing_organization" label={t('candidate.subresource.issuingOrg', { defaultValue: 'Issuing Organization' })}>
              <Input placeholder="e.g. Amazon Web Services" />
            </Form.Item>
            <Form.Item name="issue_date" label={t('candidate.subresource.startDate')}>
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="expiry_date" label={t('candidate.subresource.endDateExperience')}>
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="credential_id" label={t('candidate.subresource.credentialId', { defaultValue: 'Credential ID' })}>
              <Input placeholder="e.g. ABC-12345" />
            </Form.Item>
          </>
        )}

        {/* === DOCUMENTS === */}
        {resourceType === 'documents' && (
          <>
            <Form.Item
              name="document_type"
              label={t('candidate.subresource.documentType')}
              rules={[{ required: true, message: t('candidate.subresource.documentTypeRequired') }]}
            >
              <Select placeholder={t('candidate.subresource.documentTypeSelect')}>
                <Option value="Passport">{t('candidate.subresource.passport')}</Option>
                <Option value="Visa">{t('candidate.subresource.visa')}</Option>
                <Option value="Work Permit">{t('candidate.subresource.workPermitDoc')}</Option>
                <Option value="Degree Certificate">{t('candidate.subresource.degreeCertificate')}</Option>
                <Option value="Other">{t('candidate.subresource.other')}</Option>
              </Select>
            </Form.Item>
            <Form.Item name="file" label={t('candidate.subresource.fileUrl')}>
              <Input placeholder={t('candidate.subresource.fileUrlPlaceholder')} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default CandidateSubresourceModal;
