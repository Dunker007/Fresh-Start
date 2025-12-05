'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function TerminalPage() {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<{ type: 'input' | 'output' | 'error'; content: string }[]>([
        { type: 'output', content: '🚀 DLX Studio Terminal v1.0.0' },
        { type: 'output', content: 'Type "help" for available commands.' },
        { type: 'output', content: '' },
    ]);

    const commands: Record<string, () => string | string[]> = {
        help: () => [
            'Available commands:',
            '  help     - Show this help message',
            '  clear    - Clear terminal',
            '  status   - Show system status',
            '  gpu      - Show GPU info',
            '  models   - List available models',
            '  uptime   - Show system uptime',
            '  whoami   - Show current user',
            '  date     - Show current date/time',
            '  echo     - Echo back text',
            '  version  - Show version info',
            '  neofetch - System info (pretty)',
        ],
        clear: () => '',
        status: () => [
            '╔══════════════════════════════════════╗',
            '║        DLX Studio Status             ║',
            '╠══════════════════════════════════════╣',
            '║ LuxRig Bridge    ● Running           ║',
            '║ LM Studio        ● Connected         ║',
            '║ Ollama           ● Connected         ║',
            '║ GPU              ● Ready             ║',
            '╚══════════════════════════════════════╝',
        ],
        gpu: () => [
            '🎮 NVIDIA GeForce RTX 4090',
            '   Memory: 8.2 GB / 24 GB',
            '   Temp: 52°C',
            '   Load: 45%',
            '   Power: 180W / 450W',
        ],
        models: () => [
            '📦 Available Models:',
            '  [lmstudio] gemma-3n-E4B-it-QAT',
            '  [lmstudio] qwen2.5-coder-14b',
            '  [ollama]   llama3.1:8b',
            '  [ollama]   mistral:7b',
        ],
        uptime: () => `⏱️  System uptime: 14 days, 6 hours, 32 minutes`,
        whoami: () => `👤 dunker007@luxrig`,
        date: () => `📅 ${new Date().toLocaleString()}`,
        version: () => [
            '🏷️  Versions:',
            '  DLX Studio: 1.0.0',
            '  LuxRig Bridge: 1.0.0',
            '  Node.js: 20.10.0',
            '  Next.js: 14.0.0',
        ],
        neofetch: () => [
            '',
            '    ██████╗ ██╗     ██╗  ██╗',
            '    ██╔══██╗██║     ╚██╗██╔╝',
            '    ██║  ██║██║      ╚███╔╝ ',
            '    ██║  ██║██║      ██╔██╗ ',
            '    ██████╔╝███████╗██╔╝ ██╗',
            '    ╚═════╝ ╚══════╝╚═╝  ╚═╝',
            '',
            '    OS: DLX Studio WebOS',
            '    Host: LuxRig AI Server',
            '    Kernel: luxrig-bridge v1.0',
            '    Uptime: 14 days',
            '    Shell: DLX Terminal',
            '    Resolution: 3840x2160',
            '    CPU: AMD Ryzen 9 7950X',
            '    GPU: NVIDIA RTX 4090 24GB',
            '    Memory: 16.4 GiB / 64 GiB',
            '',
        ],
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim()) return;

        const cmd = input.trim().toLowerCase().split(' ')[0];
        const args = input.trim().slice(cmd.length).trim();

        // Add input to history
        setHistory(prev => [...prev, { type: 'input', content: `$ ${input}` }]);

        if (cmd === 'clear') {
            setHistory([]);
        } else if (cmd === 'echo') {
            setHistory(prev => [...prev, { type: 'output', content: args || '' }]);
        } else if (commands[cmd]) {
            const result = commands[cmd]();
            if (Array.isArray(result)) {
                result.forEach(line => {
                    setHistory(prev => [...prev, { type: 'output', content: line }]);
                });
            } else {
                setHistory(prev => [...prev, { type: 'output', content: result }]);
            }
        } else {
            setHistory(prev => [...prev, { type: 'error', content: `Command not found: ${cmd}. Type "help" for available commands.` }]);
        }

        setInput('');
    }

    // Auto scroll
    useEffect(() => {
        const terminal = document.getElementById('terminal-output');
        if (terminal) {
            terminal.scrollTop = terminal.scrollHeight;
        }
    }, [history]);

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
                            <span className="text-gradient">Terminal</span>
                        </h1>
                        <p className="text-gray-400">Command line interface for DLX Studio</p>
                    </motion.div>
                </div>
            </section>

            {/* Terminal */}
            <section className="container-main pb-16">
                <motion.div
                    className="glass-card p-0 overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    {/* Title bar */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-black/50 border-b border-gray-700">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="text-sm text-gray-400 font-mono ml-4">DLX Terminal — bash</span>
                    </div>

                    {/* Output */}
                    <div
                        id="terminal-output"
                        className="h-[500px] overflow-y-auto p-4 font-mono text-sm bg-black/30"
                    >
                        {history.map((line, i) => (
                            <div
                                key={i}
                                className={`${line.type === 'input'
                                        ? 'text-cyan-400'
                                        : line.type === 'error'
                                            ? 'text-red-400'
                                            : 'text-gray-300'
                                    } whitespace-pre`}
                            >
                                {line.content}
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 bg-black/50 border-t border-gray-700">
                        <span className="text-cyan-400 font-mono">$</span>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 bg-transparent outline-none font-mono text-white"
                            placeholder="Type a command..."
                            autoFocus
                        />
                    </form>
                </motion.div>

                {/* Quick Commands */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {['status', 'gpu', 'models', 'neofetch'].map((cmd) => (
                        <button
                            key={cmd}
                            onClick={() => setInput(cmd)}
                            className="px-3 py-1 bg-white/10 rounded-full text-sm hover:bg-white/20 font-mono"
                        >
                            {cmd}
                        </button>
                    ))}
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
