import React, { useEffect } from 'react';
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
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';

const { Option } = Select;

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

  useEffect(() => {
    if (visible) {
      if (candidate) {
        form.setFieldsValue({
          first_name: candidate.firstName || '',
          middle_name: candidate.middleName || '',
          last_name: candidate.lastName || '',
          email: candidate.email || '',
          mobile_no: candidate.mobileNo || '',
          alternate_mobile: candidate.alternateMobile || '',
          date_of_birth: candidate.dateOfBirth ? dayjs(candidate.dateOfBirth) : null,
          gender: candidate.gender || undefined,
          nationality: candidate.nationality || '',
          marital_status: candidate.maritalStatus || undefined,
          current_job_title: candidate.currentJobTitle || '',
          current_company: candidate.currentCompany || '',
          years_of_experience: candidate.yearsOfExperience || 0,
          notice_period: candidate.noticePeriod || 0,
          current_salary: candidate.currentSalary || null,
          expected_salary: candidate.expectedSalary || null,
          preferred_location: candidate.preferredLocation || '',
          profession: candidate.profession || '',
          employment_type: candidate.employmentType || '',
          address_line_1: candidate.addressLine1 || '',
          address_line_2: candidate.addressLine2 || '',
          city: candidate.city || '',
          state: candidate.state || '',
          country: candidate.country || 'India',
          postal_code: candidate.postalCode || '',
          passport_number: candidate.passportNumber || '',
          passport_expiry: candidate.passportExpiry ? dayjs(candidate.passportExpiry) : null,
          visa_status: candidate.visaStatus || undefined,
          work_permit: candidate.workPermit || false,
          status: candidate.status || 'Active',
          linkedin: candidate.linkedin || '',
          portfolio: candidate.portfolio || '',
          github: candidate.github || '',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          country: 'India',
          status: 'Active',
          years_of_experience: 0,
          notice_period: 0,
        });
      }
    }
  }, [visible, candidate, form]);

  const handleFinish = async (values) => {
    const payload = {
      ...values,
      date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
      passport_expiry: values.passport_expiry ? values.passport_expiry.format('YYYY-MM-DD') : null,
    };

    try {
      await onSubmit(payload);
      form.resetFields();
      onClose();
    } catch (err) {
      message.error(err.message || t('candidate.messages.validationError'));
    }
  };

  return (
    <Modal
      title={isEdit ? t('candidate.editCandidate') : t('candidate.addCandidate')}
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          country: 'India',
          status: 'Active',
          years_of_experience: 0,
          notice_period: 0,
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="first_name"
              label={t('candidate.fields.firstName')}
            rules={[{ required: true, message: t('candidate.validation.firstNameRequired') }]}
            >
              <Input placeholder="John" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="middle_name" label={t('candidate.fields.middleName')}>
              <Input placeholder="" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="last_name"
              label={t('candidate.fields.lastName')}
              rules={[{ required: true, message: t('candidate.validation.lastNameRequired') }]}
            >
              <Input placeholder="Doe" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label={t('candidate.fields.email')}
              rules={[
                { required: true, message: t('candidate.validation.emailRequired') },
                { type: 'email', message: t('candidate.validation.emailInvalid') },
              ]}
            >
              <Input placeholder="candidate@example.com" disabled={isEdit} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="mobile_no"
              label={t('candidate.fields.mobileNo')}
              rules={[{ required: true, message: t('candidate.validation.mobileRequired') }]}
            >
              <Input placeholder="+91 9876543210" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="date_of_birth"
              label={t('candidate.fields.dateOfBirth')}
              rules={[{ required: true, message: t('candidate.validation.dobRequired') }]}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="gender" label={t('candidate.fields.gender')}>
              <Select placeholder="Select gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="nationality" label={t('candidate.fields.nationality')}>
              <Input placeholder="Indian" />
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
          <Col xs={24} sm={8}>
            <Form.Item name="years_of_experience" label={t('candidate.fields.yearsOfExperience')}>
              <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="notice_period" label={t('candidate.fields.noticePeriod')}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="status" label={t('candidate.fields.status')}>
              <Select>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Archived">Archived</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

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
          <Col xs={24} sm={8}>
            <Form.Item
              name="city"
              label={t('candidate.fields.city')}
              rules={[{ required: true, message: t('candidate.validation.cityRequired') }]}
            >
              <Input placeholder="Mumbai" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="state"
              label={t('candidate.fields.state')}
              rules={[{ required: true, message: t('candidate.validation.stateRequired') }]}
            >
              <Input placeholder="Maharashtra" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="country" label={t('candidate.fields.country')}>
              <Input placeholder="India" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="passport_number" label={t('candidate.fields.passportNumber')}>
              <Input placeholder="P1234567" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="passport_expiry" label={t('candidate.fields.passportExpiry')}>
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="work_permit" valuePropName="checked" style={{ marginTop: '30px' }}>
              <Checkbox>{t('candidate.fields.workPermit')}</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CandidateFormModal;
