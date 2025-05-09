"use client"

import React, { Component, ComponentType, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    resetError = (): void => {
        this.setState({
            hasError: false,
            error: null
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (typeof this.props.fallback === 'function') {
                return this.props.fallback(this.state.error!, this.resetError);
            }

            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                    <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Something went wrong</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={this.resetError}
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Higher-order component that wraps a component with an error boundary
 * @param Component The component to wrap
 * @param fallback Optional fallback UI or render function
 * @param onError Optional error handler
 */
export function withErrorBoundary<P extends object>(
    Component: ComponentType<P>,
    fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode),
    onError?: (error: Error, errorInfo: ErrorInfo) => void
): ComponentType<P> {
    const displayName = Component.displayName || Component.name || 'Component';

    const WrappedComponent = (props: P) => {
        return (
            <ErrorBoundary fallback={fallback} onError={onError}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };

    WrappedComponent.displayName = `withErrorBoundary(${displayName})`;

    return WrappedComponent;
}

export default ErrorBoundary;