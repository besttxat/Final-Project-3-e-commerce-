
"use client";
import React, { useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function SignUp() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            alert('Account Created! Please Sign In.');
            router.push('/signin');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container py-20 px-4 flex justify-center items-center min-h-[60vh]">
            <div className="w-full max-w-[400px] flex flex-col gap-6">
                <h1 className="text-[32px] font-black font-sans uppercase text-center mb-4">CREATE ACCOUNT</h1>

                {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        placeholder="Full Name"
                        className="bg-shop-gray-100"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
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
                    <Input
                        type="password"
                        placeholder="Confirm Password"
                        className="bg-shop-gray-100"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />

                    <Button size="full" className="rounded-[62px] mt-4" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <div className="relative text-center my-4">
                    <div className="absolute left-0 top-1/2 w-full h-px bg-shop-border"></div>
                    <span className="bg-white px-3 relative z-10 text-shop-gray-500 text-sm">OR</span>
                </div>

                <Button variant="outline" size="full" className="rounded-[62px]">Continue with Google</Button>

                <p className="text-center text-shop-gray-500">
                    Already have an account? <Link href="/signin" className="text-black font-bold underline">Log In</Link>
                </p>
            </div>
        </main>
    );
}

