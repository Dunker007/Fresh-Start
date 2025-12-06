'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import PageBackground from '@/components/PageBackground';

interface Studio {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string; // Tailwind color class partial
  status: 'live' | 'beta' | 'coming-soon';
  features: string[];
}

const studios: Studio[] = [
  {
    id: 'music',
    name: 'DLX Music Studio',
    description: 'AI-powered songwriting with collaborative agents. Create lyrics, compose melodies, and generate Suno-ready prompts.',
    icon: '🎵',
    href: '/music',
    color: 'pink',
    status: 'live',
    features: ['Songwriter Agents', 'Newsician Rap Guo', 'Midwest Sentinel', 'Suno Integration']
  },
  {
    id: 'dev',
    name: 'DLX Dev Studio',
    description: 'Manage GitHub repositories, track system performance, and execute quick dev actions.',
    icon: '💻',
    href: '/studios/dev',
    color: 'cyan',
    status: 'live',
    features: ['GitHub Integration', 'System Monitor', 'Repo Management', 'Terminal Actions']
  },
  {
    id: 'video',
    name: 'DLX Video Studio',
    description: 'AI video creation with Neural Frames integration. Turn music into stunning visualizers and music videos.',
    icon: '🎬',
    href: '/studios/video',
    color: 'amber',
    status: 'beta',
    features: ['Neural Frames', 'Music Visualizers', 'AI Video Gen', 'YouTube Ready']
  },
  {
    id: 'blog',
    name: 'DLX Blog Studio',
    description: 'AI content creation for blogs and articles. SEO-optimized writing with your brand voice.',
    icon: '✍️',
    href: '/studios/blog',
    color: 'emerald',
    status: 'beta',
    features: ['AI Copywriting', 'SEO Optimization', 'Brand Voice', 'Auto Publishing']
  },
  {
    id: 'art',
    name: 'DLX Art Studio',
    description: 'AI image generation and editing. Create album covers, thumbnails, and visual assets.',
    icon: '🎨',
    href: '/studios/art',
    color: 'purple',
    status: 'beta',
    features: ['Image Generation', 'Style Selector', 'Prompting', 'Gallery']
  },
  {
    id: 'podcast',
    name: 'DLX Podcast Studio',
    description: 'AI-powered podcast creation. Script writing, voice synthesis, and audio production.',
    icon: '🎙️',
    href: '/studios/podcast',
    color: 'red',
    status: 'coming-soon',
    features: ['Script Writing', 'Voice Clone', 'Audio Editing', 'Distribution']
  },
  {
    id: '3dprint',
    name: 'DLX 3D Print Studio',
    description: 'Autonomous print farm management. AI model analysis, slicing optimization, and failure detection.',
    icon: '🖨️',
    href: '/studios/3dprint',
    color: 'orange',
    status: 'coming-soon',
    features: ['Print Farms', 'Model Analysis', 'Slice Optimization', 'Remote Monitor']
  },
  {
    id: 'laser',
    name: 'DLX Laser Studio',
    description: 'Precision laser engraving command center. AI vector generation and material settings optimization.',
    icon: '⚡',
    href: '/studios/laser',
    color: 'indigo',
    status: 'coming-soon',
    features: ['Vector Generation', 'Material Settings', 'Engrave Optimization', 'Job Queue']
  }
];

const getStatusBadge = (status: Studio['status']) => {
  switch (status) {
    case 'live':
      return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/30">● Live</span>;
    case 'beta':
      return <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-bold uppercase tracking-wider border border-cyan-500/30">◐ Beta</span>;
    case 'coming-soon':
      return <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-500/30">◌ Coming Soon</span>;
  }
};

export default function StudiosPage() {
  return (
    <div className="min-h-screen pt-20 pb-20 relative">
      <PageBackground color="cyan" />

      {/* Header */}
      <section className="container-main text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">AI Studios</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Your creative command center. AI-powered studios for music, video, code, and content creation.
          </p>
        </motion.div>

        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      </section>

      {/* Grid */}
      <section className="container-main">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {studios.map((studio, index) => {
            const isDisabled = studio.status === 'coming-soon';

            return (
              <motion.div
                key={studio.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={isDisabled ? '#' : studio.href}
                  className={`block h-full relative group ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <div className={`glass-card h-full transition-all duration-300 group-hover:-translate-y-2 relative overflow-hidden`}>
                    {/* Hover Gradient Border Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-${studio.color}-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-4xl filter drop-shadow-lg">{studio.icon}</span>
                        {getStatusBadge(studio.status)}
                      </div>

                      <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-cyan-400 transition-colors">
                        {studio.name}
                      </h2>

                      <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                        {studio.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-auto">
                        {studio.features.map(feature => (
                          <span
                            key={feature}
                            className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-gray-400 group-hover:border-white/20 group-hover:text-gray-300 transition-colors"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      {!isDisabled && (
                        <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <div className={`w-10 h-10 rounded-full bg-${studio.color}-500/20 border border-${studio.color}-500/30 flex items-center justify-center text-${studio.color}-400`}>
                            →
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container-main mt-20 pb-20">
        <motion.div
          className="glass-card p-10 bg-gradient-to-br from-gray-900/50 to-black/50"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">6</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest">AI Studios</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">2</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest">Active Now</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">12+</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest">AI Agents</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">∞</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest">Possibilities</div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
