import axios from 'axios';
import cheerio from 'cheerio';

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
/**
 * Scrapes the year groups from the HTML content
 * @param htmlContent The HTML content as string
 * @returns {Promise<Array>}
 */
const scrapeYearGroupsFromHtml = async (
    htmlContent: string
): Promise<
    Array<{
        year: string;
        courses: Array<{ title: string; link: string; date: string }>;
    }>
> => {
    return new Promise((resolve, reject) => {
        try {
            const $ = cheerio.load(htmlContent);
            let data = [] as Array<{
                year: string;
                courses: Array<{ title: string; link: string; date: string }>;
            }>;

            $('.il-item-group').each((_, element) => {
                const yearHeader = $(element).find('h3').text();
                const year = yearHeader || 'Year not found';

                if (year === 'Year not found') {
                    return;
                }

                const courses = $(element)
                    .find('.il-item-group-items .il-std-item-container')
                    .map((_, course) => {
                        const titleElement = $(course).find('.il-item-title a');
                        const dateElement = $(course).find('.il-item-property-value');

                        return {
                            title: titleElement.text() || 'Title not available',
                            link: titleElement.attr('href') || '#',
                            date: dateElement.text() || 'No date available',
                        };
                    })
                    .get();

                data.push({
                    year,
                    courses,
                });
            });

            resolve(data);
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
};
type FetchUserDataType = {
    sessionCookie: string;
};

/**
 * Fetches the user data from the page
 * @returns {Promise<string | null>}
 */
const fetchUserDataFromHtml = async ({ sessionCookie }: FetchUserDataType): Promise<string | null> => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(
                'https://ilias.uni-mannheim.de/ilias.php?baseClass=ildashboardgui&cmdNode=9l:ws&cmdClass=ilpersonalprofilegui',
                {
                    headers: {
                        Cookie: `PHPSESSID=${sessionCookie}`,
                    },
                }
            );

            const htmlContent = response.data;
            console.log(htmlContent);

            // Use a regular expression to extract the email
            const emailRegex = /<input[^>]*id="usr_email"[^>]*value="([^"]*)"/;
            const match = emailRegex.exec(htmlContent);

            const email = match && match[1] ? match[1] : null;

            resolve(email);
        } catch (error) {
            console.error('Error fetching user data:', error);
            reject(error);
        }
    });
};

/**
 * Scrapes the folder directories from the HTML content
 * @param htmlContent The HTML content as string
 * @returns {Promise<Array<{ title: string; link: string; description: string }>>}
 */
const scrapeFolderDirectoriesFromHtml = async (
    htmlContent: string
): Promise<Array<{ title: string; link: string; description: string }>> => {
    return new Promise((resolve, reject) => {
        try {
            // Load the HTML into Cheerio
            const $ = cheerio.load(htmlContent);

            // Find all divs with the specific class
            const blocks = $('.ilContainerBlock.container-fluid.form-inline');

            // Filter blocks to include only those with an h2 child that contains the text "Ordner"
            const folderBlocks = blocks.filter((_, block) => {
                return $(block).find('h2').text().trim() === 'Ordner';
            });

            // Prepare an array to store the results
            const data: Array<{ title: string; link: string; description: string }> = [];

            // Loop through each matching block
            folderBlocks.each((_, block) => {
                const items = $(block).find('.ilCLI.ilObjListRow.row');
                items.each((_, item) => {
                    const titleElement = $(item).find('.il_ContainerItemTitle a');
                    const descriptionElement = $(item).find('.ilListItemSection.il_Description');

                    // Extract title
                    const title = titleElement.text().trim() || '';

                    // Extract description
                    const description = descriptionElement.text().trim() || '';

                    // Store the extracted title, link, and description
                    data.push({
                        title: title,
                        link: titleElement.attr('href') || '#',
                        description: description,
                    });
                });
            });

            resolve(data);
        } catch (error) {
            console.error('Error scraping folder directories:', error);
            reject(error);
        }
    });
};

/**
 * Fetches the user data from the page
 * @param {*} url The URL to extract the parameter from
 * @param {*} parameter The parameter to extract
 * @returns {string}
 */
const extractParameterFromUrl = (url: string, parameter: string): string | null => {
    const urlParams = new URLSearchParams(url);
    return urlParams.get(parameter);
};

/**
 * Scrapes the course directories from the HTML content
 * @param htmlContent The HTML content as string
 * @returns {Promise<Array<{ title: string; link: string; description: string }>>}
 */
const scrapeCourseFilesFromHtml = async (
    htmlContent: string
): Promise<Array<{ title: string; link: string; description: string }>> => {
    return new Promise((resolve, reject) => {
        try {
            // Load the HTML into Cheerio
            const $ = cheerio.load(htmlContent);

            // Find all divs with the specific class
            const blocks = $('.ilContainerBlock.container-fluid.form-inline');

            // Filter blocks to include only those with an h2 child that contains the text "Dateien"
            const fileBlocks = blocks.filter((_, block) => {
                return $(block).find('h2').text().trim() === 'Dateien';
            });

            // Prepare an array to store the results
            const data: Array<{ title: string; link: string; description: string }> = [];

            // Loop through each matching block
            fileBlocks.each((_, block) => {
                const items = $(block).find('.ilCLI.ilObjListRow.row');
                items.each((_, item) => {
                    const titleElement = $(item).find('.il_ContainerItemTitle a');
                    const propertyElements = $(item).find('.il_ItemProperty');

                    // Extract title
                    const title = titleElement.text().trim() || '';

                    // Extract descriptions (properties)
                    let description = '';
                    propertyElements.each((_, prop) => {
                        description += $(prop).text().trim() + ' ';
                    });

                    // Store the extracted title and description
                    data.push({
                        title: title,
                        link: titleElement.attr('href') || '#',
                        description: description.trim(), // Trim any trailing whitespace
                    });
                });
            });

            resolve(data);
        } catch (error) {
            console.error('Error scraping course files:', error);
            reject(error);
        }
    });
};

export default {
    scrapeYearGroupsFromHtml,
    fetchUserDataFromHtml,
    scrapeFolderDirectoriesFromHtml,
    extractParameterFromUrl,
    scrapeCourseFilesFromHtml,
};

const scrapePage = async (sessionCookie: string) => {
    const responseIndex = await axios.get(
        'https://ilias.uni-mannheim.de/ilias.php?baseClass=ilDashboardGUI&cmd=jumpToSelectedItems',
        {
            headers: {
                Cookie: `PHPSESSID=${sessionCookie}`,
            },
        }
    );

    console.log(responseIndex.status);

    if (responseIndex.status !== 200) {
        console.error('Error fetching index page');
        return;
    }

    const htmlContentIndex = responseIndex.data;

    const scrapedGroups = await scrapeYearGroupsFromHtml(htmlContentIndex);

    if (!scrapedGroups) {
        console.error('Error scraping year groups');
        return;
    }

    scrapedGroups.forEach((year) => {
        console.log(year.year);
        year.courses.forEach((course) => {
            console.log(`- ${course.title} (${course.date} - ${course.link})`);
        });
    });

    const toScrapeCourse = scrapedGroups.filter((year) => year.year === 'HWS 2024');

    let scrapeJobs = [] as Array<Promise<void>>;

    toScrapeCourse.forEach((year) => {
        year.courses.forEach((course) => {
            //check if ref_id is part of the link
            const refId = extractParameterFromUrl(course.link, 'ref_id');

            if (!refId) {
                console.error('No ref_id found in link');
                return;
            }

            const courseUrl = `https://ilias.uni-mannheim.de/ilias.php?ref_id=${refId}&baseClass=ilrepositorygui`;

            scrapeJobs.push(
                new Promise(async (resolve, reject) => {
                    const responseCourse = await axios.get(courseUrl, {
                        headers: {
                            Cookie: `PHPSESSID=${sessionCookie}`,
                        },
                    });

                    if (responseCourse.status !== 200) {
                        console.error('Error fetching course page');
                        reject();
                        return;
                    }

                    const htmlContentCourse = responseCourse.data;

                    const scrapedFolders = await scrapeFolderDirectoriesFromHtml(htmlContentCourse);

                    if (!scrapedFolders) {
                        console.error('Error scraping folder directories');
                        reject();
                        return;
                    }

                    console.log(`Course: ${course.title}`);

                    scrapedFolders.forEach((folder) => {
                        console.log(`(DIR) - ${folder.title} (${folder.description} - ${folder.link})`);
                    });

                    const scrapedFiles = await scrapeCourseFilesFromHtml(htmlContentCourse);

                    if (!scrapedFiles) {
                        console.error('Error scraping course files');
                        reject();
                        return;
                    }

                    console.log(`Course: ${course.title}`);

                    scrapedFiles.forEach((file) => {
                        console.log(`(FILE) - ${file.title} (${file.description} - ${file.link})`);
                    });

                    resolve();
                })
            );
        });
    });

    //run jobs in packs of 5. This is to avoid overloading the server. also wait for all jobs to finish before starting the next pack
    const chunkSize = 5;

    for (let i = 0; i < scrapeJobs.length; i += chunkSize) {
        await Promise.all(scrapeJobs.slice(i, i + chunkSize));
    }

    console.log('All jobs finished');
};

export { fetchUserDataFromHtml };
