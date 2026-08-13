import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Switch,
  Space,
  Button,
  Divider,
  Typography,
  Spin,
  DatePicker,
} from 'antd';
import {
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiFileText,
  FiUsers,
  FiSend,
  FiSave,
  FiGlobe,
  FiBookOpen,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';
import jobApi from '../../../services/jobApi';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const LANGUAGE_LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => ({
  label: lvl,
  value: lvl,
}));

export const JobFormModal = ({
  visible,
  job,
  loading = false,
  savingDraft = false,
  publishing = false,
  onClose,
  onSaveDraft,
  onPublish,
  onUpdate,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const compensationType = Form.useWatch('compensation_type', form);
  const selectedDepartment = Form.useWatch('department', form);
  const selectedProfession = Form.useWatch('profession', form);

  // Dynamic Master Link Fields State
  const [departments, setDepartments] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [users, setUsers] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [countries, setCountries] = useState([]);
  const [tariffGroups, setTariffGroups] = useState([]);
  const [mastersLoading, setMastersLoading] = useState(false);

  const isEditing = Boolean(job && job.id);
  const isPublished = Boolean(job && (job.published || job.status === 'Open'));

  // Load Master Taxonomy Options from Frappe Backend
  const loadMasterOptions = useCallback(async (deptFilter = '', profFilter = '') => {
    setMastersLoading(true);
    try {
      const [deptRes, empRes, indRes, userRes, currRes, countryRes, profRes, tgRes] = await Promise.all([
        jobApi.getDepartments().catch(() => []),
        jobApi.getEmploymentTypes().catch(() => []),
        jobApi.getIndustries().catch(() => []),
        jobApi.getUsers().catch(() => []),
        jobApi.getCurrencies().catch(() => []),
        jobApi.getCountries().catch(() => []),
        jobApi.getProfessions(deptFilter).catch(() => []),
        jobApi.getTariffGroups(profFilter, deptFilter).catch(() => []),
      ]);

      if (Array.isArray(deptRes)) setDepartments(deptRes);
      if (Array.isArray(empRes)) setEmploymentTypes(empRes);
      if (Array.isArray(indRes)) setIndustries(indRes);
      if (Array.isArray(userRes)) setUsers(userRes);
      if (Array.isArray(currRes)) setCurrencies(currRes);
      if (Array.isArray(countryRes)) setCountries(countryRes);
      if (Array.isArray(profRes)) setProfessions(profRes);
      if (Array.isArray(tgRes)) setTariffGroups(tgRes);
    } catch (err) {
      console.error('Failed to fetch backend link field masters', err);
    } finally {
      setMastersLoading(false);
    }
  }, []);

  // Fetch professions & tariff groups dynamically when department / profession changes
  const handleDepartmentChange = async (value) => {
    form.setFieldsValue({ profession: undefined });
    try {
      const [profRes, tgRes] = await Promise.all([
        jobApi.getProfessions(value || ''),
        jobApi.getTariffGroups(selectedProfession || '', value || ''),
      ]);
      if (Array.isArray(profRes)) setProfessions(profRes);
      if (Array.isArray(tgRes)) setTariffGroups(tgRes);
    } catch (err) {
      setProfessions([]);
    }
  };

  const handleProfessionChange = async (value) => {
    try {
      const tgRes = await jobApi.getTariffGroups(value || '', selectedDepartment || '');
      if (Array.isArray(tgRes)) setTariffGroups(tgRes);
    } catch (err) {
      setTariffGroups([]);
    }
  };

  useEffect(() => {
    if (visible) {
      loadMasterOptions(job?.department || '', job?.profession || '');

      if (job) {
        form.setFieldsValue({
          job_title: job.jobTitle || '',
          job_code: job.jobCode || '',
          department: job.department || undefined,
          profession: job.profession || undefined,
          employment_type: job.employmentType || undefined,
          industry: job.industry || undefined,
          number_of_openings: job.numberOfOpenings || 1,
          hiring_manager: job.hiringManager || undefined,
          recruiter: job.recruiter || undefined,
          target_joining_date: job.targetJoiningDate ? dayjs(job.targetJoiningDate) : null,
          closing_date: job.closingDate ? dayjs(job.closingDate) : null,
          minimum_experience: job.minimumExperience || 0,
          maximum_experience: job.maximumExperience || 0,

          // Compensation
          compensation_type: job.compensationType || 'Salary Range',
          currency: job.currency || 'EUR',
          minimum_salary: job.minimumSalary,
          maximum_salary: job.maximumSalary,
          salary_negotiable: Boolean(job.salaryNegotiable),
          tariff_group: job.tariffGroup || undefined,
          entgeltgruppe: job.entgeltgruppe || '',

          // Location
          address: job.address || '',
          country: job.country || '',
          state: job.state || '',
          city: job.city || '',
          remote: Boolean(job.remote),
          hybrid: Boolean(job.hybrid),
          featured_job: Boolean(job.featuredJob),

          // Languages & Preferences
          german_level_required: job.germanLevelRequired || undefined,
          english_level_required: job.englishLevelRequired || undefined,
          other_language_requirements: job.otherLanguageRequirements || '',
          allow_international_candidates: job.allowInternationalCandidates ?? true,
          allow_domestic_candidates: job.allowDomesticCandidates ?? true,

          // Application Settings
          max_applicants_limit: job.maxApplicantsLimit || null,
          auto_close_on_limit: Boolean(job.autoCloseOnLimit),
          keywords: job.keywords || '',

          // Content
          job_summary: job.jobSummary || '',
          responsibilities: job.responsibilities || '',
          requirements: job.requirements || '',
          benefits: job.benefits || '',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          number_of_openings: 1,
          compensation_type: 'Salary Range',
          currency: 'EUR',
          minimum_experience: 0,
          maximum_experience: 5,
          remote: false,
          hybrid: false,
          featured_job: false,
          salary_negotiable: false,
          allow_international_candidates: true,
          allow_domestic_candidates: true,
          auto_close_on_limit: false,
        });
      }
    }
  }, [visible, job, form, loadMasterOptions]);

  const processFormValues = (rawValues) => {
    const values = { ...rawValues };
    if (values.target_joining_date && dayjs.isDayjs(values.target_joining_date)) {
      values.target_joining_date = values.target_joining_date.format('YYYY-MM-DD');
    }
    if (values.closing_date && dayjs.isDayjs(values.closing_date)) {
      values.closing_date = values.closing_date.format('YYYY-MM-DD');
    }
    return values;
  };

  const handleSaveDraftClick = async () => {
    try {
      const rawValues = form.getFieldsValue();
      const values = processFormValues(rawValues);
      await onSaveDraft(values);
    } catch (err) {
      // Ignore validation errors for draft saving
    }
  };

  const handleUpdateClick = async () => {
    try {
      const rawValues = await form.validateFields();
      const values = processFormValues(rawValues);
      if (job?.id) {
        await onUpdate(job.id, values);
      }
    } catch (err) {
      // Form validation failed
    }
  };

  const handlePublishClick = async () => {
    try {
      const rawValues = await form.validateFields();
      const values = processFormValues(rawValues);
      if (isEditing && job?.id) {
        await onUpdate(job.id, values);
        await onPublish(job.id);
      } else {
        await onPublish(values);
      }
    } catch (err) {
      // Form validation failed
    }
  };

  const isCollectiveAgreement =
    compensationType === 'Collective Agreement (Tarifvertrag)' ||
    compensationType === 'Collective Agreement';

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
            <FiBriefcase size={18} />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {isEditing ? t('jobs.form.editTitle') : t('jobs.form.createTitle')}
          </span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={880}
      destroyOnClose
      maskClosable={!loading && !publishing}
      footer={
        <Row justify="space-between" align="middle">
          <Col>
            {!isPublished && (
              <Button
                icon={<FiSave />}
                onClick={handleSaveDraftClick}
                loading={savingDraft}
                disabled={loading || publishing}
              >
                {t('jobs.saveDraft')}
              </Button>
            )}
          </Col>
          <Col>
            <Space>
              <Button onClick={onClose} disabled={loading || publishing}>
                {t('common.cancel')}
              </Button>

              {isEditing && (
                <Button
                  icon={<FiSave />}
                  onClick={handleUpdateClick}
                  loading={loading}
                  disabled={publishing}
                >
                  {t('common.save')}
                </Button>
              )}

              {!isPublished && (
                <Button
                  type="primary"
                  icon={<FiSend />}
                  onClick={handlePublishClick}
                  loading={publishing || loading}
                  style={{
                    backgroundColor: 'var(--brand-navy, #0f172a)',
                    borderColor: 'var(--brand-navy, #0f172a)',
                  }}
                >
                  {t('jobs.publishJob')}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      }
    >
      <Spin spinning={loading || mastersLoading}>
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
          style={{ marginTop: 16 }}
        >
          {/* Section 1: Basic Information */}
          <Divider orientation="left" style={{ margin: '12px 0 16px 0', fontSize: '0.9rem' }}>
            <Space>
              <FiBriefcase style={{ color: 'var(--brand-teal)' }} />
              <span>{t('jobs.form.sections.basic')}</span>
            </Space>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                name="job_title"
                label={t('jobs.form.fields.jobTitle')}
                rules={[{ required: true, message: t('jobs.form.validation.jobTitleRequired') }]}
              >
                <Input placeholder={t('jobs.form.placeholders.jobTitle')} size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="job_code"
                label={t('jobs.form.fields.jobCode')}
                tooltip={t('jobs.form.placeholders.jobCode')}
              >
                <Input placeholder="Auto-generated" disabled={isEditing} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="industry"
                label={t('jobs.form.fields.industry')}
                rules={[{ required: true, message: 'Industry is required.' }]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder={t('jobs.form.placeholders.industry')}
                  optionFilterProp="label"
                  options={industries.map((i) => ({
                    label: i.display_name || i.name,
                    value: i.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="keywords"
                label="Keywords"
                tooltip="Comma-separated search tags or keywords"
                rules={[{ required: true, message: 'Keywords are required.' }]}
              >
                <Input placeholder="e.g. Pflege, Nurse, Intensivmedizin, Shiftwork" />
              </Form.Item>
            </Col>
          </Row>

          {/* Section 2: Organization & Roles */}
          <Divider orientation="left" style={{ margin: '16px 0 16px 0', fontSize: '0.9rem' }}>
            <Space>
              <FiUsers style={{ color: 'var(--brand-teal)' }} />
              <span>{t('jobs.form.sections.organization')}</span>
            </Space>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="employment_type"
                label={t('jobs.form.fields.employmentType')}
                rules={[{ required: true, message: t('jobs.form.validation.employmentTypeRequired') }]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder={t('jobs.form.placeholders.employmentType')}
                  optionFilterProp="label"
                  options={employmentTypes.map((e) => ({
                    label: e.display_name || e.name,
                    value: e.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="department"
                label={t('jobs.form.fields.department')}
                rules={[{ required: true, message: 'Department is required.' }]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder={t('jobs.form.placeholders.department')}
                  optionFilterProp="label"
                  onChange={handleDepartmentChange}
                  options={departments.map((d) => ({
                    label: d.display_name || d.name,
                    value: d.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="profession"
                label={t('jobs.form.fields.profession')}
                rules={[{ required: true, message: 'Profession is required.' }]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder={t('jobs.form.placeholders.profession')}
                  optionFilterProp="label"
                  onChange={handleProfessionChange}
                  options={professions.map((p) => ({
                    label: p.display_name || p.name,
                    value: p.name,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Form.Item name="number_of_openings" label={t('jobs.form.fields.numberOfOpenings')}>
                <InputNumber min={1} max={999} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="hiring_manager" label={t('jobs.form.fields.hiringManager')}>
                <Select
                  showSearch
                  allowClear
                  placeholder={t('jobs.form.placeholders.hiringManager')}
                  optionFilterProp="label"
                  options={users.map((u) => ({
                    label: u.full_name || u.name,
                    value: u.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="recruiter" label={t('jobs.form.fields.recruiter')}>
                <Select
                  showSearch
                  allowClear
                  placeholder={t('jobs.form.placeholders.recruiter')}
                  optionFilterProp="label"
                  options={users.map((u) => ({
                    label: u.full_name || u.name,
                    value: u.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="target_joining_date" label="Target Joining Date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          {/* Section 3: Compensation & Experience */}
          <Divider orientation="left" style={{ margin: '16px 0 16px 0', fontSize: '0.9rem' }}>
            <Space>
              <FiDollarSign style={{ color: 'var(--brand-teal)' }} />
              <span>{t('jobs.form.sections.compensation')}</span>
            </Space>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="compensation_type"
                label="Compensation Type *"
                rules={[{ required: true, message: 'Please select a compensation type.' }]}
              >
                <Select
                  options={[
                    { label: 'Salary Range', value: 'Salary Range' },
                    { label: 'Collective Agreement (Tarifvertrag)', value: 'Collective Agreement (Tarifvertrag)' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          {isCollectiveAgreement ? (
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="tariff_group"
                  label="Tarifgruppe *"
                  tooltip="Backend Master Tariff Group"
                  rules={[{ required: true, message: 'Tarifgruppe is required.' }]}
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder="Select Tarifgruppe (e.g. TVöD-P, TV-L KR, AVR Caritas)"
                    optionFilterProp="label"
                    options={tariffGroups.map((tg) => ({
                      label: tg.category ? `${tg.display_name || tg.name} (${tg.category})` : (tg.display_name || tg.name),
                      value: tg.name,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="entgeltgruppe"
                  label="Entgeltgruppe *"
                  rules={[{ required: true, message: 'Entgeltgruppe is required.' }]}
                >
                  <Input placeholder="e.g. P7, E13, Group 4" />
                </Form.Item>
              </Col>
            </Row>
          ) : (
            <Row gutter={16}>
              <Col xs={24} sm={6}>
                <Form.Item
                  name="currency"
                  label={t('jobs.form.fields.currency')}
                  rules={[{ required: true, message: 'Currency is required.' }]}
                >
                  <Select
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    options={currencies.map((c) => ({
                      label: `${c.name}${c.currency_name ? ` (${c.currency_name})` : ''}`,
                      value: c.name,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item
                  name="minimum_salary"
                  label="Minimum Annual Salary *"
                  rules={[{ required: true, message: 'Minimum Annual Salary is required.' }]}
                >
                  <InputNumber
                    min={0}
                    step={1000}
                    formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item
                  name="maximum_salary"
                  label="Maximum Annual Salary *"
                  rules={[{ required: true, message: 'Maximum Annual Salary is required.' }]}
                >
                  <InputNumber
                    min={0}
                    step={1000}
                    formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={6} style={{ display: 'flex', alignItems: 'center', paddingTop: 12 }}>
                <Form.Item name="salary_negotiable" valuePropName="checked" noStyle>
                  <Switch size="small" />
                </Form.Item>
                <Text style={{ marginLeft: 8, fontSize: '0.85rem' }}>{t('jobs.form.fields.salaryNegotiable')}</Text>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col xs={12} sm={6}>
              <Form.Item name="minimum_experience" label={t('jobs.form.fields.minimumExperience')}>
                <InputNumber min={0} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item name="maximum_experience" label={t('jobs.form.fields.maximumExperience')}>
                <InputNumber min={0} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item name="max_applicants_limit" label="Max Applicants Limit">
                <InputNumber min={1} max={10000} style={{ width: '100%' }} placeholder="Unlimited" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} style={{ display: 'flex', alignItems: 'center', paddingTop: 12 }}>
              <Form.Item name="auto_close_on_limit" valuePropName="checked" noStyle>
                <Switch size="small" />
              </Form.Item>
              <Text style={{ marginLeft: 8, fontSize: '0.85rem' }}>Auto Close on Limit</Text>
            </Col>
          </Row>

          {/* Section 4: Location & Workplace Mode */}
          <Divider orientation="left" style={{ margin: '16px 0 16px 0', fontSize: '0.9rem' }}>
            <Space>
              <FiMapPin style={{ color: 'var(--brand-teal)' }} />
              <span>{t('jobs.form.sections.location')}</span>
            </Space>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item
                name="address"
                label="Address *"
                rules={[{ required: true, message: 'Address is required.' }]}
              >
                <Input placeholder="Street address or building details" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="city"
                label={t('jobs.form.fields.city')}
                rules={[{ required: true, message: 'City is required.' }]}
              >
                <Input placeholder="e.g. Berlin" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="state"
                label={t('jobs.form.fields.state')}
                rules={[{ required: true, message: 'State is required.' }]}
              >
                <Input placeholder="e.g. Bavaria / Berlin" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="country"
                label={t('jobs.form.fields.country')}
                rules={[{ required: true, message: 'Country is required.' }]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="e.g. Germany"
                  optionFilterProp="label"
                  options={countries.map((c) => ({
                    label: c.country_name || c.name,
                    value: c.name,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle" style={{ marginBottom: 12 }}>
            <Col xs={12} sm={8}>
              <Form.Item name="remote" valuePropName="checked" noStyle>
                <Switch size="small" />
              </Form.Item>
              <Text style={{ marginLeft: 8, fontSize: '0.85rem' }}>{t('jobs.form.fields.remote')}</Text>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item name="hybrid" valuePropName="checked" noStyle>
                <Switch size="small" />
              </Form.Item>
              <Text style={{ marginLeft: 8, fontSize: '0.85rem' }}>{t('jobs.form.fields.hybrid')}</Text>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item name="featured_job" valuePropName="checked" noStyle>
                <Switch size="small" />
              </Form.Item>
              <Text style={{ marginLeft: 8, fontSize: '0.85rem' }}>{t('jobs.form.fields.featuredJob')}</Text>
            </Col>
          </Row>

          {/* Section 5: Languages & Candidate Preferences */}
          <Divider orientation="left" style={{ margin: '16px 0 16px 0', fontSize: '0.9rem' }}>
            <Space>
              <FiGlobe style={{ color: 'var(--brand-teal)' }} />
              <span>Language Requirements & Preferences</span>
            </Space>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="german_level_required"
                label="German Level Required *"
                rules={[{ required: true, message: 'German level is required.' }]}
              >
                <Select placeholder="Select Level (A1-C2)" options={LANGUAGE_LEVEL_OPTIONS} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="english_level_required" label="English Level Required">
                <Select placeholder="Select Level (A1-C2)" options={LANGUAGE_LEVEL_OPTIONS} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="other_language_requirements" label="Other Language Requirements">
                <Input placeholder="e.g. Spanish B2 optional" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle" style={{ marginBottom: 12 }}>
            <Col xs={12} sm={12}>
              <Form.Item name="allow_domestic_candidates" valuePropName="checked" noStyle>
                <Switch size="small" />
              </Form.Item>
              <Text style={{ marginLeft: 8, fontSize: '0.85rem' }}>Allow Domestic Candidates</Text>
            </Col>
            <Col xs={12} sm={12}>
              <Form.Item name="allow_international_candidates" valuePropName="checked" noStyle>
                <Switch size="small" />
              </Form.Item>
              <Text style={{ marginLeft: 8, fontSize: '0.85rem' }}>Allow International Candidates</Text>
            </Col>
          </Row>

          {/* Section 6: Job Description & Details */}
          <Divider orientation="left" style={{ margin: '16px 0 16px 0', fontSize: '0.9rem' }}>
            <Space>
              <FiFileText style={{ color: 'var(--brand-teal)' }} />
              <span>{t('jobs.form.sections.details')}</span>
            </Space>
          </Divider>

          <Form.Item
            name="job_summary"
            label={t('jobs.form.fields.jobSummary')}
            rules={[{ required: true, message: t('jobs.form.validation.summaryRequired') }]}
          >
            <TextArea rows={3} placeholder={t('jobs.form.placeholders.jobSummary')} />
          </Form.Item>

          <Form.Item
            name="responsibilities"
            label={t('jobs.form.fields.responsibilities')}
            rules={[{ required: true, message: 'Responsibilities are required to publish this job opening.' }]}
          >
            <TextArea rows={3} placeholder={t('jobs.form.placeholders.responsibilities')} />
          </Form.Item>

          <Form.Item
            name="requirements"
            label={t('jobs.form.fields.requirements')}
            rules={[{ required: true, message: 'Requirements are required to publish this job opening.' }]}
          >
            <TextArea rows={3} placeholder={t('jobs.form.placeholders.requirements')} />
          </Form.Item>

          <Form.Item name="benefits" label={t('jobs.form.fields.benefits')}>
            <TextArea rows={2} placeholder={t('jobs.form.placeholders.benefits')} />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default JobFormModal;
