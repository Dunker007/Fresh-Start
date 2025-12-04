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

/**
 * Upload a backup file to Google Drive
 * @param {Object} stateData - The app state to backup
 * @returns {Promise<Object>} Created file metadata
 */
export async function uploadBackup(stateData) {
    const date = new Date().toISOString().split('T')[0];
    const filename = `nexus-backup-${date}.json`;
    const content = JSON.stringify(stateData, null, 2);

    // Use multipart upload
    const boundary = '-------nexus-upload-boundary';
    const metadata = {
        name: filename,
        mimeType: 'application/json',
        description: 'Nexus Workspace backup'
    };

    const body =
        `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\n` +
        `Content-Type: application/json\r\n\r\n` +
        `${content}\r\n` +
        `--${boundary}--`;

    return request('upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body
    });
}

/**
 * List available backups
 * @returns {Promise<Object>} Files list
 */
export async function listBackups() {
    const query = "name contains 'nexus-backup' and mimeType = 'application/json' and trashed = false";
    return listFiles(query, 20);
}

/**
 * Download and parse a backup file
 * @param {string} fileId - Google Drive file ID
 * @returns {Promise<Object>} Parsed state data
 */
export async function restoreBackup(fileId) {
    const response = await request(`drive/v3/files/${fileId}?alt=media`);
    return response; // Already parsed by request()
}
