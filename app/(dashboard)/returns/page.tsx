"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReturnsTable from "@/components/returns/ReturnsTable";

export default function ReturnRequestsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#f9fafb] p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold text-gray-800 tracking-tight">Return Requests</h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">Manage and process customer return requests</p>
                </div>
            </div>

            <ReturnsTable />
        </div>
    );
}
