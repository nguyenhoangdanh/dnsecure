import { AnalyticsChartDetailed } from "@/components/admin/analytics-chart-detailed";
import { AnalyticsMetrics } from "@/components/admin/analytics-metrics";
import { AnalyticsOverview } from "@/components/admin/analytics-overview";

export default function AnalyticsPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Phân tích dữ liệu</h1>
                <p className="text-muted-foreground">Xem phân tích chi tiết về hoạt động của hệ thống</p>
            </div>
            <AnalyticsOverview />
            <AnalyticsChartDetailed />
            <AnalyticsMetrics />
        </div>
    )
}
