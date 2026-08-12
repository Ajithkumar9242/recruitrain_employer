import React from 'react';
import { Segmented } from 'antd';
import { SunOutlined, MoonOutlined, DesktopOutlined } from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';

export const ThemeToggle = ({ size = 'middle' }) => {
  const { themePreference, changeTheme } = useTheme();
  const { t } = useLanguage();

  const options = [
    {
      label: t('common.light', 'Light'),
      value: 'light',
      icon: <SunOutlined />,
    },
    {
      label: t('common.dark', 'Dark'),
      value: 'dark',
      icon: <MoonOutlined />,
    },
    {
      label: t('common.system', 'System'),
      value: 'system',
      icon: <DesktopOutlined />,
    },
  ];

  return (
    <Segmented
      size={size}
      options={options}
      value={themePreference}
      onChange={changeTheme}
    />
  );
};

export default ThemeToggle;
