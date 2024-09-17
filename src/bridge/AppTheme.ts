import { ipcMain, nativeTheme } from 'electron';
import { getMainWindow } from '../index';

ipcMain.handle('get-system-theme', () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

nativeTheme.on('updated', () => {
    getMainWindow().webContents.send('theme-changed', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
});
