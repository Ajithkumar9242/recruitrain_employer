import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
  clearProfileErrors,
  clearProfileActionStatus,
  selectProfile,
  selectProfileLoading,
  selectProfileUpdating,
  selectProfileUploading,
  selectProfileRemovingPhoto,
  selectProfileError,
  selectProfileUpdateError,
  selectProfileUploadError,
  selectProfileActionStatus,
} from '../store/slices/profileSlice';

export const useProfile = () => {
  const dispatch = useDispatch();

  const profile = useSelector(selectProfile);
  const loading = useSelector(selectProfileLoading);
  const updating = useSelector(selectProfileUpdating);
  const uploading = useSelector(selectProfileUploading);
  const removingPhoto = useSelector(selectProfileRemovingPhoto);
  const error = useSelector(selectProfileError);
  const updateError = useSelector(selectProfileUpdateError);
  const uploadError = useSelector(selectProfileUploadError);
  const actionStatus = useSelector(selectProfileActionStatus);

  const fetchProfile = useCallback(() => {
    return dispatch(fetchMyProfile()).unwrap();
  }, [dispatch]);

  const updateProfile = useCallback(
    (payload) => {
      return dispatch(updateMyProfile(payload)).unwrap();
    },
    [dispatch]
  );

  const uploadPhoto = useCallback(
    (file) => {
      return dispatch(uploadProfilePhoto(file)).unwrap();
    },
    [dispatch]
  );

  const removePhoto = useCallback(() => {
    return dispatch(removeProfilePhoto()).unwrap();
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearProfileErrors());
  }, [dispatch]);

  const clearActionStatus = useCallback(() => {
    dispatch(clearProfileActionStatus());
  }, [dispatch]);

  return {
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
    clearErrors,
    clearActionStatus,
  };
};

export default useProfile;
