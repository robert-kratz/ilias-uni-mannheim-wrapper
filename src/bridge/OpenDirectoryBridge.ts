import { ipcMain } from 'electron';
import db from '../utils/database/database';
import { store } from '../utils/appStorage';
import { Course, Directory, File, OpenDirectoryResponse } from '../types/objects';
import { updateDirectory } from '../utils/datafetching/scraper/UpdateDirectory';
import { getMainWindow, getSessionToken } from '../index';

ipcMain.handle(
    'open-directory',
    async (event, directoryId: string, doCache?: boolean): Promise<OpenDirectoryResponse> => {
        return new Promise((resolve, reject) => {
            const userId = store.get('userId') as string;

            if (!userId) {
                reject('User not found');
                return;
            }

            const directory = db
                .prepare('SELECT * FROM directories WHERE id = ? AND userId = ?')
                .get(directoryId, userId) as Directory | undefined;

            if (!directory) {
                //check if course exists
                const course = db
                    .prepare('SELECT * FROM courses WHERE id = ? AND userId = ?')
                    .get(directoryId, userId) as Course | undefined;

                updateDirectory({
                    sessionId: getSessionToken(),
                    userId,
                    doCache,
                    parentFolderId: null,
                    courseId: course.id,
                    onEvent: (event) => {
                        getMainWindow().webContents.send('application-scrape', event);
                    },
                });

                if (!course) {
                    reject('Course not found');
                    return;
                }

                let result: OpenDirectoryResponse = {
                    year: course.year,
                    courseId: course.id,
                    directoryId: course.id,
                    directoryName: course.title,
                    parentId: null,
                    courseName: course.title,
                    parentName: '',
                    children: [],
                };

                const directories = db
                    .prepare('SELECT * FROM directories WHERE courseId = ? AND userId = ?')
                    .all(directoryId, userId) as Directory[] | undefined;

                const files = db
                    .prepare('SELECT * FROM files WHERE courseId = ? AND parentId IS NULL AND userId = ?')
                    .all(directoryId, userId) as File[] | undefined;

                directories.forEach((child) => {
                    if (child.courseId === directoryId) {
                        result.children.push({
                            name: child.name,
                            courseId: child.courseId,
                            id: child.id,
                            parentId: child.parentId,
                            courseYear: course.year,
                            courseTitle: course.title,
                            parentName: '',
                            type: null,
                            favorite: Boolean(child.favorite), // Updated to fetch actual favorite state
                            matchingEntityType: 'directory',
                        });
                    }
                });

                files.forEach((child) => {
                    result.children.push({
                        name: child.name,
                        courseId: course.id,
                        id: child.id,
                        parentId: null,
                        courseYear: course.year,
                        courseTitle: course.title,
                        parentName: null,
                        type: child.type,
                        favorite: false, // Files default to false
                        matchingEntityType: 'file',
                    });
                });

                resolve(result);
                return;
            }

            const course = db
                .prepare('SELECT * FROM courses WHERE id = ? AND userId = ?')
                .get(directory.courseId, userId) as Course | undefined;

            if (!course) {
                reject('Course not found');
                return;
            }

            let result: OpenDirectoryResponse = {
                year: course.year,
                courseId: course.id,
                directoryId: directory.id,
                directoryName: directory.name,
                parentId: directory.parentId,
                courseName: course.title,
                parentName: '',
                children: [],
            };

            const directories = db
                .prepare('SELECT * FROM directories WHERE parentId = ? AND userId = ?')
                .all(directoryId, userId) as Directory[] | undefined;

            const files = db
                .prepare('SELECT * FROM files WHERE parentId = ? AND userId = ?')
                .all(directoryId, userId) as File[] | undefined;

            let parentDirectory: Directory | undefined;

            if (directory.parentId) {
                parentDirectory = db
                    .prepare('SELECT * FROM directories WHERE id = ?')
                    .get(directory.parentId) as Directory;
            }

            updateDirectory({
                sessionId: getSessionToken(),
                userId,
                doCache,
                parentFolderId: directoryId,
                directoryId: directoryId,
                onEvent: (event) => {
                    getMainWindow().webContents.send('application-scrape', event);
                },
            });

            directories.forEach((child) => {
                if (child.parentId === directoryId) {
                    result.children.push({
                        name: child.name,
                        courseId: child.courseId,
                        id: child.id,
                        parentId: child.parentId,
                        courseYear: course.year,
                        courseTitle: course.title,
                        parentName: directory.name,
                        type: null,
                        favorite: Boolean(child.favorite), // Updated to fetch actual favorite state
                        matchingEntityType: 'directory',
                    });
                }
            });

            files.forEach((child) => {
                if (child.parentId === directoryId) {
                    result.children.push({
                        name: child.name,
                        courseId: course.id,
                        id: child.id,
                        parentId: child.parentId,
                        courseYear: course.year,
                        courseTitle: course.title,
                        parentName: directory.name,
                        type: child.type,
                        favorite: false, // Files default to false
                        matchingEntityType: 'file',
                    });
                }
            });

            result.parentName = parentDirectory?.name || null;

            resolve(result);
        });
    }
);
