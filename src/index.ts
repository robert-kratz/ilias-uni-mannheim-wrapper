import { app, BrowserWindow, shell, ipcMain, globalShortcut } from 'electron';
import JSDOM from 'jsdom';

import db, { createTablesIfNotExists, createUserIfNotExists, dropAllTables } from './database';
import { createMainApplicationWindow } from './windows/MainApplicationWindow';
import { createIliasAuthenticationWindow } from './windows/IliasAuthenticationWindow';

import { resetStore, store } from './utils/appStorage';
import { getPassword, savePassword } from './utils/pwstore';
import { fetchUserIndexPage } from './utils/datafetching/wrapper';
import { Course, SearchDataResponseItem } from './types/objects';
import getStaticContent from './utils/staticAlerts';
import fetchUserDataFromHtml from './utils/datafetching/scraper/ScrapeUserData';

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
    const hasCredentialsSaved = store.get('credentialsSaved');

    mainWindow = createMainApplicationWindow({
        mainWindow: MAIN_WINDOW_WEBPACK_ENTRY,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    });

    //start fetching the user index page
    if (!isFirstStartUp) {
        let loginWindow: BrowserWindow | null = null;

        try {
            const username = store.get('username') || '';
            const password = hasCredentialsSaved ? await getPassword(username) : '';

            const userId = (store.get('userId') as string) || '';

            loginWindow = createIliasAuthenticationWindow({
                preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
                behavior: 'ATTEMP_AUTO_LOGIN',
                async onAuthenticated(success, token) {
                    console.log('Authenticated with token: ', token);

                    if (success) {
                        console.log('Authenticated with token: ', token);

                        //fetch index page
                        //await fetchUserIndexPage({ sessionId: token, userId, includeYears: ['HWS 2024'] });
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

ipcMain.handle('search', async (event, query) => {
    console.log('search', query);

    try {
        const result = db
            .prepare(
                "SELECT d.id AS dirId, f.id AS fileId, f.type, f.name AS fileName, d.name AS dirName, d.courseId, c.title AS courseTitle, c.year AS courseYear, CASE WHEN d.name LIKE ? THEN 'directory' WHEN f.name LIKE ? THEN 'file' WHEN c.title LIKE ? THEN 'course' ELSE 'none' END AS matchingEntityType FROM directories d JOIN files f ON d.id = f.parentId JOIN courses c ON d.courseId = c.id WHERE d.name LIKE ? OR f.name LIKE ? OR c.title LIKE ?;"
            )
            .all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`) as
            | SearchDataResponseItem[]
            | [];

        console.log('Search result: ', result);

        return result || [];
    } catch (error) {
        console.error('Error searching: ', error);
        return [];
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

ipcMain.handle('get-all-courses', async () => {
    try {
        const courses: any = db.prepare('SELECT * FROM courses').all();

        let updatedCourses: Array<{
            year: number;
            courses: { title: string; link: string; description: string; type: 'Course' | 'Group' }[];
        }> = [];

        courses.forEach((course: any) => {
            const year = course.year;

            let yearIndex = updatedCourses.findIndex((y) => y.year === year);

            if (yearIndex === -1) {
                yearIndex = updatedCourses.push({ year: year, courses: [] }) - 1;
            }

            updatedCourses[yearIndex].courses.push({
                title: course.title,
                link: course.id,
                description: course.description,
                type: 'Course',
            });
        });

        return updatedCourses;
    } catch (error) {
        console.error('Error fetching courses: ', error);
        return [];
    }
});

ipcMain.handle('get-all-groups', async () => {
    try {
        const groups: any = db.prepare('SELECT * FROM groups').all();

        let updatedGroups: Array<{
            year: number;
            groups: { title: string; link: string; description: string; type: 'Course' | 'Group' }[];
        }> = [];

        groups.forEach((group: any) => {
            const year = group.year;

            let yearIndex = updatedGroups.findIndex((y) => y.year === year);

            if (yearIndex === -1) {
                yearIndex = updatedGroups.push({ year: year, groups: [] }) - 1;
            }

            updatedGroups[yearIndex].groups.push({
                title: group.title,
                link: group.id,
                description: group.description,
                type: 'Group',
            });
        });

        return updatedGroups;
    } catch (error) {
        console.error('Error fetching groups: ', error);
        return [];
    }
});

ipcMain.handle('open-login-window', async () => {
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

                store.set('sessionToken', token);
                store.set('isFirstStartUp', false);

                mainWindow.webContents.send('page-reload', {
                    message: 'Successfully authenticated',
                    type: 'success',
                });

                const fetchResponse = await fetchUserIndexPage({ sessionId: token, userId: userId });

                if (fetchResponse.success) {
                    console.log('Successfully fetched user index page');
                    mainWindow.webContents.send('page-reload', {
                        message: 'Successfully fetched user index page',
                        type: 'success',
                    });
                }
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

ipcMain.handle('get-static-content', async (event) => {
    const staticContent = await getStaticContent();

    if (!staticContent) return null;

    return staticContent;
});

export { isDev, showDevTools, MAIN_WINDOW_WEBPACK_ENTRY, MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY };
