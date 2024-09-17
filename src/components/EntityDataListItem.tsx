import { createToast } from 'vercel-toast';
import { EntityDataResponseItem } from '../types/objects';
import FavouriteBadge from './FavouriteBadge';

type EntityDataResponseType = {
    openDirectory: (directoryId: string) => void;
    onItemFavourite?: (directoryId: string, state: boolean) => void;
    item: EntityDataResponseItem;
    showRoute?: boolean;
    showFavourite?: boolean;
};

export function EntityDataListItem({
    item,
    openDirectory,
    showRoute,
    onItemFavourite,
    showFavourite = true,
}: EntityDataResponseType) {
    const downloadFile = async (fileId: string, name: string) => {
        if (window.api) {
            window.api.downloadFile(fileId, name).then(({ success, error, directory }) => {
                if (error === 'No directory selected') return;
                if (success) {
                    createToast('File downloaded successfully', {
                        type: 'success',
                        timeout: 5000,
                        action: {
                            text: 'Open Folder',
                            callback: (toast) => window.api.openFileExplorer(directory),
                        },
                    });
                } else {
                    createToast(error || 'An error occurred', {
                        type: success ? 'success' : 'error',
                        timeout: 5000,
                    });
                }
            });
        }
    };

    console.log('Item:', item);

    return (
        <div className="bg-light-gray-2 flex w-full cursor-pointer items-center justify-between rounded-md p-4 transition hover:scale-[100.75%] dark:bg-dark-gray-2">
            <div
                onClick={() =>
                    item.matchingEntityType === 'directory' || item.matchingEntityType === 'course'
                        ? openDirectory(item.id)
                        : {}
                }
                className="flex items-center justify-start space-x-2">
                <div className="h-10 w-10 p-1">
                    {item.matchingEntityType === 'file' ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6 text-indigo-500">
                            <path
                                fillRule="evenodd"
                                d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
                                clipRule="evenodd"
                            />
                            <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                        </svg>
                    ) : item.matchingEntityType === 'directory' ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6 text-emerald-500">
                            <path d="M19.906 9c.382 0 .749.057 1.094.162V9a3 3 0 0 0-3-3h-3.879a.75.75 0 0 1-.53-.22L11.47 3.66A2.25 2.25 0 0 0 9.879 3H6a3 3 0 0 0-3 3v3.162A3.756 3.756 0 0 1 4.094 9h15.812ZM4.094 10.5a2.25 2.25 0 0 0-2.227 2.568l.857 6A2.25 2.25 0 0 0 4.951 21H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-2.227-2.568H4.094Z" />
                        </svg>
                    ) : item.matchingEntityType === 'course' ? (
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
                    ) : null}
                </div>
                <div>
                    <h3 className="text-light-text-2 dark:text-dark-text-2 flex items-center justify-start space-x-2">
                        {item.parentId !== item.courseId && item.parentId != null && showRoute && (
                            <>
                                <span className="text-light-text-2 dark:text-dark-text-3 text-sm">
                                    {item.parentName}
                                </span>
                                <span>/</span>
                            </>
                        )}
                        <span className="cursor-pointer text-lg font-semibold">
                            {item.name.length + (item.parentName?.length || 0) > 80
                                ? item.name.slice(0, 80) + (item.type && '.' + item.type) + '...'
                                : item.name}
                        </span>
                    </h3>
                    {item.matchingEntityType !== 'course' && (
                        <p className="text-light-text-3 dark:text-dark-text-3 space-x-2 text-xs">
                            <span>In: {item.courseTitle}</span>
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-end space-x-3">
                {item.matchingEntityType == 'directory' && showFavourite && (
                    <FavouriteBadge item={item} key={item.id} onItemFavourite={onItemFavourite} />
                )}
                <div className="text-light-text-3 dark:text-dark-text-3 h-10 w-10 cursor-pointer p-2">
                    {item.matchingEntityType === 'file' ? (
                        <div onClick={() => downloadFile(item.id, item.name)}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6">
                                <path d="M12 1.5a.75.75 0 0 1 .75.75V7.5h-1.5V2.25A.75.75 0 0 1 12 1.5ZM11.25 7.5v5.69l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V7.5h3.75a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h3.75Z" />
                            </svg>
                        </div>
                    ) : item.matchingEntityType === 'directory' ? (
                        <a
                            target="_blank"
                            href={`https://ilias.uni-mannheim.de/ilias.php?baseClass=ilrepositorygui&cmd=view&ref_id=${item.id?.replace(
                                'd-',
                                ''
                            )}`}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6">
                                <path
                                    fillRule="evenodd"
                                    d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L8.03 17.03a.75.75 0 0 1-1.06-1.06L19.19 3.75h-3.44a.75.75 0 0 1 0-1.5Zm-10.5 4.5a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V10.5a.75.75 0 0 1 1.5 0v8.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h8.25a.75.75 0 0 1 0 1.5H5.25Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </a>
                    ) : item.matchingEntityType === 'course' ? (
                        <a
                            target="_blank"
                            href={`https://ilias.uni-mannheim.de/ilias.php?baseClass=ilrepositorygui&cmd=view&ref_id=${item.id?.replace(
                                'c-',
                                ''
                            )}`}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6">
                                <path
                                    fillRule="evenodd"
                                    d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L8.03 17.03a.75.75 0 0 1-1.06-1.06L19.19 3.75h-3.44a.75.75 0 0 1 0-1.5Zm-10.5 4.5a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V10.5a.75.75 0 0 1 1.5 0v8.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h8.25a.75.75 0 0 1 0 1.5H5.25Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </a>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
