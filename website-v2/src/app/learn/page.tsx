'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const guides = [
    {
        id: 'getting-started',
        category: 'Basics',
        title: 'Getting Started with Local AI',
        description: 'Set up LM Studio and Ollama on your machine in 10 minutes.',
        duration: '10 min',
        difficulty: 'Beginner',
        icon: '🚀',
        steps: [
            'Download LM Studio from lmstudio.ai',
            'Install and launch LM Studio',
            'Download a model (recommended: Gemma 2 9B)',
            'Start the local server',
            'Connect from DLX Studio'
        ]
    },
    {
        id: 'vibe-coding',
        category: 'Workflow',
        title: 'Vibe Coding Like a Pro',
        description: 'Master the art of building with AI. Tips from 2025 veterans.',
        duration: '15 min',
        difficulty: 'Intermediate',
        icon: '💻',
        steps: [
            'Start with clear intent, not vague ideas',
            'Use multi-turn conversations, not one-shots',
            'Always review generated code before running',
            'Build incrementally, test frequently',
            'Keep context fresh - clear chat when stuck'
        ]
    },
    {
        id: 'prompt-engineering',
        category: 'Skills',
        title: 'Prompt Engineering That Works',
        description: 'Write prompts that get results. Real patterns from production.',
        duration: '20 min',
        difficulty: 'Intermediate',
        icon: '🎯',
        steps: [
            'Be specific about output format',
            'Provide examples (few-shot learning)',
            'Use chain-of-thought for complex tasks',
            'Set constraints and boundaries',
            'Iterate and refine based on outputs'
        ]
    },
    {
        id: 'multi-model',
        category: 'Advanced',
        title: 'Multi-Model Workflows',
        description: 'Route tasks to the right model. GPT for creative, Claude for code, local for privacy.',
        duration: '25 min',
        difficulty: 'Advanced',
        icon: '🔀',
        steps: [
            'Map task types to model strengths',
            'Use fast models for drafts, slow for polish',
            'Chain models for complex workflows',
            'Validate outputs across models',
            'Fall back gracefully when models fail'
        ]
    },
    {
        id: 'agents',
        category: 'Advanced',
        title: 'Building AI Agents',
        description: 'Create autonomous agents that can reason, plan, and execute.',
        duration: '30 min',
        difficulty: 'Advanced',
        icon: '🤖',
        steps: [
            'Define clear agent goals and constraints',
            'Give agents tools (search, code exec, file access)',
            'Implement planning and reflection loops',
            'Handle failures and retries gracefully',
            'Monitor and log agent actions'
        ]
    },
    {
        id: 'privacy',
        category: 'Security',
        title: 'Privacy-First AI',
        description: 'Keep your data local. When to use cloud vs local models.',
        duration: '15 min',
        difficulty: 'Beginner',
        icon: '🔒',
        steps: [
            'Use local models for sensitive data',
            'Avoid sending PII to cloud APIs',
            'Run inference on-device when possible',
            'Audit what data you share',
            'Use self-hosted solutions for production'
        ]
    },
];

const resources = [
    { title: 'LM Studio Docs', link: 'https://lmstudio.ai/docs', icon: '📖' },
    { title: 'Ollama Models', link: 'https://ollama.ai/library', icon: '🦙' },
    { title: 'Hugging Face Hub', link: 'https://huggingface.co/models', icon: '🤗' },
    { title: 'Prompt Engineering Guide', link: 'https://www.promptingguide.ai/', icon: '🎯' },
    { title: 'AI Snake Oil (critical thinking)', link: 'https://www.aisnakeoil.com/', icon: '🐍' },
    { title: 'The Batch (AI newsletter)', link: 'https://www.deeplearning.ai/the-batch/', icon: '📰' },
];

const difficultyColors = {
    Beginner: 'text-green-400',
    Intermediate: 'text-yellow-400',
    Advanced: 'text-red-400',
};

export default function LearnPage() {
    const [selectedGuide, setSelectedGuide] = useState<typeof guides[0] | null>(null);
    const [filter, setFilter] = useState('all');

    const categories = ['all', ...new Set(guides.map(g => g.category))];
    const filteredGuides = filter === 'all' ? guides : guides.filter(g => g.category === filter);

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
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            Learn <span className="text-gradient">AI</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Practical guides for building with AI. No fluff, just what works.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filter */}
            <section className="container-main pb-8">
                <div className="flex gap-2 flex-wrap">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === cat
                                    ? 'bg-cyan-500 text-black font-medium'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            {cat === 'all' ? 'All Guides' : cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Guides Grid */}
            <section className="container-main pb-16">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                >
                    {filteredGuides.map((guide) => (
                        <motion.div
                            key={guide.id}
                            className="glass-card cursor-pointer group"
                            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedGuide(guide)}
                        >
                            <div className="text-4xl mb-4">{guide.icon}</div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">{guide.category}</span>
                            <h3 className="text-xl font-bold mt-1 mb-2 group-hover:text-cyan-400 transition-colors">
                                {guide.title}
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">{guide.description}</p>

                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-500">⏱️ {guide.duration}</span>
                                <span className={difficultyColors[guide.difficulty as keyof typeof difficultyColors]}>
                                    {guide.difficulty}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Guide Modal */}
            {selectedGuide && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedGuide(null)}
                >
                    <motion.div
                        className="glass-card max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <span className="text-4xl">{selectedGuide.icon}</span>
                                <h2 className="text-2xl font-bold mt-2">{selectedGuide.title}</h2>
                                <p className="text-gray-400 mt-1">{selectedGuide.description}</p>
                            </div>
                            <button
                                className="text-gray-400 hover:text-white text-xl"
                                onClick={() => setSelectedGuide(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex gap-4 mb-6 text-sm">
                            <span className="px-3 py-1 bg-white/10 rounded-full">⏱️ {selectedGuide.duration}</span>
                            <span className={`px-3 py-1 rounded-full ${selectedGuide.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' : selectedGuide.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                {selectedGuide.difficulty}
                            </span>
                        </div>

                        <h3 className="font-bold mb-4">Steps</h3>
                        <ol className="space-y-3">
                            {selectedGuide.steps.map((step, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-sm">
                                        {i + 1}
                                    </span>
                                    <span className="text-gray-300">{step}</span>
                                </li>
                            ))}
                        </ol>

                        <div className="mt-8 pt-6 border-t border-gray-700">
                            <button className="btn-primary w-full">Start Guide</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Resources */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <h2 className="text-2xl font-bold mb-6">📚 Essential Resources</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {resources.map((resource) => (
                            <motion.a
                                key={resource.title}
                                href={resource.link}
                                target="_blank"
                                className="glass-card text-center py-4 group"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="text-2xl mb-2">{resource.icon}</div>
                                <div className="text-sm group-hover:text-cyan-400 transition-colors">{resource.title}</div>
                            </motion.a>
                        ))}
                    </div>
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
