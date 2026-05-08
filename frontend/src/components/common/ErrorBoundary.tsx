'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {}
  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };
  private handleReload = () => {
    window.location.reload();
  };
  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="bg-error-100 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <AlertTriangle className="h-8 w-8 text-error-500" />
              </div>
              <CardTitle className="text-xl">Co loi xay ra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-neutral-600">
                Da co loi xay ra trong qua trinh tai trang. Vui long thu lai.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="rounded-lg bg-neutral-100 p-3">
                  <p className="break-all font-mono text-xs text-error-600">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={this.handleReset}>
                  Thu lai
                </Button>
                <Button onClick={this.handleReload}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tai lai trang
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
