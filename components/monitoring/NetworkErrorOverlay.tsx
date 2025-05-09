// src/components/network/NetworkErrorOverlay.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { healthService } from '@/lib/api/health-service';
import { NetworkErrorType } from '@/lib/utils/network-error-handler';

interface NetworkErrorOverlayProps {
    error: Error;
    errorType?: NetworkErrorType;
    onRetry: () => void;
    onDismiss?: () => void;
}

export function NetworkErrorOverlay({
    error,
    errorType = NetworkErrorType.UNKNOWN,
    onRetry,
    onDismiss
}: NetworkErrorOverlayProps) {
    const [isCheckingConnection, setIsCheckingConnection] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Kiểm tra kết nối định kỳ
    useEffect(() => {
        const checkConnection = async () => {
            setIsCheckingConnection(true);
            const browserOnline = navigator.onLine;
            setIsOnline(browserOnline);

            if (browserOnline) {
                const apiAvailable = await healthService.checkApiHealth();
                if (!apiAvailable) {
                    setIsOnline(false);
                }
            }
            setIsCheckingConnection(false);
        };

        // Kiểm tra ban đầu
        checkConnection();

        // Thiết lập kiểm tra định kỳ
        const intervalId = setInterval(checkConnection, 10000);

        // Xử lý sự kiện online/offline
        const handleOnline = () => checkConnection();
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Xử lý thử lại khi có kết nối trở lại
    const handleRetry = async () => {
        setIsCheckingConnection(true);
        try {
            const apiAvailable = await healthService.checkApiHealth();
            if (apiAvailable) {
                onRetry();
            } else {
                setIsOnline(false);
            }
        } catch (error) {
            console.error('Không thể kiểm tra kết nối API:', error);
            setIsOnline(false);
        }
        setIsCheckingConnection(false);
    };

    // Lấy nội dung lỗi phù hợp dựa trên loại lỗi
    const getErrorContent = () => {
        switch (errorType) {
            case NetworkErrorType.OFFLINE:
                return {
                    title: 'Bạn đang ngoại tuyến',
                    message: 'Vui lòng kiểm tra kết nối internet và thử lại.'
                };

            case NetworkErrorType.TIMEOUT:
                return {
                    title: 'Kết nối bị gián đoạn',
                    message: 'Máy chủ đang phản hồi quá chậm. Vui lòng thử lại sau.'
                };

            case NetworkErrorType.SERVER_ERROR:
                return {
                    title: 'Lỗi máy chủ',
                    message: 'Máy chủ gặp sự cố. Đội ngũ kỹ thuật đang khắc phục vấn đề.'
                };

            case NetworkErrorType.AUTHENTICATION_ERROR:
                return {
                    title: 'Lỗi xác thực',
                    message: 'Phiên đăng nhập của bạn đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.'
                };

            default:
                return {
                    title: 'Lỗi kết nối',
                    message: error.message || 'Đã xảy ra lỗi không mong muốn khi kết nối với máy chủ.'
                };
        }
    };

    const { title, message } = getErrorContent();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full animate-fade-in">
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 rounded-full p-3 mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

                    {/* Trạng thái kết nối */}
                    <div className="flex items-center mb-6">
                        <div className={`h-3 w-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {isCheckingConnection
                                ? 'Đang kiểm tra kết nối...'
                                : isOnline
                                    ? 'Đã kết nối internet'
                                    : 'Không phát hiện kết nối'}
                        </span>
                    </div>

                    <div className="flex justify-end space-x-3">
                        {onDismiss && (
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={onDismiss}
                            >
                                Bỏ qua
                            </button>
                        )}

                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleRetry}
                            disabled={isCheckingConnection || !isOnline}
                        >
                            {isCheckingConnection ? 'Đang kiểm tra...' : 'Thử lại'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}