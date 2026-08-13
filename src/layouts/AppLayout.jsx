import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSidebar } from '../hooks/useSidebar';
import { useResponsive } from '../hooks/useResponsive';
import { useCompany } from '../hooks/useCompany';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import MobileNavigation from './MobileNavigation';
import './Layouts.css';

export const AppLayout = ({ children }) => {
  const { isCollapsed, setSidebarCollapsed } = useSidebar();
  const { isTablet, isMobile } = useResponsive();
  const { loadCompanyProfile } = useCompany();

  // Load authoritative Company Profile from backend once application shell is initialized
  useEffect(() => {
    loadCompanyProfile();
  }, [loadCompanyProfile]);

  // Auto-collapse sidebar on tablet viewports
  useEffect(() => {
    if (isTablet && !isCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [isTablet, isCollapsed, setSidebarCollapsed]);

  return (
    <div className="app-shell-container">
      {/* Topbar Header */}
      <Topbar />

      {/* Body Grid: Sidebar + Main Content */}
      <div className="app-shell-body">
        {!isMobile && <Sidebar />}
        <MainContent>{children || <Outlet />}</MainContent>
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default AppLayout;
