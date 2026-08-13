import React from 'react';
import { Skeleton, Typography } from 'antd';
import { FiBriefcase } from 'react-icons/fi';
import { useCompany } from '../hooks/useCompany';
import './Layouts.css';

const { Text } = Typography;

export const CompanyIdentity = ({ collapsed = false }) => {
  const { companyName, companyLogo, isLoading } = useCompany();

  // Helper to extract initials from backend company name
  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (isLoading && !companyName) {
    return (
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon sidebar-brand-skeleton-icon">
          <Skeleton.Avatar active size={36} shape="square" />
        </div>
        {!collapsed && (
          <div className="sidebar-brand-text" style={{ flex: 1 }}>
            <Skeleton.Input active size="small" style={{ width: 120, height: 16 }} />
          </div>
        )}
      </div>
    );
  }

  const displayName = companyName || '';
  const initials = getInitials(displayName);

  return (
    <div className="sidebar-brand">
      {companyLogo ? (
        <div className="sidebar-brand-icon-wrapper">
          <img
            src={companyLogo}
            alt={displayName || 'Company Logo'}
            className="sidebar-brand-logo-img"
            onError={(e) => {
              // Graceful image load error fallback: hide broken image element to reveal initials icon
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = parent.querySelector('.sidebar-brand-fallback-icon');
                if (fallback) fallback.style.display = 'flex';
              }
            }}
          />
          <div className="sidebar-brand-icon sidebar-brand-fallback-icon" style={{ display: 'none' }}>
            {displayName ? initials : <FiBriefcase size={18} />}
          </div>
        </div>
      ) : (
        <div className="sidebar-brand-icon">
          {displayName ? initials : <FiBriefcase size={18} />}
        </div>
      )}

      {!collapsed && (
        <div className="sidebar-brand-text">
          <Text
            strong
            title={displayName}
            style={{
              color: 'var(--text-main)',
              fontSize: '0.9375rem',
              fontFamily: 'var(--font-family-heading)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
            }}
          >
            {displayName}
          </Text>
        </div>
      )}
    </div>
  );
};

export default CompanyIdentity;
