'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const BRIDGE_URL = 'http://localhost:3456';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    model?: string;
}

const quickPrompts = [
    '💡 Give me a startup idea',
    '🐛 Debug this code',
    '📝 Write a blog post about',
    '🎨 Design a landing page for',
    '🔧 How do I fix',
    '📊 Analyze this data',
];

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [model, setModel] = useState('lmstudio');
    const [models, setModels] = useState<{ lmstudio: string[], ollama: string[] }>({ lmstudio: [], ollama: [] });
    const [selectedModel, setSelectedModel] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchModels();
        // Add welcome message
        setMessages([{
            id: '0',
            role: 'assistant',
            content: `👋 Hey! I'm your AI assistant running on **LuxRig**.\n\nI'm connected to your local LLMs (LM Studio & Ollama) — completely private, no data leaves your machine.\n\nTry asking me:\n- "Give me a startup idea in the AI space"\n- "Write a Python function to parse JSON"\n- "Explain quantum computing simply"\n\nWhat's on your mind?`,
            timestamp: new Date(),
            model: 'system'
        }]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function fetchModels() {
        try {
            const res = await fetch(`${BRIDGE_URL}/llm/models`);
            const data = await res.json();
            setModels({
                lmstudio: data.lmstudio.map((m: any) => m.id),
                ollama: data.ollama.map((m: any) => m.id)
            });
            if (data.lmstudio.length > 0) {
                setSelectedModel(data.lmstudio[0].id);
            }
        } catch (e) {
            console.error('Failed to fetch models');
        }
    }

    async function sendMessage(content: string) {
        if (!content.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(`${BRIDGE_URL}/llm/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: model,
                    model: selectedModel,
                    messages: [
                        { role: 'system', content: 'You are a helpful AI assistant. Be concise but thorough. Use markdown formatting for code and structured content.' },
                        ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: content.trim() }
                    ]
                })
            });

            const data = await res.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.content || data.error || 'No response received',
                timestamp: new Date(),
                model: selectedModel
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (e) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '❌ Failed to connect to LuxRig Bridge. Make sure the server is running on port 3456.',
                timestamp: new Date(),
                model: 'error'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    }

    function clearChat() {
        setMessages([{
            id: '0',
            role: 'assistant',
            content: '🧹 Chat cleared! What would you like to talk about?',
            timestamp: new Date(),
            model: 'system'
        }]);
    }

    return (
        <div className="min-h-screen pt-8 flex flex-col">
            {/* Header */}
            <div className="container-main py-4">
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-400 hover:text-cyan-400">←</Link>
                        <h1 className="text-2xl font-bold">
                            AI <span className="text-gradient">Chat</span>
                        </h1>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-green-400 text-sm">LuxRig Connected</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Model Selector */}
                        <select
                            value={model}
                            onChange={(e) => {
                                setModel(e.target.value);
                                const modelList = e.target.value === 'lmstudio' ? models.lmstudio : models.ollama;
                                if (modelList.length > 0) setSelectedModel(modelList[0]);
                            }}
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="lmstudio">LM Studio</option>
                            <option value="ollama">Ollama</option>
                        </select>

                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm max-w-[200px]"
                        >
                            {(model === 'lmstudio' ? models.lmstudio : models.ollama).map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>

                        <button
                            onClick={clearChat}
                            className="text-gray-400 hover:text-white text-sm"
                        >
                            Clear
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
                <div className="container-main py-4 space-y-4">
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                    ? 'bg-cyan-500 text-black'
                                    : 'glass-card'
                                }`}>
                                {message.role === 'assistant' && message.model && (
                                    <div className="text-xs text-gray-500 mb-2">
                                        {message.model === 'system' ? '🤖 System' : `🧠 ${message.model}`}
                                    </div>
                                )}
                                <div className={`prose prose-invert max-w-none ${message.role === 'user' ? 'prose-cyan' : ''}`}>
                                    <p className="whitespace-pre-wrap m-0">{message.content}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {loading && (
                        <motion.div
                            className="flex justify-start"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="glass-card px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
                <div className="container-main py-4">
                    <div className="flex flex-wrap gap-2">
                        {quickPrompts.map((prompt) => (
                            <button
                                key={prompt}
                                onClick={() => setInput(prompt)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm transition-colors"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-800 bg-[#050508]">
                <div className="container-main py-4">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                            placeholder="Ask anything..."
                            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                            disabled={loading}
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={loading || !input.trim()}
                            className="btn-primary px-6 disabled:opacity-50"
                        >
                            {loading ? '...' : 'Send'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Running locally on LuxRig • 100% private • Zero API costs
                    </p>
                </div>
            </div>
        </div>
    );
}
