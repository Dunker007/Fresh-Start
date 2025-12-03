// llm.js - Local LLM integration (LM Studio / Ollama) + Gemini API
import { callGemini } from './gemini-client.js';

let appState = null;

export function setAppState(state) {
  appState = state;
}

export async function detectLocalLLM() {
  const statusDot = document.getElementById('llmStatusDot');
  const statusText = document.getElementById('llmStatusText');
  const modelSelect = document.getElementById('aiModelSelect');

  if (statusDot) statusDot.style.background = 'var(--accent-warning)';
  if (statusText) statusText.textContent = 'Checking...';

  // 1. Check for Gemini API Key first (Cloud Fallback/Primary)
  const geminiKey = localStorage.getItem('gemini_api_key');
  if (geminiKey) {
    // We have a key, but let's check local LLMs too. 
    // If local is down, we default to Gemini.
    // If local is up, we add Gemini to the list.
  }

  // 2. Try LM Studio (localhost:1234)
  try {
    const lmRes = await fetch('http://localhost:1234/v1/models', {
      signal: AbortSignal.timeout(1000)
    });
    if (lmRes.ok) {
      const data = await lmRes.json();
      const models = data.data?.map(m => m.id) || [];
      if (models.length > 0) {
        updateLLMState('lmstudio', models, 'LM Studio');
        if (geminiKey) addGeminiOption(modelSelect);
        return { provider: 'lmstudio', models, connected: true };
      }
    }
  } catch (e) { /* LM Studio not available */ }

  // 3. Try Ollama (localhost:11434)
  try {
    const ollamaRes = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(1000)
    });
    if (ollamaRes.ok) {
      const data = await ollamaRes.json();
      const models = data.models?.map(m => m.name) || [];
      if (models.length > 0) {
        updateLLMState('ollama', models, 'Ollama');
        if (geminiKey) addGeminiOption(modelSelect);
        return { provider: 'ollama', models, connected: true };
      }
    }
  } catch (e) { /* Ollama not available */ }

  // 4. Fallback to Gemini if Key exists and no local LLM
  if (geminiKey) {
    updateLLMState('gemini', ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro'], 'Gemini API');
    return { provider: 'gemini', models: ['gemini-1.5-flash'], connected: true };
  }

  // No LLM found
  if (appState) {
    appState.llm.provider = null;
    appState.llm.connected = false;
  }
  if (statusDot) statusDot.style.background = 'var(--text-muted)';
  if (statusText) statusText.textContent = 'No local LLM';
  if (modelSelect) modelSelect.innerHTML = '<option value="demo">Demo Mode</option>';

  return { provider: null, models: [], connected: false };
}

function updateLLMState(provider, models, label) {
  const statusDot = document.getElementById('llmStatusDot');
  const statusText = document.getElementById('llmStatusText');
  const modelSelect = document.getElementById('aiModelSelect');

  if (appState) {
    appState.llm.provider = provider;
    appState.llm.models = models;
    appState.llm.model = models[0];
    appState.llm.connected = true;
  }

  if (statusDot) statusDot.style.background = 'var(--accent-secondary)';
  if (statusText) statusText.textContent = label;

  if (modelSelect) {
    modelSelect.innerHTML = models.map(m =>
      `<option value="${m}">${m.split('/').pop()}</option>`
    ).join('');
  }

  if (window.showToast) window.showToast(`Connected to ${label}`, 'success');
}

function addGeminiOption(selectElement) {
  if (!selectElement) return;
  // Check if already exists to avoid duplicates
  if (!selectElement.querySelector('option[value="gemini-pro"]')) {
    const optGroup = document.createElement('optgroup');
    optGroup.label = "Google Gemini";
    optGroup.innerHTML = `
      <option value="gemini-pro">Gemini Pro</option>
      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
    `;
    selectElement.appendChild(optGroup);
  }
}

export async function sendToLocalLLM(message) {
  if (!appState?.llm.connected) {
    throw new Error('No LLM connected');
  }

  const model = document.getElementById('aiModelSelect')?.value || appState.llm.model;

  // Handle Gemini Provider
  if (appState.llm.provider === 'gemini' || model.startsWith('gemini-')) {
    const apiKey = localStorage.getItem('gemini_api_key');
    return await callGemini(message, apiKey, model);
  }

  // Handle LM Studio
  if (appState.llm.provider === 'lmstudio') {
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful workspace assistant. Be concise and helpful.' },
          { role: 'user', content: message }
        ],
        max_tokens: 2048,
        stream: false
      })
    });

    if (!response.ok) throw new Error('LM Studio request failed');
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response';
  }

  // Handle Ollama
  if (appState.llm.provider === 'ollama') {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful workspace assistant. Be concise and helpful.' },
          { role: 'user', content: message }
        ],
        stream: false
      })
    });

    if (!response.ok) throw new Error('Ollama request failed');
    const data = await response.json();
    return data.message?.content || 'No response';
  }

  throw new Error('Unknown LLM provider');
}

export default { detectLocalLLM, sendToLocalLLM, setAppState };

