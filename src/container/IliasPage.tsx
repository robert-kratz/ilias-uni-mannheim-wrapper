import { useEffect, useState } from 'react';
import { Course } from '../types/objects';
import { GetCoursesReturnType } from '../bridge/CourseBridge';

type IliasPageProps = {
    open: boolean;
    openDirectory: (id: string) => void;
};

export default function IliasPage({ openDirectory, open }: IliasPageProps) {
    const [userSemesers, setUserSemesers] = useState<
        Array<{
            year: string;
            courses: Array<Course>;
            groups: Array<Course>;
        }>
    >([]);

    useEffect(() => {
        const fetchApplicationState = async () => {
            if (window.api) {
                window.api.getAllCourses().then((data: GetCoursesReturnType) => {
                    if (data.success) {
                        const courses = data.courses;
                        const groups = data.groups;

                        const years = courses.map((course) => course.year);
                        const uniqueYears = [...new Set(years)];

                        const userCourses = uniqueYears.map((year) => {
                            return {
                                year: year,
                                courses: courses.filter((course) => course.year === year),
                                groups: groups.filter((group) => group.year === year),
                            };
                        });

                        setUserSemesers(userCourses);

                        console.log(userCourses);
                    }
                });
            }
        };

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
    }, [open]);

    return (
        <div className="space-y-2">
            {/* <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Ilias</h1> */}
            <div className="py-2">
                {userSemesers.map((semester) => {
                    return (
                        <div
                            key={semester.year}
                            className="w-full cursor-pointer rounded-md bg-light-gray-2 font-light text-dark-gray-2 shadow-md transition dark:bg-dark-gray-2 dark:text-white">
                            <div className="sticky top-0 z-10 flex items-center justify-between rounded-md bg-light-gray-3 p-4 dark:bg-dark-gray-2">
                                <h2 className="text-xl font-semibold">{semester.year}</h2>
                            </div>
                            <ul className="space-y-4 p-4">
                                {semester.courses.map((elements) => {
                                    console.log(elements);

                                    let description =
                                        elements.description === 'Keine Anmeldung möglich' ? '' : elements.description;

                                    return (
                                        <li
                                            key={elements.id}
                                            onClick={() => openDirectory(elements.id)}
                                            className="flex items-center justify-start space-x-2 rounded-md bg-light-gray-3 p-4 transition hover:scale-[100.75%] dark:bg-dark-gray-3">
                                            <div className="h-10 w-10 p-1 text-violet-500">
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
                                                    s
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-light-text-2 dark:text-dark-text-2">
                                                    {elements.title}
                                                </h3>
                                                {/* <p className="text-gray-400 text-xs">{description}</p> */}
                                            </div>
                                        </li>
                                    );
                                })}
                                {semester.groups.map((elements) => {
                                    return (
                                        <li
                                            key={elements.id}
                                            onClick={() => openDirectory(elements.id)}
                                            className="flex items-center justify-start space-x-2 rounded-md bg-dark-gray-3 p-4 transition hover:scale-[100.75%]">
                                            <div className="h-10 w-10 p-1 text-emerald-500">
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
                                                <h3 className="text-light-text-2 dark:text-dark-text-2">
                                                    {elements.title}
                                                </h3>
                                                <p className="text-xs text-light-text-2 dark:text-dark-text-3">
                                                    {elements.description}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
