'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/components/InputField';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Link from 'next/link';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        region: '',
        district: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.password) {
            alert('Please fill out all required fields (Name, Phone, Password).');
            return;
        }

        localStorage.setItem('farmer', JSON.stringify({ ...formData, plots: 0 }));
        router.push('/dashboard');
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-12">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
                    <p className="text-sm text-gray-500 mt-2">Join the smart farming platform</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        label="Full Name *"
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                    />
                    <InputField
                        label="Phone Number *"
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 9876543210"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="State / Region"
                            id="region"
                            type="text"
                            value={formData.region}
                            onChange={handleChange}
                            placeholder="Your State"
                        />
                        <InputField
                            label="District"
                            id="district"
                            type="text"
                            value={formData.district}
                            onChange={handleChange}
                            placeholder="Your District"
                        />
                    </div>
                    <InputField
                        label="Password *"
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        required
                    />
                    <div className="pt-2">
                        <Button type="submit" fullWidth className="py-3 text-lg">
                            Register
                        </Button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-green-600 hover:text-green-700 font-bold transition-colors">
                        Login
                    </Link>
                </div>
            </Card>
        </div>
    );
}
