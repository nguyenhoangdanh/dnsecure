"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const data = [
    {
        name: "T1",
        total: 400,
    },
    {
        name: "T2",
        total: 300,
    },
    {
        name: "T3",
        total: 520,
    },
    {
        name: "T4",
        total: 380,
    },
    {
        name: "T5",
        total: 600,
    },
    {
        name: "T6",
        total: 450,
    },
    {
        name: "T7",
        total: 470,
    },
    {
        name: "T8",
        total: 580,
    },
    {
        name: "T9",
        total: 620,
    },
    {
        name: "T10",
        total: 700,
    },
    {
        name: "T11",
        total: 680,
    },
    {
        name: "T12",
        total: 740,
    },
];

export function AnalyticsChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tổng quan</CardTitle>
                <CardDescription>Biểu đồ doanh thu theo tháng</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
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
                        <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}