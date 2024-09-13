import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../state/store';
import { RootState } from '../state/store';
import { setLoadingIndicatorTextShown } from '../state/stateSlice';
import { useEffect, useState } from 'react';
import { ScrapeEvent } from '../types/objects';
import { createToast } from 'vercel-toast';

const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
};

export default function FetchingIndicator() {
    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch<AppDispatch>();

    const [isFetching, setIsFetching] = useState(false);
    const [lastScrapeEvent, setLastScrapeEvent] = useState<ScrapeEvent | null>(null);

    useEffect(() => {
        if (window.api) {
            window.api.onApplicationScrape((event, data) => {
                console.log('Scrape data:', data);
                setLastScrapeEvent(data);

                if (data.type === 'error') {
                    setIsFetching(false);
                    setIsFetching(false);
                    createToast('Error fetching data.' + data.error, {
                        type: 'error',
                        timeout: 5000,
                    });
                }

                if (data.type === 'start' || data.type === 'indexing') {
                    setIsFetching(true);
                }

                if (data.type === 'finish') {
                    setIsFetching(false);
                    setIsFetching(false);
                }
            });
        }

        return () => {
            if (window.api) {
                window.api.removeApplicationScrapeListener(() => {});
            }
        };
    }, []);

    let id = lastScrapeEvent?.ref_id;

    //replace all d-, c- with empty string
    id = id?.replace(/(d-|c-)/g, '');

    let isFile = id?.includes('file');

    let dirUrl = 'https://ilias.uni-mannheim.de/ilias.php?baseClass=ilrepositorygui&cmd=view&ref_id=' + id;
    let fileUrl = 'https://ilias.uni-mannheim.de/goto.php?client_id=ILIAS?target=' + id;

    const toggleLoadingIndicator = () => {
        dispatch(setLoadingIndicatorTextShown({ loadingIndicatorTextShown: !appState.loadingIndicatorTextShown }));
    };

    if (!isFetching) {
        return null;
    }

    return (
        <div
            onClick={toggleLoadingIndicator}
            className="bg-dark-gray-2 border-2 border-dark-gray hover:bg-dark-gray-3 left-28 bottom-6 fixed rounded-md flex justify-center items-center cursor-pointer shadow-md z-10">
            <div
                className={classNames(
                    'p-4 bg-emerald-500 group',
                    !appState.loadingIndicatorTextShown ? 'rounded-md' : 'rounded-l-md'
                )}>
                <div className="w-6 h-6 min-w-[1.5rem] border-4 border-t-4 border-emerald-300 border-t-emerald-900 rounded-full animate-spin right-4 top-4"></div>
            </div>
            <div className={classNames('p-4', !appState.loadingIndicatorTextShown && 'hidden')}>
                <p className="text-gray-300 text-sm">
                    {lastScrapeEvent?.name && lastScrapeEvent?.ref_id ? (
                        <a
                            href={isFile ? fileUrl : dirUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline truncate text-clip break-words max-w-[17rem]">
                            {lastScrapeEvent.name.length > 40
                                ? lastScrapeEvent.name.substring(0, 40) + '...'
                                : lastScrapeEvent.name}
                        </a>
                    ) : (
                        'Preparing...'
                    )}
                </p>
            </div>
        </div>
    );
}
