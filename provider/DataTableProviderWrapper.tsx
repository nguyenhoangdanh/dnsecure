'use client';

import React from 'react';
import { DataTableProvider, DataTableProviderConfig } from 'react-table-power';

// Define global default configuration
const globalTableConfig: DataTableProviderConfig = {
  // Default theme settings
  theme: {
    theme: 'system', // 'light', 'dark', or 'system'
    variant: 'modern',
    colorScheme: 'primary',
    borderRadius: 'md',
  },
  
  // Default size
  size: 'medium',
  
  // Default behavior flags
  striped: true,
  hover: true,
  bordered: false,
  sticky: true,
  
  // Enable animations by default
  animate: true,
  
  // Default dialog settings
  dialog: {
    closeOnClickOutside: true,
    closeOnEsc: true,
  },
  
  // Default labels
  labels: {
    search: 'Tìm kiếm...',
    noResults: 'Không có dữ liệu',
    loading: 'Đang tải...',
    create: 'Thêm mới',
    edit: 'Chỉnh sửa',
    delete: 'Xóa',
    view: 'Xem chi tiết',
  },
  
  // Default loading settings
  loading: {
    variant: 'spinner',
    spinnerSize: 'md',
    text: 'Đang tải dữ liệu...',
  },
  
  // Default pagination settings
  pagination: {
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
    pageSizeOptions: [5, 10, 20, 50],
  },
  
  // Default filter settings
  filterDefaults: {
    advancedFiltering: true,
    allowPresets: true,
    persistFilters: true,
  },
};

export function DataTableProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DataTableProvider config={globalTableConfig}>
        {children}
    </DataTableProvider>
  );
}

export default DataTableProviderWrapper;
