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
    getAllGroups: () => ipcRenderer.invoke('get-all-groups'),
    getStaticContent: () => ipcRenderer.invoke('get-static-content'),
    onSearch: (query: string) => ipcRenderer.invoke('search', query),
    onApplicationScrape: (callback: (event: Electron.IpcRendererEvent, data: ScrapeEvent) => void) => {
        ipcRenderer.on('application-scrape', callback);
    },
    removeApplicationScrapeListener: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => {
        ipcRenderer.removeListener('application-scrape', callback);
    },
    startScrape: (years: string[]) => ipcRenderer.invoke('start-scrape', years),
});

console.log('Preload script loaded');
