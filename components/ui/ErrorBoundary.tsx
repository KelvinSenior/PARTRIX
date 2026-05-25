"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import Button from "./Button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("UI Error Boundary caught an error:", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-100 px-4 py-8 text-center dark:bg-zinc-950">
          <div className="mx-auto max-w-xl rounded-[32px] border border-zinc-200/80 bg-white/95 p-10 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Something went wrong</p>
            <h1 className="mt-4 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">An unexpected error occurred.</h1>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Please refresh the page or try again later.</p>
            <div className="mt-6">
              <Button onClick={this.reset}>Try again</Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
