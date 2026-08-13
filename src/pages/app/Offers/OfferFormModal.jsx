import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Row,
  Col,
  Space,
  Button,
  Upload,
  Typography,
  Spin,
  Alert,
  message,
  Card,
  Tag,
} from 'antd';
import {
  FiAward,
  FiUpload,
  FiFileText,
  FiExternalLink,
  FiTrash2,
  FiUser,
  FiBriefcase,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';
import jobApplicationApi from '../../../services/jobApplicationApi';
import candidateApi from '../../../services/candidateApi';
import jobApi from '../../../services/jobApi';
import offerApi from '../../../services/offerApi';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const OFFER_STATUS_OPTIONS = [
  'Draft',
  'Pending Approval',
  'Approved',
  'Sent',
  'Accepted',
  'Rejected',
  'Withdrawn',
  'Expired',
];

const DEFAULT_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'CHF'];
const DEFAULT_EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];

export const OfferFormModal = ({
  visible,
  offer = null,
  saving = false,
  onClose,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const isEdit = Boolean(offer?.id || offer?.name);

  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState(DEFAULT_EMPLOYMENT_TYPES);
  const [users, setUsers] = useState([]);
  const [currencies, setCurrencies] = useState(DEFAULT_CURRENCIES);

  const [mastersLoading, setMastersLoading] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [uploadingOfferLetter, setUploadingOfferLetter] = useState(false);
  const [offerLetterUrl, setOfferLetterUrl] = useState('');
  const [formError, setFormError] = useState(null);

  // Load master data (Job Applications, Candidates, Jobs, Users, Employment Types, Currencies)
  const loadMasterData = useCallback(async () => {
    setMastersLoading(true);
    try {
      const [appRes, candRes, jobRes, empTypeRes, usersRes, currRes] = await Promise.all([
        jobApplicationApi.listApplications({ pageSize: 100 }).catch(() => null),
        candidateApi.listCandidates({ pageSize: 100 }).catch(() => null),
        jobApi.listJobs({ pageSize: 100 }).catch(() => null),
        jobApi.getEmploymentTypes().catch(() => []),
        jobApi.getUsers().catch(() => []),
        jobApi.getCurrencies().catch(() => []),
      ]);

      // Normalize Applications
      const rawAppItems =
        appRes?.items ||
        appRes?.data?.items ||
        appRes?.data ||
        appRes?.message?.data ||
        appRes?.message ||
        [];
      setApplications(Array.isArray(rawAppItems) ? rawAppItems : []);

      // Normalize Candidates
      const rawCandItems =
        candRes?.data?.items ||
        candRes?.data ||
        candRes?.message?.data ||
        candRes?.message?.items ||
        candRes?.message ||
        candRes?.items ||
        [];
      setCandidates(Array.isArray(rawCandItems) ? rawCandItems : []);

      // Normalize Jobs
      const rawJobItems =
        jobRes?.items ||
        jobRes?.data?.items ||
        jobRes?.data ||
        jobRes?.message?.data ||
        jobRes?.message ||
        [];
      setJobs(Array.isArray(rawJobItems) ? rawJobItems : []);

      // Normalize Employment Types
      const rawEmpTypes = Array.isArray(empTypeRes)
        ? empTypeRes
        : empTypeRes?.data || empTypeRes?.items || empTypeRes?.message?.data || [];
      if (Array.isArray(rawEmpTypes) && rawEmpTypes.length > 0) {
        const typeNames = rawEmpTypes.map((t) => t.display_name || t.name || t.employment_type_name || String(t));
        setEmploymentTypes(typeNames);
      }

      // Normalize Users
      const rawUserItems = Array.isArray(usersRes)
        ? usersRes
        : usersRes?.data || usersRes?.items || usersRes?.message?.data || [];
      setUsers(Array.isArray(rawUserItems) ? rawUserItems : []);

      // Normalize Currencies
      const rawCurrItems = Array.isArray(currRes)
        ? currRes
        : currRes?.data || currRes?.items || currRes?.message?.data || [];
      if (Array.isArray(rawCurrItems) && rawCurrItems.length > 0) {
        const currNames = rawCurrItems.map((c) => c.name || c.currency_name || String(c));
        setCurrencies(currNames);
      }
    } catch (err) {
      console.error('Error loading master records for Offer Form:', err);
    } finally {
      setMastersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setFormError(null);
      loadMasterData();

      if (offer) {
        const initialAppId = offer.jobApplication || offer.jobApplicationId || offer.job_application;
        setSelectedAppId(initialAppId);
        setOfferLetterUrl(offer.offerLetter || offer.offer_letter || '');

        form.setFieldsValue({
          jobApplication: initialAppId,
          offeredSalary: offer.offeredSalary !== undefined && offer.offeredSalary !== null ? offer.offeredSalary : offer.offered_salary,
          currency: offer.currency || 'USD',
          joiningDate: offer.joiningDate || offer.joining_date ? dayjs(offer.joiningDate || offer.joining_date) : null,
          probationPeriodMonths: offer.probationPeriodMonths !== undefined && offer.probationPeriodMonths !== null ? offer.probationPeriodMonths : offer.probation_period_months,
          offerDate: offer.offerDate || offer.offer_date ? dayjs(offer.offerDate || offer.offer_date) : dayjs(),
          expiryDate: offer.expiryDate || offer.expiry_date ? dayjs(offer.expiryDate || offer.expiry_date) : null,
          employmentType: offer.employmentType || offer.employment_type || undefined,
          reportingManager: offer.reportingManager || offer.reporting_manager || undefined,
          offerStatus: offer.offerStatus || offer.offer_status || offer.status || 'Draft',
          responseDate: offer.responseDate || offer.response_date ? dayjs(offer.responseDate || offer.response_date) : null,
          candidateRemarks: offer.candidateRemarks || offer.candidate_remarks || '',
          offerLetter: offer.offerLetter || offer.offer_letter || '',
          notes: offer.notes || '',
        });
      } else {
        setSelectedAppId(null);
        setOfferLetterUrl('');
        form.resetFields();
        form.setFieldsValue({
          currency: 'USD',
          offerStatus: 'Draft',
          offerDate: dayjs(),
        });
      }
    }
  }, [visible, offer, form, loadMasterData]);

  // Derived relationship logic
  const selectedApp = applications.find(
    (a) => String(a.name || a.id || a.jobApplicationId) === String(selectedAppId)
  );

  // Maps for display lookups
  const candidateMap = new Map();
  candidates.forEach((c) => {
    const key = c.name || c.candidate_id || c.id;
    const name = c.full_name || (c.first_name ? `${c.first_name} ${c.last_name || ''}`.trim() : key);
    candidateMap.set(key, name);
  });

  const jobMap = new Map();
  jobs.forEach((j) => {
    const key = j.name || j.job_id || j.id;
    const title = j.job_title || j.title || key;
    jobMap.set(key, title);
  });

  // Extract resolved candidate, job opening, company
  const resolvedCandidateId = offer?.candidate || offer?.candidateId || selectedApp?.candidate || selectedApp?.candidateId || '';
  const resolvedCandidateName = candidateMap.get(resolvedCandidateId) || selectedApp?.candidateName || resolvedCandidateId || '-';

  const resolvedJobOpeningId = offer?.jobOpening || offer?.jobOpeningId || selectedApp?.jobOpening || selectedApp?.jobOpeningId || '';
  const resolvedJobTitle = jobMap.get(resolvedJobOpeningId) || selectedApp?.jobTitle || resolvedJobOpeningId || '-';

  const resolvedCompany = offer?.company || selectedApp?.company || '';

  const handleAppChange = (val) => {
    setSelectedAppId(val);
  };

  const handleFileUpload = async ({ file, onSuccess, onError }) => {
    setUploadingOfferLetter(true);
    try {
      const fileUrl = await offerApi.uploadOfferLetter(file, offer?.id || offer?.name);
      if (fileUrl) {
        setOfferLetterUrl(fileUrl);
        form.setFieldsValue({ offerLetter: fileUrl });
        message.success(t('offers.messages.uploadSuccess', 'Offer letter file uploaded successfully.'));
        onSuccess(fileUrl);
      } else {
        throw new Error('No file URL returned from server.');
      }
    } catch (err) {
      const msg = err.message || t('offers.messages.uploadError', 'Failed to upload offer letter.');
      message.error(msg);
      onError(err);
    } finally {
      setUploadingOfferLetter(false);
    }
  };

  const handleRemoveOfferLetter = () => {
    setOfferLetterUrl('');
    form.setFieldsValue({ offerLetter: '' });
  };

  const handleFinish = async (values) => {
    setFormError(null);
    try {
      const payload = {
        jobApplication: values.jobApplication || selectedAppId,
        candidate: resolvedCandidateId || undefined,
        jobOpening: resolvedJobOpeningId || undefined,
        company: resolvedCompany || undefined,
        offeredSalary: values.offeredSalary !== undefined && values.offeredSalary !== null ? Number(values.offeredSalary) : undefined,
        currency: values.currency || 'USD',
        joiningDate: values.joiningDate ? values.joiningDate.format('YYYY-MM-DD') : undefined,
        probationPeriodMonths: values.probationPeriodMonths !== undefined && values.probationPeriodMonths !== null ? Number(values.probationPeriodMonths) : undefined,
        offerDate: values.offerDate ? values.offerDate.format('YYYY-MM-DD') : undefined,
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : undefined,
        employmentType: values.employmentType || undefined,
        reportingManager: values.reportingManager || undefined,
        offerStatus: values.offerStatus || 'Draft',
        responseDate: values.responseDate ? values.responseDate.format('YYYY-MM-DD') : undefined,
        candidateRemarks: values.candidateRemarks || '',
        offerLetter: offerLetterUrl || values.offerLetter || '',
        notes: values.notes || '',
      };

      await onSubmit(payload);
    } catch (err) {
      const errMsg = typeof err === 'string' ? err : err?.message || 'Failed to submit offer form.';
      setFormError(errMsg);
    }
  };

  return (
    <Modal
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
            <FiAward size={18} />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {isEdit ? t('offers.form.editTitle', 'Edit Offer') : t('offers.form.createTitle', 'Create Offer')}
          </span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={720}
      maskClosable={!saving && !uploadingOfferLetter}
    >
      <Spin spinning={mastersLoading}>
        {formError && (
          <Alert
            type="error"
            message={t('common.error', 'Submission Error')}
            description={formError}
            showIcon
            closable
            onClose={() => setFormError(null)}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {/* Job Application Selector / Relationship Info */}
          {!isEdit ? (
            <Form.Item
              name="jobApplication"
              label={t('offers.form.jobApplicationLabel', 'Job Application')}
              rules={[
                {
                  required: true,
                  message: t('offers.form.jobApplicationRequired', 'Please select a real Job Application.'),
                },
              ]}
            >
              <Select
                showSearch
                placeholder={t('offers.form.selectJobApp', 'Select Job Application (#ID — Candidate — Job — Stage)')}
                onChange={handleAppChange}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children || '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {applications.map((app) => {
                  const appId = String(app.name || app.id || app.jobApplicationId);
                  const candId = app.candidate || app.candidateId;
                  const candName = app.candidateName || candidateMap.get(candId) || candId || 'Candidate';
                  const jId = app.jobOpening || app.jobOpeningId;
                  const jTitle = app.jobTitle || jobMap.get(jId) || jId || 'Job Opening';
                  const stage = app.currentStage || app.status || 'Application';

                  return (
                    <Option key={appId} value={appId}>
                      #{appId} — {candName} — {jTitle} — {stage}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          ) : null}

          {/* Derived Relationships Summary Banner */}
          {(selectedAppId || isEdit) && (
            <Card
              size="small"
              style={{
                marginBottom: 16,
                backgroundColor: 'var(--bg-subtle, #f8fafc)',
                borderColor: '#e2e8f0',
                borderRadius: 8,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8, color: '#334155', fontSize: '0.85rem' }}>
                <FiUser style={{ marginRight: 6 }} /> Authoritative Relationships (Resolved from Job Application):
              </div>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '0.8rem' }}>Candidate:</Text>{' '}
                  <Text strong style={{ fontSize: '0.85rem' }}>{resolvedCandidateName}</Text>{' '}
                  {resolvedCandidateId && <Tag color="blue" style={{ fontSize: '0.75rem' }}>{resolvedCandidateId}</Tag>}
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '0.8rem' }}>Job Opening:</Text>{' '}
                  <Text strong style={{ fontSize: '0.85rem' }}>{resolvedJobTitle}</Text>{' '}
                  {resolvedJobOpeningId && <Tag color="cyan" style={{ fontSize: '0.75rem' }}>{resolvedJobOpeningId}</Tag>}
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '0.8rem' }}>Job Application ID:</Text>{' '}
                  <Text copyable style={{ fontSize: '0.85rem' }}>{selectedAppId || '-'}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: '0.8rem' }}>Company:</Text>{' '}
                  <Text strong style={{ fontSize: '0.85rem' }}>{resolvedCompany || 'Session Scoped'}</Text>
                </Col>
              </Row>
            </Card>
          )}

          {/* Compensation Section */}
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiDollarSign style={{ color: 'var(--brand-teal, #1890ff)' }} /> Compensation
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="offeredSalary"
                label={t('offers.form.offeredSalaryLabel', 'Offered Salary')}
                rules={[{ required: true, message: 'Offered Salary is required.' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="e.g. 85000"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="currency"
                label={t('offers.form.currencyLabel', 'Currency')}
                rules={[{ required: true, message: 'Currency is required.' }]}
              >
                <Select placeholder="Select currency">
                  {currencies.map((curr) => (
                    <Option key={curr} value={curr}>
                      {curr}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="joiningDate"
                label={t('offers.form.joiningDateLabel', 'Joining Date')}
                rules={[{ required: true, message: 'Joining Date is required.' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Select joining date" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="probationPeriodMonths"
                label={t('offers.form.probationLabel', 'Probation Period (Months)')}
              >
                <InputNumber style={{ width: '100%' }} min={0} max={36} placeholder="e.g. 3" />
              </Form.Item>
            </Col>
          </Row>

          {/* Offer Details Section */}
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 12, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiBriefcase style={{ color: 'var(--brand-teal, #1890ff)' }} /> Offer Details
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="offerDate" label={t('offers.form.offerDateLabel', 'Offer Date')}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Select offer date" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="expiryDate" label={t('offers.form.expiryDateLabel', 'Expiry Date')}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Select expiry date" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="employmentType" label={t('offers.form.employmentTypeLabel', 'Employment Type')}>
                <Select placeholder="Select employment type" allowClear>
                  {employmentTypes.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="reportingManager" label={t('offers.form.reportingManagerLabel', 'Reporting Manager')}>
                <Select
                  showSearch
                  allowClear
                  placeholder="Select Reporting Manager (User)"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    String(option?.children || '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {users.map((u) => {
                    const uVal = u.name;
                    const uLabel = u.full_name ? `${u.full_name} (${u.name})` : u.name;
                    return (
                      <Option key={uVal} value={uVal}>
                        {uLabel}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Candidate Response Section */}
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 12, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiCheckCircle style={{ color: 'var(--brand-teal, #1890ff)' }} /> Candidate Response
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="offerStatus" label={t('offers.table.offerStatus', 'Offer Status')}>
                <Select placeholder="Select status">
                  {OFFER_STATUS_OPTIONS.map((status) => (
                    <Option key={status} value={status}>
                      {status}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="responseDate" label={t('offers.drawer.responseDate', 'Response Date')}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Select response date" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="candidateRemarks" label={t('offers.form.candidateRemarksLabel', 'Candidate Remarks')}>
            <TextArea rows={2} placeholder="Remarks provided by candidate..." />
          </Form.Item>

          {/* Offer Letter File Upload Section */}
          <Form.Item label={t('offers.form.offerLetterLabel', 'Offer Letter Document (Attachment)')}>
            {offerLetterUrl ? (
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
                      {offerLetterUrl.split('/').pop()}
                    </Text>
                    <div>
                      <a href={offerLetterUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', marginRight: 12 }}>
                        <FiExternalLink style={{ marginRight: 4 }} /> View
                      </a>
                      <a href={offerLetterUrl} download style={{ fontSize: '0.8rem' }}>
                        Download
                      </a>
                    </div>
                  </div>
                </Space>
                <Space>
                  <Upload customRequest={handleFileUpload} showUploadList={false}>
                    <Button size="small" icon={<FiUpload />}>
                      Replace
                    </Button>
                  </Upload>
                  <Button size="small" danger icon={<FiTrash2 />} onClick={handleRemoveOfferLetter} />
                </Space>
              </div>
            ) : (
              <Upload customRequest={handleFileUpload} showUploadList={false}>
                <Button icon={<FiUpload />} loading={uploadingOfferLetter}>
                  Upload Offer Letter File (PDF / DOC)
                </Button>
              </Upload>
            )}
          </Form.Item>

          <Form.Item name="notes" label={t('offers.form.notesLabel', 'Internal Notes')}>
            <TextArea rows={2} placeholder="Internal notes regarding compensation, approvals, or terms..." />
          </Form.Item>

          {/* Form Action Footer */}
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={onClose} disabled={saving || uploadingOfferLetter}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="primary" htmlType="submit" loading={saving} disabled={uploadingOfferLetter}>
                {isEdit ? t('common.save', 'Save Changes') : t('offers.form.submit', 'Create Offer')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default OfferFormModal;
