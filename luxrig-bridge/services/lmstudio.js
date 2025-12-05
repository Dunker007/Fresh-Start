/**
 * LM Studio Service
 * Connects to LM Studio's OpenAI-compatible API
 */

const LMSTUDIO_URL = process.env.LMSTUDIO_URL || 'http://localhost:1234';

export const lmstudioService = {

    /**
     * Check if LM Studio is running and get status
     */
    async getStatus() {
        try {
            const response = await fetch(`${LMSTUDIO_URL}/v1/models`, {
                signal: AbortSignal.timeout(3000)
            });

            if (!response.ok) throw new Error('Not responding');

            const data = await response.json();
            const models = data.data || [];

            return {
                online: true,
                url: LMSTUDIO_URL,
                modelCount: models.length,
                loadedModel: models[0]?.id || null
            };
        } catch (error) {
            return {
                online: false,
                url: LMSTUDIO_URL,
                error: error.message
            };
        }
    },

    /**
     * List available models
     */
    async listModels() {
        try {
            const response = await fetch(`${LMSTUDIO_URL}/v1/models`);
            const data = await response.json();

            return (data.data || []).map(model => ({
                id: model.id,
                provider: 'lmstudio',
                object: model.object,
                owned_by: model.owned_by
            }));
        } catch (error) {
            console.error('LM Studio listModels error:', error.message);
            return [];
        }
    },

    /**
     * Chat completion
     */
    async chat(messages, model = null) {
        const response = await fetch(`${LMSTUDIO_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model || 'default',
                messages,
                temperature: 0.7,
                max_tokens: 2000,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`LM Studio error: ${response.status}`);
        }

        const data = await response.json();

        return {
            provider: 'lmstudio',
            model: data.model,
            content: data.choices[0]?.message?.content || '',
            usage: data.usage
        };
    }
};
