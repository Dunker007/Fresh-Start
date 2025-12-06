'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    Zap, Target, BookOpen,
    CheckCircle, Circle, AlertCircle,
    Music, Video, ShoppingBag, Mic, Printer, TrendingUp
} from 'lucide-react';
import { storage, LUXRIG_BRIDGE_URL } from '@/lib/utils';
import RevenueAgentWidget from '@/components/RevenueAgentWidget';
import RevenueTracker from '@/components/RevenueTracker';
import PageBackground from '@/components/PageBackground';

// --- Data Models ---

interface IncomeStream {
    id: string;
    title: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    potential: string;
    startupCost: string;
    description: string;
    icon: any;
    steps: { text: string; completed: boolean }[];
    status: 'locked' | 'active' | 'completed';
    howItWorks?: string;
}

const STREAM_TEMPLATES: IncomeStream[] = [
    {
        id: 'youtube-music',
        title: 'AI Music Channel',
        category: 'Tier 1: Foundation',
        difficulty: 'Easy',
        potential: '$10-500/mo',
        startupCost: '$0',
        description: 'Create a 24/7 LoFi/Ambient radio or upload daily music videos using ToneLab.',
        icon: Video,
        howItWorks: "You upload consistent videos. YouTube places ads on them. You get ~55% of the ad revenue once monetized.",
        steps: [
            { text: 'Create YouTube Brand Account', completed: false },
            { text: 'Generate 5 tracks in ToneLab', completed: false },
            { text: 'Create visuals in Neural Frames', completed: false },
            { text: 'Upload first video with SEO tags', completed: false },
            { text: 'Schedule 3 more videos', completed: false }
        ],
        status: 'active'
    },
    {
        id: 'spotify-royalties',
        title: 'Streaming Royalties',
        category: 'Tier 1: Foundation',
        difficulty: 'Medium',
        potential: '$0.004/stream',
        startupCost: 'Free / $20yr',
        description: 'Distribute your best AI tracks to Spotify, Apple Music, and more.',
        icon: Music,
        howItWorks: "Distributors send your music to Spotify/Apple. You earn per stream. 1M streams ≈ $3,000 - $5,000.",
        steps: [
            { text: 'Sign up for DistroKid or Amuse (Free)', completed: false },
            { text: 'Export High-Quality Audio from Suno', completed: false },
            { text: 'Create Album Art (DLX Art Studio)', completed: false },
            { text: 'Submit first single for distribution', completed: false },
            { text: 'Claim Spotify for Artists profile', completed: false }
        ],
        status: 'locked'
    },
    {
        id: 'print-demand',
        title: 'Etsy Merch Store',
        category: 'Tier 2: Content',
        difficulty: 'Medium',
        potential: '$50-500/mo',
        startupCost: '$0.20/listing',
        description: 'Higher margin custom store using Etsy + Printful integration.',
        icon: ShoppingBag,
        howItWorks: "You create the listing on Etsy. When a sale happens, Printful automatically prints and ships it. You keep the profit (Sales Price - Print Cost). You handle customer service.",
        steps: [
            { text: 'Create Etsy Seller Account', completed: false },
            { text: 'Connect Printful/Printify', completed: false },
            { text: 'Generate 10 niche designs (Midjourney/Dall-E)', completed: false },
            { text: 'Create product mockups', completed: false },
            { text: 'Publish 5 listings with SEO keywords', completed: false }
        ],
        status: 'locked'
    },
    {
        id: 'pod-farm',
        title: 'Redbubble / TPOD',
        category: 'Tier 2: Content',
        difficulty: 'Easy',
        potential: '$20-200/mo',
        startupCost: '$0',
        description: 'Zero-overhead Print on Demand. Updates CafePress, Redbubble, TeePublic.',
        icon: ShoppingBag,
        howItWorks: "Exactly! You upload the graphic once. When someone buys a shirt/mug, the platform prints it, ships it, and answers customer emails. You just get a royalty check (usually 15-20%). True passive income.",
        steps: [
            { text: 'Create Redbubble Account', completed: false },
            { text: 'Create TeePublic/CafePress Account', completed: false },
            { text: 'Generate 20 simple text/graphic designs', completed: false },
            { text: 'Bulk upload to all platforms', completed: false },
            { text: 'Add 15+ relevant tags per design', completed: false }
        ],
        status: 'locked'
    },
    {
        id: '3d-print-farm',
        title: 'Closet 3D Farm',
        category: 'Tier 1: Hardware',
        difficulty: 'Medium',
        potential: '$50-500/mo',
        startupCost: '$25 (Filament)',
        description: 'Resurrect your old printer. Turn cheap plastic into high-value niche parts.',
        icon: Printer,
        howItWorks: "You own the factory! 1kg of filament costs $20. You can print $200+ worth of small parts (knobs, brackets, toys) from that one roll. 10x ROI.",
        steps: [
            { text: 'Dust off printer & perform bed leveling', completed: false },
            { text: 'Buy fresh PLA+ (Matte finish looks premium)', completed: false },
            { text: 'Print a "Benchy" to verify calibration', completed: false },
            { text: 'Find commercial-use models (Printables/Thangs)', completed: false },
            { text: 'List "Custom Lithophanes" on FB Marketplace', completed: false }
        ],
        status: 'active'
    },
    {
        id: 'voice-service',
        title: 'Voiceover Services',
        category: 'Tier 3: Services',
        difficulty: 'Medium',
        potential: '$20-100/gig',
        startupCost: '$5/mo',
        description: 'Offer AI narrations for audiobooks, intros, and ads using ElevenLabs.',
        icon: Mic,
        howItWorks: "You list your voice. Client sends script. You generate audio. You get paid per project.",
        steps: [
            { text: 'Create Fiverr Seller Account', completed: false },
            { text: 'Set up ElevenLabs subscription', completed: false },
            { text: 'Generate 3 diverse voice samples', completed: false },
            { text: 'Create Gig banner and description', completed: false },
            { text: 'Respond to first inquiry', completed: false }
        ],
        status: 'locked'
    },
    {
        id: 'laser-lab',
        title: 'Laser Engraving Lab',
        category: 'Tier 4: Future Hardware',
        difficulty: 'Hard',
        potential: '$50-100/unit',
        startupCost: '$500+',
        description: 'High-margin physical customization. Buy blanks ($7), sell custom engraved ($50).',
        icon: Zap,
        howItWorks: "You buy a laser (Fiber/CO2). You buy cheap blanks (tumblers, slate, leather). You burn custom designs. The perceived value transforms a $5 item into a $50 gift.",
        steps: [
            { text: 'Research Fiber (Metal) vs CO2 (Wood/Acrylic)', completed: false },
            { text: 'Scout FB Marketplace for used xTool/OmTech', completed: false },
            { text: 'Design 5 vector templates in Illustrator/Inkscape', completed: false },
            { text: 'Source bulk blanks (Alibaba/JDS)', completed: false },
            { text: 'Setup ventilation & safety workspace', completed: false },
            { text: 'Launch "Custom Crypto Merch" store', completed: false }
        ],
        status: 'locked'
    }
];

export default function IncomeLabPage() {
    // --- State ---
    const [streams, setStreams] = useState<IncomeStream[]>(STREAM_TEMPLATES);
    const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
    const [generatorData, setGeneratorData] = useState<any>(null);
    const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
    const [stats, setStats] = useState({
        monthly: 0,
        active: 1,
        projected: 450
    });

    // Load progress from local storage
    useEffect(() => {
        const saved = storage.get('DLX-income-streams', null);
        if (saved && Array.isArray(saved)) {
            // Merge saved state with templates to preserve icons components
            const merged = STREAM_TEMPLATES.map(template => {
                const savedStreams = saved as any[];
                const savedStream = savedStreams.find((s: any) => s.id === template.id);
                if (savedStream) {
                    return {
                        ...template,
                        steps: savedStream.steps,
                        status: savedStream.status
                    };
                }
                return template;
            });
            setStreams(merged);
        }
    }, []);

    // Save progress
    useEffect(() => {
        localStorage.setItem('DLX-income-streams', JSON.stringify(streams));
    }, [streams]);

    const selectedStream = streams.find(s => s.id === selectedStreamId) || streams[0];

    // Toggle step completion
    const toggleStep = (streamId: string, stepIndex: number) => {
        setStreams(prev => prev.map(s => {
            if (s.id !== streamId) return s;
            const newSteps = [...s.steps];
            newSteps[stepIndex].completed = !newSteps[stepIndex].completed;

            // Check if all completed
            if (newSteps.every(step => step.completed) && s.status === 'active') {
                // Could unlock next tier here
            }
            return { ...s, steps: newSteps };
        }));
    };

    const activateStream = (streamId: string) => {
        setStreams(prev => prev.map(s =>
            s.id === streamId ? { ...s, status: 'active' } : s
        ));
    };

    // --- Generator Logic ---
    const generatePODAssets = async (niche: string) => {
        setIsGeneratingAsset(true);
        try {
            const response = await fetch(`${LUXRIG_BRIDGE_URL}/llm/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are a Print-on-Demand expert. return ONLY JSON. Format: { "titles": ["string"], "description": "string", "tags": "string (comma separated)", "prompts": ["string"] }' },
                        { role: 'user', content: `Generate 5 witty/punny t-shirt titles, a compelling description, 20 high-traffic separate tags, and 3 Midjourney image prompts for the niche: "${niche}".` }
                    ]
                })
            });
            const data = await response.json();
            // Handle markdown code blocks in response
            let cleanJson = data.content.replace(/```json/g, '').replace(/```/g, '').trim();
            setGeneratorData(JSON.parse(cleanJson));
        } catch (error) {
            console.error('Generation failed:', error);
            alert('AI Generation failed. Check LuxRig connection.');
        } finally {
            setIsGeneratingAsset(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden text-white">
            <PageBackground color="green" />

            {/* Header */}
            <div className="container-main py-8 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Zap className="text-green-400" size={32} />
                            <span>Income<span className="text-green-400">Lab</span></span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Autonomous Revenue Generation & Guided Workflows</p>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Monthly Income</div>
                        <div className="text-2xl font-bold text-green-400">${stats.monthly}</div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4">
                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Active Streams</div>
                        <div className="text-2xl font-bold text-white">{streams.filter(s => s.status === 'active').length}</div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4">
                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Projected (Mo)</div>
                        <div className="text-2xl font-bold text-cyan-400">${stats.projected}</div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Target size={20} className="text-purple-400" />
                        </div>
                        <div className="text-sm">
                            <div className="font-bold">Next Goal</div>
                            <div className="text-gray-400">$1,000/mo</div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Revenue Command & Agent */}
                    <div className="lg:col-span-1 space-y-6">
                        <RevenueTracker
                            monthly={stats.monthly}
                            projected={stats.projected}
                            activeStreams={streams.filter(s => s.status === 'active').length}
                        />

                        <RevenueAgentWidget />

                        <div className="glass-card p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <AlertCircle size={18} className="text-yellow-400" />
                                Anti-Scam Protocols
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li className="flex gap-2">
                                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                                    No "Get Rich Quick" schemes
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                                    No Upfront Fees &gt; $50
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                                    Verified Platforms Only
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right: Guided Workflows */}
                    <div className="lg:col-span-2">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <BookOpen className="text-cyan-400" size={24} />
                                Active Blueprints
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {streams.map((stream) => {
                                const isSelected = selectedStreamId === stream.id || (!selectedStreamId && stream.id === streams[0].id);
                                const progress = Math.round((stream.steps.filter(s => s.completed).length / stream.steps.length) * 100);

                                return (
                                    <motion.div
                                        key={stream.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => setSelectedStreamId(stream.id)}
                                        className={`glass-card relative overflow-hidden transition-all cursor-pointer ${isSelected ? 'ring-2 ring-cyan-500/50 bg-white/5' : 'hover:bg-white/5'
                                            }`}
                                    >
                                        {/* Status Strip */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${stream.status === 'active' ? 'bg-green-500' : 'bg-gray-700'
                                            }`} />

                                        <div className="p-6 pl-8">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stream.status === 'active' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-500'
                                                        }`}>
                                                        <stream.icon size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">{stream.title}</h3>
                                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">{stream.category}</span>
                                                            <span>•</span>
                                                            <span className="text-green-400">{stream.potential}</span>
                                                            <span>•</span>
                                                            <span>{stream.difficulty}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {stream.status !== 'active' ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            activateStream(stream.id);
                                                        }}
                                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        Start Project
                                                    </button>
                                                ) : (
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-cyan-400">{progress}%</div>
                                                        <div className="text-xs text-gray-500">Completed</div>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-gray-400 text-sm mb-6 pl-16 max-w-2xl">
                                                {stream.description}
                                            </p>

                                            {/* ACTIVE TOOL AREA: POD Farm */}
                                            <AnimatePresence>
                                                {isSelected && stream.id === 'pod-farm' && stream.status === 'active' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="pl-16 mb-8 pr-4"
                                                    >
                                                        <div className="bg-[#0a0a0f] border border-cyan-500/30 rounded-xl p-5 relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                                                <Zap size={100} />
                                                            </div>
                                                            <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                                                                <Zap size={16} /> Asset Generator
                                                            </h4>
                                                            <p className="text-xs text-gray-400 mb-4">
                                                                Stop thinking. Let the AI generate your titles, tags, and descriptions for Redbubble.
                                                            </p>

                                                            {!generatorData ? (
                                                                <div className="flex gap-2 relative z-10">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Enter a niche (e.g. 'Introverted Accountants')"
                                                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-cyan-500 outline-none"
                                                                        id="pod-niche-input"
                                                                    />
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const input = document.getElementById('pod-niche-input') as HTMLInputElement;
                                                                            if (input?.value) generatePODAssets(input.value);
                                                                        }}
                                                                        disabled={isGeneratingAsset}
                                                                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 min-w-[140px] justify-center"
                                                                    >
                                                                        {isGeneratingAsset ? (
                                                                            <span className="animate-pulse">Dreaming...</span>
                                                                        ) : (
                                                                            <>
                                                                                <Zap size={14} /> Generate
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 relative z-10">
                                                                    <div>
                                                                        <div className="text-xs font-bold text-gray-500 uppercase mb-1">Titles / Slogans</div>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {generatorData.titles?.map((t: string, i: number) => (
                                                                                <button key={i} onClick={() => navigator.clipboard.writeText(t)} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-cyan-300 transition-colors">
                                                                                    {t}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs font-bold text-gray-500 uppercase mb-1">Optimized Tags (Copy All)</div>
                                                                        <div
                                                                            onClick={() => navigator.clipboard.writeText(generatorData.tags)}
                                                                            className="p-3 bg-black/30 border border-white/10 rounded text-xs text-gray-400 font-mono cursor-pointer hover:border-cyan-500/50 transition-colors break-words"
                                                                        >
                                                                            {generatorData.tags}
                                                                        </div>
                                                                    </div>
                                                                    <button onClick={(e) => { e.stopPropagation(); setGeneratorData(null); }} className="text-xs text-gray-500 hover:text-white underline">
                                                                        Reset / New Niche
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Expanded Steps */}
                                            <AnimatePresence>
                                                {isSelected && stream.status === 'active' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="pl-16 border-t border-white/5 pt-4"
                                                    >
                                                        {stream.howItWorks && (
                                                            <div className="mb-6 p-4 bg-cyan-900/10 border border-cyan-500/20 rounded-lg">
                                                                <h4 className="text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider">How This Makes Money</h4>
                                                                <p className="text-sm text-gray-300 leading-relaxed">
                                                                    {stream.howItWorks}
                                                                </p>
                                                            </div>
                                                        )}

                                                        <h4 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Launch Checklist</h4>
                                                        <div className="space-y-3">
                                                            {stream.steps.map((step, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${step.completed ? 'bg-green-500/10 text-green-200' : 'bg-black/20 text-gray-400 hover:bg-black/40'
                                                                        }`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleStep(stream.id, idx);
                                                                    }}
                                                                >
                                                                    {step.completed ? (
                                                                        <CheckCircle size={20} className="text-green-500 shrink-0" />
                                                                    ) : (
                                                                        <Circle size={20} className="text-gray-600 shrink-0" />
                                                                    )}
                                                                    <span className={step.completed ? 'line-through opacity-70' : ''}>
                                                                        {step.text}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {progress === 100 && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-between"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black font-bold">✓</div>
                                                                    <div>
                                                                        <div className="font-bold text-green-400">Stream Launched!</div>
                                                                        <div className="text-sm text-green-200/70">Keep consistent and monitor results.</div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
