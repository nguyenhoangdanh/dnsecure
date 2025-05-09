"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { refreshToken, initAuth } from '@/redux-saga/actions/authActions';
import { healthService } from '@/lib/api/health-service';

interface NetworkRecoveryHandlerProps {
    children: React.ReactNode;
    onlineRetryInterval?: number; // Time in ms to wait before retrying when online
    offlineCheckInterval?: number; // Time in ms to check if we're back online
    maxRetries?: number; // Maximum number of times to retry when online
}

/**
 * A component that monitors network state and provides recovery functionality
 * for authentication operations when network conditions change.
 */
export const NetworkRecoveryHandler: React.FC<NetworkRecoveryHandlerProps> = ({
    children,
    onlineRetryInterval = 10000, // 10 seconds default
    offlineCheckInterval = 15000, // 15 seconds default
    maxRetries = 3
}) => {
    const dispatch = useAppDispatch();
    const auth = useAppSelector(state => state.auth);
    const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [recoveryAttempts, setRecoveryAttempts] = useState<number>(0);
    const [hasConnectivityIssue, setHasConnectivityIssue] = useState<boolean>(false);
    const [lastError, setLastError] = useState<string | null>(null);
    const [isRecovering, setIsRecovering] = useState<boolean>(false);

    /**
     * Check API connectivity and update state
     */
    const checkConnectivity = useCallback(async () => {
        try {
            const isApiReachable = await healthService.checkApiHealth();

            if (isApiReachable) {
                setIsOnline(true);

                // If we were previously having connectivity issues and now we're online again
                if (hasConnectivityIssue) {
                    console.log('Network recovered, attempting to refresh authentication state');
                    attemptRecovery();
                }

                setHasConnectivityIssue(false);
            } else {
                setIsOnline(false);
                setHasConnectivityIssue(true);
            }
        } catch (error) {
            console.error('Error checking connectivity:', error);
            setIsOnline(false);
            setHasConnectivityIssue(true);
        }
    }, [hasConnectivityIssue]);

    /**
     * Attempt to recover authentication state after network issues
     */
    const attemptRecovery = useCallback(async () => {
        if (recoveryAttempts >= maxRetries || isRecovering) {
            return;
        }

        // Kiểm tra thời gian kể từ lần cuối cùng thử
        const now = Date.now();
        const recoveryAttemptTime = localStorage.getItem('lastRecoveryAttemptTime');
        const lastRecoveryTime = recoveryAttemptTime ? parseInt(recoveryAttemptTime) : 0;
        const MIN_RECOVERY_INTERVAL = 5 * 60 * 1000; // 5 phút

        if (now - lastRecoveryTime < MIN_RECOVERY_INTERVAL) {
            console.log(`Recovery throttled - last attempt was ${Math.floor((now - lastRecoveryTime) / 1000)}s ago`);
            return;
        }

        try {
            setIsRecovering(true);
            // Lưu thời gian thử
            localStorage.setItem('lastRecoveryAttemptTime', now.toString());

            // Đầu tiên, xác minh chúng ta có thể kết nối đến API
            const isApiReachable = await healthService.checkApiHealth();

            if (!isApiReachable) {
                setLastError('API server is unreachable');
                setIsRecovering(false);
                return;
            }

            console.log(`Recovery attempt ${recoveryAttempts + 1}/${maxRetries}`);

            // Thêm độ trễ ngẫu nhiên để tránh tất cả các client phục hồi cùng một lúc
            const jitter = Math.random() * 10000;
            await new Promise(resolve => setTimeout(resolve, jitter));

            // Depending on auth state, take different recovery actions
            if (auth.status === 'refresh_needed' ||
                auth.status === 'loading' ||
                (auth.accessToken && auth.status === 'authenticated')) {
                // If we have a token or need a refresh, try to refresh
                dispatch(refreshToken());
            } else {
                // Otherwise reinitialize auth completely
                dispatch(initAuth());
            }

            // Increment attempts counter
            setRecoveryAttempts(prev => prev + 1);
        } catch (error) {
            console.error('Recovery attempt failed:', error);
            setLastError(error instanceof Error ? error.message : 'Unknown error during recovery');
        } finally {
            // Thêm độ trễ trước khi đặt lại cờ recovering để tránh lệnh gọi quá nhiều
            setTimeout(() => {
                setIsRecovering(false);
            }, 5000);
        }
    }, [auth.status, auth.accessToken, dispatch, recoveryAttempts, maxRetries, isRecovering]);

    // Listen for online/offline events
    useEffect(() => {
        const handleOnline = () => {
            console.log('Browser reports online status');
            setIsOnline(true);
            checkConnectivity();
        };

        const handleOffline = () => {
            console.log('Browser reports offline status');
            setIsOnline(false);
            setHasConnectivityIssue(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial connectivity check
        checkConnectivity();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [checkConnectivity]);

    // Reset recovery attempts after successful auth
    useEffect(() => {
        if (auth.status === 'authenticated' && auth.user && auth.accessToken) {
            setRecoveryAttempts(0);
            setHasConnectivityIssue(false);
            setLastError(null);
        }
    }, [auth.status, auth.user, auth.accessToken]);

    // Periodically check connectivity when offline
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        if (hasConnectivityIssue) {
            // Tăng khoảng thời gian kiểm tra khi offline
            const checkInterval = 60000; // 60 giây thay vì 15 giây

            intervalId = setInterval(() => {
                console.log('Checking connectivity during offline status...');
                checkConnectivity();
            }, checkInterval);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [hasConnectivityIssue, checkConnectivity]);

    // Retry authentication when online but having auth issues
    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;

        if (isOnline && hasConnectivityIssue && !isRecovering && recoveryAttempts < maxRetries) {
            // Tăng thời gian chờ trước khi thử lại
            const retryInterval = 30000 + (recoveryAttempts * 30000); // Tăng thời gian theo số lần thử

            timeoutId = setTimeout(() => {
                console.log('Attempting auth recovery after delay...');
                attemptRecovery();
            }, retryInterval);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [
        isOnline,
        hasConnectivityIssue,
        recoveryAttempts,
        maxRetries,
        attemptRecovery,
        isRecovering
    ]);

    // If there are network issues, show a message but don't block the UI
    if (hasConnectivityIssue) {
        return (
            <>
                {/* Floating network status indicator */}
                <div className="fixed bottom-4 right-4 z-50 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 px-4 py-2 rounded-lg shadow-lg border border-orange-200 dark:border-orange-800 max-w-md">
                    <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h3 className="font-medium text-sm">Network connectivity issues</h3>
                            <p className="text-xs mt-1">{isOnline ? 'The server is unreachable. Reconnecting...' : 'You appear to be offline. Reconnecting when your network is available...'}</p>
                            {lastError && <p className="text-xs mt-1 text-orange-700 dark:text-orange-300">{lastError}</p>}
                        </div>
                    </div>
                </div>

                {/* Continue showing the app UI */}
                {children}
            </>
        );
    }

    // Normal render when everything is fine
    return <>{children}</>;
};

export default NetworkRecoveryHandler;