'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';

interface KisanBuddyProps {
    activeTab: 'home' | 'market' | 'advisory' | 'services' | 'profile';
    farmerName: string;
}

export default function KisanBuddy({ activeTab, farmerName }: KisanBuddyProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: `Namaste ${farmerName}! I am your Kisan Buddy. How can I help you on the farm today?`, lang: 'en' }
    ]);

    useEffect(() => {
        if (isOpen) {
            let contextMessage = '';
            switch(activeTab) {
                case 'market': contextMessage = "I see you're checking Mandi prices. Wheat is trading high in Ranchi today!"; break;
                case 'advisory': contextMessage = "Need help with fertilizers or pest control? I'm ready to calculate for you."; break;
                case 'services': contextMessage = "Have you checked the new PM Kisan installment list yet?"; break;
                default: contextMessage = "How are your farm plots doing today?";
            }
            setMessages(prev => [...prev, { role: 'assistant', text: contextMessage, lang: 'en' }]);
        }
    }, [activeTab, isOpen]);

    return (
        <div className="fixed bottom-32 right-8 z-[300] flex flex-col items-end gap-4">
            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 h-96 glass-dark rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                    <div className="p-4 bg-primary-green/20 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-soft-green animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Kisan Buddy AI</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">×</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-xs font-medium ${
                                    msg.role === 'user' 
                                        ? 'bg-primary-green text-white' 
                                        : 'bg-white/10 text-white/90 border border-white/5'
                                } shadow-lg`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-white/5 bg-white/[0.02] flex gap-2 items-center">
                        <input 
                            type="text" 
                            placeholder="Ask Kisan Buddy..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-primary-green transition-all"
                        />
                        <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white shadow-lg active:scale-95 transition-all border border-white/5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.3)] transition-all duration-500 active:scale-90 relative ${
                    isOpen 
                        ? 'bg-white/10 text-white border border-white/20 rotate-90 backdrop-blur-md' 
                        : 'bg-primary-green text-white hover:shadow-[0_20px_40px_rgba(34,197,94,0.4)] hover:-translate-y-1'
                }`}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l4-4-4-4h12a2 2 0 0 1 2 2Z"/><path d="M3 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/><path d="M12 9h.01"/><path d="M16 9h.01"/><path d="M8 9h.01"/></svg>
                )}
                {!isOpen && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-deep-green" />
                )}
            </button>
        </div>
    );
}
