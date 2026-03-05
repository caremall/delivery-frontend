"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    Plus,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomDataTable } from "@/components/common/CustomDataTable";
import { type ColumnDef } from "@tanstack/react-table";

// ─── Constants ──────────────────────────────────────────────────────────────

const statusColors = {
    delivered: {
        bg: "bg-[#f0fdf4]",
        border: "border-[#d1d5db]",
        text: "text-[#16a34a]",
    },
} as const;

function StatusBadge({ status }: { status: string }) {
    const s = status.toLowerCase();

    const config = (statusColors as any)[s] || {
        bg: "bg-gray-50",
        border: "border-gray-100",
        text: "text-gray-600",
    };

    let displayStatus = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <span
            className={cn(
                "inline-flex items-center px-4 py-1.5 rounded-md border text-xs font-medium w-[100px] justify-center",
                config.bg,
                config.border,
                config.text
            )}
        >
            {displayStatus}
        </span>
    );
}

function RiderAssignSelect({
    orderId,
    currentRiderId,
    currentRiderName,
    onSelect,
    isAssigning,
}: {
    orderId: string;
    currentRiderId?: string;
    currentRiderName?: string;
    onSelect: (id: string) => void;
    isAssigning?: boolean;
}) {
    return (
        <span className="text-sm text-gray-700 font-medium">
            {currentRiderName || "No Rider"}
        </span>
    );
}

export default function DeliveredOrdersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ["deliveredOrders", debouncedSearch, page, limit],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (debouncedSearch) params.append("search", debouncedSearch);
            params.append("status", "delivered");
            params.append("page", String(page));
            params.append("limit", String(limit));
            const res = await axiosInstance.get(`/orders?${params.toString()}`);
            return res.data.data;
        },
    });

    const orders = ordersData?.orders || [];
    const pagination = ordersData?.pagination;

    function getAssignedRider(order: any) {
        if (order.rider) return order.rider;
        const hubDispatch = order.dispatches?.slice().reverse().find((d: any) => d.dispatchType === "delivery_hub" || d.rider);
        return hubDispatch?.rider || null;
    }

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "orderId",
            header: "Order ID",
            cell: ({ row }) => <span className="font-medium text-[#111827] text-sm tracking-wide">{row.original.orderId}</span>,
        },
        {
            accessorKey: "shippingAddress.fullName",
            header: "Customer Name",
            cell: ({ row }) => <span className="text-[#374151] font-semibold text-sm">{row.original.shippingAddress?.fullName || "-"}</span>,
        },
        {
            accessorKey: "shippingAddress.address1",
            header: "Address",
            cell: ({ row }) => (
                <span className="text-[#6b7280] text-sm max-w-[200px] truncate block" title={`${row.original.shippingAddress?.address1}, ${row.original.shippingAddress?.city}`}>
                    {row.original.shippingAddress?.address1}, {row.original.shippingAddress?.city}
                </span>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Delivery Date",
            cell: ({ row }) => (
                <span className="text-[#6b7280] text-sm tabular-nums">
                    {new Date(row.original.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
                </span>
            ),
        },
        {
            id: "rider",
            header: "Delivery Rider",
            cell: ({ row }) => {
                const assignedRider = getAssignedRider(row.original);
                return (
                    <RiderAssignSelect
                        orderId={row.original._id}
                        currentRiderId={assignedRider?._id}
                        currentRiderName={assignedRider?.name}
                        onSelect={() => { }}
                    />
                )
            }
        },
        {
            id: "orderStatus",
            header: () => <div className="text-center">Status</div>,
            cell: ({ row }) => <div className="flex justify-center"><StatusBadge status={row.original.orderStatus} /></div>,
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="h-10 w-10 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-100 shadow-none hover:shadow-sm transition-all focus:outline-none cursor-pointer">
                                <MoreHorizontal className="h-6 w-6" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-100 p-1">
                            <DropdownMenuLabel className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href={`/orders/${row.original._id}`}>
                                <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2 text-sm">View Details</DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2 text-sm">Call Customer</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fafb] p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold text-gray-800 tracking-tight">Delivered Orders</h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">Completed deliveries and customer records</p>
                </div>
                {orders.length > 0 && (
                    <div className="flex items-center gap-2 bg-white border border-emerald-100 px-4 py-2 rounded-xl shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-[12px] font-medium text-gray-600">
                            <span className="text-emerald-600 font-semibold">{pagination?.total || orders.length}</span> completed
                        </span>
                    </div>
                )}
            </div>

            <Card className="bg-white border-none rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                <CardContent className="p-0">
                    <CustomDataTable
                        columns={columns}
                        data={orders}
                        isLoading={isLoading}
                        manualPagination={true}
                        pageCount={pagination?.totalPages || 0}
                        pagination={{ pageIndex: page - 1, pageSize: limit }}
                        onPaginationChange={(p) => { setPage(p.pageIndex + 1); setLimit(p.pageSize); }}
                        onSearch={(term) => setSearch(term)}
                        filters={[
                            {
                                type: "date",
                                column: "createdAt",
                                placeholder: "Filter by Date",
                            },
                        ]}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
