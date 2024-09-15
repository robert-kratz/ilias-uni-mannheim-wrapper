import { Suspense, useEffect, useState } from 'react';
import { StoreType } from '../utils/appStorage';
import { EntityDataResponseItem } from '../types/objects';
import { EntityDataListItem } from '../components/EntityDataListItem';

type FileBrowserProps = {
    open: boolean;
    openDirectory: (directoryId: string) => void;
};

export default function FileBrowser({ open, openDirectory }: FileBrowserProps) {
    const [currentApplicaitonState, setCurrentApplicationState] = useState<StoreType | null>(null);
    const [favorites, setFavorites] = useState<EntityDataResponseItem[] | null>(null);

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
            <div className="space-y-2">
                <Suspense fallback={<div>Loading...</div>}>
                    {favorites?.map((favorite, index) => (
                        <EntityDataListItem
                            key={index}
                            item={favorite}
                            openDirectory={openDirectory}
                            onItemFavourite={removeFromFavorites}
                        />
                    ))}
                </Suspense>
            </div>
        </div>
    );
}
