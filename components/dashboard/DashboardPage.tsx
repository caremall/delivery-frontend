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
import {
  ShoppingCart,
  Clock,
  CalendarDays,
  PackageCheck,
  Boxes,
  Bike,
  IndianRupee,
  TrendingUp,
} from "lucide-react";

const SummaryCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  iconBg,
  iconColor,
  accentColor,
  isLoading,
}: any) => (
  <div
    className={cn(
      "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 relative overflow-hidden group",
      "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
    )}
  >
    {/* Colored bottom accent bar — slides up on hover */}
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 group-hover:h-1",
        accentColor
      )}
    />

    <div className="flex items-start justify-between">
      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-0.5">
        {title}
      </span>
      {/* Colored icon pill */}
      <div className={cn("p-2 rounded-xl", iconBg)}>
        <Icon className={cn("h-4 w-4", iconColor)} />
      </div>
    </div>

    <div className="flex flex-col gap-1">
      <h3 className="text-[22px] font-bold text-gray-900 tracking-tight">
        {isLoading ? (
          <span className="inline-block h-7 w-16 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          value
        )}
      </h3>
      {subValue && (
        <p className={cn("text-[10px] font-medium",
          subValue.toString().startsWith('+') || subValue.toString().includes('New')
            ? "text-emerald-500"
            : "text-gray-400"
        )}>
          {subValue}
        </p>
      )}
    </div>
  </div>
);

export default function DashboardPage() {
  const { manager } = useAuthStore();

  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 11)),
    to: new Date(),
  });

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["dashboard-stats", dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange.to) params.append("endDate", dateRange.to.toISOString());
      const res = await axiosInstance.get(`/dashboard/stats?${params.toString()}`);
      return res.data.data;
    },
  });

  const stats = [
    {
      title: "Total Orders",
      value: (statsData?.totalOrders || 0).toLocaleString(),
      subValue: `+${statsData?.todaysOrders || 0} New Today`,
      icon: ShoppingCart,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
      accentColor: "bg-violet-400",
    },
    {
      title: "Pending Orders",
      value: statsData?.pendingOrders || 0,
      subValue: "Awaiting dispatch",
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      accentColor: "bg-amber-400",
    },
    {
      title: "Today's Orders",
      value: statsData?.todaysOrders || 0,
      subValue: "Received today",
      icon: CalendarDays,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
      accentColor: "bg-rose-400",
    },
    {
      title: "Orders Assigned",
      value: statsData?.ordersAssigned || 0,
      subValue: "Current assignments",
      icon: PackageCheck,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      accentColor: "bg-blue-400",
    },
    {
      title: "Products In Stock",
      value: statsData?.productsInStock || 0,
      subValue: "Total in hub",
      icon: Boxes,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      accentColor: "bg-emerald-400",
    },
    {
      title: "Active Riders",
      value: isLoading ? "..." : `${statsData?.activeRiders || 0}/${statsData?.totalRiders || 0}`,
      subValue: "On duty now",
      icon: Bike,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-500",
      accentColor: "bg-teal-400",
    },
    {
      title: "Total Revenue",
      value: `₹${(statsData?.totalRevenue || 0).toLocaleString()}`,
      subValue: "All time",
      icon: IndianRupee,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      accentColor: "bg-red-400",
    },
    {
      title: "Today's Revenue",
      value: `₹${(statsData?.revenueToday || 0).toLocaleString()}`,
      subValue: "Earned today",
      icon: TrendingUp,
      iconBg: "bg-fuchsia-50",
      iconColor: "text-fuchsia-500",
      accentColor: "bg-fuchsia-400",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-[#f7f8fa] min-h-screen">
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
          <PerformanceChart 
            data={statsData?.chartData} 
            isLoading={isLoading} 
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        </div>
        <div className="lg:col-span-1">
          <OrderManagementDonut stats={statsData} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
