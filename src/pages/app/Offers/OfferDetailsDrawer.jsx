import React from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Button,
  Space,
  Popconfirm,
  Spin,
  Typography,
  Card,
} from 'antd';
import {
  FiAward,
  FiUser,
  FiBriefcase,
  FiFileText,
  FiDollarSign,
  FiEdit,
  FiTrash2,
  FiSend,
  FiCheckCircle,
  FiXCircle,
  FiCornerUpLeft,
  FiExternalLink,
  FiDownload,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useLanguage } from '../../../hooks/useLanguage';

const { Title, Text, Paragraph } = Typography;

export const getOfferStatusTagColor = (status) => {
  switch (status) {
    case 'Draft':
      return 'default';
    case 'Pending Approval':
      return 'orange';
    case 'Approved':
      return 'cyan';
    case 'Sent':
      return 'processing';
    case 'Accepted':
      return 'success';
    case 'Rejected':
      return 'error';
    case 'Withdrawn':
      return 'warning';
    case 'Expired':
      return 'volcano';
    default:
      return 'default';
  }
};

export const OfferDetailsDrawer = ({
  visible,
  offer,
  loading,
  saving,
  deleting,
  onClose,
  onSend,
  onAccept,
  onReject,
  onWithdraw,
  onEdit,
  onDelete,
}) => {
  const { t } = useLanguage();

  if (!visible) return null;

  const currentStatus = offer?.offerStatus || offer?.status || 'Draft';
  const offerId = offer?.id || offer?.name || offer?.offerId;
  const offerName = offer?.offerName || offer?.offer_name || offerId;

  return (
    <Drawer
      title={
        <Space align="center">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: 'rgba(24, 144, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-teal, #1890ff)',
            }}
          >
            <FiAward size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 }}>
              {offerName || t('offers.drawer.title', 'Offer Details')}
            </div>
            {offerId && (
              <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                ID: {offerId}
              </Text>
            )}
          </div>
        </Space>
      }
      placement="right"
      width={640}
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          {onEdit && offer && (
            <Button
              icon={<FiEdit />}
              onClick={() => onEdit(offer)}
              disabled={saving || deleting || loading}
            >
              {t('common.edit', 'Edit')}
            </Button>
          )}
          {onDelete && offer && (
            <Popconfirm
              title={t('offers.messages.deleteConfirmTitle', 'Delete Offer?')}
              description={t('offers.messages.deleteConfirmSub', 'Are you sure you want to delete this offer?')}
              onConfirm={() => onDelete(offerId)}
              okText={t('common.confirm', 'Delete')}
              cancelText={t('common.cancel', 'Cancel')}
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<FiTrash2 />} loading={deleting} disabled={saving || loading}>
                {t('common.delete', 'Delete')}
              </Button>
            </Popconfirm>
          )}
        </Space>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip={t('common.loading', 'Loading offer details...')} />
        </div>
      ) : offer ? (
        <div>
          {/* Status Header Banner & Actions */}
          <Card size="small" style={{ marginBottom: '20px', backgroundColor: 'var(--bg-subtle, #f8fafc)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: 2 }}>
                  {t('common.status', 'Status')}:
                </Text>
                <Tag color={getOfferStatusTagColor(currentStatus)} style={{ fontSize: '14px', padding: '4px 12px', fontWeight: 600 }}>
                  {currentStatus}
                </Tag>
              </div>

              {/* Action Buttons based on FSM */}
              <Space flexWrap>
                {(currentStatus === 'Draft' || currentStatus === 'Approved' || currentStatus === 'Pending Approval') && onSend && (
                  <Button
                    type="primary"
                    icon={<FiSend />}
                    loading={saving}
                    onClick={() => onSend(offerId)}
                    style={{ backgroundColor: 'var(--brand-navy, #0f172a)' }}
                  >
                    {t('offers.actions.send', 'Send Offer')}
                  </Button>
                )}

                {currentStatus === 'Sent' && onAccept && (
                  <Button
                    type="primary"
                    icon={<FiCheckCircle />}
                    loading={saving}
                    onClick={() => onAccept(offerId)}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  >
                    {t('offers.actions.accept', 'Accept')}
                  </Button>
                )}

                {currentStatus === 'Sent' && onReject && (
                  <Popconfirm
                    title={t('offers.actions.confirmRejectTitle', 'Reject Offer?')}
                    description={t('offers.actions.confirmRejectSub', 'Are you sure you want to mark this offer as rejected?')}
                    onConfirm={() => onReject(offerId)}
                    okText={t('common.confirm', 'Confirm')}
                    cancelText={t('common.cancel', 'Cancel')}
                    okButtonProps={{ danger: true }}
                  >
                    <Button danger icon={<FiXCircle />} loading={saving}>
                      {t('offers.actions.reject', 'Reject')}
                    </Button>
                  </Popconfirm>
                )}

                {(currentStatus === 'Sent' || currentStatus === 'Approved' || currentStatus === 'Pending Approval') && onWithdraw && (
                  <Popconfirm
                    title={t('offers.actions.confirmWithdrawTitle', 'Withdraw Offer?')}
                    description={t('offers.actions.confirmWithdrawSub', 'Are you sure you want to withdraw this offer?')}
                    onConfirm={() => onWithdraw(offerId)}
                    okText={t('common.confirm', 'Confirm')}
                    cancelText={t('common.cancel', 'Cancel')}
                  >
                    <Button icon={<FiCornerUpLeft />} loading={saving}>
                      {t('offers.actions.withdraw', 'Withdraw')}
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            </div>
          </Card>

          {/* Section 1: Offer Overview */}
          <Title level={5} style={{ marginBottom: 12 }}>
            <FiAward style={{ marginRight: '8px', color: 'var(--brand-teal, #1890ff)' }} />
            {t('offers.drawer.overview', 'Offer Information')}
          </Title>
          <Descriptions column={1} bordered size="small" style={{ marginBottom: '20px' }}>
            <Descriptions.Item label={t('offers.table.id', 'Offer ID')}>
              <Text copyable>{offerId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.drawer.offerName', 'Offer Name')}>
              {offerName}
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.table.offerDate', 'Offer Date')}>
              {offer.offerDate ? dayjs(offer.offerDate).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.table.expiryDate', 'Expiry Date')}>
              {offer.expiryDate ? dayjs(offer.expiryDate).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
          </Descriptions>

          {/* Section 2: Relational References */}
          <Title level={5} style={{ marginBottom: 12 }}>
            <FiUser style={{ marginRight: '8px', color: 'var(--brand-teal, #1890ff)' }} />
            {t('offers.drawer.references', 'Authoritative Entity References')}
          </Title>
          <Descriptions column={1} bordered size="small" style={{ marginBottom: '20px' }}>
            <Descriptions.Item label={t('offers.table.candidate', 'Candidate Reference')}>
              {offer.candidate ? <Text copyable>{offer.candidate}</Text> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.drawer.jobAppRef', 'Job Application Reference')}>
              {offer.jobApplication ? <Text copyable>{offer.jobApplication}</Text> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.table.jobOpening', 'Job Opening Reference')}>
              {offer.jobOpening ? <Text copyable>{offer.jobOpening}</Text> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.table.company', 'Company')}>
              {offer.company || '-'}
            </Descriptions.Item>
          </Descriptions>

          {/* Section 3: Compensation & Schedule */}
          <Title level={5} style={{ marginBottom: 12 }}>
            <FiDollarSign style={{ marginRight: '8px', color: 'var(--brand-teal, #1890ff)' }} />
            {t('offers.drawer.compensation', 'Compensation & Schedule')}
          </Title>
          <Descriptions column={1} bordered size="small" style={{ marginBottom: '20px' }}>
            <Descriptions.Item label={t('offers.table.offeredSalary', 'Offered Salary')}>
              {offer.offeredSalary !== undefined && offer.offeredSalary !== null
                ? `${offer.currency || 'USD'} ${Number(offer.offeredSalary).toLocaleString()}`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.table.joiningDate', 'Joining Date')}>
              {offer.joiningDate ? dayjs(offer.joiningDate).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.drawer.probation', 'Probation Period')}>
              {offer.probationPeriodMonths !== undefined && offer.probationPeriodMonths !== null
                ? `${offer.probationPeriodMonths} ${t('offers.drawer.months', 'months')}`
                : '-'}
            </Descriptions.Item>
          </Descriptions>

          {/* Section 4: Offer Details */}
          <Title level={5} style={{ marginBottom: 12 }}>
            <FiBriefcase style={{ marginRight: '8px', color: 'var(--brand-teal, #1890ff)' }} />
            {t('offers.drawer.employment', 'Offer Details')}
          </Title>
          <Descriptions column={1} bordered size="small" style={{ marginBottom: '20px' }}>
            <Descriptions.Item label={t('offers.drawer.employmentType', 'Employment Type')}>
              {offer.employmentType || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.drawer.reportingManager', 'Reporting Manager')}>
              {offer.reportingManager || '-'}
            </Descriptions.Item>
          </Descriptions>

          {/* Section 5: Candidate Response */}
          <Title level={5} style={{ marginBottom: 12 }}>
            <FiCheckCircle style={{ marginRight: '8px', color: 'var(--brand-teal, #1890ff)' }} />
            {t('offers.drawer.candidateResponse', 'Candidate Response')}
          </Title>
          <Descriptions column={1} bordered size="small" style={{ marginBottom: '20px' }}>
            <Descriptions.Item label={t('offers.drawer.responseDate', 'Response Date')}>
              {offer.responseDate ? dayjs(offer.responseDate).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.drawer.candidateRemarks', 'Candidate Remarks')}>
              {offer.candidateRemarks || '-'}
            </Descriptions.Item>
          </Descriptions>

          {/* Section 6: Offer Letter Attachment */}
          <Title level={5} style={{ marginBottom: 12 }}>
            <FiFileText style={{ marginRight: '8px', color: 'var(--brand-teal, #1890ff)' }} />
            {t('offers.drawer.offerLetter', 'Offer Letter Document')}
          </Title>
          <div style={{ marginBottom: '20px' }}>
            {offer.offerLetter ? (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Space align="center">
                  <FiFileText size={22} style={{ color: 'var(--brand-teal, #1890ff)' }} />
                  <div>
                    <Text strong style={{ fontSize: '0.85rem', display: 'block' }}>
                      {offer.offerLetter.split('/').pop()}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                      Frappe Attachment URL
                    </Text>
                  </div>
                </Space>
                <Space>
                  <Button
                    type="primary"
                    ghost
                    size="small"
                    icon={<FiExternalLink />}
                    href={offer.offerLetter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    icon={<FiDownload />}
                    href={offer.offerLetter}
                    download
                  >
                    Download
                  </Button>
                </Space>
              </div>
            ) : (
              <Text type="secondary">-</Text>
            )}
          </div>

          {/* Section 7: Internal Notes */}
          {offer.notes && (
            <>
              <Title level={5} style={{ marginBottom: 12 }}>
                {t('offers.drawer.notes', 'Internal Notes')}
              </Title>
              <Card size="small" style={{ marginBottom: '20px', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                <Paragraph style={{ margin: 0, fontSize: '0.85rem' }}>{offer.notes}</Paragraph>
              </Card>
            </>
          )}
        </div>
      ) : (
        <Text type="secondary">{t('offers.drawer.noData', 'No offer selected.')}</Text>
      )}
    </Drawer>
  );
};

export default OfferDetailsDrawer;
