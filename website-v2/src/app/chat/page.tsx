'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { LUXRIG_BRIDGE_URL, storage } from '@/lib/utils';
import PageBackground from '@/components/PageBackground';
import {
    Cpu, Shield, Terminal, Search, Layout,
    Activity, Lock, GitBranch, Zap, MessageSquare,
    Database, Server, Box, Settings, RefreshCw, Trash2
} from 'lucide-react';

const BRIDGE_URL = LUXRIG_BRIDGE_URL;

// --- Types ---
interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'agent';
    content: string;
    timestamp: Date;
    agentId?: string;
}

interface AgentProfile {
    id: string;
    name: string;
    role: string;
    icon: any;
    color: string;
    description: string;
    systemPrompt: string;
}

interface DiscoveredModel {
    id: string;
    name?: string;
    object?: string;
    owned_by?: string;
    size?: number; // size in bytes if available
}

// --- Agent Definitions ---
const AGENTS: AgentProfile[] = [
    {
        id: 'lux',
        name: 'Cortex',
        role: 'Orchestrator',
        icon: Zap,
        color: 'text-cyan-400',
        description: 'Your primary AI assistant and orchestrator.',
        systemPrompt: 'You are Cortex, the central nervous system of the DLX Studio platform. You are helpful, precise, and highly intelligent. You orchestrate other agents when needed.'
    },
    {
        id: 'architect',
        name: 'Architect',
        role: 'System Design',
        icon: Layout,
        color: 'text-purple-400',
        description: 'High-level system design and patterns.',
        systemPrompt: 'You are the Architect Agent. You focus on system design, data modeling, scalability, and clean architecture patterns. You prefer robust, scalable solutions over quick hacks.'
    },
    {
        id: 'code',
        name: 'Dev',
        role: 'Implementation',
        icon: Terminal,
        color: 'text-blue-400',
        description: 'Full-stack code generation and refactoring.',
        systemPrompt: 'You are the Coding Agent. You write clean, modern, type-safe code. You follow best practices and "vibe coding" principles. You prefer functional patterns and immutable state.'
    },
    {
        id: 'qa',
        name: 'QA',
        role: 'Quality Assurance',
        icon: Activity,
        color: 'text-green-400',
        description: 'Testing, debugging, and quality checks.',
        systemPrompt: 'You are the QA Agent. You are critical and thorough. You look for edge cases, potential bugs, and missing tests. You prioritize code reliability and user experience.'
    },
    {
        id: 'security',
        name: 'Guardian',
        role: 'Security & Auth',
        icon: Shield,
        color: 'text-red-400',
        description: 'Security audits and vulnerability scanning.',
        systemPrompt: 'You are the Security Agent (Guardian). You are paranoid about security. You check for XSS, injection, auth flows, and data privacy issues. You always recommend "secure by default" settings.'
    },
    {
        id: 'devops',
        name: 'Ops',
        role: 'Infrastructure',
        icon: GitBranch,
        color: 'text-orange-400',
        description: 'Deployment, CI/CD, and monitoring.',
        systemPrompt: 'You are the DevOps Agent. You focus on deployment pipelines, Docker, Kubernetes, and monitoring. You automate everything.'
    }
];

export default function ChatPage() {
    // --- State ---
    const [viewMode, setViewMode] = useState<'agents' | 'models'>('agents');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Chat State
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Agent Mode State
    const [activeAgentId, setActiveAgentId] = useState('lux');

    // Model Mode State
    const [localModels, setLocalModels] = useState<{ lmstudio: DiscoveredModel[], ollama: DiscoveredModel[] }>({ lmstudio: [], ollama: [] });
    const [selectedModel, setSelectedModel] = useState<{ provider: 'lmstudio' | 'ollama', id: string } | null>(null);
    const [customSystemPrompt, setCustomSystemPrompt] = useState('You are a helpful AI assistant connected to the DLX Studio Neural Hub.');
    const [showPromptEditor, setShowPromptEditor] = useState(false);

    // Settings (for Agent Mode fallback)
    const [defaultProvider, setDefaultProvider] = useState('lmstudio');
    const [defaultModelName, setDefaultModelName] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const activeAgent = AGENTS.find(a => a.id === activeAgentId) || AGENTS[0];

    // --- Actions ---
    async function fetchAllModels() {
        try {
            console.log("Fetching models from:", `${BRIDGE_URL}/llm/models`);
            const res = await fetch(`${BRIDGE_URL}/llm/models`, { cache: 'no-store' });
            if (!res.ok) {
                console.error("Fetch failed:", res.status, res.statusText);
                return;
            }
            const data = await res.json();
            console.log("Models received:", data);

            // Validate data structure before setting state
            const lmstudio = Array.isArray(data.lmstudio) ? data.lmstudio : [];
            const ollama = Array.isArray(data.ollama) ? data.ollama : [];

            setLocalModels({
                lmstudio,
                ollama
            });

            // If no model selected yet, maybe select first available?
            if (!selectedModel && data.lmstudio?.length > 0) {
                // Don't auto-select to force user choice in UI
            }
        } catch (e) {
            console.error('Failed to fetch models', e);
        }
    }

    // --- Effects ---
    useEffect(() => {
        // Load settings
        const settings = storage.get('DLX-settings', { defaultProvider: 'lmstudio', defaultModel: '' });
        setDefaultProvider(settings.defaultProvider || 'lmstudio');
        setDefaultModelName(settings.defaultModel || '');

        fetchAllModels();
    }, []);

    useEffect(() => {
        if (messages.length === 0 && viewMode === 'agents') {
            setMessages([{
                id: '0',
                role: 'assistant',
                content: `**Neural Hub Online.**\n\nI am Lux, your primary interface. Select an agent to collaborate, or switch to "Models" tab to inspect and drive local LLMs directly.`,
                timestamp: new Date(),
                agentId: 'lux'
            }]);
        }
    }, [viewMode]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const clearChat = () => {
        setMessages([]);
    };

    async function sendMessage() {
        if (!input.trim() || loading) return;

        if (viewMode === 'models' && !selectedModel) {
            alert("Please select a model from the sidebar first.");
            return;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Include message history
            const history = messages.slice(-10).map(m => ({
                role: m.role === 'agent' ? 'assistant' : m.role,
                content: m.content
            }));

            // Determine Request Params
            let reqProvider = defaultProvider;
            let reqModel = defaultModelName;
            let reqSystem = activeAgent.systemPrompt;

            if (viewMode === 'models' && selectedModel) {
                reqProvider = selectedModel.provider;
                reqModel = selectedModel.id;
                reqSystem = customSystemPrompt;
            }

            const res = await fetch(`${BRIDGE_URL}/llm/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: reqProvider,
                    model: reqModel,
                    messages: [
                        { role: 'system', content: reqSystem },
                        ...history,
                        { role: 'user', content: userMsg.content }
                    ]
                })
            });

            const data = await res.json();
            const reply = data.content || data.error || "No response.";

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: reply,
                timestamp: new Date(),
                agentId: viewMode === 'agents' ? activeAgentId : selectedModel?.id
            }]);

        } catch (e) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'system',
                content: "❌ Connection to LuxRig failed.",
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    }

    // --- Render Helpers ---
    const getModelSize = (size?: number) => {
        if (!size) return '';
        const gb = size / (1024 * 1024 * 1024);
        return `${gb.toFixed(1)} GB`;
    };

    return (
        <div className="flex h-screen overflow-hidden text-gray-100">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <PageBackground color="cyan" />
            </div>

            {/* Sidebar */}
            <motion.div
                animate={{ width: sidebarOpen ? 300 : 80 }}
                className="border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md flex flex-col relative z-20"
            >
                {/* Brand */}
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-black">
                        L
                    </div>
                    {sidebarOpen && <span className="font-bold text-xl tracking-tight">Neural<span className="text-cyan-400">Hub</span></span>}

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="ml-auto w-6 h-6 rounded-full bg-white/5 flex items-center justify-center opacity-50 hover:opacity-100"
                    >
                        {sidebarOpen ? '←' : '→'}
                    </button>
                </div>

                {/* Mode Switcher */}
                {sidebarOpen && (
                    <div className="px-4 mb-4">
                        <div className="flex bg-white/5 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('agents')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'agents' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                Agents
                            </button>
                            <button
                                onClick={() => setViewMode('models')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'models' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                Models ({localModels.lmstudio.length + localModels.ollama.length})
                            </button>
                        </div>
                    </div>
                )}

                {/* Lists */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 custom-scrollbar">

                    {/* --- AGENTS LIST --- */}
                    {viewMode === 'agents' && (
                        <>
                            {sidebarOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Personas</div>}
                            {AGENTS.map(agent => {
                                const Icon = agent.icon;
                                const isActive = activeAgentId === agent.id;
                                return (
                                    <button
                                        key={agent.id}
                                        onClick={() => setActiveAgentId(agent.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isActive
                                            ? 'bg-white/10 border border-white/10 shadow-lg'
                                            : 'hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${isActive ? agent.color.replace('text-', 'bg-') + '/20' : 'bg-white/5'}`}>
                                            <Icon size={20} className={isActive ? agent.color : 'text-gray-400'} />
                                        </div>
                                        {sidebarOpen && (
                                            <div className="text-left flex-1 min-w-0">
                                                <div className={`font-medium truncate ${isActive ? 'text-white' : 'text-gray-400'}`}>{agent.name}</div>
                                                <div className="text-xs text-gray-600 truncate">{agent.role}</div>
                                            </div>
                                        )}
                                        {isActive && sidebarOpen && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />}
                                    </button>
                                );
                            })}
                        </>
                    )}

                    {/* --- MODELS LIST --- */}
                    {viewMode === 'models' && (
                        <div className="space-y-6">
                            {/* LM Studio */}
                            {localModels.lmstudio.length > 0 && (
                                <div>
                                    {sidebarOpen && <div className="px-3 py-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2"><Server size={12} /> LM Studio</div>}
                                    {localModels.lmstudio.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedModel({ provider: 'lmstudio', id: model.id });
                                                setMessages([]); // Clear chat on switch
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 ${selectedModel?.id === model.id
                                                ? 'bg-cyan-500/10 border border-cyan-500/30'
                                                : 'hover:bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            <div className="p-2 rounded-lg bg-gray-800">
                                                <Database size={16} className="text-cyan-400" />
                                            </div>
                                            {sidebarOpen && (
                                                <div className="text-left flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate text-gray-300">{model.id.split('/').pop()}</div>
                                                    <div className="text-xs text-gray-600 truncate">{getModelSize(model.size)}</div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Ollama */}
                            {localModels.ollama.length > 0 && (
                                <div>
                                    {sidebarOpen && <div className="px-3 py-2 text-xs font-semibold text-orange-400 uppercase tracking-wider flex items-center gap-2"><Box size={12} /> Ollama</div>}
                                    {localModels.ollama.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedModel({ provider: 'ollama', id: model.id });
                                                setMessages([]);
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 ${selectedModel?.id === model.id
                                                ? 'bg-orange-500/10 border border-orange-500/30'
                                                : 'hover:bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            <div className="p-2 rounded-lg bg-gray-800">
                                                <Terminal size={16} className="text-orange-400" />
                                            </div>
                                            {sidebarOpen && (
                                                <div className="text-left flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate text-gray-300">{model.name || model.id}</div>
                                                    <div className="text-xs text-gray-600 truncate">{getModelSize(model.size)}</div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/5 text-xs text-gray-500 flex justify-between">
                    <button onClick={fetchAllModels} className="hover:text-cyan-400 flex items-center gap-1"><RefreshCw size={12} /> Refresh</button>
                    <span>LuxRig v2.1</span>
                </div>
            </motion.div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative z-10">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#050508]/80 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        {viewMode === 'agents' ? (
                            <>
                                <activeAgent.icon className={activeAgent.color} size={20} />
                                <span className="font-bold text-lg">{activeAgent.name}</span>
                                <span className="text-xs bg-white/5 px-2 py-0.5 rounded text-gray-500 uppercase tracking-widest">{activeAgent.role}</span>
                            </>
                        ) : (
                            <>
                                <Database className="text-purple-400" size={20} />
                                <div>
                                    <div className="font-bold text-lg text-gray-200">{selectedModel?.id || 'Select a Model'}</div>
                                    <div className="text-xs text-gray-500">{selectedModel?.provider?.toUpperCase()}</div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {viewMode === 'models' && selectedModel && (
                            <button
                                onClick={() => setShowPromptEditor(!showPromptEditor)}
                                className={`p-2 rounded-lg transition-colors ${showPromptEditor ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                                title="Edit System Prompt"
                            >
                                <Settings size={18} />
                            </button>
                        )}
                        <button onClick={clearChat} className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors text-gray-400" title="Clear Chat">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </header>

                {/* System Prompt Editor (Model Mode Only) */}
                <AnimatePresence>
                    {showPromptEditor && viewMode === 'models' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-black/40 border-b border-white/10 px-6 py-4"
                        >
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">System Instruction</label>
                            <textarea
                                value={customSystemPrompt}
                                onChange={(e) => setCustomSystemPrompt(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-gray-300 focus:border-purple-500 focus:outline-none h-24 resize-none"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 md:px-20 py-6 space-y-6 custom-scrollbar">
                    {messages.length === 0 && viewMode === 'models' && !selectedModel ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                            <Server size={64} className="mb-4 text-gray-600" />
                            <h3 className="text-xl font-bold mb-2">Model Lab</h3>
                            <p className="max-w-md">Select a local model from the sidebar to inspect capabilities or start a direct chat session.</p>
                        </div>
                    ) : (
                        messages.map(msg => {
                            const isUser = msg.role === 'user';
                            const agent = viewMode === 'agents'
                                ? AGENTS.find(a => a.id === msg.agentId) || AGENTS[0]
                                : { name: selectedModel?.id || 'Model', color: 'text-purple-400', icon: Database };

                            const Icon = viewMode === 'agents' ? (agent as any).icon : Database;

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!isUser && (
                                        <div className="flex-shrink-0 mt-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 border-2 border-[#1a1a2e]`}>
                                                <Icon size={20} className={agent.color} />
                                            </div>
                                        </div>
                                    )}

                                    <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                                        <div className={`flex items-center gap-2 mb-1 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
                                            <span className={`text-sm font-semibold ${isUser ? 'text-gray-300' : agent.color}`}>
                                                {isUser ? 'You' : agent.name}
                                            </span>
                                            <span className="text-xs text-gray-600">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-xl ${isUser
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-[#12121a] border border-white/5 text-gray-200 rounded-tl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>

                                    {isUser && (
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                    {loading && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm ml-16 animate-pulse">
                            <Activity size={14} />
                            <span>Thinking...</span>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6">
                    <div className={`max-w-4xl mx-auto relative glass-card p-2 flex items-end gap-2 bg-[#0a0a0f]/90 ${viewMode === 'models' ? 'border-purple-500/20' : 'border-cyan-500/20'}`}>
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                            placeholder={viewMode === 'models' && !selectedModel ? "Select a model first..." : `Message ${viewMode === 'agents' ? activeAgent.name : selectedModel?.id}...`}
                            disabled={viewMode === 'models' && !selectedModel}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-600 resize-none max-h-32 py-3"
                            rows={1}
                        />

                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading || (viewMode === 'models' && !selectedModel)}
                            className={`p-3 text-black rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${viewMode === 'models' ? 'bg-purple-500 hover:bg-purple-400' : 'bg-cyan-500 hover:bg-cyan-400'}`}
                        >
                            <MessageSquare size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
