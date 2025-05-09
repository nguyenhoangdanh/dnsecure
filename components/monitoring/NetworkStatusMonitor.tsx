"use client"

import { useEffect, useState } from 'react';
import { healthService } from '@/lib/api/health-service';
import { WifiOff } from 'lucide-react';

/**
 * Props for the NetworkStatusMonitor component
 */
interface NetworkStatusMonitorProps {
    /** Whether to show the monitor when online (default: false) */
    showWhenOnline?: boolean;
    /** How often to check the API server (in ms, default: 30000) */
    pollingInterval?: number;
    /** Callback function when network status changes */
    onStatusChange?: (isOnline: boolean) => void;
}

/**
 * Component to monitor network connectivity and API server availability
 */
export function NetworkStatusMonitor({
    showWhenOnline = false,
    pollingInterval = 30000,
    onStatusChange
}: NetworkStatusMonitorProps) {
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [isApiAvailable, setIsApiAvailable] = useState<boolean>(true);
    const [isChecking, setIsChecking] = useState<boolean>(false);

    // Function to check API availability
    const checkApiAvailability = async () => {
        setIsChecking(true);
        const isAvailable = await healthService.checkApiHealth();
        setIsApiAvailable(isAvailable);

        // Notify parent component of status change if callback provided
        if (onStatusChange && isAvailable !== isApiAvailable) {
            onStatusChange(isAvailable);
        }

        setIsChecking(false);
    };

    // Handle online/offline events
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Check API availability when we come back online
            checkApiAvailability();
        };

        const handleOffline = () => {
            setIsOnline(false);
            setIsApiAvailable(false);

            // Notify parent component if callback provided
            if (onStatusChange) {
                onStatusChange(false);
            }
        };

        // Set up event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        checkApiAvailability();

        // Set up polling interval for API availability
        const intervalId = setInterval(() => {
            if (isOnline) {
                checkApiAvailability();
            }
        }, pollingInterval);

        // Clean up
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(intervalId);
        };
    }, [isOnline, isApiAvailable, onStatusChange, pollingInterval]);

    // Don't render anything if everything is working and showWhenOnline is false
    if (isOnline && isApiAvailable && !showWhenOnline) {
        return null;
    }

    // If we're offline or API is unavailable, show status message
    return (
        <div className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${isOnline && isApiAvailable
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
            {!isOnline ? (
                <>
                    <WifiOff className="h-5 w-5 text-red-500 dark:text-red-400" />
                    <span className="text-sm text-red-600 dark:text-red-400">You are offline</span>
                </>
            ) : !isApiAvailable ? (
                <>
                    <WifiOff className="h-5 w-5 text-red-500 dark:text-red-400" />
                    <span className="text-sm text-red-600 dark:text-red-400">Server unavailable</span>
                </>
            ) : (
                <>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
                </>
            )}

            {(isChecking || (!isOnline || !isApiAvailable)) && (
                <button
                    className={`ml-2 text-xs px-2 py-1 rounded ${isOnline && isApiAvailable
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}
                    onClick={checkApiAvailability}
                    disabled={isChecking}
                >
                    {isChecking ? 'Checking...' : 'Check connection'}
                </button>
            )}
        </div>
    );
}