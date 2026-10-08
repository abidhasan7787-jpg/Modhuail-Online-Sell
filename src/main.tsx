import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in MJ App:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 font-bold text-lg mx-auto flex items-center justify-center">
              MJ
            </div>
            <h2 className="text-xl font-bold font-serif text-slate-900">Application Initialization Notice</h2>
            <p className="text-xs text-slate-500">
              Something went wrong during page rendering. Your saved data remains safe.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  window.location.hash = '#/home';
                  window.location.reload();
                }}
                className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-sky-600 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Reload Store
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                  } catch (e) {}
                  window.location.hash = '#/home';
                  window.location.reload();
                }}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Reset Local Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
