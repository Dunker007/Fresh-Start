'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊', shortcut: 'G D' },
    { href: '/studios', label: 'Studios', icon: '🎨' },
    { href: '/chat', label: 'Chat', icon: '💬', shortcut: 'G C' },
    { href: '/agents', label: 'Agents', icon: '🤖' },
    { href: '/news', label: 'News', icon: '📰', shortcut: 'G N' },
    { href: '/studios/dev', label: 'Dev', icon: '👨‍💻', shortcut: 'G V' },
    { href: '/labs', label: 'Labs', icon: '🔬', shortcut: 'G L' },
    { href: '/income', label: 'Income', icon: '💸', shortcut: 'G I' },
    { href: '/settings', label: 'Settings', icon: '⚙️', shortcut: 'G S' },
];

export default function Navigation() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
            <div className="container-main">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <motion.div
                            className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="text-xl font-bold">D</span>
                        </motion.div>
                        <span className="text-xl font-bold text-gradient">DLX STUDIO</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const isHovered = hoveredItem === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="relative px-3 py-2 rounded-lg transition-colors"
                                    onMouseEnter={() => setHoveredItem(item.href)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    {/* Background glow on hover */}
                                    <AnimatePresence>
                                        {(isActive || isHovered) && (
                                            <motion.div
                                                className={`absolute inset-0 rounded-lg ${isActive ? 'bg-cyan-500/20' : 'bg-white/5'
                                                    }`}
                                                layoutId="navBg"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.15 }}
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* Content */}
                                    <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-cyan-400' : 'text-gray-300 hover:text-white'
                                        }`}>
                                        <span className="text-sm">{item.icon}</span>
                                        <span className="text-sm">{item.label}</span>
                                    </span>

                                    {/* Active indicator */}
                                    {isActive && (
                                        <motion.div
                                            className="absolute -bottom-[1px] left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                                            layoutId="activeIndicator"
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}

                                    {/* Shortcut tooltip on hover */}
                                    <AnimatePresence>
                                        {isHovered && item.shortcut && (
                                            <motion.div
                                                className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 rounded text-xs text-gray-400 whitespace-nowrap border border-white/10"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                            >
                                                {item.shortcut}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Link>
                            );
                        })}

                        <div className="w-px h-6 bg-gray-700 mx-2"></div>

                        {/* Command Palette Hint */}
                        <button
                            onClick={() => {
                                const event = new KeyboardEvent('keydown', {
                                    key: 'k',
                                    ctrlKey: true,
                                    bubbles: true
                                });
                                document.dispatchEvent(event);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors group"
                        >
                            <Command size={14} className="text-gray-400 group-hover:text-cyan-400" />
                            <span className="text-xs text-gray-500 group-hover:text-gray-300">Ctrl+K</span>
                        </button>
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
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="lg:hidden overflow-hidden"
                        >
                            <div className="py-4 border-t border-gray-700 space-y-2">
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
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}

