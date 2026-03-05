'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/components/InputField';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/utils/api';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        region: '',
        district: '',
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

        if (!formData.name || !formData.phone || !formData.password) {
            setError('Please fill out all required fields.');
            return;
        }

        try {
            const res = await api.post('/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            const farmer = res.data.farmer;
            localStorage.setItem('farmer', JSON.stringify({
                ...farmer,
                plots: []
            }));
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
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

            <Card variant="glass" className="w-full max-w-xl p-10 border-white/20 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <div className="text-5xl mb-4">🚜</div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">Register Farm</h2>
                    <p className="text-white/60 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Join the digital farming revolution</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 text-red-100 rounded-2xl text-sm font-bold text-center border border-red-500/30">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField
                        label="Full Name *"
                        id="name"
                        type="text"
                        variant="glass"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="text-white"
                    />
                    <InputField
                        label="Phone Number *"
                        id="phone"
                        type="tel"
                        variant="glass"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        required
                        className="text-white"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InputField
                            label="Region / village"
                            id="region"
                            type="text"
                            variant="glass"
                            value={formData.region}
                            onChange={handleChange}
                            placeholder="Green Village"
                            className="text-white"
                        />
                        <InputField
                            label="District"
                            id="district"
                            type="text"
                            variant="glass"
                            value={formData.district}
                            onChange={handleChange}
                            placeholder="Agriculture District"
                            className="text-white"
                        />
                    </div>
                    <InputField
                        label="Password *"
                        id="password"
                        type="password"
                        variant="glass"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        required
                        className="text-white"
                    />
                    <div className="pt-4">
                        <Button type="submit" fullWidth className="py-5 text-xl rounded-3xl">
                            Create Farmer Account
                        </Button>
                    </div>
                </form>

                <div className="mt-10 text-center text-sm">
                    <span className="text-white/60 font-medium">Already registered? </span>
                    <Link href="/login" className="text-white font-black hover:text-soft-green transition-colors uppercase tracking-widest text-xs">
                        Log In
                    </Link>
                </div>
            </Card>
        </div>
    );
}
