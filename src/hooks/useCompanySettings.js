import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
  uploadCompanyBanner,
  selectCompanyProfile,
  selectCompanyStatus,
  selectCompanySaving,
  selectUploadingLogo,
  selectUploadingBanner,
  selectCompanyActionStatus,
  selectCompanyError,
  clearCompanyError,
  clearCompanyActionStatus,
} from '../store/slices/companySlice';
import {
  fetchAllSettings,
  fetchGeneralSettings,
  updateGeneralSettings,
  fetchBrandingSettings,
  updateBrandingSettings,
  fetchNotificationSettings,
  updateNotificationSettings,
  fetchSecuritySettings,
  updateSecuritySettings,
  fetchRecruitmentSettings,
  updateRecruitmentSettings,
  fetchIntegrationSettings,
  updateIntegrationSettings,
  selectGeneralSettings,
  selectBrandingSettings,
  selectNotificationSettings,
  selectSecuritySettings,
  selectRecruitmentSettings,
  selectIntegrationSettings,
  selectSettingsLoading,
  selectSavingSection,
  selectSettingsActionStatus,
  selectSettingsError,
  selectSecurityPermissionError,
  selectIntegrationPermissionError,
  clearSettingsError,
  clearSettingsActionStatus,
} from '../store/slices/settingsSlice';

export const useCompanySettings = () => {
  const dispatch = useDispatch();

  // Company Profile state
  const companyProfile = useSelector(selectCompanyProfile);
  const companyStatus = useSelector(selectCompanyStatus);
  const companySaving = useSelector(selectCompanySaving);
  const uploadingLogo = useSelector(selectUploadingLogo);
  const uploadingBanner = useSelector(selectUploadingBanner);
  const companyActionStatus = useSelector(selectCompanyActionStatus);
  const companyError = useSelector(selectCompanyError);

  // Settings state
  const generalSettings = useSelector(selectGeneralSettings);
  const brandingSettings = useSelector(selectBrandingSettings);
  const notificationSettings = useSelector(selectNotificationSettings);
  const securitySettings = useSelector(selectSecuritySettings);
  const recruitmentSettings = useSelector(selectRecruitmentSettings);
  const integrationSettings = useSelector(selectIntegrationSettings);
  const settingsLoading = useSelector(selectSettingsLoading);
  const savingSection = useSelector(selectSavingSection);
  const settingsActionStatus = useSelector(selectSettingsActionStatus);
  const settingsError = useSelector(selectSettingsError);
  const securityPermissionError = useSelector(selectSecurityPermissionError);
  const integrationPermissionError = useSelector(selectIntegrationPermissionError);

  // Load functions
  const loadCompanyProfile = useCallback(() => {
    return dispatch(fetchCompanyProfile());
  }, [dispatch]);

  const loadAllSettings = useCallback(() => {
    return dispatch(fetchAllSettings());
  }, [dispatch]);

  const loadInitialData = useCallback(() => {
    dispatch(fetchCompanyProfile());
    dispatch(fetchAllSettings());
  }, [dispatch]);

  // Company action functions
  const handleUpdateCompanyProfile = useCallback(
    (payload) => dispatch(updateCompanyProfile(payload)),
    [dispatch]
  );

  const handleUploadCompanyLogo = useCallback(
    (file) => dispatch(uploadCompanyLogo(file)),
    [dispatch]
  );

  const handleUploadCompanyBanner = useCallback(
    (file) => dispatch(uploadCompanyBanner(file)),
    [dispatch]
  );

  // Settings action functions
  const handleUpdateGeneralSettings = useCallback(
    (payload) => dispatch(updateGeneralSettings(payload)),
    [dispatch]
  );

  const handleUpdateBrandingSettings = useCallback(
    (payload) => dispatch(updateBrandingSettings(payload)),
    [dispatch]
  );

  const handleUpdateNotificationSettings = useCallback(
    (payload) => dispatch(updateNotificationSettings(payload)),
    [dispatch]
  );

  const handleUpdateSecuritySettings = useCallback(
    (payload) => dispatch(updateSecuritySettings(payload)),
    [dispatch]
  );

  const handleUpdateRecruitmentSettings = useCallback(
    (payload) => dispatch(updateRecruitmentSettings(payload)),
    [dispatch]
  );

  const handleUpdateIntegrationSettings = useCallback(
    (payload) => dispatch(updateIntegrationSettings(payload)),
    [dispatch]
  );

  // Clear state functions
  const handleClearCompanyError = useCallback(
    () => dispatch(clearCompanyError()),
    [dispatch]
  );

  const handleClearCompanyActionStatus = useCallback(
    () => dispatch(clearCompanyActionStatus()),
    [dispatch]
  );

  const handleClearSettingsError = useCallback(
    () => dispatch(clearSettingsError()),
    [dispatch]
  );

  const handleClearSettingsActionStatus = useCallback(
    () => dispatch(clearSettingsActionStatus()),
    [dispatch]
  );

  return {
    // State
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

    // Actions
    loadCompanyProfile,
    loadAllSettings,
    loadInitialData,
    updateCompanyProfile: handleUpdateCompanyProfile,
    uploadCompanyLogo: handleUploadCompanyLogo,
    uploadCompanyBanner: handleUploadCompanyBanner,
    updateGeneralSettings: handleUpdateGeneralSettings,
    updateBrandingSettings: handleUpdateBrandingSettings,
    updateNotificationSettings: handleUpdateNotificationSettings,
    updateSecuritySettings: handleUpdateSecuritySettings,
    updateRecruitmentSettings: handleUpdateRecruitmentSettings,
    updateIntegrationSettings: handleUpdateIntegrationSettings,
    clearCompanyError: handleClearCompanyError,
    clearCompanyActionStatus: handleClearCompanyActionStatus,
    clearSettingsError: handleClearSettingsError,
    clearSettingsActionStatus: handleClearSettingsActionStatus,
  };
};

export default useCompanySettings;
