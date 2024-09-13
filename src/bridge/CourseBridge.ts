import { ipcMain, BrowserWindow } from 'electron';
import db from '../utils/database/database';

ipcMain.handle('get-all-courses', async () => {
    try {
        const courses: any = db.prepare('SELECT * FROM courses').all();

        let updatedCourses: Array<{
            year: number;
            courses: { title: string; link: string; description: string; type: 'Course' | 'Group' }[];
        }> = [];

        courses.forEach((course: any) => {
            const year = course.year;

            let yearIndex = updatedCourses.findIndex((y) => y.year === year);

            if (yearIndex === -1) {
                yearIndex = updatedCourses.push({ year: year, courses: [] }) - 1;
            }

            updatedCourses[yearIndex].courses.push({
                title: course.title,
                link: course.id,
                description: course.description,
                type: 'Course',
            });
        });

        return updatedCourses;
    } catch (error) {
        console.error('Error fetching courses: ', error);
        return [];
    }
});
