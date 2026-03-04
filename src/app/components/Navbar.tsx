'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from './Button';

export default function Navbar() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const farmer = localStorage.getItem('farmer');
        if (farmer) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('farmer');
        setIsLoggedIn(false);
        router.push('/login');
    };

    if (!isClient) return null; // Avoid mismatch during hydration

    return (
        <nav className="bg-white shadow-md border-b border-green-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold text-green-700">Akhra Kisan</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <>
                                <Link href="/dashboard" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md font-medium">
                                    Dashboard
                                </Link>
                                <Button variant="danger" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <span className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md font-medium cursor-pointer">
                                        Login
                                    </span>
                                </Link>
                                <Link href="/register">
                                    <Button variant="primary">Register</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
