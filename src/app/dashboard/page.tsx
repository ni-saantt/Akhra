'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import api from '@/utils/api';
import { FarmerData } from '@/types/farmer';
import GlassCard from '@/components/GlassCard';
import PlotCard from '@/components/PlotCard';
import WeatherCard from '@/components/WeatherCard';
import PlotDetailModal from '@/components/PlotDetailModal';

const MapPlotter = dynamic(() => import('@/components/MapPlotter'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-white/10 backdrop-blur-md rounded-3xl">
            <div className="text-white font-black animate-pulse">Initializing Mapping Engine...</div>
        </div>
    ),
});

const MiniFarmMap = dynamic(() => import('@/components/MiniFarmMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-deep-green/20">
            <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
        </div>
    )
});

interface PlotData {
    id: number;
    name: string;
    geo_data: any;
    soil_ph: number;
    soil_organic_carbon: number;
    crop_name?: string;
    planting_date?: string;
    harvest_duration?: number;
    moisture_level?: number;
    pest_risk?: string;
    weather_alert?: string;
    created_at?: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [farmer, setFarmer] = useState<FarmerData | null>(null);
    const [plots, setPlots] = useState<PlotData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMapping, setIsMapping] = useState(false);
    const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(null);

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

    const handleViewMap = (plot: PlotData) => {
        setSelectedPlot(plot);
    };

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

    // Derived stats
    const totalArea = plots.reduce((sum, p) => sum + (1.5 + (p.id % 3)), 0).toFixed(1);
    const latestSoilPh = plots.length > 0 ? plots[0].soil_ph : 0;
    const latestSoilSoc = plots.length > 0 ? plots[0].soil_organic_carbon : 0;
    const avgPh = plots.length > 0 ? (plots.reduce((sum, p) => sum + p.soil_ph, 0) / plots.length).toFixed(1) : 'N/A';

    return (
        <div className="min-h-screen relative flex flex-col pt-28 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
            {/* Background with Green Overlay */}
            <div className="fixed inset-0 z-[-1]">
                <Image
                    src="/images/hero-bg.png"
                    alt="Farm Background"
                    fill
                    className="object-cover scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-green/95 via-deep-green/70 to-deep-green/40 backdrop-blur-[2px]" />
            </div>

            <div className="max-w-7xl mx-auto w-full">

                {/* Header Label - Moved outside the grid to align Map with Welcome text */}
                <div className="animate-slide-up mb-2 px-2">
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">
                        FARMER COMMAND CENTER
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column (Main Stats & Actions) */}
                    <div className="lg:col-span-8 space-y-6 flex flex-col">
                        
                        {/* Hero Info */}
                        <div className="animate-slide-up">
                            <h1 className="text-3xl md:text-5xl lg:text-5xl font-black text-white tracking-tighter mb-4 whitespace-nowrap">
                                Welcome, <span className="text-soft-green">{farmer.name}</span>
                            </h1>
                            <p className="text-white/80 font-medium text-sm md:text-base flex items-center gap-2">
                                Region: <strong className="text-white">{farmer.region}, {farmer.district}</strong>
                                <span className="opacity-50">•</span>
                                Total Farms: <strong className="text-white">{plots.length}</strong>
                                <span className="opacity-50">•</span>
                                Total Area: <strong className="text-white">{totalArea} Acres</strong>
                            </p>
                        </div>

                        {/* Primary Action Card */}
                        <GlassCard className="animate-slide-up bg-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-black text-white tracking-tight mb-2">Start Mapping Your Farm</h2>
                                <p className="text-white/70 text-sm">Draw your farm boundary to unlock soil insights and crop recommendations.</p>
                            </div>
                            <button
                                onClick={() => setIsMapping(true)}
                                className="bg-primary-green hover:bg-deep-green text-white px-6 py-4 rounded-full font-black uppercase text-xs tracking-[0.15em] transition-all shadow-xl active:scale-95 whitespace-nowrap"
                            >
                                + Add New Farm Plot
                            </button>
                        </GlassCard>

                        {/* Middle Stat Cards Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up text-white">
                            {/* Area Mapped */}
                            <GlassCard className="flex flex-col justify-center">
                                <h3 className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="text-accent-green text-lg">📏</span> Total Area Mapped
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tracking-tighter">{totalArea}</span>
                                    <span className="text-sm font-bold tracking-widest uppercase">Acres</span>
                                </div>
                                <p className="text-xs text-white/50 mt-4 uppercase font-bold tracking-wider">{plots.length} PLOTS</p>
                            </GlassCard>

                            {/* Soil Environment */}
                            <GlassCard>
                                <h3 className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="text-highlight-yellow text-lg">💧</span> Soil Environment
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-highlight-yellow tracking-tighter">
                                        PH {latestSoilPh > 0 ? latestSoilPh.toFixed(1) : '-'}
                                    </span>
                                </div>
                                <div className="mt-4 px-2 py-1 bg-white/10 rounded inline-block">
                                    <span className="text-[10px] text-highlight-yellow font-black uppercase tracking-wider">
                                        OC: {latestSoilSoc > 0 ? latestSoilSoc.toFixed(1) : '-'} G/KG
                                    </span>
                                </div>
                            </GlassCard>

                            {/* Weather */}
                            <WeatherCard />
                        </div>
                    </div>

                    {/* Right Column (Map) - Now stretches exactly to sibling height */}
                    <div className="lg:col-span-4 animate-slide-up">
                        <GlassCard className="h-[400px] lg:h-full flex flex-col p-4 w-full">
                            <div className="flex items-center gap-2 mb-4 px-2">
                                <span className="text-xl">📍</span>
                                <h3 className="text-[14px] font-black text-white uppercase tracking-widest">Your Farm Map</h3>
                            </div>
                            <div className="flex-1 w-full relative rounded-2xl overflow-hidden border border-white/20">
                                {plots.length > 0 ? (
                                    <MiniFarmMap plots={plots} />
                                ) : (
                                    <div className="w-full h-full bg-deep-green/50 flex items-center justify-center">
                                        <p className="text-white/40 font-bold text-xs uppercase tracking-widest">No Map Data</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>

                </div>

                {/* Bottom Section (Full Width below Top Grid) */}
                <div className="mt-8 space-y-8">
                    {/* Registered Plots Section */}
                    <div className="animate-slide-up">
                        <h2 className="text-[14px] font-black text-white tracking-widest uppercase mb-4 flex items-center gap-3">
                            <span className="text-xl">🚜</span> Registered Plots
                        </h2>
                        {plots.length === 0 ? (
                            <GlassCard className="py-10 text-center border-dashed">
                                <p className="text-white/50 font-bold uppercase text-xs tracking-widest">No plots registered yet.</p>
                            </GlassCard>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {plots.map((plot) => (
                                    <PlotCard 
                                        key={plot.id} 
                                        plot={plot} 
                                        onDelete={handleDeletePlot} 
                                        onViewMap={handleViewMap} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bottom Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up text-white/80">
                        <GlassCard dark className="text-center py-4">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1">TOTAL FARMS</p>
                            <p className="text-2xl font-black text-white">{plots.length}</p>
                        </GlassCard>
                        <GlassCard dark className="text-center py-4">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1">TOTAL AREA MAPPED</p>
                            <p className="text-2xl font-black text-white">{totalArea} Ac</p>
                        </GlassCard>
                        <GlassCard dark className="text-center py-4">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1">AVERAGE SOIL PH</p>
                            <p className="text-2xl font-black text-highlight-yellow">{avgPh}</p>
                        </GlassCard>
                </div>
                </div>

                {/* Map Mapping Overlay Modal */}
                {isMapping && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 lg:p-12">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMapping(false)} />
                        <div className="relative w-full max-w-5xl h-[85vh] animate-in fade-in zoom-in-95 duration-500 rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
                            <MapPlotter
                                onPlotSaved={handlePlotSaved}
                                onCancel={() => setIsMapping(false)}
                            />
                        </div>
                    </div>
                )}
                {/* Plot Detail Modal */}
                {selectedPlot && (
                    <PlotDetailModal 
                        plot={selectedPlot} 
                        onClose={() => setSelectedPlot(null)} 
                    />
                )}

            </div>
        </div>
    );
}
