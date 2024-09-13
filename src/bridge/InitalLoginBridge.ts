import { ipcMain, BrowserWindow } from 'electron';
import {
    getLoginCurrentlyOpen,
    setLoginCurrentlyOpen,
    MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    getMainWindow,
    setSessionToken,
} from '../index';
import { getPassword } from '../utils/pwstore';
import { store } from '../utils/appStorage';
import { createIliasAuthenticationWindow } from '../windows/IliasAuthenticationWindow';
import fetchUserDataFromHtml from '../utils/datafetching/scraper/ScrapeUserData';
import { createUserIfNotExists } from '../utils/database/database';
import scrapeYearGroupsFromHtml from '../utils/datafetching/scraper/ScrapeIndex';

ipcMain.handle('open-login-window', async () => {
    if (getLoginCurrentlyOpen()) {
        console.log('Login window already open');
        return;
    }

    setLoginCurrentlyOpen(true);

    let loginWindow: BrowserWindow | null = null;

    const username = store.get('username') || '';
    const credsSaved = store.get('credentialsSaved');

    const password = credsSaved ? await getPassword(username) : '';

    try {
        loginWindow = createIliasAuthenticationWindow({
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            behavior: 'FORCE_USER_LOGIN',
            async onAuthenticated(success, token) {
                console.log('Authenticated with token: ', token);

                setSessionToken(token);

                let userId = '';

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

                store.set('isFirstStartUp', false);

                let aviablableYears: string[] = [];

                try {
                    const aviablableYearsResponse = await scrapeYearGroupsFromHtml({ sessionCookie: token });

                    aviablableYears = aviablableYearsResponse.map((year) => year.year);
                } catch (error) {
                    console.error('Error fetching available years: ', error);
                }

                store.set('aviablableYears', aviablableYears);

                getMainWindow().webContents.send('page-reload', {
                    message: 'Successfully authenticated',
                    type: 'success',
                });
            },
            presavedCredentials: {
                username: username,
                password: password,
            },
        });

        loginWindow.on('closed', () => {
            loginWindow = null;
            setLoginCurrentlyOpen(false);
            console.log('Login window has been closed and dereferenced');
        });
    } catch (error) {
        console.error('Error opening login window: ', error);
    }
});

export {};
