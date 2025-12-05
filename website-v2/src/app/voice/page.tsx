'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const voices = [
    { id: 'alloy', name: 'Alloy', desc: 'Neutral and balanced', preview: '🔊' },
    { id: 'echo', name: 'Echo', desc: 'Warm and engaging', preview: '🔊' },
    { id: 'nova', name: 'Nova', desc: 'Friendly and upbeat', preview: '🔊' },
    { id: 'shimmer', name: 'Shimmer', desc: 'Expressive and dynamic', preview: '🔊' },
    { id: 'onyx', name: 'Onyx', desc: 'Deep and authoritative', preview: '🔊' },
];

const voiceCommands = [
    { command: 'Hey DLX, start a chat', action: 'Opens new AI conversation' },
    { command: 'Hey DLX, what\'s the status?', action: 'Reads system status' },
    { command: 'Hey DLX, turn on the lights', action: 'Activates Govee lights' },
    { command: 'Hey DLX, read my notifications', action: 'Reads unread notifications' },
    { command: 'Hey DLX, run code review', action: 'Starts Code Review agent' },
    { command: 'Hey DLX, what\'s Bitcoin at?', action: 'Reads current BTC price' },
];

const audioHistory = [
    { type: 'tts', text: 'Your daily market analysis is ready...', time: '10 min ago' },
    { type: 'command', text: 'Hey DLX, turn on office lights', time: '45 min ago' },
    { type: 'tts', text: 'Trading bot executed a buy order...', time: '2 hours ago' },
    { type: 'command', text: 'Hey DLX, what\'s the GPU temp', time: '3 hours ago' },
];

export default function VoicePage() {
    const [isListening, setIsListening] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState('alloy');
    const [speechRate, setSpeechRate] = useState(1.0);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
    const [testText, setTestText] = useState('Hello, I am your DLX Studio AI assistant. How can I help you today?');

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            <span className="text-gradient">Voice & Audio</span>
                        </h1>
                        <p className="text-gray-400">Control DLX Studio with your voice</p>
                    </motion.div>
                </div>
            </section>

            {/* Main Voice Control */}
            <section className="container-main pb-8">
                <motion.div
                    className="glass-card text-center py-12"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    {/* Microphone Button */}
                    <button
                        onClick={() => setIsListening(!isListening)}
                        className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center text-5xl transition-all ${isListening
                                ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                                : 'bg-gradient-to-br from-cyan-500 to-purple-500 hover:scale-105'
                            }`}
                    >
                        {isListening ? '🎙️' : '🎤'}
                    </button>

                    <h2 className="text-2xl font-bold mt-6">
                        {isListening ? 'Listening...' : 'Tap to Speak'}
                    </h2>
                    <p className="text-gray-400 mt-2">
                        {isListening
                            ? 'Say a command or ask a question'
                            : 'Or say "Hey DLX" to activate voice control'
                        }
                    </p>

                    {/* Wake Word Status */}
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${wakeWordEnabled ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                        <span className="text-sm text-gray-400">
                            Wake word {wakeWordEnabled ? 'enabled' : 'disabled'}
                        </span>
                    </div>
                </motion.div>
            </section>

            <div className="container-main pb-16 grid lg:grid-cols-2 gap-6">
                {/* Text to Speech */}
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 className="text-xl font-bold mb-4">🔊 Text to Speech</h3>

                    <div className="space-y-4">
                        {/* Voice Selection */}
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Voice</label>
                            <div className="grid grid-cols-2 gap-2">
                                {voices.map((voice) => (
                                    <button
                                        key={voice.id}
                                        onClick={() => setSelectedVoice(voice.id)}
                                        className={`p-3 rounded-lg text-left ${selectedVoice === voice.id
                                                ? 'bg-cyan-500/20 ring-2 ring-cyan-500'
                                                : 'bg-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="font-medium">{voice.name}</div>
                                        <div className="text-xs text-gray-500">{voice.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Speed */}
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">
                                Speed: {speechRate}x
                            </label>
                            <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.1"
                                value={speechRate}
                                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        {/* Test */}
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Test Text</label>
                            <textarea
                                value={testText}
                                onChange={(e) => setTestText(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 h-20 resize-none"
                            />
                        </div>

                        <button className="w-full py-3 bg-cyan-500 text-black rounded-lg font-medium hover:bg-cyan-400">
                            ▶️ Play Test
                        </button>
                    </div>
                </motion.div>

                {/* Voice Commands */}
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 className="text-xl font-bold mb-4">🗣️ Voice Commands</h3>

                    <div className="space-y-3">
                        {voiceCommands.map((cmd, i) => (
                            <div key={i} className="p-3 bg-white/5 rounded-lg">
                                <div className="font-mono text-sm text-cyan-400">"{cmd.command}"</div>
                                <div className="text-xs text-gray-500 mt-1">{cmd.action}</div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20">
                        + Add Custom Command
                    </button>
                </motion.div>

                {/* Settings */}
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="text-xl font-bold mb-4">⚙️ Settings</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">Text-to-Speech</div>
                                <div className="text-xs text-gray-500">AI responses read aloud</div>
                            </div>
                            <button
                                onClick={() => setTtsEnabled(!ttsEnabled)}
                                className={`w-12 h-6 rounded-full relative ${ttsEnabled ? 'bg-cyan-500' : 'bg-gray-600'}`}
                            >
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${ttsEnabled ? 'right-1' : 'left-1'
                                    }`}></span>
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">Wake Word Detection</div>
                                <div className="text-xs text-gray-500">"Hey DLX" activation</div>
                            </div>
                            <button
                                onClick={() => setWakeWordEnabled(!wakeWordEnabled)}
                                className={`w-12 h-6 rounded-full relative ${wakeWordEnabled ? 'bg-cyan-500' : 'bg-gray-600'}`}
                            >
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${wakeWordEnabled ? 'right-1' : 'left-1'
                                    }`}></span>
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">Notification Sounds</div>
                                <div className="text-xs text-gray-500">Audio alerts</div>
                            </div>
                            <button className="w-12 h-6 bg-cyan-500 rounded-full relative">
                                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* History */}
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-xl font-bold mb-4">📜 Audio History</h3>

                    <div className="space-y-3">
                        {audioHistory.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                                <span className={item.type === 'tts' ? 'text-cyan-400' : 'text-purple-400'}>
                                    {item.type === 'tts' ? '🔊' : '🎤'}
                                </span>
                                <div className="flex-1">
                                    <div className="text-sm truncate">{item.text}</div>
                                    <div className="text-xs text-gray-500">{item.time}</div>
                                </div>
                                <button className="text-xs text-gray-400 hover:text-white">
                                    ▶️
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
