import React, { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    dark?: boolean;
}

export default function GlassCard({ children, className = '', dark = false }: GlassCardProps) {
    const glassClass = dark ? 'glass-dark' : 'glass';
    return (
        <div className={`${glassClass} rounded-3xl p-6 transition-all duration-300 ${className}`}>
            {children}
        </div>
    );
}
