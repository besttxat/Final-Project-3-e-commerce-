
"use client";
import { Suspense, useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Filters from "../components/Filters";
import { ChevronRight } from "lucide-react";
import { useSearchParams } from 'next/navigation';

interface Product {
    id: number;
    title: string;
    price: string | number;
    rating: number;
    imageUrl: string;
    originalPrice?: string | number;
    discount?: number;
}

function ShopContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        fetch(`/api/products?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setProducts(data);
                else setProducts([]);
            })
            .catch(err => console.error(err));
    }, [searchParams]);

    return (
        <div className="flex gap-5">
            {/* Sidebar */}
            <div className="hidden md:block">
                <Filters />
            </div>

            {/* Product Grid */}
            <div className="flex-1">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-[32px] font-bold capitalize">
                        {searchParams.get('search') ? `Search: "${searchParams.get('search')}"` : (searchParams.get('category') || "Shop")}
                    </h2>
                    <p className="text-shop-gray-500 text-sm">
                        Showing 1-{products.length} of {products.length} Products Sort by: <span className="text-black font-semibold">Most Popular</span>
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
                    {products.map(p => (
                        <ProductCard key={p.id} {...p} />
                    ))}
                    {products.length === 0 && <p className="col-span-3 text-center py-10">Loading products...</p>}
                </div>
            </div>

            {/* Pagination */}
            {/* Omitted for brevity, assuming existing pagination is static for now or part of new request */}
        </div>
    );
}

export default function Shop() {
    return (
        <main className="container py-5 px-4">
            {/* Breadcrumb */}
            <div className="flex gap-2.5 text-shop-gray-500 text-sm mb-5 items-center">
                <span>Home</span> <ChevronRight size={14} /> <span className="text-black font-medium">Shop</span>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <ShopContent />
            </Suspense>
        </main>
    );
}

// Mock Data for Shop

