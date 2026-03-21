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
          className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-12"
          data-testid="error-boundary"
        >
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-900/20">
              <svg className="h-8 w-8 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-zinc-100">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              We're sorry, but an unexpected error occurred. Please try reloading the page.
            </p>
            {this.state.error && (
              <div className="mt-4 max-h-40 overflow-auto rounded border border-red-500/20 bg-red-900/10 p-4 text-left font-mono text-xs text-red-200">
                {this.state.error.toString()}
              </div>
            )}
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                Reload Page
              </button>
            </div>
            <div className="mt-2">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="text-sm text-violet-400 transition-colors hover:text-violet-300"
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
