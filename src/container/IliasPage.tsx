import { useEffect, useState } from 'react';
import { Course } from '../types/objects';
import { createToast } from 'vercel-toast';

export default function IliasPage() {
    const [userCourses, setUserCourses] = useState<
        Array<{
            year: number;
            courses: { title: string; link: string; description: string }[];
            groups: { title: string; link: string; description: string }[];
        }>
    >([]);

    const fetchApplicationState = async () => {
        if (window.api) {
            const promises = [window.api.getAllCourses(), window.api.getAllGroups()];

            const [courses, groups] = await Promise.all(promises);

            let currentData: Array<{
                year: number;
                courses: { title: string; link: string; description: string }[];
                groups: { title: string; link: string; description: string }[];
            }> = [];

            courses.forEach((currentYear: any) => {
                const year = currentYear.year;

                let yearIndex = currentData.findIndex((y) => y.year === year);

                if (yearIndex === -1) {
                    yearIndex = currentData.push({ year: year, courses: [], groups: [] }) - 1;
                }

                let courses = currentYear.courses;

                courses.forEach((course: any) => {
                    currentData[yearIndex].courses.push({
                        title: course.title,
                        link: course.id,
                        description: course.description,
                    });
                });
            });

            groups.forEach((currentYear: any) => {
                const year = currentYear.year;

                let yearIndex = currentData.findIndex((y) => y.year === year);

                if (yearIndex === -1) {
                    yearIndex = currentData.push({ year: year, courses: [], groups: [] }) - 1;
                }

                let groups = currentYear.groups;

                groups.forEach((group: any) => {
                    currentData[yearIndex].groups.push({
                        title: group.title,
                        link: group.id,
                        description: group.description,
                    });
                });
            });

            console.log(currentData);

            setUserCourses(currentData);
        }
    };

    useEffect(() => {
        fetchApplicationState();

        const handleReload = (
            event: Electron.IpcRendererEvent,
            { message, type }: { message: string; type: 'success' | 'error' }
        ) => {
            fetchApplicationState();
        };

        window.api.onReload(handleReload);

        return () => {
            // Assuming you expose a remove method as well
            window.api.removeReloadListener(handleReload);
        };
    }, []);

    return (
        <div className="space-y-4 pt-2">
            {userCourses.map((year) => {
                return (
                    <div
                        key={year.year}
                        className="w-full bg-dark-gray-2 transition cursor-pointer shadow-md text-white font-light rounded-md">
                        <div className="sticky top-0 bg-dark-gray-2 p-4 rounded-md z-10 flex justify-between items-center">
                            <h2 className="font-semibold text-xl">{year.year}</h2>
                            <div className="w-10 h-10">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="size-6 p-2 text-gray-400 hover:text-gray-300 transition">
                                    <path
                                        fillRule="evenodd"
                                        d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        </div>
                        <ul className="space-y-4 px-4 pb-4">
                            {year.courses.map((elements) => {
                                console.log(elements);

                                return (
                                    <li
                                        key={elements.link}
                                        className="p-4 bg-dark-gray-3 hover:scale-[100.75%] transition rounded-md flex justify-start items-center space-x-2">
                                        <div className="text-violet-500 w-10 h-10 p-1">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="size-6">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3>{elements.title}</h3>
                                            <p className="text-gray-400 text-xs">{elements.description}</p>
                                        </div>
                                    </li>
                                );
                            })}
                            {year.groups.map((elements) => {
                                return (
                                    <li
                                        key={elements.link}
                                        className="p-4 bg-dark-gray-3 hover:scale-[100.75%] transition rounded-md flex justify-start items-center space-x-2">
                                        <div className="text-emerald-500 w-10 h-10 p-1">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="size-6">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
                                                    clipRule="evenodd"
                                                />
                                                <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3>{elements.title}</h3>
                                            <p className="text-gray-400 text-xs">{elements.description}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
}
