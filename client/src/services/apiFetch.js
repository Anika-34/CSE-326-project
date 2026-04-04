import { AUTH_FLASH_MESSAGE_KEY, AUTH_TOKEN_KEY, clearBrowserAuthState } from './authStorage';

export const apiFetch = async (input, init = {}, options = {}) => {
    const headers = new Headers(init.headers || {});
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(input, {
        ...init,
        headers
    });

    const shouldHandleUnauthorized = options.handleUnauthorized !== false;
    if (response.status === 401 && shouldHandleUnauthorized) {
        clearBrowserAuthState();
        sessionStorage.setItem(AUTH_FLASH_MESSAGE_KEY, 'Session expired. Please sign in again.');

        if (options.redirectOnUnauthorized !== false && window.location.pathname !== '/login') {
            window.location.assign('/login');
        }
    }

    return response;
};
