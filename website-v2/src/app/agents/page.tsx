'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Pause, Settings, Zap, MessageCircle, ChevronRight } from 'lucide-react';
import PageBackground from '@/components/PageBackground';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

interface Agent {
    id: string;
    emoji: string;
    name: string;
    role: string;
    desc: string;
    gradient: string;
    status: 'active' | 'idle' | 'queued' | 'thinking';
    capabilities: string[];
    stats: {
        tasksCompleted: number;
        uptime: string;
        lastActive: string;
    };
}

const agents: Agent[] = [
    {
        id: 'lux',
        emoji: '🎨',
        name: 'Lux',
        role: 'Creative Director',
        desc: 'The original DLX agent. Generates ideas, explores possibilities, and helps you think outside the box.',
        gradient: 'from-cyan-500 to-blue-600',
        status: 'active',
        capabilities: ['Content ideation', 'Brainstorming', 'Creative writing', 'Mind mapping'],
        stats: { tasksCompleted: 247, uptime: '12h 45m', lastActive: 'Now' }
    },
    {
        id: 'guardian',
        emoji: '🛡️',
        name: 'Guardian',
        role: 'Security & Monitoring',
        desc: 'Watches over your systems, alerts issues, and keeps everything running smoothly.',
        gradient: 'from-green-500 to-emerald-600',
        status: 'active',
        capabilities: ['System monitoring', 'Alert management', 'Health checks', 'Security scanning'],
        stats: { tasksCompleted: 1842, uptime: '48h 12m', lastActive: 'Now' }
    },
    {
        id: 'architect',
        emoji: '🏗️',
        name: 'Architect',
        role: 'System Design',
        desc: 'Designs system architecture, database schemas, and API structures for your projects.',
        gradient: 'from-purple-500 to-violet-600',
        status: 'idle',
        capabilities: ['System design', 'Database modeling', 'API design', 'Code review'],
        stats: { tasksCompleted: 89, uptime: '0m', lastActive: '2h ago' }
    },
    {
        id: 'bytebot',
        emoji: '⚡',
        name: 'ByteBot',
        role: 'Task Automation',
        desc: 'Executes repetitive tasks, manages workflows, and boosts your productivity.',
        gradient: 'from-yellow-500 to-orange-500',
        status: 'queued',
        capabilities: ['Workflow automation', 'Batch processing', 'Scheduled tasks', 'API integrations'],
        stats: { tasksCompleted: 523, uptime: '0m', lastActive: '10m ago' }
    },
    {
        id: 'synthia',
        emoji: '🎵',
        name: 'Synthia',
        role: 'Audio & Music',
        desc: 'Handles audio transcription, Suno prompt crafting, and music generation.',
        gradient: 'from-pink-500 to-rose-600',
        status: 'idle',
        capabilities: ['Suno prompts', 'Audio transcription', 'Music analysis', 'Sound design'],
        stats: { tasksCompleted: 156, uptime: '0m', lastActive: '1d ago' }
    },
    {
        id: 'oracle',
        emoji: '🔮',
        name: 'Oracle',
        role: 'Data Intelligence',
        desc: 'Analyzes data patterns, generates insights, and forecasts trends.',
        gradient: 'from-indigo-500 to-purple-600',
        status: 'idle',
        capabilities: ['Data analysis', 'Pattern recognition', 'Trend forecasting', 'Report generation'],
        stats: { tasksCompleted: 78, uptime: '0m', lastActive: '6h ago' }
    },
];

// Animated avatar ring based on status
function AgentAvatar({ agent, size = 'lg' }: { agent: Agent; size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-16 h-16 text-3xl',
        md: 'w-20 h-20 text-4xl',
        lg: 'w-24 h-24 text-5xl'
    }[size];

    return (
        <div className="relative">
            {/* Pulse ring for active agents */}
            {agent.status === 'active' && (
                <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${agent.gradient}`}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            {/* Thinking animation */}
            {agent.status === 'thinking' && (
                <motion.div
                    className={`absolute inset-0 rounded-2xl border-2 border-cyan-400`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{ borderStyle: 'dashed' }}
                />
            )}

            {/* Main avatar */}
            <motion.div
                className={`${sizeClasses} rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-lg relative z-10`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={agent.status === 'thinking' ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: agent.status === 'thinking' ? Infinity : 0 }}
            >
                {agent.emoji}
            </motion.div>

            {/* Status dot */}
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0a0a0f] z-20 ${agent.status === 'active' ? 'bg-green-400 shadow-lg shadow-green-500/50' :
                agent.status === 'thinking' ? 'bg-cyan-400 animate-pulse shadow-lg shadow-cyan-500/50' :
                    agent.status === 'queued' ? 'bg-yellow-400' :
                        'bg-gray-500'
                }`} />
        </div>
    );
}

export default function AgentsPage() {
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [deployingAgent, setDeployingAgent] = useState<string | null>(null);
    const [agentsList, setAgentsList] = useState(agents);
    const [showDeployModal, setShowDeployModal] = useState(false);
    const [deployTask, setDeployTask] = useState('');

    const activeCount = agentsList.filter(a => a.status === 'active').length;
    const thinkingCount = agentsList.filter(a => a.status === 'thinking').length;

    async function deployAgent(agentId: string, task: string) {
        // Update agent to thinking state
        setAgentsList(prev => prev.map(a =>
            a.id === agentId ? { ...a, status: 'thinking' as const } : a
        ));
        setDeployingAgent(agentId);
        setShowDeployModal(false);

        // Simulate deployment (in real app, would call LuxRig)
        setTimeout(() => {
            setAgentsList(prev => prev.map(a =>
                a.id === agentId ? {
                    ...a,
                    status: 'active' as const,
                    stats: { ...a.stats, tasksCompleted: a.stats.tasksCompleted + 1, lastActive: 'Now' }
                } : a
            ));
            setDeployingAgent(null);
        }, 3000);
    }

    return (
        <div className="min-h-screen pb-20 relative overflow-hidden">
            <PageBackground color="green" />

            {/* Header */}
            <section className="container-main py-12">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-sm font-medium">{activeCount} AGENTS ONLINE</span>
                        {thinkingCount > 0 && (
                            <>
                                <span className="text-gray-600">•</span>
                                <span className="text-cyan-400 text-sm">{thinkingCount} THINKING</span>
                            </>
                        )}
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">
                        Agent <span className="text-gradient">Headquarters</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Your autonomous AI workforce. Deploy agents to tasks and watch them work.
                    </p>
                </motion.div>
            </section>

            {/* Main Layout Grid */}
            <div className="w-full max-w-[1800px] mx-auto px-4 md:px-6 mt-8">
                <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_280px] gap-6 items-start">

                    {/* Left Sidebar: Group Chat */}
                    <div className="hidden xl:block sticky top-24">
                        <Link href="/meeting">
                            <motion.div
                                className="glass-card relative overflow-hidden p-6 cursor-pointer group h-full border border-indigo-500/30 hover:border-indigo-500/50"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                {/* Hover Glow Effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>

                                <div className="relative z-10 flex flex-col items-center text-center gap-4 mb-2">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg shadow-indigo-900/20">
                                        👥
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-indigo-400 transition-colors">Group Chat</h3>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Choose your agents</p>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-xs text-center relative z-10 mt-4 leading-relaxed">
                                    Convene a meeting with Architect, Security, and QA agents to debate topics.
                                </p>
                            </motion.div>
                        </Link>
                    </div>

                    {/* Center Column: Deploy & Agents */}
                    <div className="space-y-6 min-w-0">
                        {/* Quick Deploy Bar */}
                        <motion.div
                            className="glass-card flex items-center gap-4 p-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex -space-x-3 shrink-0">
                                {agentsList.filter(a => a.status === 'active').slice(0, 4).map(agent => (
                                    <div key={agent.id} className={`w-10 h-10 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-lg border-2 border-[#0a0a0f]`}>
                                        {agent.emoji}
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Describe a task to deploy agents..."
                                    value={deployTask}
                                    onChange={(e) => setDeployTask(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-cyan-500/50 focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={() => setShowDeployModal(true)}
                                disabled={!deployTask.trim()}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50 text-sm px-4 py-2"
                            >
                                <Zap size={16} />
                                Deploy
                            </button>
                        </motion.div>

                        {/* Agents Grid */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                        >
                            {agentsList.map((agent) => (
                                <motion.div
                                    key={agent.id}
                                    className="glass-card relative overflow-hidden group cursor-pointer flex flex-col"
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    whileHover={{ y: -5 }}
                                    onClick={() => setSelectedAgent(agent)}
                                >
                                    {/* Hover Glow Effect */}
                                    <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>

                                    <div className="relative z-10 flex flex-col flex-1">
                                        {/* Agent avatar */}
                                        <div className="flex justify-center mb-4 mt-2">
                                            <AgentAvatar agent={agent} size="md" />
                                        </div>

                                        <h3 className="text-xl font-bold text-center mb-1">{agent.name}</h3>
                                        <p className="text-cyan-400 text-xs text-center mb-3 uppercase tracking-wider">{agent.role}</p>
                                        <p className="text-gray-400 text-xs text-center mb-4 line-clamp-2 px-2 h-8">{agent.desc}</p>

                                        {/* Capabilities preview */}
                                        <div className="flex flex-wrap justify-center gap-1.5 mb-4 px-2">
                                            {agent.capabilities.slice(0, 3).map((cap) => (
                                                <span key={cap} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[10px] text-gray-400">
                                                    {cap}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5 mt-auto">
                                            <div className="text-center">
                                                <p className="text-base font-bold text-cyan-400">{agent.stats.tasksCompleted}</p>
                                                <p className="text-[10px] text-gray-500 uppercase">Tasks</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-base font-bold text-purple-400">{agent.stats.uptime}</p>
                                                <p className="text-[10px] text-gray-500 uppercase">Uptime</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-medium text-gray-300 mt-1">{agent.stats.lastActive}</p>
                                                <p className="text-[10px] text-gray-500 uppercase">Active</p>
                                            </div>
                                        </div>

                                        {/* Quick actions on hover */}
                                        <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-4 left-4 right-4 bg-[#0a0a0f]/90 backdrop-blur-md p-1 rounded-lg border border-white/10">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedAgent(agent); setShowDeployModal(true); }}
                                                className="flex-1 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 rounded text-cyan-400 text-xs font-bold flex items-center justify-center gap-1"
                                            >
                                                <Play size={12} /> DEPLOY
                                            </button>
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="py-1.5 px-3 bg-white/10 hover:bg-white/20 rounded text-gray-300"
                                            >
                                                <MessageCircle size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Mobile Special Ops (Only on < XL) */}
                        <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                            <Link href="/meeting">
                                <motion.div className="glass-card relative overflow-hidden p-6 hover:border-indigo-500/50 group h-full">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center text-2xl">👥</div>
                                        <div>
                                            <h3 className="text-lg font-bold">Group Chat</h3>
                                            <p className="text-xs text-gray-500 uppercase">Choose your agents</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400">Convene a meeting with Architect, Security, and QA agents.</p>
                                </motion.div>
                            </Link>
                            <Link href="/voice">
                                <motion.div className="glass-card relative overflow-hidden p-6 hover:border-red-500/50 group h-full">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center text-2xl">🎙️</div>
                                        <div>
                                            <h3 className="text-lg font-bold">Voice Control</h3>
                                            <p className="text-xs text-gray-500 uppercase">God Mode</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400">Execute system commands using voice control.</p>
                                </motion.div>
                            </Link>
                        </div>
                    </div>

                    {/* Right Sidebar: Voice Control */}
                    <div className="hidden xl:block sticky top-24">
                        <Link href="/voice">
                            <motion.div
                                className="glass-card relative overflow-hidden p-6 cursor-pointer group h-full border border-red-500/30 hover:border-red-500/50"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                {/* Hover Glow Effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>

                                <div className="relative z-10 flex flex-col items-center text-center gap-4 mb-2">
                                    <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg shadow-red-900/20">
                                        🎙️
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-red-400 transition-colors">Voice Control</h3>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">God Mode</p>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-xs text-center relative z-10 mt-4 leading-relaxed">
                                    Execute system commands, launch studios, and control the rig using voice commands.
                                </p>
                            </motion.div>
                        </Link>
                    </div>

                </div>
            </div>

            {/* Agent Detail Modal */}
            <AnimatePresence>
                {selectedAgent && !showDeployModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedAgent(null)}
                    >
                        <motion.div
                            className="glass-card max-w-lg w-full"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <AgentAvatar agent={selectedAgent} size="sm" />
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold">{selectedAgent.name}</h3>
                                    <p className="text-cyan-400">{selectedAgent.role}</p>
                                </div>
                                <button
                                    className="text-gray-400 hover:text-white p-1"
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
                                <button
                                    onClick={() => setShowDeployModal(true)}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    <Play size={18} />
                                    Deploy Agent
                                </button>
                                <Link href="/chat" className="btn-outline flex-1 flex items-center justify-center gap-2">
                                    <MessageCircle size={18} />
                                    Chat
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Deploy Modal */}
            <AnimatePresence>
                {showDeployModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeployModal(false)}
                    >
                        <motion.div
                            className="glass-card max-w-md w-full"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Zap className="text-cyan-400" size={24} />
                                Deploy Agent
                            </h3>

                            {selectedAgent ? (
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mb-4">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedAgent.gradient} flex items-center justify-center text-xl`}>
                                        {selectedAgent.emoji}
                                    </div>
                                    <div>
                                        <div className="font-medium">{selectedAgent.name}</div>
                                        <div className="text-sm text-gray-400">{selectedAgent.role}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-400 mb-2">Select Agent</label>
                                </div>
                            )}

                            <label className="block text-sm text-gray-400 mb-2">Task Description</label>
                            <textarea
                                value={deployTask}
                                onChange={(e) => setDeployTask(e.target.value)}
                                placeholder="Describe what you want the agent to do..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 h-24 resize-none focus:border-cyan-500/50 focus:outline-none mb-4"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeployModal(false)}
                                    className="btn-outline flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => selectedAgent && deployAgent(selectedAgent.id, deployTask)}
                                    disabled={!deployTask.trim() || !selectedAgent}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Zap size={18} />
                                    Deploy
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back link */}
            <div className="container-main pt-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}
