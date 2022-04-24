/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Config, DanmuViewCustomConfig } from "../../share/config/Config";

export class MainState {
  config: Config;
  customConfig?: DanmuViewCustomConfig;

  path: URL;
}
