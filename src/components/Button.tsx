import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    fullWidth?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyle = 'px-4 py-2 rounded-xl font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm',
        secondary: 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-400',
        outline: 'border-2 border-green-600 text-green-700 hover:bg-green-50 focus:ring-green-500',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400'
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
