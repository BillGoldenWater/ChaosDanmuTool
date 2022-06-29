/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Config } from "../../../../config/Config";

export type TConfigUpdate = {
  cmd: "configUpdate";
  config: Config;
};

export function getConfigUpdateCommand(config: Config): TConfigUpdate {
  return {
    cmd: "configUpdate",
    config: config,
  };
}
