import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  authApi,
} from '../services/authApi';
import {
  setAuthInitializing,
  setAuthAuthenticating,
  setCredentials,
  setAuthError,
  setLoggingOut,
  clearAuth,
  selectAuth,
  selectIsAuthenticated,
  selectCurrentUser,
  selectAuthStatus,
  selectAuthError,
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  /**
   * Session Initialization
   * Verifies backend session on startup. Backend is single source of truth.
   */
  const initSession = useCallback(async () => {
    dispatch(setAuthInitializing());
    try {
      const userData = await authApi.me();
      if (
        userData &&
        userData.authenticated !== false &&
        (userData.email || userData.user || userData.name || userData.username || userData.fullName)
      ) {
        const userObj =
          typeof userData.user === 'object'
            ? userData.user
            : userData.email || userData.fullName || userData.name
            ? userData
            : { user: userData.user || userData };

        dispatch(
          setCredentials({
            user: userObj,
          })
        );
      } else {
        dispatch(clearAuth());
      }
    } catch (err) {
      // Unauthenticated or expired session
      dispatch(clearAuth());
    }
  }, [dispatch]);

  /**
   * Submit Login Credentials
   */
  const login = async ({ email, password, rememberMe }) => {
    dispatch(setAuthAuthenticating());
    try {
      const loginResponse = await authApi.login({ email, password, rememberMe });
      
      // Fetch full current user context after login
      let userProfile = loginResponse;
      try {
        const fetchedProfile = await authApi.me();
        if (fetchedProfile) {
          userProfile = fetchedProfile.user || fetchedProfile;
        }
      } catch (meErr) {
        // Fallback to login response payload
      }

      dispatch(
        setCredentials({
          user: userProfile,
        })
      );
      return { success: true, user: userProfile };
    } catch (err) {
      dispatch(setAuthError(err));
      return { success: false, error: err };
    }
  };

  /**
   * Logout Active Backend Session
   */
  const logout = async () => {
    dispatch(setLoggingOut());
    try {
      await authApi.logout();
    } catch (err) {
      // Continue clearing local state even if network call failed
    } finally {
      dispatch(clearAuth());
    }
  };

  return {
    authState,
    isAuthenticated,
    user,
    status,
    error,
    isInitializing: status === 'initializing',
    isAuthenticating: status === 'authenticating',
    isLoggingOut: status === 'loggingOut',
    initSession,
    login,
    logout,
  };
};

export default useAuth;
