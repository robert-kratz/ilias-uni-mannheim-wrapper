import { Suspense, useEffect, useState } from 'react';
import { StoreType } from '../utils/appStorage';
import { EntityDataResponseItem } from '../types/objects';
import { EntityDataListItem } from '../components/EntityDataListItem';

type FileBrowserProps = {
    open: boolean;
    openDirectory: (directoryId: string) => void;
};

type FileBrowserFavoriteItemOrder = {
    courseId: string;
    courseName?: string;
    entities: EntityDataResponseItem[];
};

export default function FileBrowser({ open, openDirectory }: FileBrowserProps) {
    const [currentApplicaitonState, setCurrentApplicationState] = useState<StoreType | null>(null);
    const [favorites, setFavorites] = useState<EntityDataResponseItem[] | null>(null);

    let orderedFavorites: FileBrowserFavoriteItemOrder[] = [];

    if (favorites) {
        favorites.forEach((favorite) => {
            const course = orderedFavorites.find((course) => course.courseId === favorite.courseId);

            if (course) {
                course.entities.push(favorite);
            } else {
                orderedFavorites.push({
                    courseId: favorite.courseId,
                    courseName: favorite.courseTitle,
                    entities: [favorite],
                });
            }
        });
    }

    useEffect(() => {
        const fetchApplicationState = async () => {
            if (window.api) {
                window.api.getApplicationState().then((state) => {
                    setCurrentApplicationState(state);
                });
                console.log('No window.api');

                window.api.getFavorites().then((favorites) => {
                    console.log('Favorites: ', favorites);
                    setFavorites(favorites);
                });
            }
        };

        fetchApplicationState();

        const onReload = (event: Electron.IpcRendererEvent, data: { message: string; type: 'success' | 'error' }) => {
            console.log('onReload', data);
            fetchApplicationState();
        };

        window.api.onReload(onReload);

        return () => {
            window.api.removeReloadListener(onReload);
        };
    }, [open]);

    const removeFromFavorites = (directoryId: string, state: boolean) => {
        if (!state) setFavorites(favorites?.filter((favorite) => favorite.id !== directoryId));
    };

    return (
        <div>
            <div className="space-y-4">
                <Suspense fallback={<div>Loading...</div>}>
                    {/* {favorites?.map((favorite, index) => (
                        <EntityDataListItem
                            key={index}
                            item={favorite}
                            openDirectory={openDirectory}
                            onItemFavourite={removeFromFavorites}
                        />
                    ))} */}
                    <FavoritesSection
                        favorites={orderedFavorites}
                        removeFromFavorites={removeFromFavorites}
                        openDirectory={openDirectory}
                    />
                </Suspense>
            </div>
        </div>
    );
}

type FavoritesSectionProps = {
    favorites: FileBrowserFavoriteItemOrder[];
    openDirectory: (directoryId: string) => void;
    removeFromFavorites: (directoryId: string, state: boolean) => void;
};

export function FavoritesSection({ favorites, openDirectory, removeFromFavorites }: FavoritesSectionProps) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <h1 className="text-2xl font-bold text-white">Favorites</h1>
            {/* {favorites?.map((favorite, index) => (
            <EntityDataListItem
                key={index}
                item={favorite}
                openDirectory={openDirectory}
                onItemFavourite={removeFromFavorites}
            />
        ))} */}
            {favorites.map((course, index) => (
                <div key={index} className="space-y-2 bg-dark-gray-2 rounded-md p-4">
                    <div
                        className="p-4 rounded-md bg-dark-gray-3 flex justify-start items-center space-x-4 cursor-pointer"
                        onClick={() => openDirectory(course.courseId)}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6 text-violet-500 w-7 h-7">
                            <path
                                fillRule="evenodd"
                                d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <h1 className="text-gray-200 text-lg font-medium">{course.courseName}</h1>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
                        {course.entities.map((favorite, index) => (
                            <FavoriteSectionItem
                                removeFromFavorites={removeFromFavorites}
                                key={index}
                                item={favorite}
                                openDirectory={openDirectory}
                            />
                        ))}
                    </div>
                </div>
            ))}
            {favorites.length == 0 && (
                <div className="flex justify-center items-center h-32">
                    <h1 className="text-gray-300 text-sm">No favorites yet</h1>
                </div>
            )}
        </Suspense>
    );
}

type FavoriteSectionItemProps = {
    openDirectory: (directoryId: string) => void;
    item: EntityDataResponseItem;
    removeFromFavorites: (directoryId: string, state: boolean) => void;
};

export function FavoriteSectionItem({ item, openDirectory, removeFromFavorites }: FavoriteSectionItemProps) {
    return (
        <div className="p-4 bg-dark-gray-3 hover:scale-[100.75%] transition rounded-md w-full flex justify-between items-center cursor-pointer">
            <div
                onClick={() =>
                    item.matchingEntityType === 'directory' || item.matchingEntityType === 'course'
                        ? openDirectory(item.id)
                        : {}
                }
                className="flex justify-start items-center space-x-2 ">
                <div className="w-8 h-8 p-1">
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
                    <h3 className="text-gray-300 space-x-2 flex justify-start items-center">
                        <span className="text-md font-normal cursor-pointer">
                            {item.name.length + (item.parentName?.length || 0) > 80
                                ? item.name.slice(0, 80) + '.' + item.type + '...'
                                : item.name}
                        </span>
                    </h3>
                    <p className="text-gray-300 text-sm">
                        {item.parentId !== item.courseId && item.parentId != null && <span>{item.parentName}</span>}
                    </p>
                </div>
            </div>
            <div className="flex justify-end items-center space-x-3">
                <div className="text-gray-300 w-10 h-10 p-2 cursor-pointer">
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
                </div>
            </div>
        </div>
    );
}
