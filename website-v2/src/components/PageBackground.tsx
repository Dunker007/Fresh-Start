'use client';

import React from 'react';

interface PageBackgroundProps {
    color?: 'cyan' | 'green' | 'purple' | 'amber' | 'pink' | 'emerald' | 'orange' | 'indigo' | 'red' | 'blue';
}

export default function PageBackground({ color = 'cyan' }: PageBackgroundProps) {
    // Tailwind colors to hex/rgba mapping for style injection
    const colorMap: Record<string, string> = {
        cyan: '0, 245, 212',
        green: '0, 200, 83',
        purple: '123, 47, 247',
        amber: '255, 191, 0',
        pink: '236, 64, 122',
        emerald: '46, 204, 113',
        orange: '255, 152, 0',
        indigo: '99, 102, 241',
        red: '255, 23, 68',
        blue: '41, 121, 255'
    };

    const rgb = colorMap[color] || colorMap.cyan;

    return (
        <div className="fixed inset-0 min-h-screen w-full pointer-events-none -z-50 overflow-hidden bg-[#050508]">
            {/* Subtle Animated Grid - Retained as requested */}
            <div className="absolute inset-0 bg-grid opacity-[0.1]" />

            {/* Radiant Floodlight Effect */}
            <div className="absolute top-[-10%] left-0 right-0 h-[120vh] w-full flex justify-center">

                {/* 1. Core Beam: Conic Gradient for the directional spread */}
                <div
                    className="absolute top-0 w-full h-full opacity-60 mix-blend-screen"
                    style={{
                        background: `conic-gradient(from 180deg at 50% 0%, transparent 140deg, rgba(${rgb}, 0.1) 160deg, rgba(${rgb}, 0.6) 180deg, rgba(${rgb}, 0.1) 200deg, transparent 220deg)`,
                        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                        filter: 'blur(40px)'
                    }}
                />

                {/* 2. Soft Ambient Cone: Radial Ellipse stretched vertically */}
                <div
                    className="absolute top-0 w-[80%] h-[70%] opacity-40 mix-blend-screen"
                    style={{
                        background: `radial-gradient(ellipse at 50% 0%, rgba(${rgb}, 0.4), transparent 70%)`,
                        filter: 'blur(60px)',
                    }}
                />

                {/* 3. Source Glow: Hotspot at the very top */}
                <div
                    className="absolute top-[-50px] w-[300px] h-[150px] rounded-full opacity-80 mix-blend-screen"
                    style={{
                        background: `rgba(${rgb}, 0.8)`,
                        filter: 'blur(80px)',
                    }}
                />
            </div>
        </div>
    );
}
