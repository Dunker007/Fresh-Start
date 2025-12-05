/**
 * LuxRig Bridge Server
 * Aggregates all AI services running on LuxRig into a single API
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Load environment
dotenv.config();

// Import services
import { lmstudioService } from './services/lmstudio.js';
import { ollamaService } from './services/ollama.js';
import { systemService } from './services/system.js';

const app = express();
const PORT = process.env.PORT || 3456;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server for both Express and WebSocket
const server = createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server, path: '/stream' });

// Track connected clients
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('🔌 Client connected to stream');
    clients.add(ws);

    // Send initial status
    sendStatus(ws);

    ws.on('close', () => {
        clients.delete(ws);
        console.log('🔌 Client disconnected');
    });
});

// Broadcast to all connected clients
function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === 1) { // OPEN
            client.send(message);
        }
    });
}

// Send full status to a client
async function sendStatus(ws) {
    const status = await getFullStatus();
    ws.send(JSON.stringify({ type: 'status', data: status }));
}

// Get full system status
async function getFullStatus() {
    const [lmstudio, ollama, system] = await Promise.all([
        lmstudioService.getStatus(),
        ollamaService.getStatus(),
        systemService.getMetrics()
    ]);

    return {
        timestamp: new Date().toISOString(),
        services: {
            lmstudio,
            ollama
        },
        system
    };
}

// ============ REST API Routes ============

// Health check
app.get('/', (req, res) => {
    res.json({
        name: 'LuxRig Bridge',
        version: '1.0.0',
        status: 'operational',
        endpoints: {
            status: '/status',
            llm: '/llm/*',
            system: '/system',
            stream: 'ws://localhost:3456/stream'
        }
    });
});

// Full system status
app.get('/status', async (req, res) => {
    try {
        const status = await getFullStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ LLM Routes ============

// List all models from all providers
app.get('/llm/models', async (req, res) => {
    try {
        const [lmModels, ollamaModels] = await Promise.all([
            lmstudioService.listModels(),
            ollamaService.listModels()
        ]);

        res.json({
            lmstudio: lmModels,
            ollama: ollamaModels,
            total: (lmModels?.length || 0) + (ollamaModels?.length || 0)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chat completion (routes to best available)
app.post('/llm/chat', async (req, res) => {
    const { messages, model, provider } = req.body;

    try {
        let response;

        if (provider === 'ollama') {
            response = await ollamaService.chat(messages, model);
        } else {
            // Default to LM Studio
            response = await lmstudioService.chat(messages, model);
        }

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ System Routes ============

// Real-time system metrics
app.get('/system', async (req, res) => {
    try {
        const metrics = await systemService.getMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GPU stats (nvidia-smi)
app.get('/system/gpu', async (req, res) => {
    try {
        const gpu = await systemService.getGPU();
        res.json(gpu);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ Periodic Updates ============

// Broadcast status every 5 seconds
setInterval(async () => {
    if (clients.size > 0) {
        const status = await getFullStatus();
        broadcast({ type: 'status', data: status });
    }
}, 5000);

// Start server
server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   LUXRIG BRIDGE v1.0.0                    ║
╠═══════════════════════════════════════════════════════════╣
║  REST API:    http://localhost:${PORT}                      ║
║  WebSocket:   ws://localhost:${PORT}/stream                 ║
╠═══════════════════════════════════════════════════════════╣
║  Services:                                                ║
║    • LM Studio  → localhost:1234                          ║
║    • Ollama     → localhost:11434                         ║
║    • System     → nvidia-smi, WMI                         ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
