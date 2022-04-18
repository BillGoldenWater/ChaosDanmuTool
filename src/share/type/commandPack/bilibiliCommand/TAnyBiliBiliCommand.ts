/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TActivityUpdate } from "./command/TActivityUpdate";
import { TDanmuMsg } from "./command/TDanmuMsg";
import { TParsedDanmuMsg } from "./command/TParsedDanmuMsg";
import { TLive } from "./command/TLive";
import { TPreparing } from "./command/TPreparing";
import { TSuperChatMessage } from "./command/TSuperChatMessage";
import { TCutOff } from "./command/TCutOff";
import { TWarning } from "./command/TWarning";
import { TGuardBuy } from "./command/TGuardBuy";
import { TInteractWord } from "./command/TInteractWord";
import { TRoomBlockMsg } from "./command/TRoomBlockMsg";
import { TRoomRealTimeMessageUpdate } from "./command/TRoomRealTimeMessageUpdate";
import { TSendGift } from "./command/TSendGift";
import { TWatchedChange } from "./command/TWatchedChange";

export type TAnyBiliBiliCommand =  // TODO
  | TActivityUpdate
  | TCutOff
  | TDanmuMsg
  | TGuardBuy
  | TInteractWord
  | TLive
  | TParsedDanmuMsg
  | TPreparing
  | TRoomBlockMsg
  | TRoomRealTimeMessageUpdate
  | TSendGift
  | TSuperChatMessage
  | TWarning
  | TWatchedChange;
