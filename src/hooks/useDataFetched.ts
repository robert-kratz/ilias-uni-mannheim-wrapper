import { useEffect } from 'react';
import { ScrapeEvent } from '../types/objects';

export function useDataFetched(callback: (event: Electron.IpcRendererEvent, data: ScrapeEvent) => void) {
    useEffect(() => {
        if (!window.api) {
            return;
        }

        window.api.onApplicationScrape(callback);
        return () => {
            window.api.removeApplicationScrapeListener(callback);
        };
    }, [callback]);
}
