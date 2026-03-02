"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Smartphone } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductStock {
    _id: string;
    productName: string;
    image?: string;
    totalStock: number;
}

interface TopProductsStockProps {
    data?: ProductStock[];
    isLoading: boolean;
}

export default function TopProductsStock({ data, isLoading }: TopProductsStockProps) {
    return (
        <Card className="rounded-xl border border-gray-100 shadow-sm bg-white h-full flex flex-col">
            <CardHeader className="px-5 py-4 border-b border-gray-50 flex flex-row items-center justify-between">
                <CardTitle className="text-[14px] font-bold text-gray-800">Top Products Stock</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 overflow-y-auto max-h-[460px] custom-scrollbar">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50 animate-pulse">
                            <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-3/4" />
                                <div className="h-2 bg-gray-200 rounded w-1/4" />
                            </div>
                        </div>
                    ))
                ) : data && data.length > 0 ? (
                    data.map((product) => (
                        <div key={product._id} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100/50 hover:bg-gray-100 transition-colors group">
                            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-100 group-hover:scale-105 transition-transform overflow-hidden relative">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.productName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <Package className="h-5 w-5 text-gray-400" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-[12px] font-bold text-gray-800 leading-tight mb-1 truncate">
                                    {product.productName}
                                </h4>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-medium text-gray-400">
                                        Current Stock
                                    </p>
                                    <span className={cn(
                                        "text-[11px] font-bold",
                                        product.totalStock < 10 ? "text-red-500" : "text-gray-700"
                                    )}>
                                        {product.totalStock} units
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Package className="h-10 w-10 text-gray-200 mb-2" />
                        <p className="text-xs text-gray-400">No stock data available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
