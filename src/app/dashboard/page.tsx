'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Image from 'next/image';
import api from '@/utils/api';
import { FarmerData } from '@/types/farmer';

const MapPlotter = dynamic(() => import('@/components/MapPlotter'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-white/10 backdrop-blur-md rounded-3xl">
            <div className="text-white font-black animate-pulse">Initializing Mapping Engine...</div>
        </div>
    ),
});

interface PlotData {
    id: number;
    name: string;
    geo_data: any;
    soil_ph: number;
    soil_organic_carbon: number;
}

export default function Dashboard() {
    const router = useRouter();
    const [farmer, setFarmer] = useState<FarmerData | null>(null);
    const [plots, setPlots] = useState<PlotData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMapping, setIsMapping] = useState(false);

    useEffect(() => {
        const savedData = localStorage.getItem('farmer');
        if (savedData) {
            const parsedFarmer = JSON.parse(savedData);
            setFarmer({ ...parsedFarmer, plots: parsedFarmer.plots || [] });
            fetchPlots();
        } else {
            router.push('/login');
        }
    }, [router]);

    const fetchPlots = async () => {
        try {
            const res = await api.get('/plots');
            setPlots(res.data);
        } catch (err) {
            console.error('Error fetching plots:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePlotSaved = async (geoData: any, name: string) => {
        try {
            const res = await api.post('/plots', { geo_data: geoData, name });
            setPlots([res.data, ...plots]);
            setIsMapping(false);
            alert(`Plot "${name}" captured successfully!`);
        } catch (err) {
            console.error('Error saving plot:', err);
            alert('Failed to save plot. Please try again.');
        }
    };

    const handleDeletePlot = async (id: number) => {
        if (!confirm('Are you sure you want to delete this plot? This action cannot be undone.')) return;
        
        try {
            await api.delete(`/plots/${id}`);
            setPlots(plots.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting plot:', err);
            alert('Failed to delete plot.');
        }
    };

    const latestSoilPh = plots.length > 0 ? plots[0].soil_ph : 0;
    const latestSoilSoc = plots.length > 0 ? plots[0].soil_organic_carbon : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-deep-green flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="text-6xl animate-bounce">🌱</div>
                    <div className="text-white font-black uppercase tracking-[0.5em] text-sm italic">Synchronizing Data...</div>
                </div>
            </div>
        );
    }

    if (!farmer) return null;

    return (
        <div className="min-h-screen relative flex flex-col pt-32 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background with Green Overlay */}
            <div className="fixed inset-0 z-[-1]">
                <Image
                    src="/images/hero-bg.png"
                    alt="Farm Background"
                    fill
                    className="object-cover scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-deep-green/90 via-deep-green/60 to-deep-green/95" />
            </div>

            <div className="max-w-7xl mx-auto w-full space-y-10">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 animate-in fade-in slide-in-from-left-10 duration-700">
                    <div className="space-y-2">
                        <div className="inline-block px-3 py-1 glass rounded-full text-white text-[10px] font-black uppercase tracking-widest border-white/10">
                            Farmer Command Center
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
                            Welcome, <span className="text-soft-green">{farmer.name}</span>
                        </h1>
                        <p className="text-white/60 text-lg md:text-xl font-medium tracking-tight">
                            Currently monitoring fields in <span className="text-white font-bold">{farmer.region || 'unspecified region'}</span>, {farmer.district || 'district unassigned'}.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="primary"
                            className="shadow-2xl shadow-primary-green/40 px-8 py-4"
                            onClick={() => setIsMapping(true)}
                        >
                            + New Plot Mapping
                        </Button>
                    </div>
                </div>

                {/* Map Section - Conditional Overlay */}
                {isMapping && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 lg:p-20">
                        <div className="absolute inset-0 bg-deep-green/40 backdrop-blur-sm" onClick={() => setIsMapping(false)} />
                        <div className="relative w-full max-w-5xl h-full max-h-[700px] animate-in fade-in zoom-in-95 duration-500">
                            <MapPlotter
                                onPlotSaved={handlePlotSaved}
                                onCancel={() => setIsMapping(false)}
                            />
                        </div>
                    </div>
                )}

                {/* glass Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">

                    <Card variant="glass" className="relative overflow-hidden group border-white/10">
                        <div className="absolute -right-4 -top-4 text-8xl opacity-10 group-hover:scale-125 transition-transform duration-500">📍</div>
                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">Total Area Mapping</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-white tracking-tighter">{plots.length}</span>
                                <span className="text-soft-green font-bold uppercase text-xs">{plots.length === 1 ? 'Plot' : 'Plots'}</span>
                            </div>
                            <div className="mt-6 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary-green h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(plots.length * 20, 100)}%` }} />
                            </div>
                        </div>
                    </Card>

                    <Card variant="glass" className="relative overflow-hidden group border-white/10">
                        <div className="absolute -right-4 -top-4 text-8xl opacity-10 group-hover:scale-125 transition-transform duration-500">🌱</div>
                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">Soil Environment</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-highlight-yellow tracking-tighter">
                                    {latestSoilPh > 0 ? `PH ${latestSoilPh.toFixed(1)}` : 'N/A'}
                                </span>
                                <span className="text-white/40 font-bold uppercase text-xs underline decoration-highlight-yellow decoration-2">
                                    {latestSoilPh > 0 ? 'Analyzed' : 'Pending'}
                                </span>
                            </div>
                            <div className="mt-6 px-3 py-1 bg-highlight-yellow/10 border border-highlight-yellow/20 rounded-xl inline-block">
                                <span className="text-[10px] text-highlight-yellow font-black uppercase tracking-wider">
                                    {latestSoilSoc > 0 ? `OC: ${latestSoilSoc.toFixed(1)} g/kg` : 'Awaiting Precision Data'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card variant="glass" className="relative overflow-hidden group border-white/10">
                        <div className="absolute -right-4 -top-4 text-8xl opacity-10 group-hover:scale-125 transition-transform duration-500">☁</div>
                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">Climate Control</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-white tracking-tighter">0</span>
                                <span className="text-accent-green font-bold uppercase text-xs">Alerts</span>
                            </div>
                            <p className="mt-6 text-xs text-white/60 font-medium">Weather conditions optimal for growth.</p>
                        </div>
                    </Card>

                    <Card variant="glass" className="relative overflow-hidden group border-white/10">
                        <div className="absolute -right-4 -top-4 text-8xl opacity-10 group-hover:scale-125 transition-transform duration-500">🚜</div>
                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">Yield Optimization</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-white/30 tracking-tighter">NA</span>
                            </div>
                            <p className="mt-6 text-xs text-white/40 italic font-medium">Unlock advisor by adding land plots.</p>
                        </div>
                    </Card>
                </div>

                {/* Plot List Section */}
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            <span className="text-3xl">🗺</span> Registered Plots
                        </h2>
                    </div>

                    {plots.length === 0 ? (
                        <Card variant="glass" className="py-12 text-center border-dashed border-white/20">
                            <div className="text-4xl mb-4 opacity-40">📭</div>
                            <p className="text-white/40 font-bold uppercase text-xs tracking-[0.2em]">No plots registered yet. Use the button above to start mapping.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plots.map((plot) => (
                                <Card key={plot.id} variant="glass" className="p-0 overflow-hidden border-white/10 group">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-black text-white tracking-tight">{plot.name}</h3>
                                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">ID: #{plot.id}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleDeletePlot(plot.id)}
                                                className="text-white/20 hover:text-red-400 transition-colors p-2"
                                                title="Delete Plot"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                                                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Soil PH</p>
                                                <p className="text-lg font-black text-highlight-yellow">{plot.soil_ph.toFixed(1)}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                                                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Organic Carbon</p>
                                                <p className="text-lg font-black text-soft-green">{plot.soil_organic_carbon.toFixed(1)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 px-6 py-3 flex justify-between items-center border-t border-white/5">
                                        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Soil Health: {plot.soil_ph > 6 ? 'Optimal' : 'Needs Care'}</span>
                                        <button className="text-[9px] font-black text-soft-green uppercase tracking-widest hover:underline">View Map →</button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Floating Indicator / secondary Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 animate-in fade-in duration-1000 delay-500">
                    <Button variant="glass" className="text-white border-white/20 px-8 flex items-center gap-3">
                        <span className="text-xl">📄</span> Upload Land Documents
                    </Button>
                    <div className="flex items-center gap-4 px-6 py-3 glass rounded-2xl border-white/10">
                        <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-white/80 uppercase tracking-widest leading-none">Global Mapping Servers Active</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
