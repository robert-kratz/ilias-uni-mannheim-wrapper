import { StatsResponse } from 'src/bridge/StatsBridge';
import { ScrapeMessage, SearchDataResponseItem, StaticContentAlert, User, EntityDataResponseItem } from './objects';

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
            onReload: (callback: (event: Electron.IpcRendererEvent) => void) => void;
            removeReloadListener: (callback: (event: Electron.IpcRendererEvent) => void) => void;
            onMessage: (
                callback: (
                    event: Electron.IpcRendererEvent,
                    data: { message: string; type: 'success' | 'error' }
                ) => void
            ) => void;
            removeMessageListener: (
                callback: (
                    event: Electron.IpcRendererEvent,
                    data: { message: string; type: 'success' | 'error' }
                ) => void
            ) => void;
            onSearch: (query: string, year: string) => Promise<SearchDataResponseItem[]>;
            getStaticContent: () => Promise<StaticContentAlert[] | null>;
            getAllCourses: () => Promise<GetCoursesReturnType>;
            onApplicationScrape: (callback: (event: Electron.IpcRendererEvent, data: ScrapeMessage) => void) => void;
            removeApplicationScrapeListener: (
                callback: (event: Electron.IpcRendererEvent, data: ScrapeMessage) => void
            ) => void;
            startScrape: (years: string[]) => Promise<boolean>;
            getApplicationState: () => Promise<StoreType>;
            getUserList: () => Promise<User[]>;
            resetApplication: () => Promise<void>;
            setFavourite: (directoryId: string, state: boolean) => Promise<boolean>;
            downloadFile: (
                fileId: string,
                name: string
            ) => Promise<{ success: boolean; error?: string; directory?: string }>;
            openDirectory: (directoryId: string, doCache?: boolean) => Promise<OpenDirectoryResponse>;
            isDirectoryFavourite: (directoryId: string) => Promise<boolean>;
            openFileExplorer: (path: string) => Promise<void>;
            getFavorites: () => Promise<EntityDataResponseItem[] | null>;
            getSystemTheme: () => Promise<string>;
            onThemeChanged: (callback: (event: Electron.IpcRendererEvent, data: string) => void) => void;
            removeThemeChangedListener: (callback: (event: Electron.IpcRendererEvent, data: string) => void) => void;
            getStatistics: () => Promise<StatsResponse>;
            fetchYears: () => Promise<string[]>;
            reloadApp: () => void;
        };
    }
}
