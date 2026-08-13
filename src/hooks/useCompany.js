import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCompanyProfile,
  selectCompanyProfile,
  selectCompanyName,
  selectCompanyLogo,
  selectCompanyStatus,
  selectCompanyError,
} from '../store/slices/companySlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';

export const useCompany = () => {
  const dispatch = useDispatch();
  const company = useSelector(selectCompanyProfile);
  const companyName = useSelector(selectCompanyName);
  const companyLogo = useSelector(selectCompanyLogo);
  const status = useSelector(selectCompanyStatus);
  const error = useSelector(selectCompanyError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const loadCompanyProfile = useCallback(
    (force = false) => {
      if (isAuthenticated && (status === 'idle' || force)) {
        dispatch(fetchCompanyProfile());
      }
    },
    [dispatch, isAuthenticated, status]
  );

  return {
    company,
    companyName,
    companyLogo,
    status,
    error,
    isLoading: status === 'loading',
    loadCompanyProfile,
  };
};

export default useCompany;
