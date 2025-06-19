// src/redux/sagas/2FA_Saga.ts
import { call, put, takeLatest, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { 
  enableTwoFactorRequest, 
  enableTwoFactorSuccess, 
  enableTwoFactorFailure,
  verifyTwoFactorRequest,
  verifyTwoFactorSuccess,
  verifyTwoFactorFailure,
  disableTwoFactorRequest,
  disableTwoFactorSuccess,
  disableTwoFactorFailure,
  getBackupCodesRequest,
  getBackupCodesSuccess,
  getBackupCodesFailure,
  regenerateBackupCodesRequest,
  regenerateBackupCodesSuccess,
  regenerateBackupCodesFailure,
  checkTwoFactorStatusRequest,
  checkTwoFactorStatusSuccess,
  checkTwoFactorStatusFailure,
  verifyLoginTwoFactorRequest,
  verifyLoginTwoFactorSuccess,
  verifyLoginTwoFactorFailure
} from '../slices/twoFactorSlice';
import { loginSuccess } from '../slices/authSlice';
import { RootState } from '../store';
import { api } from '@/lib/api/api-client';
import { toast } from 'sonner';

// Lấy state từ Redux
const getSessionId = (state: RootState) => state.twoFactor.sessionId;

/**
 * Saga để khởi tạo thiết lập xác thực hai yếu tố (2FA)
 */
function* enableTwoFactorSaga() {
  try {
    const response = yield call(api.post, '/two-factor/enable', {});
    
    if (response.success && response.data) {
      yield put(enableTwoFactorSuccess({
        secret: response.data.secret,
        qrCodeUrl: response.data.qrCodeUrl
      }));
      
      toast.success('Two-factor authentication setup initiated. Please scan the QR code.');
    } else {
      throw new Error(response.error || 'Failed to initiate two-factor authentication');
    }
  } catch (error: any) {
    yield put(enableTwoFactorFailure(error.message || 'Failed to initiate two-factor authentication'));
    toast.error(error.message || 'Failed to initiate two-factor authentication');
  }
}

/**
 * Saga để xác minh và kích hoạt 2FA
 */
function* verifyTwoFactorSaga(action: PayloadAction<{ token: string }>) {
  try {
    const { token } = action.payload;
    
    const response = yield call(api.post, '/two-factor/verify', { token });
    
    if (response.success && response.data) {
      yield put(verifyTwoFactorSuccess());
      
      // Tự động lấy mã dự phòng sau khi xác minh thành công
      yield put(getBackupCodesRequest());
      
      toast.success('Two-factor authentication enabled successfully');
    } else {
      throw new Error(response.error || 'Failed to verify two-factor authentication');
    }
  } catch (error: any) {
    yield put(verifyTwoFactorFailure(error.message || 'Failed to verify two-factor authentication'));
    toast.error(error.message || 'Invalid verification code');
  }
}

/**
 * Saga để vô hiệu hóa 2FA
 */
function* disableTwoFactorSaga(action: PayloadAction<{ password: string }>) {
  try {
    const { password } = action.payload;
    
    const response = yield call(api.post, '/two-factor/disable', { password });
    
    if (response.success && response.data) {
      yield put(disableTwoFactorSuccess());
      toast.success('Two-factor authentication disabled successfully');
    } else {
      throw new Error(response.error || 'Failed to disable two-factor authentication');
    }
  } catch (error: any) {
    yield put(disableTwoFactorFailure(error.message || 'Failed to disable two-factor authentication'));
    toast.error(error.message || 'Failed to disable two-factor authentication. Please check your password and try again.');
  }
}

/**
 * Saga để lấy mã dự phòng
 */
function* getBackupCodesSaga() {
  try {
    const response = yield call(api.get, '/two-factor/backup-codes');
    
    if (response.success && response.data && response.data.backupCodes) {
      yield put(getBackupCodesSuccess(response.data.backupCodes));
    } else {
      throw new Error(response.error || 'Failed to retrieve backup codes');
    }
  } catch (error: any) {
    yield put(getBackupCodesFailure(error.message || 'Failed to retrieve backup codes'));
    toast.error(error.message || 'Failed to retrieve backup codes');
  }
}

/**
 * Saga để tạo lại mã dự phòng
 */
function* regenerateBackupCodesSaga() {
  try {
    const response = yield call(api.post, '/two-factor/regenerate-backup-codes', {});
    
    if (response.success && response.data && response.data.backupCodes) {
      yield put(regenerateBackupCodesSuccess(response.data.backupCodes));
      toast.success('Backup codes regenerated successfully. Please save these codes in a secure location.');
    } else {
      throw new Error(response.error || 'Failed to regenerate backup codes');
    }
  } catch (error: any) {
    yield put(regenerateBackupCodesFailure(error.message || 'Failed to regenerate backup codes'));
    toast.error(error.message || 'Failed to regenerate backup codes');
  }
}

/**
 * Saga để kiểm tra trạng thái 2FA
 */
function* checkTwoFactorStatusSaga() {
  try {
    const response = yield call(api.get, '/two-factor/status');
    
    if (response.success && response.data !== undefined) {
      yield put(checkTwoFactorStatusSuccess(response.data.enabled));
    } else {
      throw new Error(response.error || 'Failed to check two-factor status');
    }
  } catch (error: any) {
    yield put(checkTwoFactorStatusFailure(error.message || 'Failed to check two-factor status'));
    // Không hiển thị toast error vì đây là một kiểm tra ngầm
    console.error('Failed to check two-factor status:', error);
  }
}

/**
 * Saga để xác minh 2FA trong quá trình đăng nhập
 */
function* verifyLoginTwoFactorSaga(action: PayloadAction<{ token: string, sessionId: string }>) {
  try {
    const { token, sessionId } = action.payload;
    
    // Thu thập thông tin bảo mật (để phát hiện đăng nhập từ thiết bị mới)
    const securityInfo = {
      timestamp: new Date().toISOString(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    };
    
    // Gọi API endpoint 2fa/verify
    const response = yield call(api.post, '/auth/2fa/verify', { 
      token, 
      sessionId,
      securityInfo 
    });
    
    if (response.success && response.data) {
      // Đăng nhập thành công sau khi xác thực 2FA
      yield put(verifyLoginTwoFactorSuccess());
      
      // Cập nhật thông tin đăng nhập từ response
      yield put(loginSuccess({
        user: response.data.user,
        accessToken: response.data.accessToken,
        expiresAt: new Date(response.data.expiresAt * 1000).toISOString()
      }));
      
      // Lưu trữ thời gian đăng nhập cho các thao tác nhạy cảm
      localStorage.setItem('lastLoginTime', new Date().toISOString());
      
      toast.success('Login successful');
    } else {
      throw new Error(response.error || 'Failed to verify two-factor authentication');
    }
  } catch (error: any) {
    yield put(verifyLoginTwoFactorFailure(error.message || 'Failed to verify two-factor authentication'));
    toast.error(error.message || 'Invalid verification code');
  }
}

/**
 * Root saga cho 2FA
 */
export default function* twoFactorSaga() {
  yield takeLatest(enableTwoFactorRequest.type, enableTwoFactorSaga);
  yield takeLatest(verifyTwoFactorRequest.type, verifyTwoFactorSaga);
  yield takeLatest(disableTwoFactorRequest.type, disableTwoFactorSaga);
  yield takeLatest(getBackupCodesRequest.type, getBackupCodesSaga);
  yield takeLatest(regenerateBackupCodesRequest.type, regenerateBackupCodesSaga);
  yield takeLatest(checkTwoFactorStatusRequest.type, checkTwoFactorStatusSaga);
  yield takeLatest(verifyLoginTwoFactorRequest.type, verifyLoginTwoFactorSaga);
}