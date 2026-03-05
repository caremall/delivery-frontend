"use client";

import React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"


export default function OrderManagementDonut({ stats, isLoading }: { stats?: any, isLoading: boolean }) {
    const data = React.useMemo(() => [
        { name: "Pending", value: stats?.pendingOrders || 0, color: "#fcd34d" },
        { name: "In Transit", value: stats?.inTransitOrders || 0, color: "#a78bfa" },
        { name: "Delivered", value: stats?.deliveredOrders || 0, color: "#4ade80" },
    ], [stats]);

    const totalValue = stats?.totalOrders || 0;

    return (
        <Card className="rounded-xl border border-gray-100 shadow-sm bg-white h-full flex flex-col">
            <CardHeader className="px-5 py-4 flex flex-row items-center justify-between border-b border-gray-50">
                <div>
                    <CardTitle className="text-[14px] font-medium text-gray-800">Order Management</CardTitle>

                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-100 text-[11px] font-medium text-gray-400 hover:bg-gray-50 transition-colors">
                    All <ChevronDown className="h-4 w-4" />
                </button>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-8 pb-4">
                <div className="relative h-48 w-48">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-gray-200">...</span>
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-gray-800">{totalValue}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-4">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                                {item.name} : {isLoading ? "..." : item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
