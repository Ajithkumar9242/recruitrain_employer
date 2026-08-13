import React, { useEffect, useState } from 'react';
import { Tabs, Card, Typography, message, Button, Space } from 'antd';
import {
  FiBriefcase,
  FiGlobe,
  FiDroplet,
  FiBell,
  FiShield,
  FiSettings,
  FiCpu,
  FiRefreshCw,
} from 'react-icons/fi';
import { useLanguage } from '../../../hooks/useLanguage';
import { useCompanySettings } from '../../../hooks/useCompanySettings';
import CompanyProfileSection from './sections/CompanyProfileSection';
import GeneralSettingsSection from './sections/GeneralSettingsSection';
import BrandingSection from './sections/BrandingSection';
import NotificationSettingsSection from './sections/NotificationSettingsSection';
import SecuritySettingsSection from './sections/SecuritySettingsSection';
import RecruitmentSettingsSection from './sections/RecruitmentSettingsSection';
import IntegrationSettingsSection from './sections/IntegrationSettingsSection';

const { Title, Text } = Typography;

export const CompanySettingsPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');

  const {
    companyProfile,
    companyStatus,
    companySaving,
    uploadingLogo,
    uploadingBanner,
    companyActionStatus,
    companyError,
    generalSettings,
    brandingSettings,
    notificationSettings,
    securitySettings,
    recruitmentSettings,
    integrationSettings,
    settingsLoading,
    savingSection,
    settingsActionStatus,
    settingsError,
    securityPermissionError,
    integrationPermissionError,
    loadInitialData,
    loadCompanyProfile,
    loadAllSettings,
    updateCompanyProfile,
    uploadCompanyLogo,
    uploadCompanyBanner,
    updateGeneralSettings,
    updateBrandingSettings,
    updateNotificationSettings,
    updateSecuritySettings,
    updateRecruitmentSettings,
    updateIntegrationSettings,
    clearCompanyError,
    clearCompanyActionStatus,
    clearSettingsError,
    clearSettingsActionStatus,
  } = useCompanySettings();

  // Load profile and settings on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle action status notifications
  useEffect(() => {
    if (companyActionStatus) {
      switch (companyActionStatus.type) {
        case 'update_success':
          message.success(t('companySettings.messages.profileUpdateSuccess', 'Company profile updated successfully.'));
          break;
        case 'logo_success':
          message.success(t('companySettings.messages.logoSuccess', 'Company logo uploaded successfully.'));
          break;
        case 'banner_success':
          message.success(t('companySettings.messages.bannerSuccess', 'Company banner uploaded successfully.'));
          break;
        default:
          break;
      }
      clearCompanyActionStatus();
    }
  }, [companyActionStatus, clearCompanyActionStatus, t]);

  useEffect(() => {
    if (settingsActionStatus) {
      const sectionName = settingsActionStatus.section;
      message.success(
        t('companySettings.messages.settingsUpdateSuccess', '{{section}} settings updated successfully.', {
          section: sectionName ? sectionName.toUpperCase() : 'Settings',
        })
      );
      clearSettingsActionStatus();
    }
  }, [settingsActionStatus, clearSettingsActionStatus, t]);

  // Handle errors
  useEffect(() => {
    if (companyError) {
      const msg = typeof companyError === 'string' ? companyError : companyError?.message || t('common.error', 'An error occurred.');
      message.error(msg);
      clearCompanyError();
    }
  }, [companyError, clearCompanyError, t]);

  useEffect(() => {
    if (settingsError) {
      const msg = typeof settingsError === 'string' ? settingsError : settingsError?.message || t('common.error', 'An error occurred.');
      message.error(msg);
      clearSettingsError();
    }
  }, [settingsError, clearSettingsError, t]);

  const handleRefresh = () => {
    loadCompanyProfile();
    loadAllSettings();
    message.info(t('common.refreshing', 'Refreshing settings from backend...'));
  };

  const isProfileLoading = companyStatus === 'loading';

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiBriefcase /> {t('companySettings.tabs.profile', 'Company Profile')}
        </span>
      ),
      children: (
        <CompanyProfileSection
          profile={companyProfile}
          loading={isProfileLoading}
          saving={companySaving}
          uploadingLogo={uploadingLogo}
          uploadingBanner={uploadingBanner}
          onUpdateProfile={updateCompanyProfile}
          onUploadLogo={uploadCompanyLogo}
          onUploadBanner={uploadCompanyBanner}
        />
      ),
    },
    {
      key: 'general',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiGlobe /> {t('companySettings.tabs.general', 'General')}
        </span>
      ),
      children: (
        <GeneralSettingsSection
          settings={generalSettings}
          loading={settingsLoading}
          saving={savingSection === 'general'}
          onUpdateSettings={updateGeneralSettings}
        />
      ),
    },
    // {
    //   key: 'branding',
    //   label: (
    //     <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    //       <FiDroplet /> {t('companySettings.tabs.branding', 'Branding')}
    //     </span>
    //   ),
    //   children: (
    //     <BrandingSection
    //       settings={brandingSettings}
    //       loading={settingsLoading}
    //       saving={savingSection === 'branding'}
    //       onUpdateSettings={updateBrandingSettings}
    //     />
    //   ),
    // },
    {
      key: 'notifications',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiBell /> {t('companySettings.tabs.notifications', 'Notifications')}
        </span>
      ),
      children: (
        <NotificationSettingsSection
          settings={notificationSettings}
          loading={settingsLoading}
          saving={savingSection === 'notification'}
          onUpdateSettings={updateNotificationSettings}
        />
      ),
    },
    {
      key: 'security',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiShield /> {t('companySettings.tabs.security', 'Security')}
        </span>
      ),
      children: (
        <SecuritySettingsSection
          settings={securitySettings}
          loading={settingsLoading}
          saving={savingSection === 'security'}
          permissionError={securityPermissionError}
          onUpdateSettings={updateSecuritySettings}
        />
      ),
    },
    {
      key: 'recruitment',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiSettings /> {t('companySettings.tabs.recruitment', 'Recruitment')}
        </span>
      ),
      children: (
        <RecruitmentSettingsSection
          settings={recruitmentSettings}
          loading={settingsLoading}
          saving={savingSection === 'recruitment'}
          onUpdateSettings={updateRecruitmentSettings}
        />
      ),
    },
    {
      key: 'integration',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCpu /> {t('companySettings.tabs.integration', 'Integrations')}
        </span>
      ),
      children: (
        <IntegrationSettingsSection
          settings={integrationSettings}
          loading={settingsLoading}
          saving={savingSection === 'integration'}
          permissionError={integrationPermissionError}
          onUpdateSettings={updateIntegrationSettings}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiSettings style={{ color: 'var(--brand-teal, #1890ff)' }} />
            {t('companySettings.title', 'Company Settings')}
          </Title>
          <Text type="secondary">
            {t('companySettings.subtitle', 'Manage company profile, recruitment rules, security preferences, and enterprise integrations.')}
          </Text>
        </div>

        <Space>
          <Button
            icon={<FiRefreshCw />}
            onClick={handleRefresh}
            loading={isProfileLoading || settingsLoading}
          >
            {t('common.refresh', 'Refresh')}
          </Button>
        </Space>
      </div>

      {/* Main Settings Tabs */}
      <Card style={{ borderRadius: '8px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="line"
          tabBarStyle={{ marginBottom: '24px' }}
        />
      </Card>
    </div>
  );
};

export default CompanySettingsPage;
