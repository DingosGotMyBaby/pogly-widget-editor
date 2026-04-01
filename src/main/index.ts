import { app, BrowserWindow, ipcMain, dialog, Menu } from "electron";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";

function getSuggestedFileName(widgetName: string) {
  const sanitized = widgetName
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[. ]+$/g, "");

  const baseName = sanitized.length > 0 ? sanitized : "my-widget";
  return baseName.toLowerCase().endsWith(".json") ? baseName : `${baseName}.json`;
}

function getSaveDialogPath(preferredDirectory: string | null, widgetName: string) {
  const suggestedFileName = getSuggestedFileName(widgetName);
  return preferredDirectory ? join(preferredDirectory, suggestedFileName) : suggestedFileName;
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 780,
    minHeight: 560,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false,
    autoHideMenuBar: true,
    title: "Pogly Widget Editor",
  });

  if (!app.isPackaged && process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

ipcMain.handle("open-widget-file", async () => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: "Open Widget",
    filters: [{ name: "Widget JSON", extensions: ["json"] }],
    properties: ["openFile"],
  });

  if (canceled || !filePaths[0]) return null;

  try {
    const content = readFileSync(filePaths[0], "utf-8");
    return { data: JSON.parse(content), filePath: filePaths[0] };
  } catch {
    return null;
  }
});

ipcMain.handle("select-save-directory", async () => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: "Choose Widget Save Folder",
    properties: ["openDirectory", "createDirectory"],
  });

  if (canceled || !filePaths[0]) return null;
  return filePaths[0];
});

ipcMain.handle(
  "save-widget-file",
  async (_, data: unknown, currentFilePath: string | null, preferredDirectory: string | null, widgetName: string) => {
  let targetPath = currentFilePath;

  if (!targetPath) {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: "Save Widget",
      defaultPath: getSaveDialogPath(preferredDirectory, widgetName),
      filters: [{ name: "Widget JSON", extensions: ["json"] }],
    });
    if (canceled || !filePath) return null;
    targetPath = filePath;
  }

  writeFileSync(targetPath, JSON.stringify(data, null, 2), "utf-8");
  return targetPath;
});

ipcMain.handle("save-widget-file-as", async (_, data: unknown, preferredDirectory: string | null, widgetName: string) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: "Save Widget As",
    defaultPath: getSaveDialogPath(preferredDirectory, widgetName),
    filters: [{ name: "Widget JSON", extensions: ["json"] }],
  });

  if (canceled || !filePath) return null;

  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  return filePath;
});

ipcMain.on("update-window-title", (event, title: string) => {
  BrowserWindow.fromWebContents(event.sender)?.setTitle(`${title} - Pogly Widget Editor`);
});

ipcMain.on("minimize-window", (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize();
});

ipcMain.on("close-window", (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close();
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
