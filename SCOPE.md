# PROJECT SCOPE

**Version:** 1.0.0  
**Last Updated:** 2025-12-03  
**Status:** Foundation Phase

---

## ⚠️ ACTIVE PROJECT: Nexus Workspace

**Location:** `poe-canvas/`

This is the ONLY active development target. All work should focus here.

### What Nexus Workspace Is
- Desktop productivity app (Electron)
- Task/note/project management
- Local LLM integration (LM Studio)
- Google ecosystem connectivity (Drive, Calendar, Gmail)
- Keyboard-driven workflow (shortcuts, command palette)

### Current Priorities
1. Wire Google modules to UI
2. Real filesystem integration via Electron IPC
3. SQLite persistence
4. Polish and stability

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
├── poe-canvas/          ← ACTIVE: Nexus Workspace
│   ├── electron/        ← Desktop app framework
│   ├── src/             ← Frontend code
│   │   ├── js/          ← Modules (work here)
│   │   └── styles/      ← CSS
│   └── dist/            ← Built executables
│
├── src/                 ← FROZEN: Content Pipeline
│   ├── core/            ← PowerShell modules (don't touch)
│   └── publishers/      ← Publishing modules (don't touch)
│
├── docs/                ← Project documentation
├── AI_PROTOCOL.md       ← Agent handoff rules
└── SCOPE.md            ← This file
```

---

## For AI Agents

**READ THIS BEFORE STARTING WORK:**

1. Your work is in `poe-canvas/` only
2. Ignore `src/`, `setup-scheduled-tasks.ps1`, `master-orchestrator-minimal.ps1`
3. If a task mentions "content generation", "blog posts", "AdSense", or "publishing" → STOP and clarify with the user
4. The README mentions both projects for historical context - follow THIS file for current scope

---

## When Will Content Pipeline Unfreeze?

When these conditions are met:
- [ ] Nexus Workspace has stable daily-driver features
- [ ] SQLite persistence working
- [ ] Foundation Phase complete
- [ ] User explicitly says "unfreeze content pipeline"

Until then: **hands off**.

---

*This is your scope of work. Stay in bounds.*
