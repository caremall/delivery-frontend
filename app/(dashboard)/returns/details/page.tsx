"use client";

import ReturnDetailsClient from "./ReturnDetailsClient";
import { Suspense } from "react";

export default function ReturnDetailsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>}>
            <ReturnDetailsClient />
        </Suspense>
    );
}
