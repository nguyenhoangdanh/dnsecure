"use client"

import React, { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { initAuth, refreshToken } from '@/redux-saga/actions/authActions';
import { refreshTokenDirectly } from '@/lib/api/auth-api';
import { healthCoordinator } from '@/lib/utils/HealthCoordinator';
import useNetworkStatus from '@/hooks/useNetworkStatus';

/**
 * Component quản lý khởi tạo xác thực với xử lý lỗi tốt hơn
 */
export const AuthInitializer: React.FC = () => {
    const dispatch = useAppDispatch();
    const authState = useAppSelector(state => state.auth);
    const initialized = useRef<boolean>(false);
    const isCheckingTokenRef = useRef<boolean>(false);

    // Tần suất giám sát giảm để tránh gọi API quá nhiều
    const { isApiReachable } = useNetworkStatus({
        checkOnMount: false,
        checkInterval: null
    });

    /**
     * Kiểm tra token an toàn khi khởi động, nhưng chỉ khi chúng ta có token
     * và tránh kiểm tra nhiều lần đồng thời
     */
    const checkTokenOnStartup = useCallback(async () => {
        // Ngăn kiểm tra đồng thời
        if (isCheckingTokenRef.current) return;

        try {
            isCheckingTokenRef.current = true;

            // Chỉ kiểm tra token nếu chúng ta có token và đã xác thực
            if (!authState.accessToken) {
                console.log('Không có token truy cập khả dụng, bỏ qua kiểm tra token');
                return;
            }

            // Trước tiên kiểm tra xem chúng ta có kết nối với API server không
            if (!isApiReachable) {
                console.log('API server không thể truy cập được, trì hoãn kiểm tra token');
                return;
            }

            console.log('Kiểm tra tính hợp lệ của token...');

            // Kiểm tra xem token có cần làm mới không bằng cách gọi trực tiếp
            const refreshResult = await refreshTokenDirectly();

            if (refreshResult.success && refreshResult.data) {
                // Nếu làm mới trực tiếp thành công, cập nhật trạng thái Redux
                console.log('Làm mới token thành công khi khởi động');
                dispatch(refreshToken());
            } else if (refreshResult.error && typeof refreshResult.error === 'string' &&
                refreshResult.error.includes('Too Many Requests')) {
                // Nếu nhận lỗi 429, chỉ ghi nhật ký và không thử lại ngay lập tức
                console.warn('API bị giới hạn tốc độ, sẽ thử lại sau');
            } else {
                // Nếu làm mới thất bại với phản hồi từ server, khởi tạo lại xác thực
                console.log('Token không hợp lệ hoặc đã hết hạn, khởi tạo lại xác thực');
                dispatch(initAuth());
            }
        } catch (error) {
            console.error('Lỗi kiểm tra token khi khởi động:', error);
        } finally {
            isCheckingTokenRef.current = false;
        }
    }, [dispatch, isApiReachable, authState.accessToken]);

    /**
     * Khởi tạo trạng thái xác thực với xử lý lỗi tốt hơn
     */
    const initializeAuth = useCallback(async () => {
        if (initialized.current) return;

        try {
            // Đánh dấu là đã khởi tạo để ngăn khởi tạo nhiều lần
            initialized.current = true;

            // Kiểm tra xem chúng ta có nên khởi tạo dựa trên trạng thái auth
            if (authState.status === 'authenticated' && authState.accessToken) {
                // Nếu chúng ta đã có trạng thái auth, xác minh tính hợp lệ của token
                // khi API có thể truy cập được - nhưng thêm độ trễ để tránh gọi quá nhiều
                if (isApiReachable) {
                    // Thêm độ trễ để tránh nhiều lệnh gọi đồng thời khi khởi động
                    setTimeout(() => {
                        checkTokenOnStartup();
                    }, 5000);
                } else {
                    console.log('API không thể truy cập, sẽ xác minh token khi có kết nối');
                }
            } else {
                // Đối với trạng thái chưa xác thực, chúng ta không cần gọi bất kỳ endpoint nào
                console.log('Không có phiên xác thực hiện tại, đánh dấu là đã khởi tạo');
            }
        } catch (error) {
            console.error('Lỗi khởi tạo auth:', error);
        }
    }, [authState.status, authState.accessToken, checkTokenOnStartup, isApiReachable]);

    // Effect khởi tạo - chạy một lần khi component được mount
    useEffect(() => {
        // Thêm độ trễ lớn hơn để cho phép các hệ thống khác khởi tạo trước
        const timeoutId = setTimeout(() => {
            initializeAuth();
        }, 3000); // Tăng từ 500ms lên 3s

        return () => clearTimeout(timeoutId);
    }, [initializeAuth]);

    // Khởi tạo lại khi API trở nên khả dụng nhưng chỉ khi chúng ta chưa được khởi tạo trước đó
    useEffect(() => {
        // Thêm độ trễ để ngăn việc khởi tạo ngay khi isApiReachable thay đổi
        let timeoutId: NodeJS.Timeout | null = null;

        if (isApiReachable && !initialized.current) {
            timeoutId = setTimeout(() => {
                initializeAuth();
            }, 5000); // 5 giây trì hoãn
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isApiReachable, initializeAuth]);

    // Thiết lập lắng nghe cho thay đổi trạng thái auth
    useEffect(() => {
        // Chỉ thực hiện kiểm tra health khi chúng ta được xác thực và có token
        // và thêm thời gian trễ lớn hơn
        if (authState.status === 'authenticated' && authState.accessToken) {
            // Trì hoãn kiểm tra health lâu hơn để ngăn các cuộc gọi API ngay lập tức
            const timeoutId = setTimeout(() => {
                healthCoordinator.forceCheck();
            }, 10000); // Tăng từ 1s lên 10s

            return () => clearTimeout(timeoutId);
        }
    }, [authState.status, authState.accessToken]);

    // Không render gì cả - đây chỉ dành cho side effects
    return null;
};

export default AuthInitializer;