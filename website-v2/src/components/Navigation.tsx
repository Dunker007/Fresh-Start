'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/chat', label: 'Chat', icon: '💬' },
    { href: '/agents', label: 'Agents', icon: '🤖' },
    { href: '/labs', label: 'Labs', icon: '🔬' },
    { href: '/deals', label: 'Free AI', icon: '💰', hot: true },
    { href: '/trends', label: 'Trends', icon: '📈' },
];

export default function Navigation() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass">
            <div className="container-main">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <span className="text-xl font-bold">D</span>
                        </div>
                        <span className="text-xl font-bold text-gradient">DLX STUDIO</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${pathname === item.href
                                        ? 'bg-cyan-500/20 text-cyan-400'
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <span className="text-sm">{item.icon}</span>
                                <span>{item.label}</span>
                                {item.hot && (
                                    <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full animate-pulse">
                                        HOT
                                    </span>
                                )}
                            </Link>
                        ))}

                        <div className="w-px h-6 bg-gray-700 mx-2"></div>

                        <Link
                            href="/download"
                            className="btn-primary text-sm py-2 px-4 ml-2"
                        >
                            Download
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="lg:hidden text-gray-300 p-2"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="lg:hidden py-4 border-t border-gray-700 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${pathname === item.href
                                        ? 'bg-cyan-500/20 text-cyan-400'
                                        : 'text-gray-300 hover:bg-white/10'
                                    }`}
                                onClick={() => setMobileOpen(false)}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                                {item.hot && (
                                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                                        HOT
                                    </span>
                                )}
                            </Link>
                        ))}
                        <div className="pt-2 border-t border-gray-700">
                            <Link
                                href="/download"
                                className="btn-primary text-center block"
                                onClick={() => setMobileOpen(false)}
                            >
                                Download
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
