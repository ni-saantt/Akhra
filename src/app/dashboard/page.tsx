'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Card from '@/components/Card';

interface FarmerData {
    name: string;
    phone: string;
    region?: string;
    district?: string;
    plots: number;
}

export default function Dashboard() {
    const router = useRouter();
    const [farmer, setFarmer] = useState<FarmerData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedData = localStorage.getItem('farmer');
        if (savedData) {
            setFarmer(JSON.parse(savedData));
        } else {
            router.push('/login');
        }
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
                <div className="text-green-600 font-semibold text-xl animate-pulse">Loading dashboard...</div>
            </div>
        );
    }

    if (!farmer) return null;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Welcome, {farmer.name}
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg">
                            {farmer.region || 'Region not set'} • {farmer.district || 'District not set'}
                        </p>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="hover:shadow-lg transition-shadow border border-green-50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-700">Plots</h3>
                            <span className="text-2xl">📍</span>
                        </div>
                        <div className="text-3xl font-extrabold text-gray-900 mb-2">{farmer.plots}</div>
                        <p className="text-sm text-gray-500 font-medium">Plots added</p>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow border border-green-50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-700">Soil Health</h3>
                            <span className="text-2xl">🌱</span>
                        </div>
                        <div className="text-3xl font-extrabold text-yellow-600 mb-2 mb-2">-</div>
                        <p className="text-sm font-semibold text-yellow-600 bg-yellow-50 inline-block px-3 py-1 rounded-full">Status: Pending</p>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow border border-green-50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-700">Weather Alerts</h3>
                            <span className="text-2xl">☁</span>
                        </div>
                        <div className="text-3xl font-extrabold text-green-600 mb-2 mb-2">0</div>
                        <p className="text-sm font-semibold text-green-700 bg-green-50 inline-block px-3 py-1 rounded-full">Status: No alerts</p>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow border border-green-50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-700">Crop Advisory</h3>
                            <span className="text-2xl">🚜</span>
                        </div>
                        <div className="text-3xl font-extrabold text-gray-300 mb-2 mb-2">-</div>
                        <p className="text-sm font-semibold text-gray-600 bg-gray-100 inline-block px-3 py-1 rounded-full">Status: No recommendations</p>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button variant="primary" className="py-3 px-6 shadow-md text-base">
                        Add Plot
                    </Button>
                    <Button variant="secondary" className="py-3 px-6 border border-green-200 text-base">
                        Upload Land Document
                    </Button>
                </div>

            </div>
        </div>
    );
}
