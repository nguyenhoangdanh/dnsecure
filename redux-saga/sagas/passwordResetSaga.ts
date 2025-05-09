// src/store/sagas/passwordResetSaga.ts
import { takeLatest, call, put } from 'redux-saga/effects';
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

// Reset password with token
function* resetPasswordSaga(action: { 
  type: string; 
  payload: { 
    token: string; 
    password: string;
    securityData?: any;
  } 
}) {
  try {
    // Extract security data if provided
    const { token, password, securityData } = action.payload;
    
    // Log security info for audit purposes if needed
    if (securityData) {
      console.log('Password reset security data:', securityData);
      // In a real app, you might want to send this to your backend for logging
      // or fraud prevention purposes
    }
    
    // Call the reset password API
    const response: ApiResponse = yield call(
      authService.resetPassword,
      token,
      password
    );
    
    if (response.success) {
      yield put({ type: 'RESET_PASSWORD_SUCCESS' });
      
      // Store the security data in a separate call if your API supports it
      if (securityData) {
        try {
          // This would be a separate API call to log security data
          // yield call(authService.logSecurityEvent, 'password_reset', securityData);
        } catch (loggingError) {
          console.error('Failed to log security data:', loggingError);
          // Non-critical error, don't affect the main flow
        }
      }
      
      // Redirect to login page is handled by the component
    } else {
      yield put({ 
        type: 'RESET_PASSWORD_FAILURE', 
        payload: typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || 'Failed to reset password'
      });
    }
  } catch (error: any) {
    yield put({ 
      type: 'RESET_PASSWORD_FAILURE',
      payload: error.message || 'An unexpected error occurred'
    });
  }
}

export function* passwordResetSaga() {
  yield takeLatest('FORGOT_PASSWORD_REQUEST', forgotPasswordSaga);
  yield takeLatest('RESET_PASSWORD_REQUEST', resetPasswordSaga);
}