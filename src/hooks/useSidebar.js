import { useDispatch, useSelector } from 'react-redux';
import {
  selectSidebarCollapsed,
  selectMobileDrawerOpen,
  toggleSidebar,
  setSidebarCollapsed,
  setMobileDrawerOpen,
  toggleMobileDrawer,
} from '../store/slices/uiSlice';

export const useSidebar = () => {
  const dispatch = useDispatch();
  const isCollapsed = useSelector(selectSidebarCollapsed);
  const isMobileOpen = useSelector(selectMobileDrawerOpen);

  return {
    isCollapsed,
    isMobileOpen,
    toggleSidebar: () => dispatch(toggleSidebar()),
    setSidebarCollapsed: (collapsed) => dispatch(setSidebarCollapsed(collapsed)),
    setMobileDrawerOpen: (open) => dispatch(setMobileDrawerOpen(open)),
    toggleMobileDrawer: () => dispatch(toggleMobileDrawer()),
    closeMobileDrawer: () => dispatch(setMobileDrawerOpen(false)),
  };
};

export default useSidebar;
