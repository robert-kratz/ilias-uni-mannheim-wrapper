import { ipcMain } from 'electron';
import getStaticContent from '../utils/staticAlerts';

ipcMain.handle('get-static-content', async (event) => {
    const staticContent = await getStaticContent();

    if (!staticContent) return null;

    return staticContent;
});
export {};
