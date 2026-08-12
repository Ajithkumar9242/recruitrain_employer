import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import './Navigation.css';

export const NavigationGroup = ({ titleKey, isCollapsed, children }) => {
  const { t } = useLanguage();
  const title = t(titleKey);

  return (
    <div className={`nav-group ${isCollapsed ? 'collapsed' : ''}`}>
      {!isCollapsed ? (
        <div className="nav-group-title">{title}</div>
      ) : (
        <div className="nav-group-divider" aria-hidden="true" />
      )}
      <div className="nav-group-items">{children}</div>
    </div>
  );
};

export default NavigationGroup;
