"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    Filter,
    MoreHorizontal,
    Plus,
    CalendarDays,
    X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
    shipped: {
        bg: "bg-[#fef9c3]",
        border: "border-[#fde047]",
        text: "text-[#854d0e]",
    },
    dispatched: {
        bg: "bg-[#fef9c3]",
        border: "border-[#fde047]",
        text: "text-[#854d0e]",
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
} as const;

const statusFilters = [
    { label: "All Shipped", value: "shipped" },
    { label: "Dispatch Ready", value: "dispatched" },
    { label: "In Transit", value: "in_transit" },
    { label: "Out for Delivery", value: "out_for_delivery" },
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

export default function ShippedOrdersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("shipped");
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });
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

    const {
        data: ordersData,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["shippedOrders", debouncedSearch, statusFilter, dateRange, page, limit],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (debouncedSearch) params.append("search", debouncedSearch);
            if (statusFilter) params.append("status", statusFilter);
            if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
            if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());
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
            queryClient.invalidateQueries({ queryKey: ["shippedOrders"] });
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
            cell: ({ row }) => <span className="font-bold text-[#111827] text-sm tracking-wide">{row.original.orderId}</span>,
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
                            <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Actions</DropdownMenuLabel>
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
        <div className="flex flex-col min-h-screen bg-[#f9fafb] p-6 lg:p-10 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Shipped Orders</h1>
                    <p className="text-gray-500 text-sm">Track orders that are currently in transit or out for delivery.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-sm font-semibold text-gray-600">Active Shipments</span>
                        <span className="bg-red-50 text-red-600 font-bold px-3 py-1 rounded-lg text-sm">
                            {String(orders.length).padStart(2, '0')}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="h-11 px-5 rounded-xl border-gray-200 bg-white gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                                    <CalendarDays className="h-4.5 w-4.5 text-gray-400" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                                {format(dateRange.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={(range) => {
                                        setDateRange(range);
                                        if (range?.from && range?.to) {
                                            setPage(1);
                                        }
                                    }}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>

                        {dateRange?.from && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDateRange(undefined)}
                                className="h-11 w-11 rounded-xl text-gray-400 hover:text-red-600"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-11 px-5 rounded-xl border-gray-200 bg-white gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                                <Filter className="h-4.5 w-4.5 text-gray-400" />
                                {statusFilter ? statusFilters.find(f => f.value === statusFilter)?.label : "Filter By Status"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px] rounded-xl shadow-xl border-gray-100 p-1">
                            <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {statusFilters.map((f) => (
                                <DropdownMenuItem
                                    key={f.value}
                                    onClick={() => { setStatusFilter(f.value); setPage(1); }}
                                    className={cn("cursor-pointer rounded-lg mx-1 px-3 py-2 text-sm", statusFilter === f.value ? "bg-red-50 text-red-600 font-semibold" : "")}
                                >
                                    {f.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Card className="bg-white border-none rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                <CardContent className="p-0">
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
                        onPaginationChange={(newPagination) => {
                            setPage(newPagination.pageIndex + 1);
                            setLimit(newPagination.pageSize);
                        }}
                        onSearch={(term) => {
                            setSearch(term);
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
