import { dialog, ipcMain } from 'electron';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import platformSettings from '../platformSettings.json';
import { getSessionToken } from '../index';

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

            // Extract filename from Content-Disposition header or URL
            let filename = name;
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition && contentDisposition.includes('filename=')) {
                filename = contentDisposition.split('filename=')[1].split(';')[0].replace(/"/g, '');
            }

            const filePath = path.join(directoryPath, filename);
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            const write = await new Promise((resolve, reject) => {
                writer.on('finish', () => resolve('File downloaded successfully'));
                writer.on('error', (err) => reject(err));
            });

            return {
                success: true,
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
