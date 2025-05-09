// src/components/network/NetworkStatusProvider.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { healthCoordinator } from '@/lib/utils/HealthCoordinator';
import { NetworkErrorType } from '@/lib/utils/network-error-handler';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { NetworkErrorOverlay } from '@/components/monitoring/NetworkErrorOverlay';

// Context để chia sẻ trạng thái mạng trong toàn ứng dụng
interface NetworkContextType {
    isOnline: boolean;
    isApiReachable: boolean;
    checkConnection: () => Promise<boolean>;
    networkErrorType: NetworkErrorType | null;
    showError: boolean;
    setShowError: (show: boolean) => void;
}

const NetworkContext = createContext<NetworkContextType | null>(null);

// Hook sử dụng context
export const useNetworkContext = () => {
    const context = useContext(NetworkContext);
    if (!context) {
        throw new Error('useNetworkContext must be used within a NetworkStatusProvider');
    }
    return context;
};

interface NetworkStatusProviderProps {
    children: React.ReactNode;
    checkInterval?: number;
    retryStrategy?: 'exponential' | 'linear' | 'none';
}

export const NetworkStatusProvider: React.FC<NetworkStatusProviderProps> = ({
    children,
    checkInterval = 60000, // 1 phút
    retryStrategy = 'exponential'
}) => {
    // Sử dụng hook hiện có
    const {
        isOnline,
        isApiReachable,
        networkErrorType,
        checkNow,
        consecutiveFailures
    } = useNetworkStatus({
        notifyOnReconnect: true,
        checkOnMount: true,
        checkInterval,
        retryStrategy,
        maxRetries: 5
    });

    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Hiển thị popup lỗi khi mất kết nối
    useEffect(() => {
        if (!isApiReachable) {
            // Chỉ hiển thị lỗi khi mất kết nối API nhưng trình duyệt vẫn online
            if (isOnline) {
                setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
                setShowError(true);
            } else {
                setErrorMessage('Thiết bị của bạn đang ngoại tuyến. Vui lòng kiểm tra kết nối internet.');
                setShowError(true);
            }
        } else {
            // Tự động ẩn thông báo lỗi khi kết nối được khôi phục
            setShowError(false);
        }
    }, [isOnline, isApiReachable]);

    // Xử lý khi người dùng nhấn thử lại
    const handleRetry = useCallback(() => {
        checkNow();
    }, [checkNow]);

    // Xử lý khi người dùng bỏ qua thông báo
    const handleDismiss = useCallback(() => {
        setShowError(false);
    }, []);

    // Giá trị context
    const contextValue: NetworkContextType = {
        isOnline,
        isApiReachable,
        checkConnection: checkNow,
        networkErrorType,
        showError,
        setShowError
    };

    const error = new Error(errorMessage);

    return (
        <NetworkContext.Provider value={contextValue}>
            {/* Hiển thị popup lỗi khi cần */}
            {showError && (
                <NetworkErrorOverlay
                    error={error}
                    errorType={networkErrorType || NetworkErrorType.UNKNOWN}
                    onRetry={handleRetry}
                    onDismiss={handleDismiss}
                />
            )}
            {children}
        </NetworkContext.Provider>
    );
};

export default NetworkStatusProvider;