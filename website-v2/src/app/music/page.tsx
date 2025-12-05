'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import {
  Music, Mic, Radio, Play, Pause, SkipForward, SkipBack,
  Volume2, Heart, Share2, Download, Disc, Activity
} from 'lucide-react';
import PageBackground from '@/components/PageBackground';

// --- Types ---
interface Agent {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  style: string;
}

interface SongResult {
  theme: string;
  genre: string;
  mood: string;
  sunoPrompt: {
    fullPrompt: string;
    copyToSuno: string;
  };
  ready: boolean;
}

const MODES = [
  { id: 'standard', name: 'Standard Mode', desc: 'Collaborative AI songwriting', icon: Music, color: 'purple' },
  { id: 'political', name: 'Newsician', desc: 'Political rap duo (Explicit)', icon: Mic, color: 'red' },
  { id: 'sentinel', name: 'Midwest Sentinel', desc: 'Boom Bap storytelling (Clean)', icon: Radio, color: 'blue' }
];

const GENRES = ['Pop', 'EDM', 'Indie', 'R&B', 'Rock', 'Hip Hop', 'Synthwave', 'Jazz'];
const MOODS = ['Uplifting', 'Energetic', 'Chill', 'Emotional', 'Dark', 'Aggressive', 'Dreamy'];

export default function MusicStudioPage() {
  const [mode, setMode] = useState('standard');
  const [theme, setTheme] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [mood, setMood] = useState('Uplifting');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SongResult | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    fetch(`${LUXRIG_BRIDGE_URL}/music/agents`)
      .then(res => res.json())
      .then(data => setAgents(data.agents || []))
      .catch(console.error);
  }, []);

  const handleGenerate = async () => {
    if (!theme && mode === 'standard') return;
    setIsGenerating(true);
    setResult(null);

    try {
      const endpoint = mode === 'standard'
        ? `${LUXRIG_BRIDGE_URL}/music/create`
        : mode === 'political'
          ? `${LUXRIG_BRIDGE_URL}/music/political`
          : `${LUXRIG_BRIDGE_URL}/music/sentinel`;

      const body = mode === 'standard'
        ? { theme, genre, mood }
        : { focusArea: 'minnesota' }; // Default for now

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      <PageBackground color="purple" />

      <div className="container-main pt-8 pb-20 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Music className="text-purple-400" size={32} />
              <span>Tone<span className="text-purple-400">Lab</span></span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">AI-Powered Music Production Suite</p>
          </div>

          <div className="flex bg-white/5 rounded-lg p-1">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${mode === m.id
                  ? `bg-${m.color}-500/20 text-${m.color}-400 shadow-sm border border-${m.color}-500/30`
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                <m.icon size={14} />
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left: Controls */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity size={18} className="text-cyan-400" />
                Configuration
              </h2>

              {mode === 'standard' ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Theme / Prompt</label>
                    <input
                      type="text"
                      value={theme}
                      onChange={e => setTheme(e.target.value)}
                      placeholder="e.g. Neon city nights..."
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Genre</label>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map(g => (
                        <button
                          key={g}
                          onClick={() => setGenre(g)}
                          className={`px-3 py-1.5 rounded text-xs transition-all ${genre === g
                            ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Mood</label>
                    <div className="flex flex-wrap gap-2">
                      {MOODS.map(m => (
                        <button
                          key={m}
                          onClick={() => setMood(m)}
                          className={`px-3 py-1.5 rounded text-xs transition-all ${mood === m
                            ? 'bg-cyan-500 text-black font-semibold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-200">
                  <div className="font-bold mb-2 flex items-center gap-2">
                    <Radio size={16} /> Autonomous Mode
                  </div>
                  This agent operates autonomously. It will scan news sources, select topics, and generate lyrics automatically.
                </div>
              )}

              <div className="mt-8">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || (mode === 'standard' && !theme)}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Composing...</span>
                    </>
                  ) : (
                    <>
                      <Disc className="animate-spin-slow" />
                      <span>Generate Track</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Agents Status */}
            <div className="glass-card p-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Active Agents</h3>
              <div className="space-y-3">
                {agents.map(agent => (
                  <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                    <div className="text-xl">{agent.emoji}</div>
                    <div>
                      <div className="font-medium text-sm">{agent.name}</div>
                      <div className="text-xs text-gray-500">{agent.style}</div>
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Output / Visualizer */}
          <div className="lg:col-span-2 space-y-6">

            {/* Prompt Display */}
            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-0 overflow-hidden border-purple-500/30"
              >
                <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <Disc className="text-purple-400" />
                    Ready for Suno
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.sunoPrompt.copyToSuno);
                      // Show toast
                    }}
                    className="text-xs bg-purple-500 hover:bg-purple-400 text-white px-3 py-1.5 rounded transition-colors"
                  >
                    Copy Prompt
                  </button>
                </div>
                <div className="p-6">
                  <div className="bg-[#0a0a0f] rounded-xl p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap border border-white/10 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {result.sunoPrompt.copyToSuno}
                  </div>

                  <div className="mt-6 flex gap-4">
                    <a
                      href="https://suno.com/create"
                      target="_blank"
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-center font-medium transition-all flex items-center justify-center gap-2 group"
                    >
                      <Music className="text-purple-400 group-hover:scale-110 transition-transform" />
                      Open Suno
                    </a>
                    <a
                      href="https://neuralframes.com"
                      target="_blank"
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-center font-medium transition-all flex items-center justify-center gap-2 group"
                    >
                      <Share2 className="text-cyan-400 group-hover:scale-110 transition-transform" />
                      Create Video
                    </a>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] glass-card flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-white/10 bg-white/5">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Music size={40} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">Studio Ready</h3>
                <p className="text-gray-500 max-w-sm">
                  Select a mode and generate your next hit properly engineered prompt for Suno.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
