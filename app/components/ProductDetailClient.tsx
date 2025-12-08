"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Star, Minus, Plus, Check } from "lucide-react";
import Button from "./ui/Button";

export default function ProductDetailClient({ id }: { id: string }) {
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState("Large");
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState("Reviews");

    useEffect(() => {
        fetch(`/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-20 text-center">Loading product...</div>;
    if (!product || product.message) return <div className="p-20 text-center">Product not found</div>;

    const colors = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : ["#5F6D52", "#314F4A", "#2C2C54"];
    const sizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ["Small", "Medium", "Large", "X-Large"];

    const handleAddToCart = async () => {
        if (!product) return;

        // Basic check purely on frontend, API will check auth
        // Assuming user is logged in if they can see button or we redirect

        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    quantity,
                    color: colors[selectedColor],
                    size: selectedSize // Using state
                })
            });

            if (res.status === 401) {
                alert("Please login first");
                // router.push('/signin'); // Optional
                return;
            }

            if (res.ok) {
                alert("Added to cart!");
            } else {
                alert("Failed to add to cart");
            }
        } catch (err) {
            console.error(err);
            alert("Error adding to cart");
        }
    };

    return (
        <main className="container py-10 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
                {/* Gallery */}
                <div className="flex flex-col-reverse md:flex-row gap-4">
                    {/* ... (SAME) ... */}
                    <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible">
                        {[product.imageUrl, product.imageUrl, product.imageUrl].map((img: string, i: number) => (
                            <div key={i} className="min-w-[100px] h-[100px] md:w-[152px] md:h-[167px] bg-shop-gray-200 rounded-[20px] border border-transparent hover:border-black cursor-pointer overflow-hidden relative">
                                <Image src={img} alt="Thumbnail" fill className="object-cover" />
                            </div>
                        ))}
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 h-[400px] md:h-auto bg-shop-gray-200 rounded-[20px] relative overflow-hidden min-h-[500px]">
                        <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
                    </div>
                </div>

                {/* Product Info */}
                <div>
                    {/* ... (SAME) ... */}
                    <h1 className="text-[40px] font-black font-sans uppercase leading-none mb-3">{product.title}</h1>
                    <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={20} className={i < Math.floor(product.rating) ? "fill-[#FFC633] text-[#FFC633]" : "text-transparent fill-transparent text-shop-gray-200"} />
                        ))}
                        <span className="text-base text-black/60 ml-2">{product.rating}/5</span>
                    </div>

                    <div className="flex items-center gap-3 mb-5">
                        <span className="text-[32px] font-bold">${product.price}</span>
                        {product.originalPrice && <span className="text-[32px] font-bold text-shop-gray-500 line-through">${product.originalPrice}</span>}
                        {product.discount && <span className="bg-[#FF33331A] text-shop-red px-3 py-1 rounded-[62px] text-base font-medium">-{product.discount}%</span>}
                    </div>

                    <p className="text-shop-gray-500 leading-[22px] mb-6">
                        {product.description || "No description available."}
                    </p>

                    {/* Colors */}
                    <div className="mb-6 border-b border-shop-border pb-6">
                        <h3 className="text-shop-gray-500 text-base mb-4">Select Colors</h3>
                        <div className="flex gap-4">
                            {colors.map((c: string, i: number) => (
                                <button key={i}
                                    onClick={() => setSelectedColor(i)}
                                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                                    style={{ backgroundColor: c, border: selectedColor === i ? "2px solid white" : "none", boxShadow: selectedColor === i ? "0 0 0 1px black" : "none" }}
                                >
                                    {selectedColor === i && <Check size={16} color="white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sizes */}
                    <div className="mb-6 border-b border-shop-border pb-6">
                        <h3 className="text-shop-gray-500 text-base mb-4">Choose Size</h3>
                        <div className="flex flex-wrap gap-3">
                            {sizes.map((s: string) => (
                                <button key={s}
                                    onClick={() => setSelectedSize(s)}
                                    className={`px-6 py-3 rounded-[62px] text-sm font-medium transition-colors ${selectedSize === s ? "bg-black text-white" : "bg-shop-gray-100 text-shop-gray-500 hover:bg-gray-200"}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Add to Cart */}
                    <div className="flex gap-5">
                        <div className="bg-shop-gray-100 rounded-[62px] flex items-center px-5 py-4 gap-6 w-[170px] justify-between">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={20} /></button>
                            <span className="font-medium text-base">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)}><Plus size={20} /></button>
                        </div>
                        <Button size="full" className="rounded-[62px]" onClick={handleAddToCart}>Add to Cart</Button>
                    </div>
                </div>
            </div>

            {/* Tabs: Details, Review, FAQs */}
            <div className="mb-16">
                <div className="flex border-b border-shop-border mb-8 justify-around text-center">
                    {["Product Details", "Rating & Reviews", "FAQs"].map(tab => (
                        <button key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-6 text-xl font-medium w-full border-b-[2px] transition-colors ${activeTab === tab ? "border-black text-black" : "border-transparent text-shop-gray-500"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div>
                    {activeTab === "Rating & Reviews" && (
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold">All Reviews <span className="text-shop-gray-500 text-base font-normal">(451)</span></h3>
                                <div className="flex gap-2.5">
                                    <Button variant="secondary" size="md" className="rounded-[62px]">Latest</Button>
                                    <Button size="md" className="rounded-[62px]">Write a Review</Button>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                {REVIEWS.map((r, i) => (
                                    <div key={i} className="border border-shop-border p-7 rounded-[20px] flex flex-col gap-3">
                                        <div className="flex justify-between">
                                            <div className="flex gap-1">
                                                {Array.from({ length: 5 }).map((_, j) => (
                                                    <Star key={j} size={22} className="fill-[#FFC633] text-[#FFC633]" />
                                                ))}
                                            </div>
                                            <span className="text-shop-gray-500">...</span>
                                        </div>
                                        <h4 className="text-xl font-bold flex items-center gap-1.5">{r.name} <span className="bg-[#01AB31] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">✓</span></h4>
                                        <p className="text-shop-gray-500 leading-relaxed font-light">"{r.text}"</p>
                                        <p className="text-shop-gray-500 font-medium text-sm mt-2">Posted on {r.date}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-6">
                                <Button variant="secondary" className="px-10">Load More Reviews</Button>
                            </div>
                        </div>
                    )}
                    {activeTab === "Product Details" && <p className="py-10 text-center text-shop-gray-500">Product details content goes here.</p>}
                    {activeTab === "FAQs" && <p className="py-10 text-center text-shop-gray-500">FAQs content goes here.</p>}
                </div>
            </div>

            {/* You Might Also Like */}
            <div>
                <h2 className="text-[32px] md:text-[48px] font-black text-center mb-14 font-sans uppercase">YOU MIGHT ALSO LIKE</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <p className="col-span-4 text-center text-gray-400">Related products loading...</p>
                </div>
            </div>
        </main>
    );
}

const REVIEWS = [
    { name: "Samantha D.", text: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt.", date: "August 14, 2023" },
    { name: "Alex M.", text: "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me.", date: "August 15, 2023" },
    { name: "Ethan R.", text: "This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can see the designer's touch in every aspect of this shirt.", date: "August 16, 2023" },
    { name: "Olivia P.", text: "As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear. It's evident that the designer poured their creativity into making this t-shirt stand out.", date: "August 17, 2023" },
];
