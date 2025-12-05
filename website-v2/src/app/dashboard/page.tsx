'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import { parseRSSFeed, NEWS_SOURCES } from '@/lib/news-service';
import PageBackground from '@/components/PageBackground';

// Fallback data
const SAMPLE_NEWS = [
    { title: 'Minneapolis City Council Passes New Public Safety Measure', source: 'Alpha News', time: '2h ago' },
    { title: 'Governor Walz Signs Executive Order on Energy Policy', source: 'Bring Me The News', time: '4h ago' },
    { title: 'Glenn Beck: The Media Won\'t Tell You This', source: 'The Blaze', time: '5h ago' },
];

const CALENDAR_EVENTS = [
    { title: 'Team standup', time: '10:00 AM', type: 'meeting' },
    { title: 'Music pipeline review', time: '2:00 PM', type: 'work' },
    { title: 'AI research session', time: '4:30 PM', type: 'personal' },
];

const PROJECT_TASKS = [
    { title: 'Finish News Hub UI polish', status: 'done', priority: 'high' },
    { title: 'Set up YouTube channel', status: 'in-progress', priority: 'high' },
    { title: 'Create first Suno song', status: 'todo', priority: 'medium' },
    { title: 'Connect Neural Frames API', status: 'todo', priority: 'low' },
];

const DAILY_FUN = [
    { type: 'quote', content: '"The best way to predict the future is to create it."', author: 'Peter Drucker' },
    { type: 'quote', content: '"Move fast and break things. Unless you are breaking stuff, you are not moving fast enough."', author: 'Mark Zuckerberg' },
    { type: 'quote', content: '"The only way to do great work is to love what you do."', author: 'Steve Jobs' },
    { type: 'fact', content: 'The first computer programmer was Ada Lovelace in the 1840s.' },
    { type: 'tip', content: 'Tip: Use Ctrl+K to open the command palette in most apps.' },
];

export default function DashboardPage() {
    const [time, setTime] = useState(new Date());
    const [greeting, setGreeting] = useState('');
    const [dailyFun, setDailyFun] = useState(DAILY_FUN[0]);

    // Real Data States
    const [systemStats, setSystemStats] = useState<any>(null);
    const [news, setNews] = useState<any[]>(SAMPLE_NEWS);
    const [loadingNews, setLoadingNews] = useState(true);

    // Initialize on mount
    useEffect(() => {
        // Set greeting based on time
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 17) setGreeting('Good afternoon');
        else setGreeting('Good evening');

        // Random daily fun
        setDailyFun(DAILY_FUN[Math.floor(Math.random() * DAILY_FUN.length)]);

        // Update time every second
        const timer = setInterval(() => setTime(new Date()), 1000);

        // Initial Fetch
        fetchSystemStats();
        fetchDashboardNews();

        // Poll system stats every 5s
        const statsTimer = setInterval(fetchSystemStats, 5000);

        return () => {
            clearInterval(timer);
            clearInterval(statsTimer);
        };
    }, []);

    async function fetchSystemStats() {
        try {
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/system`);
            if (res.ok) {
                const data = await res.json();
                setSystemStats(data);
            }
        } catch (e) {
            console.error('Failed to fetch system stats');
            // Keep previous stats or null
        }
    }

    async function fetchDashboardNews() {
        try {
            // Pick 2 focused sources for dashboard to keep it fast
            const alphaNews = await parseRSSFeed(NEWS_SOURCES.local.find(s => s.id === 'alpha-news')?.rss || '');
            const blaze = await parseRSSFeed(NEWS_SOURCES.national.find(s => s.id === 'the-blaze')?.rss || '');

            // Combine and take top 5
            const combined = [
                ...alphaNews.map(i => ({ ...i, source: 'Alpha News' })),
                ...blaze.map(i => ({ ...i, source: 'The Blaze' }))
            ].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
                .slice(0, 5)
                .map(item => ({
                    title: item.title,
                    source: item.source,
                    time: getTimeAgo(item.pubDate),
                    link: item.link
                }));

            if (combined.length > 0) {
                setNews(combined);
            }
        } catch (e) {
            console.error('Failed to fetch dashboard news');
        } finally {
            setLoadingNews(false);
        }
    }

    function getTimeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        if (hrs < 1) return 'Just now';
        if (hrs > 24) return `${Math.floor(hrs / 24)}d ago`;
        return `${hrs}h ago`;
    }

    const getTaskStatusStyle = (status: string) => {
        switch (status) {
            case 'done': return 'bg-green-500/20 text-green-400';
            case 'in-progress': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="min-h-screen pb-24 relative">
            <PageBackground color="cyan" />

            {/* Header with greeting */}
            <section className="container-main py-8">
                <motion.div
                    className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            {greeting}, <span className="text-gradient">Dunker</span> 👋
                        </h1>
                        <p className="text-gray-400">
                            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            <span className="mx-2">•</span>
                            <span className="font-mono text-cyan-400">
                                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </p>
                    </div>

                    {/* Quick System Status */}
                    <div className="flex items-center gap-4 text-sm">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${systemStats ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${systemStats ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                            <span className={systemStats ? 'text-green-400' : 'text-red-400'}>
                                {systemStats ? 'LuxRig Online' : 'LuxRig Offline'}
                            </span>
                        </div>
                        {systemStats && systemStats.gpu?.available && (
                            <div className="hidden md:flex items-center gap-3 text-gray-400">
                                <span>🖥️ {systemStats.gpu.name}</span>
                                <span>•</span>
                                <span>🌡️ {systemStats.gpu.temperature}°C</span>
                                <span>•</span>
                                <span>⚡ {systemStats.gpu.utilization}%</span>
                            </div>
                        )}
                        {!systemStats && (
                            <div className="hidden md:flex items-center gap-3 text-gray-500 italic">
                                Connecting to bridge...
                            </div>
                        )}
                    </div>
                </motion.div>
            </section>

            {/* Main Grid */}
            <section className="container-main">
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* News Widget */}
                        <motion.div
                            className="glass-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    📰 News
                                </h3>
                                <Link href="/news" className="text-xs text-cyan-400 hover:underline">
                                    View all →
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {loadingNews ? (
                                    <div className="text-center py-4 text-gray-500">Loading headlines...</div>
                                ) : (
                                    news.map((item, i) => (
                                        <div key={i} className="border-b border-white/5 last:border-0 pb-3 last:pb-0">
                                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="block group">
                                                <p className="text-sm font-medium group-hover:text-cyan-400 transition-colors line-clamp-2">
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 flex justify-between">
                                                    <span>{item.source}</span>
                                                    <span>{item.time}</span>
                                                </p>
                                            </a>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Weather Widget */}
                        <motion.div
                            className="glass-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="font-bold flex items-center gap-2 mb-4">
                                🌤️ Minneapolis Weather
                            </h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-4xl font-bold">28°F</div>
                                    <div className="text-gray-400 text-sm">Partly Cloudy</div>
                                </div>
                                <div className="text-6xl">❄️</div>
                            </div>
                            <div className="mt-4 flex gap-4 text-xs text-gray-400">
                                <span>H: 32°</span>
                                <span>L: 18°</span>
                                <span>💨 8 mph</span>
                            </div>
                        </motion.div>

                        {/* Daily Fun */}
                        <motion.div
                            className="glass-card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className="font-bold flex items-center gap-2 mb-3">
                                ✨ Daily Inspiration
                            </h3>
                            <p className="text-sm italic text-gray-300">"{dailyFun.content}"</p>
                            {dailyFun.author && (
                                <p className="text-xs text-gray-500 mt-2">— {dailyFun.author}</p>
                            )}
                        </motion.div>
                    </div>

                    {/* Center Column */}
                    <div className="space-y-6">
                        {/* Calendar Widget */}
                        <motion.div
                            className="glass-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    📅 Today's Schedule
                                </h3>
                                <span className="text-xs text-gray-500">
                                    {CALENDAR_EVENTS.length} events
                                </span>
                            </div>
                            <div className="space-y-3">
                                {CALENDAR_EVENTS.map((event, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="text-cyan-400 font-mono text-sm w-20">{event.time}</div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{event.title}</p>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${event.type === 'meeting' ? 'bg-blue-400' :
                                            event.type === 'work' ? 'bg-green-400' : 'bg-purple-400'
                                            }`}></div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                                + Add event
                            </button>
                        </motion.div>

                        {/* Email Widget */}
                        <motion.div
                            className="glass-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    📧 Email
                                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">3</span>
                                </h3>
                                <a href="https://mail.google.com" target="_blank" className="text-xs text-cyan-400 hover:underline">
                                    Open Gmail →
                                </a>
                            </div>
                            <div className="space-y-3">
                                <div className="p-2 rounded-lg bg-white/5 border-l-2 border-cyan-500">
                                    <p className="text-sm font-medium">DistroKid: Your release is live!</p>
                                    <p className="text-xs text-gray-500">10 min ago</p>
                                </div>
                                <div className="p-2 rounded-lg bg-white/5">
                                    <p className="text-sm">GitHub: PR merged successfully</p>
                                    <p className="text-xs text-gray-500">1 hour ago</p>
                                </div>
                                <div className="p-2 rounded-lg bg-white/5">
                                    <p className="text-sm">YouTube Studio: New subscriber!</p>
                                    <p className="text-xs text-gray-500">3 hours ago</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Project Board */}
                        <motion.div
                            className="glass-card"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    📋 Project Board
                                </h3>
                                <Link href="/labs" className="text-xs text-cyan-400 hover:underline">
                                    Full board →
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {PROJECT_TASKS.map((task, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                                        <span className={`px-2 py-0.5 rounded text-xs ${getTaskStatusStyle(task.status)}`}>
                                            {task.status === 'done' ? '✓' : task.status === 'in-progress' ? '→' : '○'}
                                        </span>
                                        <span className={`flex-1 text-sm ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                                            {task.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                                + Add task
                            </button>
                        </motion.div>

                        {/* Quick Links */}
                        <motion.div
                            className="glass-card"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="font-bold mb-4">🚀 Quick Links</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { icon: '🎵', label: 'Music Studio', href: '/music' },
                                    { icon: '📰', label: 'News Hub', href: '/news' },
                                    { icon: '🤖', label: 'Agents', href: '/agents' },
                                    { icon: '💬', label: 'Chat', href: '/chat' },
                                    { icon: '🔬', label: 'Labs', href: '/labs' },
                                    { icon: '💸', label: 'Income', href: '/income' },
                                ].map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                                    >
                                        <span>{link.icon}</span>
                                        <span>{link.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}

