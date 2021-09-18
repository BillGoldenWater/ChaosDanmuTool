import { contextBridge, ipcRenderer } from "electron";

export class ApiElectron {
  connectToServer: () => void;
}

const apiElectron: ApiElectron = {
  connectToServer: (): void => {
    ipcRenderer.sendSync("connectManager", "connect", 123456789);
  },
};

contextBridge.exposeInMainWorld("electron", apiElectron);
