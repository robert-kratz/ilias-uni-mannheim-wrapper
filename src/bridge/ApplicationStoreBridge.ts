import { ipcMain } from 'electron';
import { store } from '../utils/appStorage';

ipcMain.handle('getStoreValue', async (event, key) => {
    console.log('getStoreValue', key);

    return store.get(key);
});

ipcMain.handle('setStoreValue', async (event, key, value) => {
    store.set(key, value);
});
export {};
