# PROJECT SCOPE

**Version:** 1.0.0  
**Last Updated:** 2025-12-03  
**Status:** Foundation Phase

---

## ⚠️ ACTIVE PROJECT: DLX Studio

**Locations:** `website-v2/` (Next.js frontend) + `luxrig-bridge/` (Express backend)

This is the ONLY active development target. All work should focus here.

### What DLX Studio Is
- Next.js 14 web application with 56+ pages
- AI command center with local LLM integration (LM Studio/Ollama)
- News Hub (conservative & MN sources), Music Studio (songwriter agents)
- Google OAuth integration (Drive, Calendar, Gmail)
- Real-time system monitoring (GPU, CPU, RAM via nvidia-smi)
- Express backend (LuxRig Bridge) on port 3456

### Current Priorities
1. Complete main navigation tabs (Chat, Labs, Income, Settings)
2. Connect Dashboard widgets to live data
3. Wire Google API integration to UI
4. Test and polish existing features
5. Mobile responsive improvements

---

## 🚫 FROZEN: Content Pipeline

**Location:** `src/`, `setup-scheduled-tasks.ps1`, `master-orchestrator-minimal.ps1`

This code is **frozen** until Foundation Phase completes (~88 days).

### What It Is
- PowerShell-based content generation system
- LM Studio → blog post generation
- WordPress/HTML publishing
- AdSense revenue play

### Why It's Frozen
Per the "Foundation Before Revenue" principle: rushing to monetization with unstable infrastructure leads to collapse. This happened in repos 1-16. 

The pipeline code is **done and working**. It stays in the repo for when we're ready. That time is not now.

### DO NOT
- Modify files in `src/`
- Add features to the content pipeline
- Integrate pipeline with Nexus Workspace
- Create scheduled tasks for content generation

---

## Repository Structure

```
Fresh-Start/
├── website-v2/          ← ACTIVE: DLX Studio Frontend (Next.js 14)
│   ├── src/app/         ← 56+ page routes (work here)
│   ├── src/components/  ← React components
│   ├── src/lib/         ← Utilities and services
│   └── public/          ← Static assets
│
├── luxrig-bridge/       ← ACTIVE: DLX Studio Backend (Express)
│   ├── services/        ← Agent services, LLM proxies (work here)
│   ├── config/          ← Swagger, security config
│   ├── prisma/          ← Database schema (SQLite)
│   └── server.js        ← Main server (port 3456)
│
├── src/                 ← FROZEN: Content Pipeline
│   ├── core/            ← PowerShell modules (don't touch)
│   └── publishers/      ← Publishing modules (don't touch)
│
├── poe-canvas/          ← LEGACY: Original Nexus Workspace (archived)
│
├── docs/                ← Project documentation
├── AI_PROTOCOL.md       ← Agent handoff rules
└── SCOPE.md            ← This file
```

---

## For AI Agents

**READ THIS BEFORE STARTING WORK:**

1. Your work is in `website-v2/` and `luxrig-bridge/` only
2. Ignore `src/`, `setup-scheduled-tasks.ps1`, `master-orchestrator-minimal.ps1`
3. `poe-canvas/` is archived legacy code - DO NOT modify
4. If a task mentions "content generation", "blog posts", "AdSense", or "publishing" → STOP and clarify with the user
5. The README mentions historical projects for context - follow THIS file for current scope

---

## When Will Content Pipeline Unfreeze?

When these conditions are met:
- [ ] DLX Studio has stable daily-driver features
- [ ] All main navigation tabs complete (Chat, Labs, Income, Settings)
- [ ] Google API integration working
- [ ] Foundation Phase complete
- [ ] User explicitly says "unfreeze content pipeline"

Until then: **hands off**.

---

*This is your scope of work. Stay in bounds.*
