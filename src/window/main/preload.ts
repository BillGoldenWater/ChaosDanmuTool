import { contextBridge, ipcRenderer } from "electron";

export interface ApiElectron {
  connect: (roomid: number) => void;
  disconnect: () => void;
}

const apiElectron: ApiElectron = {
  connect: (roomid: number): void => {
    ipcRenderer.sendSync("connection", "connect", roomid);
  },
  disconnect: (): void => {
    ipcRenderer.sendSync("connection", "disconnect");
  },
};

contextBridge.exposeInMainWorld("electron", apiElectron);
