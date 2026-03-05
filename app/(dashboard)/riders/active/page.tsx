"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    Bike,
    PackageCheck,
    Truck,
    Phone,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { RiderDetailView } from "@/components/dashboard/RiderDetailView";

export default function ActiveRidersPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: activeRidersData, isLoading } = useQuery({
        queryKey: ["active-riders", debouncedSearch, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (debouncedSearch) params.append("search", debouncedSearch);
            params.append("page", String(page));
            params.append("limit", "12");
            return (await axiosInstance.get(`/riders/list/active?${params}`)).data.data;
        },
    });

    const riders = activeRidersData?.riders || [];
    const pagination = activeRidersData?.pagination;

    return (
        <div className="flex flex-col min-h-screen bg-[#f7f8fa] p-6 lg:p-8 space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg font-semibold text-gray-800 tracking-tight">Active Fleet</h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                        Riders currently on-duty with approved KYC
                        {pagination?.totalRiders ? (
                            <span className="ml-1.5 inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold">
                                {pagination.totalRiders} active
                            </span>
                        ) : null}
                    </p>
                </div>

                <div className="relative w-full sm:max-w-[260px] group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                    <Input
                        placeholder="Search riders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 rounded-xl bg-white border-gray-100 shadow-sm text-[13px] focus-visible:ring-1 focus-visible:ring-gray-200"
                    />
                </div>
            </div>

            {/* ── Grid ── */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-[200px] bg-white rounded-2xl animate-pulse border border-gray-50 shadow-sm" />
                    ))}
                </div>
            ) : riders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Bike className="h-10 w-10 text-gray-200 mb-3" />
                    <p className="text-[13px] font-semibold text-gray-400">No active riders found</p>
                    <p className="text-[11px] text-gray-300 mt-1">Try adjusting your search or check KYC approvals</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {riders.map((rider: any) => {
                            const delivered = rider.performance?.deliveredCount || 0;
                            const inTransit = rider.performance?.pendingCount || 0;
                            const totalOrders = rider.performance?.totalOrders || 0;
                            // Use backend-computed rate (same formula as detail view)
                            const rate = rider.performance?.completionRate ?? (totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : null);

                            return (
                                <div
                                    key={rider._id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
                                >
                                    {/* Top accent */}
                                    <div className="h-[3px] bg-emerald-400 w-full" />

                                    <div className="p-4">
                                        {/* Header row */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-shrink-0">
                                                    <Avatar className="h-10 w-10 border border-gray-100 shadow-sm">
                                                        <AvatarImage src={rider.avatar || undefined} />
                                                        <AvatarFallback className="bg-emerald-50 text-emerald-700 text-xs font-semibold">
                                                            {rider.name?.charAt(0) || "R"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {/* Online dot */}
                                                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-400 border-2 border-white rounded-full" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-semibold text-gray-800 truncate leading-tight">
                                                        {rider.name}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Phone className="h-2.5 w-2.5 text-gray-400" />
                                                        <span className="text-[10px] text-gray-400">+91 {rider.phone}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl w-40 shadow-lg border-gray-100 p-1">
                                                    <DropdownMenuItem className="rounded-lg px-3 py-2 text-[12px] font-medium cursor-pointer" onClick={() => setSelectedRiderId(rider._id)}>
                                                        View Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="rounded-lg px-3 py-2 text-[12px] font-medium text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                                                        Mark Off Duty
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* KYC badge */}
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-100 mb-3">
                                            <ShieldCheck className="h-2.5 w-2.5 text-green-600" />
                                            <span className="text-[9px] font-semibold text-green-700 uppercase tracking-wider">KYC Approved</span>
                                        </div>

                                        {/* Stats row */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-gray-50 rounded-xl p-2.5 flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1">
                                                    <PackageCheck className="h-3 w-3 text-emerald-500" />
                                                    <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Delivered</span>
                                                </div>
                                                <span className="text-lg font-semibold text-gray-800 tabular-nums leading-none">{delivered}</span>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-2.5 flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1">
                                                    <Truck className="h-3 w-3 text-indigo-400" />
                                                    <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">In-Transit</span>
                                                </div>
                                                <span className="text-lg font-semibold text-gray-800 tabular-nums leading-none">{inTransit}</span>
                                            </div>
                                        </div>

                                        {/* Completion rate */}
                                        {rate !== null && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Completion rate</span>
                                                    <span className="text-[10px] font-semibold text-gray-600">{rate}%</span>
                                                </div>
                                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                                                        style={{ width: `${rate}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-[12px] text-gray-400">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pagination.hasPrev}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="h-8 px-3 rounded-lg text-[12px] font-medium border-gray-100 bg-white"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pagination.hasNext}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="h-8 px-3 rounded-lg text-[12px] font-medium border-gray-100 bg-white"
                                >
                                    Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
            {/* ── Detail Modal ── */}
            {selectedRiderId && (
                <RiderDetailView
                    riderId={selectedRiderId}
                    isOpen={!!selectedRiderId}
                    onClose={() => setSelectedRiderId(null)}
                />
            )}
        </div>
    );
}

