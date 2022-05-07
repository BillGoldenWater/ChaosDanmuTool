/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TAnyBiliBiliCommand } from "../../share/type/commandPack/bilibiliCommand/TAnyBiliBiliCommand";
import { Config } from "../../share/config/Config";
import { TGiftConfig } from "../../main/type/request/bilibili/giftconfig/TGiftConfig";
import { TReceiverStatus } from "../../share/type/commandPack/appCommand/command/TReceiverStatusUpdate";
import { Packet } from "../../main/network/client/danmuReceiver/Packet";

//region appCommand

declare class BiliBiliPackParseErrorEvent extends Event {
  packet: Packet;

  constructor(packet: Packet);
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
  status: TReceiverStatus;

  constructor(status: TReceiverStatus);
}

//endregion

//region bilibiliCommand

declare class BiliBiliCommandEvent extends Event {
  command: TAnyBiliBiliCommand;

  constructor(command: TAnyBiliBiliCommand);
}

declare class ActivityUpdateEvent extends Event {
  activity: number;

  constructor(activity: number);
}

//endregion

interface MainEventMap {
  bilibiliPackParseError: BiliBiliPackParseErrorEvent;
  configUpdate: ConfigUpdateEvent;
  giftConfigUpdate: GiftConfigUpdateEvent;
  receiverStatusUpdate: ReceiverStatusUpdateEvent;
  bilibiliCommand: BiliBiliCommandEvent;
  activityUpdate: ActivityUpdateEvent;
}

declare class MainEventTarget extends EventTarget {
  addEventListener<K extends keyof MainEventMap>(
    type: K,
    listener: (event: MainEventMap[K]) => void
  ): void;

  removeEventListener<K extends keyof MainEventMap>(
    type: K,
    listener: (event: MainEventMap[K]) => void
  ): void;

  dispatchEvent<K extends keyof MainEventMap>(event: MainEventMap[K]): boolean;
}
