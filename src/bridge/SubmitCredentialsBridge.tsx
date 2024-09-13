import { BrowserWindow, ipcMain } from 'electron';
import { getMainWindow, MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, setSessionToken } from '../index';
import { createIliasAuthenticationWindow } from '../windows/IliasAuthenticationWindow';
import { savePassword } from '../utils/pwstore';
import { store } from '../utils/appStorage';

ipcMain.handle('submit-credentials', async (event, { username, password }) => {
    console.log('submit-credentials', username, password);

    let loginWindow: BrowserWindow | null = null;

    try {
        loginWindow = createIliasAuthenticationWindow({
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            behavior: 'LOGIN_SERVER_VALIDATION',
            async onAuthenticated(success, token) {
                if (success) {
                    setSessionToken(token);

                    store.set('username', username);
                    store.set('credentialsSaved', true);

                    await savePassword(username, password);

                    console.log('Authenticated with token: ', token);
                    console.log('Credentials saved', username, password);

                    getMainWindow().webContents.send('page-reload', {
                        message: 'Credentials validated and saved for next login.',
                        type: 'success',
                    });
                }

                getMainWindow().webContents.send('credentials-validated', { isValid: success });
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
