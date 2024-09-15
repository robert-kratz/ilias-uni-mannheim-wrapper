import { app, BrowserWindow, globalShortcut } from 'electron';
import { createTablesIfNotExists, dropAllTables } from './utils/database/database';
import { createMainApplicationWindow } from './windows/MainApplicationWindow';
import { createIliasAuthenticationWindow } from './windows/IliasAuthenticationWindow';

import { resetStore, store } from './utils/appStorage';
import { getPassword } from './utils/pwstore';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let isDev = process.env.NODE_ENV === 'development';
let showDevTools = false;

//check if process arguments contain --dev
if (process.argv.includes('--dev')) {
    showDevTools = true;
}

console.log(`Starting in ${isDev ? 'development' : 'production'} mode`);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let sessionToken: string | null = null;
let mainWindow: BrowserWindow | null = null;

let isCurrentlyFetching = false;
let loginCurrentlyOpen = false;

async function main() {
    // Create the database tables if they do not exist
    createTablesIfNotExists();

    const isFirstStartUp = store.get('isFirstStartUp');
    const hasSetUpWizard = store.get('hasSetUpWizard');
    const hasCredentialsSaved = store.get('credentialsSaved');

    if (!isFirstStartUp && !hasSetUpWizard) {
        resetStore();
        dropAllTables();
        console.log('Resetting store because of invalid state');
    }

    mainWindow = createMainApplicationWindow({
        mainWindow: MAIN_WINDOW_WEBPACK_ENTRY,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    });

    //start fetching the user index page
    if (!isFirstStartUp && hasSetUpWizard) {
        let loginWindow: BrowserWindow | null = null;

        try {
            const username = store.get('username') || '';
            const password = hasCredentialsSaved ? await getPassword(username) : '';

            const userId = (store.get('userId') as string) || '';

            loginWindow = createIliasAuthenticationWindow({
                preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
                behavior: 'ATTEMP_AUTO_LOGIN',
                async onAuthenticated(success, token) {
                    sessionToken = token;

                    if (success) {
                        console.log('Authenticated with token: ', token);
                    }

                    console.log('Credentials validated: ', success);

                    mainWindow.webContents.send('page-reload', {
                        message: 'Course data fetched',
                        type: 'success',
                    });
                },
                presavedCredentials: {
                    username,
                    password,
                },
            });
            loginWindow.on('closed', () => {
                loginWindow = null;
                console.log('Login window has been closed and dereferenced');
            });
        } catch (error) {
            console.error('Error opening login window: ', error);
        }
    }
}

app.on('ready', async () => {
    const shortcut = process.platform === 'darwin' ? 'Cmd+Shift+R' : 'Ctrl+Shift+R';

    // Register the global shortcut
    const ret = globalShortcut.register(shortcut, () => {
        console.log('Shortcut pressed, resetting store');
        resetStore();
        dropAllTables();
    });

    if (!ret) {
        console.error('Registration failed');
    } else {
        console.log('Registration succeeded');
    }

    main();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainApplicationWindow({
            mainWindow: MAIN_WINDOW_WEBPACK_ENTRY,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        });
    }
});

//load ipc handlers from bridge files
import './bridge/ApplicationStoreBridge';
import './bridge/CourseBridge';
import './bridge/GroupBridge';
import './bridge/InitalLoginBridge';
import './bridge/ScrapeBridge';
import './bridge/SearchBridge';
import './bridge/StaticContentBridge';
import './bridge/SubmitCredentialsBridge';
import './bridge/UserBridge';
import './bridge/FavouriteBridge';
import './bridge/DownloadFile';

export const setSessionToken = (token: string) => {
    sessionToken = token;
};

export const getSessionToken = () => {
    return sessionToken;
};

export const setMainWindow = (window: BrowserWindow) => {
    mainWindow = window;
};

export const getMainWindow = () => {
    return mainWindow;
};

export const setIsCurrentlyFetching = (fetching: boolean) => {
    isCurrentlyFetching = fetching;
};

export const getIsCurrentlyFetching = () => {
    return isCurrentlyFetching;
};

export const setLoginCurrentlyOpen = (open: boolean) => {
    loginCurrentlyOpen = open;
};

export const getLoginCurrentlyOpen = () => {
    return loginCurrentlyOpen;
};

export { isDev, showDevTools, MAIN_WINDOW_WEBPACK_ENTRY, MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY };
