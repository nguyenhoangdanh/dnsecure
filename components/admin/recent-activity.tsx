import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RecentActivity() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>Các hoạt động mới nhất trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {activities.map((activity, index) => (
                        <div className="flex items-center" key={index}>
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={activity.avatar || "/placeholder.svg"} alt="Avatar" />
                                <AvatarFallback>{activity.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{activity.name}</p>
                                <p className="text-sm text-muted-foreground">{activity.action}</p>
                            </div>
                            <div className="ml-auto text-sm text-muted-foreground">{activity.time}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

const activities = [
    {
        name: "Nguyễn Văn A",
        action: "Đã đăng nhập vào hệ thống",
        time: "2 phút trước",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    {
        name: "Trần Thị B",
        action: "Đã tạo một sản phẩm mới",
        time: "15 phút trước",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    {
        name: "Lê Văn C",
        action: "Đã cập nhật thông tin người dùng",
        time: "1 giờ trước",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    {
        name: "Phạm Thị D",
        action: "Đã xóa một đơn hàng",
        time: "3 giờ trước",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    {
        name: "Hoàng Văn E",
        action: "Đã thay đổi cài đặt hệ thống",
        time: "5 giờ trước",
        avatar: "/placeholder.svg?height=32&width=32",
    },
]
