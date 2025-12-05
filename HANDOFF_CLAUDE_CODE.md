# HANDOFF: Claude Code

**Date:** 2025-12-04  
**From:** Claude Desktop (Opus 4.5)  
**To:** Claude Code (Opus)

---

## What Just Happened

Opus in Antigravity built a 54-page Next.js WebOS in 9 rounds (~90 minutes). Everything compiles. Nothing broke.

**The Rule:** 30-70% backfill/connect/polish, remainder new ideas.

This prevents orphaned modules. Every round wires something.

---

## Repo Structure

```
Fresh-Start/
├── website-v2/          ← MAIN: Next.js 16 WebOS (54 pages)
├── luxrig-bridge/       ← API: Express + WebSocket (LM Studio, Ollama, System)
├── poe-canvas/          ← SECONDARY: Electron desktop app
├── website/             ← Static landing page
└── src/                 ← FROZEN: PowerShell content pipeline
```

---

## Immediate Wins

### 1. Start LuxRig Bridge (2 min)
```bash
cd luxrig-bridge
npm install
npm start
```
Runs on `localhost:3456`. Unlocks: chat, status, models, playground pages.

### 2. Wire Chat Page (already pointed at bridge)
`website-v2/src/app/chat/page.tsx` - UI complete, just needs bridge running.

### 3. Terminal → Real Commands
`website-v2/src/app/terminal/page.tsx` - Commands are mocked. Swap for real system calls through bridge.

---

## Pages Needing Attention

**Ready to wire (bridge unlocks these):**
- `chat/` - LLM chat
- `playground/` - Model playground  
- `models/` - Model selector
- `status/` - System status (WebSocket)

**Need backends/APIs:**
- `github/` - Needs GitHub token
- `crypto/` - Real price data
- `trends/` - Data source TBD

**Static/OK for now:**
- `blog/`, `docs/`, `changelog/` - Content pages

---

## Environment

**LuxRig Bridge `.env`:**
```
PORT=3456
LMSTUDIO_URL=http://localhost:1234
OLLAMA_URL=http://localhost:11434
GOOGLE_CLIENT_ID=        # empty - fill when ready
GOOGLE_CLIENT_SECRET=    # empty - fill when ready
API_KEY=your-secure-api-key-here  # change this
```

**Website-v2:**
```bash
cd website-v2
npm install
npm run dev
# → localhost:3000
```

---

## The Pattern

**Insta-rounds:** ~10 min each  
**Ratio:** 30-70% connect/polish, rest new  
**Rule:** Always wire something before adding new pages

Don't overthink. Build.

---

## What NOT to Touch

- `src/` - PowerShell pipeline, frozen
- `SCOPE.md` - Outdated, will update later
- Merge conflicts - repo is clean, keep it that way

---

## Git State

- Branch: `main`
- Last commit: `96b0680` - Refactor: Centralize configuration...
- Clean working tree

---

*Pick up where Opus left off. Same model, same momentum.*
