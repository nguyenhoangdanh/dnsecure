// src/store/sagas/resendVerificationCodeSaga.ts
import { takeLatest, call, put } from 'redux-saga/effects';
import { authService } from '@/lib/services/auth-service';
import type { ApiResponse } from '../types/auth';

/**
 * Saga to handle resending verification code
 */
function* resendVerificationCodeSaga(action: { type: string; payload: { email: string } }) {
  try {
    const response: ApiResponse = yield call(
      authService.resendVerificationCode,
      { email: action.payload.email }
    );
    
    if (response.success) {
      yield put({ type: 'RESEND_VERIFICATION_CODE_SUCCESS' });
    } else {
      yield put({ 
        type: 'RESEND_VERIFICATION_CODE_FAILURE', 
        payload: typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || 'Failed to resend verification code'
      });
    }
  } catch (error: any) {
    yield put({ 
      type: 'RESEND_VERIFICATION_CODE_FAILURE',
      payload: error.message || 'An unexpected error occurred'
    });
  }
}

export function* verificationCodeSaga() {
  yield takeLatest('RESEND_VERIFICATION_CODE_REQUEST', resendVerificationCodeSaga);
}