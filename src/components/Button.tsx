import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'glass';
    fullWidth?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyle = 'px-6 py-3 rounded-2xl font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95';

    const variants = {
        primary: 'bg-primary-green text-white hover:bg-deep-green focus:ring-primary-green shadow-lg shadow-primary-green/20',
        secondary: 'bg-accent-green text-white hover:bg-primary-green focus:ring-accent-green shadow-md shadow-accent-green/20',
        outline: 'border-2 border-primary-green text-primary-green hover:bg-primary-green hover:text-white focus:ring-primary-green',
        glass: 'glass text-deep-green hover:bg-white/40 focus:ring-white shadow-xl',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md shadow-red-200'
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${widthStyle} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
