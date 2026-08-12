import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Alert, Space, Typography, ConfigProvider } from 'antd';
import { MailOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useResponsive } from '../../hooks/useResponsive';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import LanguageToggle from '../../components/common/LanguageToggle';
import { lightTheme } from '../../config/theme';
import { ROUTES } from '../../routes/routes';
import './AuthStyles.css';

const { Title, Text, Paragraph } = Typography;

export const LoginPage = () => {
  const { t } = useLanguage();
  const { login, isAuthenticating } = useAuth();
  const responsive = useResponsive();
  const prefersReducedMotion = usePrefersReducedMotion();
  const navigate = useNavigate();

  const [serverError, setServerError] = useState(null);

  // Zod Validation Schema
  const loginSchema = z.object({
    email: z
      .string()
      .min(1, { message: t('auth.emailRequired') })
      .email({ message: t('auth.emailInvalid') }),
    password: z
      .string()
      .min(1, { message: t('auth.passwordRequired') }),
    rememberMe: z.boolean().optional(),
    termsAgree: z.literal(true, {
      errorMap: () => ({ message: t('auth.termsRequired') }),
    }),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      termsAgree: false,
    },
  });

  const onSubmit = async (data) => {
    setServerError(null);
    const result = await login({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });

    if (result.success) {
      navigate(ROUTES.APP, { replace: true });
    } else {
      setServerError(
        result.error?.message || t('auth.invalidCredentials')
      );
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
          {/* Left Column: Form Section */}
          <section className="auth-left-col" aria-label="Employer Login Section">
            <div className="auth-form-wrapper">
              {/* Logo Header */}
              <div className="auth-brand-header">
                <div className="auth-brand-icon">RT</div>
                <div className="auth-brand-text">
                  <Title level={4} style={{ margin: 0, color: 'var(--brand-navy)', fontFamily: 'var(--font-family-heading)' }}>
                    RecruitTrain
                  </Title>
                  <Text type="secondary" style={{ fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Employer ATS
                  </Text>
                </div>
              </div>

              {/* Title & Description */}
              <div className="auth-title-block">
                <Title level={2} style={{ margin: 0, color: 'var(--brand-navy)', fontWeight: 600 }}>
                  {t('auth.welcomeBack')}
                </Title>
                <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 24, fontSize: '0.875rem' }}>
                  {t('auth.welcomeSub')}
                </Paragraph>
              </div>

              {/* Server Error Alert */}
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

              {/* Login Form */}
              <Form
                layout="vertical"
                onFinish={handleSubmit(onSubmit)}
                noValidate
                aria-label="Sign in form"
              >
                {/* Email Input */}
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

                {/* Password Input */}
                <Form.Item
                  label={
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Text strong style={{ color: 'var(--text-main)' }}>{t('auth.password')}</Text>
                      <Link to={ROUTES.FORGOT_PASSWORD} className="auth-forgot-link">
                        {t('auth.forgotPassword')}
                      </Link>
                    </div>
                  }
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
                        placeholder={t('auth.passwordPlaceholder')}
                        autoComplete="current-password"
                      />
                    )}
                  />
                </Form.Item>

                {/* Remember Me Checkbox */}
                <Form.Item style={{ marginBottom: 12 }}>
                  <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) => (
                      <Checkbox checked={field.value} onChange={field.onChange}>
                        <Text style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {t('auth.rememberMe')}
                        </Text>
                      </Checkbox>
                    )}
                  />
                </Form.Item>

                {/* Terms & Conditions Checkbox */}
                <Form.Item
                  validateStatus={errors.termsAgree ? 'error' : ''}
                  help={errors.termsAgree?.message}
                  style={{ marginBottom: 24 }}
                >
                  <Controller
                    name="termsAgree"
                    control={control}
                    render={({ field }) => (
                      <Checkbox checked={field.value} onChange={field.onChange}>
                        <Text style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {t('auth.termsAgree')}
                        </Text>
                      </Checkbox>
                    )}
                  />
                </Form.Item>

                {/* Login Button */}
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={isAuthenticating}
                  style={{
                    backgroundColor: 'var(--brand-navy)',
                    borderColor: 'var(--brand-navy)',
                    height: 44,
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                  }}
                >
                  {isAuthenticating ? t('auth.signingIn') : t('auth.loginButton')}
                </Button>
              </Form>

              {/* Language Switcher Footer */}
              <div className="auth-form-footer">
                <Space align="center">
                  <Text type="secondary" style={{ fontSize: '0.8125rem' }}>
                    {t('common.language')}:
                  </Text>
                  <LanguageToggle size="small" />
                </Space>
              </div>
            </div>
          </section>

          {/* Right Column: Visual Artwork Placeholder (Desktop Only) */}
          <section className="auth-right-col" aria-label="Visual Illustration Area">
            <div className="auth-artwork-placeholder">
              <div className="auth-artwork-badge">
                <CheckCircleOutlined style={{ color: 'var(--brand-teal)' }} />
                <span>Enterprise Recruitment SaaS</span>
              </div>
              <Title level={3} style={{ color: '#FFFFFF', marginTop: 16, marginBottom: 8, fontWeight: 500 }}>
                RecruitTrain Employer Suite
              </Title>
              <Paragraph style={{ color: '#94A3B8', maxWidth: 360, fontSize: '0.875rem' }}>
                Authoritative Frappe backend integration. Enterprise pipeline management & talent analytics.
              </Paragraph>
              {/* Reserved Clean Artwork Slot */}
              <div className="auth-artwork-canvas" title="Reserved visual/illustration area" />
            </div>
          </section>
        </motion.main>
      </div>
    </ConfigProvider>
  );
};

export default LoginPage;
