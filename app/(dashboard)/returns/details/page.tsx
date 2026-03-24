"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReturnDetailsClient from "./ReturnDetailsClient";

function ReturnDetailsContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    if (!id) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <p className="text-gray-500">No return ID provided</p>
            </div>
        );
    }

    return <ReturnDetailsClient id={id} />;
}

export default function ReturnDetailsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
                </div>
            }
        >
            <ReturnDetailsContent />
        </Suspense>
    );
}
