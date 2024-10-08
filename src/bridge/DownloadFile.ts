import { dialog, ipcMain, shell } from 'electron';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import platformSettings from '../platformSettings.json';
import { getMainWindow, getSessionToken } from '../index';

ipcMain.handle('download-file', async (event, fileId: string, name: string) => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        buttonLabel: 'Download Here',
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const directoryPath = result.filePaths[0];

        const sessionToken = getSessionToken();

        if (!sessionToken) {
            return {
                success: false,
                error: 'No session token available',
            };
        }

        try {
            const response = await axios.get(platformSettings.FILE_URL + fileId, {
                headers: {
                    Cookie: 'PHPSESSID=' + getSessionToken(),
                },
                responseType: 'stream',
            });

            console.log('Downloading file:', platformSettings.FILE_URL + fileId);

            // Extract filename from Content-Disposition header or use provided name
            let filename = name || 'downloaded_file';
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition && contentDisposition.includes('filename=')) {
                filename = contentDisposition.split('filename=')[1].split(';')[0].replace(/"/g, '');
            }

            // Ensure filename is not undefined
            if (!filename) {
                filename = 'downloaded_file';
            }

            const filePath = path.join(directoryPath, filename);
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            return {
                success: true,
                directory: directoryPath,
            };
        } catch (error) {
            console.error('Download error:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    } else {
        return {
            success: false,
            error: 'No directory selected',
        };
    }
});

ipcMain.handle('open-file-explorer', async (event, path: string) => {
    shell.openPath(path).then((errorMessage) => {
        if (errorMessage) {
            console.error('Error opening path:', errorMessage);
            // Optionally, send an error back to the renderer process
            event.sender.send('open-file-explorer-error', errorMessage);
        }
    });
});

ipcMain.handle('reload-app', async () => {
    const mainWindow = getMainWindow();

    if (mainWindow) {
        mainWindow.reload();
    }
});
