// utils/auth-error.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { handleFormApiError } from './api-error-handler';
import { getErrorMessage } from './error-handler';
import { redirect } from 'next/navigation';

interface UseAuthErrorHandlerProps {
  error: unknown;
  status: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  maxAttempts?: number;
  lockDuration?: number;
  context?: string;
}

interface AuthErrorHandlerResult {
  error: string | null;
  loginAttempts: number;
  loginLocked: boolean;
  lockCountdown: number;
  resetError: () => void;
}

/**
 * Create a unique error key to prevent duplicate processing
 */
function createErrorKey(error: unknown): string {
  if (!error) return 'null-error';
  if (typeof error === 'string') return error;
  
  try {
    // For objects, try to get message or stringify
    if (typeof error === 'object') {
      // Special case for empty objects
      if (Object.keys(error as object).length === 0) {
        return 'empty-object-error';
      }
      
      const errorObj = error as any;
      if (errorObj.message) {
        return typeof errorObj.message === 'string' 
          ? errorObj.message 
          : JSON.stringify(errorObj.message);
      }
      return JSON.stringify(error);
    }
  } catch {
    // If JSON stringify fails, use toString
  }
  
  return String(error);
}

/**
 * Custom hook to handle authentication errors with rate limiting
 */
export function useAuthErrorHandler({
  error,
  status,
  isLoading,
  setIsLoading,
  maxAttempts = 5,
  lockDuration = 60,
  context = 'AuthForm',
}: UseAuthErrorHandlerProps): AuthErrorHandlerResult {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [loginLocked, setLoginLocked] = useState<boolean>(false);
  const [lockCountdown, setLockCountdown] = useState<number>(0);
  
  // Track processed errors to avoid duplicate processing
  const processedErrors = useRef(new Set<string>());
  
  // Track last status to detect changes
  const lastStatus = useRef(status);
  const lastError = useRef(error);
  
  /**
   * Check localStorage for previous login attempts
   */
  useEffect(() => {
    // Try to load previous login attempt state from localStorage
    try {
      const storedAttempts = localStorage.getItem('loginAttempts');
      const storedLockTime = localStorage.getItem('loginLockedUntil');
      
      if (storedAttempts) {
        const attempts = parseInt(storedAttempts);
        setLoginAttempts(attempts);
      }
      
      if (storedLockTime) {
        const lockUntil = parseInt(storedLockTime);
        const now = Date.now();
        
        // If lock time is in the future, apply lock
        if (lockUntil > now) {
          setLoginLocked(true);
          setLockCountdown(Math.ceil((lockUntil - now) / 1000)); // Convert to seconds
        } else {
          // Remove expired locks
          localStorage.removeItem('loginLockedUntil');
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);
  
  // Reset error state
  const resetError = useCallback(() => {
    setErrorMessage(null);
    processedErrors.current = new Set();
  }, []);
  
  // Process authentication errors
  useEffect(() => {
    // Skip processing if locked
    if (loginLocked) return;
    
    // Check if there's an error or status change
    const hasStatusChanged = status !== lastStatus.current;
    const hasNewError = error !== lastError.current;
    
    // Update refs
    lastStatus.current = status;
    lastError.current = error;
    
    // Early return if no change
    if (!hasStatusChanged && !hasNewError) return;
    
    // Define what status values indicate an error state
    const isFailureStatus = ['failed', 'error', 'unauthenticated'].includes(status);
    
    // Check if there's an error to process
    const shouldProcessError = isFailureStatus && error !== null && error !== undefined;
    
    // Process error if needed
    if (shouldProcessError) {
      // Special handling for empty objects
      const isEmptyObject = typeof error === 'object' && 
                           error !== null && 
                           Object.keys(error as object).length === 0;
      
      // Get unique key for this error to prevent duplicate processing
      const errorKey = createErrorKey(error);
      
      // Log detailed debug info (remove in production)
      console.debug('Auth Error Debug:', {
        error,
        isEmptyObject,
        status,
        errorKey,
        isFailureStatus,
        hasNewError,
      });
      
      // Skip if already processed this error
      if (!processedErrors.current.has(errorKey)) {
        // Mark this error as processed
        processedErrors.current.add(errorKey);
        
        // For empty objects, provide a default message
        if (isEmptyObject) {
          setErrorMessage('Thông tin đăng nhập không chính xác');
          console.debug('Auth Error: Using default message for empty error object');
        } else {
          // Extract message
          let message = getErrorMessage(error);
          
          // If message is empty or generic, use default
          if (!message || message === 'Đã xảy ra lỗi') {
            message = 'Thông tin đăng nhập không chính xác';
          }
          
          // Use handleFormApiError for consistent handling
          handleFormApiError(
            message ? { message } : error, 
            context, 
            setErrorMessage, 
            {
              defaultMessage: 'Thông tin đăng nhập không chính xác',
              logoutOnAuthError: false,
              // Only log first occurrence to avoid console spam
              logError: loginAttempts === 0,
            }
          );
        }
        
        // Update attempt counter
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        // Save to localStorage
        try {
          localStorage.setItem('loginAttempts', String(newAttempts));
        } catch (e) {
          // Ignore localStorage errors
        }
        
        // Check if should lock
        if (newAttempts >= maxAttempts) {
          const now = Date.now();
          const lockUntil = now + (lockDuration * 1000);
          
          setLoginLocked(true);
          setLockCountdown(lockDuration);
          
          // Save lock to localStorage
          try {
            localStorage.setItem('loginLockedUntil', String(lockUntil));
          } catch (e) {
            // Ignore localStorage errors
          }
        }
      }
    }
    
    // Reset loading state if needed
    if (isLoading && status !== 'loading') {
      setIsLoading(false);
    }
  }, [error, status, isLoading, context, loginAttempts, maxAttempts, lockDuration, setIsLoading]);

  // Countdown timer for login lock
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (loginLocked && lockCountdown > 0) {
      timer = setTimeout(() => {
        setLockCountdown(prev => prev - 1);
      }, 1000);
    } else if (lockCountdown === 0 && loginLocked) {
      setLoginLocked(false);
      setLoginAttempts(0);
      
      // Clear localStorage
      try {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginLockedUntil');
      } catch (e) {
        // Ignore localStorage errors
      }
      
      resetError();
    }

    return () => clearTimeout(timer);
  }, [loginLocked, lockCountdown, resetError]);

  return {
    error: errorMessage,
    loginAttempts,
    loginLocked,
    lockCountdown,
    resetError
  };
}

/**
 * Analyze login failure and provide helpful context
 */
export function analyzeLoginFailure(error: unknown): {
  possibleCause: string;
  recommendation: string;
} {
  // Default response
  const defaultResponse = {
    possibleCause: "Unknown authentication error",
    recommendation: "Please check your credentials and try again."
  };

  // Handle empty objects
  if (typeof error === 'object' && error !== null && Object.keys(error as object).length === 0) {
    return {
      possibleCause: "Invalid credentials",
      recommendation: "Please check your email and password and try again."
    };
  }

  if (!error) return defaultResponse;

  // Get error message
  let errorMessage = "";
  if (typeof error === 'string') {
    errorMessage = error.toLowerCase();
  } else if (typeof error === 'object') {
    try {
      const errObj = error as any;
      errorMessage = (errObj.message || JSON.stringify(error)).toLowerCase();
    } catch {
      return defaultResponse;
    }
  }

  // Analyze common failure patterns
  if (errorMessage.includes('invalid credentials') || 
      errorMessage.includes('incorrect password')) {
    return {
      possibleCause: "Incorrect email or password",
      recommendation: "Please check your email and password and try again."
    };
  }
  
  if (errorMessage.includes('rate limit') || 
      errorMessage.includes('too many requests')) {
    return {
      possibleCause: "Too many login attempts",
      recommendation: "Your account is temporarily locked. Please try again later."
    };
  }
  
  if (errorMessage.includes('timeout') || 
      errorMessage.includes('network')) {
    return {
      possibleCause: "Network connection issue",
      recommendation: "Please check your internet connection and try again."
    };
  }
  
  if (errorMessage.includes('server') || 
      errorMessage.includes('internal error')) {
    return {
      possibleCause: "Server error",
      recommendation: "Our servers are experiencing issues. Please try again later."
    };
  }
  
  if (errorMessage.includes('account') && 
      (errorMessage.includes('locked') || errorMessage.includes('disabled'))) {
    return {
      possibleCause: "Account locked",
      recommendation: "Your account has been locked for security reasons. Please contact support."
    };
  }

  return defaultResponse;
}