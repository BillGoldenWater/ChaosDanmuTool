import { clipboard, contextBridge, ipcRenderer } from "electron";

export interface ApiElectron {
  connect: (roomid: number) => void;
  disconnect: () => void;

  loadConfig: () => void;
  saveConfig: () => void;
  getConfig: () => string;
  updateConfig: (config: string) => void;

  runKoaServer: (port: number) => void;
  closeKoaServer: () => void;

  runWebsocketServer: (port: number) => void;
  closeWebsocketServer: () => void;
  websocketBroadcast: (data: string) => void;

  openViewer: () => void;
  closeViewer: () => void;

  writeClipboard: (text: string) => void;
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

  runWebsocketServer: (port: number): void => {
    ipcRenderer.sendSync("websocketServer", "run", port);
  },
  closeWebsocketServer: (): void => {
    ipcRenderer.sendSync("websocketServer", "close");
  },
  websocketBroadcast: (data: string): void => {
    ipcRenderer.sendSync("websocketServer", "broadcast", data);
  },

  openViewer: (): void => {
    ipcRenderer.sendSync("windowControl", "openViewer");
  },
  closeViewer: (): void => {
    ipcRenderer.sendSync("windowControl", "closeViewer");
  },

  writeClipboard: (text: string): void => {
    clipboard.writeText(text);
  },
};

contextBridge.exposeInMainWorld("electron", apiElectron);
