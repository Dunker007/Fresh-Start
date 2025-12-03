# Nexus Workspace

> **🤖 AI Agents:** Read [AI_PROTOCOL.md](./AI_PROTOCOL.md) before starting any work.

Desktop workspace app with local LLM integration, real filesystem access, and Google ecosystem connectivity.

## Tech Stack

- **Frontend**: Vanilla JS, Tailwind CSS, Google Material Design
- **Desktop**: Tauri (Rust backend, ~600KB vs Electron's 100MB+)
- **Database**: SQLite via better-sqlite3 (TODO)
- **LLM**: LM Studio (localhost:1234) / Ollama (localhost:11434)

## Project Structure

```
poe-canvas/
├── src/                    # Frontend source
│   ├── index.html          # Main HTML
│   ├── styles/
│   │   └── main.css        # Extracted styles
│   └── js/
│       ├── state.js        # Central state management
│       ├── llm.js          # Local LLM integration
│       ├── files.js        # Filesystem operations (TODO)
│       └── main.js         # App initialization (TODO)
├── src-tauri/              # Rust backend
│   ├── src/
│   │   └── main.rs         # Tauri commands
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── src-original/           # Original monolithic index.html
├── package.json            # Node dependencies
└── vite.config.js          # Dev server config
```

## Quick Start

```powershell
# Install dependencies
npm install

# Run in browser (dev mode)
npm run dev

# Run as desktop app
npm run tauri:dev

# Build for production
npm run tauri:build
```

## Features

### Working (from Poe Canvas)
- ✅ Dashboard with widgets
- ✅ Task management
- ✅ Notes with color coding
- ✅ Projects tracking
- ✅ Focus timer (Pomodoro)
- ✅ Mini calendar
- ✅ Virtual file manager
- ✅ Layout planner (drag zones)
- ✅ AI chat interface
- ✅ Dark/light mode
- ✅ JSON export/import

### In Progress
- 🔄 Local LLM detection (llm.js)
- 🔄 Modular JS architecture

### TODO (Priority Order)
1. **Real filesystem** - Read Desktop/Documents/Downloads
2. **LM Studio/Ollama chat** - Wire up llm.js to UI
3. **SQLite persistence** - Replace localStorage
4. **File watching** - Live updates with chokidar
5. **Google OAuth** - Drive/Calendar/Gmail integration

## Local LLM Setup

The app auto-detects local LLMs:

**LM Studio** (recommended):
1. Download from lmstudio.ai
2. Load a model (e.g., qwen2.5-7b)
3. Start local server (default: localhost:1234)

**Ollama**:
1. Install from ollama.ai
2. Pull a model: `ollama pull llama3.2`
3. Ollama runs automatically on localhost:11434

## Development Notes

### For Gemini/Antigravity
The `src-original/index.html` contains the complete working app (2886 lines).
Refer to it when implementing features in the modular structure.

Key patterns:
- `AppState` object holds all state
- `render*()` functions update DOM
- `setup*Listeners()` wire up events
- Modal pattern for forms

### For Claude Desktop
This project is set up for Tauri. Key files:
- `src-tauri/src/main.rs` - Native commands
- `src-tauri/tauri.conf.json` - Permissions and window config
- `src/js/llm.js` - LLM integration ready for use

## Credits

- Original canvas app built on Poe
- Handoff package prepared with architecture docs
- Tauri scaffold by Claude Desktop
