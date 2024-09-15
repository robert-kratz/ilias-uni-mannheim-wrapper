import { ipcMain } from 'electron';
import db from '../utils/database/database';
import { SearchDataResponseItem } from '../types/objects';
import { store } from '../utils/appStorage';

ipcMain.handle('search', async (event, query, year) => {
    console.log('search', query, 'year:', year);

    const userId = store.get('userId');

    if (!userId) {
        return [];
    }

    try {
        const result =
            (db
                .prepare(
                    `
                        SELECT
                            d.id AS id,
                            d.name AS name,
                            d.courseId AS courseId,
                            c.year AS courseYear,
                            c.title AS courseTitle,
                            d.parentId AS parentId,
                            COALESCE(dp.name, c.title) AS parentName,
                            d.favorite AS favorite,
                            'directory' AS matchingEntityType
                        FROM directories d
                        LEFT JOIN directories dp ON d.parentId = dp.id     -- Join to get parent directory name
                        LEFT JOIN courses c ON d.courseId = c.id           -- Join to get course information
                        WHERE (d.name LIKE ? OR d.description LIKE ?)
                            AND (c.year = ? OR ? IS NULL)

                        UNION ALL

                        -- Query for Files (name includes the file type)
                        SELECT
                            f.id AS id,
                            f.name || '.' || f.type AS name,
                            d.courseId AS courseId,
                            c.year AS courseYear,
                            c.title AS courseTitle,
                            f.parentId AS parentId,
                            d.name AS parentName,
                            d.favorite AS favorite,
                            'file' AS matchingEntityType
                        FROM files f
                        JOIN directories d ON f.parentId = d.id            -- Join to get parent directory information
                        LEFT JOIN courses c ON d.courseId = c.id           -- Join to get course information
                        WHERE (f.name LIKE ? OR f.variant LIKE ?)
                            AND (c.year = ? OR ? IS NULL)

                        UNION ALL

                        -- Query for Courses
                        SELECT
                            c.id AS id,
                            c.title AS name,
                            c.id AS courseId,
                            c.year AS courseYear,
                            c.title AS courseTitle,
                            NULL AS parentId,
                            NULL AS parentName,
                            FALSE AS favorite,
                            'course' AS matchingEntityType
                        FROM courses c
                        WHERE c.title LIKE ?
                            AND (c.year = ? OR ? IS NULL);
                    `
                )
                .all(
                    // Parameters for Directories subquery
                    `%${query}%`, // 1: d.name LIKE ?
                    `%${query}%`, // 2: d.description LIKE ?
                    year, // 3: c.year = ?
                    year, // 4: ? IS NULL

                    // Parameters for Files subquery
                    `%${query}%`, // 5: f.name LIKE ?
                    `%${query}%`, // 6: f.variant LIKE ?
                    year, // 7: c.year = ?
                    year, // 8: ? IS NULL

                    // Parameters for Courses subquery
                    `%${query}%`, // 9: c.title LIKE ?
                    year, // 10: c.year = ?
                    year // 11: ? IS NULL
                ) as SearchDataResponseItem[]) || [];

        return result || [];
    } catch (error) {
        console.error('Error searching: ', error);
        return [];
    }
});
