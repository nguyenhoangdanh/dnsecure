"use client"
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, LayoutDashboard, LogOut, Settings, ShoppingCart, Users } from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks";

export function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <LayoutDashboard className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Admin Dashboard</span>
                                    <span className="text-xs text-muted-foreground">v1.0.0</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Chính</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                                    <Link href="/admin">
                                        <Home className="mr-2 h-4 w-4" />
                                        <span>Trang chủ</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/dashboard/users")}>
                                    <Link href="/admin/users">
                                        <Users className="mr-2 h-4 w-4" />
                                        <span>Quản lý người dùng</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/dashboard/analytics")}>
                                    <Link href="/admin/analytics">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        <span>Phân tích dữ liệu</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/dashboard/products")}>
                                    <Link href="/admin/products">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        <span>Quản lý sản phẩm</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Hệ thống</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/dashboard/settings")}>
                                    <Link href="/admin/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Cài đặt hệ thống</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <button
                                onClick={() => logout()}
                                className="w-full">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Đăng xuất</span>
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
