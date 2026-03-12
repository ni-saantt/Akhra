'use client';

import React from 'react';

export type TabType = 'home' | 'market' | 'advisory' | 'services' | 'profile';

interface TabNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
    const tabs = [
        { 
            id: 'home' as TabType, 
            label: 'Home', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            )
        },
        { 
            id: 'market' as TabType, 
            label: 'Market', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 11Z"/><path d="M9 11v-1"/><path d="M15 11v-1"/><path d="M12 11v-1"/></svg>
            )
        },
        { 
            id: 'advisory' as TabType, 
            label: 'Advisory', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v8"/><path d="M14 2v8"/><path d="M8 8v1a4 4 0 0 0 8 0v-1"/><path d="M16 2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M2 22h20"/><path d="M12 22V12"/></svg>
            )
        },
        { 
            id: 'services' as TabType, 
            label: 'Services', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10 11-6.5 8.5"/><path d="M10 11v10h11v-5"/><path d="M13 11v3"/><path d="M17 11v3"/><path d="m14 11 6.5 8.5"/><path d="M2 11h20"/></svg>
            )
        },
        { 
            id: 'profile' as TabType, 
            label: 'Profile', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            )
        },
    ];

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-[95%] max-w-lg px-2 pointer-events-none">
            <div className="glass-dark rounded-[2rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 flex justify-around items-center pointer-events-auto bg-black/40 backdrop-blur-3xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`relative flex flex-col items-center gap-1.5 px-6 py-3 transition-all duration-300 rounded-2xl group ${
                            activeTab === tab.id 
                                ? 'text-white' 
                                : 'text-white/40 hover:text-white/70'
                        }`}
                    >
                        <span className={`transition-all duration-500 ${
                            activeTab === tab.id 
                                ? 'scale-110' 
                                : 'group-hover:scale-105'
                        }`}>
                            {tab.icon}
                        </span>
                        <span className={`text-[10px] font-medium tracking-tight transition-all duration-300 ${
                            activeTab === tab.id 
                                ? 'opacity-100' 
                                : 'opacity-0 group-hover:opacity-100'
                        }`}>
                            {tab.label}
                        </span>
                        
                        {activeTab === tab.id && (
                            <div className="absolute -bottom-1 w-8 h-[2px] bg-primary-green rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-in fade-in zoom-in duration-500" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
