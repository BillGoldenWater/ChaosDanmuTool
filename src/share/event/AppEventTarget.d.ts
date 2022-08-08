/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { TGiftConfigMap } from "../type/bilibili/TGiftConfig";
import type { Config } from "../type/rust/config/Config";
import type { ReceiverStatus } from "../type/rust/command/commandPacket/appCommand/receiverStatusUpdate/ReceiverStatus";
import type { ViewerStatus } from "../type/rust/command/commandPacket/appCommand/viewerStatusUpdate/ViewerStatus";
import type { DanmuMessage } from "../type/rust/command/commandPacket/bilibiliCommand/DanmuMessage";

//region appCommand
declare class BiliBiliPackParseErrorEvent extends Event {
  message: string;

  constructor(data: string);
}

declare class ConfigUpdateEvent extends Event {
  config: Config;

  constructor(config: Config);
}

declare class GiftConfigUpdateEvent extends Event {
  giftConfig: TGiftConfigMap;

  constructor(giftConfig: TGiftConfigMap);
}

declare class ReceiverStatusUpdateEvent extends Event {
  status: ReceiverStatus;

  constructor(status: ReceiverStatus);
}

declare class ViewerStatusUpdateEvent extends Event {
  status: ViewerStatus;

  constructor(status: ViewerStatus);
}

//endregion

//region bilibiliCommand
declare class ActivityUpdateEvent extends Event {
  activity: number;

  constructor(activity: number);
}

declare class DanmuMessageEvent extends Event {
  message: DanmuMessage;

  constructor(message: DanmuMessage);
}

declare class RawBiliBiliCommandEvent extends Event {
  raw: unknown;

  constructor(raw: unknown);
}

//endregion

interface AppEventMap {
  bilibiliPackParseError: BiliBiliPackParseErrorEvent;
  configUpdate: ConfigUpdateEvent;
  giftConfigUpdate: GiftConfigUpdateEvent;
  receiverStatusUpdate: ReceiverStatusUpdateEvent;
  viewerStatusUpdate: ViewerStatusUpdateEvent;

  activityUpdate: ActivityUpdateEvent;
  danmuMessage: DanmuMessageEvent;
  rawBiliBiliCommand: RawBiliBiliCommandEvent;
}

declare class AppEventTarget extends EventTarget {
  addEventListener<K extends keyof AppEventMap>(
    type: K,
    listener: (event: AppEventMap[K]) => void
  ): void;

  removeEventListener<K extends keyof AppEventMap>(
    type: K,
    listener: (event: AppEventMap[K]) => void
  ): void;

  dispatchEvent<K extends keyof AppEventMap>(event: AppEventMap[K]): boolean;
}
