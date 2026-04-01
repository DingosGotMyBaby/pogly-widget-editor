import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openWidgetFile: () => ipcRenderer.invoke("open-widget-file"),

  saveWidgetFile: (data: unknown, filePath: string | null, preferredDirectory: string | null, widgetName: string) =>
    ipcRenderer.invoke("save-widget-file", data, filePath, preferredDirectory, widgetName),

  saveWidgetFileAs: (data: unknown, preferredDirectory: string | null, widgetName: string) =>
    ipcRenderer.invoke("save-widget-file-as", data, preferredDirectory, widgetName),

  selectSaveDirectory: () =>
    ipcRenderer.invoke("select-save-directory"),

  updateWindowTitle: (title: string) =>
    ipcRenderer.send("update-window-title", title),

  minimizeWindow: () =>
    ipcRenderer.send("minimize-window"),

  closeWindow: () =>
    ipcRenderer.send("close-window"),

  onMenuNew: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on("menu-new", listener);
    return () => ipcRenderer.removeListener("menu-new", listener);
  },

  onMenuOpen: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on("menu-open", listener);
    return () => ipcRenderer.removeListener("menu-open", listener);
  },

  onMenuSave: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on("menu-save", listener);
    return () => ipcRenderer.removeListener("menu-save", listener);
  },

  onMenuSaveAs: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on("menu-save-as", listener);
    return () => ipcRenderer.removeListener("menu-save-as", listener);
  },
});
