import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, Calendar, User, MapPin, CreditCard } from "lucide-react";
import Link from "next/link";

export const dynamicParams = false;

export async function generateStaticParams() {
    return [{ id: "1" }];
}

export default async function OrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // In a real app, you would fetch data here
    // const order = await getOrderById(id);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/orders/all-orders">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
                    <p className="text-muted-foreground">Order ID: #{id}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Order Status Card */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                Items Information
                            </CardTitle>
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Delivered
                            </span>
                        </div>
                        <CardDescription>Details about the items in this order</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* This would be a map over items */}
                            <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-md bg-zinc-100 dark:bg-zinc-800" />
                                    <div>
                                        <p className="font-medium">Product Name Example</p>
                                        <p className="text-sm text-muted-foreground">Qty: 2</p>
                                    </div>
                                </div>
                                <p className="font-medium">$120.00</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Customer & Info Cards */}
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="font-medium">John Doe</p>
                            <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                            <p className="text-sm text-muted-foreground">+1 (555) 000-0000</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                Shipping
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                123 Street Name,<br />
                                City, State, 12345<br />
                                United States
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Payment Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>$120.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Shipping</span>
                            <span>$10.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Tax</span>
                            <span>$12.00</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold">
                            <span>Total</span>
                            <span>$142.00</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
