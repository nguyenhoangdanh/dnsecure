"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { useAppSelector } from '@/hooks';
import { NetworkErrorType } from '@/lib/utils/network-error-handler';

interface NetworkStatusIndicatorProps {
    showWhenOnline?: boolean;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    autoHideDelay?: number | null;
    onStatusChange?: (isOnline: boolean) => void;
    showDetails?: boolean;
}

/**
 * Enhanced component to display network status and API connectivity
 * with improved error type handling
 */
export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
    showWhenOnline = false,
    position = 'bottom-right',
    autoHideDelay = 5000, // Auto-hide after 5 seconds when we come back online
    onStatusChange,
    showDetails = false
}) => {
    const [visible, setVisible] = useState<boolean>(false);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastStatusRef = useRef<{ isOnline: boolean, isApiReachable: boolean, errorType: NetworkErrorType | null }>({
        isOnline: true,
        isApiReachable: true,
        errorType: null
    });
    const authState = useAppSelector(state => state.auth);
    const isAuthenticated = authState.status === 'authenticated' && !!authState.accessToken;

    // Use the enhanced network status hook with error typing
    const {
        isOnline,
        isApiReachable,
        isChecking,
        networkErrorType,
        consecutiveFailures,
        checkNow,
        resetStatus
    } = useNetworkStatus({
        notifyOnReconnect: true,
        checkOnMount: isAuthenticated, // Only check on mount if authenticated
        checkInterval: isAuthenticated ? 60000 : null, // 60 seconds between checks, only if authenticated
        retryStrategy: 'exponential',
        maxRetries: 5
    });

    // Get appropriate error message based on network error type
    const errorMessage = useMemo(() => {
        if (!isOnline) {
            return 'You are offline. Check your internet connection.';
        }

        if (!isApiReachable) {
            switch (networkErrorType) {
                case NetworkErrorType.TIMEOUT:
                    return 'Connection timed out. The server is taking too long to respond.';
                case NetworkErrorType.SERVER_ERROR:
                    return 'Unable to connect to the API server. The service may be down.';
                case NetworkErrorType.AUTHENTICATION_ERROR:
                    return 'Authentication error. Your session may have expired.';
                case NetworkErrorType.FORBIDDEN:
                    return 'Access denied. You do not have permission to access this resource.';
                default:
                    return 'API server is unreachable. Please try again later.';
            }
        }

        return null;
    }, [isOnline, isApiReachable, networkErrorType]);

    // Handle visibility changes without causing render loops
    useEffect(() => {
        // Store current status in ref to track changes
        const status = { isOnline, isApiReachable, errorType: networkErrorType };
        const prevStatus = lastStatusRef.current;
        lastStatusRef.current = status;

        // Compare with previous status to avoid unnecessary state updates
        const statusChanged =
            prevStatus.isOnline !== status.isOnline ||
            prevStatus.isApiReachable !== status.isApiReachable ||
            prevStatus.errorType !== status.errorType;

        // Only make changes when status actually changes
        if (!statusChanged) {
            return;
        }

        // Always show if offline or API unreachable
        if (!isOnline || !isApiReachable) {
            setVisible(true);

            // Notify parent component if callback provided
            if (onStatusChange) {
                onStatusChange(false);
            }

            // Clear any existing hide timeout
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }
        } else {
            // Notify parent component if callback provided
            if (onStatusChange) {
                onStatusChange(true);
            }

            // If we're online, either hide immediately or after a delay
            if (!showWhenOnline) {
                if (autoHideDelay === null) {
                    // Hide immediately
                    setVisible(false);
                } else {
                    // Set timeout to hide after delay (avoid creating multiple timeouts)
                    if (hideTimeoutRef.current) {
                        clearTimeout(hideTimeoutRef.current);
                    }

                    hideTimeoutRef.current = setTimeout(() => {
                        setVisible(false);
                        hideTimeoutRef.current = null;
                    }, autoHideDelay);
                }
            } else {
                // Always show when online if showWhenOnline is true
                setVisible(true);
            }
        }
    }, [isOnline, isApiReachable, showWhenOnline, autoHideDelay, onStatusChange, networkErrorType]);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, []);

    // Determine position classes
    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4'
    }[position];

    // If not showing, don't render
    if (!visible) {
        return null;
    }

    // Auth-specific message for authenticated users
    const getAuthSpecificMessage = () => {
        if (isAuthenticated && !isApiReachable && isOnline) {
            if (networkErrorType === NetworkErrorType.AUTHENTICATION_ERROR) {
                return "Authentication issue detected. Your session may need to be refreshed.";
            }
            return "Cannot connect to authentication server. Your session may be affected.";
        }
        return null;
    };

    const authMessage = getAuthSpecificMessage();

    // Determine appropriate status colors
    const getStatusColors = () => {
        if (isOnline && isApiReachable) {
            return {
                bg: 'bg-green-50 dark:bg-green-900/20',
                border: 'border-green-200 dark:border-green-800',
                text: 'text-green-700 dark:text-green-300',
                dot: 'bg-green-500'
            };
        }

        if (!isOnline) {
            return {
                bg: 'bg-red-50 dark:bg-red-900/20',
                border: 'border-red-200 dark:border-red-800',
                text: 'text-red-700 dark:text-red-300',
                dot: 'bg-red-500'
            };
        }

        // API unreachable but browser is online
        if (networkErrorType === NetworkErrorType.TIMEOUT) {
            return {
                bg: 'bg-orange-50 dark:bg-orange-900/20',
                border: 'border-orange-200 dark:border-orange-800',
                text: 'text-orange-700 dark:text-orange-300',
                dot: 'bg-orange-500'
            };
        }

        if (networkErrorType === NetworkErrorType.AUTHENTICATION_ERROR) {
            return {
                bg: 'bg-purple-50 dark:bg-purple-900/20',
                border: 'border-purple-200 dark:border-purple-800',
                text: 'text-purple-700 dark:text-purple-300',
                dot: 'bg-purple-500'
            };
        }

        // Default error state
        return {
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
            text: 'text-red-700 dark:text-red-300',
            dot: 'bg-red-500'
        };
    };

    const colors = getStatusColors();

    return (
        <div
            className={`fixed ${positionClasses} z-50 transition-all duration-300 ease-in-out transform opacity-100 translate-y-0`}
        >
            <div className={`px-3 py-2 rounded-lg shadow-md flex items-center space-x-2 text-sm ${colors.bg} ${colors.text} border ${colors.border}`}>
                {/* Status dot indicator */}
                <div className={`h-2 w-2 rounded-full ${isChecking ? 'bg-yellow-500 animate-pulse' : colors.dot}`}></div>

                {/* Status text */}
                <div>
                    <span>
                        {!isOnline
                            ? 'You are offline'
                            : !isApiReachable
                                ? 'API server unreachable'
                                : 'Connected'}
                    </span>

                    {/* Error message if available */}
                    {errorMessage && !isOnline && (
                        <p className="text-xs mt-1">{errorMessage}</p>
                    )}

                    {/* Show auth-specific message if available */}
                    {authMessage && (
                        <p className="text-xs mt-1">{authMessage}</p>
                    )}

                    {/* Show detailed status if enabled */}
                    {showDetails && (
                        <div className="text-xs mt-1 opacity-75">
                            <p>Consecutive failures: {consecutiveFailures}</p>
                            <p>Error type: {networkErrorType || 'None'}</p>
                        </div>
                    )}
                </div>

                {/* Retry button */}
                {(!isOnline || !isApiReachable) && (
                    <button
                        onClick={() => {
                            resetStatus(); // Reset failure count
                            checkNow(); // Force immediate check
                        }}
                        disabled={isChecking}
                        className={`ml-2 px-2 py-0.5 text-xs rounded-md ${isChecking
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : `${colors.bg} hover:bg-opacity-80 ${colors.text}`
                            }`}
                    >
                        {isChecking ? 'Checking...' : 'Retry'}
                    </button>
                )}

                {/* Close button - always show */}
                <button
                    onClick={() => setVisible(false)}
                    className="ml-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    aria-label="Dismiss"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default NetworkStatusIndicator;


// "use client"

// import React, { useState, useEffect, useRef } from 'react';
// import useNetworkStatus from '@/hooks/useNetworkStatus';
// import { useAppSelector } from '@/hooks';

// interface NetworkStatusIndicatorProps {
//     showWhenOnline?: boolean;
//     position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
//     autoHideDelay?: number | null;
//     onStatusChange?: (isOnline: boolean) => void;
// }

// /**
//  * Component để hiển thị trạng thái mạng và kết nối API
//  * Cải tiến với hàng đợi thông báo
//  */
// export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
//     showWhenOnline = false,
//     position = 'bottom-right',
//     autoHideDelay = 5000, // Tự động ẩn sau 5 giây khi chúng ta trở lại online
//     onStatusChange
// }) => {
//     const [visible, setVisible] = useState<boolean>(false);
//     const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//     const lastStatusRef = useRef<{ isOnline: boolean, isApiReachable: boolean }>({
//         isOnline: true,
//         isApiReachable: true
//     });
//     const authState = useAppSelector(state => state.auth);
//     const isAuthenticated = authState.status === 'authenticated' && !!authState.accessToken;

//     // Tần suất kiểm tra mạng giảm
//     const { isOnline, isApiReachable, isChecking, checkNow } = useNetworkStatus({
//         notifyOnReconnect: true,
//         checkOnMount: isAuthenticated, // Chỉ kiểm tra khi mount nếu đã xác thực
//         checkInterval: isAuthenticated ? 60000 : null // 60 giây - tần suất giảm, chỉ khi đã xác thực
//     });

//     // Xử lý thay đổi visibility mà không gây ra vòng lặp render
//     useEffect(() => {
//         // Lưu trữ trạng thái hiện tại trong ref để theo dõi thay đổi
//         const status = { isOnline, isApiReachable };
//         const prevStatus = lastStatusRef.current;
//         lastStatusRef.current = status;

//         // So sánh với trạng thái trước đó để tránh cập nhật trạng thái không cần thiết
//         const statusChanged =
//             prevStatus.isOnline !== status.isOnline ||
//             prevStatus.isApiReachable !== status.isApiReachable;

//         // Chỉ thực hiện thay đổi khi trạng thái thực sự thay đổi
//         if (!statusChanged) {
//             return;
//         }

//         // Luôn hiển thị nếu offline hoặc API không thể truy cập
//         if (!isOnline || !isApiReachable) {
//             setVisible(true);

//             // Thông báo cho component cha nếu callback được cung cấp
//             if (onStatusChange) {
//                 onStatusChange(false);
//             }

//             // Xóa bất kỳ timeout ẩn nào đang tồn tại
//             if (hideTimeoutRef.current) {
//                 clearTimeout(hideTimeoutRef.current);
//                 hideTimeoutRef.current = null;
//             }
//         } else {
//             // Thông báo cho component cha nếu callback được cung cấp
//             if (onStatusChange) {
//                 onStatusChange(true);
//             }

//             // Nếu chúng ta online, hoặc ẩn ngay lập tức hoặc sau một độ trễ
//             if (!showWhenOnline) {
//                 if (autoHideDelay === null) {
//                     // Ẩn ngay lập tức
//                     setVisible(false);
//                 } else {
//                     // Đặt timeout để ẩn sau độ trễ (tránh tạo nhiều timeout)
//                     if (hideTimeoutRef.current) {
//                         clearTimeout(hideTimeoutRef.current);
//                     }

//                     hideTimeoutRef.current = setTimeout(() => {
//                         setVisible(false);
//                         hideTimeoutRef.current = null;
//                     }, autoHideDelay);
//                 }
//             } else {
//                 // Luôn hiển thị khi online nếu showWhenOnline là true
//                 setVisible(true);
//             }
//         }
//     }, [isOnline, isApiReachable, showWhenOnline, autoHideDelay, onStatusChange]);

//     // Dọn dẹp timeout khi unmount
//     useEffect(() => {
//         return () => {
//             if (hideTimeoutRef.current) {
//                 clearTimeout(hideTimeoutRef.current);
//             }
//         };
//     }, []);

//     // Xác định các class vị trí
//     const positionClasses = {
//         'top-right': 'top-4 right-4',
//         'top-left': 'top-4 left-4',
//         'bottom-right': 'bottom-4 right-4',
//         'bottom-left': 'bottom-4 left-4'
//     }[position];

//     // Nếu không hiển thị, không render
//     if (!visible) {
//         return null;
//     }

//     // Thông báo dành riêng cho người dùng đã xác thực
//     const getAuthSpecificMessage = () => {
//         if (isAuthenticated && !isApiReachable && isOnline) {
//             return "Không thể kết nối đến máy chủ xác thực. Phiên đăng nhập của bạn có thể bị ảnh hưởng.";
//         }
//         return null;
//     };

//     const authMessage = getAuthSpecificMessage();

//     return (
//         <div
//             className={`fixed ${positionClasses} z-50 transition-all duration-300 ease-in-out transform opacity-100 translate-y-0`}
//         >
//             <div className={`px-3 py-2 rounded-lg shadow-md flex items-center space-x-2 text-sm ${isOnline && isApiReachable
//                 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
//                 : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
//                 }`}>
//                 {/* Chỉ báo trạng thái dạng chấm */}
//                 <div className={`h-2 w-2 rounded-full ${isChecking
//                     ? 'bg-yellow-500 animate-pulse'
//                     : isOnline && isApiReachable
//                         ? 'bg-green-500'
//                         : 'bg-red-500'
//                     }`}></div>

//                 {/* Văn bản trạng thái */}
//                 <div>
//                     <span>
//                         {!isOnline
//                             ? 'Bạn đang offline'
//                             : !isApiReachable
//                                 ? 'Máy chủ API không thể truy cập'
//                                 : 'Đã kết nối'}
//                     </span>

//                     {/* Hiển thị thông báo riêng cho người dùng đã xác thực nếu có */}
//                     {authMessage && (
//                         <p className="text-xs mt-1">{authMessage}</p>
//                     )}
//                 </div>

//                 {/* Nút thử lại */}
//                 {(!isOnline || !isApiReachable) && (
//                     <button
//                         onClick={() => checkNow()}
//                         disabled={isChecking}
//                         className={`ml-2 px-2 py-0.5 text-xs rounded-md ${isChecking
//                             ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
//                             : 'bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-700 dark:text-red-200'
//                             }`}
//                     >
//                         {isChecking ? 'Đang kiểm tra...' : 'Thử lại'}
//                     </button>
//                 )}

//                 {/* Nút đóng - luôn hiển thị */}
//                 <button
//                     onClick={() => setVisible(false)}
//                     className="ml-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
//                     aria-label="Bỏ qua"
//                 >
//                     <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default NetworkStatusIndicator;