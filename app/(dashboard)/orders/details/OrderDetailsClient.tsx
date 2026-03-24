"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, User, MapPin, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const statusColors = {
  pending: { bg: "bg-[#eef2ff]", border: "border-[#d1d5db]", text: "text-[#4f46e5]" },
  processing: { bg: "bg-[#eef2ff]", border: "border-[#d1d5db]", text: "text-[#4f46e5]" },
  confirmed: { bg: "bg-[#eef2ff]", border: "border-[#d1d5db]", text: "text-[#4f46e5]" },
  packed: { bg: "bg-[#fdf2f8]", border: "border-[#d1d5db]", text: "text-[#db2777]" },
  in_transit: { bg: "bg-[#fff7ed]", border: "border-[#d1d5db]", text: "text-[#ea580c]" },
  out_for_delivery: { bg: "bg-[#fff7ed]", border: "border-[#d1d5db]", text: "text-[#ea580c]" },
  delivered: { bg: "bg-[#f0fdf4]", border: "border-[#d1d5db]", text: "text-[#16a34a]" },
  dispatched: { bg: "bg-[#fef9c3]", border: "border-[#fde047]", text: "text-[#854d0e]" },
  shipped: { bg: "bg-[#fef9c3]", border: "border-[#fde047]", text: "text-[#854d0e]" },
  cancelled: { bg: "bg-[#fef2f2]", border: "border-[#fecaca]", text: "text-[#dc2626]" },
} as const;

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || "";
  const normalizedStatus = (s === "assigned") ? "dispatched" : s;
  const config = (statusColors as any)[normalizedStatus] || { bg: "bg-gray-50", border: "border-gray-100", text: "text-gray-600" };
  let displayStatus = status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown";
  if (s === "out_for_delivery") displayStatus = "In Transit";
  if (s === "pending" || s === "processing" || s === "confirmed") displayStatus = "Pending";
  if (s === "assigned" || s === "dispatched") displayStatus = "Dispatched";
  if (s === "shipped") displayStatus = "Shipped";

  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-md border text-xs font-medium", config.bg, config.border, config.text)}>
      {displayStatus}
    </span>
  );
}

export default function OrderDetailsClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/orders/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <p className="text-xl font-semibold">Order not found</p>
        <Button asChild>
          <Link href="/orders/all-orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const shipping = order.shippingAddress || {};

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/orders/all-orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground">Order ID: {order.orderId}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Order Status Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Items Information
              </CardTitle>  
              <StatusBadge status={order.orderStatus} />
            </div>
            <CardDescription>Details about the items in this order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    {item.product?.thumbnail || item.product?.image ? (
                      <img 
                        src={item.product?.thumbnail || item.product?.image} 
                        alt={item.product?.name} 
                        className="h-12 w-12 rounded-md object-cover bg-zinc-100 dark:bg-zinc-800"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{item.product?.name || "Product Name"}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">₹{item.totalPrice?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer & Info Cards */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{shipping.fullName || "N/A"}</p>
              <p className="text-sm text-muted-foreground">{order.user?.email || "No email provided"}</p>
              <p className="text-sm text-muted-foreground">{shipping.phone || "No phone provided"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Shipping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {shipping.addressLine1}<br />
                {shipping.addressLine2 && <>{shipping.addressLine2}<br /></>}
                {shipping.city}, {shipping.state} {shipping.postalCode}<br />
                {shipping.country || "India"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{order.grossAmount?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Discount</span>
              <span className="text-green-600">-₹{order.discountAmount?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>₹{order.taxAmount?.toFixed(2) || "0.00"}</span>
            </div>
            {order.codCharge > 0 && (
              <div className="flex justify-between text-sm">
                <span>COD Charge</span>
                <span>₹{order.codCharge?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>Total</span>
              <span>₹{order.finalAmount?.toFixed(2) || order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
