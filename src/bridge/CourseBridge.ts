import { ipcMain } from 'electron';
import db from '../utils/database/database';
import { store } from '../utils/appStorage';
import { Course, Group } from '../types/objects';

export type GetCoursesReturnType = {
    success: boolean;
    courses: Course[];
    groups: Group[];
};

ipcMain.handle('get-all-courses', async (): Promise<GetCoursesReturnType> => {
    const userId = store.get('userId') as string;

    if (!userId) {
        console.error('User not found');
        return {
            success: false,
            courses: [],
            groups: [],
        };
    }

    try {
        const courses = db.prepare('SELECT * FROM courses WHERE userId = ?').all(userId) as Course[];
        const groups = db.prepare('SELECT * FROM groups WHERE userId = ?').all(userId) as Group[];

        console.log('Fetched courses: ', courses);
        console.log('Fetched groups: ', groups);

        return {
            success: true,
            courses,
            groups,
        };
    } catch (error) {
        console.error('Error fetching courses: ', error);
        return {
            success: false,
            courses: [],
            groups: [],
        };
    }
});
