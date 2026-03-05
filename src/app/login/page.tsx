'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/components/InputField';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/utils/api';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        phone: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await api.post('/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            const farmer = res.data.farmer;
            localStorage.setItem('farmer', JSON.stringify({
                ...farmer,
                plots: [] // Default if not found in farmer object
            }));
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid phone number or password.');
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 pt-32 pb-12 overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-[-1]">
                <Image
                    src="/images/hero-bg.png"
                    alt="Background"
                    fill
                    className="object-cover scale-110 blur-sm"
                />
                <div className="absolute inset-0 bg-deep-green/80 backdrop-blur-md" />
            </div>

            <Card variant="glass" className="w-full max-w-md p-10 border-white/20 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <div className="text-5xl mb-4">🌾</div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">Farmer Login</h2>
                    <p className="text-white/60 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Welcome back to Akhra Kisan</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 text-red-100 rounded-2xl text-sm font-bold text-center border border-red-500/30">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField
                        label="Phone Number"
                        id="phone"
                        type="tel"
                        variant="glass"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        required
                        className="text-white"
                    />
                    <InputField
                        label="Password"
                        id="password"
                        type="password"
                        variant="glass"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        className="text-white"
                    />
                    <div className="pt-4">
                        <Button type="submit" fullWidth className="py-5 text-xl rounded-3xl">
                            Login
                        </Button>
                    </div>
                </form>

                <div className="mt-10 text-center text-sm">
                    <span className="text-white/60 font-medium">New here? </span>
                    <Link href="/register" className="text-white font-black hover:text-soft-green transition-colors uppercase tracking-widest text-xs">
                        Register Farm
                    </Link>
                </div>
            </Card>
        </div>
    );
}
