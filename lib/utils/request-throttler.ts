// src/lib/utils/request-throttler.ts

/**
 * A utility to throttle API requests to prevent 429 errors
 */
class RequestThrottler {
    private requestTimestamps: Map<string, number[]> = new Map();
    private requestInProgress: Map<string, boolean> = new Map();
    private maxRequestsPerWindow: number = 10;
    private windowSizeMs: number = 10000; // 10 seconds
  
    /**
     * Checks if a request should be allowed based on the throttling rules
     * @param key Unique identifier for the request type
     * @returns boolean indicating if request should proceed
     */
    canMakeRequest(key: string): boolean {
      // If a request of this type is already in progress, don't allow another
      if (this.requestInProgress.get(key)) {
        return false;
      }
  
      // Get timestamps for this request type
      const timestamps = this.requestTimestamps.get(key) || [];
      
      // Remove timestamps outside the current window
      const now = Date.now();
      const windowStart = now - this.windowSizeMs;
      const recentTimestamps = timestamps.filter(time => time >= windowStart);
      
      // Check if we've exceeded the maximum requests in the window
      if (recentTimestamps.length >= this.maxRequestsPerWindow) {
        console.warn(`Request throttled: Too many ${key} requests in time window`);
        return false;
      }
      
      return true;
    }
  
    /**
     * Records the start of a request
     * @param key Unique identifier for the request type
     */
    startRequest(key: string): void {
      // Record that a request is in progress
      this.requestInProgress.set(key, true);
      
      // Add timestamp to the list
      const timestamps = this.requestTimestamps.get(key) || [];
      timestamps.push(Date.now());
      this.requestTimestamps.set(key, timestamps);
    }
  
    /**
     * Records the completion of a request
     * @param key Unique identifier for the request type
     */
    endRequest(key: string): void {
      this.requestInProgress.set(key, false);
    }
  
    /**
     * Wraps an async function with throttling logic
     * @param key Unique identifier for the request type
     * @param fn Async function to throttle
     * @returns Promise that resolves to the function result or null if throttled
     */
    async throttle<T>(key: string, fn: () => Promise<T>): Promise<T | null> {
      if (!this.canMakeRequest(key)) {
        return null;
      }
  
      try {
        this.startRequest(key);
        return await fn();
      } finally {
        this.endRequest(key);
      }
    }
  
    /**
     * Configure the throttler settings
     * @param maxRequests Maximum requests allowed in the time window
     * @param windowMs Size of the time window in milliseconds
     */
    configure(maxRequests: number, windowMs: number): void {
      this.maxRequestsPerWindow = maxRequests;
      this.windowSizeMs = windowMs;
    }
  }
  
  // Create a singleton instance
  export const requestThrottler = new RequestThrottler();
  
  // Configure with appropriate limits
  requestThrottler.configure(5, 5000); // 5 requests per 5 seconds