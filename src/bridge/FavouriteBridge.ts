import { ipcMain, BrowserWindow } from 'electron';
import db from '../utils/database/database';
import { store } from '../utils/appStorage';
import { Directory, EntityDataResponseItem } from '../types/objects';

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

ipcMain.handle('is-directory-favourite', async (event, directoryId) => {
    console.log('is-directory-favourite');

    const userId = store.get('userId');

    if (!userId) {
        console.log('No user id found');
        return false;
    }

    try {
        const directory = db
            .prepare('SELECT favorite FROM directories WHERE id = ? AND userId = ?')
            .get(directoryId, userId) as { favorite: number };

        if (!directory) {
            console.log('Directory does not exist');
            return false;
        }

        return directory.favorite === 1;
    } catch (error) {
        console.error('Error checking favorite: ', error);
        return false;
    }
});

ipcMain.handle('get-favorites', async (event): Promise<EntityDataResponseItem[] | null> => {
    console.log('get-favorites');

    const userId = store.get('userId');

    if (!userId) {
        console.log('No user id found');
        return null;
    }

    try {
        const directories = db
            .prepare(
                `
                SELECT
                    d.*,
                    c.year AS courseYear,
                    c.title AS courseTitle,
                    dp.name AS parentName
                FROM directories d
                LEFT JOIN courses c ON d.courseId = c.id      -- Join to get course information
                LEFT JOIN directories dp ON d.parentId = dp.id -- Join to get parent directory name
                WHERE d.favorite = 1
                AND d.userId = ?;
                `
            )
            .all(userId) as any;

        const response: EntityDataResponseItem[] = directories.map((directory: any) => {
            return {
                name: directory.name,
                courseId: directory.courseId,
                id: directory.id,
                parentId: directory.parentId,
                courseYear: directory.courseYear,
                courseTitle: directory.courseTitle,
                parentName: directory.parentName,
                favorite: directory.favorite,
                type: 'directory',
                matchingEntityType: 'directory',
            };
        });

        console.log('Favorites: ', response);

        return response;
    } catch (error) {
        console.error('Error getting favorites: ', error);
        return null;
    }
});
