import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12"
          data-testid="error-boundary"
        >
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We're sorry, but an unexpected error occurred. Please try reloading the page.
            </p>
            {this.state.error && (
              <div className="mt-4 bg-red-50 p-4 rounded text-left overflow-auto max-h-40 text-xs text-red-800 font-mono">
                {this.state.error.toString()}
              </div>
            )}
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reload Page
              </button>
            </div>
            <div className="mt-2">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Try to recover
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
