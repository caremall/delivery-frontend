"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AlertCircle,
    Box,
    Clock,
    Layers,
    RotateCcw,
    Search,
    Filter,
    LayoutGrid,
    TrendingUp,
    Users,
    ChevronUp,
    ChevronDown,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

const stockAlerts = [
    { id: 1, title: "3 Stock Mismatches in last week", time: "Today", icon: Box },
    { id: 2, title: "Restock:Surface Cleaner (5L) - 4 units left", time: "Today", icon: Box },
    { id: 3, title: "Restock:Disinfectant Spray (500ml) - 20 units left", time: "Today", icon: Box },
    { id: 4, title: "Restock:Glass Cleaner (1L) - 12 units left", time: "3 days ago", icon: Box },
    { id: 5, title: "Restock:All-Purpose Cleaner (750ml) - 8 units left", time: "3 days ago", icon: Box },
    { id: 6, title: "Restock:Surface Cleaner (5L) - 4 units left", time: "Today", icon: Box },
];

export default function StockAlert() {
    return (
        <Card className="rounded-xl border border-gray-100 shadow-sm bg-white h-full flex flex-col">
            <CardHeader className="px-5 py-4 border-b border-gray-50 flex flex-row items-center justify-between">
                <CardTitle className="text-[14px] font-medium text-gray-800">Stock Alert</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 overflow-y-auto max-h-[460px] custom-scrollbar">
                {stockAlerts.map((alert) => (
                    <div key={alert.id} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100/50 hover:bg-gray-100 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-100 group-hover:scale-105 transition-transform">
                            <alert.icon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-[12px] font-medium text-gray-800 leading-tight mb-1">
                                {alert.title}
                            </h4>
                            <p className="text-[10px] font-medium text-gray-400">
                                {alert.time}
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
