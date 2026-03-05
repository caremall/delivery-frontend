"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera, MoreVertical, Building2, TrendingUp, Package, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

const CustomHubAvatarUpload = ({ hub, onSuccess }: { hub: any, onSuccess: () => void }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);

            // 1. Upload to S3/Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            const uploadRes = await axiosInstance.post("/upload/image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const hubImageUrl = uploadRes.data.url;

            // 2. Update Hub in Backend
            await axiosInstance.put(`/hubs/${hub._id}/image`, { hubImage: hubImageUrl });

            toast.success(`${hub.name} image updated successfully`);
            onSuccess();
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.response?.data?.message || "Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative group cursor-pointer w-14 h-14 shrink-0">
            <label className="cursor-pointer block w-full h-full rounded-full border border-slate-200 shadow-sm relative overflow-hidden transition-all group-hover:border-red-500/50">
                <Avatar className="w-full h-full rounded-none">
                    <AvatarImage src={hub.hubImage} className="object-cover" />
                    <AvatarFallback className="bg-slate-50 text-slate-300 border border-slate-100 font-bold rounded-full">
                        <Building2 className="w-5 h-5" />
                    </AvatarFallback>
                </Avatar>

                <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white backdrop-blur-[1px]">
                    {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Camera className="w-4 h-4" />
                    )}
                </div>

                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleUpload}
                />
            </label>
        </div>
    );
};

export default function ProfilePage() {
    const { manager: storedManager } = useAuthStore();
    const queryClient = useQueryClient();

    const { data: profileData, isLoading: isProfileLoading } = useQuery({
        queryKey: ["manager-profile"],
        queryFn: async () => {
            const res = await axiosInstance.get("/auth/profile");
            return res.data;
        },
    });

    const { data: statsData, isLoading: isStatsLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const res = await axiosInstance.get("/dashboard/stats");
            return res.data.data;
        },
    });

    const manager = profileData?.manager || storedManager;
    const deliveryHubs = manager?.assignedWarehouses?.filter((wh: any) => wh.type === "delivery hub") || [];

    const refreshData = () => {
        queryClient.invalidateQueries({ queryKey: ["manager-profile"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    };

    if (isProfileLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-9xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Setting</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Column (Profile, Emails, Phone) */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Your Profile Card */}
                    <Card className="rounded-[20px] border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-[15px] text-slate-900">Your profile</h3>
                                <span className="text-xs text-slate-400 font-medium">Joined {new Date(manager?.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16 border-2 border-slate-50 shadow-sm">
                                    <AvatarFallback className="bg-slate-800 text-white text-xl font-bold">
                                        {manager?.fullName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900">{manager?.fullName}</h4>
                                    <p className="text-sm text-slate-500 mt-0.5">{manager?.mobileNumber}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Emails Card */}
                    <Card className="rounded-[20px] border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <h3 className="font-semibold text-[15px] text-slate-900 mb-5">Emails</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50 mb-2 rounded-md text-[10px] font-semibold px-2 border-none">
                                            Primary
                                        </Badge>
                                        <p className="font-medium text-sm text-slate-800">{manager?.email}</p>
                                    </div>
                                  
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Phone Number Card */}
                    <Card className="rounded-[20px] border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <h3 className="font-semibold text-[15px] text-slate-900 mb-5">Phone Number</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50 mb-2 rounded-md text-[10px] font-semibold px-2 border-none">
                                            Primary
                                        </Badge>
                                        <p className="font-medium text-sm text-slate-800">{manager?.mobileNumber}</p>
                                    </div>
                            
                                </div>
                            </div>
                        </div>
                    </Card>

                </div>

                {/* Right Column (Addresses/Hubs & Account Options/Stats) */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Assigned Logistics Hubs (Address analogue) */}
                    <Card className="rounded-[20px] border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <h3 className="font-semibold text-[15px] text-slate-900 mb-5">Assigned Hubs</h3>

                            {deliveryHubs.length > 0 ? (
                                <div className="space-y-5">
                                    {deliveryHubs.map((hub: any, index: number) => (
                                        <div key={hub._id} className={`flex items-start justify-between ${index !== deliveryHubs.length - 1 ? 'pb-5 border-b border-slate-50' : ''}`}>
                                            <div className="flex items-start gap-4">
                                                <CustomHubAvatarUpload hub={hub} onSuccess={refreshData} />
                                                <div>
                                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50 mb-1 rounded-md text-[10px] font-semibold px-2 border-none tracking-wide">
                                                        {hub.type}
                                                    </Badge>
                                                    <p className="text-sm font-semibold text-slate-900 leading-snug">{hub.name}</p>
                                                    <p className="text-[13px] text-slate-500 mt-1 leading-snug">{hub.address?.street}</p>
                                                    <p className="text-[13px] text-slate-500 leading-snug">{hub.address?.city}, {hub.address?.state} {hub.address?.pinCode}</p>
                                                </div>
                                            </div>
                                           
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-500 text-sm">
                                    No delivery hubs currently assigned.
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Operational Statistics (Account Options analogue) */}
                    <Card className="rounded-[20px] border-slate-100 shadow-sm overflow-hidden bg-slate-50/30">
                        <div className="p-6">
                            <h3 className="font-semibold text-[15px] text-slate-900 mb-2">Performance Metrics</h3>
                            <p className="text-xs text-slate-500 mb-6">Overview of your assigned hub operations</p>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center py-3 border-b border-slate-100 hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-default">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500 mb-0.5 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Total Orders Processed</span>
                                        <span className="font-semibold text-[15px] text-slate-900 mt-1">
                                            {isStatsLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : (statsData?.totalOrders || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                </div>

                                <div className="flex justify-between items-center py-3 border-b border-slate-100 hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-default">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500 mb-0.5 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Active Riders</span>
                                        <span className="font-semibold text-[15px] text-slate-900 mt-1">
                                            {isStatsLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : `${statsData?.activeRiders || 0} Personnel`}
                                        </span>
                                    </div>
                                    
                                </div>

                                <div className="flex justify-between items-center py-3 border-b border-slate-100 hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-default">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500 mb-0.5 flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Monthly Revenue</span>
                                        <span className="font-semibold text-[15px] text-slate-900 mt-1">
                                            {isStatsLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : `₹${(statsData?.totalRevenue || 0).toLocaleString()}`}
                                        </span>
                                    </div>
                                   
                                </div>

                                <div className="flex justify-between items-center py-3 hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-default">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500 mb-0.5">Assigned Manager ID</span>
                                        <span className="font-mono text-[13px] text-slate-900 mt-1">{manager?._id?.toUpperCase() || 'MGR-10293'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
