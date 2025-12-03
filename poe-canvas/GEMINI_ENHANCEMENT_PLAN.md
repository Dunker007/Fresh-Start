# Gemini Enhancement Plan

**Status:** Ready to Start  
**Goal:** Integrate Gemini API & Enhance Google Ecosystem  

---

## Phase 1: Gemini API Integration (Core)

### 1. Create `src/js/gemini-client.js`
- **Purpose:** Handle direct communication with Google's Generative Language API.
- **Key Functions:**
  - `callGemini(message, apiKey, model)`: Sends chat messages.
  - `validateKey(apiKey)`: Simple test call to verify key.

### 2. Update `src/js/llm.js`
- **Provider Logic:** Add `gemini` as a supported provider.
- **Detection:** Check `localStorage` for `gemini_api_key`.
- **Routing:** Route `sendToLocalLLM` calls to `gemini-client` if provider is 'gemini'.

### 3. UI for API Key Management
- **New UI Element:** Settings (Gear) icon next to `#refreshModelsBtn`.
- **New Modal:** Simple input field for API Key with Save/Clear buttons.
- **Storage:** Persist key in `localStorage` (Client-side MVP approach).

---

## Phase 2: Google Ecosystem Enhancements

### 1. Smart Google Search (Context Menu)
- **Feature:** Right-click task/note -> "Search Google".
- **Logic:**
  1. AI analyzes item content.
  2. AI generates optimal search query.
  3. App opens `google.com/search?q=...` in new tab.
- **Files:** `src/js/ai-assistant.js`.

### 2. Enhanced Sidebar
- **Visuals:** Add FontAwesome icons to Google Drive, Calendar, Docs, Gmail links.
- **Behavior:** Ensure `target="_blank"` for all external links.

---

## Phase 3: Validation
- **Test:** Run "AI Task Breakdown" using Gemini Pro.
- **Test:** Run "Smart Search" on a sample task.
