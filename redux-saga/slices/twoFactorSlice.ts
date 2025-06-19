// src/redux/slices/twoFactorSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TwoFactorState {
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  qrCodeUrl: string | null;
  secret: string | null;
  backupCodes: string[];
  sessionId: string | null;
  requires2FA: boolean;
}

const initialState: TwoFactorState = {
  isEnabled: false,
  isLoading: false,
  error: null,
  qrCodeUrl: null,
  secret: null,
  backupCodes: [],
  sessionId: null,
  requires2FA: false
};

const twoFactorSlice = createSlice({
  name: 'twoFactor',
  initialState,
  reducers: {
    // Setup 2FA
    enableTwoFactorRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    enableTwoFactorSuccess: (state, action: PayloadAction<{ secret: string, qrCodeUrl: string }>) => {
      state.isLoading = false;
      state.secret = action.payload.secret;
      state.qrCodeUrl = action.payload.qrCodeUrl;
    },
    enableTwoFactorFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Verify and activate 2FA
    verifyTwoFactorRequest: (state, action: PayloadAction<{ token: string }>) => {
      state.isLoading = true;
      state.error = null;
    },
    verifyTwoFactorSuccess: (state) => {
      state.isLoading = false;
      state.isEnabled = true;
    },
    verifyTwoFactorFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Disable 2FA
    disableTwoFactorRequest: (state, action: PayloadAction<{ password: string }>) => {
      state.isLoading = true;
      state.error = null;
    },
    disableTwoFactorSuccess: (state) => {
      state.isLoading = false;
      state.isEnabled = false;
      state.qrCodeUrl = null;
      state.secret = null;
      state.backupCodes = [];
    },
    disableTwoFactorFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Get backup codes
    getBackupCodesRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getBackupCodesSuccess: (state, action: PayloadAction<string[]>) => {
      state.isLoading = false;
      state.backupCodes = action.payload;
    },
    getBackupCodesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Regenerate backup codes
    regenerateBackupCodesRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    regenerateBackupCodesSuccess: (state, action: PayloadAction<string[]>) => {
      state.isLoading = false;
      state.backupCodes = action.payload;
    },
    regenerateBackupCodesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Check 2FA status
    checkTwoFactorStatusRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    checkTwoFactorStatusSuccess: (state, action: PayloadAction<boolean>) => {
      state.isLoading = false;
      state.isEnabled = action.payload;
    },
    checkTwoFactorStatusFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Handle 2FA during login
    setRequires2FA: (state, action: PayloadAction<{ sessionId: string }>) => {
      state.requires2FA = true;
      state.sessionId = action.payload.sessionId;
      // Ghi log cho debugging
      console.log(`2FA required, sessionId set to: ${action.payload.sessionId}`);
    },

    // Verify 2FA during login
    verifyLoginTwoFactorRequest: (state, action: PayloadAction<{ token: string, sessionId: string }>) => {
      state.isLoading = true;
      state.error = null;
    },
    verifyLoginTwoFactorSuccess: (state) => {
      state.isLoading = false;
      state.requires2FA = false;
      state.sessionId = null;
    },
    verifyLoginTwoFactorFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Reset 2FA state
    resetTwoFactorState: (state) => {
      return initialState;
    }
  }
});

export const {
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
  setRequires2FA,
  verifyLoginTwoFactorRequest,
  verifyLoginTwoFactorSuccess,
  verifyLoginTwoFactorFailure,
  resetTwoFactorState
} = twoFactorSlice.actions;

export default twoFactorSlice.reducer;