/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  ActivityUpdateEvent,
  AppEventTarget,
  BiliBiliPackParseErrorEvent,
  ConfigUpdateEvent,
  DanmuMessageEvent,
  GiftConfigUpdateEvent,
  RawBiliBiliCommandEvent,
  ReceiverStatusUpdateEvent,
} from "../event/AppEventTarget";
import defaultConfig from "../../share/type/rust/config/defaultConfig.json";
import type { CommandPacket } from "../type/rust/command/CommandPacket";
import type { AppCommand } from "../type/rust/command/commandPacket/AppCommand";
import { parseGiftConfigResponse } from "../type/bilibili/TGiftConfig";
import type { BiliBiliCommand } from "../type/rust/command/commandPacket/BiliBiliCommand";

type Option = {
  host?: string;
  port?: number;
  maxReconnectCount?: number;
  noReconnectCodes?: number[];
  debug?: boolean;

  location: string;
  eventTarget: AppEventTarget;
};

export class CommandReceiver {
  client: WebSocket;
  option: Option = {
    host: "localhost",
    port: defaultConfig.backend.httpServer.port,
    maxReconnectCount: -1,
    noReconnectCodes: [],
    debug: false,

    location: "CommandReceiver",
    eventTarget: new AppEventTarget(),
  };

  reconnectTimeoutId: number;
  reconnectCount = 0;

  constructor(option?: Option) {
    this.updateOption(option);
  }

  updateOption(option?: Partial<Option>) {
    this.option = { ...this.option, ...option };
  }

  open() {
    this.close();
    this.client = new WebSocket(`ws://localhost:${this.option.port}`);
    this.client.onopen = () => {
      this.log("client.onopen", `ws://localhost:${this.option.port} Opened`);
      this.reconnectCount = 0;
    };
    this.client.onclose = (event) => {
      if (
        this.option.noReconnectCodes.find((value) => value == event.code) ==
        null
      ) {
        this.error(
          "client.onclose",
          `Code: ${event.code}, Reason: ${event.reason}`
        );
        this.tryReconnect();
      } else {
        this.log(
          "client.onclose",
          `Code: ${event.code}, Reason: ${event.reason}`
        );
      }
    };

    this.client.onmessage = this.onMessage.bind(this);
  }

  onMessage(event: MessageEvent) {
    const de = this.option.eventTarget.dispatchEvent;
    const commandPack: CommandPacket = JSON.parse(event.data);
    if (this.option.debug) {
      console.log(commandPack.data);
    }

    switch (commandPack.cmd) {
      case "appCommand": {
        const appCommand: AppCommand = commandPack.data;

        switch (appCommand.cmd) {
          case "biliBiliPacketParseError": {
            de(new BiliBiliPackParseErrorEvent(appCommand.data.message));
            break;
          }
          case "configUpdate": {
            de(new ConfigUpdateEvent(appCommand.data.config));
            break;
          }
          case "giftConfigUpdate": {
            de(
              new GiftConfigUpdateEvent(
                parseGiftConfigResponse(appCommand.data.giftConfigResponse)
              )
            );
            break;
          }
          case "receiverStatusUpdate": {
            de(new ReceiverStatusUpdateEvent(appCommand.data.status));
            break;
          }
        }
        break;
      }
      case "biliBiliCommand": {
        const bilibiliCommand: BiliBiliCommand = commandPack.data;

        switch (bilibiliCommand.cmd) {
          case "activityUpdate": {
            de(new ActivityUpdateEvent(bilibiliCommand.data.activity));
            break;
          }
          case "danmuMessage": {
            de(new DanmuMessageEvent(bilibiliCommand.data));
            break;
          }
          case "raw": {
            de(new RawBiliBiliCommandEvent(bilibiliCommand.data));
            break;
          }
        }
        break;
      }
    }
  }

  close(code?: number) {
    this.client?.close(code ? code : 1000);
  }

  tryReconnect() {
    window.clearTimeout(this.reconnectTimeoutId);
    if (
      this.reconnectCount >= this.option.maxReconnectCount &&
      this.option.maxReconnectCount != -1
    )
      return;

    window.setTimeout(() => {
      this.open();
      this.reconnectCount++;
    }, 1000);
  }

  log(location: string, message: string) {
    console.log(`[${this.option.location}.${location}] ${message}`);
  }

  error(location: string, message: string) {
    console.error(`[${this.option.location}.${location}] ${message}`);
  }
}
