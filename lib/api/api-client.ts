// Enhanced api-client.ts with better network error handling and fixed type safety
import type { ApiResponse } from "../types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";

// Maximum number of retries for network errors
const MAX_NETWORK_RETRIES = 2;

/**
 * Enhanced API request function with better network resilience and type safety
 */
export async function apiRequest<T = any>(
  endpoint: string, 
  options: RequestInit = {},
  retryWithRefresh = true,
  networkRetries = MAX_NETWORK_RETRIES
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Check rate limiting cooldown for auth endpoints
    const now = Date.now();
    const cooldownUntilStr = localStorage.getItem('tokenRefreshCooldownUntil');
    if (cooldownUntilStr && retryWithRefresh && endpoint.includes('/auth/')) {
      const cooldownUntil = parseInt(cooldownUntilStr);
      if (now < cooldownUntil) {
        console.log(`Auth requests in cooldown period for another ${Math.floor((cooldownUntil - now)/1000)}s`);
        
        // If this is a token refresh request, return error
        if (endpoint === '/auth/refresh') {
          return {
            success: false,
            error: 'Authentication temporarily unavailable due to rate limiting'
          };
        }
      }
    }
    
    // Enhanced security headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      // Add cache control to prevent caching of auth requests
      ...(endpoint.includes('/auth/') ? {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      } : {}),
      ...(options.headers as Record<string, string> || {}),
    };
    
    // GET requests shouldn't have a body
    const finalOptions: RequestInit = { 
      ...options,
      headers,
      credentials: "include",
    };
    
    // Remove body for GET requests
    if (finalOptions.method === 'GET' && finalOptions.body) {
      delete finalOptions.body;
    }
    
    // Add timeout to fetch requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    finalOptions.signal = controller.signal;
    
    try {
      const response = await fetch(url, finalOptions);
      clearTimeout(timeoutId);
      
      // Handle rate limiting
      if (response.status === 429) {
        console.error(`Rate limited (429) on endpoint: ${endpoint}`);
        
        // Set cooldown for auth endpoints
        if (endpoint.includes('/auth/')) {
          const cooldownTimeMs = 5 * 60 * 1000; // 5 minutes
          const cooldownUntil = now + cooldownTimeMs;
          localStorage.setItem('tokenRefreshCooldownUntil', cooldownUntil.toString());
        }
        
        return {
          success: false,
          error: 'Rate limited. Please try again later.'
        };
      }

      
      // // Handle 401 Unauthorized with improved retry logic
      // if (response.status === 401 && retryWithRefresh) {
      //   try {
      //     console.log('Token expired, attempting refresh');
          
      //     // Check time since last refresh to avoid excessive calls
      //     const lastRefreshStr = localStorage.getItem('lastApiRefreshAttempt');
      //     const lastRefresh = lastRefreshStr ? parseInt(lastRefreshStr) : 0;
      //     const MIN_REFRESH_INTERVAL = 10 * 1000; // 10 seconds between refreshes
          
      //     if (now - lastRefresh < MIN_REFRESH_INTERVAL) {
      //       console.log(`API refresh throttled - last refresh was ${Math.floor((now - lastRefresh)/1000)}s ago`);
      //       return {
      //         success: false,
      //         error: 'Your session has expired. Please wait before trying again or log in again.'
      //       };
      //     }
          
      //     // Record refresh time
      //     localStorage.setItem('lastApiRefreshAttempt', now.toString());
          
      //     // Try to refresh the token
      //     const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      //       method: 'POST',
      //       credentials: 'include',
      //       headers: {
      //         'Content-Type': 'application/json',
      //         'Cache-Control': 'no-cache, no-store, must-revalidate',
      //         'Pragma': 'no-cache',
      //       },
      //       cache: 'no-store',
      //     });
          
      //     // Handle refresh rate limiting
      //     if (refreshResponse.status === 429) {
      //       console.error("Rate limited (429) during token refresh");
            
      //       // Set longer cooldown
      //       const cooldownTimeMs = 5 * 60 * 1000; // 5 minutes
      //       const cooldownUntil = now + cooldownTimeMs;
      //       localStorage.setItem('tokenRefreshCooldownUntil', cooldownUntil.toString());
            
      //       return {
      //         success: false,
      //         error: 'Authentication temporarily unavailable due to rate limiting. Please try again later.'
      //       };
      //     }
          
      //     if (refreshResponse.ok) {
      //       console.log('Token refreshed successfully');
            
      //       // Add delay before retrying original request
      //       await new Promise(resolve => setTimeout(resolve, 500));
            
      //       // Token refreshed successfully, retry the original request
      //       return apiRequest(endpoint, options, false); // No more retries
      //     }
          

      //     const error = await refreshResponse.json();
          
      //     console.log('Token refresh failed', error);
      //     // If refresh failed, return a user-friendly error
      //     return {
      //       success: false,
      //       error: error.message || 'Your session has expired. Please log in again.'
      //     };
      //   } catch (refreshError) {
      //     console.error('Token refresh error:', refreshError);
          
      //     // If refresh failed due to network error, return more specific error
      //     if (refreshError instanceof TypeError && refreshError.message.includes('Failed to fetch')) {
      //       return {
      //         success: false,
      //         error: 'Network error during authentication. Please check your connection and try again.'
      //       };
      //     }
          
      //     return {
      //       success: false,
      //       error: 'Authentication failed. Please log in again.'
      //     };
      //   }
      // }
      
      // // Improved response parsing
      // let data;
      // const contentType = response.headers.get("content-type");
      // if (contentType && contentType.includes("application/json")) {
      //   data = await response.json();
      // } else {
      //   const text = await response.text();
      //   data = { message: text };
      // }
      
       // Improved response parsing - parse JSON early to check error details
       let data;
       const contentType = response.headers.get("content-type");
       if (contentType && contentType.includes("application/json")) {
         data = await response.json();
       } else {
         const text = await response.text();
         data = { message: text };
       }
       
       // Handle 401 Unauthorized with improved logic
       // IMPORTANT CHANGE: Don't attempt token refresh for login/register endpoints
       // or when error is "Invalid credentials"/"Unauthorized"
       if (response.status === 401 && retryWithRefresh) {
         // Check if this is a login request or has a specific unauthorized error
         const isLoginRequest = endpoint === '/auth/login' || endpoint === '/auth/register';
         const isInvalidCredentials = data?.error === 'Unauthorized' || 
                                     data?.message === 'Invalid credentials';
         
         // Skip refresh token flow for login requests or invalid credentials
         if (isLoginRequest || isInvalidCredentials) {
           console.log('Authentication failed: Invalid credentials - not attempting token refresh');
           return {
             success: false,
             error: data
           };
         }
         
         // For other 401 errors, try token refresh
         try {
           console.log('Token expired, attempting refresh');
           
           // Check time since last refresh to avoid excessive calls
           const lastRefreshStr = localStorage.getItem('lastApiRefreshAttempt');
           const lastRefresh = lastRefreshStr ? parseInt(lastRefreshStr) : 0;
           const MIN_REFRESH_INTERVAL = 10 * 1000; // 10 seconds between refreshes
           
           if (now - lastRefresh < MIN_REFRESH_INTERVAL) {
             console.log(`API refresh throttled - last refresh was ${Math.floor((now - lastRefresh)/1000)}s ago`);
             return {
               success: false,
               error: 'Your session has expired. Please wait before trying again or log in again.'
             };
           }
           
           // Record refresh time
           localStorage.setItem('lastApiRefreshAttempt', now.toString());
           
           // Try to refresh the token
           const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
             method: 'POST',
             credentials: 'include', 
             headers: {
               'Content-Type': 'application/json',
               'Cache-Control': 'no-cache, no-store, must-revalidate',
               'Pragma': 'no-cache',
             },
             cache: 'no-store',
           });
           
           // Handle refresh rate limiting
           if (refreshResponse.status === 429) {
             console.error("Rate limited (429) during token refresh");
             
             // Set longer cooldown
             const cooldownTimeMs = 5 * 60 * 1000; // 5 minutes
             const cooldownUntil = now + cooldownTimeMs;
             localStorage.setItem('tokenRefreshCooldownUntil', cooldownUntil.toString());
             
             return {
               success: false,
               error: 'Authentication temporarily unavailable due to rate limiting. Please try again later.'
             };
           }
           
           if (refreshResponse.ok) {
             console.log('Token refreshed successfully');
             
             // Add delay before retrying original request
             await new Promise(resolve => setTimeout(resolve, 500));
             
             // Token refreshed successfully, retry the original request
             return apiRequest(endpoint, options, false); // No more retries
           }
           
           // Parse the refresh error
           let refreshError;
           try {
             refreshError = await refreshResponse.json();
           } catch (e) {
             refreshError = { message: 'Failed to refresh authentication' };
           }
           
           console.log('Token refresh failed', refreshError);
           
           // If refresh failed, return a user-friendly error
           return {
             success: false,
             error: refreshError.message || 'Your session has expired. Please log in again.'
           };
         } catch (refreshError) {
           console.error('Token refresh error:', refreshError);
           
           // If refresh failed due to network error, return more specific error
           if (refreshError instanceof TypeError && refreshError.message.includes('Failed to fetch')) {
             return {
               success: false,
               error: 'Network error during authentication. Please check your connection and try again.'
             };
           }
           
           return {
             success: false,
             error: 'Authentication failed. Please log in again.'
           };
         }
       }
      
      if (!response.ok) {
        // Enhanced error handling with more contextual info
        // const errorMessage = data.message || `Error: ${response.status} ${response.statusText}`;
        // console.error(`API Error (${response.status}):`, errorMessage);
        
        return {
          success: false,
          error: data,
        };
      }
      
      return {
        success: true,
        data,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle network errors with automatic retry
      if ((fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) ||
          (fetchError instanceof DOMException && fetchError.name === 'AbortError')) {
        
        console.error(`Network error (${endpoint}):`, fetchError.message);
        
        // If we have retries left, try again after a delay
        if (networkRetries > 0) {
          console.log(`Retrying request, ${networkRetries} retries left...`);
          
          // Exponential backoff with jitter
          const delay = Math.min(1000 * (MAX_NETWORK_RETRIES - networkRetries + 1), 5000) + 
                         Math.random() * 1000;
                         
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return apiRequest(endpoint, options, retryWithRefresh, networkRetries - 1);
        }
        
        // Enhanced network error messaging
        return {
          success: false,
          error: "Network error: Unable to connect to server. Please check your internet connection and try again later.",
        };
      }
      
      // Handle timeout errors specifically
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        return {
          success: false,
          error: "Request timed out. The server took too long to respond.",
        };
      }
      
      return {
        success: false,
        error: fetchError instanceof Error 
          ? fetchError.message 
          : "An unknown error occurred",
      };
    }
  } catch (error) {
    console.error("API request failed:", error);
    return {
      success: false,
      error: error instanceof Error 
        ? error.message 
        : "Network error occurred. Please check your connection.",
    };
  }
}

const hasValidToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-auth`, {
      method: 'GET',
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    console.error('Error checking token:', error);
    return false;
  }
};

// Enhanced API helper functions
export const api = {
  // Standard GET request
  get: <T = any>(endpoint: string, customHeaders?: Record<string, string>) => 
    apiRequest<T>(endpoint, { 
      method: "GET",
      headers: customHeaders
    }),

  // GET request with no automatic refresh
  getWithoutRefresh: <T = any>(endpoint: string) => 
    apiRequest<T>(endpoint, { method: "GET" }, false),

  // POST request with retry options
  post: <T = any>(endpoint: string, data: any, retryOnNetworkError = true) =>
    apiRequest<T>(
      endpoint, 
      {
        method: "POST",
        body: JSON.stringify(data),
      }, 
      true, 
      retryOnNetworkError ? MAX_NETWORK_RETRIES : 0
    ),

  // PUT request with retry options
  put: <T = any>(endpoint: string, data: any, retryOnNetworkError = true) =>
    apiRequest<T>(
      endpoint, 
      {
        method: "PUT",
        body: JSON.stringify(data),
      }, 
      true, 
      retryOnNetworkError ? MAX_NETWORK_RETRIES : 0
    ),
  
  // PATCH request with retry options
  patch: <T = any>(endpoint: string, data: any, retryOnNetworkError = true) =>
    apiRequest<T>(
      endpoint, 
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }, 
      true, 
      retryOnNetworkError ? MAX_NETWORK_RETRIES : 0
    ),

  // DELETE request
  delete: <T = any>(endpoint: string) => 
    apiRequest<T>(endpoint, { method: "DELETE" }),

  // Method to check if we have a valid token
  hasValidToken,
    
  // Utility to check if the API is reachable
  isReachable: async (): Promise<boolean> => {
    try {
      // No need to check connection if we don't have a token - avoid unnecessary API calls
      if (!(await hasValidToken())) {
        console.log('No valid token, skipping API connection check');
        return true; // Assume reachable when not authenticated
      }
      
      // Use controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        credentials: 'omit' as RequestCredentials, // Don't send auth info for this check
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  resetPassword: <T = any>(token: string, password: string, securityData?: any) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
    
    return new Promise<ApiResponse<T>>(async (resolve) => {
      try {
        // Add timeout to fetch requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
  
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          body: JSON.stringify({
            token,
            password,
            securityInfo: securityData
          }),
          credentials: 'include',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Parse response
        let data;
        try {
          data = await response.json();
        } catch (e) {
          data = { message: 'Failed to parse response' };
        }
        
        if (!response.ok) {
          console.error(`Password reset API error (${response.status}):`, data.message);
          resolve({
            success: false,
            error: data.message || `Error: ${response.status} ${response.statusText}`
          });
          return;
        }
        
        resolve({
          success: true,
          data
        });
      } catch (error) {
        console.error("Password reset request failed:", error);
        
        // Handle timeout errors specifically
        if (error instanceof DOMException && error.name === 'AbortError') {
          resolve({
            success: false,
            error: "Request timed out. The server took too long to respond."
          });
          return;
        }
        
        resolve({
          success: false,
          error: error instanceof Error 
            ? error.message 
            : "An unexpected error occurred"
        });
      }
    });
  }
};


