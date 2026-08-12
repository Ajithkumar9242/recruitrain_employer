import React, { useState } from 'react';
import { Input, Button, Dropdown, Avatar, Space, Typography, Popover, message, Divider } from 'antd';
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useSidebar } from '../hooks/useSidebar';
import { useLanguage } from '../hooks/useLanguage';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import LanguageToggle from '../components/common/LanguageToggle';
import ThemeToggle from '../components/common/ThemeToggle';
import './Layouts.css';

const { Text } = Typography;

export const Topbar = () => {
  const { user, logout } = useAuth();
  const { toggleMobileDrawer } = useSidebar();
  const { t } = useLanguage();

  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      message.info(t('shell.searchNotice'));
    }
  };

  const handleNotificationClick = () => {
    message.info(t('shell.noNotifications'));
  };

  const profileMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 8px' }}>
          <Text strong style={{ display: 'block', color: 'var(--text-main)' }}>
            {user?.fullName || user?.name || user?.email || 'Employer User'}
          </Text>
          <Text type="secondary" style={{ fontSize: '0.75rem' }}>
            {user?.email || ''}
          </Text>
          {user?.companyName || user?.company ? (
            <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block', color: 'var(--brand-teal)' }}>
              {user?.companyName || user?.company}
            </Text>
          ) : null}
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <FiUser size={14} />,
      label: t('shell.profilePlaceholder'),
      onClick: () => message.info(t('shell.profilePlaceholder')),
    },
    {
      key: 'settings',
      icon: <FiSettings size={14} />,
      label: t('shell.settingsPlaceholder'),
      onClick: () => message.info(t('shell.settingsPlaceholder')),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <FiLogOut size={14} />,
      label: t('auth.logout'),
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <header className="app-topbar">
      {/* Left Section: Mobile Menu & Breadcrumbs */}
      <div className="topbar-left">
        <Button
          type="text"
          icon={<FiMenu size={20} />}
          onClick={toggleMobileDrawer}
          className="mobile-menu-btn"
          aria-label="Open navigation menu"
        />
        <div className="topbar-breadcrumbs-wrapper">
          <Breadcrumbs />
        </div>
      </div>

      {/* Center Section: Global Search UI Foundation */}
      <div className="topbar-center">
        <form onSubmit={handleSearchSubmit} className="topbar-search-form">
          <Input
            prefix={<FiSearch size={16} style={{ color: 'var(--text-muted)' }} />}
            placeholder={t('shell.searchPlaceholder')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="topbar-search-input"
            allowClear
          />
        </form>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="topbar-right">
        <Space size="small" align="center">
          {/* Notification Bell UI Foundation */}
          <Button
            type="text"
            icon={<FiBell size={18} />}
            onClick={handleNotificationClick}
            aria-label={t('shell.notifications')}
            className="topbar-action-btn"
          />

          {/* Language Switcher */}
          <div className="topbar-control-item">
            <LanguageToggle size="small" />
          </div>

          {/* Theme Switcher */}
          <div className="topbar-control-item">
            <ThemeToggle size="small" />
          </div>

          {/* User Profile Dropdown */}
          <Dropdown menu={{ items: profileMenuItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" className="topbar-user-dropdown-btn">
              <Avatar
                size="small"
                style={{ backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', fontWeight: 600 }}
              >
                {(user?.fullName || user?.name || user?.email || 'E')[0].toUpperCase()}
              </Avatar>
              <span className="topbar-username">
                {user?.fullName || user?.name || user?.email?.split('@')[0] || 'User'}
              </span>
              <FiChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </Button>
          </Dropdown>
        </Space>
      </div>
    </header>
  );
};

export default Topbar;
