"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, Package, Truck, ExternalLink } from "lucide-react";
import Button from "../components/ui/Button";

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/orders')
            .then(res => {
                if (res.status === 401) {
                    router.push('/signin?redirect=/orders');
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (data && data.orders) {
                    setOrders(data.orders);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [router]);

    if (loading) return <div className="p-20 text-center">Loading orders...</div>;

    return (
        <main className="container py-8 px-4">
            {/* Breadcrumb */}
            <div className="flex gap-2 text-shop-gray-500 text-sm mb-6 items-center">
                <Link href="/">Home</Link> <ChevronRight size={14} /> <span className="text-black font-medium">My Orders</span>
            </div>

            <h1 className="text-[40px] font-black font-sans mb-10 uppercase">MY ORDERS</h1>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-shop-gray-100 rounded-2xl">
                    <Package size={48} className="mx-auto mb-4 text-shop-gray-500" />
                    <h2 className="text-xl font-bold mb-2">No orders yet</h2>
                    <p className="text-shop-gray-500 mb-6">Start shopping to see your orders here.</p>
                    <Link href="/shop">
                        <Button>Start Shopping</Button>
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {orders.map((order) => (
                        <div key={order.id} className="border border-shop-border rounded-[20px] p-6">
                            <div className="flex flex-wrap justify-between items-center border-b border-shop-border pb-4 mb-4 gap-4">
                                <div>
                                    <h3 className="text-lg font-bold">Order #{order.id}</h3>
                                    <p className="text-sm text-shop-gray-500">
                                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
                                    <div className="text-right md:mr-6">
                                        <div className="text-sm text-shop-gray-500">Total Status</div>
                                        <div className="font-bold uppercase text-black">
                                            {order.status}
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold">${Number(order.amount).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Tracking Info (if available) */}
                            {order.tracking_number && (
                                <div className="bg-shop-gray-100 p-4 rounded-xl mb-6 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Truck className="text-black" size={24} />
                                        <div>
                                            <p className="font-bold text-sm">Tracking Number ({order.carrier || 'Unknown'})</p>
                                            <p className="text-black font-mono">{order.tracking_number}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/tracking?carrier=${order.carrier || 'JT'}&tracking_number=${order.tracking_number}`}
                                        className="text-sm font-bold underline flex items-center gap-1 hover:text-shop-gray-500"
                                    >
                                        Track Package <ExternalLink size={14} />
                                    </Link>
                                </div>
                            )}

                            {/* Order Items */}
                            <div className="flex flex-col gap-4">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-shop-gray-100 rounded-md relative overflow-hidden flex-shrink-0">
                                            {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm">{item.title}</h4>
                                            <p className="text-xs text-shop-gray-500">
                                                Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <div className="font-bold text-sm">
                                            ${item.price}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
