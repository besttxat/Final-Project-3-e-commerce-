"use client";
import React, { useState } from "react";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Search, Truck, MapPin, Package } from "lucide-react";

export default function TrackingPage() {
    const [carrier, setCarrier] = useState("JT");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const CARRIERS = [
        { value: "JT", label: "J&T Express" },
        { value: "FLASH", label: "Flash Express" },
        { value: "SPX", label: "Shopee Express" },
        { value: "KERRY", label: "Kerry Express" },
        { value: "NINJA", label: "Ninja Van" },
        { value: "BEST", label: "Best Express" },
        { value: "THAIPOST", label: "Thailand Post" },
        { value: "SCG", label: "SCG Express" },
        { value: "DHL", label: "DHL Express" },
        { value: "UPS", label: "UPS" },
        { value: "FEDEX", label: "FedEx" },
        { value: "CJ", label: "CJ Logistics" }
    ];

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch(`/api/tracking?carrier=${carrier}&tracking_number=${trackingNumber}`);
            const data = await res.json();

            if (!res.ok) {
                // Map error codes based on spec
                if (res.status === 429) throw new Error("Too many requests. Please wait.");
                if (res.status === 300) throw new Error("Invalid API Key configuration.");
                throw new Error(data.message || "Failed to track parcel.");
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container py-20 px-4 min-h-[70vh]">
            <h1 className="text-[40px] font-black font-sans uppercase text-center mb-8">Track Your Order</h1>

            <div className="max-w-[600px] mx-auto bg-white border border-shop-border rounded-[20px] p-8 shadow-sm">
                <form onSubmit={handleTrack} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Select Carrier</label>
                        <select
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            className="w-full bg-shop-gray-100 rounded-[62px] px-6 py-3 outline-none appearance-none cursor-pointer"
                        >
                            {CARRIERS.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Tracking Number</label>
                        <Input
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Ex. 82xxxx or THxxxx"
                            className="bg-shop-gray-100"
                        />
                    </div>

                    <Button size="full" className="rounded-[62px]" disabled={loading}>
                        {loading ? "Tracking..." : "Track Parcel"}
                    </Button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="mt-8 border-t border-shop-border pt-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Truck size={24} /> Status Info
                        </h2>

                        {/* 
                           Since I don't have the exact JSON response structure for the "success" case from the user provided text
                           (it just listed response codes), I will assume a generic structure or dump the JSON nicely.
                           Usual tracking JSON has a 'status' and 'timeline' array.
                        */}
                        <div className="bg-shop-gray-100 p-4 rounded-xl overflow-x-auto">
                            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
