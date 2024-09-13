//this is the wrapper for the client side data fetching. central is a sessionId. the session id is attached to the request header.

import { Course, Directory, ScrapeEvent } from '../../types/objects';
import db from '../database/database';
import { scrapeContentPage } from './scraper/ScrapeCoursePage';
import scrapeYearGroupsFromHtml from './scraper/ScrapeIndex';

const DELAY_BETWEEN_REQUESTS = 20;

type FetchUserIndexPageProps = {
    sessionId: string;
    includeYears?: string[];
    userId: string;
    onEvent: (message: ScrapeEvent) => void;
};

type WrapperResponse = {
    success: boolean;
    error?: string;
    hasChangedData?: boolean;
};

/**
 * Fetches the user index page
 * @param data - The data to be injected into the login page
 * @returns Promise<WrapperResponse>
 */
const fetchUserIndexPage = async ({
    sessionId,
    userId,
    onEvent,
    includeYears,
}: FetchUserIndexPageProps): Promise<WrapperResponse> => {
    try {
        const indexPageFetch = await scrapeYearGroupsFromHtml({
            sessionCookie: sessionId,
        });

        console.log('Index page fetch: ', indexPageFetch, sessionId);

        onEvent({
            type: 'start',
            name: null,
            ref_id: null,
            courseId: null,
        });

        let processedPages: string[] = [];

        let hasChangedData = false;

        try {
            for (const year of indexPageFetch) {
                console.log('Year: ', year.year);

                if (includeYears && !includeYears.includes(year.year)) continue;

                for (const course of year.courses) {
                    const refId = extractParameterFromUrl(course.link, 'ref_id');
                    if (!refId) continue;

                    const courseExists = db
                        .prepare('SELECT * FROM courses WHERE id = ? AND userid = ?;')
                        .get(`c-${refId}`, userId) as Course | undefined;

                    if (!courseExists) {
                        db.prepare(
                            'INSERT INTO courses (id, title, description, year, userId) VALUES (?, ?, ?, ?, ?)'
                        ).run(`c-${refId}`, course.title, course.date, year.year, userId);
                        console.log('Inserted course: ', course.title);

                        hasChangedData = true;
                    }

                    //check if the title, description and year has changed
                    if (
                        courseExists &&
                        (courseExists.title !== course.title ||
                            courseExists.description !== course.date ||
                            courseExists.year !== year.year)
                    ) {
                        db.prepare(
                            'UPDATE courses SET title = ?, description = ?, year = ? WHERE id = ? AND userid = ?;'
                        ).run(course.title, course.date, year.year, `c-${refId}`, userId);
                        console.log('Updated course: ', course.title);

                        hasChangedData = true;
                    }
                }
            }
        } catch (error: any) {
            console.error('Error processing courses: ', error);
            onEvent({
                type: 'error',
                courseId: null,
                name: null,
                ref_id: null,
                error: error,
            });
        }

        //SETP 2. fetch all courses

        // Go through all courses and schedule fetching of their pages, wait DELAY_BETWEEN_REQUESTSms between each task
        const courseIds = db.prepare('SELECT * FROM courses WHERE userid = ?;').all(userId) as Course[] | undefined;

        console.log('Course IDs: ', courseIds);

        try {
            for (const course of courseIds) {
                const coursePageFetch = await fetchConentPage({
                    //fetch content of the course /course/
                    sessionId,
                    courseId: course.id,
                    target: course.id,
                    userId,
                    onEvent,
                });

                if (!coursePageFetch.success) {
                    console.error('Error fetching course page: ', coursePageFetch.error);
                    return {
                        success: false,
                        error: coursePageFetch.error,
                    };
                }

                processedPages.push(course.id);

                hasChangedData = hasChangedData || coursePageFetch.hasChangedData;

                onEvent({
                    type: 'indexing',
                    name: course.title,
                    ref_id: course.id,
                    courseId: course.id,
                });

                new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
            }
        } catch (error) {
            console.error('Error fetching course pages: ', error);
            onEvent({
                type: 'error',
                courseId: null,
                name: null,
                ref_id: null,
                error: error,
            });
        }

        //SETP 3. Now fetch all folders which have no parentId
        const rootFolders = db
            .prepare('SELECT * FROM directories WHERE parentId IS NULL AND userid = ?;')
            .all(userId) as Directory[] | undefined;

        try {
            for (const folder of rootFolders) {
                const groupPageFetch = await fetchConentPage({
                    //fetch content of the course /course/ + folder
                    sessionId,
                    courseId: folder.courseId,
                    target: folder.id,
                    parentFolderId: folder.id,
                    userId,
                    onEvent,
                });

                if (!groupPageFetch.success) {
                    console.error('Error fetching group page: ', groupPageFetch.error);
                    return {
                        success: false,
                        error: groupPageFetch.error,
                    };
                }

                hasChangedData = hasChangedData || groupPageFetch.hasChangedData;

                processedPages.push(folder.id);

                onEvent({
                    type: 'indexing',
                    name: folder.name,
                    ref_id: folder.id,
                    courseId: folder.courseId,
                });

                new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
            }
        } catch (error) {
            console.error('Error fetching root folders: ', error);
            onEvent({
                type: 'error',
                courseId: null,
                name: null,
                ref_id: null,
                error: error,
            });
        }

        //Step 4. Now fetch all subfolders, that means all folders which have a parentId which is one of the root folders from step 3
        const subFolders = db
            .prepare('SELECT * FROM directories WHERE parentId IS NOT NULL AND userid = ?;')
            .all(userId) as Directory[] | undefined;

        try {
            for (const folder of subFolders) {
                //check whether the folders parent is a root folder

                let isRootFolder = rootFolders?.find((rootFolder) => rootFolder.id === `d-${folder.parentId}`);

                if (!isRootFolder) continue;

                const subFolderPageFetch = await fetchConentPage({
                    sessionId,
                    courseId: folder.courseId,
                    target: folder.id,
                    parentFolderId: folder.id,
                    userId,
                    onEvent,
                });

                if (!subFolderPageFetch.success) {
                    console.error('Error fetching subfolder page: ', subFolderPageFetch.error);
                    return {
                        success: false,
                        error: subFolderPageFetch.error,
                    };
                }

                hasChangedData = hasChangedData || subFolderPageFetch.hasChangedData;

                onEvent({
                    type: 'indexing',
                    name: folder.name,
                    ref_id: folder.id,
                    courseId: folder.courseId,
                });

                new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
            }
        } catch (error) {
            console.error('Error fetching subfolders: ', error);
            onEvent({
                type: 'error',
                courseId: null,
                name: null,
                ref_id: null,
                error: error,
            });
        }

        let totalProcessedFolders = 0;

        let endNodeFolders: Directory[] | undefined;

        //SETP 5. Now go through linear by repeating the step from above, for the first step, select all directories which have parentId as one of the subfolders from step 4
        do {
            endNodeFolders = db
                .prepare('SELECT * FROM directories WHERE parentId IS NOT NULL AND userid = ?;')
                .all(userId) as Directory[] | undefined;

            //filter out the folders which have already been processed
            endNodeFolders = endNodeFolders?.filter((folder) => !processedPages.includes(folder.id));

            console.log('End node folders: ', endNodeFolders);

            try {
                for (const folder of endNodeFolders) {
                    const subSubFolderPageFetch = await fetchConentPage({
                        sessionId,
                        courseId: folder.courseId,
                        target: folder.id,
                        parentFolderId: folder.id,
                        userId,
                        onEvent,
                    });

                    if (!subSubFolderPageFetch.success) {
                        console.error('Error fetching subfolder page: ', subSubFolderPageFetch.error);
                        return {
                            success: false,
                            error: subSubFolderPageFetch.error,
                        };
                    }

                    hasChangedData = hasChangedData || subSubFolderPageFetch.hasChangedData;

                    processedPages.push(folder.id);

                    totalProcessedFolders++;

                    onEvent({
                        type: 'indexing',
                        name: folder.name,
                        ref_id: folder.id,
                        courseId: folder.courseId,
                    });

                    new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
                }

                //reset the subfolders if all have been processed
                if (totalProcessedFolders === 0) break;
            } catch (error) {
                console.error('Error fetching subfolders: ', error);
                onEvent({
                    type: 'error',
                    courseId: null,
                    name: null,
                    ref_id: null,
                    error: error,
                });
            }
        } while (endNodeFolders.length > 0);

        return {
            success: true,
            hasChangedData: hasChangedData,
        };
    } catch (error: any) {
        console.error('Error fetching index page: ', error);
        return {
            success: false,
            error: error,
        };
    } finally {
        console.log('All tasks done');
    }
};

type FetchCoursePageProps = {
    sessionId: string;
    courseId: string;
    userId: string;
    target: string;
    parentFolderId?: string;
    onEvent: (message: ScrapeEvent) => void;
};

/**
 * Fetches the course page and schedules new tasks for subdirectories
 * @param data - The data to be injected into the login page
 * @returns Promise<void>
 */
const fetchConentPage = async ({
    sessionId,
    courseId,
    userId,
    target,
    onEvent,
    parentFolderId,
}: FetchCoursePageProps): Promise<WrapperResponse> => {
    try {
        let searchId = parentFolderId ? parentFolderId : target;

        const scrapedData = await scrapeContentPage({
            ref_id: target,
            sessionCookie: sessionId,
            typeFilter: ['Datei', 'Ordner', 'Gruppe'],
        });

        const files = scrapedData.filter((item) => item.assetsType === 'Datei');
        const folders = scrapedData.filter((item) => item.assetsType === 'Ordner');
        const groups = scrapedData.filter((item) => item.assetsType === 'Gruppe');

        let hasChangedData = false;

        //print course id + files + folders
        console.log('Scraping searchId: ', searchId);
        files.forEach((f) => console.log('- File: ', f.title));
        folders.forEach((f) => console.log('- Folder: ', f.title));

        for (const folder of folders) {
            const refId = extractParameterFromUrl(folder.link, 'ref_id');

            if (!refId) continue;

            const folderExists = db
                .prepare('SELECT * FROM directories WHERE id = ? AND userId = ?;')
                .get(`d-${refId}`, userId) as Directory | undefined;

            if (!folderExists) {
                db.prepare(
                    'INSERT INTO directories (id, name, description, parentId, userId, courseId) VALUES (?, ?, ?, ?, ?, ?)'
                ).run(`d-${refId}`, folder.title, folder.description, parentFolderId, userId, courseId);
                console.log('Inserted folder: ', folder.title);

                hasChangedData = true;
            }

            //check if the title, description and year has changed
            if (
                folderExists &&
                (folderExists.name !== folder.title || folderExists.description !== folder.description)
            ) {
                db.prepare('UPDATE directories SET name = ?, description = ? WHERE id = ? AND userId = ?;').run(
                    folder.title,
                    folder.description,
                    `d-${refId}`,
                    userId
                );
                console.log('Updated folder: ', folder.title);

                hasChangedData = true;
            }

            onEvent({
                type: 'indexing',
                name: folder.title,
                ref_id: `d-${refId}`,
                courseId: courseId,
            });

            new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        }

        // Add files to the database
        for (const file of files) {
            let fileId;

            try {
                fileId = new URL(file.link).searchParams.get('target');
            } catch (error) {
                console.error('Error parsing file URL: ', error);
                continue;
            }

            if (!fileId) continue;

            const fileExists = db.prepare('SELECT * FROM files WHERE id = ? AND userId = ?;').get(fileId, userId) as
                | Directory
                | undefined;

            if (!fileExists) {
                db.prepare(
                    'INSERT INTO files (id, name, parentId, type, userId, courseId) VALUES (?, ?, ?, ?, ?, ?)'
                ).run(fileId, file.title, parentFolderId, file.type, userId, courseId);
                console.log('Inserted file: ', file.title);

                hasChangedData = true;
            }

            //check if the title, description and year has changed
            if (fileExists && fileExists.name !== file.title) {
                db.prepare('UPDATE files SET name = ? WHERE id = ? AND userId = ?;').run(file.title, fileId, userId);
                console.log('Updated file: ', file.title);

                hasChangedData = true;
            }

            onEvent({
                type: 'indexing',
                name: file.title,
                ref_id: fileId,
                courseId: courseId,
            });

            new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        }

        return {
            success: true,
            hasChangedData: hasChangedData,
        };
    } catch (error) {
        console.error('Error fetching course page: ', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Fetches the user data from the page
 * @param {*} url The URL to extract the parameter from
 * @param {*} parameter The parameter to extract
 * @returns {string}
 */
const extractParameterFromUrl = (url: string, parameter: string): string | null => {
    const urlParams = new URLSearchParams(url);
    return urlParams.get(parameter);
};

export { fetchUserIndexPage, extractParameterFromUrl, fetchConentPage };

// /**
//  * Fetches the user index page
//  * @param data - The data to be injected into the login page
//  * @returns Promise<WrapperResponse>
//  */
// const fetchUserIndexPage = async ({
//     sessionId,
//     userId,
//     includeYears,
// }: FetchUserIndexPageProps): Promise<WrapperResponse> => {
//     let scrapedFolders: string[] = [];
//     const taskQueue: any[] = [];

//     try {
//         const indexPageFetch = await scrapeYearGroupsFromHtml({
//             sessionCookie: sessionId,
//         });

//         let hasChangedData = false;

//         for (const year of indexPageFetch) {
//             if (includeYears && !includeYears.includes(year.year)) continue;

//             for (const course of year.courses) {
//                 const refId = extractParameterFromUrl(course.link, 'ref_id');
//                 if (!refId) continue;

//                 // Plan to add tasks to the queue instead of immediate scheduling
//                 taskQueue.push({
//                     sessionId,
//                     courseId: refId,
//                     userId,
//                 });

//                 if (!scrapedFolders.includes(course.title)) {
//                     scrapedFolders.push(course.title);
//                     console.log('Added to queue for course: ', refId);
//                 }
//             }
//         }

//         // Process all tasks in the queue
//         await Promise.all(taskQueue.map((task) => limiter.schedule(() => fetchCoursePage(task))));

//         return {
//             success: true,
//             hasChangedData: hasChangedData,
//         };
//     } catch (error: any) {
//         console.error('Error fetching index page: ', error);
//         return {
//             success: false,
//             error: error,
//         };
//     } finally {
//         console.log('All tasks done');
//     }
// };

// type FetchCoursePageProps = {
//     sessionId: string;
//     courseId: string;
//     userId: string;
//     parentFolderId?: string;
// };

// type FetchGroupPageProps = {
//     success: boolean;
//     error?: string;
//     hasChangedData?: boolean;
// };

// /**
//  * Fetches the course page and schedules new tasks for subdirectories
//  * @param data - The data to be injected into the login page
//  * @returns Promise<void>
//  */
// const fetchCoursePage = async ({
//     sessionId,
//     courseId,
//     userId,
//     parentFolderId,
// }: FetchCoursePageProps): Promise<WrapperResponse> => {
//     console.log('Fetching course page: ', courseId);
//     console.log('Parent folder ID: ', parentFolderId);

//     try {
//         const [files, folders] = await Promise.all([
//             scrapeFilesFromPage({ ref_id: courseId, sessionCookie: sessionId }),
//             scrapeFoldersFromPage({ ref_id: courseId, sessionCookie: sessionId }),
//         ]);

//         let hasChangedData = false;

//         for (const folder of folders) {
//             const refId = extractParameterFromUrl(folder.link, 'ref_id');
//             console.log(': Folder: - ', folder.title);

//             let refParentId = refId === parentFolderId ? null : refId;

//             if (!refId) continue;

//             const folderExists = db
//                 .prepare(
//                     'SELECT d.id AS directory_id, f.id AS file_id FROM directories d, files f WHERE d.id = ? OR f.id = ?;'
//                 )
//                 .get(refId, refId);

//             if (!folderExists) {
//                 db.prepare(
//                     'INSERT INTO directories (id, name, description, parentId, userid, courseid) VALUES (?, ?, ?, ?, ?, ?)'
//                 ).run(refId, folder.title, folder.description, refParentId, userId, courseId);
//                 console.log('Inserted folder: ', folder.title);

//                 hasChangedData = true;
//             }

//             // Schedule fetching of this folder's page, recursively
//             limiter.schedule(() =>
//                 fetchCoursePage({
//                     sessionId,
//                     courseId: courseId,
//                     userId,
//                     parentFolderId: refParentId,
//                 })
//             );
//         }

//         return {
//             success: true,
//             hasChangedData: hasChangedData,
//         };
//     } catch (error) {
//         console.error('Error fetching course page: ', error);
//         return {
//             success: false,
//             error: error.message,
//         };
//     }
// };
