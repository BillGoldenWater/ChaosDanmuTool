/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { invoke } from "@tauri-apps/api";
import type { Config } from "../type/rust/config/Config";
import { UserInfo } from "../type/rust/cache/userInfo/UserInfo";
import { defaultConfig } from "./AppCtx";

export const backendApiConfigCache = { config: defaultConfig };

export class BackendApi {
  isInTauri = window.__TAURI_METADATA__ != null;

  async isVibrancyApplied() {
    if (this.isInTauri) {
      return (await invoke("is_vibrancy_applied")) as boolean;
    } else {
      return false;
    }
  }

  async showViewerWindow() {
    if (this.isInTauri) {
      await invoke("show_viewer_window");
    }
  }

  async closeViewerWindow() {
    if (this.isInTauri) {
      await invoke("close_viewer_window");
    }
  }

  async isViewerWindowOpen() {
    if (this.isInTauri) {
      return (await invoke("is_viewer_window_open")) as boolean;
    }
  }

  async getConfig() {
    if (this.isInTauri) {
      return JSON.parse(await invoke("get_config")) as Config;
    } else {
      return defaultConfig;
    }
  }

  async updateConfig(config: Config) {
    if (this.isInTauri) {
      await invoke("update_config", {
        config: JSON.stringify(config),
      });
    }
  }

  async isDebug() {
    if (this.isInTauri) {
      return (await invoke("is_debug")) as boolean;
    } else {
      return false;
    }
  }

  async connectRoom() {
    if (this.isInTauri) {
      await invoke("connect_room");
    }
  }

  async disconnectRoom() {
    if (this.isInTauri) {
      await invoke("disconnect_room");
    }
  }

  async getUserInfo(uid: string): Promise<UserInfo> {
    if (this.isInTauri) {
      return await invoke("get_user_info", { uid: uid });
    } else {
      const host = window.location.hostname;
      const port = backendApiConfigCache.config.backend.httpServer.port;
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(`${xhr.status} ${xhr.statusText}`);
          }
        });
        // noinspection HttpUrlsUsage
        xhr.open("GET", `http://${host}:${port}/userInfoCache?uid=${uid}`);
        xhr.send();
      });
    }
  }
}

export const backend = new BackendApi();

// @ts-ignore
if (window.backend === undefined && (await backend.isDebug())) {
  // @ts-ignore
  window.backend = backend;
}
