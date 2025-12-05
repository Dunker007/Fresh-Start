'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type VibeMode = 'normal' | 'high-load' | 'crisis' | 'focus';

interface VibeState {
    mode: VibeMode;
    metrics: {
        gpuUsage: number;
        cpuUsage: number;
        errorRate: number;
    };
    setMode: (mode: VibeMode) => void;
}

const VibeContext = createContext<VibeState | undefined>(undefined);

const LUXRIG_BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://localhost:3456';
const WS_URL = LUXRIG_BRIDGE_URL.replace('http', 'ws') + '/stream';

export function VibeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<VibeMode>('normal');
    const [metrics, setMetrics] = useState({ gpuUsage: 0, cpuUsage: 0, errorRate: 0 });
    const [manualOverride, setManualOverride] = useState(false);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'status') {
                    const { system, errors } = message.data;

                    // Extract metrics
                    const gpuUsage = system?.gpu?.utilization || 0;
                    const cpuUsage = system?.cpu?.usage || 0;
                    const errorRate = errors?.rate || 0; // Errors per minute

                    setMetrics({ gpuUsage, cpuUsage, errorRate });

                    // Automatic Vibe Switching (if not manually overridden)
                    if (!manualOverride) {
                        if (errorRate > 5) {
                            setMode('crisis');
                        } else if (gpuUsage > 80 || cpuUsage > 90) {
                            setMode('high-load');
                        } else {
                            setMode('normal');
                        }
                    }
                }
            } catch (e) {
                // Ignore parse errors
            }
        };

        return () => {
            ws.close();
        };
    }, [manualOverride]);

    // Apply global classes to body based on mode
    useEffect(() => {
        document.body.setAttribute('data-vibe', mode);

        // Dynamic Favicon/Title updates could go here
    }, [mode]);

    return (
        <VibeContext.Provider value={{ mode, metrics, setMode: (m) => { setMode(m); setManualOverride(true); } }}>
            {children}
        </VibeContext.Provider>
    );
}

export function useVibe() {
    const context = useContext(VibeContext);
    if (context === undefined) {
        throw new Error('useVibe must be used within a VibeProvider');
    }
    return context;
}
