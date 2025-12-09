"use client";
import React, { useState, useEffect } from "react";
import Script from "next/script";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function CheckoutPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'promptpay' | 'paypal'>('card');

    // Card State
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryMonth, setExpiryMonth] = useState("");
    const [expiryYear, setExpiryYear] = useState("");
    const [cvc, setCvc] = useState("");

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        // Check Auth & Fetch cart
        Promise.all([
            fetch('/api/auth/me').then(res => res.json()),
            fetch('/api/cart')
        ]).then(async ([dbUser, cartRes]) => {
            if (!dbUser.user) {
                router.push('/signin?redirect=/checkout');
                return;
            }
            setUserId(dbUser.user.id);

            if (cartRes.ok) {
                const data = await cartRes.json();
                if (data.items) {
                    const sub = data.items.reduce((acc: number, item: { price: string | number, quantity: number }) => acc + (Number(item.price) * item.quantity), 0);
                    const discount = sub * 0.2;
                    const total = sub - discount + 15;
                    setCartTotal(total);
                }
            }
        });
    }, [router]);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const publicKey = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY;
        if (!publicKey) {
            alert("Omise Public Key missing");
            setLoading(false);
            return;
        }

        window.Omise.setPublicKey(publicKey);

        if (paymentMethod === 'card') {
            const card = {
                name: cardName,
                number: cardNumber,
                expiration_month: expiryMonth,
                expiration_year: expiryYear,
                security_code: cvc
            };

            window.Omise.createToken('card', card, async (statusCode: number, response: { id: string; message?: string }) => {
                if (statusCode === 200) {
                    await processPayment({ token: response.id, amount: cartTotal });
                } else {
                    alert(`Card creation failed: ${response.message}`);
                    setLoading(false);
                }
            });
        } else if (paymentMethod === 'promptpay') {
            window.Omise.createSource('promptpay', {
                "amount": Math.round(cartTotal * 100),
                "currency": "thb"
            }, async (statusCode: number, response: { id: string; message?: string }) => {
                if (statusCode === 200) {
                    await processPayment({ source: response.id, amount: cartTotal });
                } else {
                    alert(`PromptPay failed: ${response.message}`);
                    setLoading(false);
                }
            });
        }
    };

    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    const processPayment = async (payload: { token?: string, source?: string, amount: number }) => {
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                if (data.charge && data.charge.source && data.charge.source.scannable_code) {
                    // PromptPay QR Code
                    setQrCodeUrl(data.charge.source.scannable_code.image.download_uri);
                    setLoading(false);
                } else if (data.charge && data.charge.authorize_uri) {
                    // 3D Secure redirect
                    window.location.href = data.charge.authorize_uri;
                } else {
                    alert("Payment Successful! Order ID: " + data.orderId);
                    router.push('/orders');
                }
            } else {
                alert(`Payment failed: ${data.message} ${data.details || ''}`);
                setLoading(false);
            }

        } catch (err) {
            console.error(err);
            alert("Error processing payment");
            setLoading(false);
        }
    };

    if (qrCodeUrl) {
        return (
            <main className="container py-20 px-4 text-center">
                <h1 className="text-3xl font-black mb-6">Scan to Pay</h1>
                <div className="max-w-md mx-auto border border-shop-border p-8 rounded-[20px] shadow-lg">
                    <img src={qrCodeUrl} alt="PromptPay QR" className="w-full h-auto mb-6" />
                    <p className="text-lg font-bold mb-4">Please scan with your banking app</p>
                    <p className="text-shop-gray-500 mb-6">Order total: ${cartTotal.toFixed(2)}</p>
                    <Link href="/orders">
                        <Button size="full">I have paid</Button>
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="container py-20 px-4">
            <Script src="https://cdn.omise.co/omise.js" />

            <h1 className="text-4xl font-black mb-10 text-center uppercase">Checkout</h1>

            <div className="max-w-[500px] mx-auto border border-shop-border p-8 rounded-[20px]">
                <div className="flex gap-2 mb-8">
                    <button
                        onClick={() => setPaymentMethod('card')}
                        className={`flex-1 py-3 rounded-xl font-bold border text-sm ${paymentMethod === 'card' ? 'bg-black text-white border-black' : 'bg-white text-black border-shop-gray-200'}`}
                    >
                        Credit Card
                    </button>
                    <button
                        onClick={() => setPaymentMethod('promptpay')}
                        className={`flex-1 py-3 rounded-xl font-bold border text-sm ${paymentMethod === 'promptpay' ? 'bg-black text-white border-black' : 'bg-white text-black border-shop-gray-200'}`}
                    >
                        PromptPay
                    </button>
                    <button
                        onClick={() => setPaymentMethod('paypal')}
                        className={`flex-1 py-3 rounded-xl font-bold border text-sm ${paymentMethod === 'paypal' ? 'bg-[#0070ba] text-white border-[#0070ba]' : 'bg-white text-[#0070ba] border-shop-gray-200'}`}
                    >
                        PayPal
                    </button>
                </div>

                {paymentMethod === 'paypal' ? (
                    <div className="flex flex-col gap-5">
                        <div className="border-t border-shop-border pt-5">
                            <div className="flex justify-between text-xl font-bold mb-5">
                                <span>Total</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="text-center py-6 bg-blue-50 rounded-xl border border-blue-200 mb-4">
                            <p className="text-blue-700 text-sm">
                                You will be redirected to PayPal to complete your payment securely.
                            </p>
                        </div>

                        <Button
                            size="full"
                            className="rounded-[62px] bg-[#0070ba] hover:bg-[#005ea6]"
                            disabled={loading}
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const res = await fetch('/api/paypal/create-order', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                    });
                                    const data = await res.json();

                                    if (res.ok && data.approvalUrl) {
                                        window.location.href = data.approvalUrl;
                                    } else {
                                        alert(`Error: ${data.message || 'Failed to create PayPal order'}`);
                                        setLoading(false);
                                    }
                                } catch (err) {
                                    console.error('PayPal error:', err);
                                    alert('Error connecting to PayPal');
                                    setLoading(false);
                                }
                            }}
                        >
                            {loading ? "Redirecting to PayPal..." : "Pay with PayPal"}
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleCheckout} className="flex flex-col gap-5">
                        {paymentMethod === 'card' ? (
                            <>
                                <Input placeholder="Name on Card" value={cardName} onChange={e => setCardName(e.target.value)} required />
                                <Input placeholder="Card Number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required maxLength={16} />
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <Input placeholder="MM" value={expiryMonth} onChange={e => setExpiryMonth(e.target.value)} required maxLength={2} className="w-full" />
                                    </div>
                                    <div className="flex-1">
                                        <Input placeholder="YYYY" value={expiryYear} onChange={e => setExpiryYear(e.target.value)} required maxLength={4} className="w-full" />
                                    </div>
                                    <div className="flex-1">
                                        <Input placeholder="CVC" value={cvc} onChange={e => setCvc(e.target.value)} required maxLength={3} className="w-full" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-10 bg-shop-gray-100 rounded-xl">
                                <p className="text-shop-gray-500 text-sm">
                                    Click <strong>&quot;Pay&quot;</strong> to generate your PromptPay QR Code.
                                    <br />You will be redirected to the secure payment page.
                                </p>
                            </div>
                        )}

                        <div className="border-t border-shop-border pt-5 mt-2">
                            <div className="flex justify-between text-xl font-bold mb-5">
                                <span>Total</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <Button size="full" className="rounded-[62px]" disabled={loading}>
                                {loading ? "Processing..." : `Pay $${cartTotal.toFixed(2)}`}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}
