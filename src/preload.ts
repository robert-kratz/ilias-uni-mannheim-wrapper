import { contextBridge, ipcRenderer } from 'electron';
import { ScrapeEvent } from './types/objects';

interface ReloadMessage {
    message: string;
    type: 'success' | 'error';
}

contextBridge.exposeInMainWorld('api', {
    sendCredentials: (username: string, password: string) => {
        ipcRenderer.invoke('submit-credentials', { username, password });
    },
    onCredentialsValidated: (callback: (event: Electron.IpcRendererEvent, data: { isValid: boolean }) => void) => {
        ipcRenderer.on('credentials-validated', callback);
    },
    removeCredentialsValidatedListener: (
        callback: (event: Electron.IpcRendererEvent, data: { isValid: boolean }) => void
    ) => {
        ipcRenderer.removeListener('credentials-validated', callback);
    },
    getStoreValue: (key: string) => ipcRenderer.invoke('getStoreValue', key),
    setStoreValue: (key: string, value: any) => ipcRenderer.invoke('setStoreValue', key, value),
    openLoginWindow: () => ipcRenderer.invoke('open-login-window'),
    onReload: (callback: (event: Electron.IpcRendererEvent, data: ReloadMessage) => void) => {
        ipcRenderer.on('page-reload', callback);
    },
    removeReloadListener: (callback: (event: Electron.IpcRendererEvent, data: ReloadMessage) => void) => {
        ipcRenderer.removeListener('page-reload', callback);
    },
    getAllCourses: () => ipcRenderer.invoke('get-all-courses'),
    getStaticContent: () => ipcRenderer.invoke('get-static-content'),
    onSearch: (query: string, year?: string) => ipcRenderer.invoke('search', query, year),
    onApplicationScrape: (callback: (event: Electron.IpcRendererEvent, data: ScrapeEvent) => void) => {
        ipcRenderer.on('application-scrape', callback);
    },
    removeApplicationScrapeListener: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => {
        ipcRenderer.removeListener('application-scrape', callback);
    },
    startScrape: (years: string[]) => ipcRenderer.invoke('start-scrape', years),
    getApplicationState: () => ipcRenderer.invoke('get-application-state'),
    getUserList: () => ipcRenderer.invoke('get-user-list'),
    resetApplication: () => ipcRenderer.invoke('reset-application'),
    setFavourite: (directoryId: string, state: boolean) => ipcRenderer.invoke('set-favourite', directoryId, state),
    downloadFile: (fileId: string) => ipcRenderer.invoke('download-file', fileId),
    openDirectory: (directoryId: string, doCache?: boolean) =>
        ipcRenderer.invoke('open-directory', directoryId, doCache),
    isDirectoryFavourite: (directoryId: string) => ipcRenderer.invoke('is-directory-favourite', directoryId),
    openFileExplorer: (path: string) => ipcRenderer.invoke('open-file-explorer', path),
    getFavorites: () => ipcRenderer.invoke('get-favorites'),
    getSystemTheme: () => ipcRenderer.invoke('get-system-theme'),
    onThemeChanged: (callback: (event: Electron.IpcRendererEvent, data: string) => void) => {
        ipcRenderer.on('theme-changed', callback);
    },
    removeThemeChangedListener: (callback: (event: Electron.IpcRendererEvent, data: string) => void) => {
        ipcRenderer.removeListener('theme-changed', callback);
    },
    getStatistics: () => ipcRenderer.invoke('get-statistics'),
    fetchYears: () => ipcRenderer.invoke('fetch-years'),
    reloadApp: () => ipcRenderer.invoke('reload-app'),
});

console.log('Preload script loaded');
