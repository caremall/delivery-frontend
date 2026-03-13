import React from "react";
import ReturnDetailsClient from "./ReturnDetailsClient";

export const dynamicParams = true;

export async function generateStaticParams() {
    return [];
}

export default async function ReturnDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ReturnDetailsClient id={id} />;
}
