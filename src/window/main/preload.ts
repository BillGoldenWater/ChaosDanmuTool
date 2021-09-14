import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  connectToServer: (): void => {
    ipcRenderer.sendSync("connectManager", "connect", 123456789);
  },
});
