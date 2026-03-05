"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PackageCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProcessedReturnsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#f9fafb] p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold text-gray-800 tracking-tight">Processed Returns</h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">Historical records of completed returns</p>
                </div>
            </div>

            <Card className="bg-white border-none rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <PackageCheck className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No processed returns yet</h3>
                        <p className="text-sm text-gray-500 max-w-sm mb-6">
                            Returns that have been successfully processed will appear here for your records.
                        </p>
                        <Button
                            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-xl h-11 px-6 shadow-sm"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Data
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
