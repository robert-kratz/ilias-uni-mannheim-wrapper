import { ipcMain } from 'electron';

import { getSessionToken } from '../index';
import db from '../utils/database/database';
import { store } from '../utils/appStorage';

type StatsData = {
    totalCourses: number;
    totalFiles: number;
    totalDirectory: number;
    totalGroups: number;
};

export type StatsResponse = {
    success: boolean;
    stats?: StatsData;
};

ipcMain.handle('get-statistics', async (event): Promise<StatsResponse> => {
    const sessionId = getSessionToken();
    const userId = store.get('userId') as string;

    if (!sessionId) {
        console.log('No session id found');
        return {
            success: false,
        };
    }

    if (!userId) {
        console.log('No user id found');
        return {
            success: false,
        };
    }

    try {
        const courseCount = db.prepare('SELECT COUNT(*) as courseCount FROM courses WHERE userId = ?').get(userId) as {
            courseCount: number;
        };
        const fileCount = db.prepare('SELECT COUNT(*) fileCount FROM files WHERE userId = ?').get(userId) as {
            fileCount: number;
        };
        const groupCount = db.prepare('SELECT COUNT(*) groupCount FROM groups WHERE userId = ?').get(userId) as {
            groupCount: number;
        };
        const directoryCount = db
            .prepare('SELECT COUNT(*) directoryCount FROM directories WHERE userId = ?')
            .get(userId) as { directoryCount: number };

        return {
            success: true,
            stats: {
                totalCourses: courseCount.courseCount,
                totalFiles: fileCount.fileCount,
                totalDirectory: directoryCount.directoryCount,
                totalGroups: groupCount.groupCount,
            },
        };
    } catch (error) {
        console.error('Error fetching years', error);
        return {
            success: false,
        };
    }
});
