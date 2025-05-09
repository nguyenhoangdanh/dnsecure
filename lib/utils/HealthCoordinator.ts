// src/lib/utils/HealthCoordinator.ts
import { healthService } from '../api/health-service';
import { NetworkErrorType } from './network-error-handler';

// Define the listener type with optional error parameter
type HealthListener = (isOnline: boolean, errorType?: NetworkErrorType | undefined) => void;

/**
 * A singleton to coordinate health checks across components
 * to prevent duplicate requests and 429 errors
 */
class HealthCoordinator {
  private _isChecking: boolean = false;
  private _lastCheckTime: number = 0;
  private _lastCheckResult: boolean = true;
  private _minimumInterval: number = 10000; // 10 seconds - increased to reduce frequency
  private _listeners: Array<HealthListener> = [];
  private _checkIntervalId: NodeJS.Timeout | null = null;
  private _checkCount: number = 0;
  private _consecutiveFailures: number = 0;
  private _maxConsecutiveFailures: number = 3;
  private _throttleTimeouts: Map<string, number> = new Map();
  private _lastErrorType: NetworkErrorType | undefined = undefined; // Changed from null to undefined
  private _rateLimitedUntil: number = 0;

  /**
   * Get the current health status synchronously
   */
  get isOnline(): boolean {
    return this._lastCheckResult;
  }

  /**
   * Get the timestamp of the last check
   */
  get lastCheckTime(): number {
    return this._lastCheckTime;
  }

  /**
   * Check if a health check is currently in progress
   */
  get isChecking(): boolean {
    return this._isChecking;
  }

  /**
   * Get the last error type
   */
  get lastErrorType(): NetworkErrorType | undefined {
    return this._lastErrorType;
  }

  /**
   * Get consecutive failures count
   */
  get consecutiveFailures(): number {
    return this._consecutiveFailures;
  }

  /**
   * Check if currently rate limited
   */
  get isRateLimited(): boolean {
    return Date.now() < this._rateLimitedUntil;
  }

  /**
   * Perform a health check with throttling and error typing
   * @returns Promise<boolean> indicating if the API is reachable
   */
  async checkHealth(): Promise<boolean> {
    // Don't run multiple checks at once
    if (this._isChecking) {
      return this._lastCheckResult;
    }

    // Don't check too frequently
    const now = Date.now();
    if (now - this._lastCheckTime < this._minimumInterval) {
      return this._lastCheckResult;
    }

    // Don't check if rate limited
    if (this.isRateLimited) {
      console.log(`Health checks rate limited for another ${Math.floor((this._rateLimitedUntil - now)/1000)}s`);
      return this._lastCheckResult;
    }

    // Check throttling for specific check types
    if (this._throttleTimeouts.has('regular') && now < this._throttleTimeouts.get('regular')!) {
      console.log('Regular health check throttled');
      return this._lastCheckResult;
    }

    try {
      this._isChecking = true;
      this._checkCount++;
      
      // First check browser connectivity
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        this._lastErrorType = NetworkErrorType.OFFLINE;
        this._lastCheckResult = false;
        this._consecutiveFailures++;
        this.notifyListeners(false, NetworkErrorType.OFFLINE);
        this._lastCheckTime = Date.now();
        return false;
      }
      
      // Check if API is reachable
      const isReachable = await healthService.checkApiHealth();
      
      // Track consecutive failures
      if (!isReachable) {
        this._consecutiveFailures++;
        
        // Determine error type - in a real app, this would be more sophisticated
        // based on the actual error from the health service
        if (!this._lastErrorType || this._lastErrorType === NetworkErrorType.OFFLINE) {
          this._lastErrorType = NetworkErrorType.SERVER_ERROR;
        }
      } else {
        this._consecutiveFailures = 0;
        this._lastErrorType = undefined; // Changed from null to undefined
      }
      
      // Only update if status changed or we've hit the failure threshold
      const shouldUpdate = 
        isReachable !== this._lastCheckResult || 
        this._consecutiveFailures >= this._maxConsecutiveFailures;
      
      if (shouldUpdate) {
        this._lastCheckResult = isReachable;
        this.notifyListeners(isReachable, this._lastErrorType);
      }

      this._lastCheckTime = Date.now();
      return isReachable;
    } catch (error) {
      console.error('Health coordinator check failed:', error);
      
      // Determine error type based on error
      let errorType: NetworkErrorType = NetworkErrorType.UNKNOWN;
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorType = NetworkErrorType.OFFLINE;
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        errorType = NetworkErrorType.TIMEOUT;
      } else if (error instanceof Error && error.message.includes('429')) {
        errorType = NetworkErrorType.SERVER_ERROR;
        
        // Set rate limiting if 429 detected
        this._rateLimitedUntil = Date.now() + (60 * 1000); // 1 minute
      }
      
      this._lastErrorType = errorType;
      this._consecutiveFailures++;
      
      // Don't change status on error if already offline, just notify with error type
      const newStatus = false;
      if (this._lastCheckResult !== newStatus) {
        this._lastCheckResult = newStatus;
        this.notifyListeners(newStatus, errorType);
      } else {
        // Even if status didn't change, still notify about new error type
        this.notifyListeners(newStatus, errorType);
      }
      
      this._lastCheckTime = Date.now();
      return this._lastCheckResult;
    } finally {
      this._isChecking = false;
    }
  }

  /**
   * Throttle a specific check type for a period of time
   */
  throttleChecks(type: string, duration: number): void {
    const expiry = Date.now() + duration;
    this._throttleTimeouts.set(type, expiry);
    
    // Clean up after expiry
    setTimeout(() => {
      if (this._throttleTimeouts.get(type) === expiry) {
        this._throttleTimeouts.delete(type);
      }
    }, duration);
  }

  /**
   * Start periodic health checks with improved throttling
   * @param interval Time between checks in milliseconds
   */
  startPeriodicChecks(interval: number = 60000): void {
    // Don't start if already running
    if (this._checkIntervalId) {
      return;
    }

    // Initial check with delay to prevent startup contention
    setTimeout(() => {
      this.checkHealth();
    }, 10000 + Math.random() * 5000); // Random delay between 10-15s

    // Set up interval for periodic checks with adaptive frequency
    this._checkIntervalId = setInterval(() => {
      // Only check if browser is online
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        // Use a dynamic check interval based on consecutive failures
        // More failures = less frequent checks (to avoid overwhelming server)
        const dynamicInterval = Math.min(
          interval * Math.pow(1.5, this._consecutiveFailures), 
          300000
        ); // Cap at 5 minutes
        
        // If we're due for a check based on dynamic interval
        if (Date.now() - this._lastCheckTime >= dynamicInterval) {
          // Apply throttle for regular checks
          this.throttleChecks('regular', Math.min(interval / 2, 30000));
          this.checkHealth();
        }
      }
    }, Math.min(interval, 30000)); // Check at least every 30 seconds
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicChecks(): void {
    if (this._checkIntervalId) {
      clearInterval(this._checkIntervalId);
      this._checkIntervalId = null;
    }
  }

  /**
   * Subscribe to health status changes
   * @param listener Callback function to be called when health status changes
   * @returns Unsubscribe function
   */
  subscribe(listener: HealthListener): () => void {
    this._listeners.push(listener);
    
    // Immediately call with current status
    listener(this._lastCheckResult, this._lastErrorType);
    
    // Return unsubscribe function
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of a health status change
   * @param isOnline Current online status
   * @param errorType Optional error type for more context
   */
  notifyListeners(isOnline: boolean, errorType?: NetworkErrorType): void {
    this._listeners.forEach(listener => {
      try {
        listener(isOnline, errorType);
      } catch (error) {
        console.error('Error in health listener:', error);
      }
    });
  }

  /**
   * Force an immediate health check regardless of timing
   */
  async forceCheck(): Promise<boolean> {
    // Skip if rate limited
    if (this.isRateLimited) {
      console.log('Force check skipped due to rate limiting');
      return this._lastCheckResult;
    }
    
    const now = Date.now();
    
    // Check throttling even for forced checks
    if (this._throttleTimeouts.has('force') && now < this._throttleTimeouts.get('force')!) {
      console.log('Force check throttled');
      return Promise.resolve(this._lastCheckResult);
    }
    
    // Set a shorter throttle for forced checks
    this.throttleChecks('force', 10000); // 10s between forced checks
    
    // Reset the last check time to force a check
    this._lastCheckTime = 0;
    return this.checkHealth();
  }

  /**
   * Set the minimum interval between checks
   * @param interval Time in milliseconds
   */
  setMinimumInterval(interval: number): void {
    this._minimumInterval = interval;
  }
  
  /**
   * Reset the coordinator state
   */
  reset(): void {
    this._lastCheckTime = 0;
    this._lastCheckResult = true;
    this._consecutiveFailures = 0;
    this._lastErrorType = undefined; // Changed from null to undefined
    this._rateLimitedUntil = 0;
    this._throttleTimeouts.clear();
    this.stopPeriodicChecks();
  }
  
  /**
   * Set rate limiting for health checks
   * @param durationMs Duration in milliseconds
   */
  setRateLimited(durationMs: number = 60000): void {
    this._rateLimitedUntil = Date.now() + durationMs;
    console.log(`Health checks rate limited for ${durationMs/1000}s`);
  }
}

// Create a singleton instance
export const healthCoordinator = new HealthCoordinator();

// Only set up browser event handlers once
let isSetup = false;

if (typeof window !== 'undefined' && !isSetup) {
  window.addEventListener('online', () => {
    console.log('Browser reports online, checking API health');
    // Add delay to let connection stabilize
    setTimeout(() => {
      healthCoordinator.forceCheck();
    }, 2000);
  });
  
  window.addEventListener('offline', () => {
    console.log('Browser reports offline');
    healthCoordinator.notifyListeners(false, NetworkErrorType.OFFLINE);
  });
  
  isSetup = true;
}

// Export the singleton
export default healthCoordinator;


// // src/lib/utils/HealthCoordinator.ts
// import { healthService } from '../api/health-service';
// import { NetworkErrorType } from './network-error-handler';

// /**
//  * A singleton to coordinate health checks across components
//  * to prevent duplicate requests and 429 errors
//  */
// class HealthCoordinator {
//   private _isChecking: boolean = false;
//   private _lastCheckTime: number = 0;
//   private _lastCheckResult: boolean = true;
//   private _minimumInterval: number = 10000; // 10 seconds - increased to reduce frequency
//   private _listeners: Array<(isOnline: boolean) => void> = [];
//   private _checkIntervalId: NodeJS.Timeout | null = null;
//   private _checkCount: number = 0;
//   private _consecutiveFailures: number = 0;
//   private _maxConsecutiveFailures: number = 3;
//   // Thêm khai báo _throttleTimeouts tại đây - đây là phần bị thiếu
//   private _throttleTimeouts: Map<string, number> = new Map();
//   private _lastErrorType: NetworkErrorType | null = null;
//   private _rateLimitedUntil: number = 0;

//   /**
//    * Get the current health status synchronously
//    */
//   get isOnline(): boolean {
//     return this._lastCheckResult;
//   }

//   /**
//    * Get the timestamp of the last check
//    */
//   get lastCheckTime(): number {
//     return this._lastCheckTime;
//   }

//   /**
//    * Check if a health check is currently in progress
//    */
//   get isChecking(): boolean {
//     return this._isChecking;
//   } 
  
//     /**
//    * Get the last error type
//    */
//     get lastErrorType(): NetworkErrorType | null {
//       return this._lastErrorType;
//     }
  
//     /**
//      * Get consecutive failures count
//      */
//     get consecutiveFailures(): number {
//       return this._consecutiveFailures;
//     }
  
//     /**
//      * Check if currently rate limited
//      */
//     get isRateLimited(): boolean {
//       return Date.now() < this._rateLimitedUntil;
//     }

//   /**
//    * Perform a health check with throttling
//    * @returns Promise<boolean> indicating if the API is reachable
//    */
//   async checkHealth(): Promise<boolean> {
//     // Don't run multiple checks at once
//     if (this._isChecking) {
//       return this._lastCheckResult;
//     }

//     // Don't check too frequently
//     const now = Date.now();
//     if (now - this._lastCheckTime < this._minimumInterval) {
//       console.log(`Health check throttled - last check was ${Math.floor((now - this._lastCheckTime)/1000)}s ago`);
//       return this._lastCheckResult;
//     }

//     // Check for global throttling
//     if (this._throttleTimeouts.has('global') && now < this._throttleTimeouts.get('global')!) {
//       console.log('Health checks globally throttled due to previous 429 error');
//       return this._lastCheckResult;
//     }

//     try {
//       this._isChecking = true;
//       this._checkCount++;
      
//       // Check if API is reachable
//       const isReachable = await healthService.checkApiHealth();
      
//       // Track consecutive failures
//       if (!isReachable) {
//         this._consecutiveFailures++;
//       } else {
//         this._consecutiveFailures = 0;
//       }
      
//       // Only update if status changed or we've hit the failure threshold
//       const shouldUpdate = 
//         isReachable !== this._lastCheckResult || 
//         this._consecutiveFailures >= this._maxConsecutiveFailures;
      
//       if (shouldUpdate) {
//         this._lastCheckResult = isReachable;
//         this.notifyListeners(isReachable);
//       }

//       this._lastCheckTime = Date.now();
//       return isReachable;
//     } catch (error) {
//       console.error('Health coordinator check failed:', error);
      
//       // Check if this is a 429 error and implement throttling
//       if (error instanceof Error && error.message.includes('429')) {
//         this.throttleChecks('global', 120000); // 2 minute global throttle on 429
//       }
      
//       // Don't change status on error, just return current state
//       return this._lastCheckResult;
//     } finally {
//       this._isChecking = false;
//     }
//   }

//   /**
//    * Throttle a specific check type for a period of time
//    */
//   throttleChecks(type: string, duration: number): void {
//     const expiry = Date.now() + duration;
//     this._throttleTimeouts.set(type, expiry);
    
//     // Clean up after expiry
//     setTimeout(() => {
//       if (this._throttleTimeouts.get(type) === expiry) {
//         this._throttleTimeouts.delete(type);
//       }
//     }, duration);
//   }

//   /**
//    * Start periodic health checks with improved throttling
//    */
//   startPeriodicChecks(interval: number = 60000): void {
//     // Don't start if already running
//     if (this._checkIntervalId) {
//       return;
//     }

//     // Initial check with delay to prevent startup contention
//     setTimeout(() => {
//       this.checkHealth();
//     }, 10000 + Math.random() * 5000); // Random delay between 10-15s

//     // Set up interval for periodic checks
//     this._checkIntervalId = setInterval(() => {
//       // Only check if browser is online and enough time has passed
//       if (typeof navigator !== 'undefined' && navigator.onLine && 
//           Date.now() - this._lastCheckTime >= this._minimumInterval) {
//         this.checkHealth();
//       }
//     }, interval);
//   }

//   /**
//    * Stop periodic health checks
//    */
//   stopPeriodicChecks(): void {
//     if (this._checkIntervalId) {
//       clearInterval(this._checkIntervalId);
//       this._checkIntervalId = null;
//     }
//   }

//   /**
//    * Subscribe to health status changes
//    * @param listener Callback function to be called when health status changes
//    * @returns Unsubscribe function
//    */
//   subscribe(listener: (isOnline: boolean) => void): () => void {
//     this._listeners.push(listener);
    
//     // Immediately call with current status
//     listener(this._lastCheckResult);
    
//     // Return unsubscribe function
//     return () => {
//       this._listeners = this._listeners.filter(l => l !== listener);
//     };
//   }

//   /**
//    * Notify all listeners of a health status change
//    * @param isOnline Current online status
//    */
//   notifyListeners(isOnline: boolean): void {
//     this._listeners.forEach(listener => {
//       try {
//         listener(isOnline);
//       } catch (error) {
//         console.error('Error in health listener:', error);
//       }
//     });
//   }

//   /**
//    * Force an immediate health check with throttling
//    */
//   forceCheck(): Promise<boolean> {
//     const now = Date.now();
    
//     // Check throttling even for forced checks
//     if (this._throttleTimeouts.has('force') && now < this._throttleTimeouts.get('force')!) {
//       console.log('Force check throttled');
//       return Promise.resolve(this._lastCheckResult);
//     }
    
//     // Set a shorter throttle for forced checks
//     this.throttleChecks('force', 10000); // 10s between forced checks
    
//     // Reset the last check time to force a check
//     this._lastCheckTime = 0;
//     return this.checkHealth();
//   }

//   /**
//    * Set the minimum interval between checks
//    * @param interval Time in milliseconds
//    */
//   setMinimumInterval(interval: number): void {
//     this._minimumInterval = interval;
//   }
  
//   /**
//    * Reset the coordinator state
//    */
//   reset(): void {
//     this._lastCheckTime = 0;
//     this._lastCheckResult = true;
//     this._consecutiveFailures = 0;
//     this.stopPeriodicChecks();
//   }
// }

// // Create a singleton instance
// export const healthCoordinator = new HealthCoordinator();

// // Only set up browser event handlers once
// let isSetup = false;

// if (typeof window !== 'undefined' && !isSetup) {
//   window.addEventListener('online', () => {
//     console.log('Browser reports online, checking API health');
//     // Add delay to let connection stabilize
//     setTimeout(() => {
//       healthCoordinator.forceCheck();
//     }, 2000);
//   });
  
//   window.addEventListener('offline', () => {
//     console.log('Browser reports offline');
//     healthCoordinator.notifyListeners(false);
//   });
  
//   isSetup = true;
// }

// // Export the singleton
// export default healthCoordinator;