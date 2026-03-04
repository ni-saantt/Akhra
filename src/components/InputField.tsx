import React, { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
}

export default function InputField({
    label,
    id,
    error,
    className = '',
    ...props
}: InputFieldProps) {
    return (
        <div className={`mb-4 ${className}`}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                id={id}
                name={id}
                className={`w-full px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
