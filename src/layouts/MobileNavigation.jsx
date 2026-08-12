import React, { useEffect } from 'react';
import { Drawer, Avatar, Typography, Button } from 'antd';
import { FiLogOut } from 'react-icons/fi';
import { useSidebar } from '../hooks/useSidebar';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import Sidebar from './Sidebar';
import './Layouts.css';

const { Text } = Typography;

export const MobileNavigation = () => {
  const { isMobileOpen, closeMobileDrawer } = useSidebar();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen) {
        closeMobileDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, closeMobileDrawer]);

  return (
    <Drawer
      placement="left"
      onClose={closeMobileDrawer}
      open={isMobileOpen}
      width={280}
      styles={{ body: { padding: 0 } }}
      destroyOnClose={false}
      aria-label="Mobile Navigation Drawer"
    >
      <div className="mobile-drawer-content">
        <Sidebar isMobileDrawer onItemClick={closeMobileDrawer} />

        {/* Mobile User Identity Footer */}
        <div className="mobile-drawer-user-footer">
          <div className="mobile-drawer-user-info">
            <Avatar
              size="small"
              style={{ backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', fontWeight: 600 }}
            >
              {(user?.fullName || user?.name || user?.email || 'E')[0].toUpperCase()}
            </Avatar>
            <div className="mobile-drawer-user-text">
              <Text strong style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                {user?.fullName || user?.name || user?.email || 'User'}
              </Text>
              {user?.email && (
                <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block' }}>
                  {user.email}
                </Text>
              )}
            </div>
          </div>
          <Button
            type="text"
            danger
            icon={<FiLogOut size={16} />}
            onClick={() => {
              closeMobileDrawer();
              logout();
            }}
            title={t('auth.logout')}
          />
        </div>
      </div>
    </Drawer>
  );
};

export default MobileNavigation;
