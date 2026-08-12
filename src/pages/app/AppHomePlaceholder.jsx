import React from 'react';
import { Card, Result, Tag, Typography, Space } from 'antd';
import { CheckCircleFilled, LayoutOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import PageContainer from '../../components/common/PageContainer';
import PageHeader from '../../components/common/PageHeader';

const { Text } = Typography;

export const AppHomePlaceholder = () => {
  const { t } = useLanguage();

  return (
    <PageContainer>
      <PageHeader
        title={t('shell.appShellReadyTitle')}
        description={t('shell.appShellReadyNotice')}
        actions={
          <Tag color="success" icon={<CheckCircleFilled />}>
            Phase 3 Shell Certified
          </Tag>
        }
      />

      <Card style={{ borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-subtle)' }}>
        <Result
          icon={<LayoutOutlined style={{ color: 'var(--brand-navy)', fontSize: 52 }} />}
          title={
            <Text strong style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>
              {t('shell.appShellReadyTitle')}
            </Text>
          }
          subTitle={
            <Space direction="vertical" align="center" style={{ maxWidth: 540, margin: '12px auto' }}>
              <Text type="secondary" style={{ fontSize: '0.9375rem' }}>
                {t('shell.appShellReadyNotice')}
              </Text>
              <Text type="secondary" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                This is a clean development placeholder. This is NOT the Dashboard. No fake metrics, charts, or business records are rendered.
              </Text>
            </Space>
          }
        />
      </Card>
    </PageContainer>
  );
};

export default AppHomePlaceholder;
