"use client"

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks';

interface AuthNetworkIssueMessageProps {
    isVisible: boolean;
    onRetry: () => void;
    onDismiss: () => void;
    errorMessage?: string;
}

/**
 * Component to display a toast-like message for auth network issues
 */
export const AuthNetworkIssueMessage: React.FC<AuthNetworkIssueMessageProps> = ({
    isVisible,
    onRetry,
    onDismiss,
    errorMessage
}) => {
    const auth = useAppSelector(state => state.auth);
    const [showAnimation, setShowAnimation] = useState<boolean>(false);

    // Control animation states
    useEffect(() => {
        if (isVisible) {
            // Small delay to ensure enter animation works
            const timeoutId = setTimeout(() => {
                setShowAnimation(true);
            }, 50);

            return () => clearTimeout(timeoutId);
        } else {
            setShowAnimation(false);
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4 transition-all duration-300 ease-in-out ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
        >
            <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg shadow-lg border border-orange-200 dark:border-orange-800 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">Authentication Error</h3>
                            <button
                                onClick={onDismiss}
                                className="ml-3 flex-shrink-0 inline-flex text-orange-500 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
                            >
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                            {errorMessage || 'Network connectivity issue while authenticating. Please check your connection.'}
                        </p>
                        <div className="mt-2">
                            <div className="flex space-x-3">
                                <button
                                    onClick={onRetry}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-orange-700 dark:text-orange-100 bg-orange-100 dark:bg-orange-800 hover:bg-orange-200 dark:hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                >
                                    <svg className="-ml-0.5 mr-1.5 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Retry
                                </button>
                                {auth.status !== 'authenticated' && (
                                    <button
                                        onClick={() => window.location.href = '/login'}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-orange-700 dark:text-orange-100 bg-orange-100 dark:bg-orange-800 hover:bg-orange-200 dark:hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                    >
                                        <svg className="-ml-0.5 mr-1.5 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        Login
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthNetworkIssueMessage;