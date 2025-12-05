'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PageBackground from '@/components/PageBackground';

const labs = [
    { id: 'aura', icon: '✨', name: 'AURA Interface', desc: 'Advanced user response architecture for natural AI interactions.', status: 'active', color: 'cyan', href: null },
    { id: 'forge', icon: '🔨', name: 'Agent Forge', desc: 'Build and customize AI agents with visual tools.', status: 'preview', color: 'purple', href: '/agents' },
    { id: 'dataweave', icon: '🌐', name: 'Data Weave', desc: 'Connect and transform data from multiple sources.', status: 'active', color: 'green', href: null },
    { id: 'mindmap', icon: '🧠', name: 'Mind Map Lab', desc: 'WebGL-powered visual brainstorming with AI assistance.', status: 'active', color: 'pink', href: null },
    { id: 'codegen', icon: '💻', name: 'Code Generator', desc: 'AI-powered code generation and refactoring.', status: 'active', color: 'blue', href: '/playground' },
    { id: 'analytics', icon: '📊', name: 'Analytics Hub', desc: 'Real-time analytics and performance dashboards.', status: 'active', color: 'yellow', href: '/analytics' },
    { id: 'automation', icon: '⚡', name: 'Automation Lab', desc: 'Build and run automated workflows.', status: 'active', color: 'orange', href: '/workflows' },
    { id: 'vision', icon: '👁️', name: 'Vision Lab', desc: 'Image analysis and computer vision tools.', status: 'coming', color: 'red', href: null },
    { id: 'audio', icon: '🎵', name: 'Audio Lab', desc: 'Transcription, music analysis, and audio processing.', status: 'active', color: 'violet', href: '/voice' },
    { id: 'crypto', icon: '💎', name: 'Crypto Lab', desc: 'Solana Seeker, DeFi, and portfolio tracking.', status: 'active', color: 'teal', href: '/crypto' },
    { id: 'income', icon: '💸', name: 'Passive Income', desc: 'AI-powered income opportunities and tracking.', status: 'active', color: 'green', href: '/income' },
    { id: 'knowledge', icon: '📚', name: 'Knowledge Base', desc: 'AI-powered documentation and search.', status: 'preview', color: 'indigo', href: '/learn' },
];

const statusColors = {
    active: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-400' },
    preview: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-400' },
    coming: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', dot: 'bg-gray-400' },
};

export default function LabsPage() {
    const activeLabs = labs.filter(l => l.status === 'active').length;
    const previewLabs = labs.filter(l => l.status === 'preview').length;

    return (
        <div className="min-h-screen pt-8 relative overflow-hidden">
            <PageBackground color="indigo" />

            {/* Header */}
            <section className="section-padding pb-12">
                <div className="container-main">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex justify-center gap-3 mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                <span className="text-green-400 text-sm font-medium">{activeLabs} ACTIVE</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30">
                                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                <span className="text-purple-400 text-sm font-medium">{previewLabs} PREVIEW</span>
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            Labs <span className="text-glow-magenta">Hub</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Specialized AI laboratories for every need. Each lab provides focused
                            tools and capabilities for specific use cases.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Labs Grid */}
            <section className="pb-20">
                <div className="container-main">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial="initial"
                        animate="animate"
                        variants={{
                            animate: { transition: { staggerChildren: 0.07 } }
                        }}
                    >
                        {labs.map((lab) => {
                            const status = statusColors[lab.status as keyof typeof statusColors];
                            const CardContent = (
                                <motion.div
                                    key={lab.id}
                                    className="glass-card relative overflow-hidden cursor-pointer group h-full"
                                    variants={{
                                        initial: { opacity: 0, y: 20 },
                                        animate: { opacity: 1, y: 0 }
                                    }}
                                    whileHover={{ y: -5 }}
                                >
                                    {/* Status badge */}
                                    <div className="absolute top-4 right-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} border ${status.border}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${lab.status === 'active' ? 'animate-pulse' : ''}`}></span>
                                            {lab.status}
                                        </span>
                                    </div>

                                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                                        {lab.icon}
                                    </div>

                                    <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                                        {lab.name}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4">
                                        {lab.desc}
                                    </p>

                                    {lab.href ? (
                                        <span className="w-full btn-primary py-2 text-sm block text-center">
                                            Launch Lab →
                                        </span>
                                    ) : lab.status === 'active' ? (
                                        <button className="w-full btn-primary py-2 text-sm">
                                            Launch Lab
                                        </button>
                                    ) : lab.status === 'preview' ? (
                                        <button className="w-full btn-outline py-2 text-sm">
                                            Request Access
                                        </button>
                                    ) : (
                                        <button className="w-full py-2 text-sm text-gray-500 border border-gray-700 rounded-lg cursor-not-allowed">
                                            Coming Soon
                                        </button>
                                    )}

                                    {/* Hover glow */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                </motion.div>
                            );

                            return lab.href ? (
                                <Link key={lab.id} href={lab.href}>
                                    {CardContent}
                                </Link>
                            ) : (
                                <div key={lab.id}>{CardContent}</div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
