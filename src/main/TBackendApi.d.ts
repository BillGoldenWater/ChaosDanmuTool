/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { BackendApi } from "./backendApi";

declare global {
  interface Window {
    backend: BackendApi;
  }
}
