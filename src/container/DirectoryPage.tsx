import { useEffect } from 'react';
import { EntityDataListItem } from '../components/EntityDataListItem';
import { OpenDirectoryResponse } from '../types/objects';

type DirectoryPageProps = {
    directory: OpenDirectoryResponse | null;
    closeDirectory: () => void;
    goToDirectory: (directoryId: string) => void;
};

export default function DirectoryPage({ directory, closeDirectory, goToDirectory }: DirectoryPageProps) {
    if (!directory) return null;

    useEffect(() => {
        //set view to top, smooth scroll
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [directory]);

    return (
        <div className="text-white space-y-5 pt-4">
            <div className="flex justify-start items-center text-sm space-x-4">
                <span onClick={closeDirectory} className="p-3 bg-dark-gray-2 rounded-md cursor-pointer">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6 w-6 h-6">
                        <path
                            fillRule="evenodd"
                            d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </span>
                <div className="flex items-center space-x-2 w-full overflow-x-scroll">
                    <div
                        onClick={() => goToDirectory(directory.courseId)}
                        className="p-3 bg-dark-gray-2 hover:bg-dark-gray border-2 border-dark-gray transition rounded-md flex justify-start items-center space-x-2 cursor-pointer">
                        <div className="w-6 h-6">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6 text-violet-500">
                                <path
                                    fillRule="evenodd"
                                    d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <span>
                            {directory.courseName.length > 45
                                ? directory.courseName.slice(0, 45) + '...'
                                : directory.courseName}
                        </span>
                    </div>
                    {directory.parentName && directory.parentName !== directory.courseName && (
                        <div
                            onClick={() => goToDirectory(directory.parentId)}
                            className="p-3 bg-dark-gray-2 hover:bg-dark-gray border-2 border-dark-gray transition rounded-md flex justify-start items-center space-x-2 cursor-pointer">
                            <div className="w-6 h-6">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="size-6 text-emerald-500">
                                    <path d="M19.906 9c.382 0 .749.057 1.094.162V9a3 3 0 0 0-3-3h-3.879a.75.75 0 0 1-.53-.22L11.47 3.66A2.25 2.25 0 0 0 9.879 3H6a3 3 0 0 0-3 3v3.162A3.756 3.756 0 0 1 4.094 9h15.812ZM4.094 10.5a2.25 2.25 0 0 0-2.227 2.568l.857 6A2.25 2.25 0 0 0 4.951 21H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-2.227-2.568H4.094Z" />
                                </svg>
                            </div>
                            <span>
                                {directory.parentName.length > 45
                                    ? directory.parentName.slice(0, 45) + '...'
                                    : directory.parentName}
                            </span>
                        </div>
                    )}
                    {directory.parentName !== directory.directoryName &&
                        directory.directoryName !== directory.courseName && (
                            <div
                                onClick={() => goToDirectory(directory.directoryId)}
                                className="p-3 bg-dark-gray-2 hover:bg-dark-gray border-2 border-dark-gray transition rounded-md flex justify-start items-center space-x-2 cursor-pointer">
                                <div className="w-6 h-6">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="size-6 text-emerald-500">
                                        <path d="M19.906 9c.382 0 .749.057 1.094.162V9a3 3 0 0 0-3-3h-3.879a.75.75 0 0 1-.53-.22L11.47 3.66A2.25 2.25 0 0 0 9.879 3H6a3 3 0 0 0-3 3v3.162A3.756 3.756 0 0 1 4.094 9h15.812ZM4.094 10.5a2.25 2.25 0 0 0-2.227 2.568l.857 6A2.25 2.25 0 0 0 4.951 21H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-2.227-2.568H4.094Z" />
                                    </svg>
                                </div>
                                <span>{directory.directoryName}</span>
                            </div>
                        )}
                </div>
            </div>
            <h1 className="text-2xl font-semibold border-b-2 py-2 border-dark-gray">{directory.directoryName}</h1>
            <div className="space-y-4 text-gray-300">
                {directory?.children?.map((dir, index) => (
                    <EntityDataListItem key={index} item={dir} openDirectory={goToDirectory} />
                ))}
            </div>
        </div>
    );
}
