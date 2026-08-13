import React, { useEffect } from 'react';
import { Row, Col, Typography, Alert, Button, Spin } from 'antd';
import {
  FiBriefcase,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiCheckCircle,
  FiAward,
  FiXCircle,
  FiLayers,
  FiTrendingUp,
  FiClock,
  FiRefreshCw,
} from 'react-icons/fi';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useLanguage } from '../../../hooks/useLanguage';
import AnalyticsKpiCard from './components/AnalyticsKpiCard';
import AnalyticsFilterBar from './components/AnalyticsFilterBar';
import RecruitmentFunnel from './components/RecruitmentFunnel';
import TrendsChart from './components/TrendsChart';
import JobMetricsSection from './components/JobMetricsSection';
import ApplicationMetricsSection from './components/ApplicationMetricsSection';
import InterviewMetricsSection from './components/InterviewMetricsSection';
import OfferMetricsSection from './components/OfferMetricsSection';
import TimeToHireCard from './components/TimeToHireCard';
import RecentActivity from './components/RecentActivity';
import './components/AnalyticsComponents.css';

const { Title, Text } = Typography;

export const AnalyticsPage = () => {
  const { t } = useLanguage();
  const {
    overview,
    funnel,
    trends,
    jobMetrics,
    applicationMetrics,
    interviewMetrics,
    offerMetrics,
    timeToHire,
    recentActivity,
    filters,
    pagination,
    loading,
    errors,
    refreshAll,
    setFilters,
    setGranularity,
    setActivityEntity,
    setActivityPage,
    resetFilters,
  } = useAnalytics();

  // Load analytics metrics on mount & filter changes
  useEffect(() => {
    refreshAll();
  }, [filters.fromDate, filters.toDate, filters.jobOpening, filters.granularity]);

  const hasGlobalError = Object.values(errors).some((e) => Boolean(e));
  const isAnyLoading = Object.values(loading).some((l) => Boolean(l));

  // Destructure overview KPIs with defaults
  const kpiData = overview || {
    openJobs: 0,
    totalJobs: 0,
    totalCandidates: 0,
    totalApplications: 0,
    activeApplications: 0,
    todaysInterviews: 0,
    totalInterviews: 0,
    pendingOffers: 0,
    acceptedOffers: 0,
    totalHires: 0,
    rejectedApplications: 0,
  };

  return (
    <div className="analytics-page-container">
      {/* Header */}
      <div className="analytics-header-section">
        <div>
          <Title level={2} className="analytics-title">
            {t('analytics.title')}
          </Title>
          <Text type="secondary" className="analytics-subtitle">
            {t('analytics.subtitle')}
          </Text>
        </div>
        <Button
          type="primary"
          icon={<FiRefreshCw size={16} className={isAnyLoading ? 'spin-icon' : ''} />}
          onClick={refreshAll}
          loading={isAnyLoading}
        >
          {t('analytics.refresh')}
        </Button>
      </div>

      {/* Global Backend Error Banner */}
      {hasGlobalError && (
        <Alert
          message={t('analytics.error')}
          description="One or more analytics services could not be retrieved from Frappe backend."
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" danger onClick={refreshAll}>
              {t('common.retry')}
            </Button>
          }
          style={{ marginBottom: 20 }}
        />
      )}

      {/* Filter Bar */}
      <AnalyticsFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={resetFilters}
        onRefresh={refreshAll}
        loading={isAnyLoading}
      />

      {/* Overview 11 KPI Cards Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <AnalyticsKpiCard
            title={t('analytics.kpi.openJobs')}
            value={kpiData.openJobs}
            icon={FiBriefcase}
            accentColor="#10B981"
            loading={loading.overview}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <AnalyticsKpiCard
            title={t('analytics.kpi.totalJobs')}
            value={kpiData.totalJobs}
            icon={FiLayers}
            accentColor="#3B82F6"
            loading={loading.overview}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <AnalyticsKpiCard
            title={t('analytics.kpi.totalCandidates')}
            value={kpiData.totalCandidates}
            icon={FiUsers}
            accentColor="#8B5CF6"
            loading={loading.overview}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <AnalyticsKpiCard
            title={t('analytics.kpi.totalApplications')}
            value={kpiData.totalApplications}
            icon={FiFileText}
            accentColor="#6366F1"
            loading={loading.overview}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <AnalyticsKpiCard
            title={t('analytics.kpi.activeApplications')}
            value={kpiData.activeApplications}
            icon={FiTrendingUp}
            accentColor="#EC4899"
            loading={loading.overview}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <AnalyticsKpiCard
            title={t('analytics.kpi.todaysInterviews')}
            value={kpiData.todaysInterviews}
            icon={FiCalendar}
            accentColor="#F59E0B"
            loading={loading.overview}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <AnalyticsKpiCard
            title={t('analytics.kpi.totalInterviews')}
            value={kpiData.totalInterviews}
            icon={FiCalendar}
            accentColor="#14B8A6"
            loading={loading.overview}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <AnalyticsKpiCard
            title={t('analytics.kpi.pendingOffers')}
            value={kpiData.pendingOffers}
            icon={FiClock}
            accentColor="#EAB308"
            loading={loading.overview}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <AnalyticsKpiCard
            title={t('analytics.kpi.acceptedOffers')}
            value={kpiData.acceptedOffers}
            icon={FiCheckCircle}
            accentColor="#10B981"
            loading={loading.overview}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <AnalyticsKpiCard
            title={t('analytics.kpi.totalHires')}
            value={kpiData.totalHires}
            icon={FiAward}
            accentColor="#059669"
            loading={loading.overview}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <AnalyticsKpiCard
            title={t('analytics.kpi.rejectedApplications')}
            value={kpiData.rejectedApplications}
            icon={FiXCircle}
            accentColor="#EF4444"
            loading={loading.overview}
          />
        </Col>
      </Row>

      {/* Recruitment Funnel & Application Trends */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <RecruitmentFunnel funnelData={funnel} loading={loading.funnel} />
        </Col>
        <Col xs={24} lg={12}>
          <TrendsChart
            trends={trends}
            granularity={filters.granularity}
            onGranularityChange={setGranularity}
            loading={loading.trends}
          />
        </Col>
      </Row>

      {/* Job Opening & Application Metrics */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <JobMetricsSection jobMetrics={jobMetrics} loading={loading.jobMetrics} />
        </Col>
        <Col xs={24} lg={12}>
          <ApplicationMetricsSection
            applicationMetrics={applicationMetrics}
            loading={loading.applicationMetrics}
          />
        </Col>
      </Row>

      {/* Interview & Offer Metrics */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <InterviewMetricsSection
            interviewMetrics={interviewMetrics}
            loading={loading.interviewMetrics}
          />
        </Col>
        <Col xs={24} lg={12}>
          <OfferMetricsSection offerMetrics={offerMetrics} loading={loading.offerMetrics} />
        </Col>
      </Row>

      {/* Time to Hire & Recent Activity */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <TimeToHireCard timeToHire={timeToHire} loading={loading.timeToHire} />
        </Col>
        <Col xs={24} lg={16}>
          <RecentActivity
            recentActivity={recentActivity}
            pagination={pagination}
            selectedEntity={filters.activityEntity}
            onEntityChange={setActivityEntity}
            onPageChange={setActivityPage}
            loading={loading.activity}
          />
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsPage;
