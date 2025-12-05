'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface Studio {
    id: string;
    name: string;
    description: string;
    icon: string;
    href: string;
    color: string;
    gradient: string;
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
        color: '#EC4899',
        gradient: 'from-pink-500 to-purple-600',
        status: 'live',
        features: ['Songwriter Agents', 'Newsician Rap Duo', 'Midwest Sentinel', 'Suno Integration']
    },
    {
        id: 'dev',
        name: 'DLX Dev Studio',
        description: 'AI-assisted app development. Build websites, APIs, and applications with intelligent code generation.',
        icon: '💻',
        href: '/studios/dev',
        color: '#06B6D4',
        gradient: 'from-cyan-500 to-blue-600',
        status: 'beta',
        features: ['Code Generation', 'App Templates', 'API Builder', 'Deploy Pipeline']
    },
    {
        id: 'video',
        name: 'DLX Video Studio',
        description: 'AI video creation with Neural Frames integration. Turn music into stunning visualizers and music videos.',
        icon: '🎬',
        href: '/studios/video',
        color: '#F59E0B',
        gradient: 'from-amber-500 to-orange-600',
        status: 'coming-soon',
        features: ['Neural Frames', 'Music Visualizers', 'AI Video Gen', 'YouTube Ready']
    },
    {
        id: 'blog',
        name: 'DLX Blog Studio',
        description: 'AI content creation for blogs and articles. SEO-optimized writing with your brand voice.',
        icon: '✍️',
        href: '/studios/blog',
        color: '#10B981',
        gradient: 'from-emerald-500 to-teal-600',
        status: 'coming-soon',
        features: ['AI Copywriting', 'SEO Optimization', 'Brand Voice', 'Auto Publishing']
    },
    {
        id: 'art',
        name: 'DLX Art Studio',
        description: 'AI image generation and editing. Create album covers, thumbnails, and visual assets.',
        icon: '🎨',
        href: '/studios/art',
        color: '#8B5CF6',
        gradient: 'from-violet-500 to-purple-600',
        status: 'coming-soon',
        features: ['Image Generation', 'Album Art', 'Thumbnails', 'Brand Assets']
    },
    {
        id: 'podcast',
        name: 'DLX Podcast Studio',
        description: 'AI-powered podcast creation. Script writing, voice synthesis, and audio production.',
        icon: '🎙️',
        href: '/studios/podcast',
        color: '#EF4444',
        gradient: 'from-red-500 to-rose-600',
        status: 'coming-soon',
        features: ['Script Writing', 'Voice Clone', 'Audio Editing', 'Distribution']
    }
];

const statusBadge = (status: Studio['status']) => {
    switch (status) {
        case 'live':
            return <span className="status-badge live">● Live</span>;
        case 'beta':
            return <span className="status-badge beta">◐ Beta</span>;
        case 'coming-soon':
            return <span className="status-badge coming">◌ Coming Soon</span>;
    }
};

export default function StudiosPage() {
    return (
        <div className="studios-page">
            <style jsx>{`
        .studios-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a12 0%, #0f0f23 25%, #1a1a3e 50%, #0f0f23 75%, #0a0a12 100%);
          padding: 2rem;
          color: white;
          position: relative;
        }

        .studios-page::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 70%, rgba(236, 72, 153, 0.08) 0%, transparent 50%),
                      radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .header {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .header h1 {
          font-size: 4rem;
          font-weight: 800;
          background: linear-gradient(135deg, #EC4899, #8B5CF6, #06B6D4, #10B981);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          animation: gradientShift 8s ease infinite;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .header p {
          color: #8888aa;
          font-size: 1.2rem;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .studios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
        }

        @media (max-width: 500px) {
          .studios-grid {
            grid-template-columns: 1fr;
          }
        }

        .studio-card {
          background: linear-gradient(145deg, rgba(20, 20, 35, 0.9), rgba(15, 15, 30, 0.95));
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.5rem;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
          cursor: pointer;
          text-decoration: none;
          display: block;
        }

        .studio-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--card-gradient);
          opacity: 0.8;
        }

        .studio-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--card-gradient);
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 0;
        }

        .studio-card:hover {
          transform: translateY(-8px);
          border-color: var(--card-color);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4),
                      0 0 60px var(--card-glow);
        }

        .studio-card:hover::after {
          opacity: 0.05;
        }

        .studio-card.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .studio-card.disabled:hover {
          transform: none;
        }

        .card-content {
          position: relative;
          z-index: 1;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .studio-icon {
          font-size: 3rem;
          filter: drop-shadow(0 0 20px var(--card-glow));
        }

        .status-badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          border-radius: 2rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-badge.live {
          background: rgba(16, 185, 129, 0.2);
          color: #10B981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-badge.beta {
          background: rgba(6, 182, 212, 0.2);
          color: #06B6D4;
          border: 1px solid rgba(6, 182, 212, 0.3);
        }

        .status-badge.coming {
          background: rgba(139, 92, 246, 0.2);
          color: #A78BFA;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .studio-name {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: white;
        }

        .studio-description {
          color: #9090b0;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .feature-tag {
          font-size: 0.75rem;
          padding: 0.4rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 2rem;
          color: #aaa;
          transition: all 0.3s ease;
        }

        .studio-card:hover .feature-tag {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--card-color);
          color: white;
        }

        .enter-arrow {
          position: absolute;
          bottom: 2rem;
          right: 2rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }

        .studio-card:hover .enter-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .quick-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-top: 4rem;
          padding: 2rem;
          background: linear-gradient(145deg, rgba(20, 20, 35, 0.6), rgba(15, 15, 30, 0.7));
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #EC4899, #8B5CF6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          color: #8888aa;
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }
      `}</style>

            <div className="container">
                <header className="header">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        🎨 AI Studios
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Your creative command center. AI-powered studios for music, video, code, and content creation.
                    </motion.p>
                </header>

                <div className="studios-grid">
                    {studios.map((studio, index) => {
                        const isDisabled = studio.status === 'coming-soon';
                        const CardWrapper = isDisabled ? 'div' : Link;

                        return (
                            <motion.div
                                key={studio.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <CardWrapper
                                    href={isDisabled ? undefined : studio.href}
                                    className={`studio-card ${isDisabled ? 'disabled' : ''}`}
                                    style={{
                                        '--card-color': studio.color,
                                        '--card-gradient': `linear-gradient(135deg, ${studio.color}, transparent)`,
                                        '--card-glow': `${studio.color}33`
                                    } as React.CSSProperties}
                                >
                                    <div className="card-content">
                                        <div className="card-header">
                                            <span className="studio-icon">{studio.icon}</span>
                                            {statusBadge(studio.status)}
                                        </div>
                                        <h2 className="studio-name">{studio.name}</h2>
                                        <p className="studio-description">{studio.description}</p>
                                        <div className="features-list">
                                            {studio.features.map(feature => (
                                                <span key={feature} className="feature-tag">{feature}</span>
                                            ))}
                                        </div>
                                    </div>
                                    {!isDisabled && <span className="enter-arrow">→</span>}
                                </CardWrapper>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    className="quick-stats"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    <div className="stat-item">
                        <div className="stat-value">6</div>
                        <div className="stat-label">AI Studios</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">2</div>
                        <div className="stat-label">Active Now</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">12+</div>
                        <div className="stat-label">AI Agents</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">∞</div>
                        <div className="stat-label">Possibilities</div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
