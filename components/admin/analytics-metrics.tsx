import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function AnalyticsMetrics() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Tỷ lệ chuyển đổi</CardTitle>
                    <CardDescription className="text-xs">Tỷ lệ người dùng thực hiện hành động mong muốn</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">4.3%</div>
                    <Progress value={43} className="mt-2" />
                    <p className="mt-2 text-xs text-muted-foreground">+0.5% so với tháng trước</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Thời gian trung bình</CardTitle>
                    <CardDescription className="text-xs">Thời gian trung bình người dùng ở lại trang</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">3m 45s</div>
                    <Progress value={65} className="mt-2" />
                    <p className="mt-2 text-xs text-muted-foreground">+12s so với tháng trước</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Tỷ lệ thoát</CardTitle>
                    <CardDescription className="text-xs">Tỷ lệ người dùng rời trang sau khi xem một trang</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">28.5%</div>
                    <Progress value={28.5} className="mt-2" />
                    <p className="mt-2 text-xs text-muted-foreground">-2.3% so với tháng trước</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Trang xem mỗi phiên</CardTitle>
                    <CardDescription className="text-xs">Số trang trung bình được xem trong mỗi phiên</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">4.2</div>
                    <Progress value={84} className="mt-2" />
                    <p className="mt-2 text-xs text-muted-foreground">+0.3 so với tháng trước</p>
                </CardContent>
            </Card>
        </div>
    )
}
