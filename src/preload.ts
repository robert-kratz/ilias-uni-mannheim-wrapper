const { contextBridge, ipcRenderer } = require("electron");

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
contextBridge.exposeInMainWorld("electronAPI", {
  sendCredentials: (username: string, password: string) => {
    ipcRenderer.send("submit-credentials", { username, password });
  },
});
