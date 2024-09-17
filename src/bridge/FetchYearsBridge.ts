import { ipcMain } from 'electron';
import { getSessionToken } from '../index';
import scrapeYearGroupsFromHtml from '../utils/datafetching/scraper/ScrapeIndex';
import { store } from '../utils/appStorage';

ipcMain.handle('fetch-years', async (event) => {
    const sessionId = getSessionToken();

    if (!sessionId) {
        console.log('No session id found');
        return [];
    }
    let aviablableYears: string[] = [];

    try {
        const aviablableYearsResponse = await scrapeYearGroupsFromHtml({ sessionCookie: sessionId });

        console.log('Fetched available years: ', aviablableYearsResponse);

        aviablableYears = aviablableYearsResponse.map((year) => year.year);
    } catch (error) {
        console.error('Error fetching available years: ', error);
    }

    store.set('aviablableYears', aviablableYears);

    console.log('Fetched years: ', aviablableYears);

    return aviablableYears;
});
