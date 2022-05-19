/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getDefaultConfig } from "../../config/Config";
import {
  ActivityUpdateEvent,
  BiliBiliCommandEvent,
  BiliBiliPackParseErrorEvent,
  ConfigUpdateEvent,
  GiftConfigUpdateEvent,
  MainEventTarget,
  ReceiverStatusUpdateEvent,
} from "../../../rendererShare/event/MainEventTarget";
import { TCommandPack } from "../../type/commandPack/TCommandPack";
import { TAnyAppCommand } from "../../type/commandPack/appCommand/TAnyAppCommand";
import { parseGiftConfig } from "../../type/request/bilibili/giftconfig/TGiftConfig";
import { TAnyBiliBiliCommand } from "../../type/commandPack/bilibiliCommand/TAnyBiliBiliCommand";

type Option = {
  host?: string;
  port?: number;
  maxReconnectCount?: number;
  noReconnectCodes?: number[];

  location: string;
  eventTarget: MainEventTarget;
};

export class CommandReceiver {
  client: WebSocket;
  option: Option = {
    host: "localhost",
    port: getDefaultConfig().httpServerPort,
    maxReconnectCount: -1,
    noReconnectCodes: [],

    location: "CommandReceiver",
    eventTarget: new MainEventTarget(),
  };

  reconnectTimeoutId: number;
  reconnectCount = 0;

  constructor(option?: Option) {
    this.updateOption(option);
  }

  updateOption(option?: Option) {
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

    this.client.onmessage = (event) => {
      const de = this.option.eventTarget.dispatchEvent;
      const commandPack: TCommandPack = JSON.parse(event.data);

      switch (commandPack.data.cmd) {
        case "appCommand": {
          const appCommand: TAnyAppCommand = commandPack.data.data;

          switch (appCommand.cmd) {
            case "bilibiliPackParseError": {
              de(new BiliBiliPackParseErrorEvent(appCommand.packet));
              break;
            }
            case "configUpdate": {
              de(new ConfigUpdateEvent(appCommand.config));
              break;
            }
            case "giftConfigUpdate": {
              de(new GiftConfigUpdateEvent(parseGiftConfig(appCommand.data)));
              break;
            }
            case "receiverStatusUpdate": {
              de(new ReceiverStatusUpdateEvent(appCommand.status));
              break;
            }
          }
          break;
        }
        case "bilibiliCommand": {
          const bilibiliCommand: TAnyBiliBiliCommand = commandPack.data.data;

          switch (bilibiliCommand.cmd) {
            case "activityUpdate": {
              de(new ActivityUpdateEvent(bilibiliCommand.activity));
              break;
            }
            default: {
              de(new BiliBiliCommandEvent(bilibiliCommand));
              break;
            }
          }
          break;
        }
      }
    };
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
