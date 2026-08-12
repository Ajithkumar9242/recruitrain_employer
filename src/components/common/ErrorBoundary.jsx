import React from 'react';
import { Button, Result } from 'antd';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RecruitTrain Application Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          <Result
            status="500"
            title="RecruitTrain Encountered an Unexpected Issue"
            subTitle="The application state has been preserved. Please refresh or contact support if the issue persists."
            extra={[
              <Button type="primary" key="reload" onClick={this.handleReload}>
                Reload Application
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
