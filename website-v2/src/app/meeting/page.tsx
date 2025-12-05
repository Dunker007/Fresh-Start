'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

// Agent persona definitions with avatars and colors
const AGENT_PERSONAS = {
    architect: {
        name: 'The Architect',
        emoji: '🏗️',
        color: '#6366f1', // Indigo
        description: 'Focuses on structure, scalability, and design patterns',
        style: 'methodical and visionary',
    },
    security: {
        name: 'Security Officer',
        emoji: '🔒',
        color: '#ef4444', // Red
        description: 'Paranoid about vulnerabilities and data protection',
        style: 'cautious and thorough',
    },
    qa: {
        name: 'QA Lead',
        emoji: '🔍',
        color: '#22c55e', // Green
        description: 'Pedantic about edge cases and testing coverage',
        style: 'detail-oriented and skeptical',
    },
    devops: {
        name: 'DevOps Engineer',
        emoji: '⚙️',
        color: '#f59e0b', // Amber
        description: 'Thinks about deployment, scaling, and infrastructure',
        style: 'practical and efficiency-focused',
    },
};

interface MeetingMessage {
    id: string;
    agent: string;
    round: number;
    message: string;
    timestamp: string;
    type: 'brainstorm' | 'debate' | 'consensus';
}

interface MeetingResult {
    meetingId: string;
    topic: string;
    participants: string[];
    transcript: MeetingMessage[];
    consensus: string;
    actionItems: string[];
    duration: number;
}

export default function StaffMeetingPage() {
    const [topic, setTopic] = useState('');
    const [selectedAgents, setSelectedAgents] = useState<string[]>(['architect', 'security', 'qa']);
    const [rounds, setRounds] = useState(2);
    const [isRunning, setIsRunning] = useState(false);
    const [messages, setMessages] = useState<MeetingMessage[]>([]);
    const [result, setResult] = useState<MeetingResult | null>(null);
    const [currentRound, setCurrentRound] = useState(0);
    const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const toggleAgent = (agent: string) => {
        setSelectedAgents(prev =>
            prev.includes(agent)
                ? prev.filter(a => a !== agent)
                : [...prev, agent]
        );
    };

    const startMeeting = async () => {
        if (!topic.trim() || selectedAgents.length < 2) return;

        setIsRunning(true);
        setMessages([]);
        setResult(null);
        setCurrentRound(0);

        try {
            const response = await fetch(`${LUXRIG_BRIDGE_URL}/agents/meeting`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    participants: selectedAgents,
                    rounds
                })
            });

            if (!response.ok) throw new Error('Meeting failed');

            // For streaming effect, simulate receiving messages
            const data = await response.json();

            // Simulate message arrival with typing effect
            for (let i = 0; i < data.transcript.length; i++) {
                const msg = data.transcript[i];
                setCurrentSpeaker(msg.agent);
                setCurrentRound(msg.round);

                await new Promise(resolve => setTimeout(resolve, 500));

                setMessages(prev => [...prev, msg]);
                setCurrentSpeaker(null);

                await new Promise(resolve => setTimeout(resolve, 300));
            }

            setResult(data);
        } catch (error) {
            console.error('Meeting error:', error);
            // Add error message
            setMessages(prev => [...prev, {
                id: 'error',
                agent: 'system',
                round: 0,
                message: 'Meeting encountered an error. Please try again.',
                timestamp: new Date().toISOString(),
                type: 'consensus'
            }]);
        } finally {
            setIsRunning(false);
            setCurrentSpeaker(null);
        }
    };

    const getAgentStyle = (agent: string) => {
        const persona = AGENT_PERSONAS[agent as keyof typeof AGENT_PERSONAS];
        return persona || { color: '#666', emoji: '🤖', name: agent };
    };

    return (
        <div className="staff-meeting-container">
            <style jsx>{`
        .staff-meeting-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
          color: #e0e0e0;
          padding: 2rem;
        }

        .meeting-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .meeting-header h1 {
          font-size: 2.5rem;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .meeting-header p {
          color: #888;
          font-style: italic;
        }

        .meeting-setup {
          max-width: 800px;
          margin: 0 auto 2rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .topic-input {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          color: white;
          margin-bottom: 1rem;
        }

        .topic-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }

        .agents-selection {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .agent-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 2rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
          background: rgba(0, 0, 0, 0.3);
        }

        .agent-chip:hover {
          transform: translateY(-2px);
        }

        .agent-chip.selected {
          background: var(--agent-color);
          border-color: var(--agent-color);
          box-shadow: 0 0 15px var(--agent-color);
        }

        .agent-chip .emoji {
          font-size: 1.5rem;
        }

        .controls-row {
          display: flex;
          gap: 1rem;
          align-items: center;
          justify-content: space-between;
        }

        .rounds-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .rounds-control input {
          width: 60px;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.25rem;
          color: white;
          text-align: center;
        }

        .start-button {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 0.5rem;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .start-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(99, 102, 241, 0.4);
        }

        .start-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .meeting-room {
          max-width: 900px;
          margin: 0 auto;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 1rem;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .room-header {
          padding: 1rem 1.5rem;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .round-indicator {
          background: rgba(99, 102, 241, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.9rem;
        }

        .participants-bar {
          display: flex;
          gap: 0.5rem;
        }

        .participant-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .participant-avatar.speaking {
          animation: pulse 1s infinite;
          box-shadow: 0 0 20px currentColor;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .messages-container {
          height: 400px;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .message {
          margin-bottom: 1.5rem;
          display: flex;
          gap: 1rem;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .message-content {
          flex: 1;
        }

        .message-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .message-name {
          font-weight: 600;
        }

        .message-round {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
          background: rgba(255, 255, 255, 0.1);
        }

        .message-text {
          line-height: 1.6;
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem;
          border-radius: 0.5rem;
          border-left: 3px solid var(--agent-color);
        }

        .typing-indicator {
          display: flex;
          gap: 0.25rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          width: fit-content;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background: currentColor;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .meeting-minutes {
          margin-top: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .minutes-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        .consensus-box {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .action-items {
          list-style: none;
          padding: 0;
        }

        .action-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .action-item:last-child {
          border-bottom: none;
        }

        .action-checkbox {
          color: #6366f1;
        }
      `}</style>

            <header className="meeting-header">
                <h1>👥 AI Staff Meeting</h1>
                <p>"None of us is as smart as all of us." - Ken Blanchard</p>
            </header>

            <div className="meeting-setup">
                <input
                    type="text"
                    className="topic-input"
                    placeholder="What should we discuss? (e.g., Design a secure authentication system)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isRunning}
                />

                <div className="agents-selection">
                    {Object.entries(AGENT_PERSONAS).map(([key, persona]) => (
                        <div
                            key={key}
                            className={`agent-chip ${selectedAgents.includes(key) ? 'selected' : ''}`}
                            style={{ '--agent-color': persona.color } as React.CSSProperties}
                            onClick={() => !isRunning && toggleAgent(key)}
                            title={persona.description}
                        >
                            <span className="emoji">{persona.emoji}</span>
                            <span>{persona.name}</span>
                        </div>
                    ))}
                </div>

                <div className="controls-row">
                    <div className="rounds-control">
                        <label>Debate Rounds:</label>
                        <input
                            type="number"
                            min={1}
                            max={5}
                            value={rounds}
                            onChange={(e) => setRounds(Number(e.target.value))}
                            disabled={isRunning}
                        />
                    </div>

                    <button
                        className="start-button"
                        onClick={startMeeting}
                        disabled={isRunning || !topic.trim() || selectedAgents.length < 2}
                    >
                        {isRunning ? '🎙️ Meeting in Progress...' : '🚀 Start Meeting'}
                    </button>
                </div>
            </div>

            {(messages.length > 0 || isRunning) && (
                <div className="meeting-room">
                    <div className="room-header">
                        <div className="round-indicator">
                            Round {currentRound || 1} of {rounds * 2}
                        </div>
                        <div className="participants-bar">
                            {selectedAgents.map(agent => {
                                const persona = getAgentStyle(agent);
                                return (
                                    <div
                                        key={agent}
                                        className={`participant-avatar ${currentSpeaker === agent ? 'speaking' : ''}`}
                                        style={{ backgroundColor: persona.color, color: 'white' }}
                                        title={persona.name}
                                    >
                                        {persona.emoji}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="messages-container">
                        {messages.map((msg) => {
                            const persona = getAgentStyle(msg.agent);
                            return (
                                <div key={msg.id} className="message">
                                    <div
                                        className="message-avatar"
                                        style={{ backgroundColor: persona.color }}
                                    >
                                        {persona.emoji}
                                    </div>
                                    <div className="message-content">
                                        <div className="message-header">
                                            <span className="message-name" style={{ color: persona.color }}>
                                                {persona.name}
                                            </span>
                                            <span className="message-round">
                                                {msg.type === 'brainstorm' ? '💡 Brainstorm' :
                                                    msg.type === 'debate' ? '⚔️ Debate' : '✅ Consensus'}
                                            </span>
                                        </div>
                                        <div
                                            className="message-text"
                                            style={{ '--agent-color': persona.color } as React.CSSProperties}
                                        >
                                            {msg.message}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {currentSpeaker && (
                            <div className="message">
                                <div
                                    className="message-avatar"
                                    style={{ backgroundColor: getAgentStyle(currentSpeaker).color }}
                                >
                                    {getAgentStyle(currentSpeaker).emoji}
                                </div>
                                <div className="message-content">
                                    <div
                                        className="typing-indicator"
                                        style={{ color: getAgentStyle(currentSpeaker).color }}
                                    >
                                        <span className="typing-dot"></span>
                                        <span className="typing-dot"></span>
                                        <span className="typing-dot"></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>
            )}

            {result && (
                <div className="meeting-minutes">
                    <div className="minutes-header">
                        📋 Meeting Minutes
                    </div>

                    <div className="consensus-box">
                        <strong>✅ Consensus Reached:</strong>
                        <p>{result.consensus}</p>
                    </div>

                    {result.actionItems.length > 0 && (
                        <>
                            <h4>📌 Action Items:</h4>
                            <ul className="action-items">
                                {result.actionItems.map((item, i) => (
                                    <li key={i} className="action-item">
                                        <span className="action-checkbox">☐</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '1rem' }}>
                        Duration: {(result.duration / 1000).toFixed(1)}s |
                        Participants: {result.participants.join(', ')}
                    </p>
                </div>
            )}
        </div>
    );
}
