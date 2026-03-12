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

import TabNavigation, { TabType } from '@/components/TabNavigation';
import KisanBuddy from '@/components/KisanBuddy';
import CommandSidebar from '@/components/CommandSidebar';

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
    const [activeTab, setActiveTab] = useState<TabType>('home');
    
    // Market search and filter state (moved to top level to follow Rules of Hooks)
    const [marketQuery, setMarketQuery] = useState('');
    const [selectedCrop, setSelectedCrop] = useState('Wheat');
    const [chartRange, setChartRange] = useState('30 Days');
    
    // Official Seva Eligibility State
    const [eligibilityStep, setEligibilityStep] = useState(0);
    const [eligibleResult, setEligibleResult] = useState<string[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Multi-Plot Market State
    const [referencePlotId, setReferencePlotId] = useState<number | null>(null);

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

    const renderTabContent = () => {
        switch(activeTab) {
            case 'home':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Header Label */}
                        <div className="mb-2 px-2">
                            <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">
                                FARMER COMMAND CENTER
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left Column */}
                            <div className="lg:col-span-8 space-y-6 flex flex-col">
                                <div className="animate-slide-up">
                                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 truncate">
                                        Namaste, <span className="text-soft-green">{farmer.name}</span>
                                    </h1>
                                    <p className="text-white/60 font-medium text-xs md:text-sm flex flex-wrap items-center gap-3 uppercase tracking-wider">
                                        <span>{farmer.district}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/20" />
                                        <span>{plots.length} Plots</span>
                                        <span className="w-1 h-1 rounded-full bg-white/20" />
                                        <span>{totalArea} Acres</span>
                                    </p>
                                </div>

                                <GlassCard className="bg-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-black text-white tracking-tight mb-2">Start Mapping Your Farm</h2>
                                        <p className="text-white/70 text-sm">Draw your farm boundary to unlock soil insights.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsMapping(true)}
                                        className="bg-primary-green hover:bg-deep-green text-white px-6 py-4 rounded-full font-black uppercase text-xs tracking-[0.15em] transition-all shadow-xl active:scale-95"
                                    >
                                        + Add New Plot
                                    </button>
                                </GlassCard>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-white">
                                    <GlassCard className="flex flex-col justify-center">
                                        <h3 className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            📏 Total Mapped Area
                                        </h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black tracking-tighter">{totalArea}</span>
                                            <span className="text-sm font-bold tracking-widest">Acres</span>
                                        </div>
                                    </GlassCard>
                                    <GlassCard>
                                        <h3 className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            🧪 Soil PH
                                        </h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-highlight-yellow tracking-tighter">
                                                {latestSoilPh > 0 ? latestSoilPh.toFixed(1) : '-'}
                                            </span>
                                        </div>
                                    </GlassCard>
                                    <WeatherCard />
                                </div>
                            </div>

                            {/* Right Column (Map) */}
                            <div className="lg:col-span-4 h-[400px] lg:h-auto">
                                <GlassCard className="h-full flex flex-col p-4 w-full">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-[14px] font-black text-white uppercase tracking-widest">Village Map View</span>
                                    </div>
                                    <div className="flex-1 w-full relative rounded-2xl overflow-hidden border border-white/20">
                                        {plots.length > 0 ? <MiniFarmMap plots={plots} /> : <div className="w-full h-full bg-deep-green/50 flex items-center justify-center text-white/40 font-bold text-xs uppercase tracking-widest">No Data</div>}
                                    </div>
                                </GlassCard>
                            </div>
                        </div>

                        {/* Plots List */}
                        <div className="mt-8 space-y-8">
                            <h2 className="text-[14px] font-black text-white tracking-widest uppercase mb-4 flex items-center gap-3">
                                <span className="text-xl">🚜</span> Registered Plots
                            </h2>
                            {plots.length === 0 ? (
                                <GlassCard className="py-10 text-center border-dashed"><p className="text-white/50 font-bold uppercase text-xs tracking-widest">No plots registered.</p></GlassCard>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-32">
                                    {plots.map((plot) => (
                                        <PlotCard key={plot.id} plot={plot} onDelete={handleDeletePlot} onViewMap={handleViewMap} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'market':
                // Expanded simulated data
                const crops = ['Wheat', 'Rice', 'Maize', 'Mustard', 'Tomato', 'Potato'];
                const mandis = [
                    { name: 'Ranchi Mandi', lat: 23.3441, lng: 85.3096, prices: { Wheat: 2125, Rice: 2050, Maize: 1850, Mustard: 5450, Tomato: 1200, Potato: 950 } },
                    { name: 'Khunti Mandi', lat: 23.0760, lng: 85.2785, prices: { Wheat: 2080, Rice: 2010, Maize: 1890, Mustard: 5410, Tomato: 1150, Potato: 920 } },
                    { name: 'Hazaribagh Mandi', lat: 23.9926, lng: 85.3633, prices: { Wheat: 2150, Rice: 2100, Maize: 1820, Mustard: 5500, Tomato: 1250, Potato: 980 } },
                    { name: 'Lohardaga Mandi', lat: 23.4385, lng: 84.6787, prices: { Wheat: 2110, Rice: 2030, Maize: 1860, Mustard: 5430, Tomato: 1180, Potato: 940 } },
                    { name: 'Jamshedpur Sabji Mandi', lat: 22.8046, lng: 86.2029, prices: { Wheat: 2140, Rice: 2060, Maize: 1870, Mustard: 5480, Tomato: 1120, Potato: 900 } },
                    { name: 'Dhanbad Mandi', lat: 23.7957, lng: 86.4304, prices: { Wheat: 2160, Rice: 2110, Maize: 1830, Mustard: 5520, Tomato: 1280, Potato: 1010 } },
                    { name: 'Muhana Sabji Mandi (Jaipur)', lat: 26.8118, lng: 75.7600, prices: { Wheat: 2100, Rice: 2040, Maize: 1900, Mustard: 5400, Tomato: 1080, Potato: 850 } },
                    { name: 'Jaipur Grain Mandi', lat: 26.9124, lng: 75.7873, prices: { Wheat: 2130, Rice: 2080, Maize: 1880, Mustard: 5460, Tomato: 1020, Potato: 820 } },
                    { name: 'Bhakrota Vegetable Hub', lat: 26.8622, lng: 75.6880, prices: { Wheat: 2090, Rice: 2030, Maize: 1910, Mustard: 5390, Tomato: 1040, Potato: 810 } },
                    { name: 'Sanganer Mandi', lat: 26.8040, lng: 75.7850, prices: { Wheat: 2110, Rice: 2055, Maize: 1895, Mustard: 5420, Tomato: 1100, Potato: 840 } },
                    { name: 'Muzaffarpur Sabji Mandi', lat: 26.1209, lng: 85.3647, prices: { Wheat: 2090, Rice: 2020, Maize: 1950, Mustard: 5380, Tomato: 1050, Potato: 880 } },
                ];

                // Simple search and filter state uses top-level hooks defined in Dashboard component

                // Robust Multi-Plot Distance Logic
                const getDistance = (lat: number, lng: number) => {
                    const extractCoords = (p: PlotData) => {
                        // Priority 1: features[0] geometry
                        let coords = p.geo_data?.features?.[0]?.geometry?.coordinates;
                        
                        // If it's a Polygon [[[lng,lat],...]]
                        if (Array.isArray(coords?.[0]?.[0])) return coords[0][0];
                        // If it's a Point [lng,lat]
                        if (Array.isArray(coords)) return coords;
                        
                        // Priority 2: Direct geometry (for some older models)
                        coords = p.geo_data?.geometry?.coordinates;
                        if (Array.isArray(coords?.[0]?.[0])) return coords[0][0];
                        if (Array.isArray(coords)) return coords;

                        // Priority 3: MUJ/Jaipur Contextual Fallback for Plot 1
                        if (p.name.toUpperCase().includes('MUJ') || p.name.includes('Plot 1')) {
                            return [75.565, 26.843]; // Manipal Jaipur Lng, Lat
                        }

                        return [85.3096, 23.3441]; // Ranchi Fallback
                    };

                    let refPos = [85.3096, 23.3441];
                    
                    if (referencePlotId === null && plots.length > 0) {
                        const distancesToPlots = plots.map(p => {
                            const pPos = extractCoords(p);
                            return Math.sqrt(Math.pow(lat - pPos[1], 2) + Math.pow(lng - pPos[0], 2));
                        });
                        const minDistIdx = distancesToPlots.indexOf(Math.min(...distancesToPlots));
                        refPos = extractCoords(plots[minDistIdx]);
                    } else if (referencePlotId !== null) {
                        const targetPlot = plots.find(p => p.id === referencePlotId);
                        if (targetPlot) refPos = extractCoords(targetPlot);
                    }
                    
                    const d = Math.sqrt(Math.pow(lat - refPos[1], 2) + Math.pow(lng - refPos[0], 2)) * 111;
                    return d.toFixed(1);
                };

                const filteredMandis = mandis
                    .map(m => ({
                        ...m,
                        distance: parseFloat(getDistance(m.lat, m.lng)),
                        price: m.prices[selectedCrop as keyof typeof m.prices]
                    }))
                    .filter(m => m.name.toLowerCase().includes(marketQuery.toLowerCase()))
                    .sort((a, b) => {
                        // Heuristic: If it's a vegetable (Tomato/Potato), distance is 3x more important than price 
                        // because they spoil fast.
                        const isVeg = ['Tomato', 'Potato'].includes(selectedCrop);
                        const distThreshold = isVeg ? 10 : 30;
                        
                        const distDiff = Math.abs(a.distance - b.distance);
                        if (distDiff > distThreshold) return a.distance - b.distance;
                        return b.price - a.price;
                    });

                // Auto-Crop Detection Logic
                const handleSearch = (query: string) => {
                    setMarketQuery(query);
                    const matchingCrop = crops.find(c => query.toLowerCase().includes(c.toLowerCase()));
                    if (matchingCrop) {
                        setSelectedCrop(matchingCrop);
                        // If user types exact crop name, clear query to show all mandis for that crop
                        if (query.toLowerCase().trim() === matchingCrop.toLowerCase()) {
                            setMarketQuery('');
                        }
                    }
                };

                const bestMandi = filteredMandis.length > 0 ? filteredMandis[0] : null;

                // Simple path variance based on crop for visual interest
                const getChartPath = () => {
                    const paths: Record<string, string> = {
                        'Wheat': "M0,35 Q10,32 20,38 T40,25 T60,28 T80,15 T100,5",
                        'Rice': "M0,38 Q15,35 30,30 T50,32 T70,20 T90,25 T100,22",
                        'Tomato': "M0,30 Q20,10 40,35 T60,25 T80,38 T100,10",
                    };
                    return paths[selectedCrop] || "M0,30 Q25,35 50,20 T75,25 T100,15";
                };

                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[60vh] pb-32">
                        {/* Header & Search */}
                        <div className="mb-12">
                            <h1 className="text-3xl font-black text-white tracking-tight italic mb-6">
                                Market <span className="text-highlight-yellow opacity-80">Intelligence</span>
                            </h1>
                            
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/30 group-focus-within:text-highlight-yellow transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Search crop or mandi (example: Wheat, Ranchi Mandi)"
                                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-highlight-yellow transition-all"
                                    value={marketQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Reference Plot Selector */}
                        <div className="mb-8 flex flex-col gap-4">
                            <h3 className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em]">Reference Plot (Selling From)</h3>
                            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                                <button 
                                    onClick={() => setReferencePlotId(null)}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                        referencePlotId === null 
                                            ? 'bg-blue-500 text-white border-blue-400 shadow-[0_5px_15px_rgba(59,130,246,0.3)]' 
                                            : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    Auto-Detect [Nearest]
                                </button>
                                {plots.map(plot => (
                                    <button 
                                        key={plot.id}
                                        onClick={() => setReferencePlotId(plot.id)}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                            referencePlotId === plot.id 
                                                ? 'bg-soft-green text-deep-green border-soft-green' 
                                                : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'
                                        }`}
                                    >
                                        Plot: {plot.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Crop Quick Filters */}
                        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
                            {crops.map(crop => (
                                <button 
                                    key={crop}
                                    onClick={() => setSelectedCrop(crop)}
                                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                        selectedCrop === crop 
                                            ? 'bg-highlight-yellow text-deep-green border-highlight-yellow' 
                                            : 'bg-white/10 text-white/50 border-white/10 hover:bg-white/20'
                                    }`}
                                >
                                    {crop}
                                </button>
                            ))}
                        </div>

                        {/* Best Recommendation & Forecast */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                            <div className="lg:col-span-4">
                                {bestMandi ? (
                                    <GlassCard className="h-full border border-highlight-yellow/40 bg-black/40 p-8 flex flex-col justify-between backdrop-blur-xl">
                                        <div>
                                            <p className="text-highlight-yellow text-[9px] font-black uppercase tracking-[0.3em] mb-4">Best Market Today</p>
                                            <h2 className="text-2xl font-black text-white mb-1">{bestMandi.name}</h2>
                                            <div className="flex items-center gap-2 mb-6">
                                                <span className="text-highlight-yellow text-xl font-black tracking-tighter">₹{bestMandi.price}</span>
                                                <span className="text-white/60 text-[9px] font-bold">/ quintal</span>
                                            </div>
                                        </div>
                                        <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Distance: {bestMandi.distance} km</span>
                                            <button className="text-[9px] font-black uppercase text-highlight-yellow border border-highlight-yellow/20 px-3 py-1.5 rounded-lg">GPS Protocol →</button>
                                        </div>
                                    </GlassCard>
                                ) : (
                                    <GlassCard className="h-full p-8 border border-white/10 bg-black/40 flex items-center justify-center text-white/20 text-[10px] font-black uppercase">No Mandi Found</GlassCard>
                                )}
                            </div>
                            
                            <div className="lg:col-span-8">
                                <GlassCard className="h-full p-8 border border-white/10 bg-black/40 backdrop-blur-xl">
                                    <div className="flex justify-between items-start mb-6">
                                        <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">Market Forecast</p>
                                        <span className="px-3 py-1 bg-soft-green text-deep-green text-[8px] font-black uppercase tracking-widest rounded-full">Bullish Trend</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white italic leading-relaxed mb-6">
                                        "{selectedCrop} prices are projected to <span className="text-highlight-yellow">rise by 4-6%</span> in the next 10 days due to localized supply constraints."
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                                        <div>
                                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Risk Quotient</p>
                                            <p className="text-xs font-bold text-white/80">Low (Stable Demand)</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Target Price</p>
                                            <p className="text-xs font-bold text-highlight-yellow">₹{bestMandi ? (bestMandi.price * 1.05).toFixed(0) : '---'}</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        </div>

                        {/* Nearby Mandi Prices */}
                        <div className="mt-12">
                            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-6 px-2">Nearby Mandi Prices</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredMandis.length > 0 ? filteredMandis.map((m, idx) => (
                                    <GlassCard key={idx} className={`p-6 flex justify-between items-center transition-all border backdrop-blur-xl ${
                                        idx === 0 ? 'border-highlight-yellow/40 bg-black/60 scale-[1.02]' : 'border-white/10 bg-black/40 hover:bg-black/60'
                                    }`}>
                                        <div className="flex items-center gap-6">
                                            <div className="w-1.5 h-1.5 rounded-full bg-highlight-yellow" />
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-white font-black text-sm">{m.name}</h4>
                                                    {idx === 0 && <span className="bg-highlight-yellow text-[8px] px-2 py-0.5 rounded font-black text-deep-green uppercase tracking-tighter shadow-lg">Best Price</span>}
                                                </div>
                                                <p className="text-white/50 text-[9px] uppercase tracking-widest mt-1">Dist: {m.distance} km</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-white tracking-tighter">₹{m.price}</p>
                                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">/ quintal</p>
                                        </div>
                                    </GlassCard>
                                )) : <div className="col-span-2 py-20 text-center text-white/20 font-black uppercase text-xs tracking-widest">No matching results for your query.</div>}
                            </div>
                        </div>

                        {/* Price Trend Chart (Visual Simulation) */}
                        <div className="mt-12">
                            <GlassCard className="p-8 border border-white/10 bg-black/60 backdrop-blur-2xl">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] font-sans italic">{selectedCrop} Price Protocol Trend</h3>
                                    <div className="flex bg-white/5 p-1 rounded-xl">
                                        {['7 Days', '30 Days', '90 Days'].map(r => (
                                            <button 
                                                key={r}
                                                onClick={() => setChartRange(r)}
                                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                                    chartRange === r ? 'bg-highlight-yellow text-deep-green' : 'text-white/30 hover:text-white/60'
                                                }`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-48 w-full relative flex items-end gap-1 px-2">
                                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                                        <path 
                                            d={getChartPath()} 
                                            fill="none" 
                                            stroke="#facc15" 
                                            strokeWidth="3" 
                                            className="drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] transition-all duration-1000"
                                        />
                                        <path 
                                            d={`${getChartPath()} V40 H0 Z`} 
                                            fill="url(#trendGradient)" 
                                            className="opacity-30 transition-all duration-1000"
                                        />
                                        <defs>
                                            <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#facc15" />
                                                <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <div className="flex justify-between mt-6 px-2 text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">
                                    <span>Temporal Commencement</span>
                                    <span>Current Market Phase</span>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Historical Data Table */}
                        <div className="mt-12 overflow-hidden rounded-[2rem] border border-white/20 bg-black/80 mb-20 shadow-2xl backdrop-blur-3xl">
                            <div className="p-8 border-b border-white/10 bg-white/5 flex justify-between items-center text-white">
                                <h3 className="text-[13px] font-black text-white uppercase tracking-[0.4em]">Historical Mandi Protocol</h3>
                                <span className="text-[10px] font-black text-highlight-yellow uppercase tracking-widest">Active Data Stream</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10 text-[10px] font-black text-white uppercase tracking-[0.2em] bg-white/5">
                                            <th className="px-8 py-6">Temporal Index</th>
                                            <th className="px-8 py-6">Mandi Identifier</th>
                                            <th className="px-8 py-6">Settled Price</th>
                                            <th className="px-8 py-6 text-right">Delta</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[12px] font-bold text-white">
                                        {[
                                            { date: '11 Mar 2026', mandi: 'Ranchi Mandi', price: '2,115', delta: '+0.24%', trend: 'up' },
                                            { date: '10 Mar 2026', mandi: 'Ranchi Mandi', price: '2,110', delta: '-0.12%', trend: 'down' },
                                            { date: '09 Mar 2026', mandi: 'Hazaribagh Mandi', price: '2,140', delta: '+1.15%', trend: 'up' },
                                            { date: '08 Mar 2026', mandi: 'Khunti Mandi', price: '2,075', delta: '+0.05%', trend: 'up' },
                                        ].map((row, i) => (
                                            <tr key={i} className="border-b border-white/10 last:border-0 hover:bg-white/10 transition-all group cursor-default">
                                                <td className="px-8 py-6 font-black tracking-tighter text-white/50 group-hover:text-white transition-colors uppercase text-[11px]">{row.date}</td>
                                                <td className="px-8 py-6 font-black tracking-tight text-white">{row.mandi}</td>
                                                <td className="px-8 py-6 font-black text-highlight-yellow text-lg tracking-tighter">₹{row.price}</td>
                                                <td className={`px-8 py-6 text-right font-black tracking-tight ${row.trend === 'up' ? 'text-primary-green' : 'text-red-400 opacity-90'}`}>
                                                    {row.delta}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 bg-black/20 text-center">
                                <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">Global Agricultural Intelligence Network (GAIN)</p>
                            </div>
                        </div>

                        {/* Attribution / Data Source */}
                        <div className="text-center pb-20">
                            <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.3em] flex items-center justify-center gap-4">
                                <span className="w-8 h-[1px] bg-white/5" />
                                Data sourced from Agmarknet & Data.gov.in Protocol
                                <span className="w-8 h-[1px] bg-white/5" />
                            </p>
                        </div>
                    </div>
                );
            case 'advisory':
                const advisoryPlots = plots.length > 0 ? plots : [
                    { id: 99, name: 'Sample Plot A', crop_name: 'Wheat', soil_ph: 6.5, planting_date: '2026-01-10' }
                ];

                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[60vh] pb-32">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight italic">
                                    Technical <span className="text-soft-green opacity-80">Advisory</span>
                                </h1>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Smart Farming Decision Support</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-soft-green animate-pulse" />
                                    <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">IA Intelligence Active</span>
                                </div>
                            </div>
                        </div>

                        {/* ⚠️ Emergency Regional Alerts */}
                        <div className="space-y-4 mb-12">
                            <GlassCard className="border-l-4 border-red-500 bg-red-500/10 p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-red-500 text-[8px] px-2 py-0.5 rounded font-black text-white uppercase tracking-widest">High Risk</span>
                                            <h3 className="text-white font-black text-xs uppercase tracking-widest">Emergency Pest Alert</h3>
                                        </div>
                                        <p className="text-white/60 text-[11px] leading-relaxed max-w-xl">Locust activity reported in nearby district. Monitor all plots carefully and prepare Neem Protocol buffers.</p>
                                    </div>
                                </div>
                                <button className="px-6 py-2.5 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-white/90 transition-all shadow-xl">View Control Map</button>
                            </GlassCard>

                            <GlassCard className="border-l-4 border-highlight-yellow bg-highlight-yellow/10 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-highlight-yellow text-deep-green flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4.34 21 10 3h4l5.66 18"/><path d="m6.21 15 11.58 0"/></svg>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-highlight-yellow text-blue-900 text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest font-sans">Weather Protocol</span>
                                            <h3 className="text-white font-black text-xs uppercase tracking-widest">Weather Alert: Rain Predicted</h3>
                                        </div>
                                        <p className="text-white/60 text-[11px] leading-relaxed italic"><span className="text-highlight-yellow font-bold">Rain expected in 48 hours.</span> Recommended Action: <span className="text-white font-bold underline decoration-highlight-yellow/50">Delay irrigation today</span> to prevent root water-logging.</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Cloud Cover</p>
                                    <p className="text-lg font-black text-highlight-yellow">82%</p>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Area-Focused Advisory */}
                        <div className="space-y-16">
                            {advisoryPlots.map((plot, pIdx) => (
                                <div key={pIdx} className="bg-black/10 rounded-[2.5rem] p-8 border border-white/5">
                                    <div className="flex items-center justify-between mb-8 px-4">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-3xl bg-soft-green/20 flex items-center justify-center text-soft-green shadow-inner">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 5.5-2 4-5 11.5-8 12.5z"/><path d="M9 3.5c0 2.5 7 6.5 7 6.5s-4.5 3.5-7 3.5"/></svg>
                                            </div>
                                            <div>
                                                <h2 className="text-white font-black text-2xl tracking-tight uppercase italic">{plot.name}</h2>
                                                <p className="text-soft-green text-[10px] font-black uppercase tracking-[0.4em]">{plot.crop_name || 'Wheat'} Protocol active</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-6">
                                            <div>
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Soil Moisture</p>
                                                <p className="text-xl font-black text-white">32%</p>
                                            </div>
                                            <div className="w-[1px] h-10 bg-white/10" />
                                            <div>
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Soil health</p>
                                                <p className="text-xl font-black text-highlight-yellow italic">Optimal</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Crop Lifecycle Timeline */}
                                    <div className="mb-12 px-4">
                                        <div className="flex justify-between items-end mb-6">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Crop Life-Cycle Timeline</span>
                                            <div className="bg-soft-green/20 px-3 py-1 rounded-lg border border-soft-green/30">
                                                <span className="text-[11px] font-black text-soft-green uppercase tracking-widest">Current: Vegetative (Day 32)</span>
                                            </div>
                                        </div>
                                        <div className="relative pt-4 pb-8">
                                            <div className="absolute top-7 left-0 right-0 h-[2px] bg-white/5" />
                                            <div className="flex justify-between relative z-10">
                                                {['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Harvest'].map((stage, idx) => {
                                                    const isActive = stage === 'Vegetative';
                                                    const isPast = idx < 2;
                                                    return (
                                                        <div key={stage} className="flex flex-col items-center gap-3">
                                                            <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${
                                                                isActive ? 'border-soft-green bg-white shadow-[0_0_15px_rgba(74,222,128,0.8)] scale-125' : 
                                                                isPast ? 'border-soft-green/40 bg-soft-green/40' : 'border-white/10 bg-black'
                                                            }`}>
                                                                {isPast && !isActive && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                                                            </div>
                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-white/20'}`}>{stage}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* 1. Plot-Wise Task List */}
                                        <GlassCard className="bg-black/60 border border-white/10 p-8 backdrop-blur-3xl relative overflow-hidden group">
                                            <div className="flex justify-between items-center mb-8 relative">
                                                <h3 className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">Daily Action List</h3>
                                                <div className="w-8 h-8 rounded-full bg-soft-green/20 flex items-center justify-center text-soft-green">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                {[
                                                    { t: "Water this plot before 6 PM", s: "Next rain in 2 days" },
                                                    { t: "Check for aphids under leaves", s: "Regional alert active" },
                                                    { t: "Apply Nitrogen boost", s: "Vegetative stage requirement" }
                                                ].map((task, idx) => (
                                                    <div key={idx} className="flex gap-4 group/item cursor-pointer">
                                                        <div className="w-5 h-5 rounded-md border border-white/10 flex-shrink-0 flex items-center justify-center group-hover/item:border-soft-green transition-all">
                                                            <div className="w-2 h-2 rounded-full bg-white/5 group-hover/item:bg-soft-green shadow-[0_0_8px_rgba(74,222,128,0.3)]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-white text-xs font-bold leading-tight group-hover/item:text-soft-green transition-colors">{task.t}</p>
                                                            <p className="text-white/20 text-[8px] uppercase tracking-widest mt-1">{task.s}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </GlassCard>

                                        {/* 2. Simplified Action: Feeding/Soil */}
                                        <GlassCard className="bg-black/60 border border-white/10 p-8 flex flex-col justify-between group backdrop-blur-3xl">
                                            <div>
                                                <div className="flex justify-between items-start mb-8">
                                                    <h3 className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">Soil Feeding (Simplified)</h3>
                                                    <div className="w-8 h-8 rounded-full bg-highlight-yellow/10 flex items-center justify-center text-highlight-yellow">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v8"/><path d="M14 2v8"/><path d="M8 8v1a4 4 0 0 0 8 0v-1"/><path d="M16 2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M2 22h20"/><path d="M12 22V12"/></svg>
                                                    </div>
                                                </div>
                                                <p className="text-white/80 text-[15px] font-medium leading-relaxed mb-6 italic">
                                                    "Soil is slightly acidic. Add <span className="text-highlight-yellow font-black">2 bags of lime</span> per acre this weekend to normalize."
                                                </p>
                                            </div>
                                            <div className="pt-6 mt-6 border-t border-white/10 flex justify-between items-center group/voice cursor-pointer">
                                                <div className="w-8 h-8 rounded-full bg-highlight-yellow/10 flex items-center justify-center text-highlight-yellow group-hover/voice:bg-highlight-yellow group-hover/voice:text-deep-green transition-all shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                                                </div>
                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] group-hover/voice:text-highlight-yellow transition-colors italic">Listen to Protocol</span>
                                            </div>
                                        </GlassCard>

                                        {/* Practical Disease Detection (Photo Ready) */}
                                        <GlassCard className="bg-primary-green/10 border border-soft-green/30 p-8 flex flex-col justify-between relative group shadow-[0_15px_40px_rgba(74,222,128,0.1)]">
                                            <div className="absolute top-0 right-0 p-4">
                                                <div className="w-2 h-2 rounded-full bg-soft-green shadow-[0_0_10px_rgba(74,222,128,1)]" />
                                            </div>
                                            <div>
                                                <h3 className="text-soft-green text-[10px] font-black uppercase tracking-[0.4em] mb-6">Disease Detection (Vision)</h3>
                                                <div className="aspect-square w-full rounded-2xl bg-black/40 border-2 border-dashed border-soft-green/30 mb-6 flex flex-col items-center justify-center p-8 group-hover:bg-black/60 transition-all">
                                                    <div className="w-16 h-16 rounded-full bg-soft-green/10 flex items-center justify-center text-soft-green mb-4 group-hover:scale-110 transition-transform">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                                    </div>
                                                    <p className="text-[11px] font-black text-white text-center uppercase tracking-widest leading-relaxed">Click Photo or Upload Leaf Image</p>
                                                    <p className="text-[9px] font-bold text-soft-green/50 text-center mt-2">IA Diagnosis Protocol</p>
                                                </div>
                                            </div>
                                            <button className="w-full py-4 bg-soft-green text-deep-green text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.2rem] hover:bg-white transition-all shadow-xl active:scale-95">Open Live Scanner</button>
                                        </GlassCard>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Seasonal Universal Footer */}
                        <div className="mt-24 pt-16 border-t border-white/10 text-center max-w-4xl mx-auto">
                            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.6em] mb-12 opacity-30">Global Seasonal Strategy</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { t: "Best Sowing Window", v: "Starts in 18 Days", i: "🗓️" },
                                    { t: "Expected Harvest Price", v: "Bullish (+12%)", i: "📈" },
                                    { t: "Regional Water Level", v: "Stable (Jharkhand North)", i: "🛰️" }
                                ].map((stat, i) => (
                                    <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
                                        <div className="text-3xl mb-4">{stat.i}</div>
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{stat.t}</p>
                                        <p className="text-sm font-black text-white tracking-tight italic">{stat.v}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-center py-24">
                            <div className="bg-black/40 inline-flex items-center gap-4 px-6 py-2 rounded-full border border-white/5">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Protocol Node 842-AX</span>
                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-[8px] font-black text-soft-green/40 uppercase tracking-[0.4em]">Verified by BAU (Birsa Agricultural University)</span>
                            </div>
                        </div>
                    </div>
                );
            case 'services':
                const handleCheckEligibility = () => {
                    // Simulated logic based on "farmer" object context
                    const results = ["PM-Kisan Samman Nidhi", "Jharkhand Seed Subsidy (80%)"];
                    if (farmer.land_size > 2) results.push("Fasal Bima (Crop Insurance)");
                    setEligibleResult(results);
                    setEligibilityStep(2); // Jump to results
                };

                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[60vh] pb-32">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight italic">
                                    Official <span className="text-blue-400 opacity-80">Seva Hub</span>
                                </h1>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Government Portals & Digital Grants</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="px-3 py-1.5 bg-blue-500/10 backdrop-blur-md rounded-full border border-blue-500/20 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest tracking-widest">Connected to CSC Cloud</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* 🎯 Section 1: Scheme Eligibility Engine */}
                            <div className="lg:col-span-12">
                                <GlassCard className="bg-blue-600/10 border border-blue-500/30 p-1 rounded-[2.5rem] overflow-hidden">
                                    <div className="bg-black/40 backdrop-blur-3xl rounded-[2.4rem] p-10 flex flex-col md:flex-row gap-12 items-center">
                                        <div className="md:w-1/3">
                                            <div className="w-16 h-16 rounded-3xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6 font-serif italic text-3xl font-black shadow-inner">e</div>
                                            <h2 className="text-white font-black text-2xl tracking-tighter uppercase italic leading-tight mb-4">Grant Eligibility <br/><span className="text-blue-400">Engine V.2</span></h2>
                                            <p className="text-white/40 text-xs leading-relaxed italic">Input land and category data to automatically scan 42+ Jharkhand agricultural schemes.</p>
                                        </div>
                                        
                                        <div className="flex-1 w-full bg-white/[0.03] rounded-[2rem] border border-white/5 p-8">
                                            {eligibilityStep === 0 ? (
                                                <div className="flex flex-col items-center justify-center text-center py-6">
                                                    <div className="text-4xl mb-6">🔍</div>
                                                    <h3 className="text-white font-bold mb-2">Ready to scan?</h3>
                                                    <p className="text-white/30 text-[10px] uppercase tracking-widest mb-8 text-center max-w-[200px]">We use your profile data to find matches</p>
                                                    <button 
                                                        onClick={() => setEligibilityStep(1)}
                                                        className="px-8 py-3 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-400 transition-all shadow-[0_10px_30px_rgba(59,130,246,0.3)]"
                                                    >
                                                        Start Eligibility Scan
                                                    </button>
                                                </div>
                                            ) : eligibilityStep === 1 ? (
                                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Land size (Acres)</p>
                                                            <input type="text" defaultValue={farmer.land_size} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Farmer Category</p>
                                                            <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold">
                                                                <option>Small/Marginal</option>
                                                                <option>SC/ST</option>
                                                                <option>General</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={handleCheckEligibility}
                                                        className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all"
                                                    >
                                                        Calculate Matches
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="animate-in zoom-in-95 duration-500">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Matches Found: {eligibleResult.length}</h4>
                                                        <button onClick={() => setEligibilityStep(0)} className="text-white/20 text-[8px] uppercase font-black hover:text-white transition-colors">Reset Query</button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {eligibleResult.map((res, i) => (
                                                            <div key={i} className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-between group">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                                                                    <span className="text-white text-[11px] font-bold italic">{res}</span>
                                                                </div>
                                                                <span className="text-[8px] font-black text-blue-400 opacity-0 group-hover:opacity-100 transition-all">Quick Apply →</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>

                            {/* 💳 Section 2: Active Grant Hub */}
                            <div className="lg:col-span-8 space-y-6">
                                <div className="flex justify-between items-center px-4">
                                    <h3 className="text-white font-black text-xs uppercase tracking-[0.4em]">Active Applications</h3>
                                    <span className="text-white/20 text-[9px] font-bold uppercase tracking-widest">Jharkhand Regional Portal</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { t: "PM-Kisan Phase XVI", v: "Disbursement Active", s: "In Processing", c: "blue" },
                                        { t: "CM Pashudhan Vikas", v: "Jharkhand Scheme", s: "Open for Application", c: "soft-green" },
                                        { t: "Kisan Credit Card", v: "Institutional Credit", s: "Verify KYC", c: "highlight-yellow" },
                                        { t: "Organic Cluster Grant", v: "Paramparagat Krishi", s: "Apply by April 30", c: "white" }
                                    ].map((grant, idx) => (
                                        <GlassCard key={idx} className="bg-black/60 border border-white/5 p-8 group hover:border-white/20 transition-all cursor-pointer relative overflow-hidden">
                                            <div className={`absolute top-0 right-0 w-24 h-24 bg-${grant.c}-500/5 blur-3xl`} />
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest bg-${grant.c}-500/10 text-${grant.c}-500 border border-${grant.c}-500/20`}>{grant.v}</div>
                                                <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:text-white transition-colors italic font-serif">i</div>
                                            </div>
                                            <h4 className="text-white font-black text-sm tracking-tight mb-2 uppercase italic">{grant.t}</h4>
                                            <div className="flex items-center justify-between mt-6">
                                                <span className="text-white/30 text-[9px] font-bold uppercase tracking-widest">{grant.s}</span>
                                                <button className="text-[8px] font-black text-white/20 group-hover:text-blue-400 uppercase tracking-widest transition-colors">Apply Portal →</button>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                            </div>

                            {/* 📖 Section 3: Institutional Directory */}
                            <div className="lg:col-span-4 flex flex-col h-full">
                                <div className="mb-6 px-4">
                                    <h3 className="text-white font-black text-xs uppercase tracking-[0.4em]">Support Directory</h3>
                                    <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mt-1">Local Institutional Nodes</p>
                                </div>
                                <div className="flex-1 bg-black/40 rounded-[2rem] border border-white/5 p-6 flex flex-col gap-4">
                                    <div className="relative mb-2">
                                        <input type="text" placeholder="Search District (e.g. Ranchi)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black text-white placeholder:text-white/20 focus:border-blue-500/50 outline-none transition-all" />
                                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                    </div>
                                    <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                                        {[
                                            { t: "KVK Ranchi", d: "Krishi Vigyan Kendra", l: "Getlatu", p: "0651-227315" },
                                            { t: "Ratu Cold Storage", d: "Vegetable Storage", l: "Ratu Road", p: "0651-552312" },
                                            { t: "BAU Research Hub", d: "Soil Testing Center", l: "Kanke", p: "0651-245123" },
                                            { t: "District Agri Office", d: "Official Paperwork", l: "Main Road", p: "0651-443211" }
                                        ].map((inst, i) => (
                                            <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all group">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h5 className="text-white font-bold text-[11px] italic">{inst.t}</h5>
                                                    <span className="text-[8px] font-black text-soft-green uppercase tracking-widest border border-soft-green/30 px-1.5 py-0.5 rounded">Active</span>
                                                </div>
                                                <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-3">{inst.d} • {inst.l}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/50 text-[10px] font-mono group-hover:text-blue-400 transition-colors">{inst.p}</span>
                                                    <div className="flex gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                                        </div>
                                                        <div className="w-6 h-6 rounded-lg bg-soft-green/10 flex items-center justify-center text-soft-green">
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seasonal Seva Footer */}
                        <div className="mt-20 pt-12 border-t border-white/5 text-center">
                            <div className="inline-flex items-center gap-6 px-8 py-3 bg-white/5 rounded-full border border-white/5">
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">Digital Seva Protocol ID: JKH-842-CSC</span>
                                <div className="w-[1px] h-4 bg-white/10" />
                                <span className="text-[9px] font-black text-blue-400/40 uppercase tracking-[0.5em]">Verified Official Channel</span>
                            </div>
                        </div>
                    </div>
                );
            case 'profile':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[60vh] pb-32">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight italic">
                                    Account <span className="text-white/20">Protocol</span>
                                </h1>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Farmer Identity Management</p>
                            </div>
                        </div>

                        <GlassCard className="max-w-md mx-auto p-12 text-center border border-white/5 bg-white/[0.02]">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-green to-deep-green mx-auto mb-8 flex items-center justify-center text-3xl font-black text-white shadow-2xl border border-white/10">
                                {farmer.name[0]}
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1 tracking-tight">{farmer.name}</h2>
                            <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.3em] mb-10">{farmer.phone}</p>
                            
                            <div className="space-y-3">
                                <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white font-black uppercase text-[9px] tracking-[0.2em] border border-white/5 transition-all">Identity Settings</button>
                                <button onClick={() => { localStorage.removeItem('farmer'); router.push('/login'); }} className="w-full py-3 bg-red-500/5 hover:bg-red-500/10 rounded-xl text-red-500/70 hover:text-red-500 font-black uppercase text-[9px] tracking-[0.2em] border border-red-500/10 transition-all">Terminate Session</button>
                            </div>
                        </GlassCard>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col pt-28 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
            <div className="fixed inset-0 z-[-1]">
                <Image src="/images/hero-bg.png" alt="Farm Background" fill className="object-cover scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-green via-deep-green/80 to-deep-green/60 backdrop-blur-md" />
            </div>

            <div className="max-w-7xl mx-auto w-full">
                {renderTabContent()}

                {/* Map Mapping Overlay Modal */}
                {isMapping && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 lg:p-12">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMapping(false)} />
                        <div className="relative w-full max-w-5xl h-[85vh] animate-in fade-in zoom-in-95 duration-500 rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
                            <MapPlotter onPlotSaved={handlePlotSaved} onCancel={() => setIsMapping(false)} />
                        </div>
                    </div>
                )}
                {selectedPlot && <PlotDetailModal plot={selectedPlot} onClose={() => setSelectedPlot(null)} />}
            </div>

            <KisanBuddy activeTab={activeTab} farmerName={farmer.name} />
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            
            {/* Command Intelligence Sidebar */}
            <CommandSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        </div>
    );
}
