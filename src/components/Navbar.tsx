'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const farmer = localStorage.getItem('farmer');
        setIsLoggedIn(!!farmer);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('farmer');
        setIsLoggedIn(false);
        router.push('/login');
    };

    if (!isClient) return null; // Avoid mismatch during hydration

    const isAuthPage = pathname === '/login' || pathname === '/register';

    return (
        <nav className="bg-green-600 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold flex items-center gap-2">
                                🌾 Akhra Kisan
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {!isAuthPage && (
                            isLoggedIn ? (
                                <>
                                    <Link href="/dashboard" className="hover:text-green-200 px-3 py-2 rounded-md font-medium transition-colors">
                                        Dashboard
                                    </Link>
                                    <Link href="/dashboard" className="hover:text-green-200 px-3 py-2 rounded-md font-medium transition-colors">
                                        Add Plot
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 rounded-xl font-semibold bg-green-700 hover:bg-green-800 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/" className="hover:text-green-200 px-3 py-2 rounded-md font-medium transition-colors">
                                        Home
                                    </Link>
                                    <Link href="/login" className="hover:text-green-200 px-3 py-2 rounded-md font-medium transition-colors">
                                        Login
                                    </Link>
                                    <Link href="/register">
                                        <button className="px-4 py-2 rounded-xl font-semibold bg-white text-green-700 hover:bg-green-50 transition-colors shadow-sm">
                                            Register
                                        </button>
                                    </Link>
                                </>
                            )
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
