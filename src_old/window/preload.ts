/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { clipboard, contextBridge, ipcRenderer } from "electron";
import { v4 as uuid4 } from "uuid";
import { Config } from "../utils/config/Config";
import { MessageLog } from "../command/messagelog/MessageLog";
import { TGithubRelease } from "../type/github/TGithubRelease";
import { UpdateUtilsResult } from "../type/TUpdateUtilsResult";
import { TAnyMessage } from "../type/TAnyMessage";

export interface ApiElectron {
  getPlatform: () => string;
  getArch: () => string;
  isUnderARM64Translation: () => boolean;
  getVersion: () => string;
  getPath: (name: string) => string;

  connect: (roomid: number) => void;
  disconnect: () => void;

  loadConfig: () => void;
  saveConfig: () => void;
  getConfig: () => Config;
  updateConfig: (config: Config) => void;

  newCommandHistoryFile: () => void;
  getCommandHistory: (fileName?: string) => Promise<MessageLog<TAnyMessage>[]>;
  getCommandHistoryFiles: () => string[];
  deleteCommandHistoryFile: (fileName: string) => void;
  showCommandHistoryFolder: (fileName: string) => void;

  runKoaServer: (port: number) => void;
  closeKoaServer: () => void;

  runCommandBroadcastServer: (port: number) => void;
  closeCommandBroadcastServer: () => void;
  commandBroadcast: (data: string) => void;

  openViewer: () => void;
  closeViewer: () => void;
  setViewerIgnoreMouseEvent: (ignore: boolean) => void;

  checkUpdate: () => Promise<UpdateUtilsResult<boolean>>;
  getLatestRelease: () => Promise<UpdateUtilsResult<TGithubRelease>>;
  getChangeLog: () => Promise<UpdateUtilsResult<string>>;

  getRoomid: (roomid: number) => Promise<number>;

  writeClipboard: (str: string) => void;
}

type Callbacks = {
  [key: string]: (...args: unknown[]) => void;
};

const callbacks: Callbacks = {};

function putCallback(callback: (...args: unknown[]) => void): string {
  const id = uuid4();
  callbacks[id] = callback;
  return id;
}

const apiElectron: ApiElectron = {
  getPlatform: () => {
    return ipcRenderer.sendSync("app", "getPlatform");
  },
  getArch: () => {
    return ipcRenderer.sendSync("app", "getArch");
  },
  isUnderARM64Translation: () => {
    return ipcRenderer.sendSync("app", "isUnderARM64Translation");
  },
  getVersion: () => {
    return ipcRenderer.sendSync("app", "getVersion");
  },
  getPath: (name: string) => {
    return ipcRenderer.sendSync("app", "getPath", name);
  },

  connect: (roomid: number) => {
    ipcRenderer.sendSync("connection", "connect", roomid);
  },
  disconnect: () => {
    ipcRenderer.sendSync("connection", "disconnect");
  },

  loadConfig: () => {
    ipcRenderer.sendSync("config", "load");
  },
  saveConfig: () => {
    ipcRenderer.sendSync("config", "save");
  },
  getConfig: () => {
    return ipcRenderer.sendSync("config", "get");
  },
  updateConfig: (config: Config) => {
    ipcRenderer.sendSync("config", "update", config);
  },

  newCommandHistoryFile: () => {
    ipcRenderer.sendSync("commandHistory", "new");
  },
  getCommandHistory: (fileName?: string) => {
    return new Promise((resolve) => {
      ipcRenderer.send(
        "commandHistory",
        "getHistory",
        putCallback(resolve),
        fileName
      );
    });
  },
  getCommandHistoryFiles: () => {
    return ipcRenderer.sendSync("commandHistory", "getFiles");
  },
  deleteCommandHistoryFile: (fileName: string) => {
    ipcRenderer.sendSync("commandHistory", "deleteFile", fileName);
  },
  showCommandHistoryFolder: (fileName: string) => {
    ipcRenderer.sendSync("commandHistory", "showInFolder", fileName);
  },

  runKoaServer: (port: number) => {
    ipcRenderer.sendSync("koaServer", "run", port);
  },
  closeKoaServer: () => {
    ipcRenderer.sendSync("koaServer", "close");
  },

  runCommandBroadcastServer: (port: number) => {
    ipcRenderer.sendSync("commandBroadcastServer", "run", port);
  },
  closeCommandBroadcastServer: () => {
    ipcRenderer.sendSync("commandBroadcastServer", "close");
  },
  commandBroadcast: (data: string) => {
    ipcRenderer.sendSync("commandBroadcastServer", "broadcast", data);
  },

  openViewer: () => {
    ipcRenderer.sendSync("windowControl", "openViewer");
  },
  closeViewer: () => {
    ipcRenderer.sendSync("windowControl", "closeViewer");
  },
  setViewerIgnoreMouseEvent: (ignore: boolean) => {
    ipcRenderer.sendSync("windowControl", "setViewerIgnoreMouseEvent", ignore);
  },

  checkUpdate: () => {
    return new Promise((resolve) => {
      ipcRenderer.send("update", "checkUpdate", putCallback(resolve));
    });
  },
  getLatestRelease: () => {
    return new Promise((resolve) => {
      ipcRenderer.send("update", "getLatestRelease", putCallback(resolve));
    });
  },
  getChangeLog: () => {
    return new Promise((resolve) => {
      ipcRenderer.send("update", "getChangeLog", putCallback(resolve));
    });
  },

  getRoomid: (roomid: number) => {
    return new Promise((resolve) => {
      ipcRenderer.send("utils", "getRoomid", putCallback(resolve), roomid);
    });
  },

  writeClipboard: (str: string) => {
    clipboard.writeText(str);
  },
};

contextBridge.exposeInMainWorld("electron", apiElectron);

ipcRenderer.on("callback", (event, ...args) => {
  const callbackId = args[0];
  const callback = callbacks[callbackId];
  if (callback) {
    callback(...args.slice(1));
    delete callbacks[callbackId];
  }
});
