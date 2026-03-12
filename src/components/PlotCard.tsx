import React from 'react';
import GlassCard from './GlassCard';

interface PlotCardProps {
    plot: {
        id: number;
        name: string;
        soil_ph: number;
        soil_organic_carbon: number;
        crop_name?: string;
        planting_date?: string;
        harvest_duration?: number;
        moisture_level?: number;
        pest_risk?: string;
        weather_alert?: string;
        created_at?: string;
    };
    onDelete: (id: number) => void;
    onViewMap: (plot: any) => void;
}

export default function PlotCard({ plot, onDelete, onViewMap }: PlotCardProps) {
    const area = (1.5 + (plot.id % 3)).toFixed(1);
    
    // Format date nicely if created_at exists, else fallback
    let dateStr = "Apr 25";
    if (plot.created_at) {
        const d = new Date(plot.created_at);
        dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    return (
        <GlassCard className="flex flex-col justify-between h-full hover:bg-white/10 transition-colors group relative overflow-hidden">
            {/* Alert Badges */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5 z-10">
                {(plot.pest_risk === 'High' || plot.pest_risk === 'Medium') && (
                    <div className={`${plot.pest_risk === 'High' ? 'bg-red-500/90 animate-pulse' : 'bg-orange-500/90'} backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black text-white shadow-lg flex items-center gap-1.5`}>
                        <span className="text-[10px]">⚠️</span> {plot.pest_risk.toUpperCase()} PEST RISK
                    </div>
                )}
                {plot.moisture_level && plot.moisture_level < 50 && (
                    <div className="bg-blue-500/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black text-white shadow-lg flex items-center gap-1.5">
                        <span className="text-[10px]">💧</span> LOW MOISTURE ({plot.moisture_level.toFixed(0)}%)
                    </div>
                )}
                {plot.weather_alert && (
                    <div className="bg-yellow-500/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black text-black shadow-lg flex items-center gap-1.5">
                        <span className="text-[10px]">⛈️</span> {plot.weather_alert.toUpperCase()}
                    </div>
                )}
                {!plot.weather_alert && plot.pest_risk === 'Low' && (!plot.moisture_level || plot.moisture_level >= 50) && (
                    <div className="bg-primary-green/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black text-white shadow-lg flex items-center gap-1.5">
                        <span className="text-[10px]">✅</span> HEALTHY
                    </div>
                )}
            </div>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight group-hover:text-soft-green transition-colors">{plot.name}</h3>
                    <p className="text-[12px] text-white/70 font-medium mt-1">Area: {area} Acres • {plot.crop_name || 'Wheat'}</p>
                </div>
            </div>
            
            <div className="mb-6 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-white/50 uppercase tracking-widest">
                    <span>Soil PH: <span className="text-highlight-yellow">{plot.soil_ph.toFixed(1)}</span></span>
                    <span>Growth: <span className="text-soft-green">75%</span></span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-soft-green w-[75%] shadow-[0_0_10px_rgba(132,204,22,0.5)]" />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={() => onViewMap(plot)}
                    className="flex-1 bg-primary-green hover:bg-deep-green text-white px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                    View Map <span>›</span>
                </button>
                <button 
                    onClick={() => onDelete(plot.id)}
                    className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border border-red-600/30 active:scale-95 flex items-center justify-center gap-2"
                >
                    🗑
                </button>
            </div>
        </GlassCard>
    );
}
