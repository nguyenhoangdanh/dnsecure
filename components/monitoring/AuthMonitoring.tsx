"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { refreshToken, initAuth } from '@/redux-saga/actions/authActions';
import { healthService } from '@/lib/api/health-service';
import { AuthNetworkIssueMessage } from './AuthNetworkIssueMessage';

/**
 * Comprehensive component that monitors authentication state and handles network
 * issues gracefully with proper error feedback
 */
export const AuthMonitoring: React.FC = () => {
    const dispatch = useAppDispatch();
    const auth = useAppSelector(state => state.auth);
    const [isApiReachable, setIsApiReachable] = useState<boolean>(true);
    const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(false);
    const [networkError, setNetworkError] = useState<string | null>(null);
    const [showNetworkMessage, setShowNetworkMessage] = useState<boolean>(false);
    const [recoveryAttempts, setRecoveryAttempts] = useState<number>(0);

    /**
     * Check API health with error handling
     */
    const checkApiHealth = useCallback(async () => {
        if (isCheckingHealth) return;

        try {
            setIsCheckingHealth(true);
            const isReachable = await healthService.checkApiHealth();

            // Only update state if there's a change
            if (isReachable !== isApiReachable) {
                setIsApiReachable(isReachable);

                // If API became reachable again, clear error
                if (isReachable && networkError) {
                    setNetworkError(null);
                    setShowNetworkMessage(false);
                }

                // If API became unreachable, show error message
                if (!isReachable && !networkError) {
                    setNetworkError('Unable to connect to authentication server');
                    setShowNetworkMessage(true);
                }
            }
        } catch (error) {
            console.error('Health check error:', error);
            setIsApiReachable(false);
            setNetworkError('Error checking API health: ' + (error instanceof Error ? error.message : 'Unknown error'));
            setShowNetworkMessage(true);
        } finally {
            setIsCheckingHealth(false);
        }
    }, [isApiReachable, isCheckingHealth, networkError]);

    /**
     * Attempt to recover auth state
     */
    const attemptRecovery = useCallback(() => {
        if (!isApiReachable) {
            checkApiHealth();
            return;
        }

        try {
            // Update recovery attempts counter
            setRecoveryAttempts(prev => prev + 1);

            if (auth.status === 'authenticated' && auth.accessToken) {
                // If authenticated, try to refresh token
                dispatch(refreshToken());
            } else {
                // Otherwise reinitialize auth
                dispatch(initAuth());
            }

            // Hide error message after recovery attempt
            setShowNetworkMessage(false);
        } catch (error) {
            console.error('Recovery attempt failed:', error);
            setNetworkError('Recovery failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
            setShowNetworkMessage(true);
        }
    }, [auth.status, auth.accessToken, dispatch, isApiReachable, checkApiHealth]);

    // Online/offline event handlers
    useEffect(() => {
        const handleOnline = () => {
            console.log('Browser reports back online');
            // Check health when we come back online
            checkApiHealth();
        };

        const handleOffline = () => {
            console.log('Browser reports offline');
            setIsApiReachable(false);
            setNetworkError('Your device is offline');
            setShowNetworkMessage(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial health check
        checkApiHealth();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [checkApiHealth]);

    // Periodic health checks
    useEffect(() => {
        // Check more frequently if we're having issues
        const interval = isApiReachable ? 60000 : 15000;

        const intervalId = setInterval(() => {
            checkApiHealth();
        }, interval);

        return () => clearInterval(intervalId);
    }, [isApiReachable, checkApiHealth]);

    // Auth error monitoring
    useEffect(() => {
        // Watch for auth errors
        if (auth.error && !networkError) {
            // Check if error is network-related
            if (
                auth.error.includes('Failed to fetch') ||
                auth.error.includes('network') ||
                auth.error.includes('connection') ||
                auth.error.includes('unreachable')
            ) {
                setNetworkError(auth.error);
                setShowNetworkMessage(true);
                // Check API health when we detect an error
                checkApiHealth();
            }
        }
    }, [auth.error, networkError, checkApiHealth]);

    // Render the network issue message
    return (
        <>
            <AuthNetworkIssueMessage
                isVisible={showNetworkMessage}
                onRetry={attemptRecovery}
                onDismiss={() => setShowNetworkMessage(false)}
                errorMessage={networkError || undefined}
            />
        </>
    );
};

export default AuthMonitoring;