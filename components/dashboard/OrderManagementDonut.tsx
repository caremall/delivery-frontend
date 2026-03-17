"use client";

import React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function OrderManagementDonut({ stats, isLoading }: { stats?: any, isLoading: boolean }) {
    const [selectedFilter, setSelectedFilter] = React.useState("All");

    const data = React.useMemo(() => [
        { name: "Pending", value: stats?.pendingOrders || 0, color: "#fcd34d", id: "pending" },
        { name: "In Transit", value: stats?.inTransitOrders || 0, color: "#a78bfa", id: "in_transit" },
        { name: "Delivered", value: stats?.deliveredOrders || 0, color: "#4ade80", id: "delivered" },
    ], [stats]);

    const activeFilter = selectedFilter.toLowerCase();
    
    // Calculate display value based on filter
    const displayValue = React.useMemo(() => {
        if (activeFilter === "all") return stats?.totalOrders || 0;
        const entry = data.find(d => d.name.toLowerCase() === activeFilter);
        return entry ? entry.value : 0;
    }, [activeFilter, stats, data]);

    return (
        <Card className="rounded-xl border border-gray-100 shadow-sm bg-white h-full flex flex-col">
            <CardHeader className="px-5 py-4 flex flex-row items-center justify-between border-b border-gray-50">
                <div>
                    <CardTitle className="text-[14px] font-medium text-gray-800">Order Management</CardTitle>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-100 text-[11px] font-medium text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer outline-none shadow-none">
                            {selectedFilter} <ChevronDown className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 rounded-xl shadow-xl border-gray-100 p-1">
                        <DropdownMenuItem onClick={() => setSelectedFilter("All")} className="cursor-pointer rounded-lg px-3 py-2 text-xs">All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedFilter("Pending")} className="cursor-pointer rounded-lg px-3 py-2 text-xs">Pending</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedFilter("In Transit")} className="cursor-pointer rounded-lg px-3 py-2 text-xs">In Transit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedFilter("Delivered")} className="cursor-pointer rounded-lg px-3 py-2 text-xs">Delivered</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
                                        {data.map((entry, index) => {
                                            const isDimmed = activeFilter !== "all" && entry.name.toLowerCase() !== activeFilter;
                                            return (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={entry.color} 
                                                    style={{ 
                                                        opacity: isDimmed ? 0.2 : 1,
                                                        transition: "opacity 300ms ease" 
                                                    }} 
                                                />
                                            );
                                        })}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-gray-800 transition-all duration-300">
                                    {displayValue}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-4">
                    {data.map((item) => (
                        <div 
                            key={item.name} 
                            className={cn(
                                "flex items-center gap-2 transition-opacity duration-300",
                                activeFilter !== "all" && item.name.toLowerCase() !== activeFilter ? "opacity-30" : "opacity-100"
                            )}
                        >
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[11px] font-medium text-gray-800 uppercase tracking-wider">
                                {item.name} : {isLoading ? "..." : item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
