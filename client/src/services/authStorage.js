export const AUTH_TOKEN_KEY = "authToken";
export const USER_ID_KEY = "userId";
export const SEARCH_STATE_KEY = "trip.searchState";
export const AUTH_FLASH_MESSAGE_KEY = "trip.authFlashMessage";

export const clearBrowserAuthState = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(SEARCH_STATE_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(USER_ID_KEY);
};
