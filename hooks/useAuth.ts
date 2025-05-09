// src/hooks/useAuth.ts
import { useCallback } from 'react';
import { 
  login, 
  logout, 
  register, 
  verifyAccount, 
  sendMagicLink, 
  verifyMagicLink,
  forgotPassword,
  resetPassword,
  resendVerificationCode,
  updateUser,
  refreshToken as refreshTokenAction
} from '@/redux-saga/actions/authActions';
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  VerifyRegistration,
  User
} from '@/redux-saga/types/auth';
import useAppDispatch from './useAppDispatch';
import useAppSelector from './useAppSelector';

/**
 * Hook for accessing authentication state and methods
 * 
 * @returns Authentication state and methods
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);
  
  // Login with email and password
  const loginWithCredentials = useCallback((credentials: LoginCredentials) => {
    return dispatch(login(credentials));
  }, [dispatch]);

   // Refresh token manually
   const refreshTokenManually = useCallback(() => {
    return dispatch(refreshTokenAction());
  }, [dispatch]);
  
  // Register new user
  const registerUser = useCallback((userData: RegisterCredentials) => {
    return dispatch(register(userData));
  }, [dispatch]);
  
  // Verify account with code
  const verifyUserAccount = useCallback((verificationData: VerifyRegistration) => {
    return dispatch(verifyAccount(verificationData));
  }, [dispatch]);
  
  // Logout current user
  const logoutUser = useCallback((options?: { reason?: string; allDevices?: boolean }) => {
    return dispatch(logout(options));
  }, [dispatch]);
  
  // Send magic link for passwordless login
  const sendMagicLinkEmail = useCallback((email: string) => {
    return dispatch(sendMagicLink(email));
  }, [dispatch]);
  
  // Verify magic link token
  const verifyMagicLinkToken = useCallback((token: string) => {
    return dispatch(verifyMagicLink(token));
  }, [dispatch]);
  
  // Send password reset email
  const requestPasswordReset = useCallback((email: string) => {
    return dispatch(forgotPassword(email));
  }, [dispatch]);
  
  // Reset password with token
  const resetUserPassword = useCallback((token: string, password: string, securityData?: any) => {
    return dispatch(resetPassword(token, password, securityData));
  }, [dispatch]);
  
  // Resend verification code
  const resendVerificationCodeEmail = useCallback((email: string) => {
    return dispatch(resendVerificationCode(email));
  }, [dispatch]);
  
  // Update user profile
  const updateUserProfile = useCallback((userData: Partial<User>) => {
    return dispatch(updateUser(userData));
  }, [dispatch]);
  
  return {
    // Auth state
    user: auth.user,
    status: auth.status,
    error: auth.error,
    accessToken: auth.accessToken,
    isAuthenticated: auth.status === 'authenticated',
    isLoading: auth.status === 'loading',
    
    // Auth methods
    login: loginWithCredentials,
    register: registerUser,
    verifyAccount: verifyUserAccount,
    logout: logoutUser,
    refreshToken: refreshTokenManually,
    sendMagicLink: sendMagicLinkEmail,
    verifyMagicLink: verifyMagicLinkToken,
    forgotPassword: requestPasswordReset,
    resetPassword: resetUserPassword,
    resendVerificationCode: resendVerificationCodeEmail,
    updateProfile: updateUserProfile
  };
};

export default useAuth;




// // src/hooks/useAuth.ts
// import { useCallback } from 'react';
// import { 
//   login, 
//   logout, 
//   register, 
//   verifyAccount, 
//   sendMagicLink, 
//   verifyMagicLink,
//   forgotPassword,
//   resetPassword,
//   resendVerificationCode,
//   updateUser,
//   refreshToken as refreshTokenAction
// } from '@/redux-saga/actions/authActions';
// import type { 
//   LoginCredentials, 
//   RegisterCredentials, 
//   VerifyRegistration,
//   User
// } from '@/redux-saga/types/auth';
// import useAppDispatch from './useAppDispatch';
// import useAppSelector from './useAppSelector';

// /**
//  * Hook for accessing authentication state and methods
//  * 
//  * @returns Authentication state and methods
//  */
// export const useAuth = () => {
//   const dispatch = useAppDispatch();
//   const auth = useAppSelector(state => state.auth);
  
//   // Login with email and password
//   const loginWithCredentials = useCallback((credentials: LoginCredentials) => {
//     return dispatch(login(credentials));
//   }, [dispatch]);

//    // Refresh token manually
//    const refreshTokenManually = useCallback(() => {
//     return dispatch(refreshTokenAction());
//   }, [dispatch]);
  
//   // Register new user
//   const registerUser = useCallback((userData: RegisterCredentials) => {
//     return dispatch(register(userData));
//   }, [dispatch]);
  
//   // Verify account with code
//   const verifyUserAccount = useCallback((verificationData: VerifyRegistration) => {
//     return dispatch(verifyAccount(verificationData));
//   }, [dispatch]);
  
//   // Logout current user
//   const logoutUser = useCallback(() => {
//     return dispatch(logout());
//   }, [dispatch]);
  
//   // Send magic link for passwordless login
//   const sendMagicLinkEmail = useCallback((email: string) => {
//     return dispatch(sendMagicLink(email));
//   }, [dispatch]);
  
//   // Verify magic link token
//   const verifyMagicLinkToken = useCallback((token: string) => {
//     return dispatch(verifyMagicLink(token));
//   }, [dispatch]);
  
//   // Send password reset email
//   const requestPasswordReset = useCallback((email: string) => {
//     return dispatch(forgotPassword(email));
//   }, [dispatch]);
  
//   // Reset password with token
//   const resetUserPassword = useCallback((token: string, password: string) => {
//     return dispatch(resetPassword(token, password));
//   }, [dispatch]);
  
//   // Resend verification code
//   const resendVerificationCodeEmail = useCallback((email: string) => {
//     return dispatch(resendVerificationCode(email));
//   }, [dispatch]);
  
//   // Update user profile
//   const updateUserProfile = useCallback((userData: Partial<User>) => {
//     return dispatch(updateUser(userData));
//   }, [dispatch]);
  
//   return {
//     // Auth state
//     user: auth.user,
//     status: auth.status,
//     error: auth.error,
//     accessToken: auth.accessToken,
//     isAuthenticated: auth.status === 'authenticated',
//     isLoading: auth.status === 'loading',
    
//     // Auth methods
//     login: loginWithCredentials,
//     register: registerUser,
//     verifyAccount: verifyUserAccount,
//     logout: logoutUser,
//     refreshToken: refreshTokenManually,
//     sendMagicLink: sendMagicLinkEmail,
//     verifyMagicLink: verifyMagicLinkToken,
//     forgotPassword: requestPasswordReset,
//     resetPassword: resetUserPassword,
//     resendVerificationCode: resendVerificationCodeEmail,
//     updateProfile: updateUserProfile
//   };
// };

// export default useAuth;