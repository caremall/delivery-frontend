"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, Calendar } from "lucide-react"

const chartData = [
    { name: "Feb 01", value: 60 },
    { name: "Feb 02", value: 95 },
    { name: "Feb 03", value: 85 },
    { name: "Feb 04", value: 50 },
    { name: "Feb 05", value: 25 },
    { name: "Feb 06", value: 38 },
    { name: "Feb 07", value: 80 },
    { name: "Feb 08", value: 72 },
    { name: "Feb 09", value: 52 },
    { name: "Feb 10", value: 24 },
    { name: "Feb 11", value: 60 },
    { name: "Feb 12", value: 32 },
]

export default function PerformanceChart({ data, isLoading }: { data?: any[], isLoading: boolean }) {
    const displayData = React.useMemo(() => data || chartData, [data]);

    return (
        <Card className="rounded-xl border border-gray-100 shadow-sm bg-white h-full flex flex-col pt-0">
            <CardContent className="p-6 flex flex-col h-full bg-white">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-medium text-gray-900">Revenue Volume</h3>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 text-[11px] font-medium text-gray-400 hover:bg-gray-50 transition-colors">
                        <Calendar className="h-3.5 w-3.5" />
                        {displayData.length > 0 ? `${displayData[0].name} - ${displayData[displayData.length - 1].name}` : "Select range"}
                        <ChevronDown className="h-4 w-4" />
                    </button>
                </div>

                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={displayData}
                            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                            barSize={32}
                        >
                            <CartesianGrid vertical={false} stroke="#fafafa" strokeWidth={1} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 500 }}
                                tickMargin={12}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 500 }}
                                tickFormatter={(value) => value === 0 ? '0' : value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc', radius: 4 }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm text-[10px] font-medium">
                                                <p className="text-gray-900">₹{payload[0].value?.toLocaleString()}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="value"
                                fill="#9c8cfc" // Purple-ish color from image
                                radius={[4, 4, 4, 4]}
                                activeBar={{ fill: '#8b5cf6' }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
