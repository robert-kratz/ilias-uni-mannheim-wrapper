import { ipcMain } from 'electron';
import db from '../utils/database/database';

ipcMain.handle('get-all-groups', async () => {
    try {
        const groups: any = db.prepare('SELECT * FROM groups').all();

        let updatedGroups: Array<{
            year: number;
            groups: { title: string; link: string; description: string; type: 'Course' | 'Group' }[];
        }> = [];

        groups.forEach((group: any) => {
            const year = group.year;

            let yearIndex = updatedGroups.findIndex((y) => y.year === year);

            if (yearIndex === -1) {
                yearIndex = updatedGroups.push({ year: year, groups: [] }) - 1;
            }

            updatedGroups[yearIndex].groups.push({
                title: group.title,
                link: group.id,
                description: group.description,
                type: 'Group',
            });
        });

        return updatedGroups;
    } catch (error) {
        console.error('Error fetching groups: ', error);
        return [];
    }
});
