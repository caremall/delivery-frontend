"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { TrendingUp, Users, ShoppingCart, IndianRupee, Loader2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <Card className="border border-gray-100 shadow-sm overflow-hidden group hover:scale-[1.02] transition-transform">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-extrabold text-gray-900">{value}</h3>
                    {trend && (
                        <p className={cn("text-[10px] font-bold mt-1", trend.startsWith('+') ? "text-green-500" : "text-red-500")}>
                            {trend} from last month
                        </p>
                    )}
                </div>
                <div className={cn("p-3 rounded-2xl", color)}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function AnalyticsPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['analytics-stats'],
        queryFn: async () => {
            const res = await axiosInstance.get('/dashboard/analytics');
            return res.data.data;
        }
    });

    if (isLoading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-red-500 animate-spin" />
                <p className="text-sm font-bold text-gray-500 animate-pulse">Generating your analytics...</p>
            </div>
        );
    }

    const statusData = stats?.statusBreakdown?.map((s: any) => ({
        name: s._id.replace(/_/g, ' '),
        value: s.count
    })) || [];

    const riderData = stats?.riderStatus?.map((s: any) => ({
        name: s._id || 'Unknown',
        value: s.count
    })) || [];

    return (
        <div className="p-6 lg:p-10 space-y-8 bg-[#fcfcfc] min-h-screen">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics Overview</h1>
                <p className="text-sm text-gray-500 font-medium">Deep dive into your hub performance and rider efficiency.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="30D Revenue"
                    value={`₹${stats?.trends?.reduce((acc: number, curr: any) => acc + curr.revenue, 0).toLocaleString()}`}
                    icon={IndianRupee}
                    color="bg-red-500"
                    trend="+12.5%"
                />
                <StatCard
                    title="30D Orders"
                    value={stats?.trends?.reduce((acc: number, curr: any) => acc + curr.orders, 0).toLocaleString()}
                    icon={ShoppingCart}
                    color="bg-orange-500"
                    trend="+8.2%"
                />
                <StatCard
                    title="Active Riders"
                    value={stats?.totalRiders || 0}
                    icon={Users}
                    color="bg-blue-500"
                    trend="+3 new"
                />
                <StatCard
                    title="Avg. Order Value"
                    value={`₹${Math.round(stats?.avgOrderValue || 0).toLocaleString()}`}
                    icon={IndianRupee}
                    color="bg-green-500"
                    trend="Per Delivery"
                />
            </div>

            {/* Grid for Trend Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Trend */}
                <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <IndianRupee className="h-4 w-4" /> Revenue Trend (Last 30 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.trends}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Orders Trend */}
                <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" /> Order Volume (Last 30 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }} />
                                <Tooltip
                                    cursor={{ fill: '#fef2f2' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="orders" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Methods */}
                <Card className="border-none shadow-sm rounded-2xl bg-white p-6">
                    <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Payment Distribution</CardTitle>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="h-[200px] w-full md:w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats?.paymentBreakdown?.map((p: any) => ({ name: p._id.toUpperCase(), value: p.count }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {stats?.paymentBreakdown?.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 space-y-3">
                            {stats?.paymentBreakdown?.map((p: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="text-xs font-bold text-gray-600 uppercase">{p._id}</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-900">{p.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Top Moving Products */}
                <Card className="border-none shadow-sm rounded-2xl bg-white p-6">
                    <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Top Moving Items</CardTitle>
                    <div className="space-y-4">
                        {stats?.topMovingProducts?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 group">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-white">
                                        {item.image ? (
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <Package className="h-full w-full p-2 text-gray-300" />
                                        )}
                                    </div>
                                    <span className="text-xs font-extrabold text-gray-800 line-clamp-1">{item.name}</span>
                                </div>
                                <div className="bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                    <span className="text-xs font-black text-red-500">{item.sold} Sold</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Status Pie */}
                <Card className="lg:col-span-1 border-none shadow-sm rounded-2xl bg-white p-6">
                    <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Order Breakdown</CardTitle>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Riders */}
                <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl bg-white p-6">
                    <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Top Performing Riders</CardTitle>
                    <div className="space-y-4">
                        {stats?.topRiders?.map((rider: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-red-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-200">
                                        {rider.image ? (
                                            <Image src={rider.image} alt={rider.name} fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full text-gray-400 font-bold">
                                                {rider.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800">{rider.name}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium">Rank #{idx + 1} Delivery King</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-red-500 group-hover:scale-110 transition-transform">{rider.completedOrders}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Orders Completed</p>
                                </div>
                            </div>
                        ))}
                        {(!stats?.topRiders || stats.topRiders.length === 0) && (
                            <div className="py-10 text-center text-gray-400 italic text-sm">No rider performance data for this period</div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Rider Status Distribution */}
            <Card className="border-none shadow-sm rounded-2xl bg-white p-6">
                <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Rider Network Status</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {riderData.map((s: any, idx: number) => (
                        <div key={idx} className="p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-2 bg-[#fafafa]">
                            <h3 className="text-3xl font-black text-gray-900">{s.value}</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.name}</p>
                            <div className={cn("w-full h-1.5 rounded-full mt-2 bg-gray-200 overflow-hidden")}>
                                <div
                                    className={cn("h-full", s.name === 'active' ? "bg-green-500" : "bg-red-500")}
                                    style={{ width: `${(s.value / (stats?.totalRiders || 100)) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
