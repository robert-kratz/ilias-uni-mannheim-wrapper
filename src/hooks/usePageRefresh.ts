import { useEffect } from 'react';

export default function usePageRefresh(callback: (_: Electron.IpcRendererEvent) => void) {
    useEffect(() => {
        if (!window.api) {
            return;
        }

        window.api.onReload(callback);
        return () => {
            window.api.removeReloadListener(callback);
        };
    }, [callback]);
}
