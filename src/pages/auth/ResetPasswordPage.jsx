import React, { useState } from 'react';
import { Form, Input, Button, Alert, Space, Typography, ConfigProvider } from 'antd';
import { LockOutlined, CheckCircleFilled, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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

export const ResetPasswordPage = () => {
  const { t } = useLanguage();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const resetToken = searchParams.get('key') || searchParams.get('token');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState(
    !resetToken ? t('auth.missingResetToken') : null
  );

  const resetSchema = z
    .object({
      password: z
        .string()
        .min(1, { message: t('auth.passwordRequired') })
        .min(8, { message: t('auth.passwordTooShort') }),
      confirmPassword: z
        .string()
        .min(1, { message: t('auth.passwordRequired') }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    if (!resetToken) {
      setServerError(t('auth.missingResetToken'));
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      await authApi.resetPassword({
        key: resetToken,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setSuccess(true);
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
              <div className="auth-brand-header">
                <div className="auth-brand-icon">RT</div>
                <Title level={4} style={{ margin: 0, color: 'var(--brand-navy)', fontFamily: 'var(--font-family-heading)' }}>
                  RecruitTrain
                </Title>
              </div>

              <Title level={2} style={{ margin: 0, color: 'var(--brand-navy)', fontWeight: 600 }}>
                {t('auth.resetPasswordTitle')}
              </Title>
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 24, fontSize: '0.875rem' }}>
                {t('auth.resetPasswordSub')}
              </Paragraph>

              {success ? (
                <div style={{ textAlign: 'center' }}>
                  <Alert
                    title={
                      <Space align="start">
                        <CheckCircleFilled style={{ color: '#10B981', fontSize: 18 }} />
                        <Text style={{ fontSize: '0.875rem' }}>
                          {t('auth.resetSuccess')}
                        </Text>
                      </Space>
                    }
                    type="success"
                    style={{ marginBottom: 24, borderRadius: 6 }}
                  />
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={() => navigate(ROUTES.LOGIN)}
                    style={{
                      backgroundColor: 'var(--brand-navy)',
                      borderColor: 'var(--brand-navy)',
                      height: 44,
                      fontWeight: 600,
                    }}
                  >
                    {t('auth.login')}
                  </Button>
                </div>
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
                      label={<Text strong style={{ color: 'var(--text-main)' }}>{t('auth.newPassword')}</Text>}
                      validateStatus={errors.password ? 'error' : ''}
                      help={errors.password?.message}
                      required
                    >
                      <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                          <Input.Password
                            {...field}
                            size="large"
                            prefix={<LockOutlined style={{ color: 'var(--brand-muted)' }} />}
                            placeholder={t('auth.newPasswordPlaceholder')}
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      label={<Text strong style={{ color: 'var(--text-main)' }}>{t('auth.confirmPassword')}</Text>}
                      validateStatus={errors.confirmPassword ? 'error' : ''}
                      help={errors.confirmPassword?.message}
                      required
                    >
                      <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                          <Input.Password
                            {...field}
                            size="large"
                            prefix={<LockOutlined style={{ color: 'var(--brand-muted)' }} />}
                            placeholder={t('auth.confirmPasswordPlaceholder')}
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
                      disabled={!resetToken}
                      style={{
                        backgroundColor: 'var(--brand-navy)',
                        borderColor: 'var(--brand-navy)',
                        height: 44,
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        marginBottom: 16,
                      }}
                    >
                      {submitting ? t('auth.sending') : t('auth.resetPasswordTitle')}
                    </Button>
                  </Form>
                </>
              )}

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Link to={ROUTES.LOGIN} className="auth-forgot-link" style={{ fontSize: '0.875rem' }}>
                  <ArrowLeftOutlined style={{ marginRight: 6 }} />
                  {t('auth.backToLogin')}
                </Link>
              </div>

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

export default ResetPasswordPage;
