"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, UserIcon, Calendar, Truck, UserCircle, Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAssignedReturns, ReturnRequest } from "@/lib/api/returns";
import { CustomDataTable } from "@/components/common/CustomDataTable";
import { ColumnDef } from "@tanstack/react-table";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function ReturnsTable() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("all");
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedReturnDoc, setSelectedReturnDoc] = useState<ReturnRequest | null>(null);

    const queryClient = useQueryClient();

    const { data: returnsData, isLoading } = useQuery({
        queryKey: ["assignedReturns", page, status],
        queryFn: () => getAssignedReturns({ page, status }),
        refetchInterval: 30000,
    });

    const { data: ridersData } = useQuery({
        queryKey: ["activeRiders"],
        queryFn: async () => {
            const res = await axiosInstance.get("/riders/list/active?limit=50");
            return res.data.data.riders;
        },
        enabled: isAssignModalOpen,
    });

    const assignMutation = useMutation({
        mutationFn: async ({ returnId, riderId }: { returnId: string, riderId: string }) => {
            const res = await axiosInstance.put(`/warehouse/returns/${returnId}/assign-rider`, { riderId });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assignedReturns"] });
            setIsAssignModalOpen(false);
            setSelectedReturnDoc(null);
        }
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
                <Link href={`/returns/${row.original._id}`} className="group">
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
            header: "Requested At",
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
                    return (
                        <Button
                            variant={"outline"}
                            size="sm"
                            className="text-[10px] h-7 px-2"
                            onClick={() => {
                                setSelectedReturnDoc(row.original);
                                setIsAssignModalOpen(true);
                            }}
                        >
                            <Bike className="w-3 h-3 mr-1" /> Assign Rider
                        </Button>
                    );
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
                    <Link href={`/returns/${row.original._id}`}>
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
            <CardHeader className="p-6 pb-2 border-b border-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                    <CardTitle className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                            <Truck className="h-5 w-5 text-red-500" />
                        </div>
                        Assigned Return Requests
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPage(1);
                            }}
                            className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-red-500/20"
                        >
                            <option value="all">All Status</option>
                            <option value="requested">Requested</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
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

            {/* Rider Assignment Modal */}
            <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Rider for Return Pickup</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 font-mono text-sm text-gray-500 mb-2 border-b">
                        Return ID: <span className="font-bold text-indigo-600">{selectedReturnDoc?.returnId}</span>
                    </div>
                    {ridersData?.length === 0 ? (
                        <div className="text-center text-sm text-gray-500 py-6">
                            No active riders available.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
                            {ridersData?.map((rider: any) => (
                                <div key={rider._id} className="flex items-center justify-between p-3 border rounded-lg hover:border-red-200 hover:bg-red-50 cursor-pointer transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={rider.avatar} />
                                            <AvatarFallback>{rider.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{rider.name}</span>
                                            <span className="text-xs text-gray-500">{rider.phone}</span>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={assignMutation.isPending}
                                        onClick={() => assignMutation.mutate({ returnId: selectedReturnDoc?._id!, riderId: rider._id })}
                                    >
                                        {assignMutation.isPending ? "Assigning..." : "Assign"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}
