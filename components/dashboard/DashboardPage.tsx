"use client";

import React from 'react';
import { useAuthStore } from "@/lib/auth-store";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";
import PerformanceChart from "./PerformanceChart";
import RecentOrders from "./RecentOrders";
import TopProductsStock from "./TopProductsStock";
import OrderManagementDonut from "./OrderManagementDonut";
import { Calendar, ChevronDown } from "lucide-react";

const SummaryCard = ({ title, value, subValue, dotColor, isLoading }: any) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden group hover:border-red-100 transition-all">
    <div className="flex items-center gap-2">
      <div className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
      <span className="text-[12px] font-bold text-gray-400 capitalize">{title}</span>
    </div>
    <div className="flex flex-col gap-1">
      <h3 className="text-[22px] font-bold text-gray-900 tracking-tight">
        {isLoading ? "..." : value}
      </h3>
      {subValue && (
        <p className={cn("text-[10px] font-bold", subValue.startsWith('+') ? "text-green-500" : "text-gray-300")}>
          {subValue}
        </p>
      )}
    </div>
  </div>
);

export default function DashboardPage() {
  const { manager } = useAuthStore();

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/dashboard/stats");
      return res.data.data;
    },
  });

  const stats = [
    {
      title: "Total Orders",
      value: (statsData?.totalOrders || 0).toLocaleString(),
      subValue: `${statsData?.todaysOrders || 0} New Today`,
      dotColor: "bg-green-500",
    },
    {
      title: "Pending Orders",
      value: statsData?.pendingOrders || 0,
      dotColor: "bg-orange-500",
    },
    {
      title: "Todays Orders",
      value: statsData?.todaysOrders || 0,
      dotColor: "bg-red-500",
    },
    {
      title: "Orders Assigned",
      value: statsData?.ordersAssigned || 0,
      subValue: "Current assignments",
      dotColor: "bg-purple-500",
    },
    {
      title: "Products instock",
      value: statsData?.productsInStock || 0,
      subValue: "Total in hub",
      dotColor: "bg-green-500",
    },
    {
      title: "Active Riders",
      value: isLoading ? "..." : `${statsData?.activeRiders || 0}/${statsData?.totalRiders || 0}`,
      dotColor: "bg-green-500",
    },
    {
      title: "Total Revenue",
      value: `Rs. ${(statsData?.totalRevenue || 0).toLocaleString()}`,
      dotColor: "bg-red-500",
    },
    {
      title: "Today's Revenue",
      value: `Rs. ${(statsData?.revenueToday || 0).toLocaleString()}`,
      dotColor: "bg-purple-500",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-[#fcfcfc] min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
      </div>

      {/* 8 Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <SummaryCard key={idx} {...stat} isLoading={isLoading} />
        ))}
      </div>

      {/* Middle Content: Recent Orders & Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <RecentOrders orders={statsData?.recentOrders} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <TopProductsStock data={statsData?.topProductsStock} isLoading={isLoading} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart data={statsData?.chartData} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <OrderManagementDonut stats={statsData} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
