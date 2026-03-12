'use client';

import React from 'react';
import GlassCard from './GlassCard';
import dynamic from 'next/dynamic';

const MiniFarmMap = dynamic(() => import('./MiniFarmMap'), { ssr: false });

interface PlotDetailModalProps {
    plot: any;
    onClose: () => void;
}

export default function PlotDetailModal({ plot, onClose }: PlotDetailModalProps) {
    if (!plot) return null;

    // Calculate growth
    const plantingDate = new Date(plot.planting_date || plot.created_at);
    const today = new Date();
    const daysElapsed = Math.floor((today.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = plot.harvest_duration || 90;
    const growthPercent = Math.min(100, Math.max(0, (daysElapsed / duration) * 100));
    const daysRemaining = Math.max(0, duration - daysElapsed);

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-deep-green/30 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="p-8 md:p-12">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-2 block">PLOT DETAIL ANALYSIS</span>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{plot.name}</h2>
                            <p className="text-soft-green font-bold mt-2 uppercase tracking-widest text-xs">Currently Growing: {plot.crop_name || 'Wheat'}</p>
                        </div>
                        <button onClick={onClose} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all text-2xl font-light">×</button>
                    </div>

                    {/* Growth Section */}
                    <GlassCard className="mb-8 border border-white/5 bg-white/5">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h3 className="text-sm font-black text-white/70 uppercase tracking-widest mb-1">Crop Growth Status</h3>
                                <p className="text-2xl font-black text-white">{growthPercent.toFixed(0)}% Grown</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Harvest in</p>
                                <p className="text-xl font-black text-highlight-yellow">{daysRemaining} Days</p>
                            </div>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-primary-green to-soft-green transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(132,204,22,0.4)]"
                                style={{ width: `${growthPercent}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-4">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Planted: {new Date(plot.planting_date || plot.created_at).toLocaleDateString()}</span>
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Est. Harvest: {new Date(today.getTime() + daysRemaining * 86400000).toLocaleDateString()}</span>
                        </div>
                    </GlassCard>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Left Info */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <GlassCard dark className="text-center p-6 border border-white/5">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Soil Health (PH)</p>
                                    <p className="text-3xl font-black text-highlight-yellow">{plot.soil_ph.toFixed(1)}</p>
                                </GlassCard>
                                <GlassCard dark className="text-center p-6 border border-white/5">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Moisture Level</p>
                                    <p className="text-3xl font-black text-blue-400">{plot.moisture_level || 65}%</p>
                                </GlassCard>
                            </div>

                            <GlassCard className="bg-red-500/10 border-red-500/20">
                                <h3 className="text-xs font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    ⚠️ Active Alerts & Risks
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl">🦟</div>
                                        <div>
                                            <p className="text-[11px] font-black text-white uppercase">{plot.pest_risk || 'Low'} Pest Risk</p>
                                            <p className="text-[10px] text-white/50">Weather conditions favoring aphid growth.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-xl">⛈️</div>
                                        <div>
                                            <p className="text-[11px] font-black text-white uppercase">{plot.weather_alert || 'No Alert'}</p>
                                            <p className="text-[10px] text-white/50">Strong winds expected tonight.</p>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Map View */}
                        <div className="lg:col-span-7 h-[400px] lg:h-auto min-h-[400px]">
                            <GlassCard className="h-full p-2 flex flex-col relative overflow-hidden border border-white/10 group">
                                <div className="absolute top-6 left-6 z-10 px-4 py-2 bg-deep-green/60 backdrop-blur-md rounded-full border border-white/10">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-soft-green animate-pulse" />
                                        Interactive Boundary View
                                    </p>
                                </div>
                                <div className="flex-1 w-full rounded-[1.5rem] overflow-hidden">
                                    <MiniFarmMap plots={[plot]} />
                                </div>
                            </GlassCard>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
