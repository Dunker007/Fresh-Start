// src/js/google/auth.js
// Handles Google Identity Services (GIS) authentication

const SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email'
];

let tokenClient;
let accessToken = localStorage.getItem('google_access_token');
let tokenExpiration = localStorage.getItem('google_token_expiration');

/**
 * Initialize the Google Auth Client
 * @param {string} clientId - The Google Cloud Client ID
 */
export function initAuth(clientId) {
    if (!window.google) {
        console.error('Google Identity Services script not loaded');
        return;
    }

    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: SCOPES.join(' '),
            callback: (tokenResponse) => {
                if (tokenResponse.access_token) {
                    accessToken = tokenResponse.access_token;
                    // Token is valid for 3600 seconds (1 hour) usually
                    const expiresIn = tokenResponse.expires_in;
                    const expirationTime = Date.now() + (expiresIn * 1000);

                    localStorage.setItem('google_access_token', accessToken);
                    localStorage.setItem('google_token_expiration', expirationTime);

                    console.log('Google Auth Successful');
                    window.dispatchEvent(new CustomEvent('google-auth-success', { detail: { token: accessToken } }));
                }
            },
        });
        console.log('Google Auth Initialized');
    } catch (e) {
        console.error('Error initializing Google Auth:', e);
    }
}

/**
 * Trigger the Sign In flow (Popup)
 */
export function signIn() {
    if (tokenClient) {
        // Request access token. 
        // prompt: '' allows auto-selection if already signed in, 'consent' forces prompt
        tokenClient.requestAccessToken({ prompt: '' });
    } else {
        console.error('Auth not initialized. Call initAuth(clientId) first.');
        alert('Please configure your Google Client ID in settings first.');
    }
}

/**
 * Sign out and revoke token
 */
export function signOut() {
    const token = localStorage.getItem('google_access_token');
    if (token && window.google) {
        google.accounts.oauth2.revoke(token, () => {
            console.log('Token revoked');
        });
    }
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiration');
    accessToken = null;
    window.dispatchEvent(new CustomEvent('google-auth-signout'));
}

/**
 * Get the current valid access token
 * @returns {string|null}
 */
export function getToken() {
    if (accessToken && tokenExpiration && Date.now() > tokenExpiration) {
        console.warn('Token expired');
        return null;
    }
    return accessToken;
}

/**
 * Check if currently authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
    return !!getToken();
}
