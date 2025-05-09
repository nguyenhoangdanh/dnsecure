"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
    {
        name: "T1",
        desktop: 4000,
        mobile: 2400,
        tablet: 1800,
    },
    {
        name: "T2",
        desktop: 3000,
        mobile: 1398,
        tablet: 1200,
    },
    {
        name: "T3",
        desktop: 5200,
        mobile: 3800,
        tablet: 2500,
    },
    {
        name: "T4",
        desktop: 3800,
        mobile: 2908,
        tablet: 1900,
    },
    {
        name: "T5",
        desktop: 6000,
        mobile: 4800,
        tablet: 3200,
    },
    {
        name: "T6",
        desktop: 4500,
        mobile: 3800,
        tablet: 2800,
    },
    {
        name: "T7",
        desktop: 4700,
        mobile: 4300,
        tablet: 3000,
    },
    {
        name: "T8",
        desktop: 5800,
        mobile: 5000,
        tablet: 3500,
    },
    {
        name: "T9",
        desktop: 6200,
        mobile: 5500,
        tablet: 3800,
    },
    {
        name: "T10",
        desktop: 7000,
        mobile: 6000,
        tablet: 4200,
    },
    {
        name: "T11",
        desktop: 6800,
        mobile: 5800,
        tablet: 4000,
    },
    {
        name: "T12",
        desktop: 7400,
        mobile: 6300,
        tablet: 4500,
    },
]

export function AnalyticsChartDetailed() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Phân tích thiết bị</CardTitle>
                    <CardDescription>Phân tích lượng truy cập theo loại thiết bị</CardDescription>
                </div>
                <Select defaultValue="year">
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Chọn thời gian" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="day">Ngày</SelectItem>
                        <SelectItem value="week">Tuần</SelectItem>
                        <SelectItem value="month">Tháng</SelectItem>
                        <SelectItem value="year">Năm</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="desktop" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
                            <Area type="monotone" dataKey="mobile" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                            <Area type="monotone" dataKey="tablet" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
