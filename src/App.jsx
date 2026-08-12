import React from 'react';
import { ConfigProvider } from 'antd';
import { useTheme } from './hooks/useTheme';
import { lightTheme, darkTheme } from './config/theme';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRouter from './routes/AppRouter';
import './index.css';

export const App = () => {
  const { isDarkMode } = useTheme();

  return (
    <ConfigProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </ConfigProvider>
  );
};

export default App;
