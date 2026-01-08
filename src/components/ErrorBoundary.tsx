import { Component } from 'react';
import type { ReactNode } from 'react';
import { MdError, MdRefresh } from 'react-icons/md';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1a1a1a] rounded-lg p-8 border border-gray-800 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-900/20 rounded-full">
                <MdError className="w-12 h-12 text-red-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h1>
            <p className="text-gray-400 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <div className="bg-[#0d0d0d] rounded p-3 mb-6 text-left">
                <p className="text-xs text-gray-500 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition-colors font-medium mx-auto"
            >
              <MdRefresh className="w-5 h-5" />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
