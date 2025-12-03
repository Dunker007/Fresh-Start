# Next Steps - Nexus Workspace

## Current State (as of scaffold)

### Done ✅
- [x] Project structure created
- [x] Package.json with dependencies
- [x] Vite config for dev server
- [x] Tauri scaffold (config, Cargo.toml, main.rs)
- [x] State management module (state.js)
- [x] Local LLM client module (llm.js)
- [x] CSS extraction started (main.css partial)
- [x] Original index.html preserved in src-original/
- [x] Documentation copied to docs/

### Immediate Next (for Gemini/Antigravity)

1. **Complete the index.html split**
   - Extract remaining CSS to `src/styles/main.css`
   - Create clean `src/index.html` that links to external CSS/JS
   - Wire up ES module imports

2. **Complete JS modules**
   - `src/js/tasks.js` - Task CRUD operations
   - `src/js/notes.js` - Note CRUD operations  
   - `src/js/ui.js` - Modal, toast, render functions
   - `src/js/main.js` - App initialization, event listeners

3. **Test in browser**
   - Run `npm run dev`
   - Verify all features work with modular code

### Then (Claude Desktop or Gemini)

4. **Add Tauri filesystem integration**
   - Use `invoke('read_directory')` from main.rs
   - Replace virtual file system with real one
   - Add file watching with chokidar

5. **Wire up local LLM**
   - Call `invoke('check_local_llm')` on startup
   - Update AI chat to use llm.js client
   - Add model selector dropdown

6. **SQLite persistence**
   - Install better-sqlite3
   - Create database schema
   - Replace localStorage calls

## Commands Reference

```powershell
# Navigate to project
cd "C:\Repos GIT\Fresh-Start\poe-canvas"

# Install deps
npm install

# Dev server (browser)
npm run dev

# Tauri dev (desktop app)
npm run tauri:dev

# Build desktop app
npm run tauri:build
```

## Key Files to Edit

| File | Purpose |
|------|---------|
| `src/index.html` | Main UI structure |
| `src/styles/main.css` | All styling |
| `src/js/state.js` | Central state |
| `src/js/llm.js` | LLM integration |
| `src-tauri/src/main.rs` | Native commands |

## Notes

- Original monolith: `src-original/index.html` (2886 lines)
- Tailwind loaded via CDN for now
- LM Studio endpoint: `http://localhost:1234`
- Target bundle size: <5MB (Tauri advantage)
