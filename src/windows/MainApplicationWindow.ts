import { BrowserWindow, shell } from 'electron';
import { isDev } from '../index';
import { showDevTools } from '../index';

type MainApplicationWindowProps = {
    preload: string;
    mainWindow: string;
};

/**
 * This function creates the main application window
 * @returns
 */
const createMainApplicationWindow = ({ preload, mainWindow }: MainApplicationWindowProps) => {
    // Create the browser window.
    let window = new BrowserWindow({
        width: 1200,
        height: 800,
        resizable: false,
        frame: true,
        icon: 'assets/ilias_logo.png',
        webPreferences: {
            nodeIntegration: true, // Keep this false for security reasons
            contextIsolation: true, // Ensures isolated context
            preload: preload,
        },
    });

    // and load the index.html of the app.
    window.loadURL(mainWindow);

    window.focus();

    if (showDevTools) window.webContents.openDevTools();

    window.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' }; // Deny the window from opening
    });

    return window;
};

export { createMainApplicationWindow };
