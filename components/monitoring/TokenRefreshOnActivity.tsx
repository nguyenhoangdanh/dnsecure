"use client"

import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { refreshToken } from '@/redux-saga/actions/authActions';
import useNetworkStatus from '@/hooks/useNetworkStatus';

/**
 * Component làm mới token xác thực khi người dùng hoạt động và token gần hết hạn
 * với cơ chế chống gọi quá nhiều lần
 */
export const TokenRefreshOnActivity: React.FC = () => {
    const dispatch = useAppDispatch();
    const auth = useAppSelector(state => state.auth);

    // Kiểm tra nhanh xem có đăng nhập không - ngăn chạy khi không cần thiết
    if (auth.status !== 'authenticated' || !auth.accessToken) {
        return null;
    }

    // Tham chiếu đến thời gian làm mới cuối cùng
    const lastRefreshRef = useRef<number>(Date.now());

    // Thời gian tối thiểu giữa các lần refresh (30 phút - tăng từ 10 phút)
    const MIN_REFRESH_INTERVAL = 30 * 60 * 1000;

    // Tham chiếu cho việc theo dõi trạng thái làm mới đang diễn ra
    const isRefreshingRef = useRef<boolean>(false);

    // Sử dụng hook trạng thái mạng để kiểm tra tính khả dụng của API
    const { isApiReachable } = useNetworkStatus({
        checkOnMount: false,
        checkInterval: null
    });

    /**
     * Kiểm tra xem token có cần làm mới không dựa trên thời gian hết hạn
     * Token chỉ làm mới nếu sắp hết hạn trong 15 phút (thay vì 5 phút)
     */
    const shouldRefreshToken = useCallback(() => {
        if (!auth.expiresAt || !auth.accessToken) return false;

        try {
            const expiresAt = new Date(auth.expiresAt).getTime();
            const now = Date.now();

            // Nếu token hết hạn trong vòng 15 phút (900000ms)
            return expiresAt - now < 900000;
        } catch (error) {
            console.error('Lỗi kiểm tra thời gian hết hạn token:', error);
            return false;
        }
    }, [auth.expiresAt, auth.accessToken]);

    /**
     * Làm mới token với cơ chế chống gọi quá nhiều lần
     */
    const refreshTokenSafely = useCallback(async () => {
        // Kiểm tra trạng thái hiện tại có cho phép làm mới không
        if (isRefreshingRef.current || auth.status !== 'authenticated' || !isApiReachable) {
            return;
        }

        // Kiểm tra khoảng thời gian tối thiểu giữa các lần làm mới
        const now = Date.now();
        if (now - lastRefreshRef.current < MIN_REFRESH_INTERVAL) {
            console.log('Bỏ qua làm mới token, đã làm mới gần đây:',
                Math.round((now - lastRefreshRef.current) / 1000 / 60), 'phút trước');
            return;
        }

        // Kiểm tra xem token có cần làm mới không
        if (!shouldRefreshToken()) {
            return;
        }

        try {
            // Đặt cờ đang làm mới để tránh các lệnh gọi đồng thời
            isRefreshingRef.current = true;

            console.log('Token sắp hết hạn, đang làm mới...');
            dispatch(refreshToken());

            // Cập nhật thời gian làm mới gần nhất
            lastRefreshRef.current = now;
        } catch (error) {
            console.error('Lỗi làm mới token:', error);
        } finally {
            // Đảm bảo cờ được xóa sau một khoảng thời gian để có thể thử lại
            setTimeout(() => {
                isRefreshingRef.current = false;
            }, 5000); // 5 giây để đảm bảo yêu cầu đã hoàn thành
        }
    }, [auth.status, dispatch, shouldRefreshToken, isApiReachable]);

    // Thiết lập kiểm tra làm mới định kỳ - tăng thời gian giữa các lần kiểm tra
    useEffect(() => {
        // Không thiết lập làm mới nếu chưa xác thực
        if (auth.status !== 'authenticated' || !auth.accessToken) {
            return;
        }

        // Kiểm tra đầu tiên khi mount với độ trễ dài hơn
        const initialCheckId = setTimeout(() => {
            refreshTokenSafely();
        }, 30000); // Tăng từ 5s lên 30s

        // Thiết lập interval để kiểm tra làm mới token
        const intervalId = setInterval(() => {
            refreshTokenSafely();
        }, MIN_REFRESH_INTERVAL); // 30 phút thay vì 10 phút

        return () => {
            clearTimeout(initialCheckId);
            clearInterval(intervalId);
        };
    }, [auth.status, auth.accessToken, refreshTokenSafely]);

    // Giảm số lần lắng nghe sự kiện người dùng
    useEffect(() => {
        // Không thiết lập trình lắng nghe nếu chưa xác thực
        if (auth.status !== 'authenticated' || !auth.accessToken) {
            return;
        }

        // Theo dõi thời gian hoạt động cuối cùng
        let lastActivityTime = Date.now();
        let userActivityTimeout: NodeJS.Timeout | null = null;

        // Hàm xử lý hoạt động người dùng với debounce
        const handleUserActivity = () => {
            // Cập nhật thời gian hoạt động cuối cùng
            const now = Date.now();
            lastActivityTime = now;

            // Xóa bất kỳ timeout đang chờ nào để tránh nhiều lệnh gọi
            if (userActivityTimeout) {
                clearTimeout(userActivityTimeout);
            }

            // Thiết lập timeout mới - chỉ kiểm tra sau 2 phút không hoạt động
            userActivityTimeout = setTimeout(() => {
                // Chỉ làm mới nếu đã lâu từ lần làm mới cuối cùng
                if (now - lastRefreshRef.current >= MIN_REFRESH_INTERVAL) {
                    refreshTokenSafely();
                }
            }, 2 * 60 * 1000); // 2 phút sau khi không hoạt động
        };

        // Chỉ lắng nghe sự kiện với mức tần suất thấp hơn
        // Sử dụng 'visibilitychange' thay vì theo dõi mọi keyup và click
        document.addEventListener('visibilitychange', handleUserActivity);

        // Lắng nghe sự kiện online để kiểm tra token khi kết nối được khôi phục
        const handleOnline = () => {
            // Khi trở lại online, kiểm tra token sau một độ trễ dài hơn
            setTimeout(() => {
                if (auth.status === 'authenticated' && auth.accessToken) {
                    refreshTokenSafely();
                }
            }, 30000); // 30 giây trì hoãn (tăng từ 5s)
        };

        window.addEventListener('online', handleOnline);

        return () => {
            // Dọn dẹp tất cả trình lắng nghe sự kiện
            if (userActivityTimeout) {
                clearTimeout(userActivityTimeout);
            }
            document.removeEventListener('visibilitychange', handleUserActivity);
            window.removeEventListener('online', handleOnline);
        };
    }, [auth.status, auth.accessToken, refreshTokenSafely]);

    // Không render gì cả, đây chỉ dành cho side effects
    return null;
};

export default TokenRefreshOnActivity;