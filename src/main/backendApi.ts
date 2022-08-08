/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { invoke } from "@tauri-apps/api";

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
}

window.backend = new BackendApi();
