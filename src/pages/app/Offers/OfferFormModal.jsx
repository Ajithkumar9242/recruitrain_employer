import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Row,
  Col,
  Divider,
} from 'antd';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';

const { Option } = Select;
const { TextArea } = Input;

export const OfferFormModal = ({
  visible,
  offer = null,
  saving = false,
  onClose,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const isEdit = Boolean(offer?.id);

  useEffect(() => {
    if (visible) {
      if (offer) {
        form.setFieldsValue({
          jobApplication: offer.jobApplication || offer.jobApplicationId,
          offeredSalary: offer.offeredSalary,
          currency: offer.currency || 'USD',
          joiningDate: offer.joiningDate ? dayjs(offer.joiningDate) : null,
          probationPeriodMonths: offer.probationPeriodMonths,
          offerDate: offer.offerDate ? dayjs(offer.offerDate) : null,
          expiryDate: offer.expiryDate ? dayjs(offer.expiryDate) : null,
          employmentType: offer.employmentType,
          reportingManager: offer.reportingManager,
          candidateRemarks: offer.candidateRemarks,
          offerLetter: offer.offerLetter,
          notes: offer.notes,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          currency: 'USD',
          offerDate: dayjs(),
        });
      }
    }
  }, [visible, offer, form]);

  const handleFinish = (values) => {
    const payload = {
      jobApplication: values.jobApplication,
      offeredSalary: values.offeredSalary !== undefined && values.offeredSalary !== null ? Number(values.offeredSalary) : undefined,
      currency: values.currency,
      joiningDate: values.joiningDate ? values.joiningDate.format('YYYY-MM-DD') : undefined,
      probationPeriodMonths: values.probationPeriodMonths !== undefined && values.probationPeriodMonths !== null ? Number(values.probationPeriodMonths) : undefined,
      offerDate: values.offerDate ? values.offerDate.format('YYYY-MM-DD') : undefined,
      expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : undefined,
      employmentType: values.employmentType,
      reportingManager: values.reportingManager,
      candidateRemarks: values.candidateRemarks,
      offerLetter: values.offerLetter,
      notes: values.notes,
    };

    onSubmit(payload);
  };

  return (
    <Modal
      title={isEdit ? t('offers.form.editTitle', 'Edit Offer') : t('offers.form.createTitle', 'Create Offer')}
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={saving}
      destroyOnClose
      width={680}
      okText={isEdit ? t('common.save', 'Save') : t('offers.form.submit', 'Create Offer')}
      cancelText={t('common.cancel', 'Cancel')}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ currency: 'USD' }}
      >
        {/* Parent Job Application Reference (Required for Create, Immutable for Edit) */}
        {!isEdit ? (
          <Form.Item
            name="jobApplication"
            label={t('offers.form.jobApplicationLabel', 'Job Application ID')}
            rules={[
              {
                required: true,
                message: t('offers.form.jobApplicationRequired', 'Job Application ID is required'),
              },
            ]}
          >
            <Input placeholder={t('offers.form.jobApplicationPlaceholder', 'e.g. HR-APP-2026-00001')} />
          </Form.Item>
        ) : (
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={12}>
              <strong>{t('offers.table.candidate', 'Candidate')}:</strong> {offer.candidate}
            </Col>
            <Col span={12}>
              <strong>{t('offers.drawer.jobAppRef', 'Job Application')}:</strong> {offer.jobApplication}
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="offeredSalary"
              label={t('offers.form.offeredSalaryLabel', 'Offered Salary')}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="e.g. 85000"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="currency"
              label={t('offers.form.currencyLabel', 'Currency')}
            >
              <Select placeholder="Select currency">
                <Option value="USD">USD ($)</Option>
                <Option value="EUR">EUR (€)</Option>
                <Option value="GBP">GBP (£)</Option>
                <Option value="INR">INR (₹)</Option>
                <Option value="CAD">CAD ($)</Option>
                <Option value="AUD">AUD ($)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="employmentType"
              label={t('offers.form.employmentTypeLabel', 'Employment Type')}
            >
              <Select placeholder="Select type" allowClear>
                <Option value="Full-time">Full-time</Option>
                <Option value="Part-time">Part-time</Option>
                <Option value="Contract">Contract</Option>
                <Option value="Internship">Internship</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="probationPeriodMonths"
              label={t('offers.form.probationLabel', 'Probation Period (Months)')}
            >
              <InputNumber style={{ width: '100%' }} min={0} max={24} placeholder="e.g. 3" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="offerDate"
              label={t('offers.form.offerDateLabel', 'Offer Date')}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="expiryDate"
              label={t('offers.form.expiryDateLabel', 'Expiry Date')}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="joiningDate"
              label={t('offers.form.joiningDateLabel', 'Target Joining Date')}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="reportingManager"
              label={t('offers.form.reportingManagerLabel', 'Reporting Manager')}
            >
              <Input placeholder="e.g. manager@company.com" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="offerLetter"
          label={t('offers.form.offerLetterLabel', 'Offer Letter Document URL')}
        >
          <Input placeholder="https://... or /files/offer_letter.pdf" />
        </Form.Item>

        <Form.Item
          name="candidateRemarks"
          label={t('offers.form.candidateRemarksLabel', 'Candidate Remarks')}
        >
          <TextArea rows={2} placeholder="Remarks provided by candidate..." />
        </Form.Item>

        <Form.Item
          name="notes"
          label={t('offers.form.notesLabel', 'Internal Notes')}
        >
          <TextArea rows={2} placeholder="Add internal notes regarding compensation or approval..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OfferFormModal;
