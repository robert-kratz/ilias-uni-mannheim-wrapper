import axios from 'axios';

type FetchUserDataType = {
    sessionCookie: string;
};

/**
 * Fetches the user data from the page
 * @returns {Promise<string | null>}
 */
export default async function fetchUserDataFromHtml({ sessionCookie }: FetchUserDataType): Promise<string | null> {
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
}
