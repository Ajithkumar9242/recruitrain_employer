import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

export const PageContainer = ({ children, style = {} }) => {
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        padding: isMobile ? '16px' : '24px 32px',
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default PageContainer;
