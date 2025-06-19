// src/services/twoFactorService.ts
import { api } from '../api/api-client';
import { ApiResponse } from '../types/auth';

// Định nghĩa các kiểu dữ liệu response
interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUrl: string;
}

interface VerifyResponse {
  success: boolean;
  message: string;
}

interface BackupCodesResponse {
  backupCodes: string[];
}

interface TwoFactorStatusResponse {
  enabled: boolean;
}

interface VerifyLoginResponse {
  success: boolean;
  user: any;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Service để quản lý tất cả các API calls liên quan đến xác thực hai yếu tố
 */
export const twoFactorService = {
  /**
   * Khởi tạo thiết lập 2FA
   */
  enableTwoFactor: async (): Promise<ApiResponse<TwoFactorSetupResponse>> => {
    return api.post<TwoFactorSetupResponse>('/two-factor/enable', {});
  },

  /**
   * Xác minh và kích hoạt 2FA
   */
  verifyTwoFactor: async (token: string): Promise<ApiResponse<VerifyResponse>> => {
    return api.post<VerifyResponse>('/two-factor/verify', { token });
  },

  /**
   * Vô hiệu hóa 2FA
   */
  disableTwoFactor: async (password: string): Promise<ApiResponse<VerifyResponse>> => {
    return api.post<VerifyResponse>('/two-factor/disable', { password });
  },

  /**
   * Lấy mã dự phòng
   */
  getBackupCodes: async (): Promise<ApiResponse<BackupCodesResponse>> => {
    return api.get<BackupCodesResponse>('/two-factor/backup-codes');
  },

  /**
   * Tạo lại mã dự phòng
   */
  regenerateBackupCodes: async (): Promise<ApiResponse<BackupCodesResponse>> => {
    return api.post<BackupCodesResponse>('/two-factor/regenerate-backup-codes', {});
  },

  /**
   * Kiểm tra trạng thái 2FA
   */
  checkTwoFactorStatus: async (): Promise<ApiResponse<TwoFactorStatusResponse>> => {
    return api.get<TwoFactorStatusResponse>('/two-factor/status');
  },

  /**
   * Xác minh 2FA trong quá trình đăng nhập
   */
  verifyLoginTwoFactor: async (token: string, sessionId: string): Promise<ApiResponse<VerifyLoginResponse>> => {
    return api.post<VerifyLoginResponse>('/auth/2fa/verify', { token, sessionId });
  }
};