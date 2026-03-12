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
                ];

                // Simple search and filter state uses top-level hooks defined in Dashboard component

                // Mock distance calculation based on first plot if exists (safely accessed)
                const firstPlotCoords = plots[0]?.geo_data?.features?.[0]?.geometry?.coordinates?.[0]?.[0];
                const userPos = firstPlotCoords || [85.3096, 23.3441];
                const getDistance = (lat: number, lng: number) => {
                    const d = Math.sqrt(Math.pow(lat - userPos[1], 2) + Math.pow(lng - userPos[0], 2)) * 111;
                    return d.toFixed(1);
                };

                const filteredMandis = mandis
                    .map(m => ({
                        ...m,
                        distance: parseFloat(getDistance(m.lat, m.lng)),
                        price: m.prices[selectedCrop as keyof typeof m.prices]
                    }))
                    .filter(m => m.name.toLowerCase().includes(marketQuery.toLowerCase()))
                    .sort((a, b) => b.price - a.price);

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
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[60vh] pb-32">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight italic">
                                    Technical <span className="text-soft-green opacity-80">Advisory</span>
                                </h1>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Expert Support Systems</p>
                            </div>
                            <div className="px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Protocol Active</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { title: 'NPK Calculator', desc: 'Precise fertilizer optimization for specific plot yields.', theme: 'primary-green', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v8"/><path d="M14 2v8"/><path d="M8 8v1a4 4 0 0 0 8 0v-1"/><path d="M16 2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M2 22h20"/><path d="M12 22V12"/></svg> },
                                { title: 'Pest Diagnostic', desc: 'Computer vision analysis for immediate disease detection.', theme: 'red-500', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M2 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="M12 22v-2"/><path d="m19.07 19.07-1.41-1.41"/><path d="M22 12h-2"/><path d="m17.66 6.34 1.41-1.41"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg> },
                                { title: 'Sowing Protocol', desc: 'Season-locked planting schedules for maximum efficiency.', theme: 'blue-400', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg> }
                            ].map((tool, idx) => (
                                <GlassCard key={idx} className="p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group relative overflow-hidden">
                                    <div className={`w-10 h-10 rounded-xl mb-6 flex items-center justify-center text-white/40 group-hover:text-white transition-colors duration-300`}>
                                        {tool.icon}
                                    </div>
                                    <h3 className="text-sm font-black text-white mb-2 uppercase tracking-widest">{tool.title}</h3>
                                    <p className="text-white/40 text-[10px] leading-relaxed mb-8">{tool.desc}</p>
                                    <button className="w-full py-2.5 rounded-lg bg-white/5 text-white/60 font-black uppercase text-[9px] tracking-widest border border-white/5 hover:bg-white/10 hover:text-white transition-all">
                                        Initialize Tool
                                    </button>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                );
            case 'services':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[60vh] pb-32 text-white">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight italic">
                                    Official <span className="text-blue-400 opacity-80">Channels</span>
                                </h1>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Government & Institutional Seva</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <GlassCard className="border-l-2 border-blue-500 bg-blue-500/[0.03] p-8">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 mb-3 block">Priority Alert</span>
                                <h3 className="text-lg font-bold mb-2 tracking-tight">PM Kisan Samman Nidhi — Phase XVI</h3>
                                <p className="text-white/40 text-xs mb-6 max-w-xl leading-relaxed">The federal disbursement for Jharkhand regional farmers is now in processing. Validate your electronic KYC to ensure zero-latency transfer.</p>
                                <button className="text-[9px] font-black uppercase text-blue-400 border border-blue-500/20 px-6 py-2.5 rounded-full hover:bg-blue-500/10 transition-all">Verify Status Protocol</button>
                            </GlassCard>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: 'Soil Health Repository', sub: 'Download official PDF certification.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> },
                                    { title: 'Equipment Logistics', sub: 'Institutional rental marketplace access.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 20v-6a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v6"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg> }
                                ].map((service, idx) => (
                                    <GlassCard key={idx} className="p-6 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
                                        <div className="text-white/30 mb-4 group-hover:text-white transition-colors">
                                            {service.icon}
                                        </div>
                                        <h4 className="font-bold text-xs uppercase tracking-widest mb-1 text-white/90">{service.title}</h4>
                                        <p className="text-white/30 text-[9px] font-medium tracking-wide uppercase">{service.sub}</p>
                                    </GlassCard>
                                ))}
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
        </div>
    );
}
