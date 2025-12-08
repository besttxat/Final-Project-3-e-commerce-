"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Trash2, ArrowRight, Minus, Plus, Tag } from "lucide-react";
import Button from "../components/ui/Button";

interface CartItem {
    id: number;
    itemId: number;
    productId: number;
    title: string;
    price: string | number;
    quantity: number;
    imageUrl: string;
    color?: string;
    size?: string;
}

export default function Cart() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const fetchCart = React.useCallback(async () => {
        try {
            const res = await fetch('/api/cart');
            if (res.status === 401) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }
            setIsAuthenticated(true);
            const data = await res.json();
            setCartItems(data.items || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const updateQuantity = async (itemId: number, productId: number, currentQuantity: number, delta: number) => {
        // Prevent quantity < 1
        if (currentQuantity + delta < 1) return;

        // Optimistic update
        setCartItems(prev => prev.map(item => item.itemId === itemId ? { ...item, quantity: item.quantity + delta } : item));

        // Call API
        try {
            // Re-using POST to add/subtract relative quantity
            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    quantity: delta,
                    color: cartItems.find(i => i.itemId === itemId)?.color,
                    size: cartItems.find(i => i.itemId === itemId)?.size
                })
            });
        } catch (err) {
            console.error(err);
        }
    };

    const removeItem = async (itemId: number) => {
        // Optimistic
        setCartItems(prev => prev.filter(item => item.itemId !== itemId));

        try {
            await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-20 text-center">Loading cart...</div>;
    if (!isAuthenticated) return (
        <div className="p-20 text-center">
            <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
            <Link href="/signin"><Button>Sign In</Button></Link>
        </div>
    );

    const subtotal = cartItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
    const discount = subtotal * 0.2; // 20% discount logic
    const deliveryFee = 15;
    const total = subtotal - discount + deliveryFee;

    return (
        <main className="container py-8 px-4">
            {/* Breadcrumb */}
            <div className="flex gap-2 text-shop-gray-500 text-sm mb-6 items-center">
                <Link href="/">Home</Link> <ChevronRight size={14} /> <span className="text-black font-medium">Cart</span>
            </div>

            <h1 className="text-[40px] font-black font-sans mb-6 uppercase">YOUR CART</h1>

            {cartItems.length === 0 ? (
                <div className="text-center py-10">Your cart is empty.</div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-5">
                    {/* Cart Items List */}
                    <div className="flex-1 border border-shop-border rounded-[20px] p-6 flex flex-col gap-6">
                        {cartItems.map((item, index) => (
                            <div key={item.itemId} className={`flex gap-4 ${index !== cartItems.length - 1 ? "border-b border-shop-border pb-6" : ""}`}>
                                <div className="w-[124px] h-[124px] bg-shop-gray-100 rounded-[9px] relative overflow-hidden flex-shrink-0">
                                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                                            <p className="text-sm text-black">Size: <span className="text-shop-gray-500">{item.size}</span></p>
                                            <p className="text-sm text-black">Color: <span className="text-shop-gray-500">{item.color}</span></p>
                                        </div>
                                        <button onClick={() => removeItem(item.itemId)} className="text-shop-red hover:text-red-700">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold">${item.price}</span>
                                        <div className="bg-shop-gray-100 rounded-[62px] flex items-center px-4 py-2 gap-4">
                                            <button onClick={() => updateQuantity(item.itemId, item.productId, item.quantity, -1)}><Minus size={16} /></button>
                                            <span className="font-medium text-sm">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.itemId, item.productId, item.quantity, 1)}><Plus size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-[505px] border border-shop-border rounded-[20px] p-6 h-fit">
                        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                        <div className="flex flex-col gap-5 border-b border-shop-border pb-5">
                            <div className="flex justify-between items-center text-xl text-shop-gray-500">
                                <span>Subtotal</span>
                                <span className="font-bold text-black">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl text-shop-gray-500">
                                <span>Discount (-20%)</span>
                                <span className="font-bold text-shop-red">-${discount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl text-shop-gray-500">
                                <span>Delivery Fee</span>
                                <span className="font-bold text-black">${deliveryFee}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold py-5">
                            <span>Total</span>
                            <span className="text-2xl">${total.toFixed(2)}</span>
                        </div>

                        <div className="flex gap-3 mb-6">
                            <div className="flex-1 relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-shop-gray-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="Add promo code"
                                    className="w-full pl-12 pr-4 py-3 bg-shop-gray-100 rounded-[62px] outline-none text-base placeholder:text-shop-gray-500"
                                />
                            </div>
                            <Button className="rounded-[62px] px-8 py-3">Apply</Button>
                        </div>

                        <Link href="/checkout" className="w-full">
                            <Button size="full" className="rounded-[62px] py-4 flex items-center justify-center gap-2">
                                Go to Checkout <ArrowRight size={20} />
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </main>
    );
}
