"use client";

import ProcessedReturnsTable from "@/components/returns/ProcessedReturnsTable";

export default function ProcessedReturnsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#f9fafb] p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold text-gray-800 tracking-tight">Processed Returns</h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">Historical records of completed and rejected returns</p>
                </div>
            </div>

            <ProcessedReturnsTable />
        </div>
    );
}
