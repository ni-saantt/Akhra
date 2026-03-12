import React from 'react';
import GlassCard from './GlassCard';

export default function WeatherCard() {
    return (
        <GlassCard className="relative overflow-hidden group">
            <h3 className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="text-highlight-yellow text-lg">🌤</span> Weather Conditions
            </h3>
            <div className="flex items-baseline gap-4">
                <span className="text-4xl font-black text-white tracking-tighter">32°C</span>
                <span className="text-3xl font-bold text-white/80 tracking-tighter">10%</span>
                <span className="text-4xl animate-pulse ml-2">⛅</span>
            </div>
            <div className="flex gap-6 mt-4">
                <span className="text-[10px] text-white/60 uppercase tracking-wider font-bold">Chance of Rain</span>
                <span className="text-[10px] text-white/60 uppercase tracking-wider font-bold">Wind 8 km/h</span>
            </div>
        </GlassCard>
    );
}
