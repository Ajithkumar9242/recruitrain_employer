import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { ROUTES } from '../../routes/routes';

export const Breadcrumbs = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const pathSnippets = location.pathname.split('/').filter((i) => i && i !== 'app');

  // Breadcrumb item translation map
  const routeNameMap = {
    dashboard: t('nav.dashboard'),
    jobs: t('nav.jobs'),
    candidates: t('nav.candidates'),
    applications: t('nav.applications'),
    interviews: t('nav.interviews'),
    offers: t('nav.offers'),
    'talent-pools': t('nav.talentPools'),
    analytics: t('nav.analytics'),
    billing: t('nav.billing'),
    settings: t('nav.settings'),
  };

  const breadcrumbItems = [
    {
      title: <Link to={ROUTES.APP}>RecruitTrain</Link>,
      key: 'home',
    },
    ...pathSnippets.map((snippet, index) => {
      const url = `/app/${pathSnippets.slice(0, index + 1).join('/')}`;
      const isLast = index === pathSnippets.length - 1;
      const label = routeNameMap[snippet] || snippet;

      return {
        title: isLast ? <span>{label}</span> : <Link to={url}>{label}</Link>,
        key: url,
      };
    }),
  ];

  return (
    <Breadcrumb
      items={breadcrumbItems}
      style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}
    />
  );
};

export default Breadcrumbs;
