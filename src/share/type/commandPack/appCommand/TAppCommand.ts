/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TBiliBiliPackParseError } from "./command/TBiliBiliPackParseError";
import { TConfigUpdate } from "./command/TConfigUpdate";
import { TGiftConfigUpdate } from "./command/TGiftConfigUpdate";
import { TReceiverStatusUpdate } from "./command/TReceiverStatusUpdate";

export type TAppCommand =
  | TBiliBiliPackParseError
  | TConfigUpdate
  | TGiftConfigUpdate
  | TReceiverStatusUpdate;
