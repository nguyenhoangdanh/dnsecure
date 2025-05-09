// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

import authReducer from './slices/authSlice';
import rootSaga from './sagas/rootSaga';

// Middleware cho rate limiting
const authRateLimitingMiddleware = (store) => (next) => {
  // Theo dõi số lượng request theo loại action
  const requestCounts = new Map();
  const lastActionTimes = new Map();
  
  // Định nghĩa giới hạn cho các loại action
  const limitsByType = {
    'refreshTokenRequest': { maxRequests: 1, windowMs: 60000 }, // 1 request/phút
    'AUTH_INIT': { maxRequests: 1, windowMs: 60000 }, // 1 request/phút
  };
  
  return (action) => {
    // Chỉ xử lý các action liên quan đến auth
    if (action.type.includes('Token') || action.type.includes('AUTH')) {
      const now = Date.now();
      
      // Lấy giới hạn cho action này
      const limits = limitsByType[action.type] || { maxRequests: 3, windowMs: 60000 };
      
      // Cập nhật thời gian và số lượng
      const lastTime = lastActionTimes.get(action.type) || 0;
      let count = requestCounts.get(action.type) || 0;
      
      // Reset counter nếu window time đã trôi qua
      if (now - lastTime > limits.windowMs) {
        count = 0;
      }
      
      // Tăng counter
      count++;
      requestCounts.set(action.type, count);
      lastActionTimes.set(action.type, now);
      
      // Kiểm tra giới hạn
      if (count > limits.maxRequests) {
        console.warn(`Rate limited ${action.type} - too many requests in time window`);
        
        // Thay thế với action thông báo
        return next({
          type: 'AUTH_RATE_LIMITED',
          payload: {
            originalType: action.type,
            message: 'Too many authentication requests. Please try again later.'
          }
        });
      }
    }
    
    return next(action);
  };
};

// Define root reducer with TypeScript
const rootReducer = combineReducers({
  auth: authReducer,
  // Add more reducers here
});

// Define RootState type
export type RootState = ReturnType<typeof rootReducer>;

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // only persist auth
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const sagaMiddleware = createSagaMiddleware();

// Configure store with TypeScript
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
    .concat(sagaMiddleware)
    .concat(authRateLimitingMiddleware),
});

// Define AppDispatch type
export type AppDispatch = typeof store.dispatch;

sagaMiddleware.run(rootSaga);
export const persistor = persistStore(store);