// src/js/google/client.js
// Generic Google API Client

import { getToken } from './auth.js';

/**
 * Make an authenticated request to Google APIs
 * @param {string} endpoint - API endpoint (e.g., 'drive/v3/files')
 * @param {string} method - HTTP Method
 * @param {object} body - Request body
 * @returns {Promise<any>}
 */
export async function request(endpoint, method = 'GET', body = null) {
    const token = getToken();
    if (!token) {
        throw new Error('Not authenticated. Please sign in with Google.');
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const config = {
        method,
        headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    // Handle full URLs or relative paths
    const url = endpoint.startsWith('http') ? endpoint : `https://www.googleapis.com/${endpoint}`;

    const response = await fetch(url, config);

    if (response.status === 401) {
        console.warn('Token invalid or expired');
        throw new Error('Unauthorized: Token expired');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw new Error(error.error?.message || response.statusText);
    }

    return response.json();
}
