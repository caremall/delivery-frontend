"use client";

import OrderDetailsClient from "./OrderDetailsClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function OrderDetailsPage() {
  return (
    <Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <OrderDetailsClient />
    </Suspense>
  );
}
