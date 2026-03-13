import React from "react";
import ReturnDetailsClient from "./ReturnDetailsClient";

export const dynamicParams = false;

export async function generateStaticParams() {
    return [{ id: "1" }];
}

export default async function ReturnDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ReturnDetailsClient id={id} />;
}
