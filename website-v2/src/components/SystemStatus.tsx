'use client';

import { useState, useEffect } from 'react';

interface ServiceStatus {
    online: boolean;
    url?: string;
    modelCount?: number;
    loadedModel?: string;
    runningModels?: string[];
    error?: string;
}

interface SystemMetrics {
    gpu: {
        available: boolean;
        name?: string;
        utilization?: number;
        memoryUsedGB?: string;
        memoryTotalGB?: string;
        memoryPercent?: string;
        temperature?: number;
        powerDraw?: number;
    };
    cpu: {
        name?: string;
        cores?: number;
        utilization?: number;
    };
    memory: {
        totalGB?: string;
        usedGB?: string;
        percentUsed?: string;
    };
}

interface BridgeStatus {
    timestamp: string;
    services: {
        lmstudio: ServiceStatus;
        ollama: ServiceStatus;
    };
    system: SystemMetrics;
}

const BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://localhost:3456';

export default function SystemStatus() {
    const [status, setStatus] = useState<BridgeStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // Initial fetch
        fetchStatus();

        // WebSocket for real-time updates
        const ws = new WebSocket(`ws://localhost:3456/stream`);

        ws.onopen = () => {
            console.log('🔌 Connected to LuxRig Bridge');
            setConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'status') {
                setStatus(data.data);
                setError(null);
            }
        };

        ws.onerror = () => {
            setError('WebSocket connection failed');
            setConnected(false);
        };

        ws.onclose = () => {
            setConnected(false);
        };

        return () => ws.close();
    }, []);

    async function fetchStatus() {
        try {
            const res = await fetch(`${BRIDGE_URL}/status`);
            const data = await res.json();
            setStatus(data);
            setError(null);
        } catch (e) {
            setError('Failed to connect to LuxRig');
        }
    }

    if (error && !status) {
        return (
            <div className="glass-card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="status-dot offline"></div>
                    <span className="text-red-400">LuxRig Offline</span>
                </div>
                <p className="text-sm text-gray-400">{error}</p>
            </div>
        );
    }

    if (!status) {
        return (
            <div className="glass-card">
                <div className="skeleton h-20 w-full"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* LM Studio Status */}
            <div className="glass-card">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`status-dot ${status.services.lmstudio.online ? 'online' : 'offline'}`}></div>
                    <span className="font-semibold">LM Studio</span>
                </div>
                {status.services.lmstudio.online ? (
                    <>
                        <p className="text-sm text-gray-400 mb-1">
                            {status.services.lmstudio.modelCount} models
                        </p>
                        <p className="text-cyan-400 text-sm truncate">
                            🧠 {status.services.lmstudio.loadedModel || 'No model loaded'}
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-red-400">Not responding</p>
                )}
            </div>

            {/* Ollama Status */}
            <div className="glass-card">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`status-dot ${status.services.ollama.online ? 'online' : 'offline'}`}></div>
                    <span className="font-semibold">Ollama</span>
                </div>
                {status.services.ollama.online ? (
                    <>
                        <p className="text-sm text-gray-400 mb-1">
                            {status.services.ollama.modelCount} models
                        </p>
                        <p className="text-purple-400 text-sm">
                            {status.services.ollama.runningModels?.length
                                ? `Running: ${status.services.ollama.runningModels.join(', ')}`
                                : 'Ready'}
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-red-400">Not responding</p>
                )}
            </div>

            {/* GPU Status */}
            <div className="glass-card">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`status-dot ${status.system.gpu.available ? 'online' : 'offline'}`}></div>
                    <span className="font-semibold">GPU</span>
                </div>
                {status.system.gpu.available ? (
                    <>
                        <p className="text-sm text-gray-400 mb-1 truncate">
                            {status.system.gpu.name}
                        </p>
                        <div className="flex justify-between text-sm">
                            <span className="text-cyan-400">
                                {status.system.gpu.memoryUsedGB}/{status.system.gpu.memoryTotalGB}GB
                            </span>
                            <span className="text-yellow-400">
                                {status.system.gpu.temperature}°C
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                            <div
                                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${status.system.gpu.memoryPercent}%` }}
                            ></div>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-red-400">Not available</p>
                )}
            </div>

            {/* System Status */}
            <div className="glass-card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="status-dot online"></div>
                    <span className="font-semibold">System</span>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">CPU</span>
                        <span className="text-cyan-400">{status.system.cpu.utilization}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">RAM</span>
                        <span className="text-purple-400">
                            {status.system.memory.usedGB}/{status.system.memory.totalGB}GB
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
