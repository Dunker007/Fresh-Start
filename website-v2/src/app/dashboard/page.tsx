'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import SystemStatus from '@/components/SystemStatus';
import LLMModels from '@/components/LLMModels';
import { useState, useEffect } from 'react';

interface Activity {
    id: string;
    type: 'chat' | 'task' | 'system' | 'agent';
    title: string;
    timestamp: string;
    icon: string;
}

const recentActivities: Activity[] = [
    { id: '1', type: 'chat', title: 'Chat with gemma-3n', timestamp: '2 min ago', icon: '💬' },
    { id: '2', type: 'agent', title: 'Guardian health check', timestamp: '5 min ago', icon: '🛡️' },
    { id: '3', type: 'system', title: 'GPU temp: 48°C', timestamp: '10 min ago', icon: '🌡️' },
    { id: '4', type: 'task', title: 'Code review completed', timestamp: '15 min ago', icon: '✅' },
    { id: '5', type: 'chat', title: 'Brainstorm session', timestamp: '30 min ago', icon: '🧠' },
];

const quickActions = [
    { icon: '💬', label: 'New Chat', href: '/chat', color: 'cyan' },
    { icon: '🚀', label: 'Launch Lab', href: '/labs', color: 'purple' },
    { icon: '🤖', label: 'Agents', href: '/agents', color: 'green' },
    { icon: '💰', label: 'Free AI', href: '/deals', color: 'yellow' },
    { icon: '📊', label: 'Analytics', href: '#', color: 'pink' },
    { icon: '⚙️', label: 'Settings', href: '#', color: 'gray' },
];

export default function DashboardPage() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="container-main py-8">
                <motion.div
                    className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            Welcome back, <span className="text-gradient">Dunker</span>
                        </h1>
                        <p className="text-gray-400">
                            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} •
                            <span className="ml-2 font-mono text-cyan-400">
                                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/chat" className="btn-primary flex items-center gap-2">
                            <span>💬</span> New Chat
                        </Link>
                        <Link href="/deals" className="btn-outline flex items-center gap-2">
                            <span>🔥</span> Free AI Deals
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Quick Actions */}
            <section className="container-main pb-8">
                <motion.div
                    className="grid grid-cols-3 md:grid-cols-6 gap-4"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                >
                    {quickActions.map((action) => (
                        <motion.div
                            key={action.label}
                            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                        >
                            <Link
                                href={action.href}
                                className="glass-card flex flex-col items-center justify-center py-6 hover:border-cyan-500/50 transition-colors group"
                            >
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
                                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{action.label}</span>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* System Status */}
            <section className="container-main pb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Live System Status
                </h2>
                <SystemStatus />
            </section>

            {/* Main Content Grid */}
            <section className="container-main pb-16">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <div className="lg:col-span-1">
                        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                        <div className="glass-card divide-y divide-gray-800">
                            {recentActivities.map((activity, i) => (
                                <motion.div
                                    key={activity.id}
                                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <span className="text-xl">{activity.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">{activity.title}</p>
                                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Agent Status */}
                        <h2 className="text-xl font-bold mb-4 mt-8">Agent Status</h2>
                        <div className="space-y-3">
                            {[
                                { name: 'Kai', status: 'active', task: 'Idle', icon: '🎨' },
                                { name: 'Guardian', status: 'active', task: 'Monitoring', icon: '🛡️' },
                                { name: 'ByteBot', status: 'idle', task: 'Queued', icon: '⚡' },
                            ].map((agent) => (
                                <div key={agent.name} className="glass-card py-3 flex items-center gap-3">
                                    <span className="text-2xl">{agent.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{agent.name}</span>
                                            <span className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                                        </div>
                                        <p className="text-xs text-gray-500">{agent.task}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LLM Models */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold mb-4">Available Models</h2>
                        <LLMModels />

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            {[
                                { label: 'Chats Today', value: '12', icon: '💬', change: '+3' },
                                { label: 'Tokens Used', value: '45.2K', icon: '🔤', change: '+8.1K' },
                                { label: 'Tasks Done', value: '7', icon: '✅', change: '+2' },
                                { label: 'GPU Hours', value: '3.4h', icon: '🖥️', change: '+0.5h' },
                            ].map((stat) => (
                                <div key={stat.label} className="glass-card text-center py-4">
                                    <div className="text-2xl mb-1">{stat.icon}</div>
                                    <div className="text-2xl font-bold text-cyan-400">{stat.value}</div>
                                    <div className="text-xs text-gray-500">{stat.label}</div>
                                    <div className="text-xs text-green-400 mt-1">{stat.change}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}
