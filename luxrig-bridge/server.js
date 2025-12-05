/**
 * LuxRig Bridge Server
 * Aggregates all AI services running on LuxRig into a single API
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Load environment
dotenv.config();

// Import services
import { lmstudioService } from './services/lmstudio.js';
import { ollamaService } from './services/ollama.js';
import { systemService } from './services/system.js';
import { googleService } from './services/google.js';
import { createAgent } from './services/agents.js';
import { errorHandler, errorLogger, rateLimiter, asyncHandler, validate } from './services/errors.js';
import { performanceMonitor, cache } from './services/performance.js';

const app = express();
const PORT = process.env.PORT || 3456;

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'LuxRig Bridge API',
            version: '1.0.0',
            description: 'Production-ready Agentic AI Platform API - Aggregates LM Studio, Ollama, Google Services, and autonomous AI agents',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Development server',
            },
        ],
    },
    apis: ['./server.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());
app.use(performanceMonitor.middleware()); // Track all request performance

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
    const [lmstudio, ollama, system, errors] = await Promise.all([
        lmstudioService.getStatus(),
        ollamaService.getStatus(),
        systemService.getMetrics(),
        errorLogger.getStats()
    ]);

    return {
        timestamp: new Date().toISOString(),
        services: {
            lmstudio,
            ollama
        },
        system,
        errors,
        agents: Array.from(activeAgents.values()).map(agent => ({
            id: agent.id,
            name: agent.name,
            status: agent.status,
            type: agent.id.split('-')[0] // Derive type from ID or add type property to agent
        }))
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

// List LM Studio models only
app.get('/llm/lmstudio/models', async (req, res) => {
    try {
        const models = await lmstudioService.listModels();
        res.json(models);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List Ollama models only
app.get('/llm/ollama/models', async (req, res) => {
    try {
        const models = await ollamaService.listModels();
        res.json(models);
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

// ============ Google OAuth Routes ============

// Get OAuth URL
app.get('/auth/google', (req, res) => {
    try {
        const authUrl = googleService.getAuthUrl();
        res.json({ authUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// OAuth callback
app.get('/auth/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        const tokens = await googleService.getTokens(code);

        // In production, store tokens securely
        // For now, return them to the client
        res.json({
            success: true,
            tokens,
            message: 'Authentication successful! Store these tokens securely.'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user info
app.get('/google/user', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token provided' });
        }

        const userInfo = await googleService.getUserInfo(accessToken);
        res.json(userInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List calendar events
app.get('/google/calendar/events', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token provided' });
        }

        const maxResults = parseInt(req.query.maxResults) || 10;
        const events = await googleService.listCalendarEvents(accessToken, maxResults);
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List Drive files
app.get('/google/drive/files', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token provided' });
        }

        const maxResults = parseInt(req.query.maxResults) || 10;
        const files = await googleService.listDriveFiles(accessToken, maxResults);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ Agent Routes ============

// Active agents registry
const activeAgents = new Map();

// Create and execute agent task
app.post('/agents/execute', async (req, res) => {
    try {
        const { agentType, task, context = {} } = req.body;

        // Create or get agent
        let agent = activeAgents.get(agentType);
        if (!agent) {
            agent = createAgent(agentType);
            activeAgents.set(agentType, agent);
        }

        // Execute task
        const result = await agent.execute(task, context);

        res.json({
            success: true,
            agent: {
                id: agent.id,
                name: agent.name,
                status: agent.status
            },
            result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get agent status
app.get('/agents/:type/status', (req, res) => {
    try {
        const agent = activeAgents.get(req.params.type);
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json({
            id: agent.id,
            name: agent.name,
            status: agent.status,
            currentTask: agent.currentTask,
            memorySize: agent.memory.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get agent memory
app.get('/agents/:type/memory', async (req, res) => {
    try {
        const agent = activeAgents.get(req.params.type);
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        const limit = parseInt(req.query.limit) || 10;
        const memory = await agent.getMemory(limit);
        res.json({
            agent: agent.name,
            memory
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List all active agents
app.get('/agents', (req, res) => {
    try {
        const agents = Array.from(activeAgents.values()).map(agent => ({
            id: agent.id,
            name: agent.name,
            description: agent.description,
            status: agent.status,
            capabilities: agent.capabilities,
            memorySize: agent.memory.length
        }));

        res.json({ agents, total: agents.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset agent
app.post('/agents/:type/reset', async (req, res) => {
    try {
        const agent = activeAgents.get(req.params.type);
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        await agent.reset();
        res.json({ success: true, message: 'Agent reset successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ Monitoring & Health Routes ============

// Health check with detailed status
app.get('/health', async (req, res) => {
    try {
        const [lmstudio, ollama, system] = await Promise.all([
            lmstudioService.getStatus(),
            ollamaService.getStatus(),
            systemService.getMetrics()
        ]);

        const health = {
            status: 'healthy',
            timestamp: new Date(),
            uptime: process.uptime(),
            services: {
                lmstudio: lmstudio.online ? 'up' : 'down',
                ollama: ollama.online ? 'up' : 'down',
                system: system.gpu?.available ? 'up' : 'degraded'
            },
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                external: Math.round(process.memoryUsage().external / 1024 / 1024)
            }
        };

        // Check if any service is down
        const allUp = Object.values(health.services).every(s => s === 'up');
        if (!allUp) {
            health.status = 'degraded';
        }

        res.json(health);
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date()
        });
    }
});

// Error logs
app.get('/monitoring/errors', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const [errors, stats] = await Promise.all([
            errorLogger.getErrors(limit),
            errorLogger.getErrorStats()
        ]);
        res.json({ errors, stats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Performance metrics
app.get('/monitoring/metrics', (req, res) => {
    try {
        const metrics = {
            timestamp: new Date(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            activeConnections: clients.size,
            activeAgents: activeAgents.size,
            platform: process.platform,
            nodeVersion: process.version
        };

        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear error logs (admin only)
app.post('/monitoring/errors/clear', async (req, res) => {
    try {
        await errorLogger.clear();
        res.json({ success: true, message: 'Error logs cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Performance stats
app.get('/monitoring/performance', async (req, res) => {
    try {
        const stats = await performanceMonitor.getAllStats();
        res.json({
            stats,
            cache: cache.getStats()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ Error Handler (Must be last) ============
app.use(errorHandler);

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
