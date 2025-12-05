'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import SystemStatus from '@/components/SystemStatus';
import LLMModels from '@/components/LLMModels';
import Link from 'next/link';

// Dynamic import for Three.js (no SSR)
const NeuralNetwork = dynamic(() => import('@/components/NeuralNetwork'), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-gradient-to-b from-transparent to-[#050508]"></div>
});

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const tools = [
  { icon: '🧠', name: 'Mind Map', desc: 'WebGL-powered visual brainstorming with voice control and drag & drop nodes.', color: 'cyan' },
  { icon: '💡', name: 'Idea Lab', desc: 'Kanban-style brainstorming system with 4 status columns.', color: 'yellow' },
  { icon: '🔬', name: 'Labs Hub', desc: '11 specialized labs including AURA Interface, Agent Forge, and Data Weave.', color: 'purple' },
  { icon: '💻', name: 'Code Editor', desc: 'Full Monaco IDE with AI assistance for 12+ languages.', color: 'green' },
  { icon: '📊', name: 'Token Analytics', desc: 'Real-time token tracking, cost calculator, and budget controls.', color: 'blue' },
  { icon: '🚀', name: 'Nexus Workspace', desc: 'Desktop productivity hub with tasks, notes, calendar, and AI chat.', color: 'pink' },
];

const agents = [
  { emoji: '🎨', name: 'Kai', role: 'Creative Brainstorming', desc: 'Generates ideas, explores possibilities, and helps you think outside the box.', gradient: 'from-cyan-500 to-blue-500', status: 'active' },
  { emoji: '🛡️', name: 'Guardian', role: 'System Monitoring', desc: 'Watches over your systems, alerts issues, and keeps everything running smoothly.', gradient: 'from-green-500 to-teal-500', status: 'active' },
  { emoji: '⚡', name: 'ByteBot', role: 'Task Automation', desc: 'Executes repetitive tasks, manages workflows, and boosts your productivity.', gradient: 'from-purple-500 to-pink-500', status: 'queued' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <NeuralNetwork />

        <motion.div
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tight">
              <span className="text-gradient">DLX STUDIO</span>
            </h1>
          </motion.div>

          <motion.h2
            className="text-2xl md:text-4xl font-light text-gray-300 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            AI Command Center
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Your personal AI operating system. Local LLMs, real-time GPU monitoring,
            and multi-model orchestration running on <span className="text-cyan-400 font-semibold">LuxRig</span>.
          </motion.p>

          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link href="/dashboard" className="btn-primary group">
              <span className="relative z-10">Launch Dashboard</span>
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform rounded-lg"></span>
            </Link>
            <Link href="/download" className="btn-outline">
              Download Desktop
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <motion.div
              className="w-6 h-10 border-2 border-cyan-500/50 rounded-full flex justify-center"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <motion.div
                className="w-1.5 h-3 bg-cyan-400 rounded-full mt-2"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030305] to-transparent"></div>
      </section>

      {/* Live Status Section */}
      <section className="section-padding">
        <div className="container-main">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              <span className="text-cyan-400 text-sm font-medium">LIVE DATA</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              System <span className="text-glow-cyan">Status</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Real-time metrics from LuxRig • RTX 3060 • Ryzen 7 3700X • 32GB RAM
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <SystemStatus />
          </motion.div>
        </div>
      </section>

      {/* LLM Arsenal Section */}
      <section className="section-padding bg-[#050508]">
        <div className="container-main">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
              <span className="text-purple-400 text-sm font-medium">10 MODELS LOADED</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              LLM <span className="text-glow-magenta">Arsenal</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Local models ready to deploy • Zero API costs • Full privacy
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <LLMModels />
          </motion.div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section className="section-padding">
        <div className="container-main">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">AI-Powered</span> Tools
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to build, create, and automate
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {tools.map((tool, i) => (
              <motion.div
                key={tool.name}
                className="glass-card group cursor-pointer relative overflow-hidden"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{tool.icon}</div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {tool.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="section-padding bg-[#050508]">
        <div className="container-main">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-400 text-sm font-medium">2 AGENTS ACTIVE</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              AI <span className="text-glow-cyan">Agents</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Autonomous AI workers for your creative and technical tasks
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {agents.map((agent, i) => (
              <motion.div
                key={agent.name}
                className="glass-card text-center relative overflow-hidden"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${agent.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                      } animate-pulse`}></span>
                    {agent.status}
                  </span>
                </div>

                <motion.div
                  className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-4xl shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {agent.emoji}
                </motion.div>
                <h3 className="text-2xl font-bold mb-1">{agent.name}</h3>
                <p className="text-cyan-400 text-sm mb-4">{agent.role}</p>
                <p className="text-gray-400 text-sm">
                  {agent.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/agents" className="btn-outline">
              View All Agents →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2026 Vision Teaser */}
      <section className="section-padding">
        <div className="container-main">
          <motion.div
            className="glass-card relative overflow-hidden py-16 px-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
                  <span className="text-purple-400 text-sm font-medium">THE FUTURE OF VIBE CODING</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Building for <span className="text-gradient">2026</span>
                </h2>

                <p className="text-lg text-gray-400 mb-6">
                  The industry learned from 2025's vibe coding hangover. Now we're building
                  AI that's <span className="text-cyan-400">reliable</span>, <span className="text-green-400">accountable</span>,
                  and <span className="text-purple-400">truly helpful</span>.
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-sm text-green-400">
                    Multi-Agent Workflows
                  </span>
                  <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-400">
                    Context Engineering
                  </span>
                  <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-400">
                    AI Governance
                  </span>
                </div>

                <Link href="/vision" className="btn-outline inline-flex items-center gap-2">
                  Explore the Vision →
                </Link>
              </div>

              <div className="flex-shrink-0 grid grid-cols-2 gap-4">
                {[
                  { icon: '🛡️', label: 'Reliability', status: 'Building' },
                  { icon: '🤖', label: 'Multi-Agent', status: 'Live' },
                  { icon: '⚡', label: 'Context', status: 'Building' },
                  { icon: '✨', label: 'Personality', status: 'Planned' },
                ].map((item) => (
                  <div key={item.label} className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className={`text-xs mt-1 ${item.status === 'Live' ? 'text-green-400' :
                      item.status === 'Building' ? 'text-cyan-400' : 'text-purple-400'
                      }`}>{item.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-main">
          <motion.div
            className="glass-card text-center py-16 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to <span className="text-gradient">Take Control</span>?
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                Download Nexus Workspace and experience the future of AI-powered productivity.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <motion.button
                  className="btn-primary text-lg px-8 py-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Download for Windows
                </motion.button>
                <motion.a
                  href="https://github.com/Dunker007"
                  target="_blank"
                  className="btn-outline text-lg px-8 py-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View on GitHub
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <span className="font-bold">D</span>
                </div>
                <span className="text-xl font-bold">DLX STUDIO</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your personal AI operating system. Built on LuxRig.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/apps" className="hover:text-cyan-400">All Apps</Link></li>
                <li><Link href="/agents" className="hover:text-cyan-400">AI Agents</Link></li>
                <li><Link href="/labs" className="hover:text-cyan-400">Labs Hub</Link></li>
                <li><Link href="/income" className="hover:text-cyan-400">Passive Income</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/docs" className="hover:text-cyan-400">Documentation</Link></li>
                <li><Link href="/learn" className="hover:text-cyan-400">Learn</Link></li>
                <li><Link href="/changelog" className="hover:text-cyan-400">Changelog</Link></li>
                <li><a href="https://github.com/Dunker007" className="hover:text-cyan-400">GitHub</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/community" className="hover:text-cyan-400">Community</Link></li>
                <li><Link href="/crypto" className="hover:text-cyan-400">Crypto Lab</Link></li>
                <li><Link href="/deals" className="hover:text-cyan-400">Free AI Deals</Link></li>
                <li><Link href="/download" className="hover:text-cyan-400">Download</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2025 DLX Studio. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Powered by LuxRig
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
