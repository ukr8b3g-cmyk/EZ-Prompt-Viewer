const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const fs = require("fs");

function getViewerPath() {
  const packagedPath = path.join(process.resourcesPath, "avif_prompt_viewer.html");
  if (app.isPackaged && fs.existsSync(packagedPath)) {
    return packagedPath;
  }
  return path.join(__dirname, "avif_prompt_viewer.html");
}

function getIconPath() {
  const packagedIconPath = path.join(process.resourcesPath, "assets", "icon.ico");
  if (app.isPackaged && fs.existsSync(packagedIconPath)) {
    return packagedIconPath;
  }
  return path.join(__dirname, "assets", "icon.ico");
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: "#0f1110",
    title: "EZ Prompt Viewer",
    icon: getIconPath(),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile(getViewerPath());

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
