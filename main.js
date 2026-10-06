require("dotenv").config();

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const { connectSpotify } = require("./spotify");

function createWindow() {
  const window = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 700,
    minHeight: 500,
    backgroundColor: "#0d0d0d",
    autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  window.loadFile("index.html");
}


ipcMain.handle("spotify:connect", async () => {
  console.log("Connexion Spotify demandée");

  await connectSpotify();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});