import { ipcMain } from 'electron';
import db from '../utils/database/database';
import { SearchDataResponseItem } from '../types/objects';

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
