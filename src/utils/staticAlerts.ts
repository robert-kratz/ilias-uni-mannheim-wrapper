import { StaticContentAlert } from '../types/objects';
import axios from 'axios';
import platformSettings from '../platformSettings.json';

/**
 * This function fetches the static content from the server
 * @returns Promise<StaticContentAlert[] | null>
 */
export default function getStaticContent(): Promise<StaticContentAlert[] | null> {
    return new Promise((resolve, reject) => {
        axios
            .get(platformSettings.STATIC_CONTENT_URL)
            .then((response) => {
                if (response.status === 200) {
                    //check wheather the content is valid JSON
                    try {
                        const data = response.data;

                        resolve(data.alerts as StaticContentAlert[]);
                    } catch (error) {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            })
            .catch(() => {
                resolve(null);
            });
    });
}
