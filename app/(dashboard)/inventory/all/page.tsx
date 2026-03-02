"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, MoreHorizontal, Eye } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { CustomDataTable } from "@/components/common/CustomDataTable";
import { type ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// ─── Columns Definition ──────────────────────────────────────────────────

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "productName",
    header: "Product Name",
    cell: ({ row }) => {
      const { productName, image } = row.original;

      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={image || undefined} alt={productName} />
            <AvatarFallback>{productName?.charAt(0) || "P"}</AvatarFallback>
          </Avatar>
          <span className="truncate max-w-[150px] hover:text-blue-500 cursor-pointer text-sm">
            {productName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalStock",
    header: "Stock",
    cell: ({ row }) => {
      const totalStock = row.getValue("totalStock") as number;
      return (
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${totalStock > 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}
          >
            {totalStock}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalValue",
    header: "Total Stock Value",
    cell: ({ row }) => {
      const totalValue = row.getValue("totalValue") as number;

      return (
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            ₹{(totalValue || 0).toLocaleString()}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" /> View detailed stocks
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// ─── Main Component ──────────────────────────────────────────────────────

export default function InventoryAllPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const { data: stockData, isLoading } = useQuery({
    queryKey: ["inventory", debouncedSearch, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      params.append("page", String(page));
      params.append("limit", String(limit));
      const res = await axiosInstance.get(`/inventory?${params.toString()}`);
      return res.data;
    },
  });

  const products = stockData?.data || [];
  const totalPages = stockData?.pagination?.totalPages || 0;

  return (
    <div className="p-0 flex flex-col min-h-full">
      {/* Header matches source design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Products Overview
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Keep track of your products and availability in one place
          </p>
        </div>
      </div>

      {/* Stock Value Visualization - Matches source design */}
      <div className="px-4 mb-6">
        <Card className="rounded-none border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Stock Value Analysis
            </CardTitle>
            <CardDescription>
              Top products by total stock value in the current view
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={products}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="productName"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    tickFormatter={(value) => value?.length > 10 ? `${value.substring(0, 10)}...` : value}
                  />
                  <YAxis
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border rounded shadow-lg">
                            <p className="font-semibold text-sm mb-1">{label}</p>
                            <p className="text-green-600 font-bold">
                              ₹{Number(payload[0].value).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Stock: {payload[0].payload.totalStock} units
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="totalValue"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  >
                    {products.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? "#dc2626" : "#b91c1c"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <div className="px-4">
        <CustomDataTable
          columns={columns}
          data={products}
          isLoading={isLoading}
          exportFileName="products_stock.csv"
          manualPagination={true}
          pageCount={totalPages}
          pagination={{
            pageIndex: page - 1,
            pageSize: limit
          }}
          onPaginationChange={(newPagination) => {
            setPage(newPagination.pageIndex + 1);
            if (newPagination.pageSize !== limit) {
              setLimit(newPagination.pageSize);
            }
          }}
          onSearch={(term) => {
            setSearch(term);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
