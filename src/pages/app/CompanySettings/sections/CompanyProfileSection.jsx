import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Upload,
  Typography,
  Divider,
  Tag,
  Spin,
} from 'antd';
import {
  FiBriefcase,
  FiMail,
  FiPhone,
  FiGlobe,
  FiMapPin,
  FiLinkedin,
  FiTwitter,
  FiFacebook,
  FiInstagram,
  FiUploadCloud,
  FiSave,
  FiCheckCircle,
  FiImage,
} from 'react-icons/fi';
import { useLanguage } from '../../../../hooks/useLanguage';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export const CompanyProfileSection = ({
  profile,
  loading,
  saving,
  uploadingLogo,
  uploadingBanner,
  onUpdateProfile,
  onUploadLogo,
  onUploadBanner,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();

  // Populate form when profile changes
  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        company_name: profile.company_name || profile.name || '',
        legal_name: profile.legal_name || '',
        company_code: profile.company_code || '',
        industry: profile.industry || '',
        email: profile.email || '',
        phone: profile.phone || '',
        alternate_phone: profile.alternate_phone || '',
        hr_email: profile.hr_email || '',
        support_email: profile.support_email || '',
        website: profile.website || '',
        description: profile.description || '',
        country: profile.country || '',
        state: profile.state || '',
        city: profile.city || '',
        address_line_1: profile.address_line_1 || '',
        address_line_2: profile.address_line_2 || '',
        postal_code: profile.postal_code || '',
        founded_year: profile.founded_year || null,
        company_size: profile.company_size || '',
        status: profile.status || 'Active',
        linkedin: profile.linkedin || profile.linkedin_url || '',
        twitter: profile.twitter || profile.twitter_url || '',
        facebook: profile.facebook || '',
        instagram: profile.instagram || '',
      });
    }
  }, [profile, form]);

  const handleFinish = (values) => {
    // Note: company_name is read-only according to rule #3
    const { company_name, ...updatableValues } = values;
    onUpdateProfile(updatableValues);
  };

  const handleLogoUpload = ({ file }) => {
    if (file) {
      onUploadLogo(file);
    }
  };

  const handleBannerUpload = ({ file }) => {
    if (file) {
      onUploadBanner(file);
    }
  };

  if (loading && !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>{t('common.loading', 'Loading company profile...')}</div>
      </div>
    );
  }

  const logoUrl = profile?.logo || profile?.company_logo || null;
  const bannerUrl = profile?.banner || profile?.company_banner || null;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading || saving}
    >
      {/* Header & Canonical Identity */}
      <Card size="small" style={{ marginBottom: '24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBriefcase style={{ color: 'var(--brand-teal, #1890ff)' }} />
              {t('companySettings.profile.title', 'Company Profile')}
            </Title>
            <Text type="secondary">
              {t('companySettings.profile.subtitle', 'Authoritative company identity, contact information, and branding assets.')}
            </Text>
          </div>
          <Button
            type="primary"
            icon={<FiSave />}
            htmlType="submit"
            loading={saving}
            style={{ backgroundColor: 'var(--brand-navy, #0f172a)' }}
          >
            {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Changes')}
          </Button>
        </div>
      </Card>

      {/* Media & Branding Assets Card */}
      <Card
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiImage /> {t('companySettings.profile.mediaAssets', 'Branding Media & Assets')}
          </span>
        }
        style={{ marginBottom: '24px', borderRadius: '8px' }}
      >
        <Row gutter={[24, 24]}>
          {/* Logo Uploader */}
          <Col xs={24} md={12}>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>
              {t('companySettings.profile.logo', 'Company Logo')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '8px',
                  border: '1px dashed #d9d9d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  backgroundColor: '#fafafa',
                }}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Company Logo"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Text type="secondary">{t('companySettings.profile.noLogo', 'No Logo')}</Text>
                )}
              </div>
              <div>
                <Upload
                  customRequest={handleLogoUpload}
                  showUploadList={false}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                >
                  <Button icon={<FiUploadCloud />} loading={uploadingLogo}>
                    {logoUrl ? t('companySettings.profile.replaceLogo', 'Replace Logo') : t('companySettings.profile.uploadLogo', 'Upload Logo')}
                  </Button>
                </Upload>
                <div style={{ marginTop: '6px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {t('companySettings.profile.logoHint', 'PNG, JPG, SVG or WEBP up to 5MB. Authoritative backend URL.')}
                  </Text>
                </div>
              </div>
            </div>
          </Col>

          {/* Banner Uploader */}
          <Col xs={24} md={12}>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>
              {t('companySettings.profile.banner', 'Company Banner Image')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  width: '100%',
                  height: '90px',
                  borderRadius: '8px',
                  border: '1px dashed #d9d9d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  backgroundColor: '#fafafa',
                }}
              >
                {bannerUrl ? (
                  <img
                    src={bannerUrl}
                    alt="Company Banner"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Text type="secondary">{t('companySettings.profile.noBanner', 'No Banner Uploaded')}</Text>
                )}
              </div>
              <Upload
                customRequest={handleBannerUpload}
                showUploadList={false}
                accept="image/png,image/jpeg,image/webp"
              >
                <Button icon={<FiUploadCloud />} loading={uploadingBanner}>
                  {bannerUrl ? t('companySettings.profile.replaceBanner', 'Replace Banner') : t('companySettings.profile.uploadBanner', 'Upload Banner')}
                </Button>
              </Upload>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Identity & Structure Card */}
      <Card
        title={t('companySettings.profile.identitySection', 'Company Identity')}
        style={{ marginBottom: '24px', borderRadius: '8px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="company_name"
              label={t('companySettings.profile.companyName', 'Company Name (Canonical ID)')}
              extra={t('companySettings.profile.readOnlyHint', 'Read-only system identifier')}
            >
              <Input disabled prefix={<FiBriefcase />} style={{ backgroundColor: '#f5f5f5' }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item name="legal_name" label={t('companySettings.profile.legalName', 'Legal Business Name')}>
              <Input placeholder="e.g. Acme Corporation GmbH" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item name="company_code" label={t('companySettings.profile.companyCode', 'Company Code / Registration')}>
              <Input placeholder="e.g. HRB-123456" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item name="industry" label={t('companySettings.profile.industry', 'Industry')}>
              <Input placeholder="e.g. Technology / Software" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item name="company_size" label={t('companySettings.profile.companySize', 'Company Size')}>
              <Select placeholder={t('companySettings.profile.selectSize', 'Select company size')}>
                <Option value="1-10">1-10 employees</Option>
                <Option value="11-50">11-50 employees</Option>
                <Option value="51-200">51-200 employees</Option>
                <Option value="201-500">201-500 employees</Option>
                <Option value="501-1000">501-1000 employees</Option>
                <Option value="1000+">1000+ employees</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item name="founded_year" label={t('companySettings.profile.foundedYear', 'Founded Year')}>
              <Input type="number" placeholder="e.g. 2018" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item name="status" label={t('companySettings.profile.status', 'Account Status')}>
              <Select disabled style={{ backgroundColor: '#f5f5f5' }}>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Suspended">Suspended</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Contact & Support Information */}
      <Card
        title={t('companySettings.profile.contactSection', 'Contact & Support')}
        style={{ marginBottom: '24px', borderRadius: '8px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="email"
              label={t('companySettings.profile.email', 'Primary Company Email')}
              rules={[{ type: 'email', message: t('auth.emailInvalid', 'Invalid email format') }]}
            >
              <Input prefix={<FiMail />} placeholder="info@company.com" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item name="hr_email" label={t('companySettings.profile.hrEmail', 'HR / Recruitment Email')}>
              <Input prefix={<FiMail />} placeholder="careers@company.com" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item name="support_email" label={t('companySettings.profile.supportEmail', 'Support Email')}>
              <Input prefix={<FiMail />} placeholder="support@company.com" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item name="phone" label={t('companySettings.profile.phone', 'Phone Number')}>
              <Input prefix={<FiPhone />} placeholder="+49 30 123456" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item name="alternate_phone" label={t('companySettings.profile.alternatePhone', 'Alternate Phone')}>
              <Input prefix={<FiPhone />} placeholder="+49 30 654321" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item name="website" label={t('companySettings.profile.website', 'Official Website')}>
              <Input prefix={<FiGlobe />} placeholder="https://company.com" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Location Details */}
      <Card
        title={t('companySettings.profile.locationSection', 'Headquarters Address')}
        style={{ marginBottom: '24px', borderRadius: '8px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item name="address_line_1" label={t('companySettings.profile.address1', 'Address Line 1')}>
              <Input prefix={<FiMapPin />} placeholder="123 Corporate Way" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="address_line_2" label={t('companySettings.profile.address2', 'Address Line 2')}>
              <Input prefix={<FiMapPin />} placeholder="Suite 400" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item name="city" label={t('companySettings.profile.city', 'City')}>
              <Input placeholder="Berlin" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item name="state" label={t('companySettings.profile.state', 'State / Region')}>
              <Input placeholder="Berlin" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item name="postal_code" label={t('companySettings.profile.postalCode', 'Postal Code')}>
              <Input placeholder="10115" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item name="country" label={t('companySettings.profile.country', 'Country')}>
              <Input placeholder="Germany" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Description & Social Links */}
      <Card
        title={t('companySettings.profile.aboutSocialSection', 'About & Social Profiles')}
        style={{ marginBottom: '24px', borderRadius: '8px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item name="description" label={t('companySettings.profile.description', 'Company Description / Bio')}>
              <TextArea rows={4} placeholder="Describe your company's mission, products, and hiring culture..." />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item name="linkedin" label="LinkedIn">
              <Input prefix={<FiLinkedin style={{ color: '#0077b5' }} />} placeholder="https://linkedin.com/company/..." />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item name="twitter" label="Twitter / X">
              <Input prefix={<FiTwitter style={{ color: '#1da1f2' }} />} placeholder="https://twitter.com/..." />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item name="facebook" label="Facebook">
              <Input prefix={<FiFacebook style={{ color: '#4267b2' }} />} placeholder="https://facebook.com/..." />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item name="instagram" label="Instagram">
              <Input prefix={<FiInstagram style={{ color: '#e1306c' }} />} placeholder="https://instagram.com/..." />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Bottom Save Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <Button
          type="primary"
          icon={<FiSave />}
          htmlType="submit"
          loading={saving}
          size="large"
          style={{ backgroundColor: 'var(--brand-navy, #0f172a)', padding: '0 32px' }}
        >
          {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Changes')}
        </Button>
      </div>
    </Form>
  );
};

export default CompanyProfileSection;
