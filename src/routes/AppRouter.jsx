import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './routes';
import { ProtectedRoute, PublicOnlyRoute } from './RouteGuards';
import { useAuth } from '../hooks/useAuth';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Layout & Dashboard Pages
import AppLayout from '../layouts/AppLayout';
import DashboardPage from '../pages/app/Dashboard/DashboardPage';
import CandidatesPage from '../pages/app/Candidates/CandidatesPage';
import JobsPage from '../pages/app/Jobs/JobsPage';
import ApplicationsPage from '../pages/app/Applications/ApplicationsPage';
import JobApplicationsPage from '../pages/app/JobApplications/JobApplicationsPage';
import InterviewsPage from '../pages/app/Interviews/InterviewsPage';
import OffersPage from '../pages/app/Offers/OffersPage';
import NotificationsPage from '../pages/app/Notifications/NotificationsPage';
import AnalyticsPage from '../pages/app/Analytics/AnalyticsPage';
import ModulePlaceholder from '../components/common/ModulePlaceholder';
import FoundationDemo from '../components/foundation/FoundationDemo';

const SessionInitializer = ({ children }) => {
  const { initSession } = useAuth();

  useEffect(() => {
    initSession();
  }, [initSession]);

  return children;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <SessionInitializer>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path={ROUTES.FORGOT_PASSWORD}
            element={
              <PublicOnlyRoute>
                <ForgotPasswordPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path={ROUTES.RESET_PASSWORD}
            element={
              <PublicOnlyRoute>
                <ResetPasswordPage />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Application Shell & Module Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.APP} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.JOBS} element={<JobsPage />} />
            <Route path={ROUTES.CANDIDATES} element={<CandidatesPage />} />
            <Route path={ROUTES.APPLICATIONS} element={<ApplicationsPage />} />
            <Route path={ROUTES.JOB_APPLICATIONS} element={<JobApplicationsPage />} />
            <Route path={ROUTES.INTERVIEWS} element={<InterviewsPage />} />
            <Route path={ROUTES.OFFERS} element={<OffersPage />} />
            <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
            <Route
              path={ROUTES.TALENT_POOLS}
              element={<ModulePlaceholder moduleNameKey="nav.talentPools" moduleNameFallback="Talent Pools" />}
            />
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
            <Route
              path={ROUTES.BILLING}
              element={<ModulePlaceholder moduleNameKey="nav.billing" moduleNameFallback="Billing" />}
            />
            <Route
              path={ROUTES.SETTINGS}
              element={<ModulePlaceholder moduleNameKey="nav.settings" moduleNameFallback="Settings" />}
            />
          </Route>

          {/* Foundation Inspector (Phase 1 Demo) */}
          <Route path={ROUTES.FOUNDATION} element={<FoundationDemo />} />

          {/* Default Redirect to /login */}
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </SessionInitializer>
    </BrowserRouter>
  );
};

export default AppRouter;
