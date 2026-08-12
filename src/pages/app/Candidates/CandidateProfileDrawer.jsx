import React, { useState } from 'react';
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
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../hooks/useLanguage';
import candidateApi from '../../../services/candidateApi';

const { Title, Text, Link } = Typography;

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
  const navigate = useNavigate();
  const [uploadingResume, setUploadingResume] = useState(false);

  if (!candidate && !loading) return null;

  const handleResumeUpload = async ({ file }) => {
    if (!candidate?.id) return;
    setUploadingResume(true);
    try {
      await candidateApi.uploadFile({
        file,
        doctype: 'Candidate',
        docname: candidate.id,
        fieldname: 'resume',
      });
      message.success(t('candidate.messages.resumeUploadSuccess'));
      if (onRefresh) onRefresh();
    } catch (err) {
      message.error(err.message || t('candidate.messages.resumeUploadError'));
    } finally {
      setUploadingResume(false);
    }
  };

  const completionScore = candidate?.profileCompletion || 0;

  return (
    <Drawer
      title={
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space align="center">
            <Avatar
              size={44}
              style={{
                backgroundColor: 'var(--brand-navy-soft)',
                color: 'var(--brand-teal)',
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
      width={720}
      open={visible}
      onClose={onClose}
      loading={loading}
      className="candidate-profile-drawer"
    >
      {candidate && (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header Summary Card */}
          <Card size="small" style={{ borderRadius: '8px', backgroundColor: 'var(--brand-teal-bg)' }}>
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                  {t('candidate.sections.completion')}
                </Text>
                <div style={{ marginTop: '4px' }}>
                  <Progress
                    percent={completionScore}
                    size="small"
                    strokeColor="var(--brand-teal)"
                    style={{ width: 180 }}
                  />
                </div>
              </div>
              <Space>
                {candidate.isInternational && (
                  <Tag color="cyan" icon={<FiGlobe />}>
                    {t('candidate.badges.international')}
                  </Tag>
                )}
                <Tag color={candidate.status === 'Active' ? 'green' : 'default'}>
                  {candidate.status}
                </Tag>
                <Button
                  size="small"
                  icon={<FiExternalLink />}
                  onClick={() => {
                    onClose();
                    navigate('/app/applications');
                  }}
                >
                  {t('candidate.actions.viewApplications')}
                </Button>
              </Space>
            </Space>
          </Card>

          {/* Profile Tabs */}
          <Tabs
            defaultActiveKey="personal"
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
                        <Space>
                          <FiMail style={{ color: 'var(--brand-teal)' }} />
                          <Text copyable>{candidate.email}</Text>
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.mobileNo')}>
                        <Space>
                          <FiPhone style={{ color: 'var(--brand-teal)' }} />
                          <Text copyable>{candidate.mobileNo || '-'}</Text>
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.alternateMobile')}>{candidate.alternateMobile || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.linkedin')}>
                        {candidate.linkedin ? (
                          <Link href={candidate.linkedin} target="_blank" rel="noreferrer">
                            {candidate.linkedin}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.portfolio')}>
                        {candidate.portfolio ? (
                          <Link href={candidate.portfolio} target="_blank" rel="noreferrer">
                            {candidate.portfolio}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.github')}>
                        {candidate.github ? (
                          <Link href={candidate.github} target="_blank" rel="noreferrer">
                            {candidate.github}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </Descriptions.Item>
                    </Descriptions>

                    <Descriptions title={t('candidate.sections.address')} column={{ xs: 1, sm: 2 }} bordered size="small">
                      <Descriptions.Item label={t('candidate.fields.addressLine1')} span={2}>
                        {candidate.addressLine1 || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.addressLine2')} span={2}>
                        {candidate.addressLine2 || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.city')}>{candidate.city || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.state')}>{candidate.state || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.country')}>{candidate.country || '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.postalCode')}>{candidate.postalCode || '-'}</Descriptions.Item>
                    </Descriptions>
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
                      <Descriptions.Item label={t('candidate.fields.yearsOfExperience')}>{candidate.yearsOfExperience} years</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.noticePeriod')}>{candidate.noticePeriod} days</Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.currentSalary')}>
                        {candidate.currentSalary !== null ? `₹${candidate.currentSalary.toLocaleString()}` : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.expectedSalary')}>
                        {candidate.expectedSalary !== null ? `₹${candidate.expectedSalary.toLocaleString()}` : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('candidate.fields.preferredLocation')} span={2}>
                        {candidate.preferredLocation || candidate.locationDisplay || '-'}
                      </Descriptions.Item>
                    </Descriptions>
                  </Space>
                ),
              },
              {
                key: 'education',
                label: (
                  <span>
                    <FiBookOpen style={{ marginRight: 6 }} />
                    {t('candidate.sections.education')} ({candidate.education.length})
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={5} style={{ margin: 0 }}>
                        {t('candidate.sections.education')}
                      </Title>
                      <Button
                        size="small"
                        icon={<FiBookOpen />}
                        onClick={() => onOpenSubresourceModal('education')}
                      >
                        {t('candidate.actions.addEducation')}
                      </Button>
                    </div>
                    {candidate.education.length === 0 ? (
                      <Text type="secondary">{t('candidate.empty.noEducation')}</Text>
                    ) : (
                      <List
                        dataSource={candidate.education}
                        renderItem={(item) => (
                          <List.Item key={item.name}>
                            <List.Item.Meta
                              title={<Text strong>{item.degree} - {item.institution}</Text>}
                              description={
                                <span>
                                  {item.specialization ? `Field: ${item.specialization} | ` : ''}
                                  {item.start_date || ''} - {item.end_date || 'Present'}
                                  {item.percentage__cgpa ? ` | Grade: ${item.percentage__cgpa}` : ''}
                                </span>
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
                    {t('candidate.sections.experience')} ({candidate.experience.length})
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={5} style={{ margin: 0 }}>
                        {t('candidate.sections.experience')}
                      </Title>
                      <Button
                        size="small"
                        icon={<FiBriefcase />}
                        onClick={() => onOpenSubresourceModal('experience')}
                      >
                        {t('candidate.actions.addExperience')}
                      </Button>
                    </div>
                    {candidate.experience.length === 0 ? (
                      <Text type="secondary">{t('candidate.empty.noExperience')}</Text>
                    ) : (
                      <List
                        dataSource={candidate.experience}
                        renderItem={(item) => (
                          <List.Item key={item.name}>
                            <List.Item.Meta
                              title={<Text strong>{item.designation} @ {item.company}</Text>}
                              description={
                                <div>
                                  <Text type="secondary">
                                    {item.start_date} - {item.current_company ? 'Present' : item.end_date || 'N/A'}
                                  </Text>
                                  {item.responsibilities && (
                                    <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                                      {item.responsibilities}
                                    </div>
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
                    {t('candidate.sections.skills')} ({candidate.skills.length})
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={5} style={{ margin: 0 }}>
                        {t('candidate.sections.skills')}
                      </Title>
                      <Button
                        size="small"
                        icon={<FiAward />}
                        onClick={() => onOpenSubresourceModal('skills')}
                      >
                        {t('candidate.actions.addSkill')}
                      </Button>
                    </div>
                    {candidate.skills.length === 0 ? (
                      <Text type="secondary">{t('candidate.empty.noSkills')}</Text>
                    ) : (
                      <Space wrap>
                        {candidate.skills.map((s, idx) => (
                          <Tag key={idx} color="blue" style={{ fontSize: '0.85rem', padding: '4px 8px' }}>
                            {s.skill} {s.proficiency ? `(${s.proficiency})` : ''} {s.experience_years ? `• ${s.experience_years} yrs` : ''}
                          </Tag>
                        ))}
                      </Space>
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
                        <Tag color="success" icon={<FiCheckCircle />}>{t('candidate.badges.workPermitAuthorized')}</Tag>
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
                    {t('candidate.sections.documents')}
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {/* Resume Upload / Action Card */}
                    <Card size="small" title={t('candidate.fields.resume')}>
                      {candidate.resume ? (
                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Text icon={<FiFileText />}>{candidate.resume}</Text>
                          <Space>
                            <Button
                              icon={<FiDownload />}
                              href={candidate.resume}
                              target="_blank"
                              rel="noreferrer"
                              size="small"
                            >
                              {t('candidate.actions.downloadResume')}
                            </Button>
                            <Upload
                              customRequest={handleResumeUpload}
                              showUploadList={false}
                            >
                              <Button icon={<FiUpload />} loading={uploadingResume} size="small">
                                {t('candidate.actions.replaceResume')}
                              </Button>
                            </Upload>
                          </Space>
                        </Space>
                      ) : (
                        <Upload customRequest={handleResumeUpload} showUploadList={false}>
                          <Button icon={<FiUpload />} loading={uploadingResume}>
                            {t('candidate.actions.uploadResume')}
                          </Button>
                        </Upload>
                      )}
                    </Card>

                    {/* Subresource Documents */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={5} style={{ margin: 0 }}>
                        {t('candidate.sections.documents')} ({candidate.documents.length})
                      </Title>
                      <Button
                        size="small"
                        icon={<FiFileText />}
                        onClick={() => onOpenSubresourceModal('documents')}
                      >
                        {t('candidate.actions.addDocument')}
                      </Button>
                    </div>
                    {candidate.documents.length === 0 ? (
                      <Text type="secondary">{t('candidate.empty.noDocuments')}</Text>
                    ) : (
                      <List
                        dataSource={candidate.documents}
                        renderItem={(doc) => (
                          <List.Item key={doc.name}>
                            <List.Item.Meta
                              title={<Text strong>{doc.document_type || 'Document'}</Text>}
                              description={doc.file}
                            />
                            {doc.file && (
                              <Button
                                size="small"
                                icon={<FiDownload />}
                                href={doc.file}
                                target="_blank"
                              />
                            )}
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
