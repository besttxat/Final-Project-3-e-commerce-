"use client";
import React, { useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function SignIn() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            // In real app, store token/session here.
            alert('Login Successful!');
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container py-20 px-4 flex justify-center items-center min-h-[60vh]">
            <div className="w-full max-w-[400px] flex flex-col gap-6">
                <h1 className="text-[32px] font-black font-sans uppercase text-center mb-4">LOG IN</h1>

                {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        placeholder="Email Address"
                        className="bg-shop-gray-100"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        className="bg-shop-gray-100"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />

                    <Link href="#" className="text-right text-sm text-shop-gray-500 hover:text-black">Forgot Password?</Link>

                    <Button size="full" className="rounded-[62px]" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </Button>
                </form>

                <div className="relative text-center my-4">
                    <div className="absolute left-0 top-1/2 w-full h-px bg-shop-border"></div>
                    <span className="bg-white px-3 relative z-10 text-shop-gray-500 text-sm">OR</span>
                </div>

                <Button variant="outline" size="full" className="rounded-[62px]">Continue with Google</Button>

                <p className="text-center text-shop-gray-500">
                    Don't have an account? <Link href="/signup" className="text-black font-bold underline">Sign Up</Link>
                </p>
            </div>
        </main>
    );
}
