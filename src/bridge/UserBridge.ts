import { ipcMain } from 'electron';
import db from '../utils/database/database';
import { User } from '../types/objects';

ipcMain.handle('get-user-list', async (event) => {
    try {
        const userList = db.prepare('SELECT * FROM user').all() as User[];

        return userList;
    } catch (error) {
        console.error('Error while getting user list', error);

        return [];
    }
});

export {};
