import React from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Button,
  Space,
  Divider,
  Popconfirm,
  Spin,
  Typography,
  Card,
  Tooltip,
} from 'antd';
import {
  FiAward,
  FiUser,
  FiBriefcase,
  FiFileText,
  FiCalendar,
  FiDollarSign,
  FiEdit,
  FiTrash2,
  FiSend,
  FiCheckCircle,
  FiXCircle,
  FiCornerUpLeft,
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

  if (!offer && !loading) return null;

  const currentStatus = offer?.offerStatus || offer?.status || 'Draft';

  return (
    <Drawer
      title={
        <Space>
          <FiAward style={{ color: 'var(--brand-teal, #1890ff)' }} />
          <span>{offer?.offerName || offer?.id || t('offers.drawer.title')}</span>
        </Space>
      }
      placement="right"
      width={600}
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          {onEdit && (
            <Button
              icon={<FiEdit />}
              onClick={() => onEdit(offer)}
              disabled={saving || deleting}
            >
              {t('common.edit', 'Edit')}
            </Button>
          )}
          {onDelete && (
            <Popconfirm
              title={t('offers.messages.deleteConfirmTitle')}
              description={t('offers.messages.deleteConfirmSub')}
              onConfirm={() => onDelete(offer?.id)}
              okText={t('common.confirm')}
              cancelText={t('common.cancel')}
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<FiTrash2 />} loading={deleting}>
                {t('common.delete', 'Delete')}
              </Button>
            </Popconfirm>
          )}
        </Space>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : offer ? (
        <div>
          {/* Workflow Action Header */}
          <Card size="small" style={{ marginBottom: '20px', backgroundColor: 'var(--bg-subtle, #f8fafc)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                  {t('common.status')}:
                </Text>
                <Tag color={getOfferStatusTagColor(currentStatus)} style={{ fontSize: '14px', padding: '4px 10px' }}>
                  {t(`offers.statuses.${currentStatus}`, currentStatus)}
                </Tag>
              </div>

              {/* Action Buttons based on backend certified workflow */}
              <Space flexWrap>
                {/* Send Offer available for Draft, Pending Approval, Approved */}
                {(currentStatus === 'Draft' || currentStatus === 'Approved' || currentStatus === 'Pending Approval') && onSend && (
                  <Button
                    type="primary"
                    icon={<FiSend />}
                    loading={saving}
                    onClick={() => onSend(offer.id)}
                    style={{ backgroundColor: 'var(--brand-navy, #0f172a)' }}
                  >
                    {t('offers.actions.send', 'Send Offer')}
                  </Button>
                )}

                {/* Accept Offer available for Sent */}
                {currentStatus === 'Sent' && onAccept && (
                  <Button
                    type="primary"
                    icon={<FiCheckCircle />}
                    loading={saving}
                    onClick={() => onAccept(offer.id)}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  >
                    {t('offers.actions.accept', 'Accept')}
                  </Button>
                )}

                {/* Reject Offer available for Sent */}
                {currentStatus === 'Sent' && onReject && (
                  <Popconfirm
                    title={t('offers.actions.confirmRejectTitle', 'Reject Offer?')}
                    description={t('offers.actions.confirmRejectSub', 'Are you sure you want to mark this offer as rejected?')}
                    onConfirm={() => onReject(offer.id)}
                    okText={t('common.confirm')}
                    cancelText={t('common.cancel')}
                    okButtonProps={{ danger: true }}
                  >
                    <Button danger icon={<FiXCircle />} loading={saving}>
                      {t('offers.actions.reject', 'Reject')}
                    </Button>
                  </Popconfirm>
                )}

                {/* Withdraw Offer available for Sent / Approved / Pending Approval */}
                {(currentStatus === 'Sent' || currentStatus === 'Approved' || currentStatus === 'Pending Approval') && onWithdraw && (
                  <Popconfirm
                    title={t('offers.actions.confirmWithdrawTitle', 'Withdraw Offer?')}
                    description={t('offers.actions.confirmWithdrawSub', 'Are you sure you want to withdraw this offer?')}
                    onConfirm={() => onWithdraw(offer.id)}
                    okText={t('common.confirm')}
                    cancelText={t('common.cancel')}
                  >
                    <Button icon={<FiCornerUpLeft />} loading={saving}>
                      {t('offers.actions.withdraw', 'Withdraw')}
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            </div>
          </Card>

          {/* Overview Section */}
          <Title level={5}>
            <FiAward style={{ marginRight: '8px' }} />
            {t('offers.drawer.overview', 'Offer Overview')}
          </Title>
          <Descriptions column={1} bordered size="small" style={{ marginBottom: '20px' }}>
            <Descriptions.Item label={t('offers.table.id', 'Offer ID')}>
              <Text copyable>{offer.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.drawer.offerName', 'Offer Name')}>
              {offer.offerName}
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.table.offerDate', 'Offer Date')}>
              {offer.offerDate ? dayjs(offer.offerDate).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.table.expiryDate', 'Expiry Date')}>
              {offer.expiryDate ? dayjs(offer.expiryDate).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            {offer.responseDate && (
              <Descriptions.Item label={t('offers.drawer.responseDate', 'Response Date')}>
                {dayjs(offer.responseDate).format('YYYY-MM-DD')}
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* Parent Entity References */}
          <Title level={5}>
            <FiUser style={{ marginRight: '8px' }} />
            {t('offers.drawer.references', 'Entity References')}
          </Title>
          <Descriptions column={1} bordered size="small" style={{ marginBottom: '20px' }}>
            <Descriptions.Item label={t('offers.table.candidate', 'Candidate Reference')}>
              <Text copyable>{offer.candidate || '-'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.drawer.jobAppRef', 'Job Application Reference')}>
              <Text copyable>{offer.jobApplication || '-'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.table.jobOpening', 'Job Opening Reference')}>
              <Text copyable>{offer.jobOpening || '-'}</Text>
            </Descriptions.Item>
          </Descriptions>

          {/* Compensation Section */}
          <Title level={5}>
            <FiDollarSign style={{ marginRight: '8px' }} />
            {t('offers.drawer.compensation', 'Compensation & Terms')}
          </Title>
          <Descriptions column={1} bordered size="small" style={{ marginBottom: '20px' }}>
            <Descriptions.Item label={t('offers.table.offeredSalary', 'Offered Salary')}>
              {offer.offeredSalary !== undefined && offer.offeredSalary !== null
                ? `${offer.currency || 'USD'} ${Number(offer.offeredSalary).toLocaleString()}`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.drawer.probation', 'Probation Period')}>
              {offer.probationPeriodMonths ? `${offer.probationPeriodMonths} ${t('offers.drawer.months', 'months')}` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.drawer.employmentType', 'Employment Type')}>
              {offer.employmentType || '-'}
            </Descriptions.Item>
          </Descriptions>

          {/* Employment Details Section */}
          <Title level={5}>
            <FiBriefcase style={{ marginRight: '8px' }} />
            {t('offers.drawer.employment', 'Employment Schedule')}
          </Title>
          <Descriptions column={1} bordered size="small" style={{ marginBottom: '20px' }}>
            <Descriptions.Item label={t('offers.table.joiningDate', 'Joining Date')}>
              {offer.joiningDate ? dayjs(offer.joiningDate).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('offers.drawer.reportingManager', 'Reporting Manager')}>
              {offer.reportingManager || '-'}
            </Descriptions.Item>
          </Descriptions>

          {/* Offer Letter & Attachment */}
          {offer.offerLetter && (
            <>
              <Title level={5}>
                <FiFileText style={{ marginRight: '8px' }} />
                {t('offers.drawer.offerLetter', 'Offer Letter Document')}
              </Title>
              <div style={{ marginBottom: '20px' }}>
                <Button
                  type="link"
                  icon={<FiFileText />}
                  href={offer.offerLetter}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: 0 }}
                >
                  {offer.offerLetter}
                </Button>
              </div>
            </>
          )}

          {/* Remarks & Notes */}
          {(offer.candidateRemarks || offer.notes) && (
            <>
              <Title level={5}>{t('offers.drawer.remarks', 'Remarks & Notes')}</Title>
              {offer.candidateRemarks && (
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                    {t('offers.drawer.candidateRemarks', 'Candidate Remarks')}:
                  </Text>
                  <Paragraph style={{ margin: 0 }}>{offer.candidateRemarks}</Paragraph>
                </div>
              )}
              {offer.notes && (
                <div style={{ marginBottom: '20px' }}>
                  <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                    {t('offers.drawer.notes', 'Internal Notes')}:
                  </Text>
                  <Paragraph style={{ margin: 0 }}>{offer.notes}</Paragraph>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <Text type="secondary">{t('offers.drawer.noData', 'No offer details selected.')}</Text>
      )}
    </Drawer>
  );
};

export default OfferDetailsDrawer;
