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

    if (!isClient) return null;

    const isAuthPage = pathname === '/login' || pathname === '/register';

    return (
        <nav className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto glass shadow-2xl rounded-3xl overflow-hidden border border-white/30">
                <div className="flex justify-between items-center h-20 px-8 bg-white/10 backdrop-blur-md">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center group">
                            <span className="text-3xl font-black text-deep-green tracking-tighter transition-all group-hover:scale-105">
                                🌾 AKHRA KISAN
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-6">
                        {!isAuthPage && (
                            isLoggedIn ? (
                                <>
                                    <Link href="/dashboard" className="text-deep-green hover:text-primary-green px-3 py-2 rounded-xl text-sm font-bold transition-all uppercase tracking-widest">
                                        Dashboard
                                    </Link>
                                    <Link href="/dashboard" className="text-deep-green hover:text-primary-green px-3 py-2 rounded-xl text-sm font-bold transition-all uppercase tracking-widest">
                                        Add Plot
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="px-6 py-2.5 rounded-2xl font-black bg-deep-green text-white hover:bg-primary-green transition-all shadow-lg active:scale-95 uppercase text-xs tracking-widest"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/" className="text-deep-green hover:text-primary-green px-3 py-2 rounded-xl text-sm font-bold transition-all uppercase tracking-widest">
                                        Home
                                    </Link>
                                    <Link href="/login" className="text-deep-green hover:text-primary-green px-3 py-2 rounded-xl text-sm font-bold transition-all uppercase tracking-widest">
                                        Login
                                    </Link>
                                    <Link href="/register">
                                        <button className="px-6 py-2.5 rounded-2xl font-black bg-white text-deep-green hover:bg-primary-green hover:text-white transition-all shadow-xl active:scale-95 uppercase text-xs tracking-widest border border-white/20">
                                            Register
                                        </button>
                                    </Link>
                                </>
                            )
                        )}
                        {isAuthPage && (
                            <Link href="/">
                                <button className="px-6 py-2.5 rounded-2xl font-black bg-white text-deep-green hover:bg-primary-green hover:text-white transition-all shadow-xl active:scale-95 uppercase text-xs tracking-widest border border-white/20">
                                    Back Home
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
