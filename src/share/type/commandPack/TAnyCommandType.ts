/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TAppCommand } from "./appCommand/TAppCommand";
import { TAnyAppCommand } from "./appCommand/TAnyAppCommand";
import { TBiliBiliCommand } from "./bilibiliCommand/TBiliBiliCommand";
import { TAnyBiliBiliCommand } from "./bilibiliCommand/TAnyBiliBiliCommand";

export type TAnyCommandType =
  | TAppCommand<TAnyAppCommand>
  | TBiliBiliCommand<TAnyBiliBiliCommand>;
