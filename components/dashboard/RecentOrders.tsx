import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ChevronDown, ChevronUp, IndianRupee, Package, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

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
                        {isAssigning ? "Assigning..." : currentRiderName || "Assign Rider"}
                        {!isAssigning && !currentRiderName && <Plus className="h-4 w-4" />}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[240px] p-0 shadow-xl border-gray-200 rounded-xl bg-white z-50">
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
                                    className="flex items-center justify-between px-3 py-2 cursor-pointer border-none outline-none focus:bg-red-50 focus:text-red-600 rounded-lg group"
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

export default function RecentOrders({ orders, isLoading }: { orders?: any[], isLoading: boolean }) {
    const queryClient = useQueryClient();
    const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredOrders = React.useMemo(() => {
        if (!searchTerm) return orders || [];
        const term = searchTerm.toLowerCase();
        return (orders || []).filter(order => 
            order.orderId?.toLowerCase().includes(term) ||
            order.shippingAddress?.fullName?.toLowerCase().includes(term) ||
            order.shippingAddress?.city?.toLowerCase().includes(term)
        );
    }, [orders, searchTerm]);

    const assignRider = useMutation({
        mutationFn: async ({ orderId, riderId }: { orderId: string; riderId: string }) => {
            const res = await axiosInstance.put(`/orders/${orderId}/assign-rider`, { riderId });
            return res.data;
        },
        onMutate: ({ orderId }) => setAssigningOrderId(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            toast.success("Rider assigned successfully");
            setAssigningOrderId(null);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to assign rider");
            setAssigningOrderId(null);
        },
    });

    const getAssignedRider = (order: any) => {
        if (order.rider) return order.rider;
        const hubDispatch = order.dispatches?.slice().reverse().find((d: any) => d.dispatchType === "delivery_hub" || d.rider);
        return hubDispatch?.rider || null;
    };

    const getStatusStyle = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'delivered') return "bg-green-50 text-green-500 border border-green-200";
        if (s === 'shipped' || s === 'in_transit' || s === 'out_for_delivery') return "bg-orange-50 text-orange-500 border border-orange-200";
        if (s === 'pending' || s === 'processing' || s === 'confirmed') return "bg-blue-50 text-blue-500 border border-blue-200";
        if (s === 'packed') return "bg-pink-50 text-pink-500 border border-pink-200";
        return "bg-gray-50 text-gray-500 border border-gray-200";
    };

    const currentOrders = filteredOrders;

    return (
        <Card className="rounded-xl border border-gray-100 shadow-sm bg-white h-full flex flex-col">
            <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between border-b border-gray-50">
                <CardTitle className="text-[14px] font-medium text-gray-800 uppercase tracking-wider">Recent Orders</CardTitle>
                <Link href="/orders/all-orders">
                    <button className="text-red-500 hover:text-red-600 font-medium text-[12px] transition-colors cursor-pointer">
                        See all
                    </button>
                </Link>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-full bg-white">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 pl-10 pr-10 rounded-xl border border-gray-100 bg-gray-50/50 text-[13px] font-medium outline-none focus:border-red-500/30 transition-all placeholder:text-gray-300"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto bg-white flex-1 min-h-[400px]">
                    <table className="w-full text-left table-fixed">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="w-[18%] px-5 py-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                                <th className="w-[22%] px-5 py-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="w-[14%] px-5 py-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="w-[24%] px-5 py-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Rider</th>
                                <th className="w-[22%] px-5 py-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className={cn("animate-pulse border-b border-gray-50", idx % 2 === 1 && "bg-gray-50/40")}>
                                        <td className="px-5 py-3.5"><div className="h-3.5 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-5 py-3.5"><div className="h-3.5 bg-gray-100 rounded w-28"></div></td>
                                        <td className="px-5 py-3.5"><div className="h-3.5 bg-gray-100 rounded w-16"></div></td>
                                        <td className="px-5 py-3.5"><div className="h-3.5 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-5 py-3.5"><div className="h-5 bg-gray-100 rounded w-16"></div></td>
                                    </tr>
                                ))
                            ) : currentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm italic">
                                        {searchTerm ? "No orders matching your search" : "No recent orders found"}
                                    </td>
                                </tr>
                            ) : (
                                currentOrders.map((order, idx) => {
                                    const assignedRider = getAssignedRider(order);
                                    const date = order.createdAt
                                        ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                                        : "";
                                    const itemCount = order.items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0) || 0;
                                    return (
                                        <tr
                                            key={idx}
                                            className={cn(
                                                "border-b border-gray-50 hover:bg-blue-50/30 transition-colors group",
                                                idx % 2 === 1 && "bg-gray-50/40"
                                            )}
                                        >
                                            {/* Order ID + date */}
                                            <td className="px-5 py-3 align-middle">
                                                <span className="text-[12px] font-mono font-medium text-indigo-600 truncate block">{order.orderId}</span>
                                                <span className="text-[10px] text-gray-400">{date}</span>
                                            </td>
                                            {/* Customer */}
                                            <td className="px-5 py-3 align-middle">
                                                <span className="text-[12px] font-medium text-gray-800 truncate block">{order.shippingAddress?.fullName || "—"}</span>
                                                <span className="text-[10px] text-gray-400 truncate block">{order.shippingAddress?.city || ""}</span>
                                            </td>
                                            {/* Amount */}
                                            <td className="px-5 py-3 align-middle">
                                                <span className="text-[12px] font-semibold text-gray-800">₹{order.totalAmount?.toLocaleString() || "—"}</span>
                                                {itemCount > 0 && (
                                                    <span className="flex items-center gap-0.5 text-[10px] text-gray-400 mt-0.5">
                                                        <Package className="h-2.5 w-2.5" />{itemCount} item{itemCount !== 1 ? "s" : ""}
                                                    </span>
                                                )}
                                            </td>
                                            {/* Rider */}
                                            <td className="px-5 py-3 align-middle">
                                                <RiderAssignSelect
                                                    orderId={order._id}
                                                    currentRiderId={assignedRider?._id}
                                                    currentRiderName={assignedRider?.name}
                                                    isAssigning={assigningOrderId === order._id}
                                                    onSelect={(riderId) => assignRider.mutate({ orderId: order._id, riderId })}
                                                />
                                            </td>
                                            {/* Status */}
                                            <td className="px-5 py-3 align-middle">
                                                <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-md text-[11px] font-medium capitalize", getStatusStyle(order.orderStatus))}>
                                                    {order.orderStatus?.replace(/_/g, ' ')}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

