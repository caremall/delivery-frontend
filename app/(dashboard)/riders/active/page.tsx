"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    Bike,
    UserCheck,
    ShieldCheck,
    Phone,
    Mail,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    PackageCheck,
    Truck,
    MapPin,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ActiveRidersPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: activeRidersData, isLoading } = useQuery({
        queryKey: ["active-riders", debouncedSearch, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (debouncedSearch) params.append("search", debouncedSearch);
            params.append("page", String(page));
            params.append("limit", "12"); // Show 12 cards per page (3x4 or 2x6)
            const res = await axiosInstance.get(`/riders/list/active?${params.toString()}`);
            return res.data.data;
        },
    });

    const riders = activeRidersData?.riders || [];
    const pagination = activeRidersData?.pagination;

    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-8">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#0f172a] tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <UserCheck className="h-6 w-6 text-emerald-600" />
                        </div>
                        Active Fleet
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        Displaying riders who are currently On-Duty and KYC Approved
                    </p>
                </div>

                <div className="relative w-full sm:max-w-xs group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#dc2626] transition-colors" />
                    <Input
                        placeholder="Search active riders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-11 h-12 rounded-2xl bg-white border-none shadow-sm focus-visible:ring-2 focus-visible:ring-red-600/20 font-medium text-sm transition-all"
                    />
                </div>
            </div>

            {/* Grid Layout for Active Riders */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-[280px] bg-white rounded-3xl animate-pulse shadow-sm" />
                    ))}
                </div>
            ) : riders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Bike className="h-16 w-16 text-gray-200 mb-4" />
                    <p className="text-lg font-bold text-gray-400">No active riders found</p>
                    <p className="text-sm text-gray-300">Try adjusting your search or check KYC approvals</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {riders.map((rider: any) => (
                            <Card key={rider._id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden bg-white">
                                <CardContent className="p-6">
                                    {/* Rider Profile Section */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="relative">
                                            <Avatar className="h-16 w-16 border-4 border-emerald-50 shadow-md">
                                                <AvatarImage src={rider.avatar || undefined} />
                                                <AvatarFallback className="bg-red-50 text-red-600 font-black">
                                                    {rider.name?.charAt(0) || "R"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm">
                                                <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse" title="Online" />
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                                                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-2xl w-48 shadow-xl border-none p-2">
                                                <DropdownMenuLabel>Fleet Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="rounded-xl py-2 cursor-pointer font-medium">View Profile</DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-xl py-2 cursor-pointer font-medium text-red-600">Mark Off Duty</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-[#0f172a] truncate">{rider.name}</h3>
                                        <p className="text-xs text-gray-400 font-bold tracking-tight uppercase">HUB: Kochi Central</p>
                                    </div>

                                    {/* Performance Metrics */}
                                    <div className="grid grid-cols-2 gap-3 mt-6">
                                        <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <PackageCheck className="h-3.5 w-3.5 text-emerald-600" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Completed</span>
                                            </div>
                                            <span className="text-xl font-black text-[#0f172a]">{rider.performance?.deliveredCount || 0}</span>
                                        </div>

                                        <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Truck className="h-3.5 w-3.5 text-indigo-600" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase">In-Transit</span>
                                            </div>
                                            <span className="text-xl font-black text-[#0f172a]">{rider.performance?.pendingCount || 0}</span>
                                        </div>
                                    </div>

                                    {/* Contact Info Tags */}
                                    <div className="flex flex-wrap gap-2 mt-6">
                                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                                            <Phone className="h-3 w-3" /> {rider.phone}
                                        </Badge>
                                        {rider.email && (
                                            <Badge variant="secondary" className="bg-slate-50 text-slate-600 hover:bg-slate-100 border-none px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 max-w-[120px] truncate">
                                                <Mail className="h-3 w-3" /> {rider.email}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="p-2 pt-0 px-4 pb-4">
                                    <Button className="w-full bg-[#dc2626] hover:bg-red-700 text-white font-black h-11 rounded-2xl flex gap-2 items-center shadow-md shadow-red-100 transition-all active:scale-[0.98]">
                                        <MapPin className="h-4 w-4" /> LIVE TRACKING
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-4">
                            <p className="text-sm text-gray-500 font-medium">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </p>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pagination.hasPrev}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="rounded-xl h-10 px-4 font-bold border-none shadow-sm bg-white"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pagination.hasNext}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="rounded-xl h-10 px-4 font-bold border-none shadow-sm bg-white"
                                >
                                    Next <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
