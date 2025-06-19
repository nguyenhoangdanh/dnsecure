// utils/api-error-handler.ts
import { getErrorMessage, isAuthError, isNetworkError, logError } from './error-handler';
import { store } from '@/redux-saga/store';
import { logout } from '@/redux-saga/actions/authActions';

/**
 * Các loại lỗi API mà ứng dụng có thể gặp phải
 */
export enum ApiErrorType {
  AUTH_ERROR = 'AUTH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Xác định loại lỗi dựa trên mã trạng thái hoặc thông báo
 */
export function getApiErrorType(error: unknown): ApiErrorType {
  if (!error) return ApiErrorType.UNKNOWN_ERROR;

    // Handle empty objects
    if (typeof error === 'object' && Object.keys(error as object).length === 0) {
      return ApiErrorType.UNKNOWN_ERROR;
    }
  
  // Xử lý trường hợp đối tượng lỗi
  if (typeof error === 'object') {
    const errorObj = error as any;
    
    // Kiểm tra mã trạng thái
    if (errorObj.statusCode === 401 || errorObj.status === 401) {
      return ApiErrorType.AUTH_ERROR;
    }
    
    if (errorObj.statusCode === 400 || errorObj.status === 400) {
      return ApiErrorType.VALIDATION_ERROR;
    }
    
    if (errorObj.statusCode === 429 || errorObj.status === 429) {
      return ApiErrorType.RATE_LIMIT_ERROR;
    }
    
    if (errorObj.statusCode >= 500 || (errorObj.status && errorObj.status >= 500)) {
      return ApiErrorType.SERVER_ERROR;
    }
  }
  
  // Kiểm tra thông báo lỗi cho các trường hợp không có mã trạng thái
  if (isAuthError(error)) {
    return ApiErrorType.AUTH_ERROR;
  }
  
  if (isNetworkError(error)) {
    return ApiErrorType.NETWORK_ERROR;
  }
  
  // Kiểm tra các từ khóa trong thông báo lỗi
  const errorMessage = getErrorMessage(error, '').toLowerCase();
  
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return ApiErrorType.RATE_LIMIT_ERROR;
  }
  
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return ApiErrorType.VALIDATION_ERROR;
  }
  
  if (errorMessage.includes('server error') || errorMessage.includes('internal error')) {
    return ApiErrorType.SERVER_ERROR;
  }
  
  return ApiErrorType.UNKNOWN_ERROR;
}

/**
 * Xử lý lỗi API theo loại
 * @param error Đối tượng lỗi từ API
 * @param context Bối cảnh lỗi (tên component hoặc hàm)
 * @param options Tùy chọn bổ sung
 * @returns Thông báo lỗi đã xử lý
 */
export function handleApiError(
  error: unknown, 
  context: string,
  options: {
    showGenericMessage?: boolean;
    logError?: boolean;
    logoutOnAuthError?: boolean;
    defaultMessage?: string;
  } = {}
): string {
  const { 
    showGenericMessage = false, 
    logError: shouldLogError = true,
    logoutOnAuthError = true,
    defaultMessage = "Đã xảy ra lỗi khi kết nối đến máy chủ"
  } = options;
  
  // Ghi log lỗi
  if (shouldLogError) {
    logError(context, error);
  }
  
  // Xác định loại lỗi
  const errorType = getApiErrorType(error);
  
  // Xử lý theo loại lỗi
  switch (errorType) {
    case ApiErrorType.AUTH_ERROR:
      // Đăng xuất khi có lỗi xác thực (trừ khi bị vô hiệu hóa)
      if (logoutOnAuthError) {
        setTimeout(() => {
          // Sử dụng timeout để tránh xung đột với vòng đời hiện tại
          store.dispatch(logout());
        }, 0);
      }
      return showGenericMessage 
        ? "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại."
        : getErrorMessage(error, "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.");
      
    case ApiErrorType.NETWORK_ERROR:
      return showGenericMessage
        ? "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn."
        : getErrorMessage(error, "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn.");
      
    case ApiErrorType.VALIDATION_ERROR:
      return showGenericMessage
        ? "Thông tin nhập không hợp lệ. Vui lòng kiểm tra lại."
        : getErrorMessage(error, "Thông tin nhập không hợp lệ. Vui lòng kiểm tra lại.");
      
    case ApiErrorType.RATE_LIMIT_ERROR:
      return showGenericMessage
        ? "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau."
        : getErrorMessage(error, "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.");
      
    case ApiErrorType.SERVER_ERROR:
      return showGenericMessage
        ? "Máy chủ gặp sự cố. Vui lòng thử lại sau."
        : getErrorMessage(error, "Máy chủ gặp sự cố. Vui lòng thử lại sau.");
      
    case ApiErrorType.UNKNOWN_ERROR:
    default:
      return showGenericMessage
        ? defaultMessage
        : getErrorMessage(error, defaultMessage);
  }
}

/**
 * Xử lý lỗi API cho form, tự động xử lý các trường hợp đặc biệt
 * @param error Đối tượng lỗi từ API
 * @param context Bối cảnh lỗi (tên component form)
 * @param setError Hàm đặt lỗi trong form
 * @param options Tùy chọn bổ sung
 */
export function handleFormApiError(
  error: unknown,
  context: string,
  setError: (error: string | null) => void,
  options: {
    showGenericMessage?: boolean;
    logError?: boolean;
    logoutOnAuthError?: boolean;
    defaultMessage?: string;
    onAuthError?: () => void;
  } = {}
): void {
  const { 
    onAuthError,
    ...restOptions
  } = options;
  
  // Xác định loại lỗi
  const errorType = getApiErrorType(error);
  
  // Kiểm tra nếu là lỗi xác thực và có callback xử lý
  if (errorType === ApiErrorType.AUTH_ERROR && onAuthError) {
    onAuthError();
    return;
  }
  
  // Xử lý lỗi và đặt thông báo
  const errorMessage = handleApiError(error, context, restOptions);
  setError(errorMessage);
}

export default {
  getApiErrorType,
  handleApiError,
  handleFormApiError
};