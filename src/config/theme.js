import { theme as antdTheme } from 'antd';

/**
 * RecruitTrain Brand Colors for Ant Design 5 Theme
 */
export const BRAND_COLORS = {
  navy: '#16313F',
  navySoft: '#1B4965',
  teal: '#4FA8C0',
  tealLight: '#EAF5F8',
  tealBg: '#F3FAFB',
  amber: '#E8943C',
  amberLight: '#FCEFE0',
  ink: '#16313F',
  muted: '#5C7480',
  border: '#DCE9ED',
  white: '#FFFFFF',
};

/**
 * Light Theme Configuration for Ant Design
 */
export const lightTheme = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    colorPrimary: BRAND_COLORS.navy,
    colorLink: BRAND_COLORS.teal,
    colorLinkHover: BRAND_COLORS.navySoft,
    colorSuccess: '#10B981',
    colorWarning: BRAND_COLORS.amber,
    colorError: '#EF4444',
    colorInfo: BRAND_COLORS.teal,
    colorBgBase: '#FFFFFF',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#F8FAFC',
    colorText: BRAND_COLORS.navy,
    colorTextSecondary: BRAND_COLORS.muted,
    colorBorder: BRAND_COLORS.border,
    colorBorderSecondary: '#EBF2F5',
    borderRadius: 6,
    controlHeight: 38,
    boxShadow: '0 1px 3px 0 rgba(22, 49, 63, 0.08)',
  },
  components: {
    Button: {
      fontWeight: 500,
      borderRadius: 6,
      colorPrimary: BRAND_COLORS.navy,
      colorPrimaryHover: BRAND_COLORS.navySoft,
    },
    Card: {
      borderRadiusLG: 8,
      borderColorBg: BRAND_COLORS.border,
    },
    Table: {
      headerBg: BRAND_COLORS.tealBg,
      headerColor: BRAND_COLORS.navy,
      rowHoverBg: '#F8FAFC',
      borderRadius: 8,
    },
    Input: {
      colorBorder: BRAND_COLORS.border,
      activeBorderColor: BRAND_COLORS.teal,
    },
    Select: {
      colorBorder: BRAND_COLORS.border,
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: BRAND_COLORS.muted,
      itemSelectedColor: BRAND_COLORS.navy,
      itemSelectedBg: BRAND_COLORS.tealLight,
    },
  },
};

/**
 * Dark Theme Configuration for Ant Design
 */
export const darkTheme = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    colorPrimary: '#4FA8C0',
    colorLink: '#4FA8C0',
    colorLinkHover: '#38BDF8',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#F87171',
    colorInfo: '#4FA8C0',
    colorBgBase: '#0C171F',
    colorBgContainer: '#12222E',
    colorBgElevated: '#182C3A',
    colorBgLayout: '#0C171F',
    colorText: '#F1F5F9',
    colorTextSecondary: '#94A3B8',
    colorBorder: '#203646',
    colorBorderSecondary: '#192A37',
    borderRadius: 6,
    controlHeight: 38,
  },
  components: {
    Button: {
      fontWeight: 500,
      borderRadius: 6,
    },
    Card: {
      borderRadiusLG: 8,
    },
    Table: {
      headerBg: '#182C3A',
      rowHoverBg: '#1E3748',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#1E3748',
    },
  },
};
