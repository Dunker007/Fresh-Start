// gemini-client.js - Google Gemini API Client
// Handles communication with Google's Generative Language API

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Call the Gemini API to generate content
 * @param {string} message - The user's message/prompt
 * @param {string} apiKey - Google API Key
 * @param {string} model - Model name (default: gemini-pro)
 * @returns {Promise<string>} - The generated text
 */
export async function callGemini(message, apiKey, model = 'gemini-pro') {
    if (!apiKey) throw new Error('Gemini API key is missing');

    const url = `${BASE_URL}/${model}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `Gemini API Error: ${response.status}`);
        }

        const data = await response.json();

        // Extract text from response
        if (data.candidates && data.candidates.length > 0) {
            const content = data.candidates[0].content;
            if (content && content.parts && content.parts.length > 0) {
                return content.parts[0].text;
            }
        }

        return ''; // Empty response if no candidates

    } catch (error) {
        console.error('Gemini API call failed:', error);
        throw error;
    }
}

/**
 * Validate an API key by making a minimal call
 * @param {string} apiKey 
 * @returns {Promise<boolean>}
 */
export async function validateKey(apiKey) {
    try {
        // Simple prompt to test the key
        await callGemini('Hello', apiKey);
        return true;
    } catch (e) {
        console.warn('Gemini key validation failed:', e);
        return false;
    }
}

export default { callGemini, validateKey };
