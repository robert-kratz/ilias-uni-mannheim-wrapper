import { JSDOM } from 'jsdom';
import axios from 'axios';
import platformSettings from '../../../platformSettings.json';

type ScrapePageContentProps = {
    typeFilter?: string[];
    ref_id: string;
    sessionCookie: string;
};

type CoursePageSectionData = {
    title: string;
    link: string;
    description: string;
    assetsType: string;
    type?: string;
};

/**
 * Scrapes the content based on sections from the HTML content.
 * @returns {Promise<Array<CoursePageSectionData>>}
 */
export const scrapeContentPage = async ({
    ref_id,
    typeFilter,
    sessionCookie,
}: ScrapePageContentProps): Promise<Array<CoursePageSectionData>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(
                platformSettings.PAGE_ID_URL + ref_id.replace('c-', '').replace('d-', ''),
                {
                    headers: {
                        Cookie: `PHPSESSID=${sessionCookie}`,
                    },
                    //if isDev, cache the request
                }
            );

            console.log(
                'Scraping page:',
                platformSettings.PAGE_ID_URL + ref_id.replace('c-', '').replace('d-', ''),
                response.status
            );

            const htmlContent = response.data;

            // Parse the HTML content with JSDOM
            const dom = new JSDOM(htmlContent);
            const document = dom.window.document;

            // Prepare an array to store the results
            const data: Array<CoursePageSectionData> = [];

            const items = document.querySelectorAll('.ilCLI.ilObjListRow.row');
            items.forEach((item) => {
                const titleElement = item.querySelector('.il_ContainerItemTitle a');
                const descriptionElement = item.querySelector('.ilListItemSection.il_Description');
                const propertyElements = item.querySelectorAll('.il_ItemProperty');

                const iconElement = item.querySelector('img');
                let assetsType = iconElement?.getAttribute('title');

                // Check if the icon is a group or a course
                if (!typeFilter.includes(assetsType)) return;

                console.log('Icon:', assetsType);

                const title = titleElement ? titleElement.textContent.trim() : '';
                const link = titleElement ? titleElement.getAttribute('href') || '#' : '#';
                const description = descriptionElement ? descriptionElement.textContent.trim() : '';
                const properties = Array.from(propertyElements).map((prop) => prop.textContent.trim());

                data.push({
                    title,
                    link,
                    assetsType,
                    description: description || properties.join(' | '),
                    type: properties[0] !== undefined ? properties[0] : '',
                });
            });

            resolve(data);
        } catch (error) {
            console.error('Error scraping page content:', error);
            reject(error);
        }
    });
};

// /**
//  * Scrapes the content based on sections from the HTML content.
//  * @param htmlContent The HTML content as string.
//  * @returns {Promise<Array<CoursePageSectionData>>}
//  */
// const scrapePageContent = async ({
//     sections,
//     ref_id,
//     sessionCookie,
// }: ScrapePageContentProps): Promise<Array<CoursePageSectionData>> => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const response = await axios.get(
//                 platformSettings.PAGE_ID_URL + ref_id.replace('c-', '').replace('d-', ''),
//                 {
//                     headers: {
//                         Cookie: `PHPSESSID=${sessionCookie}`,
//                     },
//                 }
//             );

//             console.log(
//                 'Scraping page:',
//                 platformSettings.PAGE_ID_URL + ref_id.replace('c-', '').replace('d-', ''),
//                 response.status
//             );

//             const htmlContent = response.data;

//             // Parse the HTML content with JSDOM
//             const dom = new JSDOM(htmlContent);
//             const document = dom.window.document;

//             // Find all divs with the specific class
//             const blocks = document.querySelectorAll('.ilContainerBlock.container-fluid.form-inline');

//             // Prepare an array to store the results
//             const data: Array<CoursePageSectionData> = [];

//             blocks.forEach((block) => {
//                 const headerText = block.querySelector('h2')?.textContent.trim();
//                 if (!headerText || (sections && !sections.includes(headerText))) {
//                     return;
//                 }

//                 const items = block.querySelectorAll('.ilCLI.ilObjListRow.row');
//                 items.forEach((item) => {
//                     const titleElement = item.querySelector('.il_ContainerItemTitle a');
//                     const descriptionElement = item.querySelector('.ilListItemSection.il_Description');
//                     const propertyElements = item.querySelectorAll('.il_ItemProperty');

//                     const iconElement = item.querySelector('img');

//                     let allowedIconTypes = ['Datei', 'Ordner', 'Symbol Kurs', 'Symbol Gruppe'];

//                     // Check if the icon is a group or a course
//                     if (!allowedIconTypes.includes(iconElement?.getAttribute('alt'))) return;

//                     console.log('Icon:', iconElement?.getAttribute('alt'));
//                     console.log('Title:', titleElement?.textContent.trim());

//                     const title = titleElement ? titleElement.textContent.trim() : '';
//                     const link = titleElement ? titleElement.getAttribute('href') || '#' : '#';
//                     const description = descriptionElement ? descriptionElement.textContent.trim() : '';
//                     const properties = Array.from(propertyElements).map((prop) => prop.textContent.trim());

//                     data.push({
//                         title,
//                         link,
//                         description: description || properties.join(' | '),
//                         type: properties[0] !== undefined ? properties[0] : '',
//                     });
//                 });
//             });

//             resolve(data);
//         } catch (error) {
//             console.error('Error scraping page content:', error);
//             reject(error);
//         }
//     });
// };

// /**
//  * Scrapes the files from the page
//  * @param ref_id The reference id of the page
//  * @return {Promise<Array<CoursePageSectionData>>}
//  */
// export async function scrapeFilesFromPage({
//     ref_id,
//     sessionCookie,
// }: {
//     ref_id: string;
//     sessionCookie: string;
// }): Promise<Array<CoursePageSectionData>> {
//     return scrapePageContent({ ref_id, sessionCookie });
//     // return scrapePageContent({ ref_id, sessionCookie, sections: ['Dateien'] });
// }

// /**
//  * Scrapes the folders from the page
//  * @param ref_id The reference id of the page
//  * @returns {Promise<Array<CoursePageSectionData>>}
//  */
// export async function scrapeFoldersFromPage({
//     ref_id,
//     sessionCookie,
// }: {
//     ref_id: string;
//     sessionCookie: string;
// }): Promise<Array<CoursePageSectionData>> {
//     return scrapePageContent({ ref_id, sessionCookie });
//     return scrapePageContent({ ref_id, sessionCookie, sections: ['Ordner'] });
// }
