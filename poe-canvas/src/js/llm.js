// llm.js - Local LLM integration (LM Studio / Ollama)
import { getState } from './state.js';

export async function detectLocalLLM() {
  const statusDot = document.getElementById('llmStatusDot');
  const statusText = document.getElementById('llmStatusText');
  const modelSelect = document.getElementById('aiModelSelect');
  
  if (statusDot) statusDot.style.background = 'var(--accent-warning)';
  if (statusText) statusText.textContent = 'Checking...';
  
  // Try LM Studio first (localhost:1234)
  try {
    const lmRes = await fetch('http://localhost:1234/v1/models', {
      signal: AbortSignal.timeout(3000)
    });
    if (lmRes.ok) {
      const data = await lmRes.json();
      const models = data.data?.map(m => m.id) || [];
      if (models.length > 0) {
        const state = getState();
        if (state) {
          state.llm.provider = 'lmstudio';
          state.llm.models = models;
          state.llm.model = models[0];
          state.llm.connected = true;
        }
        
        if (statusDot) statusDot.style.background = 'var(--accent-secondary)';
        if (statusText) statusText.textContent = 'LM Studio';
        
        if (modelSelect) {
          modelSelect.innerHTML = models.map(m => 
            `<option value="${m}">${m.split('/').pop()}</option>`
          ).join('');
        }
        
        if (window.showToast) window.showToast('Connected to LM Studio', 'success');
        return { provider: 'lmstudio', models, connected: true };
      }
    }
  } catch (e) {
    console.log('LM Studio not available');
  }

  // Try Ollama (localhost:11434)
  try {
    const ollamaRes = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(3000)
    });
    if (ollamaRes.ok) {
      const data = await ollamaRes.json();
      const models = data.models?.map(m => m.name) || [];
      if (models.length > 0) {
        const state = getState();
        if (state) {
          state.llm.provider = 'ollama';
          state.llm.models = models;
          state.llm.model = models[0];
          state.llm.connected = true;
        }
        
        if (statusDot) statusDot.style.background = 'var(--accent-secondary)';
        if (statusText) statusText.textContent = 'Ollama';
        
        if (modelSelect) {
          modelSelect.innerHTML = models.map(m => 
            `<option value="${m}">${m}</option>`
          ).join('');
        }
        
        if (window.showToast) window.showToast('Connected to Ollama', 'success');
        return { provider: 'ollama', models, connected: true };
      }
    }
  } catch (e) {
    console.log('Ollama not available');
  }
  
  // No local LLM found
  const state = getState();
  if (state) {
    state.llm.provider = null;
    state.llm.connected = false;
  }
  if (statusDot) statusDot.style.background = 'var(--text-muted)';
  if (statusText) statusText.textContent = 'No local LLM';
  if (modelSelect) modelSelect.innerHTML = '<option value="demo">Demo Mode</option>';
  
  return { provider: null, models: [], connected: false };
}

export async function sendToLocalLLM(message) {
  const state = getState();
  if (!state?.llm.connected) {
    throw new Error('No local LLM connected');
  }

  const model = document.getElementById('aiModelSelect')?.value || state.llm.model;

  if (state.llm.provider === 'lmstudio') {
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
  
  if (state.llm.provider === 'ollama') {
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

export default { detectLocalLLM, sendToLocalLLM };
