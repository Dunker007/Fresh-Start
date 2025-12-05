'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

// Income streams organized by effort level
const incomeStreams = {
    active: [
        { id: '1', name: 'AI Content Creation', monthly: '$450', status: 'active', type: 'content', effort: 'low', startup: '$0' },
        { id: '2', name: 'Print on Demand', monthly: '$125', status: 'active', type: 'ecommerce', effort: 'minimal', startup: '$0' },
        { id: '3', name: 'Affiliate Links (Blog)', monthly: '$85', status: 'active', type: 'affiliate', effort: 'minimal', startup: '$0' },
    ],
    pending: [
        { id: '4', name: 'Honeygain (Idle)', monthly: '$15', status: 'pending', type: 'idle', effort: 'none', startup: '$0' },
        { id: '5', name: 'API Wrapper Service', monthly: '$200', status: 'building', type: 'saas', effort: 'low', startup: '$20/mo' },
    ],
    ideas: [
        { id: '6', name: 'Local LLM API Service', monthly: '$500+', status: 'idea', type: 'saas', effort: 'medium', startup: '$0' },
        { id: '7', name: 'AI Newsletter', monthly: '$200+', status: 'idea', type: 'content', effort: 'low', startup: '$0' },
    ]
};

const quickStats = {
    totalMonthly: '$675',
    activeStreams: 3,
    pendingStreams: 2,
    ideasInPipeline: 12,
    costSavings: '$1,520',
    hoursPerWeek: 2,
};

const categories = [
    { name: 'Content Creation', icon: '✍️', desc: 'AI-assisted blogs, newsletters, social', avgMonthly: '$200-500' },
    { name: 'Print on Demand', icon: '👕', desc: 'Designs on products, zero inventory', avgMonthly: '$50-300' },
    { name: 'Digital Products', icon: '📦', desc: 'Templates, guides, courses', avgMonthly: '$100-1000' },
    { name: 'Affiliate Marketing', icon: '🔗', desc: 'Promote products you use', avgMonthly: '$50-500' },
    { name: 'Idle Computing', icon: '💻', desc: 'Monetize unused PC resources', avgMonthly: '$10-50' },
    { name: 'Micro SaaS', icon: '🚀', desc: 'Small tools for niche problems', avgMonthly: '$100-2000' },
    { name: 'API Services', icon: '🔌', desc: 'Wrap APIs, add value', avgMonthly: '$50-500' },
    { name: 'Automation Services', icon: '⚡', desc: 'Build automations for others', avgMonthly: '$200-1000' },
];

export default function IncomePage() {
    const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'ideas'>('all');

    const allStreams = [...incomeStreams.active, ...incomeStreams.pending, ...incomeStreams.ideas];
    const filteredStreams = filter === 'all' ? allStreams : incomeStreams[filter] || [];

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl md:text-5xl font-bold">
                                <span className="text-gradient">Passive Income</span>
                            </h1>
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                                💰 {quickStats.totalMonthly}/mo
                            </span>
                        </div>
                        <p className="text-gray-400">
                            AI-powered income opportunities • Low effort • Set & forget
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="container-main pb-8">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="text-2xl font-bold text-green-400">{quickStats.totalMonthly}</div>
                        <div className="text-xs text-gray-500">Monthly Income</div>
                    </motion.div>
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                        <div className="text-2xl font-bold text-cyan-400">{quickStats.activeStreams}</div>
                        <div className="text-xs text-gray-500">Active Streams</div>
                    </motion.div>
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="text-2xl font-bold text-yellow-400">{quickStats.pendingStreams}</div>
                        <div className="text-xs text-gray-500">Building</div>
                    </motion.div>
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <div className="text-2xl font-bold text-purple-400">{quickStats.ideasInPipeline}</div>
                        <div className="text-xs text-gray-500">Ideas Pipeline</div>
                    </motion.div>
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="text-2xl font-bold text-blue-400">{quickStats.costSavings}</div>
                        <div className="text-xs text-gray-500">LLM Savings</div>
                    </motion.div>
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <div className="text-2xl font-bold text-gray-400">{quickStats.hoursPerWeek}h</div>
                        <div className="text-xs text-gray-500">Weekly Effort</div>
                    </motion.div>
                </div>
            </section>

            {/* Quick Links */}
            <section className="container-main pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/income/ideas" className="glass-card hover:ring-2 hover:ring-cyan-500/50 group">
                        <div className="text-3xl mb-2">💡</div>
                        <h3 className="font-bold group-hover:text-cyan-400">Idea Generator</h3>
                        <p className="text-xs text-gray-500">AI finds opportunities</p>
                    </Link>
                    <Link href="/income/opportunities" className="glass-card hover:ring-2 hover:ring-cyan-500/50 group">
                        <div className="text-3xl mb-2">🎯</div>
                        <h3 className="font-bold group-hover:text-cyan-400">Opportunities</h3>
                        <p className="text-xs text-gray-500">Curated, vetted ideas</p>
                    </Link>
                    <Link href="/idle" className="glass-card hover:ring-2 hover:ring-cyan-500/50 group">
                        <div className="text-3xl mb-2">💻</div>
                        <h3 className="font-bold group-hover:text-cyan-400">Idle PC Income</h3>
                        <p className="text-xs text-gray-500">Monetize your hardware</p>
                    </Link>
                    <Link href="/income/tracker" className="glass-card hover:ring-2 hover:ring-cyan-500/50 group">
                        <div className="text-3xl mb-2">📊</div>
                        <h3 className="font-bold group-hover:text-cyan-400">Income Tracker</h3>
                        <p className="text-xs text-gray-500">Track all streams</p>
                    </Link>
                </div>
            </section>

            {/* Income Categories */}
            <section className="container-main pb-8">
                <h2 className="text-xl font-bold mb-4">📂 Income Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.name}
                            className="glass-card cursor-pointer hover:ring-2 hover:ring-cyan-500/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <span className="text-3xl">{cat.icon}</span>
                            <h3 className="font-bold mt-2">{cat.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">{cat.desc}</p>
                            <div className="text-sm text-green-400 mt-2">{cat.avgMonthly}/mo</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Active Streams */}
            <section className="container-main pb-16">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">📈 Your Income Streams</h2>
                    <div className="flex gap-2">
                        {(['all', 'active', 'pending', 'ideas'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded text-sm ${filter === f ? 'bg-cyan-500 text-black' : 'bg-white/10'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredStreams.map((stream) => (
                        <motion.div
                            key={stream.id}
                            className="glass-card flex items-center justify-between"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${stream.status === 'active' ? 'bg-green-500' :
                                        stream.status === 'pending' ? 'bg-yellow-500' :
                                            stream.status === 'building' ? 'bg-blue-500' :
                                                'bg-gray-500'
                                    }`}></div>
                                <div>
                                    <h3 className="font-medium">{stream.name}</h3>
                                    <div className="flex gap-2 text-xs text-gray-500">
                                        <span>{stream.type}</span>
                                        <span>•</span>
                                        <span>{stream.effort} effort</span>
                                        <span>•</span>
                                        <span>Startup: {stream.startup}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-green-400">{stream.monthly}</div>
                                <div className={`text-xs ${stream.status === 'active' ? 'text-green-400' :
                                        stream.status === 'building' ? 'text-blue-400' :
                                            'text-gray-500'
                                    }`}>{stream.status}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Principles */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-xl font-bold mb-4">🎯 Our Passive Income Principles</h2>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="flex gap-3">
                                <span className="text-green-400">✓</span>
                                <span><strong>Low startup cost</strong> - $0-50 to start</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-green-400">✓</span>
                                <span><strong>Set and forget</strong> - Automate everything</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-green-400">✓</span>
                                <span><strong>Leverage AI</strong> - Use LuxRig's power</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-green-400">✓</span>
                                <span><strong>Low maintenance</strong> - &lt;2 hours/week</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-red-400">✗</span>
                                <span><strong>No MLM</strong> - Ever</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-red-400">✗</span>
                                <span><strong>No surveys</strong> - Time wasters</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-red-400">✗</span>
                                <span><strong>No high risk</strong> - Protect capital</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-red-400">✗</span>
                                <span><strong>No crypto mining</strong> - See Crypto Lab</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Back link */}
            <div className="container-main py-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
