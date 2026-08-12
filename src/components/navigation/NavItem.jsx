import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Tooltip } from 'antd';
import { useLanguage } from '../../hooks/useLanguage';
import './Navigation.css';

export const NavItem = ({ to, labelKey, icon: Icon, isCollapsed, onClick }) => {
  const { t } = useLanguage();
  const location = useLocation();

  const label = t(labelKey);
  const isActive = location.pathname === to || (to !== '/app' && location.pathname.startsWith(to));

  const content = (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive: isLinkActive }) =>
        `nav-item-link ${isLinkActive || isActive ? 'active' : ''}`
      }
      tabIndex={0}
      aria-label={label}
    >
      <span className="nav-item-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      {!isCollapsed && <span className="nav-item-label">{label}</span>}
    </NavLink>
  );

  if (isCollapsed) {
    return (
      <Tooltip title={label} placement="right" arrow={{ pointAtCenter: true }}>
        <div className="nav-item-collapsed-wrapper">{content}</div>
      </Tooltip>
    );
  }

  return content;
};

export default NavItem;
