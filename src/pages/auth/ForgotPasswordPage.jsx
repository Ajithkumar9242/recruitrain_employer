import React, { useState } from 'react';
import { Form, Input, Button, Alert, Space, Typography, ConfigProvider } from 'antd';
import { MailOutlined, ArrowLeftOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { authApi } from '../../services/authApi';
import { useLanguage } from '../../hooks/useLanguage';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import LanguageToggle from '../../components/common/LanguageToggle';
import { lightTheme } from '../../config/theme';
import { ROUTES } from '../../routes/routes';
import './AuthStyles.css';

const { Title, Text, Paragraph } = Typography;

export const ForgotPasswordPage = () => {
  const { t } = useLanguage();
  const prefersReducedMotion = usePrefersReducedMotion();

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState(null);

  const forgotSchema = z.object({
    email: z
      .string()
      .min(1, { message: t('auth.emailRequired') })
      .email({ message: t('auth.emailInvalid') }),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await authApi.forgotPassword({ email: data.email });
      setSubmitted(true);
    } catch (err) {
      setServerError(
        err?.message || t('common.error')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.25, ease: 'easeOut' },
    },
  };

  return (
    <ConfigProvider theme={lightTheme}>
      <div className="auth-page-container" data-theme="light">
        <motion.main
          className="auth-split-layout"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <section className="auth-left-col" style={{ width: '100%', gridColumn: 'span 2' }}>
            <div className="auth-form-wrapper" style={{ maxWidth: 420 }}>
              {/* Brand Header */}
              <div className="auth-brand-header">
                <div className="auth-brand-icon">RT</div>
                <Title level={4} style={{ margin: 0, color: 'var(--brand-navy)', fontFamily: 'var(--font-family-heading)' }}>
                  RecruitTrain
                </Title>
              </div>

              {/* Title & Description */}
              <Title level={2} style={{ margin: 0, color: 'var(--brand-navy)', fontWeight: 600 }}>
                {t('auth.forgotPasswordTitle')}
              </Title>
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 24, fontSize: '0.875rem' }}>
                {t('auth.forgotPasswordSub')}
              </Paragraph>

              {/* Success Feedback State */}
              {submitted ? (
                <Alert
                  title={
                    <Space align="start">
                      <CheckCircleFilled style={{ color: '#10B981', fontSize: 18 }} />
                      <Text style={{ fontSize: '0.875rem' }}>
                        {t('auth.resetEmailSent')}
                      </Text>
                    </Space>
                  }
                  type="success"
                  style={{ marginBottom: 24, borderRadius: 6 }}
                />
              ) : (
                <>
                  {serverError && (
                    <Alert
                      title={serverError}
                      type="error"
                      showIcon
                      dismissible
                      onClose={() => setServerError(null)}
                      style={{ marginBottom: 20, borderRadius: 6 }}
                    />
                  )}

                  <Form layout="vertical" onFinish={handleSubmit(onSubmit)} noValidate>
                    <Form.Item
                      label={<Text strong style={{ color: 'var(--text-main)' }}>{t('auth.email')}</Text>}
                      validateStatus={errors.email ? 'error' : ''}
                      help={errors.email?.message}
                      required
                    >
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            size="large"
                            prefix={<MailOutlined style={{ color: 'var(--brand-muted)' }} />}
                            placeholder={t('auth.emailPlaceholder')}
                            autoComplete="email"
                          />
                        )}
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={submitting}
                      style={{
                        backgroundColor: 'var(--brand-navy)',
                        borderColor: 'var(--brand-navy)',
                        height: 44,
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        marginBottom: 16,
                      }}
                    >
                      {submitting ? t('auth.sending') : t('auth.sendResetLink')}
                    </Button>
                  </Form>
                </>
              )}

              {/* Back to Login Link */}
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Link to={ROUTES.LOGIN} className="auth-forgot-link" style={{ fontSize: '0.875rem' }}>
                  <ArrowLeftOutlined style={{ marginRight: 6 }} />
                  {t('auth.backToLogin')}
                </Link>
              </div>

              {/* Language Footer */}
              <div className="auth-form-footer" style={{ justifyContent: 'center' }}>
                <Space align="center">
                  <Text type="secondary" style={{ fontSize: '0.8125rem' }}>
                    {t('common.language')}:
                  </Text>
                  <LanguageToggle size="small" />
                </Space>
              </div>
            </div>
          </section>
        </motion.main>
      </div>
    </ConfigProvider>
  );
};

export default ForgotPasswordPage;
