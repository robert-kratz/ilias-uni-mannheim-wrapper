import { Course, Directory, ScrapeEvent } from '../../../types/objects';
import db from '../../../utils/database/database';
import { fetchConentPage, fetchUserIndexPage } from '../wrapper';

const CACHE_TIME = 1000 * 10; // 10 seconds

let lastFetch: Map<string, Date> = new Map();

type UpdateDirectoryType = {
    directoryId?: string;
    courseId?: string;
    userId: string;
    sessionId: string;
    doCache?: boolean;
    onEvent: (event: ScrapeEvent) => void;
};

type UpdateDirectoryReturnType = {};

/**
 * This function will not recurcively update the directory, it will only update the directory that is passed in.
 * @param param0
 * @returns
 */
export function updateDirectory({
    directoryId,
    courseId,
    sessionId,
    onEvent,
    userId,
    doCache,
}: UpdateDirectoryType): Promise<UpdateDirectoryReturnType> {
    return new Promise(async (resolve, reject) => {
        //Check if the directory
        if (!directoryId && !courseId) {
            reject('DirectoryId or courseId is required');
        }

        //CACHING
        if (lastFetch.has(directoryId || courseId) && doCache) {
            const lastFetchTime = lastFetch.get(directoryId || courseId) as Date;

            if (Date.now() - lastFetchTime.getTime() < CACHE_TIME) {
                console.log('Loaded ' + (directoryId || courseId) + ' from cache');

                resolve({});
                return;
            }
        }

        if (doCache) lastFetch.set(directoryId ? directoryId : courseId, new Date());

        onEvent({
            type: 'indexing',
            name: '',
            ref_id: directoryId ? 'd-' + directoryId : 'c-' + courseId,
            courseId: courseId,
        });

        let cId: string | null = courseId;

        //Check if the directory exists
        if (directoryId) {
            //Check if the directory exists
            const directory = db
                .prepare('SELECT * FROM directories WHERE id = ? AND userId = ?')
                .get(directoryId, userId) as Directory;

            if (!directory) {
                reject('Directory does not exist');
            }

            console.log('Updating directory: ' + directory.name);

            cId = directory.courseId;

            let fetchUserPage;

            //Fetch the directory and check if it exists
            try {
                fetchUserPage = await fetchConentPage({
                    sessionId,
                    userId,
                    target: directoryId.replace('d-', ''),
                    courseId: cId,
                    onEvent,
                });
            } catch (error) {
                console.error(error);
            }
        }

        //Check if the course exists
        if (courseId) {
            //Check if the course exists
            const course = db
                .prepare('SELECT * FROM courses WHERE id = ? AND userId = ?')
                .get(courseId, userId) as Course;

            if (!course) {
                reject('Course does not exist');
            }

            console.log('Updating course: ' + course.title);

            let fetchUserPage;

            //Fetch the directory and check if it exists
            try {
                fetchUserPage = await fetchConentPage({
                    sessionId,
                    userId,
                    target: cId.replace('c-', ''),
                    courseId: cId,
                    onEvent,
                });
            } catch (error) {
                console.error(error);
            }

            cId = course.id;
        }

        onEvent({
            type: 'finish',
            name: null,
            ref_id: null,
            courseId: null,
        });
    });
}
