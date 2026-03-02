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
    const [statusFilter, setStatusFilter] = useState("delivered");
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

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
        queryKey: ["deliveredOrders", debouncedSearch, statusFilter, dateRange, page, limit],
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
                            <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Actions</DropdownMenuLabel>
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
        <div className="flex flex-col min-h-screen bg-[#f9fafb] p-6 lg:p-10 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Delivered Orders</h1>
                    <p className="text-gray-500 text-sm">Review your successfully completed deliveries and customer records.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-sm font-semibold text-gray-600">Total Completed</span>
                        <span className="bg-green-50 text-green-600 font-bold px-3 py-1 rounded-lg text-sm">
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
