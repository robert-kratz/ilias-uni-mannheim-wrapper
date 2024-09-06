import { app, BrowserWindow, shell } from "electron";
import { ipcMain } from "electron";
import path from "path";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const isDev = process.env.NODE_ENV === "development";

const PASSWORD = "password";

console.log(`Starting in ${isDev ? "development" : "production"} mode`);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    // Close the current window
    mainWindow.close();
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 1000,
    width: 1200,
    icon: "assets/ilias_logo.png",
    webPreferences: {
      nodeIntegration: false, // Keep this false for security reasons
      contextIsolation: true, // Ensures isolated context
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.focus();

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

function createLoginWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    // Close the current window
    mainWindow.close();
  }

  mainWindow = new BrowserWindow({
    width: 600,
    height: 632,
    show: false,
    frame: false,
    hasShadow: true,
    icon: "assets/ilias_logo.png",
    resizable: false,
    webPreferences: {
      nodeIntegration: false, // Keep this false for security reasons
      contextIsolation: true, // Ensures isolated context
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // Load the login page
  mainWindow.loadURL(
    "https://cas.uni-mannheim.de/cas/login?service=https%3A%2F%2Filias.uni-mannheim.de%2Filias.php%3FbaseClass%3DilDashboardGUI%26cmd%3DjumpToSelectedItems"
  );

  let attempt = 0;

  // Inject JavaScript to listen for the button click and extract credentials
  mainWindow.webContents.on("did-navigate", () => {
    attempt++;

    if (
      mainWindow.webContents.getURL() !==
      "https://ilias.uni-mannheim.de/ilias.php?baseClass=ilDashboardGUI&cmd=jumpToSelectedItems"
    ) {
      mainWindow.webContents.executeJavaScript(`
        document.getElementById('username').value = 'rkratz';
         ${
           attempt > 1
             ? ""
             : `document.getElementById('password').value = '${PASSWORD}';`
         }
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
        ${attempt > 1 ? "" : "document.querySelector('.button').click();"}
      `);
    }

    if (attempt > 1) {
      mainWindow.show();
      console.log("Login failed");
    }
  });

  // Prevent new windows from being opened (e.g., target="_blank")
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" }; // Deny the window from opening
  });

  //check outgoing network requests
  mainWindow.webContents.session.webRequest.onCompleted(
    {
      urls: [
        "https://ilias.uni-mannheim.de/ilias.php?baseClass=ilDashboardGUI&cmd=jumpToSelectedItems",
      ],
    },
    async (details) => {
      if (details.statusCode === 200) {
        //extract the cookies PHPSESSID
        const cookies: Electron.Cookie[] =
          await mainWindow.webContents.session.cookies.get({
            url: "https://ilias.uni-mannheim.de",
          });

        let PHPSESSID = cookies.find((cookie) => cookie.name === "PHPSESSID");

        console.log("PHPSESSID:", PHPSESSID);

        createWindow();
      } else {
        //show window again
        mainWindow.show();
        console.error("Error fetching login page");
      }
    }
  );
}

ipcMain.on("submit-credentials", (event, credentials) => {
  const { username, password } = credentials;
  console.log("Username:", username);
  console.log("Password:", password);

  // Use the credentials to authenticate, etc.
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createLoginWindow);
// app.on("ready", createLoginWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
