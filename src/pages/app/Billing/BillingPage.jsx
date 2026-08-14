import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Typography,
  Card,
  Button,
  Tag,
  Progress,
  Table,
  Alert,
  Modal,
  Spin,
  Skeleton,
  Empty,
  Divider,
  Space,
} from 'antd';
import {
  FiRefreshCw,
  FiCheckCircle,
  FiZap,
  FiBriefcase,
  FiUsers,
  FiUserCheck,
  FiHardDrive,
  FiFileText,
  FiCreditCard,
  FiExternalLink,
  FiArrowRight,
  FiLock,
} from 'react-icons/fi';
import { useBilling } from '../../../hooks/useBilling';
import { useLanguage } from '../../../hooks/useLanguage';
import './BillingComponents.css';

const { Title, Text, Paragraph } = Typography;

export const BillingPage = () => {
  const { t } = useLanguage();
  const {
    overview,
    subscription,
    usage,
    plans,
    invoices,
    paymentHistory,
    upgradePreviewData,
    loading,
    updating,
    error,
    refreshAll,
    upgradePreview,
    clearPreview,
  } = useBilling();

  const [selectedPlanForPreview, setSelectedPlanForPreview] = useState(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Handle plan upgrade preview click
  const handleOpenPreview = async (planName) => {
    if (!planName) return;
    setSelectedPlanForPreview(planName);
    setIsPreviewModalVisible(true);
    try {
      await upgradePreview(planName);
    } catch (e) {
      // Error handled by Redux slice
    }
  };

  const handleClosePreviewModal = () => {
    setIsPreviewModalVisible(false);
    setSelectedPlanForPreview(null);
    clearPreview();
  };

  // Derive active subscription object safely
  const activeSub =
    subscription?.subscription ||
    overview?.subscription ||
    null;

  const currentPlanDetails = subscription?.planDetails || null;
  const currentPlanName = activeSub?.plan || currentPlanDetails?.planName || null;

  // Derive quotas safely
  const quotas = usage?.quotas || null;
  const hasQuotas =
    quotas &&
    (Boolean(quotas.activeJobs) ||
      Boolean(quotas.recruiters) ||
      Boolean(quotas.candidates) ||
      Boolean(quotas.storageGb));

  // Helper for status badge color
  const getStatusTagColor = (status) => {
    if (!status) return 'default';
    const s = String(status).toLowerCase();
    if (s.includes('active')) return 'success';
    if (s.includes('trial')) return 'processing';
    if (s.includes('expired') || s.includes('cancelled')) return 'error';
    return 'warning';
  };

  // Helper for rendering auto-renew status string safely
  const renderAutoRenewText = (autoRenew) => {
    if (autoRenew === true) return 'Enabled';
    if (autoRenew === false) return 'Disabled';
    return 'Not available';
  };

  // Safe Quota calculation
  const renderQuotaProgress = (quotaItem) => {
    if (!quotaItem) return { used: 'Not available', limit: 'Not available', percent: 0, isUnlimited: false };

    const isUnlimited = Boolean(quotaItem.unlimited) || quotaItem.limit === -1;
    const used = quotaItem.used ?? 0;
    const limit = quotaItem.limit ?? 0;

    let percent = 0;
    if (!isUnlimited && limit > 0) {
      percent = Math.min(100, Math.round((used / limit) * 100));
    }

    return {
      used,
      limit: isUnlimited ? t('billing.unlimited') : limit,
      percent,
      isUnlimited,
    };
  };

  // Invoices table columns
  const invoiceColumns = [
    {
      title: t('billing.invoiceNumber'),
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (val, record) => (
        <Space direction="horizontal">
          <FiFileText />
          <Text strong>{val || record?.name || 'Not available'}</Text>
        </Space>
      ),
    },
    {
      title: t('billing.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => `${amount ?? 0} ${record?.currency || 'USD'}`,
    },
    {
      title: t('billing.status'),
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <Tag color={getStatusTagColor(status)}>{status || 'Unknown'}</Tag>
      ),
    },
    {
      title: t('billing.paidAt'),
      dataIndex: 'paidAt',
      key: 'paidAt',
      render: (val, record) => val || record?.postingDate || 'Not available',
    },
    {
      title: t('common.actions'),
      dataIndex: 'receiptUrl',
      key: 'receiptUrl',
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            <FiExternalLink style={{ marginRight: 4 }} />
            {t('billing.downloadReceipt')}
          </a>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  // Payment History table columns
  const paymentColumns = [
    {
      title: t('billing.transactionId'),
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (val, record) => (
        <Space direction="horizontal">
          <FiCreditCard />
          <Text code>{val || record?.name || 'Not available'}</Text>
        </Space>
      ),
    },
    {
      title: t('billing.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => `${amount ?? 0} ${record?.currency || 'USD'}`,
    },
    {
      title: t('billing.status'),
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <Tag color={getStatusTagColor(status)}>{status || 'Unknown'}</Tag>
      ),
    },
    {
      title: t('billing.provider'),
      dataIndex: 'provider',
      key: 'provider',
      render: (val) => val || 'Not specified',
    },
    {
      title: t('billing.paymentDate'),
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (val) => val || 'Not available',
    },
  ];

  return (
    <div className="billing-page-container">
      {/* Header */}
      <div className="billing-header-section">
        <div>
          <Title level={2} className="billing-title">
            {t('billing.title')}
          </Title>
          <Text type="secondary" className="billing-subtitle">
            {t('billing.subtitle')}
          </Text>
        </div>
        <Button
          type="primary"
          icon={<FiRefreshCw className={loading ? 'spin-icon' : ''} size={16} />}
          onClick={refreshAll}
          loading={loading}
        >
          {t('billing.refresh')}
        </Button>
      </div>

      {/* Global Error Alert */}
      {error && (
        <Alert
          message={t('common.error')}
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" danger onClick={refreshAll}>
              {t('common.retry')}
            </Button>
          }
          style={{ marginBottom: 24 }}
        />
      )}

      {loading && !activeSub && Array.isArray(plans) && plans.length === 0 ? (
        <div style={{ padding: '40px 0' }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      ) : (
        <>
          {/* Hero Subscription Card */}
          <div className="subscription-hero-card">
            <Row gutter={[24, 16]} align="middle">
              <Col xs={24} md={16}>
                <Space direction="vertical" size={8}>
                  <Space align="center">
                    <FiZap size={24} style={{ color: '#F59E0B' }} />
                    <Title level={3} className="subscription-hero-title">
                      {activeSub?.plan ? `${activeSub?.plan} Plan` : t('billing.noSubscription')}
                    </Title>
                    {activeSub?.status && (
                      <Tag color={getStatusTagColor(activeSub?.status)} style={{ fontSize: 13, padding: '2px 10px' }}>
                        {activeSub?.status}
                      </Tag>
                    )}
                  </Space>
                  <Text className="subscription-hero-sub">
                    {activeSub
                      ? `${t('billing.billingCycle')}: ${activeSub?.billingCycle || 'N/A'} | ${
                          activeSub?.startDate ? `${t('billing.startDate')}: ${activeSub?.startDate}` : ''
                        } ${activeSub?.endDate ? `| ${t('billing.endDate')}: ${activeSub?.endDate}` : ''}`
                      : t('billing.noSubscription')}
                  </Text>
                  <Text style={{ color: '#cbd5e1', fontSize: 13 }}>
                    {t('billing.autoRenew')}: {renderAutoRenewText(activeSub?.autoRenew)}
                  </Text>
                </Space>
              </Col>
              <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                {overview?.company && (
                  <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                    Company: {overview.company}
                  </Tag>
                )}
              </Col>
            </Row>
          </div>

          {/* Usage & Quotas Section */}
          <Card title={t('billing.usageQuotas')} className="billing-card" style={{ marginBottom: 24 }}>
            {hasQuotas ? (
              <Row gutter={[20, 20]}>
                {/* Active Jobs */}
                {quotas.activeJobs && (
                  <Col xs={24} sm={12} lg={6}>
                    <div className="usage-metric-card">
                      <Space align="center" style={{ marginBottom: 8 }}>
                        <FiBriefcase color="#3B82F6" size={18} />
                        <Text strong>{t('billing.activeJobs')}</Text>
                      </Space>
                      {(() => {
                        const { used, limit, percent, isUnlimited } = renderQuotaProgress(quotas.activeJobs);
                        return (
                          <>
                            <div style={{ fontSize: 20, fontWeight: 600, margin: '8px 0' }}>
                              {used} / {limit}
                            </div>
                            {!isUnlimited && <Progress percent={percent} status={percent >= 90 ? 'exception' : 'active'} />}
                          </>
                        );
                      })()}
                    </div>
                  </Col>
                )}

                {/* Recruiters */}
                {quotas.recruiters && (
                  <Col xs={24} sm={12} lg={6}>
                    <div className="usage-metric-card">
                      <Space align="center" style={{ marginBottom: 8 }}>
                        <FiUsers color="#10B981" size={18} />
                        <Text strong>{t('billing.recruiters')}</Text>
                      </Space>
                      {(() => {
                        const { used, limit, percent, isUnlimited } = renderQuotaProgress(quotas.recruiters);
                        return (
                          <>
                            <div style={{ fontSize: 20, fontWeight: 600, margin: '8px 0' }}>
                              {used} / {limit}
                            </div>
                            {!isUnlimited && <Progress percent={percent} status={percent >= 90 ? 'exception' : 'active'} />}
                          </>
                        );
                      })()}
                    </div>
                  </Col>
                )}

                {/* Candidates */}
                {quotas.candidates && (
                  <Col xs={24} sm={12} lg={6}>
                    <div className="usage-metric-card">
                      <Space align="center" style={{ marginBottom: 8 }}>
                        <FiUserCheck color="#8B5CF6" size={18} />
                        <Text strong>{t('billing.candidates')}</Text>
                      </Space>
                      {(() => {
                        const { used, limit, percent, isUnlimited } = renderQuotaProgress(quotas.candidates);
                        return (
                          <>
                            <div style={{ fontSize: 20, fontWeight: 600, margin: '8px 0' }}>
                              {used} / {limit}
                            </div>
                            {!isUnlimited && <Progress percent={percent} status={percent >= 90 ? 'exception' : 'active'} />}
                          </>
                        );
                      })()}
                    </div>
                  </Col>
                )}

                {/* Storage */}
                {quotas.storageGb && (
                  <Col xs={24} sm={12} lg={6}>
                    <div className="usage-metric-card">
                      <Space align="center" style={{ marginBottom: 8 }}>
                        <FiHardDrive color="#F59E0B" size={18} />
                        <Text strong>{t('billing.storage')}</Text>
                      </Space>
                      {(() => {
                        const { used, limit, percent, isUnlimited } = renderQuotaProgress(quotas.storageGb);
                        return (
                          <>
                            <div style={{ fontSize: 20, fontWeight: 600, margin: '8px 0' }}>
                              {typeof used === 'number' ? used.toFixed(2) : used} / {limit}
                            </div>
                            {!isUnlimited && <Progress percent={percent} status={percent >= 90 ? 'exception' : 'active'} />}
                          </>
                        );
                      })()}
                    </div>
                  </Col>
                )}
              </Row>
            ) : (
              <Empty description={t('common.noData')} />
            )}
          </Card>

          {/* Available Plans Catalog */}
          <Card title={t('billing.availablePlans')} className="billing-card" style={{ marginBottom: 24 }}>
            {plans && Array.isArray(plans) && plans.length > 0 ? (
              <Row gutter={[24, 24]}>
                {plans.map((p) => {
                  if (!p) return null;
                  const pName = p.planName || p.name || 'Unnamed Plan';
                  const isCurrent = currentPlanName && (p.planName === currentPlanName || p.name === currentPlanName);
                  return (
                    <Col xs={24} sm={12} lg={8} key={p.id || pName}>
                      <Card
                        className={`plan-card ${isCurrent ? 'plan-card-current' : ''}`}
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ fontSize: 16 }}>{pName}</Text>
                            {isCurrent && <Tag color="blue">{t('billing.currentPlan')}</Tag>}
                          </div>
                        }
                      >
                        <div style={{ marginBottom: 16 }}>
                          <div className="plan-price-large">
                            {p.currency || 'USD'} {p.monthlyPrice ?? 0}
                            <span style={{ fontSize: 14, fontWeight: 400, color: '#64748b' }}> {t('billing.perMonth')}</span>
                          </div>
                          {(p.yearlyPrice ?? 0) > 0 && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Yearly: {p.currency || 'USD'} {p.yearlyPrice} {t('billing.perYear')}
                            </Text>
                          )}
                        </div>

                        {p.description && (
                          <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
                            {p.description}
                          </Paragraph>
                        )}

                        <Divider style={{ margin: '12px 0' }} />

                        <div style={{ flex: 1, marginBottom: 20 }}>
                          <div style={{ marginBottom: 6 }}>
                            <FiCheckCircle color="#10B981" style={{ marginRight: 8 }} />
                            <Text>{t('billing.activeJobs')}: {p.maxActiveJobs === -1 ? t('billing.unlimited') : (p.maxActiveJobs ?? 'N/A')}</Text>
                          </div>
                          <div style={{ marginBottom: 6 }}>
                            <FiCheckCircle color="#10B981" style={{ marginRight: 8 }} />
                            <Text>{t('billing.recruiters')}: {p.maxRecruiters === -1 ? t('billing.unlimited') : (p.maxRecruiters ?? 'N/A')}</Text>
                          </div>
                          <div style={{ marginBottom: 6 }}>
                            <FiCheckCircle color="#10B981" style={{ marginRight: 8 }} />
                            <Text>{t('billing.candidates')}: {p.maxCandidates === -1 ? t('billing.unlimited') : (p.maxCandidates ?? 'N/A')}</Text>
                          </div>
                          <div style={{ marginBottom: 6 }}>
                            <FiCheckCircle color="#10B981" style={{ marginRight: 8 }} />
                            <Text>{t('billing.storage')}: {p.storageGb ?? 0} GB</Text>
                          </div>

                          {p.canUseAnalytics && (
                            <div style={{ marginBottom: 6 }}>
                              <FiCheckCircle color="#10B981" style={{ marginRight: 8 }} />
                              <Text>Analytics Dashboard</Text>
                            </div>
                          )}
                          {p.canUseTalentPool && (
                            <div style={{ marginBottom: 6 }}>
                              <FiCheckCircle color="#10B981" style={{ marginRight: 8 }} />
                              <Text>Talent Pools Access</Text>
                            </div>
                          )}
                        </div>

                        <Button
                          type={isCurrent ? 'default' : 'primary'}
                          block
                          icon={<FiArrowRight />}
                          onClick={() => handleOpenPreview(pName)}
                          disabled={Boolean(isCurrent)}
                        >
                          {isCurrent ? t('billing.currentPlan') : t('billing.upgradePlan')}
                        </Button>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            ) : (
              <Empty description="No available plans returned by server" />
            )}
          </Card>

          {/* Invoice History Section */}
          <Card title={t('billing.invoices')} className="billing-card" style={{ marginBottom: 24 }}>
            {invoices && Array.isArray(invoices) && invoices.length > 0 ? (
              <Table
                dataSource={invoices}
                columns={invoiceColumns}
                rowKey={(r) => r.id || r.invoiceNumber || r.name || String(Math.random())}
                pagination={false}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {t('billing.noInvoices')}
                  </Text>
                }
              />
            )}
          </Card>

          {/* Payment History Section */}
          <Card title={t('billing.paymentHistory')} className="billing-card">
            {paymentHistory && Array.isArray(paymentHistory) && paymentHistory.length > 0 ? (
              <Table
                dataSource={paymentHistory}
                columns={paymentColumns}
                rowKey={(r) => r.id || r.transactionId || r.name || String(Math.random())}
                pagination={false}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {t('billing.noPaymentHistory')}
                  </Text>
                }
              />
            )}
          </Card>
        </>
      )}

      {/* Upgrade Preview Modal */}
      <Modal
        title={
          <Space>
            <FiZap color="#F59E0B" />
            <span>{t('billing.upgradePreview')}</span>
          </Space>
        }
        open={isPreviewModalVisible}
        onCancel={handleClosePreviewModal}
        footer={[
          <Button key="close" onClick={handleClosePreviewModal}>
            {t('common.close')}
          </Button>,
        ]}
        width={600}
      >
        {updating ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" description="Calculating upgrade preview from backend..." />
          </div>
        ) : upgradePreviewData ? (
          <div>
            {/* Critical Payment Notice */}
            <Alert
              message={
                <Space align="center">
                  <FiLock color="#D97706" />
                  <Text strong>{t('billing.paymentUnavailableNotice')}</Text>
                </Space>
              }
              description="Checkout/payment initiation is not enabled on backend. This modal displays read-only backend upgrade rules & calculations."
              type="warning"
              showIcon={false}
              style={{ marginBottom: 20 }}
            />

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Card size="small" title={t('billing.currentPlan')}>
                  <Text strong style={{ fontSize: 16 }}>
                    {upgradePreviewData.currentPlan || 'N/A'}
                  </Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title={t('billing.targetPlan')}>
                  <Text strong style={{ fontSize: 16, color: '#3b82f6' }}>
                    {upgradePreviewData.targetPlan || selectedPlanForPreview || 'N/A'}
                  </Text>
                </Card>
              </Col>
            </Row>

            {/* Status & Eligibility */}
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Text strong>{t('billing.canChange')}:</Text>
                {upgradePreviewData.canChange ? (
                  <Tag color="success">Eligible</Tag>
                ) : (
                  <Tag color="error">Not Eligible</Tag>
                )}
                {upgradePreviewData.isDowngrade && <Tag color="warning">Downgrade</Tag>}
              </Space>
            </div>

            {/* Downgrade violations */}
            {upgradePreviewData.downgradeViolations &&
              Array.isArray(upgradePreviewData.downgradeViolations) &&
              upgradePreviewData.downgradeViolations.length > 0 && (
                <Alert
                  message={t('billing.downgradeViolations')}
                  description={
                    <ul>
                      {upgradePreviewData.downgradeViolations.map((v, idx) => (
                        <li key={idx}>{v}</li>
                      ))}
                    </ul>
                  }
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

            {/* Price Difference */}
            {upgradePreviewData.priceDifference && (
              <Card size="small" title={t('billing.priceDifference')} style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">{t('billing.monthly')}:</Text>{' '}
                    <Text strong>
                      {upgradePreviewData.priceDifference.currency || 'USD'}{' '}
                      {upgradePreviewData.priceDifference.monthly ?? 0}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">{t('billing.yearly')}:</Text>{' '}
                    <Text strong>
                      {upgradePreviewData.priceDifference.currency || 'USD'}{' '}
                      {upgradePreviewData.priceDifference.yearly ?? 0}
                    </Text>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Limit Changes */}
            {upgradePreviewData.limitChanges && (
              <Card size="small" title={t('billing.limitChanges')}>
                {Object.entries(upgradePreviewData.limitChanges).map(([key, val]) => (
                  <Row key={key} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <Col span={12}>
                      <Text strong style={{ textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">{val?.current ?? 'N/A'}</Text> <FiArrowRight size={12} />{' '}
                      <Text strong color="#10b981">
                        {val?.target ?? 'N/A'}
                      </Text>
                    </Col>
                  </Row>
                ))}
              </Card>
            )}
          </div>
        ) : (
          <Empty description="No preview data available" />
        )}
      </Modal>
    </div>
  );
};

export default BillingPage;
