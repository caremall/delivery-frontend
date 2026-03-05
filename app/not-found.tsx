"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-dvh bg-gray-50 px-4">
            <div className="text-center max-w-md w-full">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 p-4 rounded-full">
                        <ShieldAlert className="w-16 h-16 text-red-600" />
                    </div>
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">404</h1>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h2>
                <p className="mt-4 text-gray-500 text-sm sm:text-base">
                    Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or perhaps didn't exist in the first place.
                </p>
                <div className="mt-8 flex justify-center">
                    <Link href="/">
                        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 h-12 text-base font-semibold transition-all">
                            Go back home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
