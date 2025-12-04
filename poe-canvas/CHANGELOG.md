# Changelog

All notable changes to this project will be documented in this file.

## [0.2.4] - 2025-12-03

### Fixed
- Completely rebuilt `index-modular.html` from the working `index.html` to ensure 1:1 UI parity.
- Fixed layout issues where the main content was blank or misaligned.
- Ensured all widgets (Tasks, Notes, Projects, Calendar) and the AI Assistant are correctly rendered.
- Restored "Quick Access" and "Settings Modal" functionality in the Electron build.

## [0.2.3] - 2025-12-03

### Fixed
- Fixed critical layout issue where the sidebar was not closing properly, causing the main content to be squished or blank.
- Restored correct HTML structure for the AI Assistant view and modals.
- Removed duplicated content in the application shell.

## [0.2.2] - 2025-12-03

### Fixed
- Added missing "Quick Access" section to the sidebar in the Electron app.
- Seeded the database with demo data (tasks, notes, projects) for a better first-run experience.
- Synchronized the Settings Modal in the Electron app to match the web version.

## [0.2.1] - 2025-12-03

### Fixed
- `ReferenceError: require is not defined` in `ui.js` preventing view switching in browser mode.
- Switched to JSON file-based persistence (`nexus-data.json`) to resolve native build issues with `better-sqlite3`.

## [0.2.0] - 2025-12-03

### Added
- **Google Integration**:
  - Settings modal for configuring Google Client ID.
  - Authentication flow with "Connect" and "Disconnect" options.
  - Visual status indicator for connection state.
- **Real Filesystem Integration**:
  - Ability to create folders and upload files (via copy) in the File Manager.
  - `fs:copyFile` IPC handler for efficient file operations.
  - Native filesystem access via Electron IPC.
- **SQLite Persistence**:
  - Integrated `better-sqlite3` for robust local data storage.
  - Asynchronous state loading and saving to `nexus.db`.
  - Database schema for tasks, notes, projects, workspaces, bookmarks, and layout items.

### Changed
- **Architecture**:
  - Refactored `switchView` to `ui.js` to resolve circular dependencies.
  - Updated `main.js` to await `initAppState` for proper async initialization.
  - Enhanced `state.js` to support dual persistence (LocalStorage + SQLite).

### Fixed
- Circular dependency between `main.js` and `shortcuts.js`.
