import React from 'react';
import { Segmented } from 'antd';
import { useLanguage } from '../../hooks/useLanguage';

export const LanguageToggle = ({ size = 'middle' }) => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const options = [
    {
      label: 'EN',
      value: 'en',
    },
    {
      label: 'DE',
      value: 'de',
    },
  ];

  return (
    <Segmented
      size={size}
      options={options}
      value={currentLanguage}
      onChange={changeLanguage}
    />
  );
};

export default LanguageToggle;
