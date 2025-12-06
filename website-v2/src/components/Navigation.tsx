'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Palette } from 'lucide-react';
import { useVibe } from './VibeContext';

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
    const searchParams = useSearchParams();
    const isPopup = searchParams.get('mode') === 'popup';
    const { themeId, setTheme, availableThemes } = useVibe();

    // If in popup mode, don't render the navigation bar
    if (isPopup) return null;

    const toggleTheme = () => {
        const ids = availableThemes.map(t => t.id);
        const currentIndex = ids.indexOf(themeId);
        const nextIndex = (currentIndex + 1) % ids.length;
        setTheme(ids[nextIndex]);
    };

    const openInNewWindow = (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(`${href}?mode=popup`, '_blank', 'width=1200,height=800,menubar=no,toolbar=no,location=no,status=no');
    };

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 transition-colors duration-300 backdrop-blur-xl bg-[#050508]/60"
            style={{ backgroundColor: 'var(--bg-void, rgba(5, 5, 8, 0.6))' }}
        >
            <div className="w-full px-6">
                <div className="flex items-center h-16 relative justify-between">
                    {/* Logo - Absolute Left or Flex Start */}
                    <div className="flex-1 flex items-center justify-start">
                        <Link href="/" className="flex items-center gap-3 group">
                            <motion.div
                                className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="text-xl font-bold text-white">D</span>
                            </motion.div>
                            <span className="text-xl font-bold text-gradient">DLX STUDIO</span>
                        </Link>
                    </div>

                    {/* Desktop Nav - Centered */}
                    <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const isHovered = hoveredItem === item.href;

                            return (
                                <div
                                    key={item.href}
                                    className="relative"
                                    onMouseEnter={() => setHoveredItem(item.href)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <Link
                                        href={item.href}
                                        className="relative px-3 py-2 rounded-lg transition-colors block"
                                    >
                                        {/* Background glow on hover */}
                                        <AnimatePresence>
                                            {(isActive || isHovered) && (
                                                <motion.div
                                                    className={`absolute inset-0 rounded-lg ${isActive ? 'bg-cyan-500/20' : 'bg-white/5'}`}
                                                    layoutId="navBg"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                />
                                            )}
                                        </AnimatePresence>

                                        {/* Content */}
                                        <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-cyan-400' : 'text-gray-300 hover:text-white'}`}>
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
                                    </Link>

                                    {/* Pop-out Button (Visible on Hover) */}
                                    <AnimatePresence>
                                        {isHovered && (
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                onClick={(e) => openInNewWindow(e, item.href)}
                                                className="absolute -top-2 -right-2 w-5 h-5 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 z-20"
                                                title="Open in new window"
                                            >
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                    <polyline points="15 3 21 3 21 9"></polyline>
                                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                                </svg>
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}

                    </div>

                    {/* Right Side Actions */}
                    <div className="flex-1 flex items-center justify-end gap-2">
                        <div className="hidden lg:block w-px h-6 bg-gray-700 mx-2"></div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors group"
                            title={`Current theme: ${themeId}`}
                        >
                            <Palette size={14} className="text-gray-400 group-hover:text-cyan-400" />
                        </button>

                        {/* Command Palette Hint */}
                        <button
                            onClick={() => {
                                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
                                document.dispatchEvent(event);
                            }}
                            className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors group"
                        >
                            <Command size={14} className="text-gray-400 group-hover:text-cyan-400" />
                            <span className="text-xs text-gray-500 group-hover:text-gray-300">Ctrl+K</span>
                        </button>

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
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg ${pathname === item.href ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-300 hover:bg-white/10'}`}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <span>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                                <div className="h-px bg-white/10 my-2" />
                                <button
                                    onClick={toggleTheme}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 w-full text-left"
                                >
                                    <Palette size={20} />
                                    <span>Switch Theme ({themeId})</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
