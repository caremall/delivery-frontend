"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, UserIcon, Calendar, CheckCircle2, XCircle, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getAssignedReturns, ReturnRequest } from "@/lib/api/returns";
import { CustomDataTable } from "@/components/common/CustomDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function ProcessedReturnsTable() {
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState<"completed" | "rejected">("completed");

    const { data: returnsData, isLoading } = useQuery({
        queryKey: ["assignedReturns", page, activeTab],
        queryFn: () => getAssignedReturns({ page, status: activeTab }),
        refetchInterval: 30000,
    });

    const returns: ReturnRequest[] = returnsData?.data || [];
    const totalPages = returnsData?.totalPages || 0;

    const getStatusStyle = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'approved') return "bg-blue-50 text-blue-600 border-blue-100";
        if (s === 'completed') return "bg-green-50 text-green-600 border-green-100";
        if (s === 'requested') return "bg-yellow-50 text-yellow-600 border-yellow-100";
        if (s === 'rejected') return "bg-red-50 text-red-600 border-red-100";
        return "bg-gray-50 text-gray-600 border-gray-100";
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const columns: ColumnDef<ReturnRequest>[] = [
        {
            accessorKey: "returnId",
            header: "Return ID",
            cell: ({ row }) => (
                <Link href={`/returns/details?id=${row.original._id}`} className="group">
                    <div className="flex flex-col">
                        <span className="text-[13px] font-mono font-medium text-indigo-600 group-hover:text-red-500 transition-colors underline-offset-4 group-hover:underline">{row.original.returnId}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                            Order: {row.original.order?.orderId || "N/A"}
                        </span>
                    </div>
                </Link>
            )
        },
        {
            accessorKey: "item",
            header: "Product",
            cell: ({ row }) => {
                const rtn = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center overflow-hidden">
                            {rtn.item?.product?.productImages?.[0] ? (
                                <img src={rtn.item.product.productImages[0]} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <Package className="h-5 w-5 text-gray-300" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-medium text-gray-800 truncate block">
                                {rtn.item?.product?.productName}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate block">
                                SKU: {rtn.item?.product?.SKU}
                            </span>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "user",
            header: "Customer",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-[13px] font-normal text-gray-800 flex items-center gap-1.5">
                        <UserIcon className="h-3 w-3 text-gray-400" />
                        {row.original.user?.name || "Customer"}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{row.original.user?.phone}</span>
                </div>
            )
        },
        {
            accessorKey: "updatedAt",
            header: "Processed At",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-[12px] font-normal text-gray-600 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {formatDate(row.original.updatedAt)}
                    </span>
                </div>
            )
        },
        {
            accessorKey: "returnType",
            header: "Type",
            cell: ({ row }) => (
                <Badge variant="outline" className={cn("px-2 py-0.5 rounded-lg text-[10px] font-medium uppercase border-none",
                    row.original.returnType === 'replacement' ? "bg-purple-100/50 text-purple-700" : "bg-blue-100/50 text-blue-700")}>
                    {row.original.returnType === 'return' ? 'refund' : row.original.returnType}
                </Badge>
            )
        },
        {
            accessorKey: "rider",
            header: "Rider",
            cell: ({ row }) => {
                const r = row.original.rider as any;
                if (!r) {
                    return <span className="text-[11px] text-gray-400">Not assigned</span>;
                }
                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={r.avatar} />
                            <AvatarFallback><UserCircle className="w-4 h-4 text-gray-400" /></AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-medium text-gray-700">{r.name}</span>
                            <span className="text-[9px] text-gray-400">{r.phone}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="flex justify-end pr-4">
                    <Badge variant="outline" className={cn("px-3 py-0.5 rounded-full text-[10px] font-medium capitalize border-none", getStatusStyle(row.original.status))}>
                        {row.original.status}
                    </Badge>
                </div>
            )
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div className="flex justify-end pr-4">
                    <Link href={`/returns/details?id=${row.original._id}`}>
                        <Button variant="ghost" size="sm" className="text-[11px] font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            View Details
                        </Button>
                    </Link>
                </div>
            )
        }
    ];

    return (
        <Card className="rounded-2xl border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
            <CardHeader className="p-0 border-b border-gray-100">
                <div className="flex items-center">
                    <button
                        onClick={() => { setActiveTab("completed"); setPage(1); }}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors border-b-2",
                            activeTab === "completed"
                                ? "border-green-500 text-green-600 bg-green-50/30"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Accepted Returns
                    </button>
                    <button
                        onClick={() => { setActiveTab("rejected"); setPage(1); }}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors border-b-2",
                            activeTab === "rejected"
                                ? "border-red-500 text-red-600 bg-red-50/30"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <XCircle className="w-4 h-4" />
                        Rejected Returns
                    </button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <CustomDataTable
                    columns={columns}
                    data={returns}
                    isLoading={isLoading}
                    manualPagination={true}
                    pageCount={totalPages}
                    pagination={{
                        pageIndex: page - 1,
                        pageSize: 10
                    }}
                    onPaginationChange={(p) => {
                        setPage(p.pageIndex + 1);
                    }}
                />
            </CardContent>
        </Card>
    );
}
