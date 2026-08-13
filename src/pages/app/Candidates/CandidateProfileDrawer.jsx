import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Tabs,
  Typography,
  Tag,
  Progress,
  Button,
  Space,
  Descriptions,
  List,
  Card,
  Avatar,
  Divider,
  Popconfirm,
  message,
  Upload,
  Select,
  Timeline,
  Spin,
  Row,
  Col,
} from 'antd';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiMapPin,
  FiBookOpen,
  FiAward,
  FiGlobe,
  FiFileText,
  FiShield,
  FiEdit,
  FiTrash2,
  FiUpload,
  FiDownload,
  FiExternalLink,
  FiCheckCircle,
  FiClock,
  FiLayers,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';
import candidateApi from '../../../services/candidateApi';
import jobApplicationApi from '../../../services/jobApplicationApi';

const { Title, Text, Link, Paragraph } = Typography;
const { Option } = Select;

const MAX_RESUME_SIZE_MB = 10;
const ALLOWED_RESUME_EXT = ['.pdf', '.doc', '.docx'];

export const CandidateProfileDrawer = ({
  visible,
  candidate,
  loading,
  onClose,
  onEdit,
  onDelete,
  onRefresh,
  onOpenSubresourceModal,
}) => {
  const { t } = useLanguage();
  const [activeTabKey, setActiveTabKey] = useState('personal');
  const [uploadingResume, setUploadingResume] = useState(false);

  // Applications sub-state inside drawer
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [changingAppStage, setChangingAppStage] = useState(false);

  // Fetch applications for current candidate when drawer opens
  useEffect(() => {
    if (visible && candidate?.id) {
      setLoadingApplications(true);
      jobApplicationApi
        .listApplications({ candidate: candidate.id })
        .then((res) => {
          const items = res?.items || res?.data || [];
          setApplications(items);
          if (items.length > 0) {
            setSelectedAppId(items[0].id);
          } else {
            setSelectedAppId(null);
          }
        })
        .catch((err) => {
          console.error('Error fetching applications for candidate:', err);
          setApplications([]);
          setSelectedAppId(null);
        })
        .finally(() => {
          setLoadingApplications(false);
        });
    } else {
      setApplications([]);
      setSelectedAppId(null);
      setActiveTabKey('personal');
    }
  }, [visible, candidate?.id]);

  if (!candidate && !loading) return null;

  const handleResumeUpload = async ({ file }) => {
    if (!candidate?.id) return;
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_RESUME_EXT.includes(ext)) {
      message.error(
        t('candidate.messages.invalidFileType', `Invalid resume file format. Allowed formats: ${ALLOWED_RESUME_EXT.join(', ')}`)
      );
      return;
    }
    if (file.size / 1024 / 1024 > MAX_RESUME_SIZE_MB) {
      message.error(t('candidate.messages.fileTooLarge', `Resume size exceeds maximum limit of ${MAX_RESUME_SIZE_MB}MB.`));
      return;
    }

    setUploadingResume(true);
    try {
      await candidateApi.uploadFile({
        file,
        doctype: 'Candidate',
        docname: candidate.id,
        fieldname: 'resume',
      });
      message.success(t('candidate.messages.resumeUploadSuccess', 'Resume document uploaded successfully.'));
      if (onRefresh) onRefresh();
    } catch (err) {
      const errMsg = typeof err === 'string' ? err : err?.message || err?.error?.message || t('candidate.messages.resumeUploadError');
      message.error(errMsg);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleStageChange = async (appId, newStage) => {
    setChangingAppStage(true);
    try {
      const updated = await jobApplicationApi.changeStage(appId, newStage);
      message.success(t('jobApplications.messages.stageSuccess', `Stage updated to ${newStage}`));
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, currentStage: newStage, status: updated.status || a.status } : a))
      );
    } catch (err) {
      message.error(err?.message || 'Failed to update stage');
    } finally {
      setChangingAppStage(false);
    }
  };

  const handleDeleteChildItem = async (resourceType, index) => {
    const currentList = Array.isArray(candidate?.[resourceType]) ? candidate[resourceType] : [];
    const updatedList = currentList.filter((_, idx) => idx !== index);
    try {
      let res;
      if (resourceType === 'education') res = await candidateApi.updateEducation(candidate.id, updatedList);
      else if (resourceType === 'experience') res = await candidateApi.updateExperience(candidate.id, updatedList);
      else if (resourceType === 'skills') res = await candidateApi.updateSkills(candidate.id, updatedList);
      else if (resourceType === 'languages') res = await candidateApi.updateLanguages(candidate.id, updatedList);
      else if (resourceType === 'certifications') res = await candidateApi.updateCertifications(candidate.id, updatedList);
      else if (resourceType === 'documents') res = await candidateApi.updateDocuments(candidate.id, updatedList);

      message.success(t('candidate.messages.deleteSuccess', 'Item deleted successfully.'));
      if (onRefresh) onRefresh();
    } catch (err) {
      const errMsg = typeof err === 'string' ? err : err?.message || err?.error?.message || 'Delete failed';
      message.error(errMsg);
    }
  };

  const getHumanReadableFileName = (fileUrlStr) => {
    if (!fileUrlStr) return '';
    const parts = fileUrlStr.split('/');
    return parts[parts.length - 1] || fileUrlStr;
  };

  const completionScore = candidate?.profileCompletion || 0;
  const activeApp = applications.find((a) => a.id === selectedAppId) || applications[0];

  const eduList = Array.isArray(candidate?.education) ? candidate.education : [];
  const expList = Array.isArray(candidate?.experience) ? candidate.experience : [];
  const skillList = Array.isArray(candidate?.skills) ? candidate.skills : [];
  const langList = Array.isArray(candidate?.languages) ? candidate.languages : [];
  const certList = Array.isArray(candidate?.certifications) ? candidate.certifications : [];
  const docList = Array.isArray(candidate?.documents) ? candidate.documents : [];

  return (
    <Drawer
      title={
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space align="center">
            <Avatar
              size={44}
              style={{
                backgroundColor: 'var(--brand-navy-soft, #e6f0fa)',
                color: 'var(--brand-teal, #008080)',
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              {(candidate?.fullName || 'C').charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Title level={5} style={{ margin: 0 }}>
                {candidate?.fullName || t('common.loading')}
              </Title>
              <Text type="secondary" style={{ fontSize: '0.8rem' }}>
                {candidate?.currentJobTitle || candidate?.profession || t('candidate.title')}
                {candidate?.currentCompany ? ` @ ${candidate.currentCompany}` : ''}
              </Text>
            </div>
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<FiEdit />}
              onClick={() => onEdit(candidate)}
              style={{ backgroundColor: 'var(--brand-navy)', borderColor: 'var(--brand-navy)' }}
            >
              {t('candidate.actions.edit')}
            </Button>
            <Popconfirm
              title={t('candidate.messages.deleteConfirmTitle')}
              description={t('candidate.messages.deleteConfirmSub')}
              onConfirm={() => onDelete(candidate?.id)}
              okText={t('common.confirm')}
              cancelText={t('common.cancel')}
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<FiTrash2 />}>
                {t('candidate.actions.delete')}
              </Button>
            </Popconfirm>
          </Space>
        </Space>
      }
      width={780}
      open={visible}
      onClose={onClose}
      loading={loading}
      className="candidate-profile-drawer"
    >
      {candidate && (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header Summary Card */}
          <Card size="small" style={{ borderRadius: '8px', backgroundColor: 'var(--brand-teal-bg, #f0fdf4)' }}>
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                  {t('candidate.sections.completion')}
                </Text>
                <div style={{ marginTop: '4px' }}>
                  <Progress percent={completionScore} size="small" strokeColor="var(--brand-teal)" style={{ width: 180 }} />
                </div>
              </div>
              <Space wrap>
                {candidate.isInternational && (
                  <Tag color="cyan" icon={<FiGlobe />}>
                    {t('candidate.badges.international')}
                  </Tag>
                )}
                <Tag color={candidate.status === 'Active' ? 'green' : 'default'}>{candidate.status}</Tag>
                <Button size="small" icon={<FiBriefcase />} onClick={() => setActiveTabKey('applications')}>
                  {t('candidate.actions.viewApplications', 'Applications')} ({applications.length})
                </Button>
              </Space>
            </Space>
          </Card>

          {/* Profile Tabs */}
          <Tabs
            activeKey={activeTabKey}
            onChange={setActiveTabKey}
            items={[
              {
                key: 'personal',
                label: (
                  <span>
                    <FiUser style={{ marginRight: 6 }} />
                    {t('candidate.sections.personal')}
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Descriptions title={t('candidate.sections.personal')} column={{ xs: 1, sm: 2 }} bordered size="small">
                      <Descriptions.Item label={t('candidate.fields.firstName')}>{candidate.firstName}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.middleName')}>{candidate.middleName || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.lastName')}>{candidate.lastName}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.dateOfBirth')}>{candidate.dateOfBirth || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.gender')}>{candidate.gender || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.nationality')}>{candidate.nationality || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.maritalStatus')}>{candidate.maritalStatus || '-'}</Descriptions.Item>
                    </Descriptions>

                    <Descriptions title={t('candidate.sections.contact')} column={{ xs: 1, sm: 2 }} bordered size="small">
                      <Descriptions.Item label={t('candidate.fields.email')}>
                        <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
                      </Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.mobileNo')}>
                        <a href={`tel:${candidate.mobileNo}`}>{candidate.mobileNo}</a>
                      </Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.alternateMobile')}>{candidate.alternateMobile || '-'}</Descriptions.Item>
                      <Descriptions.Item label="LinkedIn">
                        {candidate.linkedin ? (
                          <a href={candidate.linkedin} target="_blank" rel="noreferrer">
                            {candidate.linkedin}
                          </a>
                        ) : (
                          '-'
                        )}
                      </Descriptions.Item>
                    </Descriptions>

                    <Descriptions title={t('candidate.sections.address')} column={{ xs: 1, sm: 2 }} bordered size="small">
                      <Descriptions.Item label={t('candidate.fields.addressLine1')}>{candidate.addressLine1 || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.addressLine2')}>{candidate.addressLine2 || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.city')}>{candidate.city || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.state')}>{candidate.state || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.country')}>{candidate.country || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.postalCode')}>{candidate.postalCode || '-'}</Descriptions.Item>
                    </Descriptions>
                  </Space>
                ),
              },
              {
                key: 'applications',
                label: (
                  <span>
                    <FiBriefcase style={{ marginRight: 6 }} />
                    Applications ({applications.length})
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {loadingApplications ? (
                      <div style={{ textAlign: 'center', padding: '32px' }}>
                        <Spin tip="Loading job applications..." />
                      </div>
                    ) : applications.length === 0 ? (
                      <Card style={{ borderRadius: '8px', textAlign: 'center', padding: '24px' }}>
                        <Text type="secondary">No job applications found for this candidate.</Text>
                      </Card>
                    ) : (
                      <>
                        {applications.length > 1 && (
                          <Card size="small" style={{ marginBottom: 12, borderRadius: 6, backgroundColor: '#f8fafc' }}>
                            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Text strong>Select Application:</Text>
                              <Select value={selectedAppId} onChange={setSelectedAppId} style={{ minWidth: 300 }}>
                                {applications.map((app) => (
                                  <Option key={app.id} value={app.id}>
                                    {app.jobTitle || app.jobOpening} (#{app.id})
                                  </Option>
                                ))}
                              </Select>
                            </Space>
                          </Card>
                        )}

                        {activeApp && (
                          <Card size="small" style={{ borderRadius: 8, borderColor: 'var(--brand-teal, #008080)' }}>
                            <Row justify="space-between" align="top" gutter={[16, 16]}>
                              <Col xs={24} sm={16}>
                                <Title level={5} style={{ margin: 0 }}>
                                  {activeApp.jobTitle || activeApp.jobOpening}
                                </Title>
                                <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                                  Application ID: #{activeApp.id} {activeApp.department ? `• ${activeApp.department}` : ''}
                                </Text>
                              </Col>
                              <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
                                <Space direction="vertical" align="end" size={2}>
                                  <Tag color="geekblue" style={{ fontSize: '0.85rem' }}>
                                    Stage: {activeApp.currentStage || activeApp.status}
                                  </Tag>
                                  <Tag color={activeApp.status === 'Hired' ? 'green' : activeApp.status === 'Rejected' ? 'red' : 'blue'}>
                                    Status: {activeApp.status}
                                  </Tag>
                                </Space>
                              </Col>
                            </Row>

                            <Divider style={{ margin: '12px 0' }} />

                            <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
                              <Descriptions.Item label="Application ID">#{activeApp.id}</Descriptions.Item>
                              <Descriptions.Item label="Job Opening">
                                {activeApp.jobTitle || activeApp.jobOpening || '-'}
                              </Descriptions.Item>
                              <Descriptions.Item label="Stage">
                                <Tag color="geekblue">{activeApp.currentStage || 'Applied'}</Tag>
                              </Descriptions.Item>
                              <Descriptions.Item label="Status">
                                <Tag color={activeApp.status === 'Hired' ? 'green' : activeApp.status === 'Rejected' ? 'red' : 'blue'}>
                                  {activeApp.status || 'Open'}
                                </Tag>
                              </Descriptions.Item>
                              <Descriptions.Item label="Applied Date">
                                {activeApp.appliedOn ? dayjs(activeApp.appliedOn).format('DD MMM YYYY') : '-'}
                              </Descriptions.Item>
                              <Descriptions.Item label="Source">{activeApp.source || 'Direct'}</Descriptions.Item>
                              <Descriptions.Item label="Expected Salary">
                                {activeApp.expectedSalary !== null && activeApp.expectedSalary !== undefined && activeApp.expectedSalary > 0
                                  ? `€${activeApp.expectedSalary.toLocaleString()}`
                                  : '-'}
                              </Descriptions.Item>
                              <Descriptions.Item label="Priority">{activeApp.priority || 'Medium'}</Descriptions.Item>
                            </Descriptions>

                            {activeApp.coverLetter && (
                              <div style={{ marginTop: 12 }}>
                                <Text strong style={{ fontSize: '0.85rem' }}>
                                  Cover Letter:
                                </Text>
                                <Paragraph type="secondary" style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>
                                  {activeApp.coverLetter}
                                </Paragraph>
                              </div>
                            )}

                            {/* Stage Transition Quick Actions */}
                            <div style={{ marginTop: 16, backgroundColor: '#f8fafc', padding: 12, borderRadius: 6 }}>
                              <Text strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: 8 }}>
                                Change Stage:
                              </Text>
                              <Space wrap>
                                {['Applied', 'Screening', 'Shortlisted', 'Interview', 'Technical', 'HR', 'Offered', 'Hired'].map((stg) => (
                                  <Button
                                    key={stg}
                                    size="small"
                                    type={activeApp.currentStage === stg ? 'primary' : 'default'}
                                    disabled={changingAppStage || activeApp.currentStage === stg}
                                    onClick={() => handleStageChange(activeApp.id, stg)}
                                  >
                                    {stg}
                                  </Button>
                                ))}
                              </Space>
                            </div>
                          </Card>
                        )}
                      </>
                    )}
                  </Space>
                ),
              },
              {
                key: 'professional',
                label: (
                  <span>
                    <FiBriefcase style={{ marginRight: 6 }} />
                    {t('candidate.sections.professional')}
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Descriptions title={t('candidate.sections.professional')} column={{ xs: 1, sm: 2 }} bordered size="small">
                      <Descriptions.Item label={t('candidate.fields.currentJobTitle')}>{candidate.currentJobTitle || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.currentCompany')}>{candidate.currentCompany || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.profession')}>{candidate.profession || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.employmentType')}>{candidate.employmentType || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.yearsOfExperience')}>{candidate.yearsOfExperience} yrs</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.noticePeriod')}>{candidate.noticePeriod} days</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.currentSalary')}>{candidate.currentSalary ? `€${candidate.currentSalary.toLocaleString()}` : '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.expectedSalary')}>{candidate.expectedSalary ? `€${candidate.expectedSalary.toLocaleString()}` : '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.preferredLocation')}>{candidate.preferredLocation || '-'}</Descriptions.Item>
                    </Descriptions>
                  </Space>
                ),
              },
              {
                key: 'education',
                label: (
                  <span>
                    <FiBookOpen style={{ marginRight: 6 }} />
                    {t('candidate.sections.education')} ({eduList.length})
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={5} style={{ margin: 0 }}>
                        {t('candidate.sections.education')}
                      </Title>
                      <Button size="small" icon={<FiBookOpen />} onClick={() => onOpenSubresourceModal('education')}>
                        {t('candidate.actions.addEducation')}
                      </Button>
                    </div>
                    {eduList.length === 0 ? (
                      <Text type="secondary">{t('candidate.empty.noEducation')}</Text>
                    ) : (
                      <List
                        dataSource={eduList}
                        renderItem={(edu, idx) => (
                          <List.Item
                            key={edu.name || idx}
                            actions={[
                              <Button key="edit" type="link" size="small" icon={<FiEdit />} onClick={() => onOpenSubresourceModal('education', edu, idx)}>
                                {t('common.edit', 'Edit')}
                              </Button>,
                              <Popconfirm key="del" title="Delete education record?" onConfirm={() => handleDeleteChildItem('education', idx)}>
                                <Button type="link" danger size="small" icon={<FiTrash2 />}>
                                  {t('common.delete', 'Delete')}
                                </Button>
                              </Popconfirm>,
                            ]}
                          >
                            <List.Item.Meta
                              title={<Text strong>{edu.degree || edu.qualification}</Text>}
                              description={
                                <div>
                                  <div>{edu.institution} {edu.specialization ? `• ${edu.specialization}` : ''}</div>
                                  <Text type="secondary" style={{ fontSize: '0.8rem' }}>
                                    {edu.start_date ? `${edu.start_date} to ${edu.end_date || 'Present'}` : edu.end_date || ''}
                                    {edu.percentage__cgpa ? ` | Grade: ${edu.percentage__cgpa}` : ''}
                                  </Text>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </Space>
                ),
              },
              {
                key: 'experience',
                label: (
                  <span>
                    <FiBriefcase style={{ marginRight: 6 }} />
                    {t('candidate.sections.experience')} ({expList.length})
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={5} style={{ margin: 0 }}>
                        {t('candidate.sections.experience')}
                      </Title>
                      <Button size="small" icon={<FiBriefcase />} onClick={() => onOpenSubresourceModal('experience')}>
                        {t('candidate.actions.addExperience')}
                      </Button>
                    </div>
                    {expList.length === 0 ? (
                      <Text type="secondary">{t('candidate.empty.noExperience')}</Text>
                    ) : (
                      <List
                        dataSource={expList}
                        renderItem={(exp, idx) => (
                          <List.Item
                            key={exp.name || idx}
                            actions={[
                              <Button key="edit" type="link" size="small" icon={<FiEdit />} onClick={() => onOpenSubresourceModal('experience', exp, idx)}>
                                {t('common.edit', 'Edit')}
                              </Button>,
                              <Popconfirm key="del" title="Delete experience record?" onConfirm={() => handleDeleteChildItem('experience', idx)}>
                                <Button type="link" danger size="small" icon={<FiTrash2 />}>
                                  {t('common.delete', 'Delete')}
                                </Button>
                              </Popconfirm>,
                            ]}
                          >
                            <List.Item.Meta
                              title={
                                <Space align="center">
                                  <Text strong>{exp.designation || exp.title}</Text>
                                  {exp.current_company ? <Tag color="blue">Current</Tag> : null}
                                </Space>
                              }
                              description={
                                <div>
                                  <div>{exp.company} {exp.employment_type ? `• ${exp.employment_type}` : ''}</div>
                                  <Text type="secondary" style={{ fontSize: '0.8rem' }}>
                                    {exp.start_date ? `${exp.start_date} to ${exp.end_date || 'Present'}` : ''}
                                  </Text>
                                  {exp.responsibilities && (
                                    <div style={{ marginTop: 4, fontSize: '0.82rem', color: '#4b5563' }}>{exp.responsibilities}</div>
                                  )}
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </Space>
                ),
              },
              {
                key: 'skills',
                label: (
                  <span>
                    <FiAward style={{ marginRight: 6 }} />
                    {t('candidate.sections.skills')} ({skillList.length})
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={5} style={{ margin: 0 }}>
                        {t('candidate.sections.skills')}
                      </Title>
                      <Button size="small" icon={<FiAward />} onClick={() => onOpenSubresourceModal('skills')}>
                        {t('candidate.actions.addSkill')}
                      </Button>
                    </div>
                    {skillList.length === 0 ? (
                      <Text type="secondary">{t('candidate.empty.noSkills')}</Text>
                    ) : (
                      <List
                        dataSource={skillList}
                        renderItem={(s, idx) => (
                          <List.Item
                            key={s.name || idx}
                            actions={[
                              <Button key="edit" type="link" size="small" icon={<FiEdit />} onClick={() => onOpenSubresourceModal('skills', s, idx)}>
                                {t('common.edit', 'Edit')}
                              </Button>,
                              <Popconfirm key="del" title="Delete skill?" onConfirm={() => handleDeleteChildItem('skills', idx)}>
                                <Button type="link" danger size="small" icon={<FiTrash2 />}>
                                  {t('common.delete', 'Delete')}
                                </Button>
                              </Popconfirm>,
                            ]}
                          >
                            <List.Item.Meta
                              title={<Text strong>{s.skill}</Text>}
                              description={`Proficiency: ${s.proficiency || 'Intermediate'} ${s.experience_years ? `• ${s.experience_years} years` : ''}`}
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </Space>
                ),
              },
              {
                key: 'languages',
                label: (
                  <span>
                    <FiGlobe style={{ marginRight: 6 }} />
                    Languages ({langList.length})
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={5} style={{ margin: 0 }}>
                        Languages
                      </Title>
                      <Button size="small" icon={<FiGlobe />} onClick={() => onOpenSubresourceModal('languages')}>
                        Add Language
                      </Button>
                    </div>
                    {langList.length === 0 ? (
                      <Text type="secondary">{t('candidate.empty.noLanguages', 'No language proficiencies recorded.')}</Text>
                    ) : (
                      <List
                        dataSource={langList}
                        renderItem={(lang, idx) => (
                          <List.Item
                            key={lang.name || idx}
                            actions={[
                              <Button key="edit" type="link" size="small" icon={<FiEdit />} onClick={() => onOpenSubresourceModal('languages', lang, idx)}>
                                {t('common.edit', 'Edit')}
                              </Button>,
                              <Popconfirm key="del" title="Delete language?" onConfirm={() => handleDeleteChildItem('languages', idx)}>
                                <Button type="link" danger size="small" icon={<FiTrash2 />}>
                                  {t('common.delete', 'Delete')}
                                </Button>
                              </Popconfirm>,
                            ]}
                          >
                            <List.Item.Meta
                              title={<Text strong>{lang.language}</Text>}
                              description={
                                <Space size="small">
                                  {lang.reading ? <Tag color="blue">Read</Tag> : null}
                                  {lang.writing ? <Tag color="cyan">Write</Tag> : null}
                                  {lang.speaking ? <Tag color="teal">Speak</Tag> : null}
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </Space>
                ),
              },
              {
                key: 'certifications',
                label: (
                  <span>
                    <FiAward style={{ marginRight: 6 }} />
                    Certifications ({certList.length})
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={5} style={{ margin: 0 }}>
                        Certifications
                      </Title>
                      <Button size="small" icon={<FiAward />} onClick={() => onOpenSubresourceModal('certifications')}>
                        Add Certification
                      </Button>
                    </div>
                    {certList.length === 0 ? (
                      <Text type="secondary">{t('candidate.empty.noCertifications', 'No certifications added.')}</Text>
                    ) : (
                      <List
                        dataSource={certList}
                        renderItem={(cert, idx) => (
                          <List.Item
                            key={cert.name || idx}
                            actions={[
                              <Button key="edit" type="link" size="small" icon={<FiEdit />} onClick={() => onOpenSubresourceModal('certifications', cert, idx)}>
                                {t('common.edit', 'Edit')}
                              </Button>,
                              <Popconfirm key="del" title="Delete certification?" onConfirm={() => handleDeleteChildItem('certifications', idx)}>
                                <Button type="link" danger size="small" icon={<FiTrash2 />}>
                                  {t('common.delete', 'Delete')}
                                </Button>
                              </Popconfirm>,
                            ]}
                          >
                            <List.Item.Meta
                              title={<Text strong>{cert.certification}</Text>}
                              description={
                                <div>
                                  <div>Issued by: {cert.issued_by || '-'}</div>
                                  <Text type="secondary" style={{ fontSize: '0.8rem' }}>
                                    {cert.issue_date ? `Issued: ${cert.issue_date}` : ''} {cert.expiry_date ? `| Expires: ${cert.expiry_date}` : ''}
                                  </Text>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </Space>
                ),
              },
              {
                key: 'passportVisa',
                label: (
                  <span>
                    <FiShield style={{ marginRight: 6 }} />
                    {t('candidate.sections.passportVisa')}
                  </span>
                ),
                children: (
                  <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                    <Descriptions.Item label={t('candidate.fields.passportNumber')}>{candidate.passportNumber || '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('candidate.fields.passportExpiry')}>{candidate.passportExpiry || '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('candidate.fields.visaStatus')}>{candidate.visaStatus || '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('candidate.fields.workPermit')}>
                      {candidate.workPermit ? (
                        <Tag color="success" icon={<FiCheckCircle />}>
                          {t('candidate.badges.workPermitAuthorized')}
                        </Tag>
                      ) : (
                        <Tag color="default">{t('candidate.badges.workPermitNotSpecified')}</Tag>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'documents',
                label: (
                  <span>
                    <FiFileText style={{ marginRight: 6 }} />
                    {t('candidate.sections.documents')} ({docList.length})
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {/* Resume Card (Part J & K) */}
                    <Card size="small" title={t('candidate.fields.resume', 'Resume Document')}>
                      {candidate.resume ? (
                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Space align="center">
                            <FiFileText style={{ fontSize: '1.2rem', color: 'var(--brand-teal)' }} />
                            <div>
                              <Text strong style={{ display: 'block' }}>
                                {getHumanReadableFileName(candidate.resume)}
                              </Text>
                              <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                                Primary Candidate Resume Attachment
                              </Text>
                            </div>
                          </Space>
                          <Space>
                            <Button icon={<FiDownload />} href={candidate.resume} target="_blank" rel="noreferrer" size="small">
                              {t('candidate.actions.downloadResume', 'Download')}
                            </Button>
                            <Upload customRequest={handleResumeUpload} showUploadList={false}>
                              <Button icon={<FiUpload />} loading={uploadingResume} size="small">
                                {t('candidate.actions.replaceResume', 'Replace Resume')}
                              </Button>
                            </Upload>
                          </Space>
                        </Space>
                      ) : (
                        <Upload customRequest={handleResumeUpload} showUploadList={false}>
                          <Button icon={<FiUpload />} loading={uploadingResume}>
                            {t('candidate.actions.uploadResume', 'Upload Resume (PDF/DOC)')}
                          </Button>
                        </Upload>
                      )}
                    </Card>

                    {/* Child-Table Documents List (Part H) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={5} style={{ margin: 0 }}>
                        {t('candidate.sections.documents')} ({docList.length})
                      </Title>
                      <Button size="small" icon={<FiFileText />} onClick={() => onOpenSubresourceModal('documents')}>
                        {t('candidate.actions.addDocument')}
                      </Button>
                    </div>
                    {docList.length === 0 ? (
                      <Text type="secondary">{t('candidate.empty.noDocuments')}</Text>
                    ) : (
                      <List
                        dataSource={docList}
                        renderItem={(doc, idx) => (
                          <List.Item
                            key={doc.name || idx}
                            actions={[
                              <Button key="edit" type="link" size="small" icon={<FiEdit />} onClick={() => onOpenSubresourceModal('documents', doc, idx)}>
                                {t('common.edit', 'Edit')}
                              </Button>,
                              <Popconfirm key="del" title="Delete document?" onConfirm={() => handleDeleteChildItem('documents', idx)}>
                                <Button type="link" danger size="small" icon={<FiTrash2 />}>
                                  {t('common.delete', 'Delete')}
                                </Button>
                              </Popconfirm>,
                            ]}
                          >
                            <List.Item.Meta
                              title={
                                <Space align="center">
                                  <Text strong>{doc.document_type || 'Document'}</Text>
                                  {doc.verified ? <Tag color="green">Verified</Tag> : null}
                                </Space>
                              }
                              description={getHumanReadableFileName(doc.file)}
                            />
                            {doc.file && <Button size="small" icon={<FiDownload />} href={doc.file} target="_blank" />}
                          </List.Item>
                        )}
                      />
                    )}
                  </Space>
                ),
              },
            ]}
          />
        </Space>
      )}
    </Drawer>
  );
};

export default CandidateProfileDrawer;
