import React, { useEffect } from 'react';
import { Row, Col, Button, Tag, Alert, message } from 'antd';
import {
  FiRefreshCw,
  FiBriefcase,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiAward,
  FiBell,
  FiCheckCircle,
} from 'react-icons/fi';
import { useLanguage } from '../../../hooks/useLanguage';
import { useDashboard } from '../../../hooks/useDashboard';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import KpiCard from './components/KpiCard';
import PipelineFunnelCard from './components/PipelineFunnelCard';
import TodaysInterviewsCard from './components/TodaysInterviewsCard';
import RecentActivityCard from './components/RecentActivityCard';
import RecentApplicationsCard from './components/RecentApplicationsCard';

export const DashboardPage = () => {
  const { t } = useLanguage();
  const {
    overview,
    pipelineSummary,
    todaysInterviews,
    recentActivity,
    recentApplications,
    isLoading,
    isRefreshing,
    errors,
    loadDashboard,
    refreshDashboard,
  } = useDashboard();

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = async () => {
    await refreshDashboard();
    message.success(t('dashboard.refreshSuccess'));
  };

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.subtitle')}
        actions={
          <>
            <Tag color="teal" icon={<FiCheckCircle style={{ marginRight: 4 }} />}>
              Frappe Backend Connected
            </Tag>
            <Button
              type="primary"
              icon={<FiRefreshCw className={isRefreshing ? 'spin' : ''} />}
              loading={isRefreshing}
              onClick={handleRefresh}
            >
              {isRefreshing ? t('common.refreshing') : t('common.refresh')}
            </Button>
          </>
        }
      />

      {/* Global Section Error Banner if Backend Fetch fails completely */}
      {errors?.general && (
        <Alert
          type="error"
          title={t('common.error')}
          description={t('dashboard.errorLoading')}
          action={
            <Button size="small" type="primary" danger onClick={loadDashboard}>
              {t('common.retry')}
            </Button>
          }
          style={{ marginBottom: 24 }}
          showIcon
        />
      )}

      {/* SECTION A: TOP KPI CARDS GRID */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <KpiCard
            title={t('dashboard.kpiOpenJobs')}
            value={overview?.openJobs}
            icon={FiBriefcase}
            loading={isLoading}
            trend={overview?.trendOpenJobs}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <KpiCard
            title={t('dashboard.kpiTotalCandidates')}
            value={overview?.totalCandidates}
            icon={FiUsers}
            iconColor="var(--brand-teal-light)"
            loading={isLoading}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <KpiCard
            title={t('dashboard.kpiActiveApplications')}
            value={overview?.activeApplications}
            icon={FiFileText}
            loading={isLoading}
            trend={overview?.trendApplications}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <KpiCard
            title={t('dashboard.kpiTodaysInterviews')}
            value={overview?.todaysInterviews}
            icon={FiCalendar}
            iconColor="rgba(245, 158, 11, 0.15)"
            loading={isLoading}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <KpiCard
            title={t('dashboard.kpiPendingOffers')}
            value={overview?.pendingOffers}
            icon={FiAward}
            iconColor="rgba(16, 185, 129, 0.15)"
            loading={isLoading}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <KpiCard
            title={t('dashboard.kpiUnreadNotifications')}
            value={overview?.unreadNotifications}
            icon={FiBell}
            iconColor="rgba(239, 68, 68, 0.15)"
            loading={isLoading}
          />
        </Col>
      </Row>

      {/* SECTION B: RECRUITMENT FUNNEL */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <PipelineFunnelCard stages={pipelineSummary} loading={isLoading} />
        </Col>
      </Row>

      {/* SECTION C: RECENT APPLICATIONS & INTERVIEWS GRID */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <TodaysInterviewsCard interviews={todaysInterviews} loading={isLoading} />
        </Col>
        <Col xs={24} lg={12}>
          <RecentApplicationsCard applications={recentApplications} loading={isLoading} />
        </Col>
      </Row>

      {/* SECTION D: RECENT ACTIVITY TIMELINE */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <RecentActivityCard activities={recentActivity} loading={isLoading} />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DashboardPage;
