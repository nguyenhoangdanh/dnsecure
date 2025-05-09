"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
    {
        name: "T1",
        revenue: 4000,
        users: 2400,
    },
    {
        name: "T2",
        revenue: 3000,
        users: 1398,
    },
    {
        name: "T3",
        revenue: 5200,
        users: 3800,
    },
    {
        name: "T4",
        revenue: 3800,
        users: 2908,
    },
    {
        name: "T5",
        revenue: 6000,
        users: 4800,
    },
    {
        name: "T6",
        revenue: 4500,
        users: 3800,
    },
    {
        name: "T7",
        revenue: 4700,
        users: 4300,
    },
    {
        name: "T8",
        revenue: 5800,
        users: 5000,
    },
    {
        name: "T9",
        revenue: 6200,
        users: 5500,
    },
    {
        name: "T10",
        revenue: 7000,
        users: 6000,
    },
    {
        name: "T11",
        revenue: 6800,
        users: 5800,
    },
    {
        name: "T12",
        revenue: 7400,
        users: 6300,
    },
];

export function AnalyticsOverview() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tổng quan phân tích</CardTitle>
                <CardDescription>
                    Xem phân tích chi tiết về doanh thu và người dùng
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="revenue">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
                        <TabsTrigger value="users">Người dùng</TabsTrigger>
                    </TabsList>
                    <TabsContent value="revenue" className="space-y-4">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#0ea5e9"
                                        strokeWidth={2}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                    <TabsContent value="users" className="space-y-4">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
