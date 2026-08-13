import React from 'react';
import {
  Drawer,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Card,
  Typography,
  Divider,
  Popconfirm,
  Spin,
  Tooltip,
} from 'antd';
import {
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEdit,
  FiTrash2,
  FiSend,
  FiRefreshCw,
  FiLock,
  FiUsers,
  FiFileText,
  FiCheck,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';

const { Title, Text, Paragraph } = Typography;

const getStatusColor = (status) => {
  switch (status) {
    case 'Open':
      return 'success';
    case 'Draft':
      return 'default';
    case 'Paused':
    case 'On Hold':
      return 'warning';
    case 'Closed':
    case 'Filled':
      return 'processing';
    case 'Cancelled':
      return 'error';
    default:
      return 'default';
  }
};

export const JobDetailsDrawer = ({
  visible,
  job,
  loading = false,
  publishing = false,
  closing = false,
  deleting = false,
  onClose,
  onEdit,
  onPublish,
  onCloseJob,
  onDelete,
  onRefresh,
}) => {
  const { t } = useLanguage();

  if (!job) return null;

  const isPublished = Boolean(job.published || job.status === 'Open');
  const isClosed = job.status === 'Closed' || job.status === 'Filled';

  return (
    <Drawer
      title={
        <div style={{ paddingRight: 24 }}>
          <Space align="center" wrap>
            <Title level={4} style={{ margin: 0, fontWeight: 700, color: 'var(--ink, #0f172a)' }}>
              {job.jobTitle}
            </Title>
            <Tag color="blue" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
              {job.jobCode}
            </Tag>
            <Tag color={getStatusColor(job.status)}>
              {t(`jobs.statuses.${job.status}`, job.status)}
            </Tag>
            {job.featuredJob && <Tag color="gold">Featured</Tag>}
          </Space>
          <div style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: '0.85rem' }}>
              <FiMapPin style={{ marginRight: 4 }} />
              {job.location || t('jobs.drawer.notPublished')}
            </Text>
          </div>
        </div>
      }
      placement="right"
      width={720}
      open={visible}
      onClose={onClose}
      extra={
        <Space>
          <Button icon={<FiRefreshCw />} onClick={onRefresh} title={t('jobs.refresh')} />
          <Button icon={<FiEdit />} onClick={() => onEdit(job)}>
            {t('common.edit')}
          </Button>
          {!isPublished && (
            <Button
              type="primary"
              icon={<FiSend />}
              loading={publishing}
              onClick={() => onPublish(job.id)}
              style={{ backgroundColor: 'var(--brand-navy)', borderColor: 'var(--brand-navy)' }}
            >
              {t('jobs.publishJob')}
            </Button>
          )}
          {isPublished && !isClosed && (
            <Button
              icon={<FiLock />}
              loading={closing}
              onClick={() => onCloseJob(job.id)}
            >
              {t('jobs.closeJob')}
            </Button>
          )}
          <Popconfirm
            title={t('jobs.messages.deleteConfirmTitle')}
            description={t('jobs.messages.deleteConfirmSub', { code: job.jobCode })}
            onConfirm={() => onDelete(job.id)}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<FiTrash2 />} loading={deleting} />
          </Popconfirm>
        </Space>
      }
    >
      <Spin spinning={loading}>
        {/* Section 1: Backend Recruitment Pipeline Metrics */}
        <Card
          size="small"
          title={
            <Space>
              <FiUsers style={{ color: 'var(--brand-teal)' }} />
              <span style={{ fontWeight: 600 }}>{t('jobs.drawer.pipeline')}</span>
            </Space>
          }
          style={{ marginBottom: 20, borderRadius: 8, background: 'var(--card-bg, #ffffff)' }}
        >
          <Row gutter={[12, 12]}>
            <Col xs={12} sm={8} md={4}>
              <div style={{ textAlign: 'center', padding: '8px 4px', background: 'rgba(24, 144, 255, 0.05)', borderRadius: 6 }}>
                <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block' }}>
                  {t('jobs.metrics.applications')}
                </Text>
                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                  {job.applicationCount}
                </Title>
              </div>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <div style={{ textAlign: 'center', padding: '8px 4px', background: 'rgba(114, 46, 209, 0.05)', borderRadius: 6 }}>
                <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block' }}>
                  {t('jobs.metrics.shortlisted')}
                </Text>
                <Title level={4} style={{ margin: 0, color: '#722ed1' }}>
                  {job.shortlistedCount}
                </Title>
              </div>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <div style={{ textAlign: 'center', padding: '8px 4px', background: 'rgba(250, 140, 22, 0.05)', borderRadius: 6 }}>
                <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block' }}>
                  {t('jobs.metrics.interviews')}
                </Text>
                <Title level={4} style={{ margin: 0, color: '#fa8c16' }}>
                  {job.interviewCount}
                </Title>
              </div>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <div style={{ textAlign: 'center', padding: '8px 4px', background: 'rgba(19, 194, 194, 0.05)', borderRadius: 6 }}>
                <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block' }}>
                  {t('jobs.metrics.offers')}
                </Text>
                <Title level={4} style={{ margin: 0, color: '#13c2c2' }}>
                  {job.offerCount}
                </Title>
              </div>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <div style={{ textAlign: 'center', padding: '8px 4px', background: 'rgba(82, 196, 26, 0.05)', borderRadius: 6 }}>
                <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block' }}>
                  {t('jobs.metrics.hired')}
                </Text>
                <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                  {job.hiredCount}
                </Title>
              </div>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <div style={{ textAlign: 'center', padding: '8px 4px', background: 'rgba(245, 34, 45, 0.05)', borderRadius: 6 }}>
                <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block' }}>
                  {t('jobs.metrics.rejected')}
                </Text>
                <Title level={4} style={{ margin: 0, color: '#f5222d' }}>
                  {job.rejectedCount}
                </Title>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Section 2: Key Job Specifications */}
        <Card size="small" style={{ marginBottom: 20, borderRadius: 8 }}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>{t('jobs.form.fields.employmentType')}</Text>
              <div style={{ fontWeight: 600 }}>{job.employmentType || '-'}</div>
            </Col>
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>{t('jobs.form.fields.department')}</Text>
              <div style={{ fontWeight: 600 }}>{job.department || '-'}</div>
            </Col>
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>{t('jobs.form.fields.profession')}</Text>
              <div style={{ fontWeight: 600 }}>{job.profession || '-'}</div>
            </Col>
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>{t('jobs.form.fields.industry')}</Text>
              <div style={{ fontWeight: 600 }}>{job.industry || '-'}</div>
            </Col>
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>Company</Text>
              <div style={{ fontWeight: 600 }}>{job.company || '-'}</div>
            </Col>
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>{t('jobs.form.fields.numberOfOpenings')}</Text>
              <div style={{ fontWeight: 600 }}>{t('jobs.drawer.openingsCount', { count: job.numberOfOpenings })}</div>
            </Col>

            {/* Compensation Grid */}
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>Compensation Type</Text>
              <div style={{ fontWeight: 600 }}>{job.compensationType || 'Salary Range'}</div>
            </Col>
            {job.compensationType === 'Collective Agreement (Tarifvertrag)' || job.compensationType === 'Collective Agreement' ? (
              <>
                <Col xs={12} sm={8}>
                  <Text type="secondary" style={{ fontSize: '0.8rem' }}>Tarifgruppe</Text>
                  <div style={{ fontWeight: 600, color: 'var(--brand-teal)' }}>{job.tariffGroup || '-'}</div>
                </Col>
                <Col xs={12} sm={8}>
                  <Text type="secondary" style={{ fontSize: '0.8rem' }}>Entgeltgruppe</Text>
                  <div style={{ fontWeight: 600 }}>{job.entgeltgruppe || '-'}</div>
                </Col>
              </>
            ) : (
              <Col xs={12} sm={8}>
                <Text type="secondary" style={{ fontSize: '0.8rem' }}>{t('jobs.drawer.salaryRange')}</Text>
                <div style={{ fontWeight: 600 }}>
                  {job.minimumSalary || job.maximumSalary ? (
                    <span>
                      {job.currency} {job.minimumSalary ? job.minimumSalary.toLocaleString() : '0'} -{' '}
                      {job.maximumSalary ? job.maximumSalary.toLocaleString() : 'N/A'}
                    </span>
                  ) : (
                    <span>{job.salaryNegotiable ? t('jobs.drawer.negotiable') : '-'}</span>
                  )}
                </div>
              </Col>
            )}

            {/* Dates & Experience */}
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>Target Joining Date</Text>
              <div style={{ fontWeight: 600 }}>
                {job.targetJoiningDate ? dayjs(job.targetJoiningDate).format('DD MMM YYYY') : '-'}
              </div>
            </Col>
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>Closing Date</Text>
              <div style={{ fontWeight: 600 }}>
                {job.closingDate ? dayjs(job.closingDate).format('DD MMM YYYY') : '-'}
              </div>
            </Col>
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>{t('jobs.drawer.experienceRange')}</Text>
              <div style={{ fontWeight: 600 }}>
                {job.minimumExperience} - {job.maximumExperience} {t('jobs.drawer.yearsUnit')}
              </div>
            </Col>

            {/* Location & Workplace */}
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>Address & Location</Text>
              <div style={{ fontWeight: 500 }}>
                {job.address ? `${job.address}, ` : ''}{job.location || '-'}
              </div>
            </Col>
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>{t('jobs.drawer.workplace')}</Text>
              <div>
                {job.remote && <Tag color="blue">Remote</Tag>}
                {job.hybrid && <Tag color="purple">Hybrid</Tag>}
                {!job.remote && !job.hybrid && <Tag>Onsite</Tag>}
              </div>
            </Col>
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>Language Requirements</Text>
              <div>
                {job.germanLevelRequired && <Tag color="orange">DE: {job.germanLevelRequired}</Tag>}
                {job.englishLevelRequired && <Tag color="cyan">EN: {job.englishLevelRequired}</Tag>}
                {!job.germanLevelRequired && !job.englishLevelRequired && <span>-</span>}
              </div>
            </Col>

            {/* Preferences & Limits */}
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>Candidate Eligibility</Text>
              <div>
                {job.allowDomesticCandidates && <Tag color="green">Domestic</Tag>}
                {job.allowInternationalCandidates && <Tag color="geekblue">International</Tag>}
              </div>
            </Col>
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>Max Applicants Limit</Text>
              <div style={{ fontWeight: 600 }}>
                {job.maxApplicantsLimit ? job.maxApplicantsLimit : 'Unlimited'}
                {job.autoCloseOnLimit && <Tag color="volcano" style={{ marginLeft: 6 }}>Auto Close</Tag>}
              </div>
            </Col>
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>{t('jobs.form.fields.hiringManager')}</Text>
              <div style={{ fontWeight: 500 }}>{job.hiringManager || '-'}</div>
            </Col>
            <Col xs={12} sm={8}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>{t('jobs.form.fields.recruiter')}</Text>
              <div style={{ fontWeight: 500 }}>{job.recruiter || '-'}</div>
            </Col>
            {job.keywords && (
              <Col xs={24}>
                <Text type="secondary" style={{ fontSize: '0.8rem' }}>Keywords</Text>
                <div>
                  {job.keywords.split(',').map((kw, idx) => (
                    <Tag key={idx} style={{ marginTop: 4 }}>{kw.trim()}</Tag>
                  ))}
                </div>
              </Col>
            )}
          </Row>

          <Divider style={{ margin: '12px 0' }} />

          <Row gutter={[16, 8]}>
            <Col xs={24} sm={12}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>{t('jobs.drawer.publishedStatus')}</Text>
              <div>
                {job.published ? (
                  <Tag icon={<FiCheck />} color="success">
                    {job.publishedAt
                      ? t('jobs.drawer.publishedByOn', {
                          user: job.publishedBy || 'System',
                          date: dayjs(job.publishedAt).format('DD MMM YYYY'),
                        })
                      : t('jobs.filters.published')}
                  </Tag>
                ) : (
                  <Tag color="default">{t('jobs.drawer.notPublished')}</Tag>
                )}
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>{t('jobs.table.created')}</Text>
              <div style={{ fontSize: '0.85rem' }}>
                {job.creation ? dayjs(job.creation).format('DD MMM YYYY, HH:mm') : '-'}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Section 3: Detailed Job Content */}
        {job.jobSummary && (
          <div style={{ marginBottom: 20 }}>
            <Title level={5}>
              <FiFileText style={{ marginRight: 6, color: 'var(--brand-teal)' }} />
              {t('jobs.drawer.description')}
            </Title>
            <Paragraph style={{ whiteSpace: 'pre-line', color: 'var(--ink-secondary)' }}>
              {job.jobSummary}
            </Paragraph>
          </div>
        )}

        {job.responsibilities && (
          <div style={{ marginBottom: 20 }}>
            <Title level={5}>{t('jobs.drawer.responsibilities')}</Title>
            <Paragraph style={{ whiteSpace: 'pre-line', color: 'var(--ink-secondary)' }}>
              {job.responsibilities}
            </Paragraph>
          </div>
        )}

        {job.requirements && (
          <div style={{ marginBottom: 20 }}>
            <Title level={5}>{t('jobs.drawer.requirements')}</Title>
            <Paragraph style={{ whiteSpace: 'pre-line', color: 'var(--ink-secondary)' }}>
              {job.requirements}
            </Paragraph>
          </div>
        )}

        {job.benefits && (
          <div style={{ marginBottom: 20 }}>
            <Title level={5}>{t('jobs.drawer.benefits')}</Title>
            <Paragraph style={{ whiteSpace: 'pre-line', color: 'var(--ink-secondary)' }}>
              {job.benefits}
            </Paragraph>
          </div>
        )}
      </Spin>
    </Drawer>
  );
};

export default JobDetailsDrawer;
