import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Users, DollarSign, ShoppingCart, Activity } from 'lucide-react';

export function DashboardCards() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-emerald-500 flex items-center">
                            +12% <ArrowUpRight className="ml-1 h-3 w-3" />
                        </span>{" "}
                        so với tháng trước
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$45,231</div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-emerald-500 flex items-center">
                            +8% <ArrowUpRight className="ml-1 h-3 w-3" />
                        </span>{" "}
                        so với tháng trước
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">578</div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-emerald-500 flex items-center">
                            +5% <ArrowUpRight className="ml-1 h-3 w-3" />
                        </span>{" "}
                        so với tháng trước
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">432</div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-emerald-500 flex items-center">
                            +18% <ArrowUpRight className="ml-1 h-3 w-3" />
                        </span>{" "}
                        so với tháng trước
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
