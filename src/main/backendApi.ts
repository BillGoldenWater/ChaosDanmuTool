/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { invoke } from "@tauri-apps/api";
import type { Config } from "../share/type/rust/config/Config";

export class BackendApi {
  async isVibrancyApplied() {
    return (await invoke("is_vibrancy_applied")) as boolean;
  }

  async showViewerWindow() {
    await invoke("show_viewer_window");
  }

  async closeViewerWindow() {
    await invoke("close_viewer_window");
  }

  async isViewerWindowOpen() {
    return (await invoke("is_viewer_window_open")) as boolean;
  }

  async getConfig() {
    return JSON.parse(await invoke("get_config")) as Config;
  }

  async updateConfig(config: Config) {
    await invoke("update_config", {
      config: JSON.stringify(config),
    });
  }

  async isDebug() {
    return (await invoke("is_debug")) as boolean;
  }

  async connectRoom() {
    await invoke("connect_room");
  }

  async disconnectRoom() {
    await invoke("disconnect_room");
  }
}

export const backend = window.__TAURI_METADATA__ ? new BackendApi() : null;

if (backend && (await backend.isDebug())) {
  // @ts-ignore
  window.backend = backend;
}
