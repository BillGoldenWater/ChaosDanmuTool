/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TAppCommand } from "./appCommand/TAppCommand";
import { TAnyAppCommand } from "./appCommand/TAnyAppCommand";
import { TBiliBiliCommand } from "./bilibiliCommand/TBiliBiliCommand";
import { TAnyBiliBiliCommand } from "./bilibiliCommand/TAnyBiliBiliCommand";
import { v4 } from "uuid";

export type TCommandPack = {
  uuid: string;
  timestamp: number;
  data: TAppCommand<TAnyAppCommand> | TBiliBiliCommand<TAnyBiliBiliCommand>;
};

export function getCommandPack(
  data: TAppCommand<TAnyAppCommand> | TBiliBiliCommand<TAnyBiliBiliCommand>
): TCommandPack {
  return { uuid: v4(), timestamp: new Date().getTime(), data: data };
}
