"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
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
    pending: {
        bg: "bg-[#eef2ff]",
        border: "border-[#d1d5db]",
        text: "text-[#4f46e5]",
    },
    processing: {
        bg: "bg-[#eef2ff]",
        border: "border-[#d1d5db]",
        text: "text-[#4f46e5]",
    },
    confirmed: {
        bg: "bg-[#eef2ff]",
        border: "border-[#d1d5db]",
        text: "text-[#4f46e5]",
    },
    packed: {
        bg: "bg-[#fdf2f8]",
        border: "border-[#d1d5db]",
        text: "text-[#db2777]",
    },
    in_transit: {
        bg: "bg-[#fff7ed]",
        border: "border-[#d1d5db]",
        text: "text-[#ea580c]",
    },
    out_for_delivery: {
        bg: "bg-[#fff7ed]",
        border: "border-[#d1d5db]",
        text: "text-[#ea580c]",
    },
    delivered: {
        bg: "bg-[#f0fdf4]",
        border: "border-[#d1d5db]",
        text: "text-[#16a34a]",
    },
    dispatched: {
        bg: "bg-[#fef9c3]",
        border: "border-[#fde047]",
        text: "text-[#854d0e]",
    },
    shipped: {
        bg: "bg-[#fef9c3]",
        border: "border-[#fde047]",
        text: "text-[#854d0e]",
    },
    cancelled: {
        bg: "bg-[#fef2f2]",
        border: "border-[#fecaca]",
        text: "text-[#dc2626]",
    },
} as const;

const statusFilters = [
    { label: "All Pending", value: "pending" },
    { label: "Processing", value: "processing" },
];

function StatusBadge({ status }: { status: string }) {
    const s = status.toLowerCase();
    const normalizedStatus = (s === "assigned") ? "dispatched" : s;

    const config = (statusColors as any)[normalizedStatus] || {
        bg: "bg-gray-50",
        border: "border-gray-100",
        text: "text-gray-600",
    };

    let displayStatus = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    if (s === "out_for_delivery") displayStatus = "In Transit";
    if (s === "pending" || s === "processing" || s === "confirmed") displayStatus = "Pending";
    if (s === "assigned" || s === "dispatched") displayStatus = "Dispatched";
    if (s === "shipped") displayStatus = "Shipped";

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
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: ridersData, isLoading } = useQuery({
        queryKey: ["ridersForSelect", debouncedSearch],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (debouncedSearch) params.append("search", debouncedSearch);
            params.append("status", "active");
            params.append("limit", "10");
            const res = await axiosInstance.get(`/riders?${params.toString()}`);
            return res.data.data;
        },
        enabled: open,
    });

    const riders = ridersData?.riders || [];

    return (
        <div className="relative inline-block text-left">
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <button
                        className={cn(
                            "flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer outline-none",
                            currentRiderName ? "text-[#374151] hover:text-red-600" : "text-red-500 hover:text-red-600"
                        )}
                        disabled={isAssigning}
                    >
                        {isAssigning ? "Assigning..." : currentRiderName || "Assign Rider +"}
                        {!isAssigning && !currentRiderName && <Plus className="h-4 w-4" />}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[240px] p-0 shadow-xl border-gray-200 rounded-xl">
                    <div className="p-2 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <Input
                                placeholder="Search riders..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8 pl-8 text-xs bg-white rounded-lg border-gray-200"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="max-h-[220px] overflow-y-auto p-1">
                        {isLoading ? (
                            <div className="py-6 text-center text-xs text-gray-400 italic">Finding riders...</div>
                        ) : riders.length === 0 ? (
                            <div className="py-6 text-center text-xs text-gray-400">No active riders found</div>
                        ) : (
                            riders.map((rider: any) => (
                                <DropdownMenuItem
                                    key={rider._id}
                                    onClick={() => onSelect(rider._id)}
                                    className="flex items-center justify-between px-3 py-2 cursor-pointer focus:bg-red-50 focus:text-red-600 rounded-lg group"
                                >
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-semibold truncate group-hover:text-red-600 transition-colors">{rider.name}</span>
                                        <span className="text-[10px] text-gray-400">{rider.phone}</span>
                                    </div>
                                    {currentRiderId === rider._id && (
                                        <div className="h-2 w-2 rounded-full bg-red-600" />
                                    )}
                                </DropdownMenuItem>
                            ))
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default function PendingOrdersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ["pendingOrders", debouncedSearch, page, limit],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (debouncedSearch) params.append("search", debouncedSearch);
            params.append("status", "pending");
            params.append("page", String(page));
            params.append("limit", String(limit));
            const res = await axiosInstance.get(`/orders?${params.toString()}`);
            return res.data.data;
        },
    });

    const assignRider = useMutation({
        mutationFn: async ({ orderId, riderId }: { orderId: string; riderId: string }) => {
            const res = await axiosInstance.put(`/orders/${orderId}/assign-rider`, { riderId });
            return res.data;
        },
        onMutate: ({ orderId }) => setAssigningOrderId(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pendingOrders"] });
            setAssigningOrderId(null);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to assign rider");
            setAssigningOrderId(null);
        },
    });

    const orders = ordersData?.orders || [];
    const pagination = ordersData?.pagination;
    const ordersToAssignCount = ordersData?.ordersToAssignCount || 0;

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
                        isAssigning={assigningOrderId === row.original._id}
                        onSelect={(riderId) => assignRider.mutate({ orderId: row.original._id, riderId })}
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50">Mark as Problem</DropdownMenuItem>
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
                    <h1 className="text-lg font-semibold text-gray-800 tracking-tight">Pending Orders</h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">Orders waiting to be processed and assigned to riders</p>
                </div>
                {ordersToAssignCount > 0 && (
                    <div className="flex items-center gap-2 bg-white border border-orange-100 px-4 py-2 rounded-xl shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        <span className="text-[12px] font-medium text-gray-600">
                            <span className="text-orange-600 font-semibold">{ordersToAssignCount}</span> unassigned
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
                                type: "select",
                                column: "orderStatus",
                                placeholder: "Filter by Status",
                                options: statusFilters.map(f => ({ value: f.value, label: f.label })),
                            },
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
