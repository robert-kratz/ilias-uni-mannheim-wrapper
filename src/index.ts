import { app, BrowserWindow, shell, ipcMain, globalShortcut } from 'electron';
import path from 'path';

import { createTablesIfNotExists } from './database';
import { createMainApplicationWindow } from './windows/MainApplicationWindow';
import { createIliasAuthenticationWindow } from './windows/IliasAuthenticationWindow';

import { resetStore, store } from './utils/appStorage';
import { getPassword, savePassword } from './utils/pwstore';
import { fetchUserDataFromHtml } from './utils/datafetching/scrape';

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

let mainWindow: BrowserWindow | null = null;

async function main() {
    // Create the database tables if they do not exist
    createTablesIfNotExists();

    const isFirstStartUp = store.get('isFirstStartUp');

    if (isFirstStartUp) {
        store.set('isFirstStartUp', false);
    }

    mainWindow = createMainApplicationWindow({
        mainWindow: MAIN_WINDOW_WEBPACK_ENTRY,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    });
}

app.on('ready', async () => {
    const shortcut = process.platform === 'darwin' ? 'Cmd+Shift+R' : 'Ctrl+Shift+R';

    // Register the global shortcut
    const ret = globalShortcut.register(shortcut, () => {
        console.log('Shortcut pressed, resetting store');
        resetStore();
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

ipcMain.handle('submit-credentials', async (event, { username, password }) => {
    console.log('submit-credentials', username, password);

    let loginWindow: BrowserWindow | null = null;

    try {
        loginWindow = createIliasAuthenticationWindow({
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            behavior: 'LOGIN_SERVER_VALIDATION',
            async onAuthenticated(success, token) {
                if (success) {
                    store.set('sessionToken', token);
                    store.set('username', username);
                    store.set('credentialsSaved', true);

                    await savePassword(username, password);

                    console.log('Authenticated with token: ', token);
                    console.log('Credentials saved', username, password);

                    mainWindow.webContents.send('page-reload', {
                        message: 'Credentials validated and saved for next login.',
                        type: 'success',
                    });
                }

                mainWindow.webContents.send('credentials-validated', { isValid: success });
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

    return true;
});

ipcMain.handle('getStoreValue', async (event, key) => {
    console.log('getStoreValue', key);

    return store.get(key);
});

ipcMain.handle('setStoreValue', async (event, key, value) => {
    store.set(key, value);
});

ipcMain.handle('open-login-window', async () => {
    let loginWindow: BrowserWindow | null = null;

    const username = store.get('username') || '';
    const credsSaved = store.get('credentialsSaved');

    const password = credsSaved ? await getPassword(username) : '';

    try {
        loginWindow = createIliasAuthenticationWindow({
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            behavior: 'ATTEMP_AUTO_LOGIN',
            async onAuthenticated(success, token) {
                console.log('Authenticated with token: ', token);

                try {
                    const email = await fetchUserDataFromHtml({
                        sessionCookie: token,
                    });

                    let username = email.split('@')[0];

                    store.set('username', username);
                } catch (error) {
                    console.error('Error fetching username: ', error);
                }

                store.set('sessionToken', token);
                store.set('isFirstStartUp', false);

                mainWindow.webContents.send('page-reload', {
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
            console.log('Login window has been closed and dereferenced');
        });
    } catch (error) {
        console.error('Error opening login window: ', error);
    }
});

export { isDev, showDevTools, MAIN_WINDOW_WEBPACK_ENTRY, MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY };
