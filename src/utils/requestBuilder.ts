import axios from 'axios';
import platformSettings from '../platformSettings.json';

const ERROR_STRINGS = ['Anmeldung', 'Error'];

// Create an axios instance
const requestBuilder = axios.create({
    baseURL: platformSettings.BASE_URL,
});

/**
 * Fetches the given URL with the given session ID
 * @param url path to fetch
 * @param sessionId session ID to attach to the request
 * @returns <Promise> response data
 */
export function fetchUrl(url: string, sessionId: string): Promise<any> {
    return requestBuilder.get(url, {
        headers: {
            Cookie: `PHPSESSID=${sessionId}`,
        },
    });
}

/**
 * Checks if the session token is still alive
 * @param sessionId session ID to check
 * @returns <Promise> true if the session token is alive, false otherwise
 */
export function isSessionTokenAlive(sessionId: string): Promise<boolean> {
    return requestBuilder
        .get('/ilias.php?baseClass=ilDashboardGUI&cmd=jumpToSelectedItems', {
            headers: {
                Cookie: `PHPSESSID=${sessionId}`,
            },
        })
        .then((response: any) => {
            //check if the html contains one of the following strings
            const html = response.data as string;

            return !ERROR_STRINGS.some((str) => html.includes(str));
        })
        .catch(() => false);
}
