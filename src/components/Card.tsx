import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: 'white' | 'glass' | 'glass-dark';
}

export default function Card({ children, className = '', variant = 'white' }: CardProps) {
    const variants = {
        white: 'bg-white/90 shadow-lg border border-white/20',
        glass: 'glass shadow-xl',
        'glass-dark': 'glass-dark shadow-2xl text-white'
    };

    return (
        <div className={`${variants[variant]} rounded-3xl p-6 transition-all duration-300 ${className}`}>
            {children}
        </div>
    );
}
