// src/js/google/calendar.js
import { request } from './client.js';

/**
 * List events
 * @param {object} options - Query parameters
 * @returns {Promise<object>}
 */
export async function listEvents(options = {}) {
    const defaultParams = {
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime'
    };

    const { calendarId, ...queryParams } = { ...defaultParams, ...options };

    const params = new URLSearchParams(queryParams);
    return request(`calendar/v3/calendars/${calendarId}/events?${params}`);
}

/**
 * Add a new event
 * @param {object} event - Event resource
 * @param {string} calendarId 
 * @returns {Promise<object>}
 */
export async function addEvent(event, calendarId = 'primary') {
    return request(`calendar/v3/calendars/${calendarId}/events`, 'POST', event);
}
