"use client";
import React, { useState } from "react";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Search, Truck, MapPin, Package, Star } from "lucide-react";

export default function TrackingPage() {
    // Hardcoded to Thailand Post
    const carrier = "THAIPOST";
    const [trackingNumber, setTrackingNumber] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Helper to determine active step
    const getStepStatus = (events: any[]) => {
        if (!events || events.length === 0) return 0;
        const latest = events[events.length - 1];
        const code = parseInt(latest.status);

        // Simple mapping logic based on ThaiPost status codes
        if (code >= 501 || code === 501) return 4; // Delivered
        if (code >= 401) return 3; // Out for delivery
        if (code >= 201) return 2; // In transit
        return 1; // Accepted
    };

    const renderTrackingResult = () => {
        if (!result || !result.response || !result.response.items) return null;

        const items = result.response.items;
        const trackingKey = Object.keys(items)[0];
        const timeline = items[trackingKey];

        if (!timeline || timeline.length === 0) {
            return (
                <div className="mt-8 border-t border-shop-border pt-6 text-center text-shop-gray-500">
                    <p>Tracking number found but no status updates available yet.</p>
                </div>
            );
        }

        const currentStep = getStepStatus(timeline);
        const steps = [
            { label: "รับฝาก", icon: Package },
            { label: "ระหว่างขนส่ง", icon: Truck },
            { label: "ออกไปนำจ่าย", icon: MapPin },
            { label: "นำจ่ายสำเร็จ", icon: Star }
        ];

        return (
            <div className="mt-8 border-t border-shop-border pt-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-600">
                    <MapPin size={24} /> Tracking Result
                </h2>

                <div className="space-y-8">
                    {/* Progress Stepper */}
                    <div className="flex justify-between relative px-2 mb-10">
                        <div className="absolute top-[20px] left-0 w-full h-1 bg-gray-200 -z-10"></div>
                        <div
                            className="absolute top-[20px] left-0 h-1 bg-red-600 -z-10 transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                        ></div>

                        {steps.map((step, i) => {
                            const isActive = i + 1 <= currentStep;

                            return (
                                <div key={i} className="flex flex-col items-center gap-2 bg-white px-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-300 text-gray-300'}`}>
                                        <step.icon size={20} />
                                    </div>
                                    <span className={`text-xs font-bold ${isActive ? 'text-red-900' : 'text-gray-400'}`}>{step.label}</span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Detailed Timeline */}
                    <div className="space-y-6">
                        {timeline.map((event: any, index: number) => (
                            <div key={index} className="flex gap-4 relative">
                                {/* Timeline Line */}
                                {index !== timeline.length - 1 && (
                                    <div className="absolute left-[19px] top-10 w-0.5 h-full bg-shop-gray-200"></div>
                                )}

                                {/* Icon */}
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 border-2 border-red-600 z-10 text-red-600">
                                    {index === timeline.length - 1 ? <Truck size={20} /> : <div className="w-3 h-3 bg-red-600 rounded-full" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-4">
                                    <div className="bg-shop-gray-100 p-4 rounded-xl shadow-sm">
                                        <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                                            <h3 className="font-bold text-lg text-black">{event.status_description}</h3>
                                            <div className="flex items-center gap-1 text-xs text-shop-gray-500 bg-white px-3 py-1 rounded-full border border-shop-gray-200">
                                                <span className="font-mono">{event.status_date}</span>
                                            </div>
                                        </div>
                                        <p className="text-shop-gray-700 mb-2 font-medium">{event.status_detail}</p>
                                        <div className="flex flex-wrap gap-3 text-sm text-shop-gray-500 border-t border-gray-200 pt-2 mt-2">
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {event.location} {event.postcode}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

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
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-4 shadow-lg text-white">
                    <Truck size={40} />
                </div>
                <h1 className="text-[40px] font-black font-sans uppercase text-red-600">Thailand Post</h1>
                <p className="text-shop-gray-500 font-bold">Track & Trace System</p>
            </div>

            <div className="max-w-[600px] mx-auto bg-white border border-shop-border rounded-[20px] p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>

                <form onSubmit={handleTrack} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Tracking Number (EMS / Register)</label>
                        <Input
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Ex. EF123456789TH"
                            className="bg-shop-gray-100 text-center text-lg tracking-widest uppercase font-mono"
                        />
                    </div>

                    <Button size="full" className="rounded-[62px] bg-red-600 hover:bg-red-700" disabled={loading}>
                        {loading ? "Searching..." : "Track Result"}
                    </Button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {renderTrackingResult()}
            </div>
        </main>
    );
}
