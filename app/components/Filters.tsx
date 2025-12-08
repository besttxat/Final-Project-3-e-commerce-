"use client";
import React, { useState } from "react";
import { SlidersHorizontal, ChevronRight, Check } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import Button from "./ui/Button";

const Filters = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial state from URL
    const [priceRange, setPriceRange] = useState<[number, number]>([
        Number(searchParams.get('minPrice')) || 50,
        Number(searchParams.get('maxPrice')) || 200
    ]);

    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "");

    const handleCategoryClick = (category: string) => {
        // Toggle or set
        const newCategory = selectedCategory === category ? "" : category;
        setSelectedCategory(newCategory);

        // Update URL
        const params = new URLSearchParams(searchParams.toString());
        if (newCategory) params.set('category', newCategory);
        else params.delete('category');

        router.push(`/shop?${params.toString()}`);
    };

    const applyPriceFilter = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('minPrice', priceRange[0].toString());
        params.set('maxPrice', priceRange[1].toString());
        router.push(`/shop?${params.toString()}`);
    };

    return (
        <div className="w-[295px] border border-shop-border rounded-[20px] p-6 pb-10">
            <div className="flex justify-between items-center mb-6 border-b border-shop-border pb-6">
                <h3 className="text-xl font-bold font-sans">Filters</h3>
                <SlidersHorizontal className="text-shop-gray-500" size={20} />
            </div>

            {/* Categories */}
            <div className="border-b border-shop-border pb-6 mb-6">
                <div className="flex flex-col gap-3">
                    {["t-shirts", "shorts", "shirts", "hoodie", "jeans"].map((item) => (
                        <div key={item}
                            onClick={() => handleCategoryClick(item)}
                            className={`flex justify-between items-center cursor-pointer p-2 rounded-md ${selectedCategory === item ? "bg-shop-gray-100 font-bold" : "text-shop-gray-500 hover:text-black"}`}>
                            <span className="capitalize">{item.replace("-", " ")}</span>
                            <ChevronRight size={16} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div className="border-b border-shop-border pb-6 mb-6">
                <h3 className="text-xl font-bold font-sans mb-5">Price</h3>
                <div className="flex flex-col gap-4">
                    {/* Simple Range Slider Mock */}
                    <div className="flex gap-4 items-center">
                        <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className="w-20 border p-1 rounded"
                            placeholder="Min"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="w-20 border p-1 rounded"
                            placeholder="Max"
                        />
                    </div>
                    <Button size="full" className="rounded-[62px]" onClick={applyPriceFilter}>Apply Price</Button>
                </div>
            </div>

            {/* Colors (Mock for now, could link to API) */}
            <div className="mb-6">
                <h3 className="text-xl font-bold font-sans mb-5">Colors</h3>
                <div className="flex flex-wrap gap-4">
                    {["#00C12B", "#F50606", "#F5DD06", "#F57906", "#06CAF5", "#063AF5", "#7D06F5", "#F506A4", "#FFFFFF", "#000000"].map((color, i) => (
                        <div key={i} className="w-9 h-9 rounded-full border border-shop-border cursor-pointer" style={{ backgroundColor: color }}></div>
                    ))}
                </div>
            </div>

            {/* Sizes (Mock for now) */}
            <div>
                <h3 className="text-xl font-bold font-sans mb-5">Size</h3>
                <div className="flex flex-wrap gap-2">
                    {["XX-Small", "X-Small", "Small", "Medium", "Large", "X-Large", "XX-Large", "3X-Large", "4X-Large"].map(size => (
                        <button key={size} className="px-5 py-2.5 rounded-[62px] bg-shop-gray-100 text-shop-gray-500 text-sm font-medium hover:bg-black hover:text-white transition-colors">
                            {size}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Filters;
