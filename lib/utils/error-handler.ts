// utils/error-handler.ts

/**
 * Types for error objects returned from API
 */
interface ErrorObject {
  message?: string | { message?: string };
  error?: string | object;
  statusCode?: number;
  status?: number;
  stack?: string;
}

/**
 * Convert API error to displayable string
 * Handle cases when error is an object or string
 */
export function getErrorMessage(error: unknown, defaultMessage = "Đã xảy ra lỗi"): string {
  if (!error) {
    return defaultMessage;
  }

  // If error is string, return directly
  if (typeof error === 'string') {
    return error;
  }

  // Handle empty objects
  if (typeof error === 'object' && Object.keys(error as object).length === 0) {
    return defaultMessage;
  }

  // If error is object with message property
  if (typeof error === 'object') {
    const errorObj = error as any;
    
    // Handle API error structure when message is inside nested object
    if (errorObj.message && typeof errorObj.message === 'object') {
      if (errorObj.message.message) {
        return errorObj.message.message;
      }
    }
    
    // Prioritize message property if exists and is string
    if (errorObj.message && typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    
    // Use error property if no message
    if (errorObj.error) {
      // If error is string
      if (typeof errorObj.error === 'string') {
        return errorObj.error;
      }
      
      // If error is nested object
      if (typeof errorObj.error === 'object') {
        const nestedError = errorObj.error as ErrorObject;
        
        if (nestedError.message) {
          if (typeof nestedError.message === 'string') {
            return nestedError.message;
          } else if (typeof nestedError.message === 'object' && nestedError.message.message) {
            return nestedError.message.message as string;
          }
        }
      }
    }
    
    // Specific login error case from server
    if ((errorObj.statusCode === 401 || errorObj.status === 401) && errorObj.error === 'Unauthorized') {
      return errorObj.message || 'Thông tin đăng nhập không chính xác';
    }
    
    // Check error object from Thunk/Redux
    if (errorObj.payload && typeof errorObj.payload === 'object') {
      return getErrorMessage(errorObj.payload);
    }
    
    // Check stack and name from Error object
    if (errorObj.stack && errorObj.name) {
      return `${errorObj.name}: ${errorObj.message || defaultMessage}`;
    }
  }

  // Handle case when error is Error
  if (error instanceof Error) {
    return error.message || error.toString();
  }

  // Check if can convert to string
  try {
    const errorString = JSON.stringify(error);
    if (errorString && errorString !== '{}' && errorString !== '[]') {
      return errorString;
    }
  } catch (e) {
    // Cannot convert to string, skip
  }

  // If cannot parse error, return default message
  return defaultMessage;
}

/**
 * Check if error object indicates authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (!error) return false;
  
  if (typeof error === 'object') {
    const errorObj = error as any;
    
    // Check status code
    if (errorObj.statusCode === 401 || errorObj.status === 401) {
      return true;
    }
    
    // Check error message
    const errorMessage = getErrorMessage(error, '').toLowerCase();
    return errorMessage.includes('unauthorized') || 
           errorMessage.includes('unauthenticated') ||
           errorMessage.includes('invalid credentials') ||
           (errorMessage.includes('token') && (
             errorMessage.includes('invalid') || 
             errorMessage.includes('expired')
           ));
  }
  
  return false;
}

/**
 * Check if error object indicates network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;
  
  const errorMessage = getErrorMessage(error, '').toLowerCase();
  return errorMessage.includes('network') || 
         errorMessage.includes('fetch') ||
         errorMessage.includes('connect') ||
         errorMessage.includes('timeout') ||
         errorMessage.includes('abort');
}

// Track logged errors to avoid duplicate logging
const loggedErrors = new Map<string, Set<string>>();

/**
 * Create a unique key for an error object
 */
function createErrorKey(error: unknown): string {
  if (!error) return 'null';
  if (typeof error === 'string') return error;
  
  try {
    if (typeof error === 'object') {
      const errorObj = error as any;
      // For Error objects, use name+message
      if (errorObj instanceof Error) {
        return `${errorObj.name}:${errorObj.message}`;
      }
      // For authentication errors, create a special key
      if (isAuthError(error)) {
        const message = getErrorMessage(error, 'auth-error');
        return `auth:${message}`;
      }
      // For other objects, try to stringify
      return JSON.stringify(error);
    }
  } catch (e) {
    // If stringify fails, use toString
  }
  
  return String(error);
}

/**
 * Clean up old logged errors (older than 5 minutes)
 */
function cleanupLoggedErrors() {
  for (const [context, errors] of loggedErrors.entries()) {
    // If context has no errors, remove context
    if (errors.size === 0) {
      loggedErrors.delete(context);
    }
  }
}

/**
 * Log error consistently, with option to log only once
 */
export function logError(
  context: string, 
  error: unknown, 
  options: { 
    once?: boolean;
    expirationTime?: number;
    compact?: boolean;
  } = {}
): void {
  const { 
    once = true,  // Default to logging once per error
    expirationTime = 5 * 60 * 1000,
    compact = true // Default to compact logging
  } = options;
  
  // If log once, check if already logged
  if (once) {
    const errorKey = createErrorKey(error);
    
    // Check if already logged this error
    if (!loggedErrors.has(context)) {
      loggedErrors.set(context, new Set());
    }
    
    const contextErrors = loggedErrors.get(context)!;
    if (contextErrors.has(errorKey)) {
      return; // Already logged this error, skip
    }
    
    // Add error to logged list
    contextErrors.add(errorKey);
    
    // Remove error after expiration time
    if (expirationTime > 0) {
      setTimeout(() => {
        const errors = loggedErrors.get(context);
        if (errors) {
          errors.delete(errorKey);
          cleanupLoggedErrors();
        }
      }, expirationTime);
    }
  }
  
  const errorMessage = getErrorMessage(error);
  
  // Compact logging to reduce console noise
  if (compact) {
    console.error(`[${context}] Error:`, {
      message: errorMessage,
      error,
      time: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined
    });
  } else {
    // Detailed separate logging (original behavior)
    console.error(`[${context}] Error:`, error);
    console.error(`[${context}] Message:`, errorMessage);
    console.error(`[${context}] Time:`, new Date().toISOString());
    
    // Add context info
    if (typeof window !== 'undefined') {
      console.error(`[${context}] URL:`, window.location.href);
      console.error(`[${context}] User Agent:`, navigator.userAgent);
    }
  }
}