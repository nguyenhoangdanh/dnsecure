// src/lib/utils/network-error-handler.ts

/**
 * Network error types for better error handling
 */
export enum NetworkErrorType {
  OFFLINE = 'OFFLINE',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Network error with additional context
 */
export class NetworkError extends Error {
  type: NetworkErrorType;
  status?: number;
  retryable: boolean;
  
  constructor(
    message: string, 
    type: NetworkErrorType, 
    status?: number, 
    retryable: boolean = true
  ) {
    super(message);
    this.name = 'NetworkError';
    this.type = type;
    this.status = status;
    this.retryable = retryable;
  }
}

// Track rate limiting across the application
const rateLimitTracker = {
  // Map of endpoint patterns to rate limit expiry timestamps
  endpoints: new Map<string, number>(),
  
  /**
   * Check if an endpoint is rate limited
   * @param endpoint The endpoint to check
   * @returns Boolean indicating if endpoint is rate limited
   */
  isRateLimited(endpoint: string): boolean {
    const now = Date.now();
    
    // Check exact endpoint match
    if (this.endpoints.has(endpoint)) {
      const expiry = this.endpoints.get(endpoint)!;
      if (now < expiry) {
        return true;
      } else {
        // Clean up expired entry
        this.endpoints.delete(endpoint);
      }
    }
    
    // Check for pattern matches (e.g., all auth endpoints)
    for (const [pattern, expiry] of this.endpoints.entries()) {
      if (pattern.includes('*') && this.matchesPattern(endpoint, pattern)) {
        if (now < expiry) {
          return true;
        } else {
          // Clean up expired entry
          this.endpoints.delete(pattern);
        }
      }
    }
    
    return false;
  },
  
  /**
   * Set rate limiting for an endpoint
   * @param endpoint The endpoint pattern to rate limit
   * @param durationMs The duration in milliseconds
   */
  setRateLimited(endpoint: string, durationMs: number): void {
    this.endpoints.set(endpoint, Date.now() + durationMs);
  },
  
  /**
   * Check if endpoint matches a pattern
   * @param endpoint The endpoint to check
   * @param pattern The pattern to match against
   * @returns Boolean indicating if endpoint matches pattern
   */
  matchesPattern(endpoint: string, pattern: string): boolean {
    if (pattern === '*') return true;
    
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(endpoint);
  },
  
  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.endpoints.clear();
  }
};

/**
 * Utility functions for handling network errors
 */
export const networkErrorHandler = {
  /**
   * Analyze a fetch error and return a more specific NetworkError
   * @param error The original error from fetch
   * @param url The URL that was being accessed
   * @returns A NetworkError with more context
   */
  handleFetchError(error: unknown, url: string): NetworkError {
    // Type guard for typeof error
    if (error instanceof TypeError) {
      if (error.message.includes('Failed to fetch')) {
        // Check if the device is offline
        if (!navigator.onLine) {
          return new NetworkError(
            'You appear to be offline. Please check your internet connection.',
            NetworkErrorType.OFFLINE
          );
        }
        
        return new NetworkError(
          `Unable to connect to server: ${url}. Please check your connection.`,
          NetworkErrorType.SERVER_ERROR
        );
      }
    }
    
    // Handle AbortError (timeout)
    if (error instanceof DOMException && error.name === 'AbortError') {
      return new NetworkError(
        'Request timed out. The server is taking too long to respond.',
        NetworkErrorType.TIMEOUT
      );
    }
    
    // Handle other types of errors
    return new NetworkError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      NetworkErrorType.UNKNOWN
    );
  },
  
  /**
   * Analyze HTTP response and throw appropriate NetworkError
   * @param response The fetch Response object
   * @param url The URL that was accessed
   * @throws NetworkError with appropriate type and status
   */
  handleHttpResponse(response: Response, url: string): void {
    if (!response.ok) {
      // Handle different HTTP status codes
      switch (response.status) {
        case 400:
          throw new NetworkError(
            'The request was malformed or invalid.',
            NetworkErrorType.BAD_REQUEST,
            response.status
          );
          
        case 401:
          throw new NetworkError(
            'Authentication required. Please log in again.',
            NetworkErrorType.AUTHENTICATION_ERROR,
            response.status
          );
        
        case 403:
          throw new NetworkError(
            'You do not have permission to access this resource.',
            NetworkErrorType.FORBIDDEN,
            response.status,
            false // Not retryable
          );
          
        case 404:
          throw new NetworkError(
            `Resource not found: ${url}`,
            NetworkErrorType.NOT_FOUND,
            response.status,
            false // Not retryable
          );
          
        case 429:
          // Rate limited - track in rate limit tracker
          const retryAfter = response.headers.get('Retry-After');
          let durationMs = 60000; // Default 1 minute
          
          if (retryAfter) {
            // If Retry-After is in seconds
            if (/^\d+$/.test(retryAfter)) {
              durationMs = parseInt(retryAfter) * 1000;
            } else {
              // If Retry-After is a date
              const retryDate = new Date(retryAfter);
              if (!isNaN(retryDate.getTime())) {
                durationMs = retryDate.getTime() - Date.now();
              }
            }
          }
          
          // Determine endpoint pattern to rate limit
          let endpoint = url;
          if (url.includes('/auth/')) {
            endpoint = '/auth/*'; // Rate limit all auth endpoints
          }
          
          rateLimitTracker.setRateLimited(endpoint, durationMs);
          
          throw new NetworkError(
            'Too many requests. Please try again later.',
            NetworkErrorType.RATE_LIMITED,
            response.status,
            false // Not immediately retryable
          );
          
        case 500:
        case 502:
        case 503:
        case 504:
          throw new NetworkError(
            'The server encountered an error. Please try again later.',
            NetworkErrorType.SERVER_ERROR,
            response.status
          );
          
        default:
          throw new NetworkError(
            `HTTP Error: ${response.status} ${response.statusText}`,
            NetworkErrorType.UNKNOWN,
            response.status
          );
      }
    }
  },
  
  /**
   * Get a user-friendly error message based on NetworkErrorType
   * @param error The NetworkError
   * @returns A user-friendly error message
   */
  getUserFriendlyMessage(error: NetworkError): string {
    switch (error.type) {
      case NetworkErrorType.OFFLINE:
        return 'You appear to be offline. Please check your internet connection.';
        
      case NetworkErrorType.TIMEOUT:
        return 'The server is taking too long to respond. Please try again later.';
        
      case NetworkErrorType.AUTHENTICATION_ERROR:
        return 'Your session has expired. Please log in again.';
        
      case NetworkErrorType.FORBIDDEN:
        return 'You do not have permission to access this resource.';
        
      case NetworkErrorType.NOT_FOUND:
        return 'The requested resource was not found.';
        
      case NetworkErrorType.SERVER_ERROR:
        return 'The server encountered an error. Please try again later.';
        
      case NetworkErrorType.RATE_LIMITED:
        return 'Too many requests. Please try again later.';
        
      case NetworkErrorType.BAD_REQUEST:
        return 'The request was invalid. Please check your input and try again.';
        
      default:
        return error.message || 'An unknown error occurred.';
    }
  },
  
  /**
   * Check if an endpoint is currently rate limited
   * @param endpoint The endpoint to check
   * @returns Boolean indicating if the endpoint is rate limited
   */
  isRateLimited(endpoint: string): boolean {
    return rateLimitTracker.isRateLimited(endpoint);
  },
  
  /**
   * Manually set rate limiting for an endpoint
   * @param endpoint The endpoint to rate limit
   * @param durationMs The duration in milliseconds
   */
  setRateLimited(endpoint: string, durationMs: number): void {
    rateLimitTracker.setRateLimited(endpoint, durationMs);
  },
  
  /**
   * Clear all rate limits
   */
  clearRateLimits(): void {
    rateLimitTracker.clearAll();
  }
};