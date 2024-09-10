import axios from 'axios';
import platformSettings from '../../../platformSettings.json';
import { JSDOM } from 'jsdom';

/**
 * Scrapes the year groups from the HTML content using regular expressions
 * @param htmlContent The HTML content as string
 * @returns {Promise<Array>}
 */
export default async function scrapeYearGroupsFromHtml({ sessionCookie }: { sessionCookie: string }): Promise<
    Array<{
        year: string;
        courses: Array<{ title: string; link: string; date: string; type: string }>;
    }>
> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(platformSettings.INDEX_PAGE, {
                headers: {
                    Cookie: `PHPSESSID=${sessionCookie}`,
                },
            });

            const htmlContent = response.data;

            const dom = new JSDOM(htmlContent);
            const document = dom.window.document;

            let data: Array<{
                year: string;
                courses: Array<{ title: string; link: string; date: string; type: string }>;
            }> = [];

            document.querySelectorAll('.il-item-group').forEach((element) => {
                const yearHeader = element.querySelector('h3')?.textContent.trim();
                const year = yearHeader || 'Year not found';

                if (year === 'Year not found') {
                    return;
                }

                const courseElements = element.querySelectorAll('.il-std-item-container');
                const courses = Array.from(courseElements).map((course) => {
                    const titleElement: HTMLAnchorElement = course.querySelector('.il-item-title a');
                    const dateElement = course.querySelector('.il-item-property-value');
                    const iconElement = course.querySelector('img'); // Assuming the icon <img> is directly within the course element
                    const type = iconElement && iconElement.alt === 'Symbol Gruppe' ? 'Group' : 'Course';
                    return {
                        title: titleElement ? titleElement.textContent.trim() : 'Title not available',
                        link: titleElement ? titleElement.href : '#',
                        date: dateElement ? dateElement.textContent.trim() : 'No date available',
                        type: type,
                    };
                });

                data.push({ year, courses });
            });

            resolve(data);
        } catch (error) {
            console.error('Error scraping year groups:', error);
            reject(error);
        }
    });
}
