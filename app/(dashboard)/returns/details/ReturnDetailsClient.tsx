"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Package, User, Building2, Calendar, CreditCard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getReturnById, updateReturnItemStatus, assignRiderToReturn, updateReplacementDeliveryStatus } from "@/lib/api/returns";
import axiosInstance from "@/lib/axios";

interface ReturnDetailsClientProps {
    id: string;
}

export default function ReturnDetailsClient({ id }: ReturnDetailsClientProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: response, isLoading } = useQuery({
        queryKey: ["returnDetails", id],
        queryFn: () => getReturnById(id),
    });

    const returnData = response?.data;

    const { data: ridersData } = useQuery({
        queryKey: ["activeRiders"],
        queryFn: async () => {
            const res = await axiosInstance.get("/riders/list/active?limit=50");
            return res.data.data.riders;
        },
    });

    const updateItemStatusMutation = useMutation({
        mutationFn: ({ status }: { status: string }) => updateReturnItemStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["returnDetails", id] });
            toast.success("Return item status updated");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update status");
        }
    });

    const assignRiderMutation = useMutation({
        mutationFn: ({ riderId }: { riderId: string }) => assignRiderToReturn(id, riderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["returnDetails", id] });
            toast.success("Rider assigned correctly");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to assign rider");
        }
    });

    const updateReplacementStatusMutation = useMutation({
        mutationFn: ({ status }: { status: string }) => updateReplacementDeliveryStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["returnDetails", id] });
            toast.success("Replacement delivery status updated");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update status");
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
            </div>
        );
    }

    if (!returnData) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-gray-500">Return request not found</p>
                    <Button onClick={() => router.back()} variant="outline">Go Back</Button>
                </div>
            </div>
        );
    }

    const isReplacement = returnData?.returnType === "replacement";

    // Status color: requested, approved, rejected, completed
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "requested": return "bg-yellow-100 text-yellow-800";
            case "approved": return "bg-blue-100 text-blue-800";
            case "rejected": return "bg-red-100 text-red-800";
            case "completed": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // Return item status color: pending, picked, dropped, sent, received, rejected_picked, rejected_dropped
    const getReturnItemStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-gray-100 text-gray-800";
            case "picked": return "bg-blue-100 text-blue-800";
            case "dropped": return "bg-purple-100 text-purple-800";
            case "sent": return "bg-indigo-100 text-indigo-800";
            case "received": return "bg-green-100 text-green-800";
            case "rejected_picked": return "bg-red-100 text-red-800";
            case "rejected_dropped": return "bg-orange-100 text-orange-800";
            case "rejected_sent": return "bg-red-100 text-red-800";
            case "rejected_received": return "bg-orange-100 text-orange-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // Refund status color: pending, refunded, not_applicable
    const getRefundStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-orange-50 text-orange-700";
            case "refunded": return "bg-green-50 text-green-700";
            case "not_applicable": return "bg-gray-50 text-gray-600";
            default: return "bg-orange-50 text-orange-700";
        }
    };

    // Pickup status color: pending, item_picked, item_delivered, shipped, delivered
    const getPickupStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-gray-100 text-gray-700";
            case "item_picked": return "bg-blue-100 text-blue-700";
            case "item_delivered": return "bg-green-100 text-green-700";
            case "shipped": return "bg-indigo-100 text-indigo-700";
            case "delivered": return "bg-emerald-100 text-emerald-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    // Replacement delivery status color: pending, sent, received
    const getReplacementDeliveryStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-gray-100 text-gray-700";
            case "sent": return "bg-indigo-100 text-indigo-700";
            case "received": return "bg-green-100 text-green-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    // Return type color
    const getReturnTypeColor = (type: string) => {
        return type === 'replacement' ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800";
    };

    // Reason color: damaged, wrong_item, not_needed, other
    const getReasonColor = (reason: string) => {
        switch (reason?.toLowerCase()) {
            case "damaged": return "bg-red-50 text-red-700";
            case "wrong_item": return "bg-orange-50 text-orange-700";
            case "not_needed": return "bg-yellow-50 text-yellow-700";
            case "other": return "bg-gray-50 text-gray-700";
            default: return "bg-gray-50 text-gray-700";
        }
    };

    // Refund method color: bank, upi, source, not_applicable
    const getRefundMethodColor = (method: string) => {
        switch (method?.toLowerCase()) {
            case "bank": return "bg-blue-50 text-blue-700";
            case "upi": return "bg-purple-50 text-purple-700";
            case "source": return "bg-green-50 text-green-700";
            case "not_applicable": return "bg-gray-50 text-gray-600";
            default: return "bg-gray-50 text-gray-700";
        }
    };

    const product = returnData?.item?.product;
    const variant = returnData?.item?.variant;
    const productName = product?.productName || "Unnamed Product";
    const productImage = variant?.images?.[0] || product?.productImages?.[0] || "/placeholder.svg";
    const sku = product?.SKU || variant?.SKU || "N/A";

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => router.back()}
                            className="border cursor-pointer bg-white"
                            variant="ghost"
                            size="icon"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h2 className="text-xl lg:text-2xl font-semibold">
                                Return ID: {returnData?.returnId}
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span>
                                    Requested:{" "}
                                    {returnData?.requestedAt
                                        ? new Date(returnData.requestedAt).toLocaleDateString()
                                        : "N/A"}
                                </span>
                                <Badge className={cn("border-0", getStatusColor(returnData?.status))}>
                                    {returnData?.status}
                                </Badge>
                                <Badge className={cn("border-0", getReturnTypeColor(returnData?.returnType))}>
                                    {returnData?.returnType === 'return' ? "Refund" : returnData?.returnType}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* All Statuses Overview Card */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg">All Status Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="border rounded-lg p-3 space-y-1">
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Return Status</span>
                                        <div>
                                            <Badge className={cn("border-0 capitalize", getStatusColor(returnData?.status))}>
                                                {returnData?.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="border rounded-lg p-3 space-y-1">
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Return Item Status</span>
                                        <div>
                                            <Badge className={cn("border-0 capitalize", getReturnItemStatusColor(returnData?.returnItemStatus))}>
                                                {returnData?.returnItemStatus?.replace(/_/g, " ") || "pending"}
                                            </Badge>
                                        </div>
                                    </div>
                                    {!isReplacement && (
                                        <div className="border rounded-lg p-3 space-y-1">
                                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Refund Status</span>
                                            <div>
                                                <Badge className={cn("border-0 capitalize", getRefundStatusColor(returnData?.refundStatus))}>
                                                    {returnData?.refundStatus?.replace(/_/g, " ") || "pending"}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                    <div className="border rounded-lg p-3 space-y-1">
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Pickup Status</span>
                                        <div>
                                            <Badge className={cn("border-0 capitalize", getPickupStatusColor(returnData?.pickupStatus))}>
                                                {returnData?.pickupStatus?.replace(/_/g, " ") || "pending"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="border rounded-lg p-3 space-y-1">
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Return Type</span>
                                        <div>
                                            <Badge className={cn("border-0 capitalize", getReturnTypeColor(returnData?.returnType))}>
                                                {returnData?.returnType === 'return' ? "Refund" : returnData?.returnType}
                                            </Badge>
                                        </div>
                                    </div>
                                    {isReplacement && (
                                        <div className="border rounded-lg p-3 space-y-1">
                                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Replacement Delivery</span>
                                            <div>
                                                <Badge className={cn("border-0 capitalize", getReplacementDeliveryStatusColor(returnData?.replacementDeliveryStatus))}>
                                                    {returnData?.replacementDeliveryStatus || "pending"}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                    <div className="border rounded-lg p-3 space-y-1">
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Reason</span>
                                        <div>
                                            <Badge className={cn("border-0 capitalize", getReasonColor(returnData?.reason))}>
                                                {returnData?.reason?.replace(/_/g, " ")}
                                            </Badge>
                                        </div>
                                    </div>
                                    {!isReplacement && (
                                        <div className="border rounded-lg p-3 space-y-1">
                                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Refund Method</span>
                                            <div>
                                                <Badge className={cn("border-0 capitalize", getRefundMethodColor(returnData?.refundMethod))}>
                                                    {returnData?.refundMethod?.replace(/_/g, " ") || "N/A"}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Return Information */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg">Return Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground">Return Status</span>
                                        <div className="mt-1">
                                            <Badge className={cn("border-0", getStatusColor(returnData?.status))}>
                                                {returnData?.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Return Reason</span>
                                        <p className="font-medium capitalize">
                                            {returnData?.reason?.replace(/_/g, " ")}
                                        </p>
                                    </div>
                                </div>

                                {returnData?.comments && (
                                    <div>
                                        <span className="text-sm text-muted-foreground">Customer Comments</span>
                                        <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">{returnData.comments}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground">Requested At</span>
                                        <p className="font-medium">
                                            {returnData?.requestedAt
                                                ? new Date(returnData.requestedAt).toLocaleString()
                                                : "N/A"}
                                        </p>
                                    </div>
                                    {returnData?.processedAt && (
                                        <div>
                                            <span className="text-sm text-muted-foreground">Processed At</span>
                                            <p className="font-medium">
                                                {new Date(returnData.processedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Images */}
                                {returnData?.images && returnData.images.length > 0 && (
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-2">
                                            Customer Uploaded Images
                                        </span>
                                        <div className="grid grid-cols-3 gap-2">
                                            {returnData.images.map((image: string, idx: number) => (
                                                <img
                                                    key={idx}
                                                    src={image}
                                                    alt={`Return evidence ${idx + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Product Information */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Product Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <Avatar className="h-20 w-20 rounded-lg">
                                        <AvatarImage src={productImage} alt={productName} />
                                        <AvatarFallback className="rounded-lg">
                                            {productName[0]?.toUpperCase() ?? "P"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Product Name</span>
                                            <p className="font-medium">{productName}</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <span className="text-sm text-muted-foreground">SKU</span>
                                                <p className="font-medium font-mono text-sm">{sku}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-muted-foreground">Quantity</span>
                                                <p className="font-medium">{returnData?.item?.quantity}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-muted-foreground">Price at Order</span>
                                                <p className="font-medium">₹{returnData?.item?.priceAtOrder}</p>
                                            </div>
                                        </div>
                                        {variant?.variantAttributes && (
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {variant.variantAttributes.map((attr: any, i: number) => (
                                                    <span key={i} className="px-2 py-0.5 rounded-lg bg-gray-100 text-[10px] font-medium text-gray-600 capitalize">
                                                        {attr.name}: {attr.value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Logistics Information */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    Logistics Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground">Return Item Status</span>
                                        <div className="mt-1">
                                            <Badge className={cn("border-0 capitalize", getReturnItemStatusColor(returnData?.returnItemStatus))}>
                                                {returnData?.returnItemStatus?.replace(/_/g, " ") || "pending"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Assigned Delivery Hub</span>
                                        {returnData?.deliveryHub?.name ? (
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Building2 className="h-4 w-4 text-blue-500" />
                                                <p className="font-medium text-blue-700">{returnData.deliveryHub.name}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm mt-1 text-red-500 font-medium">Not assigned yet</p>
                                        )}
                                    </div>
                                </div>

                                {/* Assigned Rider */}
                                {returnData?.rider ? (
                                    <div className="pt-3 border-t">
                                        <span className="text-sm text-muted-foreground block mb-2">Assigned Rider</span>
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={returnData.rider.avatar} alt={returnData.rider.name} />
                                                <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold">
                                                    {(returnData.rider.name || "R").charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{returnData.rider.name}</p>
                                                <div className="flex gap-3 mt-0.5">
                                                    {returnData.rider.phone && (
                                                        <span className="text-xs text-muted-foreground">📞 {returnData.rider.phone}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-3 border-t">
                                        <span className="text-sm text-muted-foreground">Assigned Rider</span>
                                        <p className="text-sm text-muted-foreground mt-1 italic">No rider assigned</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                                    {isReplacement && (
                                        <div>
                                            <span className="text-sm text-muted-foreground">Replacement Delivery Status</span>
                                            <div className="mt-1">
                                                <Badge className={cn("border-0 capitalize", getReplacementDeliveryStatusColor(returnData?.replacementDeliveryStatus))}>
                                                    {returnData?.replacementDeliveryStatus || "pending"}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-sm text-muted-foreground">Pickup Status</span>
                                        <div className="mt-1">
                                            <Badge className={cn("border-0 capitalize", getPickupStatusColor(returnData?.pickupStatus))}>
                                                {returnData?.pickupStatus?.replace(/_/g, " ") || "pending"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Pickup Photos */}
                                {returnData?.pickupPhotos && returnData.pickupPhotos.length > 0 && (
                                    <div className="pt-3 border-t">
                                        <span className="text-sm text-muted-foreground block mb-2">
                                            Pickup Proof Photos
                                        </span>
                                        <div className="grid grid-cols-3 gap-2">
                                            {returnData.pickupPhotos.map((photo: string, idx: number) => (
                                                <img
                                                    key={idx}
                                                    src={photo}
                                                    alt={`Pickup proof ${idx + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {returnData?.deliveryHub?.address && (
                                    <div className="pt-3 border-t">
                                        <span className="text-sm text-muted-foreground block mb-1">Hub Address</span>
                                        {typeof returnData.deliveryHub.address === 'object' ? (
                                            <p className="text-sm">
                                                {returnData.deliveryHub.address.street}, {returnData.deliveryHub.address.city}, {returnData.deliveryHub.address.state} - {returnData.deliveryHub.address.pinCode}
                                            </p>
                                        ) : (
                                            <p className="text-sm">{returnData.deliveryHub.address}</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Refund Information (for return type) */}
                        {!isReplacement && (
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Refund Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Refund Status</span>
                                            <div className="mt-1">
                                                <Badge className={cn("border-0 capitalize", getRefundStatusColor(returnData?.refundStatus))}>
                                                    {returnData?.refundStatus?.replace(/_/g, " ") || "pending"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Refund Amount</span>
                                            <p className="font-bold text-lg">₹{returnData?.refundAmount || 0}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Refund Method</span>
                                            <div className="mt-1">
                                                <Badge className={cn("border-0 capitalize", getRefundMethodColor(returnData?.refundMethod))}>
                                                    {returnData?.refundMethod?.replace(/_/g, " ") || "N/A"}
                                                </Badge>
                                            </div>
                                        </div>
                                        {returnData?.refundedAt && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">Refunded At</span>
                                                <p className="font-medium">
                                                    {new Date(returnData.refundedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bank Details */}
                                    {returnData?.refundMethod === 'bank' && returnData?.bankDetails && (
                                        <div className="pt-3 border-t">
                                            <span className="text-sm text-muted-foreground block mb-2">Bank Details</span>
                                            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                                                <div>
                                                    <span className="text-xs text-muted-foreground">Account Holder</span>
                                                    <p className="text-sm font-medium">{returnData.bankDetails.accountHolderName}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-muted-foreground">Account Number</span>
                                                    <p className="text-sm font-medium font-mono">{returnData.bankDetails.accountNumber}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-muted-foreground">Bank Name</span>
                                                    <p className="text-sm font-medium">{returnData.bankDetails.bankName}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-muted-foreground">IFSC Code</span>
                                                    <p className="text-sm font-medium font-mono">{returnData.bankDetails.ifscCode}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* UPI Details */}
                                    {returnData?.refundMethod === 'upi' && (
                                        <div className="pt-3 border-t">
                                            <span className="text-sm text-muted-foreground block mb-2">UPI Details</span>
                                            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                                                {returnData?.upiId && (
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">UPI ID</span>
                                                        <p className="text-sm font-medium font-mono">{returnData.upiId}</p>
                                                    </div>
                                                )}
                                                {returnData?.upiMobileNumber && (
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">UPI Mobile</span>
                                                        <p className="text-sm font-medium">{returnData.upiMobileNumber}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-6">
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg">Update Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Update Return Item Status */}
                                <div className="space-y-2">
                                    <Label>Return Item Status</Label>
                                    <Select
                                        value={returnData.returnItemStatus || "pending"}
                                        onValueChange={(val) => updateItemStatusMutation.mutate({ status: val })}
                                        disabled={updateItemStatusMutation.isPending}
                                    >
                                        <SelectTrigger className="bg-white border-gray-200">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="picked">Picked</SelectItem>
                                            <SelectItem value="dropped">Dropped</SelectItem>
                                            <SelectItem value="sent">Sent</SelectItem>
                                            <SelectItem value="received">Received</SelectItem>
                                            <SelectItem value="rejected_picked">Rejected Picked</SelectItem>
                                            <SelectItem value="rejected_dropped">Rejected Dropped</SelectItem>
                                            <SelectItem value="rejected_sent">Rejected Sent</SelectItem>
                                            <SelectItem value="rejected_received">Rejected Received</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Assign Rider */}
                                <div className="space-y-2 pt-3 border-t border-gray-100">
                                    <Label>Assign Delivery Rider</Label>
                                    <Select
                                        value={returnData.rider?._id || ""}
                                        onValueChange={(val) => assignRiderMutation.mutate({ riderId: val })}
                                        disabled={assignRiderMutation.isPending}
                                    >
                                        <SelectTrigger className="bg-white border-gray-200">
                                            <SelectValue placeholder="Select Rider" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ridersData?.map((r: any) => (
                                                <SelectItem key={r._id} value={r._id}>
                                                    {r.name} ({r.phone})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Replacement Delivery Status */}
                                {isReplacement && (
                                    <div className="space-y-2 pt-3 border-t border-gray-100">
                                        <Label>Replacement Delivery Status</Label>
                                        <Select
                                            value={returnData.replacementDeliveryStatus || "pending"}
                                            onValueChange={(val) => updateReplacementStatusMutation.mutate({ status: val })}
                                            disabled={updateReplacementStatusMutation.isPending}
                                        >
                                            <SelectTrigger className="bg-white border-gray-200">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="sent">Sent</SelectItem>
                                                <SelectItem value="received">Received</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Order info */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg">Order Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <span className="text-sm text-muted-foreground">Order ID</span>
                                    <p className="font-medium font-mono">{returnData?.order?.orderId}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Order Status</span>
                                    <p className="font-medium capitalize">{returnData?.order?.orderStatus}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Order Date</span>
                                    <p className="font-medium">
                                        {returnData?.order?.createdAt ? new Date(returnData.order.createdAt).toLocaleDateString() : "N/A"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Customer Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <span className="text-sm text-muted-foreground">Customer Name</span>
                                    <p className="font-medium">{returnData?.user?.name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Phone</span>
                                    <p className="font-medium">{returnData?.user?.phone}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Email</span>
                                    <p className="font-medium truncate">{returnData?.user?.email}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
