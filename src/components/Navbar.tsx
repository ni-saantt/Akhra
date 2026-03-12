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
        <nav className="fixed top-6 left-0 right-0 z-[100] px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-7xl mx-auto glass shadow-2xl rounded-[2rem] overflow-hidden border border-white/10">
                <div className="flex justify-between items-center h-20 px-10 bg-white/5 backdrop-blur-xl">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center group gap-3">
                            <span className="text-2xl font-black text-white tracking-[0.2em] transition-all group-hover:text-soft-green">
                                AKHRA KISAN
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-10">
                        {!isAuthPage && (
                            isLoggedIn ? (
                                <>
                                    <Link href="/dashboard" className="text-white/80 hover:text-white px-2 py-1 text-[11px] font-black transition-all uppercase tracking-[0.3em]">
                                        DASHBOARD
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="px-8 py-3 rounded-full font-black bg-deep-green text-white hover:bg-primary-green transition-all shadow-xl active:scale-95 uppercase text-[10px] tracking-[0.2em] border border-white/5"
                                    >
                                        LOGOUT
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/" className="text-white/80 hover:text-white px-2 py-1 text-[11px] font-black transition-all uppercase tracking-[0.3em]">
                                        HOME
                                    </Link>
                                    <Link href="/login" className="text-white/80 hover:text-white px-2 py-1 text-[11px] font-black transition-all uppercase tracking-[0.3em]">
                                        LOGIN
                                    </Link>
                                    <Link href="/register">
                                        <button className="px-8 py-3 rounded-full font-black bg-white text-deep-green hover:bg-soft-green transition-all shadow-xl active:scale-95 uppercase text-[10px] tracking-[0.2em]">
                                            REGISTER
                                        </button>
                                    </Link>
                                </>
                            )
                        )}
                        {isAuthPage && (
                            <Link href="/">
                                <button className="px-8 py-3 rounded-full font-black bg-white/10 text-white hover:bg-white/20 transition-all shadow-xl active:scale-95 uppercase text-[10px] tracking-[0.2em] border border-white/10">
                                    BACK HOME
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
