'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionResultList {
    length: number;
    [index: number]: SpeechRecognitionResult;
}

interface ISpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
}

// Type casting helper for browser compatibility
// eslint-disable-next-line
const getSpeechRecognition = (): (new () => ISpeechRecognition) | undefined => {
    // eslint-disable-next-line
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
};

// Voice command intents
const COMMAND_INTENTS = {
    // Navigation
    go_to: /^(go to|navigate to|open|show)\s+(.+)$/i,
    back: /^(go back|back|previous)$/i,

    // Agent commands
    execute_agent: /^(ask|run|execute|start)\s+(research|code|architect|security|qa|devops)\s*(.*)$/i,
    meeting: /^(start|begin|hold)\s+(a\s+)?meeting\s*(about|on)?\s*(.*)$/i,

    // System commands
    status: /^(show|get|what('?s|\s+is))\s+(the\s+)?(status|health)$/i,
    help: /^(help|what can you do|commands)$/i,

    // Chat
    chat: /^(chat|talk|ask)\s+(.+)$/i,
};

interface VoiceCommand {
    intent: string;
    params: Record<string, string>;
    raw: string;
    confidence: number;
    timestamp: Date;
}

export default function VoiceControlPage() {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [commands, setCommands] = useState<VoiceCommand[]>([]);
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
    const [lastResult, setLastResult] = useState<string | null>(null);
    const [voiceVisualization, setVoiceVisualization] = useState<number>(0);

    const recognitionRef = useRef<ISpeechRecognition | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);

    // Check for Web Speech API support
    useEffect(() => {
        const SpeechRecognition = getSpeechRecognition();
        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setStatus('listening');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript;
                } else {
                    interim += result[0].transcript;
                }
            }

            setInterimTranscript(interim);

            if (final) {
                setTranscript(prev => prev + ' ' + final);
                processCommand(final.trim(), event.results[event.resultIndex][0].confidence);
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setStatus('error');
            if (event.error === 'not-allowed') {
                setIsSupported(false);
            }
        };

        recognition.onend = () => {
            if (isListening) {
                // Restart if still listening
                recognition.start();
            } else {
                setStatus('idle');
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isListening]);

    // Voice visualization using Web Audio API
    const startVisualization = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);

            analyser.fftSize = 256;
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const visualize = () => {
                if (!analyserRef.current) return;

                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(dataArray);

                const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                setVoiceVisualization(average);

                animationRef.current = requestAnimationFrame(visualize);
            };

            visualize();
        } catch (error) {
            console.error('Error accessing microphone for visualization:', error);
        }
    };

    const stopVisualization = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        setVoiceVisualization(0);
    };

    // Parse command intent
    const parseIntent = (text: string): { intent: string; params: Record<string, string> } | null => {
        for (const [intent, pattern] of Object.entries(COMMAND_INTENTS)) {
            const match = text.match(pattern);
            if (match) {
                const params: Record<string, string> = {};

                switch (intent) {
                    case 'go_to':
                        params.destination = match[2];
                        break;
                    case 'execute_agent':
                        params.agentType = match[2].toLowerCase();
                        params.task = match[3] || '';
                        break;
                    case 'meeting':
                        params.topic = match[4] || '';
                        break;
                    case 'chat':
                        params.message = match[2];
                        break;
                }

                return { intent, params };
            }
        }
        return null;
    };

    // Process recognized command
    const processCommand = async (text: string, confidence: number) => {
        setStatus('processing');

        const parsed = parseIntent(text);

        const command: VoiceCommand = {
            intent: parsed?.intent || 'unknown',
            params: parsed?.params || {},
            raw: text,
            confidence,
            timestamp: new Date()
        };

        setCommands(prev => [command, ...prev].slice(0, 10));

        // Execute command
        try {
            let result = '';

            if (parsed) {
                switch (parsed.intent) {
                    case 'go_to':
                        result = `Navigating to ${parsed.params.destination}...`;
                        // In real implementation: router.push(`/${parsed.params.destination}`);
                        break;

                    case 'execute_agent':
                        result = `Running ${parsed.params.agentType} agent...`;
                        // Call agent API
                        break;

                    case 'meeting':
                        result = `Starting staff meeting about "${parsed.params.topic}"...`;
                        break;

                    case 'status':
                        result = 'Fetching system status...';
                        break;

                    case 'help':
                        result = 'Available commands: Go to [page], Ask [agent] [task], Start meeting about [topic], Show status';
                        break;

                    case 'chat':
                        result = `Processing: "${parsed.params.message}"`;
                        break;

                    default:
                        result = `Command not recognized: "${text}"`;
                }
            } else {
                result = `I heard: "${text}" - Try saying "help" for available commands`;
            }

            setLastResult(result);

            // Speak response
            speakResponse(result);

        } catch (error) {
            console.error('Command execution error:', error);
            setLastResult('Error executing command');
        }

        setStatus('listening');
    };

    // Text-to-speech response
    const speakResponse = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Toggle listening
    const toggleListening = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
            stopVisualization();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            startVisualization();
            setIsListening(true);
            setTranscript('');
        }
    }, [isListening]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && e.ctrlKey) {
                e.preventDefault();
                toggleListening();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleListening]);

    if (!isSupported) {
        return (
            <div className="voice-not-supported">
                <style jsx>{`
          .voice-not-supported {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
            color: #e0e0e0;
            text-align: center;
            padding: 2rem;
          }
          h1 { color: #ef4444; margin-bottom: 1rem; }
          p { color: #888; max-width: 400px; }
        `}</style>
                <h1>🎤 Voice Control Unavailable</h1>
                <p>
                    Your browser doesn't support the Web Speech API, or microphone access was denied.
                    Please try Chrome, Edge, or Safari and ensure microphone permissions are granted.
                </p>
            </div>
        );
    }

    return (
        <div className="voice-control-container">
            <style jsx>{`
        .voice-control-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
          color: #e0e0e0;
          padding: 2rem;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header h1 {
          font-size: 2.5rem;
          background: linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .header p {
          color: #888;
        }

        .shortcut-hint {
          display: inline-block;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }

        .mic-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }

        .mic-button {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        }

        .mic-button:hover {
          transform: scale(1.05);
        }

        .mic-button.listening {
          animation: pulse ${isListening ? '2s' : '0s'} infinite;
          box-shadow: 0 0 ${voiceVisualization}px rgba(139, 92, 246, 0.6);
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
        }

        .mic-icon {
          font-size: 3rem;
        }

        .status-badge {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-idle { background: rgba(107, 114, 128, 0.3); }
        .status-listening { background: rgba(34, 197, 94, 0.3); color: #22c55e; }
        .status-processing { background: rgba(59, 130, 246, 0.3); color: #3b82f6; }
        .status-error { background: rgba(239, 68, 68, 0.3); color: #ef4444; }

        .visualizer {
          display: flex;
          gap: 4px;
          height: 60px;
          align-items: center;
          margin-top: 1.5rem;
        }

        .visualizer-bar {
          width: 4px;
          background: linear-gradient(to top, #3b82f6, #8b5cf6);
          border-radius: 2px;
          transition: height 0.1s ease;
        }

        .transcript-section {
          max-width: 600px;
          margin: 0 auto 2rem;
          text-align: center;
        }

        .transcript-box {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          padding: 1rem;
          min-height: 60px;
        }

        .interim {
          color: #666;
          font-style: italic;
        }

        .result-box {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 0.5rem;
        }

        .commands-section {
          max-width: 600px;
          margin: 0 auto;
        }

        .commands-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .commands-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .command-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .command-content {
          flex: 1;
        }

        .command-raw {
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .command-intent {
          font-size: 0.75rem;
          color: #888;
        }

        .command-confidence {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .help-section {
          max-width: 600px;
          margin: 2rem auto 0;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
        }

        .help-section h3 {
          margin-bottom: 1rem;
          color: #888;
        }

        .help-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .help-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 0.25rem;
          font-size: 0.9rem;
        }
      `}</style>

            <header className="header">
                <h1>🎤 God Mode Voice Control</h1>
                <p>Control the entire platform with your voice</p>
                <div className="shortcut-hint">Press Ctrl + Space to toggle</div>
            </header>

            <div className="mic-section">
                <button
                    className={`mic-button ${isListening ? 'listening' : ''}`}
                    onClick={toggleListening}
                    style={{
                        boxShadow: isListening ? `0 0 ${20 + voiceVisualization}px rgba(139, 92, 246, ${0.4 + voiceVisualization / 200})` : undefined
                    }}
                >
                    <span className="mic-icon">{isListening ? '🎙️' : '🎤'}</span>
                </button>

                <div className={`status-badge status-${status}`}>
                    {status === 'idle' && 'Ready'}
                    {status === 'listening' && '● Listening...'}
                    {status === 'processing' && '⏳ Processing...'}
                    {status === 'error' && '⚠️ Error'}
                </div>

                {isListening && (
                    <div className="visualizer">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="visualizer-bar"
                                style={{
                                    height: `${Math.min(60, Math.random() * voiceVisualization * 2)}px`
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="transcript-section">
                <div className="transcript-box">
                    {transcript && <p>{transcript}</p>}
                    {interimTranscript && <p className="interim">{interimTranscript}</p>}
                    {!transcript && !interimTranscript && (
                        <p style={{ color: '#666' }}>Start speaking to see your words here...</p>
                    )}
                </div>

                {lastResult && (
                    <div className="result-box">
                        <strong>🤖 Response:</strong> {lastResult}
                    </div>
                )}
            </div>

            {commands.length > 0 && (
                <div className="commands-section">
                    <div className="commands-header">
                        <h3>📜 Recent Commands</h3>
                        <button
                            onClick={() => setCommands([])}
                            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                        >
                            Clear
                        </button>
                    </div>
                    <div className="commands-list">
                        {commands.map((cmd, i) => (
                            <div key={i} className="command-item">
                                <div className="command-content">
                                    <div className="command-raw">"{cmd.raw}"</div>
                                    <div className="command-intent">
                                        Intent: {cmd.intent}
                                        {Object.keys(cmd.params).length > 0 && (
                                            <> | Params: {JSON.stringify(cmd.params)}</>
                                        )}
                                    </div>
                                </div>
                                <span className="command-confidence">
                                    {(cmd.confidence * 100).toFixed(0)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="help-section">
                <h3>💡 Example Commands</h3>
                <div className="help-grid">
                    <div className="help-item">🗺️ "Go to dashboard"</div>
                    <div className="help-item">🔍 "Ask research about AI trends"</div>
                    <div className="help-item">💻 "Run code create React component"</div>
                    <div className="help-item">👥 "Start meeting about security"</div>
                    <div className="help-item">📊 "Show status"</div>
                    <div className="help-item">❓ "Help"</div>
                </div>
            </div>
        </div>
    );
}

