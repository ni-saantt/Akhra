'use client';

import React from 'react';
import GlassCard from './GlassCard';

interface Alert {
    type: 'warning' | 'emergency';
    title: string;
    msg: string;
}

interface Deal {
    title: string;
    discount: string;
    store: string;
}

interface CommandSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function CommandSidebar({ isOpen, onToggle }: CommandSidebarProps) {
    const alerts: Alert[] = [
        { type: 'emergency', title: 'Locust Warning', msg: 'Swarms detected in Hazaribagh. Check wheat plots.' },
        { type: 'warning', title: 'Heatwave Alert', msg: 'Temps rising to 42°C. Increase mulching.' }
    ];

    const deals: Deal[] = [
        { title: 'Drip Irrigation Kit', discount: '20% OFF', store: 'Ranchi Agri-Center' },
        { title: 'Organic Fertilizer', discount: 'Buy 5 Get 1', store: 'Village Sewa Kendra' }
    ];

    return (
        <div 
            className={`fixed top-0 right-0 h-screen transition-all duration-700 z-[100] ${
                isOpen ? 'w-[320px]' : 'w-0'
            }`}
        >
            <div className={`h-full w-[320px] bg-black/60 backdrop-blur-3xl border-l border-white/10 p-8 pt-24 overflow-y-auto custom-scrollbar relative ${
                !isOpen && 'opacity-0 pointer-events-none'
            }`}>
                {/* Close Button Inside */}
                <button 
                    onClick={onToggle}
                    className="absolute top-8 left-8 text-white/30 hover:text-white transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>

                <div className="mb-12">
                    <h2 className="text-white font-black text-xl tracking-tight uppercase italic mb-1">Command <span className="text-blue-400">Center</span></h2>
                    <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.4em]">Live Regional Intelligence</p>
                </div>

                {/* Live Alerts */}
                <div className="space-y-6 mb-12">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Priority Alerts</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    </div>
                    {alerts.map((alert, i) => (
                        <div key={i} className={`p-4 rounded-2xl border ${
                            alert.type === 'emergency' ? 'bg-red-500/10 border-red-500/20' : 'bg-highlight-yellow/10 border-highlight-yellow/20'
                        }`}>
                            <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                                alert.type === 'emergency' ? 'text-red-500' : 'text-highlight-yellow'
                            }`}>{alert.title}</h4>
                            <p className="text-white/60 text-[11px] font-medium leading-relaxed italic">{alert.msg}</p>
                        </div>
                    ))}
                </div>

                {/* Market Flash Deals */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Flash Deals</span>
                        <span className="text-[8px] font-black text-soft-green uppercase tracking-tighter">Live Now</span>
                    </div>
                    {deals.map((deal, i) => (
                        <div key={i} className="group cursor-pointer">
                            <GlassCard className="bg-white/5 border border-white/5 p-5 hover:bg-white/10 hover:border-white/10 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-white font-bold text-xs leading-tight pr-4">{deal.title}</h4>
                                    <span className="text-highlight-yellow text-[10px] font-black italic whitespace-nowrap">{deal.discount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white/30 text-[9px] font-black uppercase tracking-widest">{deal.store}</span>
                                    <svg className="text-white/20 group-hover:text-highlight-yellow transition-colors" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </div>
                            </GlassCard>
                        </div>
                    ))}
                </div>

                {/* Footer Sync */}
                <div className="mt-20 pt-12 border-t border-white/5 text-center">
                    <p className="text-[7px] font-black text-white/10 uppercase tracking-[0.5em]">Command Sync: 100% Active</p>
                </div>
            </div>
            
            {/* External Toggle (Visible when closed) */}
            {!isOpen && (
                <button 
                    onClick={onToggle}
                    className="fixed top-24 right-0 bg-white/10 backdrop-blur-xl border border-white/20 border-r-0 rounded-l-2xl p-4 flex flex-col items-center gap-4 hover:bg-white/20 transition-all z-[101]"
                >
                    <div className="relative">
                        <svg className="text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-black" />
                    </div>
                </button>
            )}
        </div>
    );
}
