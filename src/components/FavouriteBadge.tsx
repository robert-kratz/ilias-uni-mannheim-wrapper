import { useEffect, useState } from 'react';
import { EntityDataResponseItem } from '../types/objects';

const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
};

type Props = {
    item: EntityDataResponseItem;
    onItemFavourite?: (directoryId: string, state: boolean) => void;
};

export default function FavouriteBadge({ item, onItemFavourite }: Props) {
    const [isFavourite, setIsFavourite] = useState<boolean>(item.favorite);

    const toggleFavourite = () => {
        if (window.api) {
            window.api.setFavourite(item.id, !isFavourite).then((success) => {
                if (success) {
                    onItemFavourite && onItemFavourite(item.id, !isFavourite);
                    setIsFavourite(!isFavourite);
                }
            });
        }
    };

    useEffect(() => {
        const fetchApplicationState = async () => {
            window.api.isDirectoryFavourite(item.id).then((isFavourite) => {
                setIsFavourite(isFavourite);
            });
        };

        fetchApplicationState();

        const onReload = () => {
            fetchApplicationState();
        };

        window.api.onReload(onReload);

        return () => {
            window.api.removeReloadListener(onReload);
        };
    }, []);

    return (
        <div
            onClick={toggleFavourite}
            className={classNames(
                'h-5 w-5 cursor-pointer text-yellow-600',
                item.matchingEntityType == 'file' ? 'hidden' : ''
            )}>
            {isFavourite ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path
                        fillRule="evenodd"
                        d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
                        clipRule="evenodd"
                    />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                    />
                </svg>
            )}
        </div>
    );
}
