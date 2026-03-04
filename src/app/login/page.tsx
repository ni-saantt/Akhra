'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/components/InputField';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Link from 'next/link';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        phone: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error on change
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const savedData = localStorage.getItem('farmer');
        if (savedData) {
            const farmer = JSON.parse(savedData);
            if (farmer.phone === formData.phone && farmer.password === formData.password) {
                router.push('/dashboard');
            } else {
                setError('Invalid phone number or password.');
            }
        } else {
            setError('No user found. Please register.');
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-12">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
                    <p className="text-sm text-gray-500 mt-2">Sign in to your farmer account</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium text-center border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        label="Phone Number"
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 9876543210"
                        required
                    />
                    <InputField
                        label="Password"
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />
                    <div className="pt-2">
                        <Button type="submit" fullWidth className="py-3 text-lg">
                            Login
                        </Button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-green-600 hover:text-green-700 font-bold transition-colors">
                        Register
                    </Link>
                </div>
            </Card>
        </div>
    );
}
