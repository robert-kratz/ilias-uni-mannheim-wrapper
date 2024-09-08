import { BrowserWindow, shell } from 'electron';
import platformSettings from '../platformSettings.json';
import { showDevTools } from '../index';

/**
 * The different behaviors for the authentication window
 * FORCE_USER_LOGIN: Forces the user to login, the presaved credentials will be ignored
 * LOGIN_SERVER_VALIDATION: Validates the presaved credentials with the server, window will not be shown
 * ATTEMP_AUTO_LOGIN: Attempts to login automatically with the presaved credentials, if it fails the window will be shown
 */
type IliasAuthenticationWindowBehavior = 'FORCE_USER_LOGIN' | 'LOGIN_SERVER_VALIDATION' | 'ATTEMP_AUTO_LOGIN';

type IliasAuthenticationWindowProps = {
    preload: string;
    presavedCredentials?: { username: string; password: string };
    behavior: IliasAuthenticationWindowBehavior;
    onAuthenticated: (success: boolean, token?: string) => Promise<void> | void;
};

/**
 * This function creates the main application window
 * @returns
 */
const createIliasAuthenticationWindow = ({
    preload,
    onAuthenticated,
    behavior,
    presavedCredentials,
}: IliasAuthenticationWindowProps): BrowserWindow => {
    const showWindowOnFirstStart =
        behavior === 'FORCE_USER_LOGIN' || (presavedCredentials.password === '' && presavedCredentials.username === '');

    let loginWindow = new BrowserWindow({
        width: 600,
        height: 632,
        show: showWindowOnFirstStart,
        frame: false,
        hasShadow: true,
        alwaysOnTop: true,
        icon: 'assets/ilias_logo.png',
        resizable: false,
        webPreferences: {
            nodeIntegration: true, // Keep this false for security reasons
            contextIsolation: true, // Ensures isolated context
            preload: preload,
        },
    });

    // Load the login page
    loginWindow.loadURL(platformSettings.LOGIN_URL);

    if (showDevTools) loginWindow.webContents.openDevTools();

    let loginAttempts = 0;

    loginWindow.webContents.on('did-navigate', async () => {
        loginAttempts++;

        const currentURL = loginWindow.webContents.getURL();

        //inject the javascript to the login page
        if (currentURL !== platformSettings.INDEX_PAGE) {
            if (behavior === 'FORCE_USER_LOGIN') {
                loginWindow.webContents.executeJavaScript(
                    inserteddLoginPageJavaScript({
                        presavedCredentials: {
                            password: '',
                            username: '',
                        },
                        clickSubmit: false,
                    })
                );
            } else if (behavior === 'ATTEMP_AUTO_LOGIN') {
                loginWindow.webContents.executeJavaScript(
                    inserteddLoginPageJavaScript({
                        presavedCredentials,
                        clickSubmit: true,
                    })
                );
            } else if (behavior === 'LOGIN_SERVER_VALIDATION') {
                loginWindow.webContents.executeJavaScript(
                    inserteddLoginPageJavaScript({
                        presavedCredentials,
                        clickSubmit: false,
                    })
                );
            }

            if (loginAttempts > 1) {
                console.log('Login failed');

                if (behavior === 'FORCE_USER_LOGIN' || behavior === 'ATTEMP_AUTO_LOGIN') {
                    console.log('Invalid credentials, please try again');
                    loginWindow.show();
                } else if (behavior === 'LOGIN_SERVER_VALIDATION') {
                    console.log('Invalid credentials, closing window');

                    await loginWindow.webContents.session.clearStorageData();

                    loginWindow.close();

                    onAuthenticated(false); //SUCCESS: FALSE
                }
            }
        }
    });

    // Prevent new windows from being opened (e.g., target="_blank")
    loginWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' }; // Deny the window from opening
    });

    //check outgoing network requests
    loginWindow.webContents.session.webRequest.onCompleted(
        {
            urls: [platformSettings.INDEX_PAGE],
        },
        async (details) => {
            if (details.statusCode === 200) {
                //WHEN THE USER HAS SUCCESSFULLY LOGGED IN

                const cookies: Electron.Cookie[] = await loginWindow.webContents.session.cookies.get({
                    url: platformSettings.BASE_URL,
                });

                let PHPSESSID = cookies.find((cookie) => cookie.name === 'PHPSESSID');

                //clear the cookies
                await loginWindow.webContents.session.clearStorageData();

                loginWindow.close();

                // // Close the login window
                try {
                    onAuthenticated(true, PHPSESSID?.value);
                } catch (error) {
                    console.error('Error authenticating: ', error);
                }
            } else {
                //show window again
                loginWindow.show();
                console.error('Error fetching login page');
            }
        }
    );

    return loginWindow;
};

type IliasLoginPageProps = {
    presavedCredentials?: { username: string; password: string };
    clickSubmit: boolean;
};

/**
 * This function creates the JavaScript to be injected into the login page, it will handle the automatic login process and the prefilling of the username and password fields
 * @param data - The data to be injected into the login page
 * @returns The JavaScript to be injected
 */
const inserteddLoginPageJavaScript = (
    { presavedCredentials, clickSubmit }: IliasLoginPageProps = { clickSubmit: false }
) => {
    return `
        //also cancle all click events on images
        document.querySelectorAll('img').forEach((img) => {
            img.addEventListener('click', (event) => {
                event.preventDefault();
            });
        });

        // Prefill the username and password fields
        ${
            presavedCredentials?.username
                ? `document.getElementById('username').value = '${presavedCredentials?.username}';`
                : ''
        }
        ${
            presavedCredentials?.password
                ? `document.getElementById('password').value = '${presavedCredentials?.password}';`
                : ''
        }

        // Listen for the button click
        document.querySelector('.button').addEventListener('click', function() {
            //check that document id username and password is not empty
            if (!document.getElementById('username').value || !document.getElementById('password').value) {
                return;
            }

            // Create a div overlay element
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.zIndex = 9999;

            // Create the "Bitte warten" text
            const loadingText = document.createElement('div');
            loadingText.innerText = 'Anmeldung wird durchgeführt...';
            loadingText.style.color = 'white';
            loadingText.style.fontSize = '18px';
            loadingText.style.fontWeight = 'bold';
            loadingText.style.fontFamily = 'sans-serif';

            // Append the text to the overlay
            overlay.appendChild(loadingText);

            // Append the overlay to the body
            document.body.appendChild(overlay);
        });
        ${clickSubmit ? '' : "document.querySelector('.button').click();"}
      `;
};

export { createIliasAuthenticationWindow };
