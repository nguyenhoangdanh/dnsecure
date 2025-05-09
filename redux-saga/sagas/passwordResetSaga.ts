// src/store/sagas/passwordResetSaga.ts
import { takeLatest, call, put, delay } from 'redux-saga/effects';
import { authService } from '@/lib/services/auth-service';
import type { ApiResponse } from '../types/auth';

// Send password reset email
function* forgotPasswordSaga(action: { type: string; payload: { email: string } }) {
  try {
    const response: ApiResponse = yield call(
      authService.sendPasswordResetEmail,
      action.payload.email
    );
    
    if (response.success) {
      yield put({ type: 'FORGOT_PASSWORD_SUCCESS' });
    } else {
      yield put({ 
        type: 'FORGOT_PASSWORD_FAILURE', 
        payload: typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || 'Failed to send password reset email'
      });
    }
  } catch (error: any) {
    yield put({ 
      type: 'FORGOT_PASSWORD_FAILURE',
      payload: error.message || 'An unexpected error occurred'
    });
  }
}

// Reset password with token - fixed implementation
function* resetPasswordSaga(action: { 
  type: string; 
  payload: { 
    token: string; 
    password: string;
    securityData?: any;
  } 
}) {
  try {
    // Show loading state
    yield put({ type: 'RESET_PASSWORD_LOADING' });
    
    const { token, password, securityData } = action.payload;
    
    // Basic validation
    if (!token) {
      yield put({ 
        type: 'RESET_PASSWORD_FAILURE', 
        payload: 'Missing password reset token' 
      });
      return;
    }
    
    if (!password) {
      yield put({ 
        type: 'RESET_PASSWORD_FAILURE', 
        payload: 'Password is required' 
      });
      return;
    }
    
    // Direct API call without going through authService validation
    // Using the specialized resetPassword method from api client
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
    
    try {
      const response = yield call(
        fetch,
        `${API_BASE_URL}/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          body: JSON.stringify({
            token,
            password,
            securityInfo: securityData || {
              timestamp: new Date().toISOString(),
              deviceInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
              }
            }
          }),
          credentials: 'include'
        }
      );
      
      const data = yield call([response, 'json']);
      
      if (response.ok) {
        yield put({ type: 'RESET_PASSWORD_SUCCESS' });
        
        // Add a delay before redirecting
        yield delay(2000);
        
        // Redirect to login page
        yield call([window.location, 'replace'], '/login?reset=success');
      } else {
        yield put({ 
          type: 'RESET_PASSWORD_FAILURE', 
          payload: data.message || 'Failed to reset password'
        });
      }
    } catch (apiError: any) {
      console.error('API error during password reset:', apiError);
      yield put({ 
        type: 'RESET_PASSWORD_FAILURE',
        payload: apiError.message || 'Network error occurred when trying to reset password'
      });
    }
  } catch (error: any) {
    console.error('Unexpected error in reset password flow:', error);
    yield put({ 
      type: 'RESET_PASSWORD_FAILURE',
      payload: 'An unexpected error occurred. Please try again later.'
    });
  }
}

export function* passwordResetSaga() {
  yield takeLatest('FORGOT_PASSWORD_REQUEST', forgotPasswordSaga);
  yield takeLatest('RESET_PASSWORD_REQUEST', resetPasswordSaga);
}