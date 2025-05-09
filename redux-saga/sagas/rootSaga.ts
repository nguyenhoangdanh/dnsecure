// src/store/sagas/rootSaga.ts
import { all, fork } from 'redux-saga/effects';
import { authSaga } from './authSaga';
import { apiSaga } from './apiSaga';
import { magicLinkSaga } from './magicLinkSaga';
import { passwordResetSaga } from './passwordResetSaga';
import { verificationCodeSaga } from './resendVerificationCodeSaga';

/**
 * Root saga that combines all sagas in the application
 */
export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(apiSaga),
    fork(magicLinkSaga),
    fork(passwordResetSaga),
    fork(verificationCodeSaga)
  ]);
}