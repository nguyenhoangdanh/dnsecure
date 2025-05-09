"use client"

import { AuthInitializer } from '@/components/monitoring/AuthInitializer';
import { TokenRefreshOnActivity } from '@/components/monitoring/TokenRefreshOnActivity';
import { NetworkStatusIndicator } from '@/components/monitoring/NetworkStatusIndicator';
import { initAuth } from '@/redux-saga/actions/authActions';
import { persistor, store } from '@/redux-saga/store';
import React, { useCallback, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import ErrorBoundary from './ErrorBoundary';
import { healthCoordinator } from '@/lib/utils/HealthCoordinator';
import NetworkStatusProvider from './NetworkStatusProvider';
import { LoadingSpinner } from '@/components/loading';

/**
 * Enhanced Provider component that wraps the application with Redux store,
 * initializes authentication state with error handling, and provides network
 * recovery capabilities.
 */
export const ReduxAuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    // Function to safely initialize auth
    // const safeInitAuth = useCallback(() => {
    //     try {
    //         // Kiểm tra xem có token trong store không trước khi khởi tạo auth
    //         const authState = store.getState().auth;

    //         if (authState.accessToken) {
    //             console.log('Tìm thấy token hiện có, khởi tạo xác thực');
    //             // Chỉ khởi tạo auth khi có token
    //             store.dispatch(initAuth());
    //         } else {
    //             console.log('Không có token hiện có, bỏ qua khởi tạo auth');
    //             // Vẫn đánh dấu là đã khởi tạo để ngăn màn hình loading
    //         }

    //         setIsInitialized(true);

    //         // Khởi động health coordinator với tần suất thấp hơn
    //         healthCoordinator.setMinimumInterval(15000); // 15 giây tối thiểu giữa các lần kiểm tra
    //         healthCoordinator.startPeriodicChecks(60000); // 60 giây giữa các lần kiểm tra định kỳ
    //     } catch (error) {
    //         console.error('Lỗi khởi tạo auth:', error);
    //         setInitError(error instanceof Error ? error.message : 'Lỗi khởi tạo không xác định');
    //         setIsInitialized(true);
    //     }
    // }, []);

    const safeInitAuth = useCallback(() => {
        try {
            // Kiểm tra thời gian từ lần khởi tạo cuối để tránh gọi lại quá nhanh
            const lastInitTime = localStorage.getItem('lastAuthInitTime');
            const now = Date.now();

            if (lastInitTime) {
                const timeSinceInit = now - parseInt(lastInitTime);
                const MIN_INIT_INTERVAL = 60 * 1000; // 1 phút

                if (timeSinceInit < MIN_INIT_INTERVAL) {
                    console.log(`Auth init throttled - last init was ${Math.floor(timeSinceInit / 1000)}s ago`);
                    setIsInitialized(true);
                    return;
                }
            }

            // Lưu thời gian khởi tạo hiện tại
            localStorage.setItem('lastAuthInitTime', now.toString());

            // Kiểm tra xem có token trong store không trước khi khởi tạo auth
            const authState = store.getState().auth;

            if (authState.accessToken) {
                console.log('Tìm thấy token hiện có, khởi tạo xác thực');
                // Chỉ khởi tạo auth khi có token
                store.dispatch(initAuth());
            } else {
                console.log('Không có token hiện có, bỏ qua khởi tạo auth');
                // Vẫn đánh dấu là đã khởi tạo để ngăn màn hình loading
            }

            setIsInitialized(true);

            // Khởi động health coordinator với tần suất thấp hơn
            healthCoordinator.setMinimumInterval(60000); // 60 giây tối thiểu giữa các lần kiểm tra (tăng từ 15s)
            healthCoordinator.startPeriodicChecks(180000); // 3 phút giữa các lần kiểm tra định kỳ (tăng từ 60s)
        } catch (error) {
            console.error('Lỗi khởi tạo auth:', error);
            setInitError(error instanceof Error ? error.message : 'Lỗi khởi tạo không xác định');
            setIsInitialized(true);
        }
    }, []);

    // Khởi tạo auth khi component được mount
    useEffect(() => {
        // Trì hoãn nhỏ trước khi khởi tạo
        setTimeout(() => {
            safeInitAuth();
        }, 100);

        // Dọn dẹp health coordinator khi unmount
        return () => {
            healthCoordinator.stopPeriodicChecks();
        };
    }, [safeInitAuth]);

    // Xử lý sự kiện online của window
    useEffect(() => {
        const handleOnline = () => {
            console.log('Trình duyệt báo cáo trạng thái online');

            // Khi trở lại online, thử làm mới trạng thái auth nhưng có độ trễ dài hơn nhiều
            if (isInitialized) {
                // Đợi mạng ổn định với độ trễ dài hơn
                setTimeout(() => {
                    try {
                        setInitError(null); // Xóa mọi lỗi trước đó

                        // Kiểm tra thời gian từ lần khởi tạo cuối
                        const lastInitTime = localStorage.getItem('lastAuthInitTime');
                        const now = Date.now();

                        if (lastInitTime) {
                            const timeSinceInit = now - parseInt(lastInitTime);
                            const MIN_INIT_INTERVAL = 5 * 60 * 1000; // 5 phút

                            if (timeSinceInit < MIN_INIT_INTERVAL) {
                                console.log(`Online auth check throttled - last init was ${Math.floor(timeSinceInit / 1000)}s ago`);
                                return;
                            }
                        }

                        // Trước tiên kiểm tra kết nối mạng với độ trễ
                        setTimeout(async () => {
                            const isOnline = await healthCoordinator.forceCheck();
                            if (isOnline) {
                                // Chỉ khởi tạo auth nếu đã có token và đã trôi qua đủ thời gian
                                const authState = store.getState().auth;
                                if (authState.accessToken) {
                                    // Lưu thời gian khởi tạo hiện tại
                                    localStorage.setItem('lastAuthInitTime', Date.now().toString());
                                    store.dispatch(initAuth());
                                }
                            }
                        }, 10000); // Tăng độ trễ từ 2s lên 10s
                    } catch (error) {
                        console.error('Lỗi khi khởi tạo lại auth khi online:', error);
                    }
                }, 30000); // Tăng độ trễ từ 3s lên 30s
            }
        };

        window.addEventListener('online', handleOnline);
        return () => {
            window.removeEventListener('online', handleOnline);
        };
    }, [isInitialized]);

    // Hiển thị chỉ báo tải trong khi khởi tạo
    if (!isInitialized) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex justify-center items-center flex-col">
                    <LoadingSpinner size="lg" variant="success" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Đang khởi tạo ứng dụng...</p>
                </div>
            </div>
        );
    }

    // Hiển thị lỗi nếu có
    if (initError) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Lỗi ứng dụng</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {initError}
                    </p>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => {
                            setInitError(null);
                            safeInitAuth();
                        }}
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // Lấy trạng thái auth từ store để kiểm tra xem có đăng nhập hay không
    const authState = store.getState().auth;
    const isAuthenticated = authState.status === 'authenticated' && !!authState.accessToken;

    // Render bình thường với Provider Redux và chỉ báo trạng thái mạng
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <ErrorBoundary>
                    <NetworkStatusProvider checkInterval={60000} retryStrategy="exponential">
                        {/* Component này khởi tạo trạng thái auth - được tối ưu hóa */}
                        <AuthInitializer />

                        {/* Component này làm mới token khi người dùng hoạt động - chỉ khi đã xác thực */}
                        {isAuthenticated && <TokenRefreshOnActivity />}

                        {/* Chỉ báo trạng thái mạng - thay thế nhiều thành phần giám sát */}
                        <NetworkStatusIndicator
                            position="bottom-right"
                            autoHideDelay={5000}
                        />

                        {/* Render ứng dụng */}
                        {children}
                    </NetworkStatusProvider>
                </ErrorBoundary>
            </PersistGate>
        </Provider >
    );
};

export default ReduxAuthProvider;

// "use client"
// import { TokenRefreshOnActivity } from '@/components/monitoring/TokenRefreshOnActivity';
// import { AuthInitializer } from '@/components/monitoring/AuthInitializer';
// import { initAuth } from '@/redux-saga/actions/authActions';
// import { persistor, store } from '@/redux-saga/store';
// import React, { useEffect } from 'react';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
// import { NetworkStatusMonitor } from '@/components/monitoring/NetworkStatusMonitor';

// /**
//  * Provider component that wraps the application with Redux store
//  * and initializes authentication state
//  */
// export const ReduxAuthProvider: React.FC<{ children: React.ReactNode }> = ({
//     children
// }) => {
//     useEffect(() => {
//         // Initialize auth state on mount
//         store.dispatch(initAuth());
//     }, []);

//     return (
//         <Provider store={store}>
//             <PersistGate loading={null} persistor={persistor}>
//                 <AuthInitializer />
//                 <TokenRefreshOnActivity />
//                 {/* Add the network monitor */}
//                 <NetworkStatusMonitor
//                     pollingInterval={60000}
//                     onStatusChange={(isOnline) => {
//                         // Optional callback for status changes
//                         console.log('Network status changed:', isOnline);
//                     }}
//                 />
//                 {children}
//             </PersistGate>
//         </Provider>
//     );
// };

// export default ReduxAuthProvider;