import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardHeader() {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-2" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Trang chủ</h1>
                    <p className="text-muted-foreground">Xem tổng quan về hệ thống của bạn</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline">Xuất báo cáo</Button>
                <Button>Làm mới dữ liệu</Button>
            </div>
        </div>
    )
}
