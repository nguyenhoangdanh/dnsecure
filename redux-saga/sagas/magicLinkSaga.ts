// src/store/sagas/magicLinkSaga.ts
import { takeLatest, call, put, delay } from 'redux-saga/effects';
import { authService } from '@/lib/services/auth-service';
import { loginSuccess, loginFailure } from '../slices/authSlice';
import type { ApiResponse, AuthResponse } from '../types/auth';

function* sendMagicLinkSaga(action: { type: string; payload: { email: string } }) {
  try {
    // Generate a cryptographically secure token with expiration
    // (This would usually happen on the server)
    
    const response: ApiResponse = yield call(
      authService.sendMagicLink,
      action.payload.email
    );
    
    if (response.success) {
      yield put({ type: 'SEND_MAGIC_LINK_SUCCESS' });
    } else {
      yield put({ 
        type: 'SEND_MAGIC_LINK_FAILURE', 
        payload: typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || 'Failed to send magic link'
      });
    }
  } catch (error: any) {
    yield put({ 
      type: 'SEND_MAGIC_LINK_FAILURE',
      payload: error.message || 'An unexpected error occurred'
    });
  }
}

function* verifyMagicLinkSaga(action: { type: string; payload: { token: string } }) {
  try {
    // Add a small random delay to prevent timing attacks
    yield delay(100 + Math.random() * 100);
    
    const response: ApiResponse<AuthResponse> = yield call(
      authService.verifyMagicLink,
      action.payload.token
    );
    
    if (response.success && response.data) {
      // Set token in HttpOnly cookies (handled by the server)
      // localStorage as fallback only
      yield call(
        authService.setStoredToken,
        response.data.accessToken,
        new Date(response.data.expiresAt)
      );
      
      yield put(loginSuccess({
        user: response.data.user,
        accessToken: response.data.accessToken,
        expiresAt: response.data.expiresAt
      }));
      
      yield put({ type: 'VERIFY_MAGIC_LINK_SUCCESS' });
      
      // Redirect to dashboard
      yield call([window.location, 'replace'], '/dashboard');
    } else {
      yield put(loginFailure(
        typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || 'Invalid or expired magic link'
      ));
      
      yield put({ type: 'VERIFY_MAGIC_LINK_FAILURE' });
    }
  } catch (error: any) {
    yield put(loginFailure(error.message || 'An unexpected error occurred'));
    yield put({ type: 'VERIFY_MAGIC_LINK_FAILURE' });
  }
}
export function* magicLinkSaga() {
  yield takeLatest('SEND_MAGIC_LINK_REQUEST', sendMagicLinkSaga);
  yield takeLatest('VERIFY_MAGIC_LINK_REQUEST', verifyMagicLinkSaga);
}