'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandItem {
    id: string;
    icon: string;
    label: string;
    shortcut?: string;
    category: string;
    action: () => void;
}

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();

    const commands: CommandItem[] = [
        // Core Navigation
        { id: 'home', icon: '🏠', label: 'Go to Home', shortcut: 'G H', category: 'Core', action: () => router.push('/') },
        { id: 'dashboard', icon: '📊', label: 'Go to Dashboard', shortcut: 'G D', category: 'Core', action: () => router.push('/dashboard') },
        { id: 'apps', icon: '📱', label: 'All Apps', shortcut: 'G A', category: 'Core', action: () => router.push('/apps') },
        { id: 'search', icon: '🔍', label: 'Search', shortcut: '/', category: 'Core', action: () => router.push('/search') },
        { id: 'profile', icon: '👤', label: 'Profile', shortcut: 'G P', category: 'Core', action: () => router.push('/profile') },

        // AI & LLM
        { id: 'chat', icon: '💬', label: 'Go to Chat', shortcut: 'G C', category: 'AI', action: () => router.push('/chat') },
        { id: 'agents', icon: '🤖', label: 'Go to Agents', category: 'AI', action: () => router.push('/agents') },
        { id: 'labs', icon: '🔬', label: 'Go to Labs', shortcut: 'G L', category: 'AI', action: () => router.push('/labs') },
        { id: 'playground', icon: '🧪', label: 'AI Playground', category: 'AI', action: () => router.push('/playground') },
        { id: 'models', icon: '🔎', label: 'Model Explorer', category: 'AI', action: () => router.push('/models') },
        { id: 'prompts', icon: '📝', label: 'Prompt Library', category: 'AI', action: () => router.push('/prompts') },
        { id: 'voice', icon: '🎤', label: 'Voice Control', category: 'AI', action: () => router.push('/voice') },

        // Finance
        { id: 'finance', icon: '💰', label: 'Finance Hub', shortcut: 'G F', category: 'Finance', action: () => router.push('/finance') },
        { id: 'portfolio', icon: '📈', label: 'Portfolio Tracker', category: 'Finance', action: () => router.push('/portfolio') },
        { id: 'trading', icon: '🤖', label: 'Trading Bots', category: 'Finance', action: () => router.push('/trading') },
        { id: 'budget', icon: '💵', label: 'Budget', category: 'Finance', action: () => router.push('/budget') },

        // Smart Home
        { id: 'smarthome', icon: '🏠', label: 'Smart Home', category: 'Smart Home', action: () => router.push('/home') },

        // Productivity
        { id: 'calendar', icon: '📅', label: 'Calendar', category: 'Productivity', action: () => router.push('/calendar') },
        { id: 'notes', icon: '📝', label: 'Notes', category: 'Productivity', action: () => router.push('/notes') },
        { id: 'files', icon: '📁', label: 'Files', category: 'Productivity', action: () => router.push('/files') },
        { id: 'workflows', icon: '⚡', label: 'Workflows', category: 'Productivity', action: () => router.push('/workflows') },
        { id: 'scratchpad', icon: '📋', label: 'Scratchpad', shortcut: 'G X', category: 'Productivity', action: () => router.push('/scratchpad') },
        { id: 'projects', icon: '🚀', label: 'Projects', category: 'Productivity', action: () => router.push('/projects') },
        { id: 'media', icon: '🖼️', label: 'Media Gallery', category: 'Productivity', action: () => router.push('/media') },

        // System
        { id: 'github-mgmt', icon: '🐙', label: 'GitHub', shortcut: 'G G', category: 'System', action: () => router.push('/github') },
        { id: 'status', icon: '🚦', label: 'System Status', category: 'System', action: () => router.push('/status') },
        { id: 'setup', icon: '🔧', label: 'Dev Setup', category: 'System', action: () => router.push('/setup') },
        { id: 'terminal', icon: '💻', label: 'Terminal', shortcut: 'G T', category: 'System', action: () => router.push('/terminal') },
        { id: 'settings', icon: '⚙️', label: 'Settings', shortcut: 'G S', category: 'System', action: () => router.push('/settings') },
        { id: 'analytics', icon: '📊', label: 'Analytics', category: 'System', action: () => router.push('/analytics') },
        { id: 'notifications', icon: '🔔', label: 'Notifications', category: 'System', action: () => router.push('/notifications') },
        { id: 'logs', icon: '📜', label: 'Activity Logs', category: 'System', action: () => router.push('/logs') },
        { id: 'backup', icon: '💾', label: 'Backups', category: 'System', action: () => router.push('/backup') },
        { id: 'api-keys', icon: '🔑', label: 'API Keys', category: 'System', action: () => router.push('/api-keys') },

        // Resources
        { id: 'learn', icon: '🎓', label: 'Learn', category: 'Resources', action: () => router.push('/learn') },
        { id: 'blog', icon: '📰', label: 'Blog', category: 'Resources', action: () => router.push('/blog') },
        { id: 'deals', icon: '💎', label: 'Free AI Deals', category: 'Resources', action: () => router.push('/deals') },
        { id: 'compare', icon: '⚖️', label: 'AI Compare', category: 'Resources', action: () => router.push('/compare') },
        { id: 'trends', icon: '📈', label: 'AI Trends', category: 'Resources', action: () => router.push('/trends') },
        { id: 'showcase', icon: '🖼️', label: 'Showcase', category: 'Resources', action: () => router.push('/showcase') },
        { id: 'docs', icon: '📚', label: 'API Docs', category: 'Resources', action: () => router.push('/docs') },

        // Customize
        { id: 'themes', icon: '🎨', label: 'Themes', category: 'Customize', action: () => router.push('/themes') },
        { id: 'integrations', icon: '🔌', label: 'Integrations', category: 'Customize', action: () => router.push('/integrations') },
        { id: 'shortcuts', icon: '⌨️', label: 'Keyboard Shortcuts', shortcut: '?', category: 'Customize', action: () => router.push('/shortcuts') },

        // Info
        { id: 'vision', icon: '🔮', label: '2026 Vision', category: 'Info', action: () => router.push('/vision') },
        { id: 'changelog', icon: '📋', label: 'Changelog', category: 'Info', action: () => router.push('/changelog') },
        { id: 'community', icon: '👥', label: 'Community', category: 'Info', action: () => router.push('/community') },
        { id: 'download', icon: '📥', label: 'Download', category: 'Info', action: () => router.push('/download') },

        // External
        { id: 'github', icon: '🐙', label: 'Open GitHub', category: 'External', action: () => window.open('https://github.com/Dunker007', '_blank') },
        { id: 'lmstudio', icon: '🖥️', label: 'Open LM Studio', category: 'External', action: () => window.open('https://lmstudio.ai', '_blank') },
        { id: 'ollama', icon: '🦙', label: 'Open Ollama', category: 'External', action: () => window.open('https://ollama.ai', '_blank') },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.category.toLowerCase().includes(search.toLowerCase())
    );

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = [];
        acc[cmd.category].push(cmd);
        return acc;
    }, {} as Record<string, CommandItem[]>);

    const flatCommands = filteredCommands;

    // Keyboard handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Open palette
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(prev => !prev);
                setSearch('');
                setSelectedIndex(0);
            }

            // Close on escape
            if (e.key === 'Escape') {
                setOpen(false);
            }

            // Navigate with arrows
            if (open) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex(prev => Math.min(prev + 1, flatCommands.length - 1));
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex(prev => Math.max(prev - 1, 0));
                }
                if (e.key === 'Enter' && flatCommands[selectedIndex]) {
                    e.preventDefault();
                    flatCommands[selectedIndex].action();
                    setOpen(false);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, selectedIndex, flatCommands]);

    // Reset selection when search changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                    />

                    {/* Palette */}
                    <motion.div
                        className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl"
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                    >
                        <div className="glass-card overflow-hidden p-0">
                            {/* Search */}
                            <div className="flex items-center gap-3 p-4 border-b border-gray-700">
                                <span className="text-gray-500">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search commands..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 bg-transparent focus:outline-none text-lg"
                                    autoFocus
                                />
                                <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-gray-500">ESC</kbd>
                            </div>

                            {/* Results */}
                            <div className="max-h-[400px] overflow-y-auto">
                                {Object.entries(groupedCommands).length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No commands found
                                    </div>
                                ) : (
                                    Object.entries(groupedCommands).map(([category, cmds]) => (
                                        <div key={category}>
                                            <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide bg-white/5">
                                                {category}
                                            </div>
                                            {cmds.map((cmd) => {
                                                const index = flatCommands.findIndex(c => c.id === cmd.id);
                                                const isSelected = index === selectedIndex;

                                                return (
                                                    <button
                                                        key={cmd.id}
                                                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${isSelected ? 'bg-cyan-500/20 text-white' : 'hover:bg-white/5'
                                                            }`}
                                                        onClick={() => {
                                                            cmd.action();
                                                            setOpen(false);
                                                        }}
                                                        onMouseEnter={() => setSelectedIndex(index)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xl">{cmd.icon}</span>
                                                            <span>{cmd.label}</span>
                                                        </div>
                                                        {cmd.shortcut && (
                                                            <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400">
                                                                {cmd.shortcut}
                                                            </kbd>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-700 text-xs text-gray-500">
                                <div className="flex gap-4">
                                    <span>↑↓ Navigate</span>
                                    <span>↵ Select</span>
                                    <span>ESC Close</span>
                                </div>
                                <span>⌘K to toggle</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
