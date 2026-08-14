import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Form,
  Input,
  Avatar,
  Tag,
  Badge,
  Spin,
  Alert,
  Descriptions,
  Space,
  App as AntApp,
} from 'antd';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiMapPin,
  FiGlobe,
  FiShield,
  FiCheckCircle,
  FiEdit2,
  FiSave,
  FiX,
  FiCamera,
  FiTrash2,
  FiLock,
  FiInfo,
  FiClock,
  FiActivity,
} from 'react-icons/fi';
import { useProfile } from '../../../hooks/useProfile';
import { useLanguage } from '../../../hooks/useLanguage';

const { Title, Text, Paragraph } = Typography;

const formatBooleanPermission = (val) => {
  if (val === true || val === 1) return <Tag color="green">Yes</Tag>;
  if (val === false || val === 0) return <Tag color="red">No</Tag>;
  return <Text type="secondary">Not available</Text>;
};

const formatNotifPrefs = (prefs) => {
  if (!prefs) return <Text type="secondary">Not available</Text>;
  let parsed = prefs;
  if (typeof prefs === 'string') {
    try {
      parsed = JSON.parse(prefs);
    } catch (e) {
      return <Text>{prefs}</Text>;
    }
  }
  if (typeof parsed === 'object' && parsed !== null) {
    const keys = Object.keys(parsed);
    if (keys.length === 0) return <Text type="secondary">Not available</Text>;
    return (
      <Space direction="vertical" size={2}>
        {keys.map((k) => (
          <Text key={k} style={{ fontSize: '0.85rem' }}>
            <strong>{k}:</strong> {String(parsed[k])}
          </Text>
        ))}
      </Space>
    );
  }
  return <Text>{String(parsed)}</Text>;
};

export const ProfilePage = () => {
  const { t } = useLanguage();
  const { notification } = AntApp.useApp();
  const fileInputRef = useRef(null);

  const {
    profile,
    loading,
    updating,
    uploading,
    removingPhoto,
    error,
    updateError,
    uploadError,
    actionStatus,
    fetchProfile,
    updateProfile,
    uploadPhoto,
    removePhoto,
    clearActionStatus,
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  // Load initial profile data on mount
  useEffect(() => {
    fetchProfile().catch(() => {});
  }, [fetchProfile]);

  // Populate form fields when profile is loaded or edit mode opens
  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        first_name: profile.firstName || '',
        last_name: profile.lastName || '',
        phone: profile.phone || '',
        designation: profile.designation || '',
        department: profile.department || '',
        bio: profile.bio || '',
        country: profile.country || '',
        state: profile.state || '',
        city: profile.city || '',
        timezone: profile.timezone || profile.preferences?.timezone || '',
        language: profile.language || profile.preferences?.language || '',
      });
    }
  }, [profile, form]);

  // Handle action status notifications
  useEffect(() => {
    if (actionStatus) {
      if (actionStatus.type === 'update_success') {
        notification.success({
          message: t('profile.profileUpdated', 'Profile updated successfully.'),
          placement: 'topRight',
        });
        setIsEditing(false);
      } else if (actionStatus.type === 'upload_success') {
        notification.success({
          message: t('profile.photoUpdated', 'Profile photo uploaded successfully.'),
          placement: 'topRight',
        });
      } else if (actionStatus.type === 'remove_success') {
        notification.info({
          message: t('profile.photoRemoved', 'Profile photo removed successfully.'),
          placement: 'topRight',
        });
      }
      clearActionStatus();
    }
  }, [actionStatus, clearActionStatus, notification, t]);

  // Trigger file selection for photo upload
  const handlePhotoSelectClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadPhoto(file);
    } catch (err) {
      notification.error({
        message: t('common.error', 'Upload Error'),
        description: err?.message || err?.error || 'Failed to upload photo.',
      });
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await removePhoto();
    } catch (err) {
      notification.error({
        message: t('common.error', 'Removal Error'),
        description: err?.message || err?.error || 'Failed to remove photo.',
      });
    }
  };

  // Handle Form Submission for Partial Updates
  const handleFinish = async (values) => {
    if (!profile) return;

    // Build diff payload to ONLY send modified mutable fields
    const payload = {};
    const fieldMapping = {
      first_name: profile.firstName || '',
      last_name: profile.lastName || '',
      phone: profile.phone || '',
      designation: profile.designation || '',
      department: profile.department || '',
      bio: profile.bio || '',
      country: profile.country || '',
      state: profile.state || '',
      city: profile.city || '',
      timezone: profile.timezone || profile.preferences?.timezone || '',
      language: profile.language || profile.preferences?.language || '',
    };

    Object.keys(values).forEach((key) => {
      const currentVal = values[key] ?? '';
      const origVal = fieldMapping[key] ?? '';
      if (currentVal !== origVal) {
        payload[key] = currentVal;
      }
    });

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await updateProfile(payload);
    } catch (err) {
      notification.error({
        message: t('common.error', 'Update Error'),
        description: err?.message || err?.error || 'Failed to update profile.',
      });
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      form.setFieldsValue({
        first_name: profile.firstName || '',
        last_name: profile.lastName || '',
        phone: profile.phone || '',
        designation: profile.designation || '',
        department: profile.department || '',
        bio: profile.bio || '',
        country: profile.country || '',
        state: profile.state || '',
        city: profile.city || '',
        timezone: profile.timezone || profile.preferences?.timezone || '',
        language: profile.language || profile.preferences?.language || '',
      });
    }
    setIsEditing(false);
  };

  if (loading && !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" tip={t('common.loading', 'Loading Profile...')} />
      </div>
    );
  }

  const avatarSrc = profile?.profileImage || profile?.avatar;
  const userInitials = profile?.fullName
    ? profile.fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : profile?.email
    ? profile.email[0].toUpperCase()
    : '';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        style={{ display: 'none' }}
      />

      {/* Global Errors Alert */}
      {error && (
        <Alert
          message={t('common.error', 'Error Loading Profile')}
          description={error.message || String(error)}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {updateError && (
        <Alert
          message={t('common.error', 'Profile Update Error')}
          description={updateError.message || String(updateError)}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {uploadError && (
        <Alert
          message={t('common.error', 'Photo Upload Error')}
          description={uploadError.message || String(uploadError)}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* Profile Header Banner Card */}
      <Card
        style={{
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Row align="middle" justify="space-between" gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Space size={24} align="center" style={{ flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  size={96}
                  src={avatarSrc}
                  style={{
                    backgroundColor: 'var(--brand-navy, #0f172a)',
                    fontSize: '2rem',
                    fontWeight: 600,
                    border: '3px solid #ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  {!avatarSrc && (userInitials || <FiUser />)}
                </Avatar>
                {uploading && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Spin size="small" />
                  </div>
                )}
              </div>

              <div>
                <Space align="center" size="small">
                  <Title level={3} style={{ margin: 0 }}>
                    {profile?.fullName || profile?.email || 'Not available'}
                  </Title>
                  {profile?.status ? (
                    <Tag color="blue" icon={<FiCheckCircle />}>
                      {profile.status}
                    </Tag>
                  ) : (
                    <Tag color="default">Not available</Tag>
                  )}
                </Space>

                {(profile?.designation || profile?.department) && (
                  <Paragraph type="secondary" style={{ margin: '4px 0 8px 0', fontSize: '0.95rem' }}>
                    {profile?.designation || ''}
                    {profile?.designation && profile?.department ? ' • ' : ''}
                    {profile?.department || ''}
                  </Paragraph>
                )}

                <Space size="middle" style={{ flexWrap: 'wrap', marginTop: '4px' }}>
                  <Text type="secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <FiMail style={{ color: '#1890ff' }} />
                    {profile?.email || 'Not available'}
                  </Text>
                  {profile?.company?.companyName && (
                    <Text type="secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <FiBriefcase style={{ color: '#52c41a' }} />
                      {profile.company.companyName}
                    </Text>
                  )}
                </Space>

                {/* Photo Action Buttons */}
                <div style={{ marginTop: '12px' }}>
                  <Space size="small">
                    <Button
                      size="small"
                      icon={<FiCamera />}
                      loading={uploading}
                      onClick={handlePhotoSelectClick}
                    >
                      {avatarSrc ? t('profile.changePhoto', 'Change Photo') : t('profile.uploadPhoto', 'Upload Photo')}
                    </Button>
                    {avatarSrc && (
                      <Button
                        size="small"
                        danger
                        icon={<FiTrash2 />}
                        loading={removingPhoto}
                        onClick={handleRemovePhoto}
                      >
                        {t('profile.removePhoto', 'Remove Photo')}
                      </Button>
                    )}
                  </Space>
                </div>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            {!isEditing ? (
              <Button
                type="primary"
                icon={<FiEdit2 />}
                size="large"
                onClick={() => setIsEditing(true)}
                style={{ backgroundColor: 'var(--brand-navy, #0f172a)' }}
              >
                {t('profile.editProfile', 'Edit Profile')}
              </Button>
            ) : (
              <Space>
                <Button icon={<FiX />} size="large" onClick={handleCancelEdit} disabled={updating}>
                  {t('profile.cancel', 'Cancel')}
                </Button>
                <Button
                  type="primary"
                  icon={<FiSave />}
                  size="large"
                  loading={updating}
                  onClick={() => form.submit()}
                  style={{ backgroundColor: 'var(--brand-navy, #0f172a)' }}
                >
                  {t('profile.saveChanges', 'Save Changes')}
                </Button>
              </Space>
            )}
          </Col>
        </Row>
      </Card>

      {/* Main Profile Content Form */}
      <Form form={form} layout="vertical" onFinish={handleFinish} disabled={!isEditing || updating}>
        <Row gutter={[24, 24]}>
          {/* Left Column: Mutable Profile Data (Personal + Location + Preferences) */}
          <Col xs={24} lg={14}>
            {/* Personal Information */}
            <Card
              title={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <FiUser style={{ color: '#1890ff' }} />
                  {t('profile.personalInfo', 'Personal Information')}
                </span>
              }
              style={{ borderRadius: '8px', marginBottom: '24px' }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="first_name"
                    label={t('profile.firstName', 'First Name')}
                    rules={[{ required: true, message: 'First name is required' }]}
                  >
                    <Input placeholder="Enter first name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="last_name"
                    label={t('profile.lastName', 'Last Name')}
                    rules={[{ required: true, message: 'Last name is required' }]}
                  >
                    <Input placeholder="Enter last name" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item name="phone" label={t('profile.phone', 'Phone Number')}>
                    <Input prefix={<FiPhone style={{ color: '#bfbfbf' }} />} placeholder="Enter phone number" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item name="designation" label={t('profile.designation', 'Designation / Job Title')}>
                    <Input placeholder="Enter designation" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item name="department" label={t('profile.department', 'Department')}>
                    <Input placeholder="Enter department" />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item name="bio" label={t('profile.bio', 'Bio / About')}>
                    <Input.TextArea rows={3} placeholder="Brief professional profile bio..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Location & Address */}
            <Card
              title={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <FiMapPin style={{ color: '#52c41a' }} />
                  {t('profile.locationInfo', 'Location & Address')}
                </span>
              }
              style={{ borderRadius: '8px', marginBottom: '24px' }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Form.Item name="city" label={t('profile.city', 'City')}>
                    <Input placeholder="City" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="state" label={t('profile.state', 'State / Province')}>
                    <Input placeholder="State or Province" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="country" label={t('profile.country', 'Country')}>
                    <Input placeholder="Country" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Preferences & Settings */}
            <Card
              title={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <FiGlobe style={{ color: '#eb2f96' }} />
                  {t('profile.preferences', 'Preferences & Settings')}
                </span>
              }
              style={{ borderRadius: '8px' }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="timezone" label={t('profile.timezone', 'Timezone')}>
                    <Input placeholder="e.g. Europe/Berlin" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="language" label={t('profile.language', 'Language')}>
                    <Input placeholder="e.g. en" />
                  </Form.Item>
                </Col>
              </Row>
              <Descriptions column={1} size="small" bordered style={{ marginTop: '12px' }}>
                <Descriptions.Item label={t('profile.notificationPreferences', 'Notification Preferences')}>
                  {formatNotifPrefs(profile?.notificationPreferences || profile?.preferences?.notificationPreferences)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Right Column: Read-Only System Identity, Permissions & Company Context */}
          <Col xs={24} lg={10}>
            {/* Account Information (Read-Only Identity) */}
            <Card
              title={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <FiShield style={{ color: '#722ed1' }} />
                  {t('profile.accountInfo', 'Account Information')}
                </span>
              }
              style={{ borderRadius: '8px', marginBottom: '24px' }}
              extra={
                <Tag icon={<FiLock />} color="default">
                  Read-Only
                </Tag>
              }
            >
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label={t('profile.email', 'Work Email')}>
                  <Text copyable={{ text: profile?.email || '' }} style={{ fontWeight: 500 }}>
                    {profile?.email || 'Not available'}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('profile.role', 'Account Role')}>
                  {profile?.role ? <Tag color="purple">{profile.role}</Tag> : <Text type="secondary">Not available</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={t('profile.status', 'Account Status')}>
                  {profile?.status ? <Badge status="success" text={profile.status} /> : <Text type="secondary">Not available</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={t('profile.employeeId', 'Employee ID')}>
                  {profile?.employeeId ? <code>{profile.employeeId}</code> : <Text type="secondary">Not available</Text>}
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiInfo />
                {t('profile.readOnlyNotice', 'Account-managed field. Contact an administrator to request changes.')}
              </div>
            </Card>

            {/* Permissions (Read-Only Section 11) */}
            <Card
              title={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <FiShield style={{ color: '#13c2c2' }} />
                  {t('profile.permissions', 'Permissions')}
                </span>
              }
              style={{ borderRadius: '8px', marginBottom: '24px' }}
              extra={
                <Tag icon={<FiLock />} color="default">
                  Read-Only
                </Tag>
              }
            >
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label={t('profile.role', 'Role')}>
                  {profile?.role ? <Tag color="purple">{profile.role}</Tag> : <Text type="secondary">Not available</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={t('profile.primaryRecruiter', 'Primary Recruiter')}>
                  {formatBooleanPermission(profile?.isPrimaryRecruiter)}
                </Descriptions.Item>
                <Descriptions.Item label={t('profile.canPublishJobs', 'Can Publish Jobs')}>
                  {formatBooleanPermission(profile?.canPublishJobs)}
                </Descriptions.Item>
                <Descriptions.Item label={t('profile.canHire', 'Can Hire')}>
                  {formatBooleanPermission(profile?.canHire)}
                </Descriptions.Item>
                <Descriptions.Item label={t('profile.canManageRecruiters', 'Can Manage Recruiters')}>
                  {formatBooleanPermission(profile?.canManageRecruiters)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Account Activity (Read-Only Section 14) */}
            <Card
              title={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <FiActivity style={{ color: '#fa8c16' }} />
                  {t('profile.accountActivity', 'Account Activity')}
                </span>
              }
              style={{ borderRadius: '8px', marginBottom: '24px' }}
              extra={
                <Tag icon={<FiClock />} color="default">
                  Audit
                </Tag>
              }
            >
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label={t('profile.lastLogin', 'Last Login')}>
                  {profile?.lastLogin || <Text type="secondary">Not available</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={t('profile.lastLoginAt', 'Last Login At')}>
                  {profile?.lastLoginAt || <Text type="secondary">Not available</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={t('profile.loginCount', 'Login Count')}>
                  {profile?.loginCount !== null && profile?.loginCount !== undefined ? (
                    <code>{String(profile.loginCount)}</code>
                  ) : (
                    <Text type="secondary">Not available</Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Company Information (Read-Only Organization Context) */}
            <Card
              title={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <FiBriefcase style={{ color: '#faad14' }} />
                  {t('profile.companyInfo', 'Company Information')}
                </span>
              }
              style={{ borderRadius: '8px' }}
              extra={
                <Tag icon={<FiLock />} color="default">
                  Company Context
                </Tag>
              }
            >
              {profile?.company ? (
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label={t('profile.company', 'Company Name')}>
                    {profile.company.companyName ? (
                      <Text strong>{profile.company.companyName}</Text>
                    ) : (
                      <Text type="secondary">Not available</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('profile.companyCode', 'Company Code')}>
                    {profile.company.companyCode ? (
                      <code>{profile.company.companyCode}</code>
                    ) : (
                      <Text type="secondary">Not available</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('profile.industry', 'Industry')}>
                    {profile.company.industry || <Text type="secondary">Not available</Text>}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('profile.companySize', 'Company Size')}>
                    {profile.company.companySize || <Text type="secondary">Not available</Text>}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('profile.companyEmail', 'Company Email')}>
                    {profile.company.email || <Text type="secondary">Not available</Text>}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('profile.companyWebsite', 'Company Website')}>
                    {profile.company.website ? (
                      <a href={profile.company.website} target="_blank" rel="noreferrer">
                        {profile.company.website}
                      </a>
                    ) : (
                      <Text type="secondary">Not available</Text>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Text type="secondary">Not available</Text>
              )}
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ProfilePage;
