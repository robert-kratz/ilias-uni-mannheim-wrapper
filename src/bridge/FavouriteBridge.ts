import { ipcMain, BrowserWindow } from 'electron';
import db from '../utils/database/database';
import { store } from '../utils/appStorage';

ipcMain.handle('set-favourite', async (event, directoryId, state) => {
    console.log('set-favourite');

    const userId = store.get('userId');

    let updateState = state ? 1 : 0;

    if (!userId) {
        console.log('No user id found');
        return false;
    }

    try {
        //directoryId is the ID of the directory you want to set as favourite
        const directoryExists = db
            .prepare('SELECT id FROM directories WHERE id = ? AND userId = ?')
            .get(directoryId, userId);

        if (!directoryExists) {
            console.log('Directory does not exist');
            return false;
        }

        db.prepare('UPDATE directories SET favorite = ? WHERE id = ?').run(updateState, directoryId);

        console.log('Set favourite: ', state);

        return true;
    } catch (error) {
        console.error('Error setting favorite: ', error);
        return false;
    }
});
