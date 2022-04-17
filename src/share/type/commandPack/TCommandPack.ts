/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TAppCommand } from "./appCommand/TAppCommand";

export type TCommandPack = {
  uuid: string;
  timestamp: number;
  data: TAppCommand; // TODO
};
