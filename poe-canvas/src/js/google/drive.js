// src/js/google/drive.js
import { request } from './client.js';

/**
 * List files from Google Drive
 * @param {string} query - Drive API query string
 * @param {number} pageSize 
 * @returns {Promise<object>}
 */
export async function listFiles(query = "trashed = false", pageSize = 10) {
    const params = new URLSearchParams({
        q: query,
        pageSize: pageSize,
        fields: 'nextPageToken, files(id, name, mimeType, webViewLink, iconLink, thumbnailLink)'
    });
    return request(`drive/v3/files?${params}`);
}

/**
 * Search for files by name
 * @param {string} term 
 * @returns {Promise<object>}
 */
export async function searchFiles(term) {
    const query = `name contains '${term}' and trashed = false`;
    return listFiles(query);
}
