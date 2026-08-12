import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from './routes';

/**
 * Loading Spinner Screen while inspecting backend session
 */
const SessionLoadingScreen = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
    }}
  >
    <Spin size="large" tip="Verifying RecruitTrain session..." />
  </div>
);

/**
 * Route Guard for Authenticated Employer Area (/app)
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <SessionLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
};

/**
 * Route Guard for Guest Auth Pages (/login, /forgot-password, /reset-password)
 */
export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <SessionLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.APP} replace />;
  }

  return children;
};
