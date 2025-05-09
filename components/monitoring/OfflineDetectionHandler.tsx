"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { healthService } from '@/lib/api/health-service';

interface OfflineDetectionHandlerProps {
    children: React.ReactNode;
    pollingInterval?: number; // in milliseconds
    onStatusChange?: (isOnline: boolean) => void;
}

/**
 * Component for detecting network connectivity issues and providing appropriate UI
 * feedback to users
 */
export const OfflineDetectionHandler: React.FC<OfflineDetectionHandlerProps> = ({
    children,
    pollingInterval = 30000, // Default to checking every 30 seconds
    onStatusChange
}) => {
    const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [apiReachable, setApiReachable] = useState<boolean>(true);
    const [showingMessage, setShowingMessage] = useState<boolean>(false);
    const [lastOfflineTimestamp, setLastOfflineTimestamp] = useState<number | null>(null);
    const [retryCount, setRetryCount] = useState<number>(0);

    /**
     * Check API connectivity and update state
     */
    const checkConnection = useCallback(async () => {
        try {
            // First check navigator.onLine for the browser's connectivity status
            const browserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

            if (!browserOnline) {
                setIsOnline(false);
                setApiReachable(false);
                setShowingMessage(true);
                if (lastOfflineTimestamp === null) {
                    setLastOfflineTimestamp(Date.now());
                }
                if (onStatusChange) onStatusChange(false);
                return;
            }

            // If browser says we're online, check API health
            const apiHealth = await healthService.checkApiHealth();

            setApiReachable(apiHealth);
            const actualOnline = browserOnline && apiHealth;

            // Update last offline timestamp
            if (!actualOnline && lastOfflineTimestamp === null) {
                setLastOfflineTimestamp(Date.now());
            } else if (actualOnline && lastOfflineTimestamp !== null) {
                setLastOfflineTimestamp(null);
                setRetryCount(0);
            }

            // Only update state if there's been a change to avoid re-renders
            if (isOnline !== actualOnline) {
                setIsOnline(actualOnline);
                if (onStatusChange) onStatusChange(actualOnline);

                // Show message if offline, or hide after a delay if we're back online
                if (!actualOnline) {
                    setShowingMessage(true);
                } else {
                    // Hide message after a brief delay when coming back online
                    setTimeout(() => {
                        setShowingMessage(false);
                    }, 5000);
                }
            }
        } catch (error) {
            console.error('Error checking connection:', error);
            setApiReachable(false);

            if (isOnline) {
                setIsOnline(false);
                setShowingMessage(true);
                if (lastOfflineTimestamp === null) {
                    setLastOfflineTimestamp(Date.now());
                }
                if (onStatusChange) onStatusChange(false);
            }
        }
    }, [isOnline, lastOfflineTimestamp, onStatusChange]);

    /**
     * Manually retry connection
     */
    const handleRetryConnection = useCallback(() => {
        setRetryCount(prev => prev + 1);
        checkConnection();
    }, [checkConnection]);

    // Set up browser online/offline event listeners
    useEffect(() => {
        const handleOnline = () => {
            console.log('Browser reports online');
            checkConnection();
        };

        const handleOffline = () => {
            console.log('Browser reports offline');
            setIsOnline(false);
            setApiReachable(false);
            setShowingMessage(true);
            if (lastOfflineTimestamp === null) {
                setLastOfflineTimestamp(Date.now());
            }
            if (onStatusChange) onStatusChange(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check connection initially
        checkConnection();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [checkConnection, lastOfflineTimestamp, onStatusChange]);

    // Set up periodic connectivity checks
    useEffect(() => {
        // Use more frequent checks if we're currently offline
        const interval = !isOnline ? Math.min(pollingInterval, 15000) : pollingInterval;

        const id = setInterval(() => {
            checkConnection();
        }, interval);

        return () => clearInterval(id);
    }, [checkConnection, isOnline, pollingInterval]);

    // Calculate the offline duration
    const getOfflineDuration = useCallback(() => {
        if (lastOfflineTimestamp === null) return '';

        const durationMs = Date.now() - lastOfflineTimestamp;
        const seconds = Math.floor(durationMs / 1000);

        if (seconds < 60) {
            return `${seconds}s`;
        } else if (seconds < 3600) {
            return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        } else {
            return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
        }
    }, [lastOfflineTimestamp]);

    return (
        <>
            {/* Only show the offline message if we're showing it */}
            {showingMessage && !isOnline && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full">
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-100 rounded-lg shadow-lg border border-red-200 dark:border-red-800 p-4 mx-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium">
                                        {navigator.onLine
                                            ? 'API Server Unreachable'
                                            : 'You are offline'}
                                    </h3>
                                    <div className="mt-1 text-xs">
                                        <p>
                                            {navigator.onLine
                                                ? 'The application server cannot be reached. Your internet connection may be limited.'
                                                : 'Please check your internet connection.'}
                                        </p>
                                        {lastOfflineTimestamp && (
                                            <p className="mt-1">Offline for: {getOfflineDuration()}</p>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <button
                                            onClick={handleRetryConnection}
                                            className="text-xs bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-100 py-1 px-2 rounded"
                                        >
                                            Retry connection {retryCount > 0 ? `(${retryCount})` : ''}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowingMessage(false)}
                                className="flex-shrink-0 ml-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Always render children */}
            {children}
        </>
    );
};

export default OfflineDetectionHandler;