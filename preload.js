const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("echo", {
  connectSpotify: () => ipcRenderer.invoke("spotify:connect"),
});