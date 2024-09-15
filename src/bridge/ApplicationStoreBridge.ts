import { ipcMain } from 'electron';
import { resetStore, store } from '../utils/appStorage';
import { dropAllTables } from '../utils/database/database';
import { getMainWindow } from '../index';

ipcMain.handle('getStoreValue', async (event, key) => {
    return store.get(key);
});

ipcMain.handle('setStoreValue', async (event, key, value) => {
    store.set(key, value);
});

ipcMain.handle('get-application-state', async (event) => {
    return store.store;
});

ipcMain.handle('reset-application', async (event) => {
    resetStore();
    dropAllTables();

    getMainWindow().reload();
});

export {};
