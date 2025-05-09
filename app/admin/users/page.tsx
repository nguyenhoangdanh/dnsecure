import { UsersTable } from "@/components/admin/users-table"
import AuthGuard from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function UsersPage() {
    return (
        <AuthGuard requiredRoles={['admin', 'superadmin']}>
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
                    <p className="text-muted-foreground">Quản lý tất cả người dùng trong hệ thống của bạn</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Thêm người dùng
                </Button>
            </div>
            <UsersTable />
            </div>
        </AuthGuard>
    )
}
