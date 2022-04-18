/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { v4 } from "uuid";
import { TAnyCommandType } from "./TAnyCommandType";

export type TCommandPack = {
  uuid: string;
  timestamp: number;
  data: TAnyCommandType;
};

export function getCommandPack(data: TAnyCommandType): TCommandPack {
  return { uuid: v4(), timestamp: new Date().getTime(), data: data };
}
