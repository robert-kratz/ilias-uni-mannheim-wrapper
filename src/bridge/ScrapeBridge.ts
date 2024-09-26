import { ipcMain } from 'electron';
import { getIsCurrentlyFetching, getMainWindow, getSessionToken, setIsCurrentlyFetching } from '../index';
import { store } from '../utils/appStorage';
import { fetchUserIndexPage } from '../utils/datafetching/wrapper';
import { ScrapeEvent } from '../types/objects';
import { attempRequestToService } from '../utils/authenticationProvider';

//ONLY USE FOR FIRST TIME SETUP
ipcMain.handle('start-scrape', async (event, years) => {
    console.log('start-scrape', years);

    if (getIsCurrentlyFetching()) {
        console.log('Already fetching data');
        return false;
    }

    setIsCurrentlyFetching(true);

    try {
        //get session token from main window cookie

        const userId = store.get('userId');
        const sessionToken = getSessionToken();

        console.log('Session ID: ', sessionToken);
        console.log('User ID: ', userId);
        console.log('Years: ', years);

        const scrape = await fetchUserIndexPage({
            sessionId: sessionToken,
            userId,
            includeYears: years,
            onEvent: (event: ScrapeEvent) => {
                console.log('Scrape event: ', event);

                getMainWindow().webContents.send('application-scrape', event);
            },
        });

        getMainWindow().webContents.send('application-scrape', {
            type: 'finish',
            name: null,
            ref_id: null,
            courseId: null,
        });

        if (scrape.success) {
            console.log('Successfully fetched user index page');
            getMainWindow().webContents.send('page-message', {
                message: 'Successfully fetched user index page',
                type: 'success',
            });
        } else {
            console.error('Error fetching user index page');
            getMainWindow().webContents.send('page-message', {
                message: 'Error fetching user index page',
                type: 'error',
            });
        }

        setIsCurrentlyFetching(false);

        return scrape.success;
    } catch (error) {
        console.error('Error fetching user index page: ', error);

        setIsCurrentlyFetching(false);

        return false;
    }
});
