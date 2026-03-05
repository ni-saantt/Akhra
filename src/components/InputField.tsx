import React, { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
    variant?: 'white' | 'glass';
}

export default function InputField({
    label,
    id,
    error,
    variant = 'white',
    className = '',
    ...props
}: InputFieldProps) {
    const variants = {
        white: 'bg-white/80 border-gray-200 focus:border-primary-green focus:ring-primary-green',
        glass: 'glass border-white/30 text-deep-green placeholder:text-deep-green/50 focus:border-white focus:ring-white'
    };

    return (
        <div className={`mb-4 ${className}`}>
            <label htmlFor={id} className="block text-sm font-bold text-deep-green mb-1 ml-1 uppercase tracking-wider">
                {label}
            </label>
            <input
                id={id}
                name={id}
                className={`w-full px-5 py-3 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${error ? 'border-red-500 focus:ring-red-500' : variants[variant]
                    }`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600 font-bold ml-1">{error}</p>}
        </div>
    );
}
