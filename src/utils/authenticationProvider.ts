import { BrowserWindow } from 'electron';
import isOnline from 'is-online';

import { getMainWindow, getSessionToken, MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, setSessionToken } from '../index';
import { store } from './appStorage';
import { isSessionTokenAlive } from './requestBuilder';
import { getPassword } from './pwstore';
import { createIliasAuthenticationWindow } from '../windows/IliasAuthenticationWindow';
import fetchUserDataFromHtml from './datafetching/scraper/ScrapeUserData';
import { createUserIfNotExists } from './database/database';
import scrapeYearGroupsFromHtml from './datafetching/scraper/ScrapeIndex';

let loginWindow: BrowserWindow | null = null;

type AuthenticationProviderProps = {
    onAuthenticated: (success: boolean, token?: string) => Promise<void> | void;
    sendToast?: boolean;
};

export async function attempRequestToService({ onAuthenticated, sendToast }: AuthenticationProviderProps) {
    return new Promise(async (resolve, reject) => {
        let sendResponse = false;
        let sessionAlive = false;

        const online = await isOnline();

        if (!online) {
            if (!sendResponse) {
                getMainWindow().webContents.send('page-message', {
                    message: 'No internet connection, please check your connection',
                    type: 'error',
                });
                sendResponse = true;
            }
            return;
        }

        if (loginWindow) {
            reject('Login window is already open');
        }

        const hasCredentialsSaved = store.get('credentialsSaved');

        const username = store.get('username') || '';
        const password = hasCredentialsSaved ? await getPassword(username) : '';

        let userId = (store.get('userId') as string) || '';

        let sessionToken = getSessionToken();

        if (sessionToken) {
            try {
                sessionAlive = await isSessionTokenAlive(sessionToken);

                if (sessionAlive) {
                    let aviablableYears: string[] = [];

                    try {
                        const aviablableYearsResponse = await scrapeYearGroupsFromHtml({ sessionCookie: sessionToken });

                        aviablableYears = aviablableYearsResponse.map((year) => year.year);

                        store.set('aviablableYears', aviablableYears);

                        onAuthenticated(true, sessionToken); // Call the callback
                        return;
                    } catch (error) {
                        console.error('Error fetching available years: ', error);
                    }
                }
            } catch (error) {
                console.error('Error while checking if session token is alive: ', error);
            }
        }

        const onAuthenticatedCalback = async (success: boolean, token?: string) => {
            setSessionToken(token);
            sessionToken = token;

            if (success) {
                console.log('Authenticated with token: ', token);
            }

            console.log('Credentials validated: ', success);

            try {
                const email = await fetchUserDataFromHtml({
                    sessionCookie: token,
                });

                let username = email.split('@')[0];

                userId = createUserIfNotExists(email);

                store.set('userId', userId);
                store.set('username', username);
            } catch (error) {
                console.error('Error fetching username: ', error);
            }

            if (!sendResponse && sendToast) {
                getMainWindow().webContents.send('page-message', {
                    message: 'Successfully authenticated with Ilias',
                    type: 'success',
                });

                sendResponse = true;
            }

            onAuthenticated(success, token); // Call the callback
        };

        try {
            if (hasCredentialsSaved) {
                loginWindow = createIliasAuthenticationWindow({
                    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
                    behavior: 'ATTEMP_AUTO_LOGIN',
                    onAuthenticated: onAuthenticatedCalback,
                    presavedCredentials: {
                        username,
                        password,
                    },
                });

                loginWindow.on('closed', () => {
                    loginWindow = null;
                    console.log('Login window has been closed and dereferenced');
                });
            } else {
                loginWindow = createIliasAuthenticationWindow({
                    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
                    behavior: 'FORCE_USER_LOGIN',
                    onAuthenticated: onAuthenticatedCalback,
                    presavedCredentials: {
                        username: userId,
                        password: '',
                    },
                });

                loginWindow.on('closed', () => {
                    loginWindow = null;
                    console.log('Login window has been closed and dereferenced');
                });
            }
        } catch (error) {
            console.error('Error opening login window: ', error);
            reject(error);
        }
    });
}

/**
 * Sets the login window
 * @param window BrowserWindow
 */
export function setLoginWindow(window: BrowserWindow) {
    loginWindow = window;
}

/**
 * Returns the login window
 * @returns BrowserWindow
 */
export function getLoginWindow() {
    return loginWindow;
}

/**
 * Closes the login window
 */
export function closeLoginWindow() {
    if (loginWindow) {
        loginWindow.close();
    }
}
