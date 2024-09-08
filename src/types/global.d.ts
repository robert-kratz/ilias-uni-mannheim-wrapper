// in einer Datei wie global.d.ts
export {};

declare global {
    interface Window {
        api: {
            getStoreValue: (key: string) => Promise<any>;
            setStoreValue: (key: string, value: any) => Promise<void>;
            openLoginWindow: () => void;
            sendCredentials: (username: string, password: string) => void;
            onCredentialsValidated: (
                callback: (event: Electron.IpcRendererEvent, data: { isValid: boolean }) => void
            ) => void;
            removeCredentialsValidatedListener: (
                callback: (event: Electron.IpcRendererEvent, data: { isValid: boolean }) => void
            ) => void;
            onReload: (callback: (event: Electron.IpcRendererEvent, data: ReloadMessage) => void) => void;
            removeReloadListener: (callback: (event: Electron.IpcRendererEvent, data: ReloadMessage) => void) => void;
        };
    }
}
