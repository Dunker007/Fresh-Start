'use client';

import Link from 'next/link';

export default function ArtStudioPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0a12 0%, #0f0f23 50%, #0a0a12 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            color: 'white'
        }}>
            <div style={{ textAlign: 'center', maxWidth: '600px' }}>
                <div style={{ fontSize: '6rem', marginBottom: '1.5rem' }}>🎨</div>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1rem'
                }}>
                    DLX Art Studio
                </h1>
                <p style={{ color: '#8888aa', fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                    AI image generation and editing. Create album covers, thumbnails, and visual assets for your brand.
                </p>
                <div style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '2rem',
                    color: '#A78BFA',
                    fontWeight: 600,
                    marginBottom: '2rem'
                }}>
                    ◌ Coming Soon
                </div>
                <div style={{ marginTop: '2rem' }}>
                    <Link href="/studios" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '1rem 2rem',
                        background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                        borderRadius: '0.75rem',
                        color: 'white',
                        textDecoration: 'none',
                        fontWeight: 600,
                        transition: 'transform 0.2s'
                    }}>
                        ← Back to AI Studios
                    </Link>
                </div>
            </div>
        </div>
    );
}
