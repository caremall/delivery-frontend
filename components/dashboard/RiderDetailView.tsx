"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CustomDataTable } from "@/components/common/CustomDataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
    Bike,
    ShoppingBag,
    CheckCircle2,
    Clock,
    ShieldCheck,
    ShieldAlert,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RiderDetailViewProps {
    riderId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const RiderDetailView = ({ riderId, isOpen, onClose }: RiderDetailViewProps) => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(8);

    const { data: detailData, isLoading } = useQuery({
        queryKey: ["rider-detail", riderId, page, limit],
        queryFn: async () => {
            const res = await axiosInstance.get(`/riders/${riderId}?page=${page}&limit=${limit}`);
            return res.data.data;
        },
        enabled: !!riderId && isOpen,
    });

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "orderId",
            header: "Order ID",
            enableSorting: false, 
            cell: ({ row }) => <span className="font-bold text-gray-900">#{row.original.orderId}</span>,
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => (
                <span className="text-gray-500 text-xs">
                    {new Date(row.original.createdAt).toLocaleDateString()}
                </span>
            ),
        },
        {
            accessorKey: "totalAmount",
            header: "Amount",
            cell: ({ row }) => <span className="font-bold text-gray-900">₹{row.original.totalAmount?.toLocaleString()}</span>,
        },
        {
            accessorKey: "orderStatus",
            header: "Status",
            cell: ({ row }) => {
                const s = row.original.orderStatus?.toLowerCase();
                const colors: any = {
                    delivered: "bg-green-50 text-green-600 border-green-100",
                    cancelled: "bg-red-50 text-red-600 border-red-100",
                    pending: "bg-blue-50 text-blue-600 border-blue-100",
                };
                return (
                    <Badge className={cn("rounded-md border text-[10px] font-medium uppercase py-0 px-2 shadow-none", colors[s] || "bg-gray-50 text-gray-400 border-gray-100")}>
                        {row.original.orderStatus}
                    </Badge>
                );
            },
        }
    ];

    const rider = detailData?.rider || {};
    const perf = detailData?.performance || {};
    const orders = detailData?.orders || [];
    const pagination = detailData?.pagination;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl p-0 rounded-2xl overflow-hidden border-none shadow-2xl">
                <DialogHeader className="hidden">
                    <DialogTitle>Rider Details</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col h-[85vh] md:h-[700px] bg-white">
                    {/* Header Section */}
                    <div className="bg-gray-900 p-8 text-white relative">
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                        <div className="flex items-center gap-6">
                            <Avatar className="h-20 w-20 border-4 border-white/10 shadow-xl">
                                <AvatarImage src={rider.avatar} />
                                <AvatarFallback className="bg-red-600 text-white font-bold text-xl uppercase">
                                    {rider.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-2xl font-bold">{rider.name}</h2>
                                <p className="text-gray-400 text-sm font-medium mt-1">
                                    {rider.phone ? `+91 ${rider.phone}` : "No Identity"} • Joined {new Date(rider.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex items-center gap-2 mt-3">
                                    <Badge className={cn("rounded-full border-none px-3 text-[10px] font-medium uppercase", rider.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400')}>
                                        {rider.status}
                                    </Badge>
                                    {rider.kyc?.status === 'approved' ? (
                                        <div className="flex items-center gap-1 text-blue-400 font-medium text-[10px] uppercase">
                                            <ShieldCheck className="h-3 w-3" /> KYC Verified
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-amber-400 font-medium text-[10px] uppercase">
                                            <ShieldAlert className="h-3 w-3" /> KYC Pending
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#f8fafc]">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Completed", val: perf.deliveredCount, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
                                { label: "In Progress", val: perf.pendingCount, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
                                { label: "Completion", val: `${perf.completionRate}%`, icon: Bike, color: "text-purple-600", bg: "bg-purple-50" },
                                { label: "Total Load ", val: perf.totalOrders, icon: ShoppingBag, color: "text-orange-600", bg: "bg-orange-50" },
                            ].map((s) => (
                                <div key={s.label} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={cn("p-1.5 rounded-lg", s.bg)}>
                                            <s.icon className={cn("h-4 w-4", s.color)} />
                                        </div>
                                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{s.label}</span>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900">{isLoading ? ".." : s.val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Recent Deliveries Table */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Order History</h3>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <CustomDataTable
                                    columns={columns}
                                    data={orders}
                                    isLoading={isLoading}
                                    manualPagination={true}
                                    pageCount={pagination?.totalPages || 0}
                                    pagination={{
                                        pageIndex: page - 1,
                                        pageSize: limit
                                    }}
                                    onPaginationChange={(p) => {
                                        setPage(p.pageIndex + 1);
                                        setLimit(p.pageSize);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
