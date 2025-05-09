// src/store/sagas/authSaga.ts
import { takeLatest, call, put, select, delay, fork, cancel, take, race } from 'redux-saga/effects';
import { authService } from '@/lib/services/auth-service';
import { 
  loginRequest, 
  loginSuccess, 
  loginFailure,
  logoutRequest,
  logoutSuccess,
  registerRequest,
  registerSuccess,
  registerFailure,
  verifyAccountRequest,
  verifyAccountSuccess,
  verifyAccountFailure,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
  updateUserRequest,
  updateUserSuccess,
  updateUserFailure
} from '../slices/authSlice';
import { PayloadAction } from '@reduxjs/toolkit';
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  VerifyRegistration, 
  ApiResponse, 
  AuthResponse,
  User 
} from '../types/auth';
import { RootState } from '../store';

// Selectors
const selectAuth = (state: RootState) => state.auth;
const selectExpiresAt = (state: RootState) => state.auth.expiresAt;

// Worker Sagas
function* loginSaga(action: PayloadAction<LoginCredentials>) {
  try {
    const response: ApiResponse<AuthResponse> = yield call(
      authService.login, 
      action.payload
    );
    
    if (response.success && response.data) {
      // Set token in localStorage as fallback (better to use HTTP-only cookies)
      yield call(
        authService.setStoredToken, 
        response.data.accessToken, 
        new Date(response.data.expiresAt)
      );
      
      // Update Redux state
      yield put(loginSuccess({
        user: response.data.user,
        accessToken: response.data.accessToken,
        expiresAt: response.data.expiresAt
      }));
      
      // Start token refresh cycle - make sure this is called *after* login success
      const refreshTask = yield fork(refreshTokenWatcher);
      
      // Redirect if needed - handled by the component
    } else {
      yield put(loginFailure(
        typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || 'Login failed'
      ));
    }
  } catch (error: any) {
    yield put(loginFailure(error.message || 'An unexpected error occurred'));
  }
}

// function* logoutSaga(action: PayloadAction<{ reason?: string; allDevices?: boolean } | undefined>) {
//   try {
//     const options = action.payload;
//     const allDevices = options?.allDevices || false;
    
//     // Call logout API with options
//     yield call(authService.logout, { allDevices });
    
//     // Clear token from storage
//     yield call(authService.clearStoredToken);
    
//     // Update Redux state
//     yield put(logoutSuccess());
    
//     // Log reason if provided (could be stored for analytics)
//     if (options?.reason) {
//       console.log('Logout reason:', options.reason);
//     }
    
//     // Redirect to home page
//     yield call([window.location, 'replace'], '/');
//   } catch (error) {
//     console.error('Logout error:', error);
    
//     // Even if API logout fails, we should clear local state
//     yield call(authService.clearStoredToken);
//     yield put(logoutSuccess());
//     yield call([window.location, 'replace'], '/');
//   }
// }

function* logoutSaga(action: PayloadAction<{ reason?: string; allDevices?: boolean; silent?: boolean } | undefined>) {
  try {
    const options = action.payload;
    const allDevices = options?.allDevices || false;
    const silent = options?.silent || false;
    
    // Chỉ gọi API logout nếu không phải chế độ im lặng
    if (!silent) {
      yield call(authService.logout, { allDevices });
    }
    
    // Xóa token khỏi storage
    yield call(authService.clearStoredToken);
    
    // Cập nhật trạng thái Redux
    yield put(logoutSuccess());
    
    // Ghi lại lý do nếu được cung cấp (có thể lưu trữ cho phân tích)
    if (options?.reason) {
      console.log('Lý do đăng xuất:', options.reason);
    }
    
    // Chỉ chuyển hướng đến trang chủ nếu không im lặng
    if (!silent) {
      yield call([window.location, 'replace'], '/');
    }
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    
    // Ngay cả khi API đăng xuất thất bại, chúng ta vẫn nên xóa trạng thái cục bộ
    yield call(authService.clearStoredToken);
    yield put(logoutSuccess());
    
    // Chỉ chuyển hướng nếu không im lặng
    // if (!options?.silent) {
    //   yield call([window.location, 'replace'], '/');
    // }
  }
}

function* registerSaga(action: PayloadAction<RegisterCredentials>) {
  try {
    const response: ApiResponse = yield call(
      authService.register, 
      action.payload
    );
    
    if (response.success) {
      yield put(registerSuccess());
      
      // Redirect to verification page or provided redirect
      if (action.payload.redirectTo) {
        yield call(
          [window.location, 'replace'], 
          action.payload.redirectTo
        );
      } else {
        yield call([window.location, 'replace'], `/verify-code?email=${action.payload.email}`);
      }
    } else {
      yield put(registerFailure(
        typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || 'Registration failed'
      ));
    }
  } catch (error: any) {
    yield put(registerFailure(error.message || 'An unexpected error occurred'));
  }
}

function* verifyAccountSaga(action: PayloadAction<VerifyRegistration>) {
  try {
    const response: ApiResponse<AuthResponse> = yield call(
      authService.verifyRegistration, 
      action.payload
    );
    
    if (response.success && response.data) {
      // Store token
      yield call(
        authService.setStoredToken, 
        response.data.accessToken, 
        new Date(response.data.expiresAt)
      );
      
      // Update state
      yield put(verifyAccountSuccess({
        user: response.data.user,
        accessToken: response.data.accessToken,
        expiresAt: response.data.expiresAt
      }));
      
      // Start token refresh
      yield fork(refreshTokenWatcher);
      
      // Redirect to dashboard
      yield call([window.location, 'replace'], '/dashboard');
    } else {
      yield put(verifyAccountFailure(
        typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || 'Verification failed'
      ));
    }
  } catch (error: any) {
    yield put(verifyAccountFailure(error.message || 'An unexpected error occurred'));
  }
}

function* refreshTokenSaga() {
  try {
    console.log("Attempting to refresh token");
    // Just call the function normally - it already handles credentials
    const response: ApiResponse<AuthResponse> = yield call(authService.refreshToken);
    
    if (response.success && response.data) {
      console.log("Token refresh successful");
      yield call(
        authService.setStoredToken, 
        response.data.accessToken, 
        new Date(response.data.expiresAt)
      );
      
      yield put(refreshTokenSuccess({
        accessToken: response.data.accessToken,
        expiresAt: response.data.expiresAt
      }));
      
      return true;
    } else {
      console.error("Token refresh failed:", response.error);
      yield put(refreshTokenFailure());
      return false;
    }
  } catch (error) {
    console.error('Token refresh error details:', error);
    yield put(refreshTokenFailure());
    return false;
  }
}

function* updateUserSaga(action: PayloadAction<Partial<User>>) {
  try {
    const response: ApiResponse<User> = yield call(
      authService.updateUserProfile,
      action.payload
    );
    
    if (response.success && response.data) {
      yield put(updateUserSuccess(response.data));
    } else {
      yield put(updateUserFailure(
        typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || 'Failed to update user profile'
      ));
    }
  } catch (error: any) {
    yield put(updateUserFailure(error.message || 'An unexpected error occurred'));
  }
}

// Calculate time until token expires (in milliseconds)
function* getTimeUntilExpiry() {
  const expiresAtStr: string | null = yield select(selectExpiresAt);
  if (!expiresAtStr) return 0;
  
  const expiryTime = new Date(expiresAtStr).getTime();
  const currentTime = new Date().getTime();
  
  return Math.max(0, expiryTime - currentTime);
}

// Saga to refresh token before it expires
// Saga to refresh token before it expires with improved throttling
function* refreshTokenWatcher() {
  let lastRefreshTime = Date.now();
  const MIN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes minimum between refreshes
  
  while (true) {
    try {
      const timeUntilExpiry: number = yield call(getTimeUntilExpiry);
      
      // Không làm mới nếu còn quá nhiều thời gian (> 45 phút)
      if (timeUntilExpiry > 45 * 60 * 1000) {
        // Chờ và kiểm tra lại sau 30 phút
        const { logout } = yield race({
          timeout: delay(30 * 60 * 1000),
          logout: take(logoutRequest.type)
        });
        
        if (logout) {
          console.log("User logged out, breaking refresh cycle");
          break;
        }
        
        continue; // Bỏ qua phần còn lại của vòng lặp và kiểm tra lại
      }
      
      // Enhanced token refresh timing - aim for 80% of lifetime
      // But ensure a minimum interval between refreshes
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTime;
      
      if (timeSinceLastRefresh < MIN_REFRESH_INTERVAL) {
        console.log(`Skipping token refresh, last refresh was ${Math.floor(timeSinceLastRefresh/1000/60)} minutes ago`);
        
        // Wait until we can refresh again
        const waitTime = MIN_REFRESH_INTERVAL - timeSinceLastRefresh;
        
        const { logout } = yield race({
          timeout: delay(waitTime),
          logout: take(logoutRequest.type)
        });
        
        if (logout) {
          console.log("User logged out, breaking refresh cycle");
          break;
        }
        
        continue;
      }
      
      // Calculate refresh timing with jitter to spread out refresh requests
      const refreshTime = Math.min(timeUntilExpiry * 0.8, 30 * 60 * 1000); // max 30 minutes
      const jitter = Math.random() * 60000; // Random delay up to 1 minute
      
      console.log(`Token will refresh in ${(refreshTime-jitter)/1000/60} minutes`);
      
      const { logout } = yield race({
        timeout: delay(refreshTime - jitter),
        logout: take(logoutRequest.type)
      });
      
      if (logout) {
        console.log("User logged out, breaking refresh cycle");
        break;
      }
      
      // Record attempt time even before we dispatch
      lastRefreshTime = Date.now();
      
      // Request refresh
      yield put(refreshTokenRequest());
      const refreshed: boolean = yield call(refreshTokenSaga);
      
      if (!refreshed) {
        console.log("Token refresh failed");
        
        // Add delay before trying again to avoid rapid retries
        yield delay(5 * 60 * 1000); // 5 minute delay on failure
        
        // Check if user logged out during the delay
        const authState = yield select(selectAuth);
        if (authState.status !== 'authenticated') {
          console.log("User is no longer authenticated, breaking refresh cycle");
          break;
        }
      }
    } catch (error) {
      console.error('Token refresh watcher error:', error);
      
      // Add delay before retrying the watcher loop on errors
      yield delay(10 * 60 * 1000); // 10 minute delay on errors
    }
  }
}

// Initialize auth state on application start
function* initAuthSaga() {
  try {
    const auth = yield select(selectAuth);
    
    // Skip if we already have a valid token and user
    if (
      auth.status === 'authenticated' && 
      auth.user && 
      auth.accessToken && 
      auth.expiresAt
    ) {
      // Start token refresh cycle
      yield fork(refreshTokenWatcher);
      return;
    }
    
    // Kiểm tra token trong localStorage trước khi gọi API
    const token: string | null = yield call(authService.getStoredToken);
    
    // Nếu không có token, không cần gọi API /auth/me
    if (!token) {
      console.log('Không có token khả dụng, bỏ qua khởi tạo xác thực');
      yield put(logoutSuccess());
      return;
    }
    
    // Chỉ gọi API lấy thông tin người dùng hiện tại nếu có token
    const response: ApiResponse<User> = yield call(authService.getCurrentUser);
    
    if (response.success && response.data) {
      const expiresAtStr = localStorage.getItem('tokenExpiresAt');
      const expiresAt = expiresAtStr 
        ? new Date(expiresAtStr).toISOString() 
        : new Date(Date.now() + 3600 * 1000).toISOString();
      
      yield put(loginSuccess({
        user: response.data,
        accessToken: token,
        expiresAt
      }));
      
      // Start token refresh cycle
      yield fork(refreshTokenWatcher);
    } else {
      // Clear any existing tokens
      yield call(authService.clearStoredToken);
      yield put(logoutSuccess());
    }
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    
    // Xác định nếu đây là lỗi mạng
    if (error instanceof Error && 
        (error.message.includes('Failed to fetch') || 
         error.message.includes('Network error'))) {
      // Xử lý lỗi mạng khác biệt - không xóa token
      yield put({
        type: 'AUTH_ERROR',
        payload: {
          error: error.message,
          status: 'network_error'
        }
      });
    } else {
      // Đối với các lỗi khác, xóa token và đăng xuất
      yield call(authService.clearStoredToken);
      yield put(logoutSuccess());
    }
  }
}

// Handle the auth initialization action
function* handleAuthInit() {
  yield call(initAuthSaga);
}

// Root auth saga
export function* authSaga() {
  // On app start, watch for initialization action
  yield takeLatest('AUTH_INIT', handleAuthInit);
  
  // Watch for auth actions
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(registerRequest.type, registerSaga);
  yield takeLatest(verifyAccountRequest.type, verifyAccountSaga);
  yield takeLatest(logoutRequest.type, logoutSaga);
  yield takeLatest(updateUserRequest.type, updateUserSaga);
}