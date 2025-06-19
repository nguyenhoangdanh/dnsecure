// src/types/auth.ts
export interface User {
  id: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
  roles: string[];
  avatarUrl?: string;
  permissions?: string[];
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  expiresAt: string | null; // ISO string for serialization
  status:
  | 'loading'
  | '2fa_needed'
  | 'unverified'
  | 'failed'
    | 'authenticated'
    | 'unauthenticated'
    | 'registration_success'
    | 'refresh_needed';
  error: string | null;
}

// Update LoginCredentials in auth.ts
export interface LoginCredentials {
  email: string;
  password: string;
  securityInfo?: {
    timestamp: string;
    deviceInfo: {
      userAgent: string;
      language: string;
      screenSize: string;
      timeZone: string;
    };
  };
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
  redirectTo?: string;
}

export interface VerifyRegistration {
  email: string;
  code: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  expiresAt: string; // ISO string
  requires2FA: boolean;
  sessionId: string
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?:
    | {
        error: string;
        message: string;
        statusCode: number;
      }
    | string;
}

export interface TwoFactorAuthData {
  tempToken: string;
  method: '2fa_app' | '2fa_sms';
}

export interface VerifyTwoFactorData {
  tempToken: string;
  code: string;
}
