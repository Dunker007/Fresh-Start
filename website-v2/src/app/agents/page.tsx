'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Agent {
    id: string;
    emoji: string;
    name: string;
    role: string;
    desc: string;
    gradient: string;
    status: 'active' | 'idle' | 'queued';
    capabilities: string[];
    stats: {
        tasksCompleted: number;
        uptime: string;
        lastActive: string;
    };
}

const agents: Agent[] = [
    {
        id: 'kai',
        emoji: '🎨',
        name: 'Kai',
        role: 'Creative Brainstorming',
        desc: 'Generates ideas, explores possibilities, and helps you think outside the box. Kai specializes in creative problem-solving and content ideation.',
        gradient: 'from-cyan-500 to-blue-500',
        status: 'active',
        capabilities: ['Content ideation', 'Brainstorming sessions', 'Creative writing', 'Mind mapping'],
        stats: { tasksCompleted: 247, uptime: '12h 45m', lastActive: 'Now' }
    },
    {
        id: 'guardian',
        emoji: '🛡️',
        name: 'Guardian',
        role: 'System Monitoring',
        desc: 'Watches over your systems, alerts issues, and keeps everything running smoothly. Guardian monitors system health and security.',
        gradient: 'from-green-500 to-teal-500',
        status: 'active',
        capabilities: ['System monitoring', 'Alert management', 'Health checks', 'Security scanning'],
        stats: { tasksCompleted: 1842, uptime: '48h 12m', lastActive: 'Now' }
    },
    {
        id: 'bytebot',
        emoji: '⚡',
        name: 'ByteBot',
        role: 'Task Automation',
        desc: 'Executes repetitive tasks, manages workflows, and boosts your productivity. ByteBot handles automation and batch processing.',
        gradient: 'from-purple-500 to-pink-500',
        status: 'queued',
        capabilities: ['Workflow automation', 'Batch processing', 'Scheduled tasks', 'API integrations'],
        stats: { tasksCompleted: 523, uptime: '0m', lastActive: '2h ago' }
    },
    {
        id: 'synthia',
        emoji: '🎵',
        name: 'Synthia',
        role: 'Audio Processing',
        desc: 'Handles audio transcription, music generation, and sound design. Coming soon with LANDR integration.',
        gradient: 'from-orange-500 to-red-500',
        status: 'idle',
        capabilities: ['Audio transcription', 'Music analysis', 'Sound design', 'LANDR sync'],
        stats: { tasksCompleted: 0, uptime: '0m', lastActive: 'Coming soon' }
    },
    {
        id: 'visionary',
        emoji: '👁️',
        name: 'Visionary',
        role: 'Image Analysis',
        desc: 'Analyzes images, generates descriptions, and understands visual content. Powered by multimodal models.',
        gradient: 'from-yellow-500 to-amber-500',
        status: 'idle',
        capabilities: ['Image analysis', 'OCR extraction', 'Visual QA', 'Art generation'],
        stats: { tasksCompleted: 89, uptime: '0m', lastActive: '1d ago' }
    },
    {
        id: 'oracle',
        emoji: '🔮',
        name: 'Oracle',
        role: 'Data Intelligence',
        desc: 'Analyzes data patterns, generates insights, and forecasts trends. Your personal data science assistant.',
        gradient: 'from-indigo-500 to-violet-500',
        status: 'idle',
        capabilities: ['Data analysis', 'Pattern recognition', 'Trend forecasting', 'Report generation'],
        stats: { tasksCompleted: 156, uptime: '0m', lastActive: '3h ago' }
    },
];

const staggerContainer = {
    animate: {
        transition: { staggerChildren: 0.1 }
    }
};

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

export default function AgentsPage() {
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const activeCount = agents.filter(a => a.status === 'active').length;

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-12">
                <div className="container-main">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-green-400 text-sm font-medium">{activeCount} AGENTS ACTIVE</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            AI <span className="text-glow-cyan">Agents</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Your autonomous AI workforce. Each agent specializes in different tasks
                            and works around the clock to boost your productivity.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Agents Grid */}
            <section className="pb-20">
                <div className="container-main">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {agents.map((agent) => (
                            <motion.div
                                key={agent.id}
                                className="glass-card relative overflow-hidden cursor-pointer group"
                                variants={fadeInUp}
                                whileHover={{ y: -5, scale: 1.02 }}
                                onClick={() => setSelectedAgent(agent)}
                            >
                                {/* Status badge */}
                                <div className="absolute top-4 right-4 z-10">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${agent.status === 'active'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : agent.status === 'queued'
                                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'active' ? 'bg-green-400 animate-pulse'
                                                : agent.status === 'queued' ? 'bg-yellow-400 animate-pulse'
                                                    : 'bg-gray-400'
                                            }`}></span>
                                        {agent.status}
                                    </span>
                                </div>

                                {/* Agent avatar */}
                                <motion.div
                                    className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-4xl shadow-lg`}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                    {agent.emoji}
                                </motion.div>

                                <h3 className="text-2xl font-bold text-center mb-1">{agent.name}</h3>
                                <p className="text-cyan-400 text-sm text-center mb-4">{agent.role}</p>
                                <p className="text-gray-400 text-sm text-center mb-4">{agent.desc}</p>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-700/50">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-cyan-400">{agent.stats.tasksCompleted}</p>
                                        <p className="text-xs text-gray-500">Tasks</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-purple-400">{agent.stats.uptime}</p>
                                        <p className="text-xs text-gray-500">Uptime</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-300">{agent.stats.lastActive}</p>
                                        <p className="text-xs text-gray-500">Last Active</p>
                                    </div>
                                </div>

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Agent Modal */}
            {selectedAgent && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedAgent(null)}
                >
                    <motion.div
                        className="glass-card max-w-lg w-full"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-4 mb-6">
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedAgent.gradient} flex items-center justify-center text-3xl`}>
                                {selectedAgent.emoji}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">{selectedAgent.name}</h3>
                                <p className="text-cyan-400">{selectedAgent.role}</p>
                            </div>
                            <button
                                className="ml-auto text-gray-400 hover:text-white"
                                onClick={() => setSelectedAgent(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-gray-300 mb-6">{selectedAgent.desc}</p>

                        <h4 className="font-semibold mb-3">Capabilities</h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {selectedAgent.capabilities.map((cap) => (
                                <span key={cap} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-400">
                                    {cap}
                                </span>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button className="btn-primary flex-1">
                                {selectedAgent.status === 'active' ? 'View Tasks' : 'Activate Agent'}
                            </button>
                            <button className="btn-outline flex-1">Configure</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
