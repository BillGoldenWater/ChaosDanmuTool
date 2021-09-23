import { contextBridge, ipcRenderer } from "electron";

export interface ApiElectron {
  connect: (roomid: number) => void;
  disconnect: () => void;

  loadConfig: () => void;
  saveConfig: () => void;
  getConfig: () => string;
  updateConfig: (config: string) => void;

  runKoaServer: (port: number) => void;
  closeKoaServer: () => void;
}

const apiElectron: ApiElectron = {
  connect: (roomid: number): void => {
    ipcRenderer.sendSync("connection", "connect", roomid);
  },
  disconnect: (): void => {
    ipcRenderer.sendSync("connection", "disconnect");
  },
  loadConfig: (): void => {
    ipcRenderer.sendSync("config", "load");
  },
  saveConfig: (): void => {
    ipcRenderer.sendSync("config", "save");
  },
  getConfig: (): string => {
    return ipcRenderer.sendSync("config", "get");
  },
  updateConfig: (config: string): void => {
    ipcRenderer.sendSync("config", "update", config);
  },
  runKoaServer: (port: number): void => {
    ipcRenderer.sendSync("koaServer", "run", port);
  },
  closeKoaServer: (): void => {
    ipcRenderer.sendSync("koaServer", "close");
  },
};

contextBridge.exposeInMainWorld("electron", apiElectron);
