// src/hooks/useNetworkStatus.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { healthCoordinator } from '@/lib/utils/HealthCoordinator';
import { NetworkErrorType } from '@/lib/utils/network-error-handler';

interface NetworkStatusOptions {
  notifyOnReconnect?: boolean;
  checkOnMount?: boolean;
  checkInterval?: number | null;
  retryStrategy?: 'exponential' | 'linear' | 'none';
  maxRetries?: number;
}

export interface NetworkStatus {
  isOnline: boolean;
  isApiReachable: boolean;
  lastCheckTime: number;
  isChecking: boolean;
  networkErrorType: NetworkErrorType | null;
  consecutiveFailures: number;
  checkNow: () => Promise<boolean>;
  resetStatus: () => void;
}

/**
 * Enhanced hook to monitor network and API connectivity status with improved error handling
 * @param options Configuration options
 * @returns NetworkStatus object with current status and utilities
 */
export function useNetworkStatus(options: NetworkStatusOptions = {}): NetworkStatus {
  const {
    notifyOnReconnect = false,
    checkOnMount = true,
    checkInterval = null,
    retryStrategy = 'exponential',
    maxRetries = 3
  } = options;

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isApiReachable, setIsApiReachable] = useState<boolean>(healthCoordinator.isOnline);
  const [lastCheckTime, setLastCheckTime] = useState<number>(healthCoordinator.lastCheckTime);
  const [isChecking, setIsChecking] = useState<boolean>(healthCoordinator.isChecking);
  const [networkErrorType, setNetworkErrorType] = useState<NetworkErrorType | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState<number>(0);
  
  // Track the interval ID so we can clean it up
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Track if the component is mounted to prevent updates after unmount
  const isMountedRef = useRef<boolean>(true);
  // Track retry attempts
  const retryAttemptsRef = useRef<number>(0);

  // Reset network status
  const resetStatus = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setConsecutiveFailures(0);
    setNetworkErrorType(null);
    retryAttemptsRef.current = 0;
    
    // Force a health check after reset
    healthCoordinator.forceCheck().then(result => {
      if (isMountedRef.current) {
        setIsApiReachable(result);
        setLastCheckTime(healthCoordinator.lastCheckTime);
      }
    });
  }, []);

  // Function to check health manually with improved error handling
  const checkNow = useCallback(async (): Promise<boolean> => {
    if (!isMountedRef.current) return false;
    
    setIsChecking(true);
    try {
      // Check browser online status first
      if (!navigator.onLine) {
        if (isMountedRef.current) {
          setIsOnline(false);
          setIsApiReachable(false);
          setNetworkErrorType(NetworkErrorType.OFFLINE);
          setConsecutiveFailures(prev => prev + 1);
        }
        return false;
      }
      
      setIsOnline(true);
      
      // Check if API is reachable
      const result = await healthCoordinator.forceCheck();
      
      if (isMountedRef.current) {
        setIsApiReachable(result);
        setLastCheckTime(healthCoordinator.lastCheckTime);
        
        if (result) {
          // Reset error state on successful connection
          setNetworkErrorType(null);
          setConsecutiveFailures(0);
          retryAttemptsRef.current = 0;
        } else {
          // Determine error type based on health coordinator data
          setNetworkErrorType(NetworkErrorType.SERVER_ERROR);
          setConsecutiveFailures(prev => prev + 1);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Health check error:', error);
      
      if (isMountedRef.current) {
        // Determine error type based on error
        let errorType = NetworkErrorType.UNKNOWN;
        
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          errorType = NetworkErrorType.OFFLINE;
        } else if (error instanceof DOMException && error.name === 'AbortError') {
          errorType = NetworkErrorType.TIMEOUT;
        }
        
        setNetworkErrorType(errorType);
        setIsApiReachable(false);
        setConsecutiveFailures(prev => prev + 1);
      }
      
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsChecking(false);
      }
    }
  }, []);

  // Set up browser online/offline event handling
  useEffect(() => {
    const handleOnline = () => {
      if (!isMountedRef.current) return;
      
      setIsOnline(true);
      if (notifyOnReconnect) {
        // Small delay to let network stabilize
        setTimeout(() => {
          if (isMountedRef.current) {
            checkNow();
          }
        }, 1000);
      }
    };
    
    const handleOffline = () => {
      if (!isMountedRef.current) return;
      
      setIsOnline(false);
      setIsApiReachable(false);
      setNetworkErrorType(NetworkErrorType.OFFLINE);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial status from browser
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      isMountedRef.current = false;
    };
  }, [notifyOnReconnect, checkNow]);

  // Subscribe to health coordinator updates
  useEffect(() => {
    const unsubscribe = healthCoordinator.subscribe((isOnline, error) => {
      if (!isMountedRef.current) return;
      
      setIsApiReachable(isOnline);
      setLastCheckTime(healthCoordinator.lastCheckTime);
      setIsChecking(healthCoordinator.isChecking);
      
      // Update error type if provided
      if (error) {
        setNetworkErrorType(error);
      } else if (isOnline) {
        setNetworkErrorType(null);
      }
    });
    
    return () => {
      unsubscribe();
      isMountedRef.current = false;
    };
  }, []);

  // Start periodic checks if requested with retry logic
  useEffect(() => {
    // Clean up any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (checkInterval !== null && checkInterval > 0) {
      // Calculate appropriate interval based on failures and retry strategy
      let actualInterval = checkInterval;
      
      if (consecutiveFailures > 0 && retryStrategy !== 'none') {
        if (retryStrategy === 'exponential') {
          // Back off exponentially, but cap at 5 minutes
          actualInterval = Math.min(checkInterval * Math.pow(2, consecutiveFailures), 300000);
        } else if (retryStrategy === 'linear') {
          // Linear backoff, add 10 seconds per failure, cap at 2 minutes
          actualInterval = Math.min(checkInterval + (consecutiveFailures * 10000), 120000);
        }
      }
      
      // Start a new interval with appropriate timing
      intervalRef.current = setInterval(() => {
        if (isMountedRef.current && navigator.onLine) {
          // Check if we should retry based on maxRetries
          if (consecutiveFailures <= maxRetries) {
            checkNow();
          } else if (retryAttemptsRef.current % 5 === 0) {
            // Still try occasionally even after max retries (every 5th attempt)
            checkNow();
          }
          retryAttemptsRef.current++;
        }
      }, actualInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      isMountedRef.current = false;
    };
  }, [checkInterval, consecutiveFailures, maxRetries, retryStrategy, checkNow]);

  // Perform check on mount if requested
  useEffect(() => {
    if (checkOnMount) {
      checkNow();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [checkOnMount, checkNow]);

  return {
    isOnline,
    isApiReachable,
    lastCheckTime,
    isChecking,
    networkErrorType,
    consecutiveFailures,
    checkNow,
    resetStatus
  };
}

export default useNetworkStatus;


// // src/hooks/useNetworkStatus.ts
// import { useState, useEffect, useCallback, useRef } from 'react';
// import { healthCoordinator } from '@/lib/utils/HealthCoordinator';

// interface NetworkStatusOptions {
//   notifyOnReconnect?: boolean;
//   checkOnMount?: boolean;
//   checkInterval?: number | null;
// }

// interface NetworkStatus {
//   isOnline: boolean;
//   isApiReachable: boolean;
//   lastCheckTime: number;
//   isChecking: boolean;
//   checkNow: () => Promise<boolean>;
// }

// /**
//  * Hook to monitor network and API connectivity status with improved handling
//  * @param options Configuration options
//  * @returns NetworkStatus object with current status and utilities
//  */
// export function useNetworkStatus(options: NetworkStatusOptions = {}): NetworkStatus {
//   const {
//     notifyOnReconnect = false,
//     checkOnMount = true,
//     checkInterval = null
//   } = options;

//   const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
//   const [isApiReachable, setIsApiReachable] = useState<boolean>(healthCoordinator.isOnline);
//   const [lastCheckTime, setLastCheckTime] = useState<number>(healthCoordinator.lastCheckTime);
//   const [isChecking, setIsChecking] = useState<boolean>(healthCoordinator.isChecking);
  
//   // Track the interval ID so we can clean it up
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   // Track if the component is mounted to prevent updates after unmount
//   const isMountedRef = useRef<boolean>(true);

//   // Function to check health manually with safety checks
//   const checkNow = useCallback(async () => {
//     if (!isMountedRef.current) return false;
    
//     setIsChecking(true);
//     try {
//       const result = await healthCoordinator.forceCheck();
//       if (isMountedRef.current) {
//         setIsApiReachable(result);
//         setLastCheckTime(healthCoordinator.lastCheckTime);
//       }
//       return result;
//     } finally {
//       if (isMountedRef.current) {
//         setIsChecking(false);
//       }
//     }
//   }, []);

//   // Set up browser online/offline event handling
//   useEffect(() => {
//     const handleOnline = () => {
//       if (!isMountedRef.current) return;
      
//       setIsOnline(true);
//       if (notifyOnReconnect) {
//         // Small delay to let network stabilize
//         setTimeout(() => {
//           if (isMountedRef.current) {
//             checkNow();
//           }
//         }, 1000);
//       }
//     };
    
//     const handleOffline = () => {
//       if (!isMountedRef.current) return;
      
//       setIsOnline(false);
//       setIsApiReachable(false);
//     };
    
//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);
    
//     // Initial status from browser
//     setIsOnline(navigator.onLine);
    
//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//       isMountedRef.current = false;
//     };
//   }, [notifyOnReconnect, checkNow]);

//   // Subscribe to health coordinator updates
//   useEffect(() => {
//     const unsubscribe = healthCoordinator.subscribe((isOnline) => {
//       if (!isMountedRef.current) return;
      
//       setIsApiReachable(isOnline);
//       setLastCheckTime(healthCoordinator.lastCheckTime);
//       setIsChecking(healthCoordinator.isChecking);
//     });
    
//     return () => {
//       unsubscribe();
//       isMountedRef.current = false;
//     };
//   }, []);

//   // Start periodic checks if requested
//   useEffect(() => {
//     // Clean up any existing interval
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
    
//     if (checkInterval !== null && checkInterval > 0) {
//       // Start a new interval
//       intervalRef.current = setInterval(() => {
//         if (isMountedRef.current && navigator.onLine) {
//           healthCoordinator.checkHealth();
//         }
//       }, checkInterval);
//     }
    
//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//       isMountedRef.current = false;
//     };
//   }, [checkInterval]);

//   // Perform check on mount if requested
//   useEffect(() => {
//     if (checkOnMount) {
//       checkNow();
//     }
    
//     return () => {
//       isMountedRef.current = false;
//     };
//   }, [checkOnMount, checkNow]);

//   return {
//     isOnline,
//     isApiReachable,
//     lastCheckTime,
//     isChecking,
//     checkNow
//   };
// }

// export default useNetworkStatus;