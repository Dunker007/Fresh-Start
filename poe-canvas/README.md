# Nexus Workspace

> **🤖 AI Agents:** Read [../SCOPE.md](../SCOPE.md) first, then [AI_PROTOCOL.md](./AI_PROTOCOL.md).
>
> **This is the ACTIVE project.** All development happens here.

Desktop workspace app with local LLM integration, real filesystem access, and Google ecosystem connectivity.

## Tech Stack

- **Frontend**: Vanilla JS (Modular ES6), CSS Variables
- **Desktop**: Node.js Bridge (Filesystem Access)
- **LLM**: LM Studio, Ollama, Google Gemini API

## Quick Start

```powershell
# Install dependencies
npm install

# Run dev server
npx -y serve@latest .
```

## Features

### ✅ Core Productivity
- **Dashboard**: Widgets for tasks, notes, projects, timer.
- **Task Management**: Priorities, due dates, tags, subtasks.
- **Note Taking**: Rich text notes with color coding.
- **Projects**: Progress tracking and task grouping.
- **Focus Timer**: Pomodoro timer with customizable intervals.
- **Calendar**: Mini calendar for date tracking.
- **File Manager**: Real filesystem access (Desktop, Documents, Downloads).
- **Layout Planner**: Drag-and-drop workspace organization.

### 🤖 AI-Powered (Local + Cloud)
- **Local LLM Support**: Auto-detects LM Studio and Ollama.
- **Google Gemini Integration**: Cloud-based AI fallback/primary.
- **AI Task Breakdown**: Breaks complex tasks into actionable subtasks.
- **AI Note Enhancement**: Summarizes, extracts actions, and suggests tags.
- **AI Project Insights**: Analyzes progress, identifies blockers, and suggests next steps.
- **Smart Google Search**: Generates optimal search queries from your content.

### 🌐 Google Ecosystem
- **Quick Access**: Sidebar links to Drive, Calendar, Docs, Gmail.
- **Smart Search**: Context-aware Google Search integration.

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

**Google Gemini**:
1. Get an API Key from [Google AI Studio](https://aistudio.google.com/).
2. Click the ⚙️ icon in the AI Assistant view.
3. Enter your key to enable cloud AI.

## Development

The project uses a modular ES6 architecture in `src/js/`.
- `main.js`: Entry point and initialization.
- `state.js`: Centralized state management.
- `llm.js`: LLM provider abstraction (Local + Gemini).
- `ai-assistant.js`: AI feature logic.
- `filesystem.js`: Node.js bridge integration.

## Credits

- Built with ❤️ by the Antigravity Team

