import React from 'react';
import { Button, Tooltip, Typography } from 'antd';
import {
  FiGrid,
  FiBell,
  FiBriefcase,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiAward,
  FiLayers,
  FiBarChart2,
  FiCreditCard,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useSidebar } from '../hooks/useSidebar';
import { useLanguage } from '../hooks/useLanguage';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import CompanyIdentity from './CompanyIdentity';
import NavItem from '../components/navigation/NavItem';
import NavigationGroup from '../components/navigation/NavigationGroup';
import { ROUTES } from '../routes/routes';
import './Layouts.css';

const { Text } = Typography;

export const Sidebar = ({ isMobileDrawer = false, onItemClick }) => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { t } = useLanguage();
  const prefersReducedMotion = usePrefersReducedMotion();

  const collapsed = isMobileDrawer ? false : isCollapsed;

  const sidebarVariants = {
    expanded: { width: 240, transition: { duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeInOut' } },
    collapsed: { width: 72, transition: { duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeInOut' } },
  };

  return (
    <motion.aside
      className={`app-sidebar ${isMobileDrawer ? 'mobile-drawer-sidebar' : ''}`}
      initial={false}
      animate={collapsed ? 'collapsed' : 'expanded'}
      variants={isMobileDrawer ? {} : sidebarVariants}
    >
      {/* Brand Header — Authoritative Backend Company Profile */}
      <CompanyIdentity collapsed={collapsed} />

      {/* Scrollable Navigation Area */}
      <div className="sidebar-nav-container">
        {/* MAIN GROUP */}
        <NavigationGroup titleKey="nav.groupMain" isCollapsed={collapsed}>
          <NavItem
            to={ROUTES.DASHBOARD}
            labelKey="nav.dashboard"
            icon={FiGrid}
            isCollapsed={collapsed}
            onClick={onItemClick}
          />
          <NavItem
            to={ROUTES.NOTIFICATIONS}
            labelKey="shell.notifications"
            icon={FiBell}
            isCollapsed={collapsed}
            onClick={onItemClick}
          />
        </NavigationGroup>

        {/* RECRUITMENT GROUP */}
        <NavigationGroup titleKey="nav.groupRecruitment" isCollapsed={collapsed}>
          <NavItem
            to={ROUTES.JOBS}
            labelKey="nav.jobs"
            icon={FiBriefcase}
            isCollapsed={collapsed}
            onClick={onItemClick}
          />
          <NavItem
            to={ROUTES.CANDIDATES}
            labelKey="nav.candidates"
            icon={FiUsers}
            isCollapsed={collapsed}
            onClick={onItemClick}
          />
          <NavItem
            to={ROUTES.APPLICATIONS}
            labelKey="nav.applications"
            icon={FiFileText}
            isCollapsed={collapsed}
            onClick={onItemClick}
          />
          <NavItem
            to={ROUTES.INTERVIEWS}
            labelKey="nav.interviews"
            icon={FiCalendar}
            isCollapsed={collapsed}
            onClick={onItemClick}
          />
          <NavItem
            to={ROUTES.OFFERS}
            labelKey="nav.offers"
            icon={FiAward}
            isCollapsed={collapsed}
            onClick={onItemClick}
          />
        </NavigationGroup>

        {/* TALENT GROUP */}
        <NavigationGroup titleKey="nav.groupTalent" isCollapsed={collapsed}>
          <NavItem
            to={ROUTES.TALENT_POOLS}
            labelKey="nav.talentPools"
            icon={FiLayers}
            isCollapsed={collapsed}
            onClick={onItemClick}
          />
        </NavigationGroup>

        {/* INSIGHTS GROUP */}
        <NavigationGroup titleKey="nav.groupInsights" isCollapsed={collapsed}>
          <NavItem
            to={ROUTES.ANALYTICS}
            labelKey="nav.analytics"
            icon={FiBarChart2}
            isCollapsed={collapsed}
            onClick={onItemClick}
          />
        </NavigationGroup>

        {/* ACCOUNT GROUP */}
        <NavigationGroup titleKey="nav.groupAccount" isCollapsed={collapsed}>
          <NavItem
            to={ROUTES.BILLING}
            labelKey="nav.billing"
            icon={FiCreditCard}
            isCollapsed={collapsed}
            onClick={onItemClick}
          />
          <NavItem
            to={ROUTES.SETTINGS}
            labelKey="nav.settings"
            icon={FiSettings}
            isCollapsed={collapsed}
            onClick={onItemClick}
          />
        </NavigationGroup>
      </div>

      {/* Footer Collapse Toggle (Desktop Only) */}
      {!isMobileDrawer && (
        <div className="sidebar-footer">
          <Tooltip
            title={collapsed ? t('shell.expandSidebar') : t('shell.collapseSidebar')}
            placement="right"
          >
            <Button
              type="text"
              block
              icon={collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
              onClick={toggleSidebar}
              className="sidebar-collapse-btn"
            >
              {!collapsed && <span>{t('shell.collapseSidebar')}</span>}
            </Button>
          </Tooltip>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
