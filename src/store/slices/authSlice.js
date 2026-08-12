import { createSlice } from '@reduxjs/toolkit';

/**
 * RecruitTrain Authentication Slice
 * Conceptual States:
 * - initializing: App checking existing Frappe backend session
 * - unauthenticated: No active session
 * - authenticating: Login request in flight
 * - authenticated: Active backend session verified
 * - loggingOut: Logout request in flight
 * - sessionExpired: Server returned 401 on an authenticated request
 * - error: Authentication attempt failed
 */

const initialState = {
  status: 'initializing', // 'initializing' | 'unauthenticated' | 'authenticating' | 'authenticated' | 'loggingOut' | 'sessionExpired' | 'error'
  isAuthenticated: false,
  user: null, // { id, name, email, company, role, permissions } provided by backend
  sessionExpiry: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthInitializing: (state) => {
      state.status = 'initializing';
      state.error = null;
    },
    setAuthAuthenticating: (state) => {
      state.status = 'authenticating';
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user, sessionExpiry } = action.payload;
      state.status = 'authenticated';
      state.isAuthenticated = true;
      state.user = user;
      state.sessionExpiry = sessionExpiry || null;
      state.error = null;
    },
    setAuthError: (state, action) => {
      state.status = 'error';
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    setSessionExpired: (state) => {
      state.status = 'sessionExpired';
      state.isAuthenticated = false;
      state.user = null;
      state.sessionExpiry = null;
      state.error = {
        code: 'UNAUTHORIZED',
        message: 'Your session has expired. Please sign in again.',
      };
    },
    setLoggingOut: (state) => {
      state.status = 'loggingOut';
    },
    clearAuth: (state) => {
      state.status = 'unauthenticated';
      state.isAuthenticated = false;
      state.user = null;
      state.sessionExpiry = null;
      state.error = null;
    },
  },
});

export const {
  setAuthInitializing,
  setAuthAuthenticating,
  setCredentials,
  setAuthError,
  setSessionExpired,
  setLoggingOut,
  clearAuth,
} = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectAuthStatus = (state) => state.auth.status;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
