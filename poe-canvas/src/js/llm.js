// Nexus Workspace - Local LLM Integration
// Supports LM Studio (localhost:1234) and Ollama (localhost:11434)

import { AppState } from './state.js';

const LLM_ENDPOINTS = {
  lmstudio: {
    base: 'http://localhost:1234/v1',
    models: '/models',
    chat: '/chat/completions'
  },
  ollama: {
    base: 'http://localhost:11434',
    models: '/api/tags',
    chat: '/api/chat'
  }
};

class LocalLLMClient {
  constructor() {
    this.activeProvider = null;
    this.activeModel = null;
  }

  async detectProviders() {
    const detected = [];

    // Check LM Studio
    try {
      const res = await fetch(`${LLM_ENDPOINTS.lmstudio.base}${LLM_ENDPOINTS.lmstudio.models}`, {
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        const models = data.data?.map(m => m.id) || [];
        detected.push({ 
          provider: 'lmstudio', 
          name: 'LM Studio',
          models,
          endpoint: LLM_ENDPOINTS.lmstudio.base
        });
      }
    } catch (e) {
      console.log('LM Studio not available');
    }

    // Check Ollama
    try {
      const res = await fetch(`${LLM_ENDPOINTS.ollama.base}${LLM_ENDPOINTS.ollama.models}`, {
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        const models = data.models?.map(m => m.name) || [];
        detected.push({ 
          provider: 'ollama', 
          name: 'Ollama',
          models,
          endpoint: LLM_ENDPOINTS.ollama.base
        });
      }
    } catch (e) {
      console.log('Ollama not available');
    }

    // Update state
    AppState.llmConfig.available = detected;
    
    // Auto-select first available
    if (detected.length > 0 && !this.activeProvider) {
      this.setProvider(detected[0].provider, detected[0].models[0]);
    }

    return detected;
  }

  setProvider(provider, model) {
    this.activeProvider = provider;
    this.activeModel = model;
    AppState.llmConfig.provider = provider;
    AppState.llmConfig.model = model;
    AppState.llmConfig.endpoint = LLM_ENDPOINTS[provider]?.base;
  }

  async chat(messages, options = {}) {
    if (!this.activeProvider) {
      throw new Error('No LLM provider configured');
    }

    const endpoint = this.activeProvider === 'lmstudio'
      ? `${LLM_ENDPOINTS.lmstudio.base}${LLM_ENDPOINTS.lmstudio.chat}`
      : `${LLM_ENDPOINTS.ollama.base}${LLM_ENDPOINTS.ollama.chat}`;

    const body = this.activeProvider === 'lmstudio'
      ? {
          model: this.activeModel,
          messages,
          stream: options.stream || false,
          max_tokens: options.maxTokens || 2048
        }
      : {
          model: this.activeModel,
          messages,
          stream: options.stream || false
        };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`LLM request failed: ${response.status}`);
    }

    if (options.stream) {
      return this.handleStream(response);
    }

    const data = await response.json();
    
    // Normalize response format
    if (this.activeProvider === 'lmstudio') {
      return data.choices?.[0]?.message?.content || '';
    } else {
      return data.message?.content || '';
    }
  }

  async *handleStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices?.[0]?.delta?.content || 
                           data.message?.content || '';
            if (content) yield content;
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  }

  isAvailable() {
    return this.activeProvider !== null;
  }

  getStatus() {
    if (!this.activeProvider) {
      return { connected: false, message: 'No local LLM detected' };
    }
    return {
      connected: true,
      provider: this.activeProvider,
      model: this.activeModel,
      message: `Connected to ${this.activeProvider} (${this.activeModel})`
    };
  }
}

// Singleton instance
const llmClient = new LocalLLMClient();

export { llmClient, LocalLLMClient };
