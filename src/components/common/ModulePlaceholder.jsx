import React from 'react';
import { Card, Result, Tag, Space, Typography } from 'antd';
import { ToolOutlined, LockOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import PageContainer from './PageContainer';
import PageHeader from './PageHeader';

const { Text } = Typography;

export const ModulePlaceholder = ({ moduleNameKey, moduleNameFallback }) => {
  const { t } = useLanguage();
  const moduleName = t(moduleNameKey, moduleNameFallback || 'Module');

  return (
    <PageContainer>
      <PageHeader
        title={moduleName}
        description={t('shell.modulePlaceholderSub')}
        actions={
          <Tag color="orange" icon={<LockOutlined />}>
            Pending Phase Approval
          </Tag>
        }
      />

      <Card style={{ borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-subtle)' }}>
        <Result
          icon={<ToolOutlined style={{ color: 'var(--brand-teal)', fontSize: 48 }} />}
          title={
            <Text strong style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>
              {moduleName} — {t('shell.modulePlaceholderTitle')}
            </Text>
          }
          subTitle={
            <Space direction="vertical" align="center" style={{ maxWidth: 500, margin: '8px auto' }}>
              <Text type="secondary" style={{ fontSize: '0.875rem' }}>
                {t('shell.modulePlaceholderSub')}
              </Text>
              <Text type="secondary" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                No fake business data or fallback counters are rendered per architectural guidelines.
              </Text>
            </Space>
          }
        />
      </Card>
    </PageContainer>
  );
};

export default ModulePlaceholder;
