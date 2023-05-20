/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Config } from "../type/rust/config/Config";
import type { ReceiverStatus } from "../type/rust/command/commandPacket/appCommand/receiverStatusUpdate/ReceiverStatus";
import type { ViewerStatus } from "../type/rust/command/commandPacket/appCommand/viewerStatusUpdate/ViewerStatus";
import { UserInfo } from "../type/rust/cache/userInfo/UserInfo";
import { CommandPacket } from "../type/rust/command/CommandPacket";
import { TGiftConfig } from "../type/TGiftConfig";

//region appCommand
declare class BiliBiliPackParseErrorEvent extends Event {
  message: string;

  constructor(message: string);
}

declare class ConfigUpdateEvent extends Event {
  config: Config;

  constructor(config: Config);
}

declare class GiftConfigUpdateEvent extends Event {
  giftConfig: TGiftConfig;

  constructor(giftConfig: TGiftConfig);
}

declare class ReceiverStatusUpdateEvent extends Event {
  status: ReceiverStatus;

  constructor(status: ReceiverStatus);
}

declare class UserInfoUpdateEvent extends Event {
  userInfo: UserInfo;

  constructor(userInfo: UserInfo);
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

declare class BiliBiliMessageEvent extends Event {
  message: CommandPacket;

  constructor(message: CommandPacket);
}

declare class RawBiliBiliCommandEvent extends Event {
  raw: CommandPacket;

  constructor(raw: CommandPacket);
}

//endregion

interface AppEventMap {
  bilibiliPackParseError: BiliBiliPackParseErrorEvent;
  configUpdate: ConfigUpdateEvent;
  giftConfigUpdate: GiftConfigUpdateEvent;
  receiverStatusUpdate: ReceiverStatusUpdateEvent;
  userInfoUpdate: UserInfoUpdateEvent;
  viewerStatusUpdate: ViewerStatusUpdateEvent;

  activityUpdate: ActivityUpdateEvent;
  bilibiliMessage: BiliBiliMessageEvent;
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
