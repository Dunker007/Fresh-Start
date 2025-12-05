'use client';

import { useState } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  style: string;
}

interface TranscriptEntry {
  agent: string;
  message: string;
  emoji: string;
}

interface SongResult {
  theme: string;
  genre: string;
  mood: string;
  transcript: TranscriptEntry[];
  sunoPrompt: {
    fullPrompt: string;
    copyToSuno: string;
    instructions: string[];
    styleTags: string;
  };
  ready: boolean;
  // Political mode extras
  mode?: string;
  title?: string;
  voices?: any;
  structure?: any;
  production?: any;
}

const genres = [
  { value: 'pop', label: '🎤 Pop', color: '#EC4899' },
  { value: 'edm', label: '🎛️ EDM', color: '#8B5CF6' },
  { value: 'indie', label: '🎸 Indie', color: '#F59E0B' },
  { value: 'rnb', label: '🎷 R&B', color: '#3B82F6' },
  { value: 'rock', label: '🤘 Rock', color: '#EF4444' },
];

const moods = [
  { value: 'uplifting', label: '✨ Uplifting' },
  { value: 'energetic', label: '⚡ Energetic' },
  { value: 'chill', label: '🌙 Chill' },
  { value: 'emotional', label: '💔 Emotional' },
  { value: 'dark', label: '🖤 Dark' },
];

// Creative modes
const modes = [
  { value: 'standard', label: '🎵 Standard', desc: 'Lyricist + Composer + Critic + Producer', color: '#8B5CF6' },
  { value: 'political', label: '🎤 Newsician', desc: 'Political Rap Duo - Explicit, Aggressive', color: '#DC2626' },
  { value: 'sentinel', label: '🎧 Midwest Sentinel', desc: 'Platform-Safe Boom Bap - Grandma Approved', color: '#1E40AF' },
];

export default function MusicStudioPage() {
  const [mode, setMode] = useState('standard');
  const [theme, setTheme] = useState('');
  const [genre, setGenre] = useState('pop');
  const [mood, setMood] = useState('uplifting');
  const [focusArea, setFocusArea] = useState('minnesota');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SongResult | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Fetch agents on mount
  useState(() => {
    fetch(`${LUXRIG_BRIDGE_URL}/music/agents`)
      .then(res => res.json())
      .then(data => setAgents(data.agents || []))
      .catch(err => console.error('Failed to fetch agents:', err));
  });

  const handleGenerate = async () => {
    // For standard mode, require theme
    if (mode === 'standard' && !theme.trim()) {
      setError('Please enter a theme for your song');
      return;
    }

    setIsGenerating(true);
    setError('');
    setResult(null);

    try {
      // Choose endpoint based on mode
      let endpoint = `${LUXRIG_BRIDGE_URL}/music/create`;
      let payload: any = { theme, genre, mood };

      if (mode === 'political') {
        endpoint = `${LUXRIG_BRIDGE_URL}/music/political`;
        payload = { focusArea, headlines: [] };
      } else if (mode === 'sentinel') {
        endpoint = `${LUXRIG_BRIDGE_URL}/music/sentinel`;
        payload = { focusArea, headlines: [] };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to generate song');

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to generate song. Is the backend running?');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    const textToCopy = result?.sunoPrompt?.copyToSuno || result?.sunoPrompt?.fullPrompt;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="music-studio">
      <style jsx>{`
        .music-studio {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a12 0%, #0f0f23 25%, #1a1a3e 50%, #0f0f23 75%, #0a0a12 100%);
          padding: 2rem;
          color: white;
          position: relative;
        }

        .music-studio::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at 30% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 80%, rgba(236, 72, 153, 0.08) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .container {
          max-width: 1300px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .header h1 {
          font-size: 3.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #EC4899, #8B5CF6, #06B6D4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          text-shadow: 0 0 60px rgba(139, 92, 246, 0.3);
        }

        .header p {
          color: #8888aa;
          font-size: 1.1rem;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        @media (max-width: 1000px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }

        .card {
          background: linear-gradient(145deg, rgba(20, 20, 35, 0.9), rgba(15, 15, 30, 0.95));
          border: 1px solid rgba(139, 92, 246, 0.15);
          border-radius: 1.25rem;
          padding: 2rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
                      inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .card-title {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 1.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #fff;
        }

        .form-group {
          margin-bottom: 1.75rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.75rem;
          color: #9090b0;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 0.75rem;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #8B5CF6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2),
                      0 0 20px rgba(139, 92, 246, 0.1);
        }

        .form-input::placeholder {
          color: #555;
        }

        /* Mode Selector Grid - Special styling for large buttons */
        .mode-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        /* Genre Grid */
        .genre-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 0.6rem;
        }

        .genre-btn {
          padding: 1rem 0.75rem;
          background: rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.75rem;
          color: #8888aa;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .genre-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--genre-color, #8B5CF6) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .genre-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .genre-btn.active {
          border-color: var(--genre-color, #8B5CF6);
          color: white;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05));
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .genre-btn.active::before {
          opacity: 0.15;
        }

        .mood-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
          gap: 0.6rem;
        }

        .mood-btn {
          padding: 0.875rem 0.5rem;
          background: rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.75rem;
          color: #8888aa;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .mood-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .mood-btn.active {
          border-color: #8B5CF6;
          color: white;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05));
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
        }

        .generate-btn {
          width: 100%;
          padding: 1.15rem;
          background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #06B6D4 100%);
          background-size: 200% 200%;
          border: none;
          border-radius: 0.75rem;
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
        }

        .generate-btn:hover:not(:disabled) {
          background-position: 100% 100%;
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(139, 92, 246, 0.5);
        }

        .generate-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .agents-row {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .agent-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 2rem;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .agent-emoji {
          font-size: 1.2rem;
        }

        .transcript {
          max-height: 280px;
          overflow-y: auto;
          margin-bottom: 1.5rem;
          padding-right: 0.5rem;
        }

        .transcript::-webkit-scrollbar {
          width: 6px;
        }

        .transcript::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        .transcript::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.4);
          border-radius: 3px;
        }

        .transcript-entry {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(139, 92, 246, 0.05));
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 0.75rem;
          margin-bottom: 0.6rem;
          animation: slideIn 0.4s ease-out;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .transcript-emoji {
          font-size: 1.5rem;
        }

        .transcript-content {
          flex: 1;
        }

        .transcript-agent {
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: #fff;
        }

        .transcript-message {
          color: #9090b0;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .prompt-box {
          background: linear-gradient(145deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.1));
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 1rem;
          position: relative;
          overflow: hidden;
        }

        .prompt-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #EC4899, #8B5CF6, #06B6D4);
        }

        .prompt-label {
          font-size: 0.75rem;
          color: #8888aa;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .prompt-text {
          font-size: 1.05rem;
          line-height: 1.7;
          color: white;
        }

        .copy-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 0.75rem;
          color: #10B981;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .copy-btn:hover {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.2));
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
        }

        .copy-btn.copied {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(16, 185, 129, 0.3));
          color: white;
        }

        .instructions {
          margin-top: 1.5rem;
        }

        .instructions-title {
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #9090b0;
          font-size: 0.9rem;
        }

        .instructions-list {
          list-style: none;
          padding: 0;
        }

        .instructions-list li {
          padding: 0.6rem 0;
          color: #8888aa;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
        }

        .instructions-list li::before {
          content: '→';
          color: #8B5CF6;
          font-weight: bold;
        }

        .error-message {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #F87171;
          padding: 1rem 1.25rem;
          border-radius: 0.75rem;
          margin-bottom: 1.25rem;
          font-weight: 500;
        }

        .loading-dots {
          display: inline-flex;
          gap: 0.3rem;
        }

        .loading-dots span {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: #666;
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .instructions-list a {
          color: #8B5CF6;
          text-decoration: none;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 0.25rem;
          transition: all 0.2s;
        }

        .instructions-list a:hover {
          background: rgba(139, 92, 246, 0.2);
        }

        .nav-links {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .nav-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.7rem 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.6rem;
          color: #8888aa;
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateY(-2px);
        }
      `}</style>

      <div className="container">
        <header className="header">
          <h1>🎵 Music Studio</h1>
          <p>AI Songwriter Agents collaborate to create your next hit</p>
        </header>

        <nav className="nav-links">
          <a href="/" className="nav-link">🏠 Home</a>
          <a href="/meeting" className="nav-link">🤖 Staff Meeting</a>
          <a href="/voice" className="nav-link">🎤 Voice Control</a>
          <a href="https://suno.com" target="_blank" rel="noopener noreferrer" className="nav-link">🎵 Suno</a>
          <a href="https://neuralframes.com" target="_blank" rel="noopener noreferrer" className="nav-link">🎬 Neural Frames</a>
        </nav>

        <div className="main-grid">
          {/* Left: Input Form */}
          <div className="card">
            <h2 className="card-title">🎤 Create Your Song</h2>

            {error && <div className="error-message">{error}</div>}

            {/* Mode Selector */}
            <div className="form-group">
              <label className="form-label">Creative Mode</label>
              <div className="genre-grid">
                {modes.map((m) => (
                  <button
                    key={m.value}
                    className={`genre-btn ${mode === m.value ? 'active' : ''}`}
                    style={{ '--genre-color': m.color } as React.CSSProperties}
                    onClick={() => setMode(m.value)}
                  >
                    {m.label}
                    <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8 }}>{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Standard Mode Fields */}
            {mode === 'standard' && (
              <>
                <div className="form-group">
                  <label className="form-label">Theme / Concept</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., chasing dreams, midnight city, summer love..."
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Genre</label>
                  <div className="genre-grid">
                    {genres.map((g) => (
                      <button
                        key={g.value}
                        className={`genre-btn ${genre === g.value ? 'active' : ''}`}
                        style={{ '--genre-color': g.color } as React.CSSProperties}
                        onClick={() => setGenre(g.value)}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mood</label>
                  <div className="mood-grid">
                    {moods.map((m) => (
                      <button
                        key={m.value}
                        className={`mood-btn ${mood === m.value ? 'active' : ''}`}
                        onClick={() => setMood(m.value)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Political Mode (Newsician) Fields */}
            {mode === 'political' && (
              <>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(180, 30, 30, 0.1))',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '2rem' }}>🎤</span>
                    <div>
                      <h3 style={{ margin: 0, color: '#EF4444' }}>Newsician - Political Rap Duo</h3>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#ccc' }}>
                        <strong>The Truth Teller</strong> (MacDonald/Webby style) + <strong>The Outlaw</strong> (Yelawolf/Williams style)
                      </p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', opacity: 0.7 }}>
                        Pulling from Alpha News, Walter Hudson, and conservative sources to expose corruption.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Focus Area</label>
                  <div className="genre-grid">
                    <button
                      className={`genre-btn ${focusArea === 'minnesota' ? 'active' : ''}`}
                      style={{ '--genre-color': '#DC2626' } as React.CSSProperties}
                      onClick={() => setFocusArea('minnesota')}
                    >
                      🏔️ Minnesota
                      <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8 }}>DFL, Walz, Twin Cities</span>
                    </button>
                    <button
                      className={`genre-btn ${focusArea === 'national' ? 'active' : ''}`}
                      style={{ '--genre-color': '#1E40AF' } as React.CSSProperties}
                      onClick={() => setFocusArea('national')}
                    >
                      🇺🇸 National
                      <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8 }}>Federal, Congress, DC</span>
                    </button>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: '#a0a0c0'
                }}>
                  <strong>📰 News Sources Used:</strong><br />
                  Alpha News MN • Walter Hudson • Bring Me The News • The Blaze • Daily Wire • Fox News
                </div>
              </>
            )}

            {/* Sentinel Mode (Midwest Sentinel) Fields */}
            {mode === 'sentinel' && (
              <>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.2), rgba(20, 50, 150, 0.1))',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(30, 64, 175, 0.3)',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '2rem' }}>🎧</span>
                    <div>
                      <h3 style={{ margin: 0, color: '#60A5FA' }}>Midwest Sentinel - Platform-Friendly</h3>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#ccc' }}>
                        <strong>Boom Bap</strong> storytelling • USMC vet voice • Grandma-approved
                      </p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', opacity: 0.7 }}>
                        Metaphorical political themes. Clean enough to share, sharp enough to matter.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Focus Area</label>
                  <div className="genre-grid">
                    <button
                      className={`genre-btn ${focusArea === 'minnesota' ? 'active' : ''}`}
                      style={{ '--genre-color': '#1E40AF' } as React.CSSProperties}
                      onClick={() => setFocusArea('minnesota')}
                    >
                      🏔️ Minnesota
                      <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8 }}>Iron Range, Twin Cities, Rural</span>
                    </button>
                    <button
                      className={`genre-btn ${focusArea === 'national' ? 'active' : ''}`}
                      style={{ '--genre-color': '#7C3AED' } as React.CSSProperties}
                      onClick={() => setFocusArea('national')}
                    >
                      🇺🇸 National
                      <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8 }}>Heartland, Working Class</span>
                    </button>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: '#a0a0c0'
                }}>
                  <strong>🎵 Style:</strong> Boom Bap, Soul Samples, Storytelling Hip-Hop<br />
                  <strong>📜 Disclaimer:</strong> Fictional narrative for entertainment only
                </div>
              </>
            )}

            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  {mode === 'political' ? 'Newsician analyzing' : mode === 'sentinel' ? 'Sentinel gathering stories' : 'Songwriters collaborating'}
                  <span className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </>
              ) : (
                <>{mode === 'political' ? '🎤 Generate Political Rap (Explicit)' : mode === 'sentinel' ? '🎧 Generate Boom Bap Track (Clean)' : '🎵 Generate Song Prompt'}</>
              )}
            </button>

            {/* Agents */}
            <div style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Your Songwriting Team</label>
              <div className="agents-row">
                <div className="agent-chip">
                  <span className="agent-emoji">✍️</span>
                  <span>Lyricist</span>
                </div>
                <div className="agent-chip">
                  <span className="agent-emoji">🎹</span>
                  <span>Composer</span>
                </div>
                <div className="agent-chip">
                  <span className="agent-emoji">🎯</span>
                  <span>Critic</span>
                </div>
                <div className="agent-chip">
                  <span className="agent-emoji">🎧</span>
                  <span>Producer</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="card">
            <h2 className="card-title">📝 Your Suno Prompt</h2>

            {!result && !isGenerating && (
              <div className="empty-state">
                <div className="empty-state-icon">🎼</div>
                <p>Enter a theme and click Generate to create your song prompt</p>
              </div>
            )}

            {isGenerating && (
              <div className="transcript">
                <div className="transcript-entry">
                  <span className="transcript-emoji">✍️</span>
                  <div className="transcript-content">
                    <div className="transcript-agent">Lyricist</div>
                    <div className="transcript-message">Brainstorming lyrics for "{theme}"...</div>
                  </div>
                </div>
                <div className="transcript-entry">
                  <span className="transcript-emoji">🎹</span>
                  <div className="transcript-content">
                    <div className="transcript-agent">Composer</div>
                    <div className="transcript-message">Designing {genre} style and arrangement...</div>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <>
                <div className="transcript">
                  {result.transcript?.map((entry, i) => (
                    <div key={i} className="transcript-entry">
                      <span className="transcript-emoji">{entry.emoji}</span>
                      <div className="transcript-content">
                        <div className="transcript-agent">{entry.agent}</div>
                        <div className="transcript-message">{entry.message}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="prompt-box">
                  <div className="prompt-label">Copy this to Suno</div>
                  <div className="prompt-text">
                    {result.sunoPrompt?.fullPrompt || result.sunoPrompt?.copyToSuno}
                  </div>
                </div>

                <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copyToClipboard}>
                  {copied ? '✅ Copied!' : '📋 Copy Prompt to Clipboard'}
                </button>

                <div className="instructions">
                  <div className="instructions-title">Next Steps</div>
                  <ul className="instructions-list">
                    <li>Go to <a href="https://suno.com" target="_blank" rel="noopener noreferrer">suno.com</a></li>
                    <li>Paste the prompt and generate 2-3 variations</li>
                    <li>Pick your favorite and download the audio</li>
                    <li>Upload to <a href="https://neuralframes.com" target="_blank" rel="noopener noreferrer">Neural Frames</a> for video</li>
                    <li>Publish to <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer">YouTube Studio</a></li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
