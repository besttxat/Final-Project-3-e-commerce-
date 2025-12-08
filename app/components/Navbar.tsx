
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu as MenuIcon, X } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Input } from "./ui/Input";
import Button from "./ui/Button"; // If needed, but mostly links here

const Navbar = () => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data && data.user) setUser(data.user);
                else setUser(null);
            })
            .catch(() => setUser(null));
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        router.push('/signin');
        router.refresh();
    };

    // Search State
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className="border-b border-shop-border py-6 sticky top-0 bg-white z-50">
            <div className="container flex items-center justify-between gap-10">

                {/* Mobile Menu & Logo */}
                <div className="flex items-center gap-4">
                    {/* Hamburger for mobile */}
                    <div className="block md:hidden">
                        {/* <Menu /> */}
                    </div>
                    <Link href="/" className="text-[32px] font-black font-sans tracking-tight">
                        BA.sic
                    </Link>
                </div>

                {/* Desktop Nav Links */}
                <ul className="hidden md:flex gap-6 text-base whitespace-nowrap">
                    <li><Link href="/shop" className="hover:underline">Shop</Link></li>
                    <li><Link href="/#on-sale" className="hover:underline">On Sale</Link></li>
                    <li><Link href="/#new-arrivals" className="hover:underline">New Arrivals</Link></li>
                    <li><Link href="/tracking" className="hover:underline">Track Order</Link></li>
                    <li><Link href="/#brands" className="hover:underline">Brands</Link></li>
                </ul>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[577px] relative">
                    <Input
                        className="w-full pl-10"
                        placeholder="Search for products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-shop-gray-500" size={20} />
                </form>

                {/* Icons */}
                <div className="flex items-center gap-4">
                    <Link href="/shop?search=" className="md:hidden"><Search size={24} className="text-black" /></Link>
                    <Link href="/cart"><ShoppingCart size={24} className="text-black" /></Link>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium hidden md:block">Hi, {user.name}</span>
                            <Link href="/orders" className="text-sm font-medium hover:underline">My Orders</Link>
                            <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Logout</button>
                        </div>
                    ) : (
                        <Link href="/signin"><User size={24} className="text-black" /></Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
