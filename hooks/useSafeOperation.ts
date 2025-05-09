// src/hooks/useSafeOperation.ts
import { useNetworkContext } from '@/provider/NetworkStatusProvider';
import { useCallback } from 'react';

/**
 * Hook giúp thực hiện thao tác an toàn với kiểm tra kết nối
 */
export function useSafeOperation() {
  const { isOnline, isApiReachable, checkConnection, setShowError } = useNetworkContext();

  /**
   * Thực hiện một thao tác an toàn với kiểm tra kết nối
   * @param operation Function thực hiện thao tác
   * @returns Promise kết quả của thao tác
   */
  const executeSafely = useCallback(async <T>(operation: () => Promise<T>): Promise<T | null> => {
    // Kiểm tra trạng thái mạng hiện tại
    if (!isOnline) {
      setShowError(true);
      return null;
    }

    // Nếu đã mất kết nối API trước đó, kiểm tra lại
    if (!isApiReachable) {
      const isConnected = await checkConnection();
      if (!isConnected) {
        setShowError(true);
        return null;
      }
    }

    try {
      // Thực hiện thao tác
      return await operation();
    } catch (error) {
      // Kiểm tra xem lỗi có phải do mạng không
      if (
        error instanceof Error && (
          error.message.includes('network') ||
          error.message.includes('connection') ||
          error.message.includes('offline') ||
          error.message.includes('fetch')
        )
      ) {
        // Kiểm tra lại kết nối
        const isConnected = await checkConnection();
        if (!isConnected) {
          setShowError(true);
        }
      }
      throw error;
    }
  }, [isOnline, isApiReachable, checkConnection, setShowError]);

  return { executeSafely };
}