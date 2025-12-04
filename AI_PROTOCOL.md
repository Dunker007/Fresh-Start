# AI Agent Protocol

**Version:** 1.1.0  
**Last Updated:** 2025-12-03  
**Maintainer:** Claude Desktop (Opus 4.5)

---

## ⚠️ FIRST: Read SCOPE.md

Before doing ANY work, read [SCOPE.md](./SCOPE.md) to understand what's in bounds.

**TL;DR:** 
- ✅ Work in `poe-canvas/` (Nexus Workspace)
- 🚫 Don't touch `src/` (Content Pipeline - frozen)

---

## Purpose

This protocol standardizes handoffs between AI agents working on this codebase. All agents (Claude Code, Gemini Pro, Claude Desktop, Copilot, etc.) should read this document before starting work and follow the handoff procedures.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-03 | Initial protocol - handoff templates, OS requirements, branch rules |

---

## Environment Context

### Target Platform
- **Primary OS:** Windows 11 Pro (LuxRig)
- **Secondary:** Linux (Claude Code runtime)
- **Node Version:** v24.x
- **Package Manager:** npm

### Known Environment Quirks
- `NODE_ENV=production` may be set globally on Windows (work environment bleed)
  - **Fix:** Always run `$env:NODE_ENV = "development"` before `npm install`
- PowerShell uses `;` not `&&` for command chaining
- Windows paths use backslashes, but Node/Git handle forward slashes fine

### Key Paths
```
C:\Repos GIT\Fresh-Start\          # Main repo
C:\Repos GIT\Fresh-Start\poe-canvas\   # Nexus Workspace app
C:\DLX-Claude\                     # Claude Desktop workspace
```

---

## Pre-Work Checklist (READ BEFORE STARTING)

Every AI agent must verify before writing code:

### 1. Branch Awareness
```bash
git branch -a                    # What branches exist?
git log --oneline -5 main        # What's on main?
git log --oneline -5 [current]   # What's on current branch?
```

**Ask yourself:**
- Am I building on the latest work?
- Are there unmerged branches with related features?
- Should I merge something first?

### 2. Understand the Stack
- [ ] Read `package.json` for dependencies and scripts
- [ ] Check if `node_modules` exists (if not, need install)
- [ ] Note which package manager (`npm`, `pnpm`, `yarn`)

### 3. OS Considerations
- [ ] Am I running on Linux but targeting Windows?
- [ ] Any shell scripts that won't translate?
- [ ] Any path assumptions?

---

## Handoff Protocol

### Incoming Handoff (From Human or Another Agent)

A proper incoming handoff MUST include:

```markdown
## HANDOFF: [Feature Name]

**Repo:** [path or URL]
**Branch:** [current branch to build on]
**Target OS:** [Windows/Linux/Both]

**Context:**
- [What exists already]
- [What's been tried]
- [Known issues]

**Task:**
1. [Specific task 1]
2. [Specific task 2]

**Success Criteria:**
- [ ] [How to verify it works]

**Environment Notes:**
- [Any quirks, env vars, special setup]

**Related Branches:**
- [List any branches that should be merged or considered]
```

### Outgoing Handoff (When Completing Work)

Before finishing, every AI agent MUST provide:

```markdown
## COMPLETION: [Feature Name]

**Branch Created:** [full branch name]
**Based On:** [parent branch]
**Merge Required:** [Yes/No - list branches if yes]

**What Was Done:**
- [Change 1]
- [Change 2]

**Files Changed:**
- `path/to/file.js` - [what changed]

**Testing Performed:**
- [x] [Test 1] - [Linux/Windows]
- [ ] [Test 2] - NOT TESTED

**Windows Notes:**
- [Any Windows-specific considerations]
- [Commands that may differ]

**To Run:**
```bash
# Step-by-step commands
```

**Known Issues:**
- [Any bugs, warnings, or incomplete items]

**Next Steps:**
- [What should be done next]
```

---

## Branch Naming Convention

```
[agent]/[feature]-[unique-id]

Examples:
claude/electron-packaging-01VK47vf
gemini/sqlite-persistence-abc123
copilot/hotfix-timer-bug
```

**Rules:**
- Always create feature branches, never commit directly to `main`
- Include agent name for traceability
- Keep names descriptive but short

---

## Merge Protocol

### Before Creating a New Feature Branch
```bash
# Check for related unmerged work
git branch -a | grep -E "(feature|claude|gemini)"

# If related branches exist, merge them first
git checkout main
git pull origin main
git merge origin/related-feature-branch
```

### After Completing Work
```bash
# Push your branch
git push -u origin [your-branch]

# Document what needs merging in completion handoff
```

**Do NOT merge to main yourself** unless explicitly instructed. Always push to feature branch and document.

---

## Cross-Platform Testing Requirements

| Feature Type | Linux Test Required | Windows Test Required |
|--------------|--------------------|-----------------------|
| Pure JS/CSS changes | ✓ | Optional |
| npm scripts | ✓ | ✓ |
| Filesystem operations | ✓ | ✓ |
| Electron/Tauri builds | ✓ | ✓ |
| Shell commands | Document only | ✓ |

**If you cannot test on Windows:**
- State clearly: "Tested on Linux only"
- Provide Windows-equivalent commands
- Flag potential issues

---

## Communication Standards

### Asking for Clarification
If a handoff is incomplete, ask:
- "Which branch should I base this on?"
- "Should I merge [branch X] first?"
- "Is this Windows-only or cross-platform?"

### Reporting Blockers
If you hit a blocker:
- State what you tried
- Provide exact error messages
- Suggest alternatives

### Completion Quality
A task is not complete until:
- [ ] Code is committed and pushed
- [ ] Completion handoff is provided
- [ ] OS-specific notes are documented

---

## Quick Reference: Common Commands

### Windows PowerShell
```powershell
# Set dev environment (ALWAYS do this before npm install)
$env:NODE_ENV = "development"

# Navigate and install
cd "C:\Repos GIT\Fresh-Start\poe-canvas"
npm install

# Run dev
npm run electron

# Build
npm run dist:win
```

### Linux (Claude Code)
```bash
cd /home/user/Fresh-Start/poe-canvas
npm install
npm run electron  # Won't work headless, use for syntax check
npm run dist      # Linux build
```

---

## Incident Log

Document issues here to prevent recurrence:

### 2025-12-03: Branch Merge Miss
- **What happened:** Electron packaging branch didn't include shortcuts/command-palette work
- **Root cause:** Both branches created from same parent commit in parallel
- **Fix applied:** Merged branches manually
- **Prevention:** Always check for related unmerged branches before starting

### 2025-12-03: npm Silent Failure
- **What happened:** `npm install` succeeded but installed 0 packages
- **Root cause:** `NODE_ENV=production` set globally, skips devDependencies
- **Fix applied:** Set `NODE_ENV=development` before install
- **Prevention:** Added to environment quirks section

---

## Appendix: Agent Capabilities

| Agent | Strengths | Limitations |
|-------|-----------|-------------|
| Claude Code | Fast iteration, file creation, git ops | Linux-only runtime, no GUI testing |
| Gemini Pro (Antigravity) | Multi-file refactors, architecture | May not have git access |
| Claude Desktop | Planning, code review, coordination | No direct file system (uses MCP) |
| Copilot | Inline completions, quick fixes | Context window limits |

---

*This is a living document. Update it when new patterns or issues emerge.*
