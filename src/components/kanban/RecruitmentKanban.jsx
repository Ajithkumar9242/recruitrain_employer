import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Select,
  Tag,
  Typography,
  Space,
  Button,
  Spin,
  Tooltip,
  Avatar,
  message,
  Dropdown,
  Row,
  Col,
} from 'antd';
import {
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiUser,
  FiBriefcase,
  FiMoreVertical,
  FiClock,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useLanguage } from '../../hooks/useLanguage';
import jobApi from '../../services/jobApi';
import { useJobApplications } from '../../hooks/useJobApplications';

const { Text, Title } = Typography;
const { Option } = Select;

// Certified Job Application Stages
const KANBAN_STAGES = [
  'Applied',
  'Screening',
  'Shortlisted',
  'Interview',
  'Technical',
  'HR',
  'Offered',
  'Hired',
  'Rejected',
  'Withdrawn',
];

const STAGE_COLORS = {
  Applied: 'blue',
  Screening: 'cyan',
  Shortlisted: 'purple',
  Interview: 'geekblue',
  Technical: 'indigo',
  HR: 'magenta',
  Offered: 'orange',
  Hired: 'green',
  Rejected: 'red',
  Withdrawn: 'default',
};

export const RecruitmentKanban = ({
  onViewApplication,
  onViewCandidate,
}) => {
  const { t } = useLanguage();
  const {
    items: reduxApps,
    loading: loadingApps,
    changeStage,
    loadApplications,
    setFilters,
  } = useJobApplications();

  const [jobOpenings, setJobOpenings] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [draggingAppId, setDraggingAppId] = useState(null);
  const [updatingAppId, setUpdatingAppId] = useState(null);

  // Load Job Openings for Selector
  const loadJobOpenings = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const res = await jobApi.listJobs({ pageSize: 100 });
      const rawJobItems =
        res?.items ||
        res?.data?.items ||
        res?.data ||
        res?.message?.data ||
        res?.message?.items ||
        res?.message ||
        [];
      setJobOpenings(Array.isArray(rawJobItems) ? rawJobItems : []);
    } catch (err) {
      console.error('Failed to fetch job openings for Kanban:', err);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    loadJobOpenings();
    loadApplications();
  }, [loadJobOpenings, loadApplications]);

  const handleJobSelectChange = (val) => {
    setSelectedJobId(val);
    setFilters({ jobOpening: val || null });
  };

  const applications = selectedJobId
    ? reduxApps.filter((a) => a.jobOpening === selectedJobId || a.jobOpeningId === selectedJobId)
    : reduxApps;

  // Stage Transition Logic
  const handleStageTransition = async (appId, targetStage) => {
    const app = applications.find((a) => a.id === appId);
    if (!app || app.currentStage === targetStage) return;

    setUpdatingAppId(appId);
    try {
      const result = await changeStage(appId, targetStage);
      if (!result?.error) {
        message.success(t('jobApplications.messages.stageSuccess', `Application moved to ${targetStage}`));
      }
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Stage transition rejected by backend.';
      message.error(msg);
    } finally {
      setUpdatingAppId(null);
    }
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('text/plain', appId);
    setDraggingAppId(appId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggingAppId;
    setDraggingAppId(null);
    if (appId) {
      handleStageTransition(appId, targetStage);
    }
  };

  return (
    <div className="recruitment-kanban-container" style={{ width: '100%' }}>
      {/* Kanban Header & Job Opening Selector Toolbar */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 8 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={16} md={12}>
            <Space align="center" style={{ width: '100%' }}>
              <Text strong style={{ minWidth: 100 }}>Job Opening:</Text>
              <Select
                placeholder="All Job Openings"
                allowClear
                value={selectedJobId}
                onChange={handleJobSelectChange}
                loading={loadingJobs}
                style={{ width: '100%', minWidth: 260 }}
              >
                {jobOpenings.map((job) => (
                  <Option key={job.id} value={job.id}>
                    {job.jobTitle || job.title} ({job.department || job.jobCode || job.id})
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={8} md={6} style={{ textAlign: 'right' }}>
            <Button
              icon={<FiRefreshCw />}
              onClick={loadApplications}
              loading={loadingApps}
            >
              {t('common.refresh', 'Refresh')}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Horizontally Scrollable Kanban Columns Container */}
      {loadingApps && applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px' }}>
          <Spin tip="Loading recruitment pipeline..." />
        </div>
      ) : (
        <div
          className="kanban-board-scroll-region"
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '16px',
            minHeight: '620px',
          }}
        >
          {KANBAN_STAGES.map((stage) => {
            const stageApps = applications.filter((app) => (app.currentStage || app.status) === stage);

            return (
              <div
                key={stage}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
                style={{
                  flex: '0 0 280px',
                  width: '280px',
                  backgroundColor: 'var(--slate-50, #f8fafc)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid var(--border, #e2e8f0)',
                }}
              >
                {/* Stage Header */}
                <div
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid var(--border, #cbd5e1)',
                  }}
                >
                  <Space align="center" size="small">
                    <Tag color={STAGE_COLORS[stage] || 'default'} style={{ margin: 0, fontWeight: 600 }}>
                      {stage}
                    </Tag>
                  </Space>
                  <Text type="secondary" strong style={{ fontSize: '0.85rem' }}>
                    {stageApps.length}
                  </Text>
                </div>

                {/* Cards Container */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    flex: 1,
                    overflowY: 'auto',
                    minHeight: '150px',
                  }}
                >
                  {stageApps.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '24px 8px',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '6px',
                        color: '#94a3b8',
                        fontSize: '0.8rem',
                      }}
                    >
                      Drop applications here
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <Card
                        key={app.id}
                        size="small"
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        style={{
                          borderRadius: '6px',
                          cursor: 'grab',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          border: updatingAppId === app.id ? '1px solid var(--brand-teal)' : '1px solid #e2e8f0',
                          opacity: draggingAppId === app.id ? 0.5 : 1,
                        }}
                        bodyStyle={{ padding: '10px 12px' }}
                      >
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Row justify="space-between" align="top">
                            <Col span={18}>
                              <Space align="center" size="small">
                                <Avatar
                                  size={24}
                                  style={{
                                    backgroundColor: 'var(--brand-navy-soft, #e6f0fa)',
                                    color: 'var(--brand-teal, #008080)',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {(app.candidateName || 'C').charAt(0).toUpperCase()}
                                </Avatar>
                                <Text
                                  strong
                                  style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--ink, #0f172a)',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => onViewCandidate && onViewCandidate(app.candidate)}
                                >
                                  {app.candidateName || app.candidate}
                                </Text>
                              </Space>
                            </Col>
                            <Col span={6} style={{ textAlign: 'right' }}>
                              <Dropdown
                                menu={{
                                  items: [
                                    {
                                      key: 'view-app',
                                      icon: <FiEye />,
                                      label: 'View Application',
                                      onClick: () => onViewApplication && onViewApplication(app),
                                    },
                                    {
                                      key: 'view-cand',
                                      icon: <FiUser />,
                                      label: 'View Candidate Profile',
                                      onClick: () => onViewCandidate && onViewCandidate(app.candidate),
                                    },
                                  ],
                                }}
                                trigger={['click']}
                              >
                                <Button type="text" size="small" icon={<FiMoreVertical />} />
                              </Dropdown>
                            </Col>
                          </Row>

                          <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                            <FiBriefcase style={{ marginRight: 4, verticalAlign: '-1px' }} />
                            {app.jobTitle || app.jobOpening}
                          </div>

                          <Row justify="space-between" align="middle" style={{ marginTop: 4 }}>
                            <Tag color="default" style={{ fontSize: '0.7rem', margin: 0 }}>
                              {app.status}
                            </Tag>
                            {app.appliedOn && (
                              <Text type="secondary" style={{ fontSize: '0.72rem' }}>
                                <FiClock style={{ marginRight: 3, verticalAlign: '-1px' }} />
                                {dayjs(app.appliedOn).format('DD MMM')}
                              </Text>
                            )}
                          </Row>
                        </Space>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruitmentKanban;
