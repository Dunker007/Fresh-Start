'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LUXRIG_BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://localhost:3456';

interface TranscriptEntry {
    id: number;
    speaker: string;
    speakerId: string;
    text: string;
    timestamp: string;
}

interface MeetingState {
    isActive: boolean;
    topic: string | null;
    round: number;
    transcript: TranscriptEntry[];
    currentSpeaker: string | null;
    consensus: string | null;
    personas: Record<string, { name: string; role: string; color: string }>;
}

export default function MeetingRoom() {
    const [state, setState] = useState<MeetingState | null>(null);
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Poll for status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${LUXRIG_BRIDGE_URL}/agents/execute`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        agentType: 'staff-meeting',
                        task: { action: 'get-status' }
                    })
                });
                const data = await res.json();
                if (data.result) {
                    setState(data.result);
                }
            } catch (error) {
                console.error('Failed to fetch meeting status:', error);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 1000); // Poll every second for live feel
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [state?.transcript]);

    const startMeeting = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            await fetch(`${LUXRIG_BRIDGE_URL}/agents/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentType: 'staff-meeting',
                    task: { action: 'start-meeting', topic }
                })
            });
        } catch (error) {
            console.error('Failed to start meeting:', error);
        } finally {
            setLoading(false);
        }
    };

    const stopMeeting = async () => {
        try {
            await fetch(`${LUXRIG_BRIDGE_URL}/agents/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentType: 'staff-meeting',
                    task: { action: 'stop-meeting' }
                })
            });
        } catch (error) {
            console.error('Failed to stop meeting:', error);
        }
    };

    if (!state) return <div className="p-8 text-center">Connecting to Staff Meeting...</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
            {/* Header / Controls */}
            <div className="glass p-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gradient">AI Staff Meeting</h1>
                    <p className="text-xs text-gray-400">Collaborative Architecture & Debate</p>
                </div>

                {!state.isActive && !state.consensus ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Enter discussion topic..."
                            className="bg-white/5 border border-white/10 rounded px-3 py-2 w-64 focus:outline-none focus:border-cyan-500"
                        />
                        <button
                            onClick={startMeeting}
                            disabled={loading || !topic}
                            className="btn-primary"
                        >
                            {loading ? 'Starting...' : 'Start Meeting'}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="animate-pulse text-red-500">●</span>
                            <span className="text-sm font-mono uppercase">Live Session</span>
                        </div>
                        <button onClick={stopMeeting} className="btn-outline text-xs py-2 px-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                            End Session
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                {/* Visual Room (Avatars) */}
                <div className="glass p-8 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-20" />

                    {/* Table */}
                    <div className="w-64 h-64 rounded-full border-4 border-white/5 relative flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-white/5 blur-xl absolute" />

                        {/* Topic Center */}
                        <div className="text-center z-10 max-w-[150px]">
                            <div className="text-xs text-gray-500 uppercase mb-1">Current Topic</div>
                            <div className="font-bold text-cyan-400 line-clamp-3">
                                {state.topic || 'Waiting for topic...'}
                            </div>
                        </div>

                        {/* Agents */}
                        {Object.entries(state.personas).map(([id, persona], i) => {
                            const isSpeaking = state.currentSpeaker === id; // use the key (id) from entries as the speaker identifier
                            // Position avatars in a circle
                            const angle = (i * (360 / Object.keys(state.personas).length)) - 90;
                            const radius = 160; // Distance from center
                            const x = Math.cos((angle * Math.PI) / 180) * radius;
                            const y = Math.sin((angle * Math.PI) / 180) * radius;

                            return (
                                <motion.div
                                    key={i}
                                    className="absolute flex flex-col items-center gap-2"
                                    style={{ x, y }}
                                    animate={{ scale: isSpeaking ? 1.2 : 1 }}
                                >
                                    <div
                                        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 ${isSpeaking ? 'border-white shadow-[0_0_30px_currentColor]' : 'border-white/20 grayscale'
                                            }`}
                                        style={{
                                            backgroundColor: `${persona.color}20`,
                                            borderColor: isSpeaking ? persona.color : undefined,
                                            color: persona.color
                                        }}
                                    >
                                        {i === 0 ? '🏗️' : i === 1 ? '🛡️' : '🧪'}
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-sm">{persona.name}</div>
                                        <div className="text-[10px] text-gray-400 uppercase">{persona.role}</div>
                                    </div>
                                    {isSpeaking && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute -top-8 bg-white text-black text-[10px] px-2 py-1 rounded-full whitespace-nowrap font-bold"
                                        >
                                            Speaking...
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Transcript */}
                <div className="glass flex flex-col lg:col-span-2 min-h-0">
                    <div className="p-4 border-b border-white/10 font-bold text-sm uppercase tracking-wider text-gray-400">
                        Meeting Transcript
                    </div>
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4"
                    >
                        <AnimatePresence>
                            {state.transcript.map((entry) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex gap-4 ${entry.speakerId === 'moderator' ? 'opacity-50' : ''}`}
                                >
                                    <div className="min-w-[80px] text-right">
                                        <div
                                            className="text-xs font-bold uppercase"
                                            style={{
                                                color: state.personas[entry.speakerId]?.color || '#888'
                                            }}
                                        >
                                            {entry.speaker}
                                        </div>
                                        <div className="text-[10px] text-gray-600">
                                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className={`text-sm leading-relaxed ${entry.speakerId === 'moderator' ? 'italic' : ''}`}>
                                        {entry.text}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {state.currentSpeaker && (
                            <div className="flex gap-4 opacity-50">
                                <div className="min-w-[80px] text-right">
                                    <div className="text-xs font-bold uppercase text-gray-500">...</div>
                                </div>
                                <div className="flex gap-1 items-center h-5">
                                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Consensus Report (if done) */}
            {state.consensus && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6 border-l-4 border-green-500"
                >
                    <h3 className="text-xl font-bold mb-4 text-green-400">✅ Final Consensus</h3>
                    <div className="prose prose-invert prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans">{state.consensus}</pre>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
